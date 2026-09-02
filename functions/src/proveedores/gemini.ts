import { GoogleGenAI } from '@google/genai';
import type {
  PeticionModelo,
  ProveedorIA,
  ProveedorIncrustaciones,
} from './tipos.js';

/**
 * Proveedor Gemini.
 *
 * La clave sale de Secret Manager, nunca del código ni de un archivo del
 * repositorio (prohibición 1 de CLAUDE.md). El cliente se crea perezosamente
 * porque en el arranque frío de la Function el secreto todavía no está
 * disponible.
 */

const MODELO_GENERACION = 'gemini-2.5-flash';
const MODELO_INCRUSTACIONES = 'gemini-embedding-001';

/** 768 y no 3072: el índice se empaqueta con la Function y el tamaño importa.
 *  Con este corpus, subir la dimensión no mejora la recuperación. */
export const DIMENSIONES = 768;

let cliente: GoogleGenAI | undefined;

function obtenerCliente(): GoogleGenAI {
  if (!cliente) {
    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
      throw new Error(
        'Falta GEMINI_API_KEY. Créela en Secret Manager con ' +
          '`firebase functions:secrets:set GEMINI_API_KEY`.',
      );
    }
    cliente = new GoogleGenAI({ apiKey });
  }
  return cliente;
}

export const gemini: ProveedorIA = {
  nombre: 'gemini',
  modelo: MODELO_GENERACION,

  async generar({
    sistema,
    historial,
    mensaje,
    maximoTokens,
    temperatura,
    tiempoMaximo,
  }: PeticionModelo): Promise<string> {
    const contenidos = [
      ...historial.map((t) => ({
        role: t.rol === 'usuario' ? ('user' as const) : ('model' as const),
        parts: [{ text: t.texto }],
      })),
      { role: 'user' as const, parts: [{ text: mensaje }] },
    ];

    // El tiempo máximo se impone acá y no se delega al SDK: una llamada colgada
    // deja al visitante mirando el indicador de «escribiendo» para siempre.
    const reloj = AbortSignal.timeout(tiempoMaximo);

    const respuesta = await obtenerCliente().models.generateContent({
      model: MODELO_GENERACION,
      contents: contenidos,
      config: {
        systemInstruction: sistema,
        temperature: temperatura,
        maxOutputTokens: maximoTokens,
        abortSignal: reloj,
      },
    });

    return respuesta.text ?? '';
  },
};

export const incrustacionesGemini: ProveedorIncrustaciones = {
  modelo: MODELO_INCRUSTACIONES,
  dimensiones: DIMENSIONES,

  async incrustar(texto, proposito) {
    const respuesta = await obtenerCliente().models.embedContent({
      model: MODELO_INCRUSTACIONES,
      contents: texto,
      config: {
        outputDimensionality: DIMENSIONES,
        // Los tipos asimétricos importan: indexar un documento y consultar no
        // son la misma operación, y usar el mismo tipo para las dos degrada
        // la recuperación de forma medible.
        taskType: proposito === 'documento' ? 'RETRIEVAL_DOCUMENT' : 'RETRIEVAL_QUERY',
      },
    });

    const vector = respuesta.embeddings?.[0]?.values;
    if (!vector || vector.length === 0) {
      throw new Error('El proveedor devolvió un vector vacío.');
    }
    return vector;
  },
};
