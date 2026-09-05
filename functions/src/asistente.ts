import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { CUENTA_EJECUCION } from './identidad.js';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { z } from 'zod';

import { consumirCupo, identificar, VENTANAS_ASISTENTE } from './limites.js';
import { vertex, incrustacionesVertex } from './proveedores/vertex.js';
import { RecuperadorEnMemoria, filtrarPorUmbral } from './rag/recuperador.js';
import { verificar } from './rag/verificacion.js';
import type { Indice, Recuperado } from './rag/tipos.js';
import {
  NO_HABLO_DE_ESO,
  NO_LO_SE,
  SUGERENCIAS,
  construirPrompt,
  contieneTerminoBloqueado,
} from './asistente-logica.js';
import indiceCrudo from './rag/indice.json' with { type: 'json' };

const SAL_HASH = defineSecret('SAL_HASH');

const indice = indiceCrudo as unknown as Indice;

/** Cuántos fragmentos se le muestran al modelo. */
const CUANTOS = 4;

const esquema = z.object({
  mensaje: z.string().min(1).max(1000),
  historial: z
    .array(
      z.object({
        rol: z.enum(['usuario', 'asistente']),
        texto: z.string().min(1).max(1000),
      }),
    )
    .max(8)
    .default([]),
  idioma: z.enum(['es', 'en']).default('es'),
  pagina: z.string().max(120).default('/'),
  sesion: z.string().min(8).max(64),
});

export const asistente = onCall(
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
    // Fase 1: monitoreo. Se pasa a `true` tras una semana sin falsos positivos
    // (doc 04 §4). La presencia del token se registra abajo, que es lo que da
    // la evidencia para esa decisión.
    enforceAppCheck: false,
    secrets: [SAL_HASH],
    timeoutSeconds: 30,
    memory: '512MiB',
    maxInstances: 10,
  },
  async (peticion) => {
    const datos = esquema.safeParse(peticion.data);
    if (!datos.success) {
      throw new HttpsError('invalid-argument', 'Mensaje no válido.');
    }
    const { mensaje, historial, idioma, pagina, sesion } = datos.data;

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
    const cupo = await consumirCupo('limites', `asistente-${clave}`, VENTANAS_ASISTENTE);
    if (!cupo.permitido) {
      throw new HttpsError(
        'resource-exhausted',
        'Por hoy alcanzamos el límite de este chat. Déjanos tus datos en el ' +
          'formulario de demostración y te escribimos por WhatsApp.',
      );
    }

    const registrar = async (
      respuesta: string,
      motivo: string,
      recuperados: Recuperado[],
      milisegundos: number,
    ): Promise<void> => {
      try {
        // Fuente de inteligencia comercial: qué pregunta la gente y qué no
        // supimos contestar. Sin IP ni datos personales en claro (riesgo S-11).
        await getFirestore()
          .collection('conversacionesAsistente')
          .doc(sesion)
          .collection('turnos')
          .add({
            mensaje,
            respuesta,
            motivo,
            idioma,
            pagina,
            fragmentos: recuperados.map((r) => ({ id: r.id, similitud: r.similitud })),
            milisegundos,
            creado: FieldValue.serverTimestamp(),
            expira: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
          });
      } catch (error) {
        // Que falle el registro no puede tumbar la respuesta al visitante.
        logger.warn('No se pudo registrar el turno', { error: String(error) });
      }
    };

    const arranque = Date.now();

    // — Filtro de términos —
    if (contieneTerminoBloqueado(mensaje)) {
      await registrar(NO_HABLO_DE_ESO, 'termino-bloqueado', [], Date.now() - arranque);
      return { respuesta: NO_HABLO_DE_ESO, sugerencias: SUGERENCIAS };
    }

    // — Recuperación —
    const recuperador = new RecuperadorEnMemoria(indice, incrustacionesVertex);
    const recuperados = await recuperador.recuperar(mensaje, CUANTOS);
    const utiles = filtrarPorUmbral(recuperados);

    // Lo estricto del RAG: sin material suficiente NO se llama al modelo. Se
    // ahorra el costo y se elimina de raíz la posibilidad de alucinar.
    if (utiles.length === 0) {
      await registrar(NO_LO_SE, 'bajo-umbral', recuperados, Date.now() - arranque);
      return { respuesta: NO_LO_SE, sugerencias: SUGERENCIAS };
    }

    // — Generación —
    let bruta: string;
    try {
      bruta = await vertex.generar({
        sistema: construirPrompt(utiles, idioma),
        historial: historial.map((t) => ({ rol: t.rol, texto: t.texto })),
        mensaje,
        maximoTokens: 400,
        temperatura: 0.2,
        tiempoMaximo: 12_000,
      });
    } catch (error) {
      logger.error('El proveedor falló', { error: String(error) });
      await registrar(NO_LO_SE, 'proveedor-fallo', utiles, Date.now() - arranque);
      return { respuesta: NO_LO_SE, sugerencias: SUGERENCIAS };
    }

    // — Verificación —
    const veredicto = verificar(bruta, utiles);
    if (!veredicto.aceptada) {
      logger.warn('Respuesta descartada', {
        motivo: veredicto.motivo,
        detalle: veredicto.detalle,
      });
      await registrar(NO_LO_SE, `descartada-${veredicto.motivo}`, utiles, Date.now() - arranque);
      return { respuesta: NO_LO_SE, sugerencias: SUGERENCIAS };
    }

    await registrar(veredicto.texto, 'ok', utiles, Date.now() - arranque);
    return { respuesta: veredicto.texto, sugerencias: SUGERENCIAS };
  },
);
