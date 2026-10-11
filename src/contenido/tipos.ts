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
   * Tope de conversaciones al mes ("hasta"). Una conversación = un bloque de
   * hasta 25 respuestas del asistente a un cliente dentro de 24 h; la respuesta
   * 26 en el mismo día abre otra, y a las 24 h la cuenta vuelve a cero.
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

/** Bolsa de conversaciones adicionales. No vence. En dólares. */
export interface Bolsa {
  conversaciones: number;
  precioUsd: number;
}

/**
 * Bolsa de mensajes de seguimiento: los que el negocio ENVÍA más de 48 horas
 * después del último mensaje de su cliente. En dólares. Solo con la cuenta
 * propia del cliente. `proximamente: true` mientras la plataforma no la venda
 * ni cuente esos mensajes (prohibición 8 de CLAUDE.md).
 *
 * FUENTE ÚNICA: las reglas de las 48 horas viven SOLO en `reglas`, y la
 * disponibilidad SOLO en `proximamente`. La tarjeta, la FAQ, `/terminos`, el
 * glosario y el corpus las interpolan; ninguno las reescribe. Quitar el rótulo
 * es poner `proximamente: false` y reindexar.
 */
export interface BolsaSeguimiento {
  titulo: string;
  mensajes: number;
  precioUsd: number;
  proximamente: boolean;
  /**
   * Qué cubre y sus condiciones (solo con la cuenta propia; Meta cobra cada
   * mensaje aparte como plantilla de marketing, sin cifras de Meta). No lleva
   * las reglas de las 48 horas ni el aviso de disponibilidad.
   */
  descripcion: string;
  /** Las dos reglas de las 48 horas, literales, cada una una oración completa. */
  reglas: string[];
  /** Aviso de disponibilidad. Se muestra SOLO mientras `proximamente` sea true. */
  avisoProximamente: string;
}

/**
 * Modalidad excepcional: conversaciones de WhatsApp incluidas y número nuevo
 * conseguido por NovuChat. NO se publicita: va colapsada al final de /precios,
 * nunca en la portada ni en las tarjetas. Mismos precios que `planes`, otro volumen.
 */
export interface ModalidadExcepcional {
  /** Texto del <summary>. */
  titulo: string;
  paraQuien: string;
  /** Tope mensual por plan en esta modalidad. Record: no puede faltar un plan. */
  conversaciones: Record<Plan['id'], number>;
  diferencias: string[];
  instalacionUsd: number;
  bolsa: Bolsa;
  nota: string;
}

export interface Precios {
  /** Bajada de /precios. */
  bajada: string;
  planes: Plan[];
  /** Línea junto a CADA precio: la mensajería no la cobra NovuChat. */
  notaMeta: string;
  /** Pie oficial de la oferta (decisión de Andres, 2026-10-06). */
  pie: string;
  /**
   * ÚNICA frase del sitio sobre lo que cobra Meta, salvo una excepción: la
   * descripción de la bolsa de seguimiento dice que Meta cobra cada mensaje como
   * plantilla de marketing, sin cifras. Ningún otro monto de Meta.
   */
  mensajeriaMeta: string;
  quePagas: { titulo: string; items: { aQuien: string; que: string }[] };
  queNecesitamos: { titulo: string; items: string[] };
  instalacion: Instalacion;
  bolsas: Bolsa[];
  /** «300 conversaciones por USD 15», derivado de `bolsas` (con varias: «A por X, B por Y o C por Z»). */
  bolsasResumen: string;
  bolsasTexto: { titulo: string; texto: string };
  bolsaSeguimiento: BolsaSeguimiento;
  excepcional: ModalidadExcepcional;
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
  /** WhatsApp de una PERSONA (ventas y soporte humano). Va donde se promete atención humana. */
  whatsapp: string;
  /** El mismo número en formato E.164 sin signos, para los enlaces wa.me. */
  whatsappEnlace: string;
  /** WhatsApp del asistente de IA de NovuChat. Nunca donde se promete una persona (prohibición 7). */
  whatsappAsistente: string;
  /** El número del asistente en formato E.164 sin signos, para los enlaces wa.me. */
  whatsappAsistenteEnlace: string;
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
