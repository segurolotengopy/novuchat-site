import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { createHash } from 'node:crypto';
import { z } from 'zod';

import { consumirCupo, identificar, VENTANAS_LEAD } from './limites.js';
import {
  ALIAS_VALIDO,
  CAMPOS_RESERVADOS_FORMSUBMIT,
  CORREO_VALIDO,
  neutralizar,
  neutralizarEncabezado,
} from './saneo.js';

const FORMSUBMIT_ALIAS = defineSecret('FORMSUBMIT_ALIAS');
const SAL_HASH = defineSecret('SAL_HASH');

/** Dos envíos del mismo correo dentro de esta ventana son el mismo lead. */
const VENTANA_DEDUPLICACION_MS = 10 * 60 * 1000;

const RUBROS = ['salud-belleza', 'gastronomia', 'comercio', 'otro'] as const;
const PLANES = ['impulso', 'crecimiento', 'pro', ''] as const;

const esquema = z.object({
  nombre: z.string().trim().min(2).max(80),
  negocio: z.string().trim().min(2).max(120),
  correo: z.string().trim().max(160).regex(CORREO_VALIDO, 'Correo no válido'),
  // E.164: el «+» y entre 8 y 15 dígitos. Bolivia manda «+591 7…» con espacios,
  // así que se normalizan antes de validar.
  whatsapp: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s()-]/g, ''))
    .refine((v) => /^\+\d{8,15}$/.test(v), 'Número no válido'),
  rubro: z.enum(RUBROS),
  ciudad: z.string().trim().max(80).default(''),
  clientes: z.string().trim().max(40).default(''),
  interes: z.string().trim().max(60).default(''),
  plan: z.enum(PLANES).default(''),
  mensaje: z.string().trim().max(2000).default(''),
  origen: z.object({
    pagina: z.string().max(120).default('/'),
    idioma: z.enum(['es', 'en']).default('es'),
    utm: z.record(z.string().max(40), z.string().max(120)).default({}),
  }),
  // Trampa para robots: una persona nunca la completa.
  empresaWeb: z.string().max(200).default(''),
});

export type DatosLead = z.infer<typeof esquema>;

/**
 * Cuerpo del aviso por correo.
 *
 * NUNCA se vuelcan los campos del formulario tal cual en la petición
 * (riesgo S-14 del doc 04). FormSubmit interpreta como instrucciones los campos
 * que empiezan por guion bajo —`_cc`, `_replyto`, `_next`— así que un
 * `spread` del objeto recibido dejaría que quien rellena el formulario
 * redirigiera el aviso a su propia casilla. Se construye campo por campo, con
 * nombres fijos, y cada valor pasa por `neutralizar`.
 */
export function construirAviso(datos: DatosLead): Record<string, string> {
  const cuerpo: Record<string, string> = {
    _subject: neutralizarEncabezado(
      `Nuevo lead de NovuChat: ${datos.negocio}`,
      120,
    ),
    // Sin plantilla HTML del tercero: el correo llega como tabla simple.
    _template: 'table',
    _captcha: 'false',
    Nombre: neutralizar(datos.nombre, 80),
    Negocio: neutralizar(datos.negocio, 120),
    Correo: neutralizar(datos.correo, 160),
    WhatsApp: neutralizar(datos.whatsapp, 20),
    Rubro: neutralizar(datos.rubro, 20),
    Ciudad: neutralizar(datos.ciudad, 80),
    'Clientes por dia': neutralizar(datos.clientes, 40),
    'Que le interesa': neutralizar(datos.interes, 60),
    'Plan que mira': neutralizar(datos.plan, 20),
    Mensaje: neutralizar(datos.mensaje, 2000),
    'Pagina de origen': neutralizar(datos.origen.pagina, 120),
    Idioma: neutralizar(datos.origen.idioma, 4),
  };

  // Doble red: si algún día alguien agrega un campo dinámico aquí arriba, este
  // barrido impide que un nombre reservado se cuele.
  for (const reservado of CAMPOS_RESERVADOS_FORMSUBMIT) {
    if (reservado !== '_subject' && reservado !== '_template' && reservado !== '_captcha') {
      delete cuerpo[reservado];
    }
  }

  return cuerpo;
}

/**
 * Aviso por correo al equipo. **Es opcional a propósito.**
 *
 * El lead ya está guardado en Firestore cuando esto se ejecuta, así que el
 * correo es una notificación, no el dato. Si no hay proveedor configurado, el
 * lead no se pierde: queda con `avisado: false` y se puede revisar en la
 * consola de Firebase o reintentar el aviso a mano.
 *
 * Esa decisión es la que permite desplegar hoy sin tener el correo resuelto.
 * Mientras `FORMSUBMIT_ALIAS` no tenga un alias con forma válida, esta función
 * no sale a internet y lo deja anotado.
 */
async function avisarPorCorreo(alias: string, datos: DatosLead): Promise<boolean> {
  // En el emulador NO se sale a internet. Sin esto, cada prueba de humo
  // mandaría un correo de verdad a la casilla del equipo, y bastaría con dejar
  // una suite corriendo para inundarla.
  if (process.env['FUNCTIONS_EMULATOR'] === 'true') {
    logger.info('Emulador: se omite el aviso por correo.', {
      asunto: construirAviso(datos)['_subject'],
    });
    return true;
  }

  if (!ALIAS_VALIDO.test(alias)) {
    // Dos casos con el mismo tratamiento: todavía no hay proveedor de correo
    // configurado, o el alias tiene una forma peligrosa —con `/`, `?` o `#`
    // cambiaría la RUTA del punto final y mandaría los avisos a otro servicio—.
    logger.warn(
      'Sin proveedor de correo configurado o con alias inválido: el lead queda ' +
        'guardado con avisado=false y no se envía nada.',
    );
    return false;
  }

  try {
    const respuesta = await fetch(`https://formsubmit.co/ajax/${alias}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(construirAviso(datos)),
      signal: AbortSignal.timeout(10_000),
    });
    return respuesta.ok;
  } catch (error) {
    logger.error('FormSubmit falló', { error: String(error) });
    return false;
  }
}

export const lead = onCall(
  {
    region: 'us-east1',
    enforceAppCheck: false, // monitoreo la primera semana (doc 04 §4)
    secrets: [FORMSUBMIT_ALIAS, SAL_HASH],
    timeoutSeconds: 30,
    memory: '256MiB',
    maxInstances: 10,
  },
  async (peticion) => {
    const datos = esquema.safeParse(peticion.data);
    if (!datos.success) {
      throw new HttpsError('invalid-argument', 'Revisa los datos del formulario.');
    }
    const lead = datos.data;

    // — Trampa para robots —
    // Se responde éxito a propósito: decirle a un robot que lo detectamos solo
    // le enseña a evitar la trampa la próxima vez.
    if (lead.empresaWeb.trim() !== '') {
      logger.info('Lead descartado por la trampa de robots.');
      return { ok: true };
    }

    // — Límite de tasa —
    const clave = identificar(
      peticion.app?.appId,
      peticion.rawRequest.ip,
      SAL_HASH.value(),
    );
    const cupo = await consumirCupo('limites', `lead-${clave}`, VENTANAS_LEAD);
    if (!cupo.permitido) {
      throw new HttpsError(
        'resource-exhausted',
        'Recibimos varios envíos desde aquí. Escríbenos por WhatsApp y te atendemos al momento.',
      );
    }

    const db = getFirestore();
    // El correo se indexa por hash: sirve para deduplicar sin guardar una
    // segunda copia en claro de un dato personal.
    const huellaCorreo = createHash('sha256')
      .update(lead.correo.toLowerCase())
      .digest('hex');

    // — Deduplicación —
    const recientes = await db
      .collection('leads')
      .where('huellaCorreo', '==', huellaCorreo)
      .where('creado', '>=', Timestamp.fromMillis(Date.now() - VENTANA_DEDUPLICACION_MS))
      .limit(1)
      .get();

    if (!recientes.empty) {
      logger.info('Lead duplicado dentro de la ventana; no se reenvía.');
      return { ok: true };
    }

    // — Persistencia —
    // Se guarda ANTES de avisar por correo: si el tercero falla, el lead no se
    // pierde. Es la corrección concreta a lo que hacía el sitio de referencia,
    // que mostraba éxito siempre y no guardaba nada.
    // Se desestructura para dejar fuera la trampa de robots. `FieldValue.delete()`
    // NO sirve aquí: solo vale en `update()` o en `set({merge:true})`, y en un
    // `add()` lanza. Lo destapó la prueba contra el emulador.
    const { empresaWeb: _trampa, ...paraGuardar } = lead;

    const documento = await db.collection('leads').add({
      ...paraGuardar,
      huellaCorreo,
      estado: 'nuevo',
      avisado: false,
      creado: FieldValue.serverTimestamp(),
    });

    const avisado = await avisarPorCorreo(FORMSUBMIT_ALIAS.value(), lead);
    if (avisado) {
      await documento.update({ avisado: true });
    } else {
      // El lead está a salvo en la base; el aviso se puede reintentar a mano.
      logger.error('Lead guardado pero sin avisar', { id: documento.id });
    }

    return { ok: true };
  },
);
