/**
 * Tipos del contenido del sitio.
 *
 * Cada archivo de contenido (`*.es.ts`, `*.en.ts`) implementa la misma
 * interfaz: si falta una clave en inglés, el compilador lo dice antes del
 * despliegue. Ese es todo el propósito de tipar el contenido.
 */

/**
 * Un plan comercial. Precios y volúmenes revisados el 2026-09-08.
 *
 * `precioUsd` está en dólares a propósito: desde esa revisión la tarifa se
 * denomina en dólares y se cobra en bolivianos al Tipo de Cambio Oficial del
 * Banco Central. El nombre del campo dice la moneda para que nadie imprima el
 * número con «Bs» al lado, que es el error fácil.
 */
export interface Plan {
  id: 'impulso' | 'crecimiento' | 'pro';
  nombre: string;
  precioUsd: number;
  /**
   * Conversaciones incluidas al mes. Una conversación = 24 h con un cliente,
   * con hasta 25 respuestas del asistente dentro de ella.
   */
  conversaciones: number;
  resumen: string;
  /**
   * Los dos caminos del plan. El negocio **elige uno**, no se suman: un plan no
   * trae agenda Y catálogo. Se separó de `incluye` justamente para que la
   * tarjeta no pueda volver a leerse como una suma de prestaciones, que es lo
   * que hacía creer que por USD 50 iban dos negocios en un solo número.
   */
  caminos: Camino[];
  /** Lo que va en el plan sea cual sea el camino. */
  incluye: Caracteristica[];
  destacado?: boolean;
}

/** Uno de los dos caminos entre los que se elige. */
export interface Camino {
  /** Emoji que lo identifica de un vistazo, como en la presentación. */
  icono: string;
  titulo: string;
  texto: string;
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

/** Costos de puesta en marcha, fuera de la mensualidad. En dólares. */
export interface Instalacion {
  estandar: number;
  aMedidaDesde: number;
  /** Qué entra en la instalación a medida (presentación 8, lámina 11). */
  aMedidaEjemplos: string[];
  /** Aclara que es desarrollo cotizado, no funciones de serie (prohibición 8). */
  aMedidaNota: string;
  incluye: string[];
  bonificacion?: string;
}

/** Excedente por consumo sobre lo incluido en el plan. En dólares. */
export interface Excedente {
  precioUsd: number;
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
  /**
   * Página del rubro, cuando existe. «Consultorios» no tiene una todavía, y por
   * eso es opcional: la diapositiva se muestra igual, sin enlace, en vez de
   * llevar a una página que no está.
   */
  ruta?: string;
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
  /**
   * Texto de la barra superior. `hasta` se compara con la fecha DEL BUILD, no
   * con la del visitante: la barra no desaparece del sitio publicado hasta que
   * se vuelve a desplegar después de esa fecha.
   */
  aviso: { texto: string; hasta: string } | null;
  navegacion: { texto: string; ruta: string }[];
  pie: { titulo: string; enlaces: { texto: string; ruta: string; externo?: boolean }[] }[];
  lineaLegal: string;
}
