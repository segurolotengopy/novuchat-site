/**
 * Interfaz del proveedor de inteligencia artificial.
 *
 * Existe para que cambiar de Gemini a Claude sea reemplazar una implementación,
 * no reescribir el asistente: «Gemini en demos, Claude en producción» es una
 * decisión de producto que va a cambiar, y no debe arrastrar al resto.
 *
 * El proveedor **no recibe herramientas ni acceso a datos**. Solo texto entra y
 * texto sale. Un modelo sin herramientas no puede hacer daño aunque lo
 * convenzan de intentarlo (riesgo S-2 del doc 04).
 */

export interface Turno {
  rol: 'usuario' | 'asistente';
  texto: string;
}

export interface PeticionModelo {
  sistema: string;
  historial: Turno[];
  mensaje: string;
  maximoTokens: number;
  temperatura: number;
  /** Tiempo máximo en milisegundos antes de abandonar. */
  tiempoMaximo: number;
}

export interface ProveedorIA {
  readonly nombre: string;
  readonly modelo: string;
  generar(peticion: PeticionModelo): Promise<string>;
}

/** Genera vectores para el RAG. Va aparte: el modelo que responde puede cambiar
 *  sin que cambie el que indexa, y viceversa. */
export interface ProveedorIncrustaciones {
  readonly modelo: string;
  readonly dimensiones: number;
  incrustar(texto: string, proposito: 'documento' | 'consulta'): Promise<number[]>;
}
