import type { Precios } from './tipos';

/**
 * Planes y precios — cifras definitivas del 2026-09-08, tras la propuesta de
 * Silvana analizada y adoptada. Impulso 25/100, Crecimiento 50/220, Pro 90/500.
 *
 * **Los importes están en dólares** y se cobran en bolivianos al Tipo de Cambio
 * Oficial del Banco Central de Bolivia (primer día hábil del mes facturado).
 * Por eso el campo se llama `precioUsd`: imprimirlo con «Bs» al lado sería un
 * error de un orden de magnitud.
 *
 * Nombres: Impulso / Crecimiento / Pro (decisión de Andres, 2026-09-02).
 * Los precios de esta tabla alimentan también el JSON-LD `SoftwareApplication`,
 * así que no se duplican en ningún otro lugar del sitio.
 *
 * `proximamente: true` en todo lo que la plataforma aún no hace. Quitarlo exige
 * que la función esté construida (prohibición 8 de CLAUDE.md).
 */
export const precios: Precios = {
  planes: [
    {
      id: 'impulso',
      nombre: 'Impulso',
      precioUsd: 25,
      conversaciones: 100,
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
        { texto: '100 conversaciones al mes' },
        { texto: 'Consola para ver todo desde el celular' },
        { texto: 'Canal oficial de WhatsApp Business' },
      ],
    },
    {
      id: 'crecimiento',
      nombre: 'Crecimiento',
      precioUsd: 50,
      conversaciones: 220,
      resumen: 'Para el negocio con varias personas atendiendo y agenda llena.',
      destacado: true,
      caminos: [
        {
          icono: '📅',
          titulo: 'Citas',
          texto: 'Hasta 5 agendas, una por persona: nadie queda con dos citas a la vez. Con recordatorio automático 24 horas antes.',
        },
        {
          icono: '🛒',
          titulo: 'Ventas',
          texto: 'Catálogo de hasta 100 productos, con el total y el envío ya calculados.',
        },
      ],
      incluye: [
        { texto: 'Asistente con IA que entiende lenguaje natural, 24 horas' },
        { texto: '220 conversaciones al mes' },
        { texto: 'Consola para ver todo desde el celular' },
        { texto: 'Canal oficial de WhatsApp Business' },
      ],
    },
    {
      id: 'pro',
      nombre: 'Pro',
      precioUsd: 90,
      conversaciones: 500,
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
        { texto: '500 conversaciones al mes' },
        { texto: 'Consola para ver todo desde el celular' },
        { texto: 'Canal oficial de WhatsApp Business' },
        { texto: 'Soporte técnico prioritario' },
      ],
    },
  ],

  // Presentación 8 (Silvana, 2026-09-11): terminó la Rueda de Negocios y la
  // instalación deja de estar bonificada. Se paga por adelantado, al inicio
  // del servicio, y se entrega «llave en mano».
  instalacion: {
    estandar: 65,
    aMedidaDesde: 125,
    incluye: [
      'Configuración inicial llave en mano: recibes el asistente listo para atender',
      'Nadie de NovuChat lee tus conversaciones sin que tú abras el acceso',
      'Verificación oficial de tu número ante Meta',
      'Carga de tus servicios, precios, horarios y el tono del asistente',
      'Conexión con tu Google Calendar',
      'Pruebas con casos reales antes de salir en vivo',
    ],
  },

  excedente: { precioUsd: 10, conversaciones: 30 },

  comoContamos: {
    titulo: 'Cómo contamos las conversaciones',
    parrafos: [
      'Una conversación son todos los mensajes que intercambias con un mismo cliente durante 24 horas continuas. Si alguien te escribe a las nueve de la mañana, sigue preguntando al mediodía y cierra su pedido a las seis de la tarde, eso es una sola conversación. El asistente responde hasta 25 veces dentro de esa conversación; si hace falta más, te avisa para que la tome alguien de tu equipo.',
      'Lo hacemos así porque no te castiga por conversar: una conversación de tres mensajes y una de veinte cuestan lo mismo. Cobrar por mensaje te obligaría a vigilar cuánto habla el asistente, y un asistente que responde corto vende menos.',
      'En tu consola ves el mismo número que facturamos, y además dos datos que sirven para decidir: cuántas personas distintas atendiste y cuántos cierres se lograron.',
    ],
    glosario: [
      {
        termino: 'Conversación',
        definicion:
          'Todos los mensajes con un mismo cliente en 24 horas continuas, con hasta 25 respuestas del asistente. Es la unidad que se factura.',
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
        termino: 'Excedente',
        definicion:
          'Si superas las conversaciones de tu plan, cada bloque adicional de hasta 30 conversaciones cuesta USD 10 y no vence. Te avisamos al llegar al 80 % de tu plan, y nunca se te cobra sin que lo apruebes.',
      },
    ],
  },
};
