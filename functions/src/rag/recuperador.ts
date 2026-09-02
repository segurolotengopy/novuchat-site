import type {
  Incrustador,
  Indice,
  Recuperado,
  Recuperador,
} from './tipos.js';

/**
 * Recuperador en memoria sobre el índice empaquetado con la Function.
 *
 * POR QUÉ EN MEMORIA Y NO EN FIRESTORE. Con unas decenas de fragmentos, el
 * coseno contra todos cuesta microsegundos y no agrega ni una lectura de base
 * de datos ni un salto de red por mensaje. Firestore con `findNearest` tiene
 * sentido el día que el corpus lo edite alguien sin desplegar; por eso hay una
 * interfaz `Recuperador` y no una llamada suelta.
 */

/**
 * Umbral de similitud. Por debajo de esto **no se llama al modelo**: se
 * responde que no se sabe.
 *
 * Es el parámetro que define lo «estricto» del RAG, y está calibrado con el
 * conjunto dorado de `pruebas/unidad/rag.test.ts`. Bajarlo hace que el asistente
 * conteste preguntas que no entiende; subirlo lo vuelve inútil. No lo cambie
 * sin volver a correr esas pruebas.
 */
export const UMBRAL = 0.62;

/** Coseno entre dos vectores. */
export function similitudCoseno(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let producto = 0;
  let normaA = 0;
  let normaB = 0;

  for (let i = 0; i < a.length; i += 1) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    producto += x * y;
    normaA += x * x;
    normaB += y * y;
  }

  const denominador = Math.sqrt(normaA) * Math.sqrt(normaB);
  return denominador === 0 ? 0 : producto / denominador;
}

export class RecuperadorEnMemoria implements Recuperador {
  constructor(
    private readonly indice: Indice,
    private readonly incrustador: Incrustador,
  ) {}

  async recuperar(pregunta: string, cuantos: number): Promise<Recuperado[]> {
    const vector = await this.incrustador.incrustar(pregunta, 'consulta');

    return this.indice.fragmentos
      .map((f) => ({
        id: f.id,
        texto: f.texto,
        titulo: f.titulo,
        url: f.url,
        similitud: similitudCoseno(vector, f.vector),
      }))
      .sort((a, b) => b.similitud - a.similitud)
      .slice(0, cuantos);
  }
}

/**
 * Decide si lo recuperado alcanza para responder.
 *
 * Devuelve solo los fragmentos que superan el umbral. Si el mejor no llega, la
 * lista sale vacía y quien llama **no debe invocar al modelo**.
 */
export function filtrarPorUmbral(
  recuperados: Recuperado[],
  umbral = UMBRAL,
): Recuperado[] {
  const mejor = recuperados[0];
  if (!mejor || mejor.similitud < umbral) return [];
  return recuperados.filter((r) => r.similitud >= umbral);
}
