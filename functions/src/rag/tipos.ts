/**
 * Tipos del RAG estricto.
 *
 * «Estricto» quiere decir que el asistente **solo puede responder con lo que se
 * recuperó del corpus**. Si nada del corpus se parece lo suficiente a la
 * pregunta, no se llama al modelo: se responde que eso no se sabe y se deriva
 * al formulario. Esa es la diferencia con inyectar toda la base de conocimiento
 * en el prompt, que era lo que proponía el doc 03 §5.1.
 */

/** Un fragmento del corpus. Se deriva del contenido del sitio, nunca a mano. */
export interface Fragmento {
  id: string;
  /** El texto que se le muestra al modelo. */
  texto: string;
  /** Título legible, para las trazas. */
  titulo: string;
  /** Página del sitio de la que salió, para poder enlazarla. */
  url: string;
}

/** Un fragmento con su vector. Es lo que vive en `indice.json`. */
export interface FragmentoIndexado extends Fragmento {
  vector: number[];
}

export interface Indice {
  /** Modelo con el que se generaron los vectores. */
  modelo: string;
  dimensiones: number;
  /** Fecha ISO de generación, para detectar un índice viejo. */
  generado: string;
  /** Hash del contenido del corpus: si cambia el sitio y no se reindexa, se nota. */
  huella: string;
  fragmentos: FragmentoIndexado[];
}

export interface Recuperado extends Fragmento {
  similitud: number;
}

/**
 * Interfaz del recuperador. Hoy la implementa una búsqueda en memoria sobre
 * `indice.json`; el día que el corpus se edite desde la consola sin desplegar,
 * se cambia por una que consulte `findNearest` de Firestore sin tocar nada más.
 */
export interface Recuperador {
  recuperar(pregunta: string, cuantos: number): Promise<Recuperado[]>;
}

/** Genera el vector de un texto. Se simula en las pruebas. */
export interface Incrustador {
  incrustar(texto: string, proposito: 'documento' | 'consulta'): Promise<number[]>;
}
