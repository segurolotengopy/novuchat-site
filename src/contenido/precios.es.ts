import type { Bolsa, Instalacion, Precios } from './tipos';

// Presentación 8 (Silvana, 2026-09-11): terminó la Rueda de Negocios y la
// instalación deja de estar bonificada. Se paga por adelantado, al inicio
// del servicio, y se entrega «llave en mano».
const instalacion: Instalacion = {
  estandar: 65,
  aMedidaDesde: 125,
  aMedidaEjemplos: [
    'Integración con tu ERP o tu sistema propio',
    'Consultas a tus sistemas en tiempo real',
    'Flujos complejos entre varios departamentos',
  ],
  aMedidaNota:
    'Es desarrollo a medida, cotizado caso por caso: no son funciones que el asistente traiga de serie.',
  incluye: [
    'Configuración inicial llave en mano: recibes el asistente listo para atender',
    'Nadie de NovuChat lee tus conversaciones sin que tú abras el acceso',
    'Conectamos tu número al canal oficial de WhatsApp Business de Meta; la cuenta queda a tu nombre',
    'Carga de tus servicios, precios, horarios y el tono del asistente',
    'Conexión con tu Google Calendar',
    'Pruebas con casos reales antes de salir en vivo',
  ],
};

const bolsas: Bolsa[] = [
  { conversaciones: 50, precioUsd: 10 },
  { conversaciones: 100, precioUsd: 20 },
  { conversaciones: 300, precioUsd: 40 },
];

const bolsasResumen = bolsas
  .map((b, i) => `${b.conversaciones}${i === 0 ? ' conversaciones' : ''} por USD ${b.precioUsd}`)
  .join(', ')
  .replace(/, ([^,]+)$/, ' o $1');

// Variante sin gratuidades ni cifras (decisión de Andres 2026-10-06, ver ESTADO hallazgo 61). PENDIENTE
// `frase-mensajeria-meta`: las fuentes sobre la tarifa de Meta discrepan y
// Andres elige. Es la ÚNICA frase del sitio sobre lo que cobra Meta.
const mensajeriaMeta =
  'Meta cobra la mensajería por mensaje, según su tarifa vigente. El monto depende de cuántos mensajes se envían y de qué tipo son; puedes consultar la tarifa actual en el sitio de Meta.';

/**
 * Oferta con la cuenta propia de WhatsApp Business del cliente (decisión de
 * Andres, 2026-10-06): Impulso 25 / hasta 200, Crecimiento 50 / hasta 500, Pro
 * 90 / hasta 1.000. La mensajería la paga el cliente directamente a Meta.
 *
 * **Los importes están en dólares** y se cobran en bolivianos al Tipo de Cambio
 * Oficial del Banco Central de Bolivia (primer día hábil del mes facturado).
 * Por eso el campo se llama `precioUsd`: imprimirlo con «Bs» al lado sería un
 * error de un orden de magnitud.
 *
 * Nombres: Impulso / Crecimiento / Pro (decisión de Andres, 2026-09-02).
 * Los precios de esta tabla alimentan también el JSON-LD `SoftwareApplication`.
 * Ojo: `precios.en.ts` copia a mano las cifras (planes, bolsas, opción
 * excepcional, instalación); `pruebas/unidad/paridad-precios.test.ts` falla si
 * alguna deja de coincidir con esta tabla.
 *
 * `proximamente: true` en todo lo que la plataforma aún no hace. Quitarlo exige
 * que la función esté construida (prohibición 8 de CLAUDE.md).
 */
export const precios: Precios = {
  bajada:
    'Servicio prepago mensual, con tu propia cuenta de WhatsApp Business. A NovuChat le pagas la mensualidad y la instalación; la mensajería de WhatsApp la pagas directamente a Meta, en tu cuenta. Más abajo te explicamos qué pagas, a quién y qué necesitamos de ti.',

  planes: [
    {
      id: 'impulso',
      nombre: 'Impulso',
      precioUsd: 25,
      conversaciones: 200,
      resumen: 'Para el negocio que empieza a perder mensajes por no dar abasto.',
      caminos: [
        {
          icono: '📅',
          titulo: 'Citas',
          // En cifra, no «Una»: el verificador del asistente compara números, y
          // si el modelo escribe «1 agenda» contra una fuente que dice «Una
          // agenda», descarta la respuesta como inventada (pasó con «¿cuánto
          // cuesta?», 2026-09-11). Además es como lo dice la presentación.
          texto: '1 agenda conectada a tu Google Calendar, con recordatorio automático 24 horas antes.',
        },
        {
          icono: '🛒',
          titulo: 'Ventas',
          texto: 'Catálogo de hasta 20 productos, con el total y el envío ya calculados.',
        },
      ],
      incluye: [
        { texto: 'Asistente con IA que entiende lenguaje natural, 24 horas' },
        { texto: 'Consola para ver todo desde el celular' },
      ],
    },
    {
      id: 'crecimiento',
      nombre: 'Crecimiento',
      precioUsd: 50,
      conversaciones: 500,
      resumen: 'Para el negocio con varias personas atendiendo y agenda llena.',
      destacado: true,
      caminos: [
        {
          icono: '📅',
          titulo: 'Citas',
          texto: 'Hasta 5 agendas, una por persona: nadie queda con 2 citas a la vez. Con recordatorio automático 24 horas antes.',
        },
        {
          icono: '🛒',
          titulo: 'Ventas',
          texto: 'Catálogo de hasta 100 productos, con el total y el envío ya calculados.',
        },
      ],
      incluye: [
        { texto: 'Asistente con IA que entiende lenguaje natural, 24 horas' },
        { texto: 'Consola para ver todo desde el celular' },
      ],
    },
    {
      id: 'pro',
      nombre: 'Pro',
      precioUsd: 90,
      conversaciones: 1000,
      resumen: 'Para varias sucursales o un volumen alto de pedidos.',
      caminos: [
        {
          icono: '📅',
          titulo: 'Citas',
          texto: 'Hasta 10 agendas, una por persona o por sucursal. Con recordatorio automático 24 horas antes.',
        },
        {
          icono: '🛒',
          titulo: 'Ventas',
          texto: 'Catálogo de hasta 500 productos, con el total y el envío ya calculados.',
        },
      ],
      incluye: [
        { texto: 'Asistente con IA que entiende lenguaje natural, 24 horas' },
        { texto: 'Consola para ver todo desde el celular' },
        { texto: 'Soporte técnico prioritario' },
      ],
    },
  ],

  notaMeta: '+ la mensajería de WhatsApp, que pagas directamente a Meta',
  pie: 'Servicio prepago mensual. Precios en USD, cobrados en Bs al Tipo de Cambio Oficial del BCB. El cliente paga directamente a Meta los costos de mensajería.',
  mensajeriaMeta,

  quePagas: {
    titulo: 'Qué pagas y a quién',
    items: [
      {
        aQuien: 'A NovuChat, cada mes',
        que: 'La mensualidad de tu plan, por adelantado. Está en dólares y se cobra en bolivianos al Tipo de Cambio Oficial del Banco Central de Bolivia del primer día hábil del mes. Incluye el asistente, la inteligencia artificial y la consola.',
      },
      {
        aQuien: 'A NovuChat, una sola vez',
        que: `La instalación: USD ${instalacion.estandar}, pago único por adelantado, al inicio del servicio.`,
      },
      {
        aQuien: 'A Meta, según lo que uses',
        que: `La mensajería de WhatsApp. La pagas directamente a Meta, con tu tarjeta y en tu propia cuenta: NovuChat no la cobra. ${mensajeriaMeta}`,
      },
      {
        aQuien: 'A NovuChat, solo si la apruebas',
        que: `Una bolsa de conversaciones, si superas las de tu plan: ${bolsasResumen}.`,
      },
    ],
  },

  queNecesitamos: {
    titulo: 'Qué necesitamos de ti',
    items: [
      'Tu cuenta de WhatsApp Business en Meta, a nombre de tu negocio, y el número que va a usar el asistente',
      'Una tarjeta registrada en tu cuenta de Meta, para la mensajería',
      'La lista de tus servicios o productos con sus precios',
      'Tus horarios de atención y quién atiende cada servicio, si son varias personas',
      'Tu calendario de Google, si agendas citas',
      'El tono con el que quieres que hable el asistente',
    ],
  },

  instalacion,

  bolsas,
  bolsasResumen,

  bolsasTexto: {
    titulo: 'Bolsas de conversaciones',
    texto:
      'Si superas las conversaciones de tu plan, puedes sumar una bolsa. Las bolsas no vencen. Te avisamos al llegar al 80 % de tu plan para que decidas si te conviene una bolsa o subir de nivel, y nunca se cobra una bolsa sin que la apruebes.',
  },

  excepcional: {
    titulo: 'Opción excepcional: con la mensajería de Meta incluida',
    paraQuien:
      'Para el negocio que no tiene ni quiere gestionar una cuenta de Meta. En esta modalidad las conversaciones de WhatsApp van incluidas en el precio y el número nuevo lo conseguimos nosotros. No es la oferta habitual: se ofrece caso por caso.',
    conversaciones: { impulso: 100, crecimiento: 220, pro: 500 },
    diferencias: [
      'Las conversaciones de WhatsApp con tus clientes van incluidas en el precio: no las pagas a Meta',
      'El número nuevo lo conseguimos nosotros y va incluido en la instalación',
      'La instalación incluye la verificación del número ante Meta',
    ],
    // PENDIENTE `alcance-instalacion`: se asume el mismo precio que la estándar.
    instalacionUsd: instalacion.estandar,
    bolsa: { conversaciones: 30, precioUsd: 10 },
    nota: 'Se ofrece caso por caso. Si es tu situación, escríbenos y lo vemos contigo.',
  },

  comoContamos: {
    titulo: 'Cómo contamos las conversaciones',
    parrafos: [
      'Una conversación son hasta 25 respuestas del asistente a un mismo cliente dentro de 24 horas continuas. Si alguien te escribe a las nueve de la mañana, sigue preguntando al mediodía y cierra su pedido a las seis de la tarde, eso es una sola conversación. Si un mismo cliente necesita más de 25 respuestas en el día, el asistente sigue atendiéndolo y a partir de la respuesta 26 se cuenta una conversación nueva. Pasadas las 24 horas desde su primer mensaje, la cuenta vuelve a empezar.',
      'Lo hacemos así porque no te castiga por conversar: una conversación de tres mensajes y una de veinte cuestan lo mismo. Cobrar por mensaje te obligaría a vigilar cuánto habla el asistente, y un asistente que responde corto vende menos. Y el asistente no deja a un cliente a medias por pasar de 25 respuestas.',
      'En tu consola ves el mismo número que facturamos, y además dos datos que sirven para decidir: cuántas personas distintas atendiste y cuántos cierres se lograron.',
    ],
    glosario: [
      {
        termino: 'Conversación',
        definicion:
          'Hasta 25 respuestas del asistente a un mismo cliente en 24 horas continuas. A partir de la respuesta 26 en el mismo día se cuenta otra; a las 24 horas la cuenta vuelve a cero. Es la unidad que se factura.',
      },
      {
        termino: 'Atención',
        definicion:
          'Una persona distinta atendida en el período. Si el mismo cliente vuelve tres veces en el mes, son tres conversaciones y una sola atención. No se factura: es un dato para que sepas a cuánta gente distinta llegaste.',
      },
      {
        termino: 'Cierre',
        definicion:
          'Una cita agendada o un pedido confirmado. Es lo que mide si el asistente está vendiendo, no solo respondiendo.',
      },
      {
        termino: 'Bolsa',
        definicion: `Conversaciones adicionales para cuando superas las de tu plan: ${bolsasResumen}. No vencen. Te avisamos al llegar al 80 % de tu plan, y nunca se cobra una bolsa sin que la apruebes.`,
      },
    ],
  },
};
