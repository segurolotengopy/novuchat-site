import type { Turno, EjemploDeUso } from './tipos';

/** Héroe. El título rompe en dos para poder destacar la segunda mitad. */
export const heroe = {
  insignia: 'Asistentes de WhatsApp con IA para negocios de Bolivia',
  titulo: 'El primer empleado de tu negocio que',
  tituloDestacado: 'nunca duerme',
  bajada:
    'NovuChat atiende a tus clientes por WhatsApp las 24 horas: responde, agenda citas en tu calendario, toma pedidos y cobra por QR. Lo instalamos en 48 horas y tú lo controlas desde tu celular.',
  ctaPrimario: { texto: 'Pedir una demostración', ruta: '/demo' },
  ctaSecundario: { texto: 'Ver cómo funciona', ruta: '/como-funciona' },
  pruebas: [
    'Canal oficial de Meta',
    'Instalación en 48 horas',
    'Responde en menos de un minuto',
    'Tú ves todo desde la consola',
  ],
};

/** Conversación de ejemplo del héroe. Negocio ficticio (prohibición 9). */
export const conversacionHeroe: Turno[] = [
  { de: 'cliente', texto: '¿Tienen turno mañana en la tarde?' },
  {
    de: 'asistente',
    texto:
      'Sí. Mañana tengo libre a las 15:00, 16:30 y 18:00 con Carla. ¿Cuál te sirve?',
  },
  { de: 'cliente', texto: 'La de las 16:30' },
  {
    de: 'asistente',
    texto:
      'Listo. Tu corte con Carla quedó agendado mañana a las 16:30 en Salón Aurora. Te recuerdo un día antes.',
  },
];

/**
 * El problema. La cifra viene de un estudio citable: reemplaza al «68 %» del
 * prototipo, que no tenía fuente (decisión del 2026-09-02).
 */
export const problema = {
  titulo: 'El 23 % de las empresas nunca responde',
  bajada:
    'Y responder dentro de la primera hora hace siete veces más probable que la conversación termine en venta. No se pierde por precio: se pierde porque nadie contestó a tiempo. Un chatbot de botones tampoco lo arregla, porque se rompe apenas el cliente escribe distinto o cambia de opinión.',
  fuente: {
    texto:
      'Harvard Business Review, «The Short Life of Online Sales Leads» (2011), auditoría de 2.241 empresas.',
    url: 'https://hbr.org/2011/03/the-short-life-of-online-sales-leads',
  },
  tarjetas: [
    {
      titulo: 'Ventas que se van',
      texto:
        'Tus clientes escriben fuera de horario o en plena hora pico. Sin respuesta, escriben al de al lado.',
    },
    {
      titulo: 'Citas olvidadas',
      texto:
        'En salones y consultorios, la gente olvida su turno y ese hueco ya no se recupera.',
    },
    {
      titulo: 'Clientes que no vuelven',
      texto:
        'Nada les recuerda que existes. La primera compra fue buena y no hubo una segunda.',
    },
    {
      titulo: 'Equipo desgastado',
      texto:
        'Tu gente pierde horas respondiendo lo mismo por décima vez en el día.',
    },
  ],
  velocidad: [
    { quien: 'Asistente con IA', cuando: 'menos de 1 minuto, siempre' },
    { quien: 'Una persona, en horario', cuando: 'entre 15 y 60 minutos' },
    { quien: 'Una persona, fuera de horario', cuando: 'la venta se pierde' },
  ],
};

/** Qué hace NovuChat. */
export const capacidades = [
  {
    titulo: 'Atiende las 24 horas',
    texto:
      'Entiende lo que el cliente escribe, aunque escriba con errores o cambie de opinión a mitad del pedido.',
  },
  {
    titulo: 'Agenda en tu calendario real',
    texto:
      'Consulta tu Google Calendar, ofrece los horarios que de verdad están libres y crea la cita. Nunca confirma un turno que no existe.',
  },
  {
    titulo: 'Toma pedidos y cobra por QR',
    texto:
      'Variantes, notas, envío por zona, total calculado y el QR de tu banco. Valida el comprobante que manda el cliente.',
  },
  {
    titulo: 'Recuerda las citas',
    texto:
      'Manda el recordatorio 24 horas antes por una plantilla aprobada de WhatsApp. Las ausencias bajan solas.',
  },
  {
    titulo: 'Deriva a una persona',
    texto:
      'Cuando no está seguro, o cuando el cliente lo pide, pasa la conversación a tu equipo. No improvisa.',
  },
  {
    titulo: 'Consola para el dueño',
    texto:
      'Mira las conversaciones, cambia horarios y precios y controla todo desde el celular.',
  },
];

/** IA de verdad contra árboles de botones. */
export const comparativa = {
  titulo: 'IA de verdad, no un árbol de botones',
  columnas: [
    {
      titulo: 'Chatbot de botones',
      puntos: [
        'Se rompe si el cliente escribe distinto de lo previsto',
        'Obliga a elegir de un menú, aunque nada encaje',
        'No entiende «mejor sin cebolla» ni «cámbiame a las seis»',
        'El cliente termina pidiendo hablar con una persona',
      ],
    },
    {
      titulo: 'NovuChat',
      puntos: [
        'Entiende lenguaje natural y el contexto de la conversación',
        'Si el cliente cambia el pedido, adapta la orden y recalcula el total',
        'Consulta tu agenda y tu catálogo antes de responder',
        'Deriva a tu equipo solo cuando de verdad hace falta',
      ],
    },
  ],
};

/** Instalación en 48 horas. */
export const instalacion48 = {
  titulo: 'Lo instalamos en 48 horas',
  bajada: 'Tú no programas nada. Nosotros hacemos la conexión con el canal oficial de Meta.',
  pasos: [
    {
      titulo: 'Análisis',
      texto:
        'Una reunión de una hora: tus servicios, precios, horarios, funcionarios y el tono con el que quieres que hable.',
    },
    {
      titulo: 'Desarrollo',
      texto:
        'Damos de alta tu negocio, cargamos tu configuración y conectamos tu número de WhatsApp, o te damos uno.',
    },
    {
      titulo: 'Pruebas',
      texto:
        'Ensayamos los casos difíciles: agendar, rechazar, cambiar de opinión, escribir fuera de horario.',
    },
    {
      titulo: 'Despliegue',
      texto: 'Publicamos el asistente y te entregamos el acceso a tu consola.',
    },
  ],
};

/** Compromiso ético. Es innegociable y va en banda oscura. */
export const compromiso = {
  titulo: 'Nuestro compromiso',
  puntos: [
    'Nuestro asistente siempre dice que es una inteligencia artificial si le preguntan. Nunca se hace pasar por una persona.',
    'Los cobros de demostración se rotulan como simulados en la imagen, en el pie y en la confirmación.',
    'Usamos únicamente el canal oficial de WhatsApp Business de Meta. Nada de dispositivos vinculados ni APIs no oficiales que hagan que te bloqueen el número.',
  ],
};

/**
 * Ejemplos de aplicación y uso.
 *
 * NO son testimonios: nadie dijo estas frases. Son ejemplos redactados de lo
 * que un negocio podría obtener, y así se rotulan en la página (decisión de
 * Andres, 2026-09-02). Por eso no llevan nombre, ciudad ni atribución.
 */
export const ejemplosDeUso: EjemploDeUso[] = [
  {
    rubro: 'Salud y Belleza',
    frase:
      'Los turnos dejan de anotarse entre cliente y cliente: llegan ya agendados en el calendario del salón.',
    foto: { archivo: '/imagenes/pyme-belleza.webp', alt: 'Peluquería atendiendo a una clienta' },
  },
  {
    rubro: 'Gastronomía',
    frase:
      'En la noche de más movimiento no se pierden pedidos: el asistente los toma, cobra y la cocina los ve.',
    foto: { archivo: '/imagenes/pyme-gastro.webp', alt: 'Restaurante preparando pedidos para llevar' },
  },
  {
    rubro: 'Comercio y Retail',
    frase:
      'Las preguntas por talla y stock se responden a medianoche, y en la mañana la venta ya está cerrada.',
    foto: { archivo: '/imagenes/pyme-retail.webp', alt: 'Tienda de ropa atendiendo a una clienta' },
  },
  {
    rubro: 'Consultorios',
    frase:
      'Los recordatorios bajan las ausencias, y nadie del consultorio tiene que llamar por teléfono.',
    foto: { archivo: '/imagenes/pyme-salud.webp', alt: 'Consultorio odontológico atendiendo a un paciente' },
  },
];

/** Cierre. */
export const cierre = {
  titulo: '¿Lo vemos en tu negocio?',
  bajada:
    'Te mostramos el asistente funcionando con los servicios y los precios de tu propio negocio. Sin compromiso.',
};
