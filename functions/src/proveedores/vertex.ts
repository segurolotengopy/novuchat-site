import { GoogleAuth } from 'google-auth-library';
import type {
  PeticionModelo,
  ProveedorIA,
  ProveedorIncrustaciones,
} from './tipos.js';

/**
 * Proveedor Vertex AI.
 *
 * POR QUÉ VERTEX Y NO LA API DE AI STUDIO. La API de AI Studio se paga con
 * **créditos de prepago** que hay que recargar aparte y que se agotan sin
 * avisar —nos pasó al generar el índice—. Vertex AI cobra a la cuenta de
 * facturación del proyecto, que ya tiene presupuesto y alertas al 50, 90 y
 * 100 %.
 *
 * Y hay una segunda razón, que pesa más: **no necesita clave de API**. Se
 * autentica con la cuenta de servicio de la Function. Un secreto que no existe
 * no se filtra, no se rota y no aparece por accidente en la terminal de nadie.
 *
 * Requisito de despliegue: la cuenta de servicio de la Function necesita el rol
 * `roles/aiplatform.user` en el proyecto.
 */

const PROYECTO = process.env['GCLOUD_PROJECT'] ?? 'novuchat-site';
const REGION = 'us-east1';
const MODELO_GENERACION = 'gemini-2.5-flash';
const MODELO_INCRUSTACIONES = 'gemini-embedding-001';

/** 768 y no 3072: el índice viaja empaquetado con la Function y el tamaño
 *  importa. Con este corpus, subir la dimensión no mejora la recuperación. */
export const DIMENSIONES = 768;

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

function url(modelo: string, metodo: string): string {
  return (
    `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROYECTO}` +
    `/locations/${REGION}/publishers/google/models/${modelo}:${metodo}`
  );
}

async function llamar(
  direccion: string,
  cuerpo: unknown,
  tiempoMaximo: number,
): Promise<unknown> {
  // El token lo cachea la propia librería; no se pide uno por petición.
  const token = await auth.getAccessToken();

  const respuesta = await fetch(direccion, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(tiempoMaximo),
  });

  if (!respuesta.ok) {
    const texto = await respuesta.text();
    throw new Error(`Vertex AI respondió ${respuesta.status}: ${texto.slice(0, 300)}`);
  }

  return respuesta.json();
}

export const vertex: ProveedorIA = {
  nombre: 'vertex',
  modelo: MODELO_GENERACION,

  async generar({
    sistema,
    historial,
    mensaje,
    maximoTokens,
    temperatura,
    tiempoMaximo,
  }: PeticionModelo): Promise<string> {
    const datos = (await llamar(
      url(MODELO_GENERACION, 'generateContent'),
      {
        contents: [
          ...historial.map((t) => ({
            role: t.rol === 'usuario' ? 'user' : 'model',
            parts: [{ text: t.texto }],
          })),
          { role: 'user', parts: [{ text: mensaje }] },
        ],
        systemInstruction: { parts: [{ text: sistema }] },
        generationConfig: { temperature: temperatura, maxOutputTokens: maximoTokens },
      },
      tiempoMaximo,
    )) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    return (
      datos.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
    );
  },
};

export const incrustacionesVertex: ProveedorIncrustaciones = {
  modelo: MODELO_INCRUSTACIONES,
  dimensiones: DIMENSIONES,

  async incrustar(texto, proposito) {
    const datos = (await llamar(
      url(MODELO_INCRUSTACIONES, 'predict'),
      {
        instances: [
          {
            // Los tipos asimétricos importan: indexar un documento y consultar
            // no son la misma operación, y usar el mismo tipo para las dos
            // degrada la recuperación de forma medible.
            task_type: proposito === 'documento' ? 'RETRIEVAL_DOCUMENT' : 'RETRIEVAL_QUERY',
            content: texto,
          },
        ],
        parameters: { outputDimensionality: DIMENSIONES },
      },
      10_000,
    )) as { predictions?: { embeddings?: { values?: number[] } }[] };

    const vector = datos.predictions?.[0]?.embeddings?.values;
    if (!vector?.length) {
      throw new Error('Vertex AI devolvió un vector vacío.');
    }
    return vector;
  },
};
