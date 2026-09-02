/**
 * Tipos del contenido del sitio.
 *
 * Cada archivo de contenido (`*.es.ts`, `*.en.ts`) implementa la misma
 * interfaz: si falta una clave en inglés, el compilador lo dice antes del
 * despliegue. Ese es todo el propósito de tipar el contenido.
 */

/** Un plan comercial. Los precios son los confirmados el 2026-09-02. */
export interface Plan {
  id: 'impulso' | 'crecimiento' | 'pro';
  nombre: string;
  precioBs: number;
  /** Conversaciones incluidas al mes. Una conversación = 24 h con un cliente. */
  conversaciones: number;
  resumen: string;
  incluye: Caracteristica[];
  destacado?: boolean;
}

/**
 * Una prestación de un plan. `proximamente` rotula lo que la plataforma
 * todavía no hace: la prohibición 8 de CLAUDE.md no permite publicarlo como
 * disponible.
 */
export interface Caracteristica {
  texto: string;
  proximamente?: boolean;
}

/** Costos de puesta en marcha, fuera de la mensualidad. */
export interface Instalacion {
  estandar: number;
  aMedidaDesde: number;
  incluye: string[];
  bonificacion?: string;
}

/** Excedente por consumo sobre lo incluido en el plan. */
export interface Excedente {
  precioBs: number;
  conversaciones: number;
}

export interface Precios {
  planes: Plan[];
  instalacion: Instalacion;
  excedente: Excedente;
  /** Definición de la unidad de cobro. Va en nota al pie y en el modal. */
  comoContamos: {
    titulo: string;
    parrafos: string[];
    glosario: { termino: string; definicion: string }[];
  };
}

export interface Vertical {
  id: 'salud-belleza' | 'gastronomia' | 'comercio';
  nombre: string;
  titulo: string;
  bajada: string;
  /** Nombre del negocio ficticio usado en los ejemplos. */
  negocioEjemplo: string;
  casos: { titulo: string; texto: string }[];
  conversacion: Turno[];
  planRecomendado: Plan['id'];
  foto: { archivo: string; alt: string };
}

/** Un turno de una conversación de ejemplo. Siempre con datos ficticios. */
export interface Turno {
  de: 'cliente' | 'asistente';
  texto: string;
  /** Muestra el QR rotulado como demostración debajo del mensaje. */
  qrDemostracion?: boolean;
}

export interface Pregunta {
  pregunta: string;
  respuesta: string;
}

/** Ejemplo ilustrativo de uso. NO es un testimonio: nadie lo dijo. */
export interface EjemploDeUso {
  rubro: string;
  frase: string;
  foto: { archivo: string; alt: string };
}

export interface Contacto {
  correo: string;
  whatsapp: string;
  /** El mismo número en formato E.164 sin signos, para los enlaces wa.me. */
  whatsappEnlace: string;
  ciudad: string;
  pais: string;
}

export interface Sitio {
  nombre: string;
  lema: string;
  contacto: Contacto;
  /** Texto de la barra superior. `hasta` la retira sola, sin desplegar. */
  aviso: { texto: string; hasta: string } | null;
  navegacion: { texto: string; ruta: string }[];
  pie: { titulo: string; enlaces: { texto: string; ruta: string; externo?: boolean }[] }[];
  lineaLegal: string;
}
