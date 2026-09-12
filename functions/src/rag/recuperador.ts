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
 * MEDIDO, no elegido a ojo. `pnpm rag:calibrar` corre 28 preguntas escritas
 * como las escribe un visitante y 10 preguntas ajenas al negocio, contra el
 * índice real. Última medición (2026-09-12, 40 fragmentos):
 *
 *   preguntas DEL corpus  : min 0,657 · media 0,746 · max 0,823
 *   preguntas AJENAS      : min 0,505 · media 0,606 · max 0,689
 *   recuperación          : 96 % entre los cuatro primeros, 82 % en el primero
 *
 * Los grupos SE SOLAPAN desde que el corpus creció (con 34 fragmentos no se
 * solapaban y el umbral era 0,64): la mejor pregunta ajena (0,689) supera a
 * la peor del corpus (0,657). Ningún umbral acierta en los dos lados, así que
 * se prioriza no inventar: 0,70 deja fuera a TODAS las ajenas, a costa de
 * algún «no lo sé» de más en preguntas legítimas redactadas de forma lejana.
 * Decisión de Andres, 2026-09-12. Un «no lo sé» deriva a una persona; una
 * respuesta inventada sobre precios no se deshace.
 *
 * **Hay que volver a calibrar cuando cambie el contenido del sitio**, porque
 * cambian los fragmentos y con ellos las distancias.
 */
export const UMBRAL = 0.7;

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
 * Piso del CONTEXTO: qué fragmentos ve el modelo una vez que se decidió
 * responder. Es el umbral anterior a 2026-09-12.
 *
 * Son dos preguntas distintas y antes las contestaba un solo número: «¿hay
 * material para responder?» (UMBRAL, lo decide el mejor fragmento) y «¿qué
 * material de apoyo le muestro?» (este piso). Al subir el umbral a 0,70 sin
 * separarlas, el modelo dejó de ver fragmentos de 0,64–0,70 que sostenían la
 * respuesta; escribía un dato que estaba ahí («24 horas») y el verificador lo
 * descartaba como inventado. Subir el umbral no puede encoger el contexto.
 */
export const PISO_CONTEXTO = 0.64;

/**
 * Decide si lo recuperado alcanza para responder.
 *
 * Si el mejor no llega al umbral, la lista sale vacía y quien llama **no debe
 * invocar al modelo**. Si llega, devuelve los que superan el piso de contexto
 * (nunca un piso más alto que el propio umbral).
 */
export function filtrarPorUmbral(
  recuperados: Recuperado[],
  umbral = UMBRAL,
  piso = PISO_CONTEXTO,
): Recuperado[] {
  const mejor = recuperados[0];
  if (!mejor || mejor.similitud < umbral) return [];
  const corte = Math.min(piso, umbral);
  return recuperados.filter((r) => r.similitud >= corte);
}
