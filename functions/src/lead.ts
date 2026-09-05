import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { CUENTA_EJECUCION } from './identidad.js';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { createHash } from 'node:crypto';
import { z } from 'zod';

import { consumirCupo, identificar, VENTANAS_LEAD } from './limites.js';
import { ALIAS_VALIDO, CORREO_VALIDO } from './saneo.js';
import { CABECERAS_FORMSUBMIT, construirAviso, type DatosLead } from './lead-logica.js';

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

// El esquema de zod y la interfaz de `lead-logica.ts` describen lo mismo; esta
// línea falla la compilación si se separan.
type Comprobacion = z.infer<typeof esquema> extends DatosLead ? true : never;
const _formaCompatible: Comprobacion = true;
void _formaCompatible;

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
      headers: CABECERAS_FORMSUBMIT,
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
    // Identidad de ejecución con permisos mínimos, en vez de la cuenta de
    // cómputo por defecto, que lleva `roles/editor`. Ver identidad.ts.
    serviceAccount: CUENTA_EJECUCION,
    // Orígenes permitidos. Sin esto, `onCall` refleja CUALQUIER origen: en
    // producción devolvía `access-control-allow-origin` con el dominio del que
    // preguntara, así que cualquier web podía llamar a esta función desde el
    // navegador de un visitante —gastando presupuesto de Vertex en el caso del
    // asistente, o metiendo leads en Firestore en el caso del formulario—.
    // App Check todavía está en monitoreo, así que no compensaba nada.
    // Sin `novuchat-site.web.app`: el dominio por defecto de Firebase sirve el
    // sitio entero y no se puede desactivar, así que el `<head>` redirige al
    // dominio propio. Dejarlo aquí permitiría llamar a la Function desde una
    // copia del sitio que nadie debería estar usando.
    cors: ['https://novuchat.site', 'https://www.novuchat.site'],
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

    // — Evidencia para decidir sobre App Check —
    // `enforceAppCheck: false` es la fase de monitoreo, pero monitorear exige
    // registrar algo: sin esto, al cumplirse la semana no habría dato con el
    // que decidir y pasar a `true` sería una apuesta. Se anota solo si la
    // petición traía token, nada del visitante.
    //
    //   gcloud logging read 'jsonPayload.message="App Check"' --project novuchat-site
    //
    // Si la proporción sin token es ~0, activar la exigencia no rompe a nadie.
    logger.info('App Check', { conToken: peticion.app !== undefined });

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
