import type { Precios } from './tipos';

/**
 * Planes y precios — confirmados por Andres el 2026-09-02 contra el diseño de
 * referencia y `Presentación NovuChat2.html`.
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
      precioBs: 250,
      conversaciones: 300,
      resumen: 'Para el negocio que empieza a perder mensajes por no dar abasto.',
      incluye: [
        { texto: 'Asistente con IA que entiende lenguaje natural, 24 horas' },
        { texto: '300 conversaciones al mes' },
        { texto: 'Agenda conectada a tu Google Calendar' },
        { texto: 'Consola para ver todo desde el celular' },
        { texto: 'Canal oficial de WhatsApp Business' },
      ],
    },
    {
      id: 'crecimiento',
      nombre: 'Crecimiento',
      precioBs: 450,
      conversaciones: 1000,
      resumen: 'Para el negocio con varias personas atendiendo y agenda llena.',
      destacado: true,
      incluye: [
        { texto: 'Todo lo del plan Impulso' },
        { texto: '1.000 conversaciones al mes' },
        { texto: 'Varios funcionarios, cada uno con su agenda y especialidades' },
        { texto: 'Pedidos con variantes, notas y envío por zona' },
        { texto: 'Recordatorio automático 24 horas antes de la cita' },
        { texto: 'El asistente escucha audios', proximamente: true },
        { texto: 'Integración con Google Sheets', proximamente: true },
      ],
    },
    {
      id: 'pro',
      nombre: 'Pro',
      precioBs: 850,
      conversaciones: 2500,
      resumen: 'Para varias sucursales o un volumen alto de pedidos.',
      incluye: [
        { texto: 'Todo lo del plan Crecimiento' },
        { texto: '2.500 conversaciones al mes' },
        { texto: 'Soporte técnico prioritario' },
        { texto: 'Difusión masiva por plantillas aprobadas', proximamente: true },
        { texto: 'Programa de fidelización con puntos', proximamente: true },
      ],
    },
  ],

  instalacion: {
    estandar: 800,
    aMedidaDesde: 1500,
    bonificacion:
      'Instalación bonificada para los primeros diez negocios que aseguren su primer mes durante la Rueda de Negocios.',
    incluye: [
      'Alta de tu negocio en servidores seguros y base de datos aislada',
      'Verificación oficial de tu número ante Meta',
      'Carga de tus servicios, precios, horarios y el tono del asistente',
      'Conexión con tu Google Calendar',
      'Pruebas con casos reales antes de salir en vivo',
    ],
  },

  excedente: { precioBs: 50, conversaciones: 150 },

  comoContamos: {
    titulo: 'Cómo contamos las conversaciones',
    parrafos: [
      'Una conversación son todos los mensajes que intercambias con un mismo cliente durante 24 horas continuas, sin importar cuántos sean. Si alguien te escribe a las nueve de la mañana, sigue preguntando al mediodía y cierra su pedido a las seis de la tarde, eso es una sola conversación.',
      'Lo hacemos así porque es la única medida que no te castiga por conversar. Cobrar por mensaje empuja a responder corto, y un asistente que responde corto vende menos.',
      'En tu consola ves el mismo número que facturamos, y además dos datos que sirven para decidir: cuántas personas distintas atendiste y cuántos cierres se lograron.',
    ],
    glosario: [
      {
        termino: 'Conversación',
        definicion:
          'Todos los mensajes con un mismo cliente en 24 horas continuas. Es la unidad que se factura.',
      },
      {
        termino: 'Atención',
        definicion:
          'Una persona distinta atendida en el período. Si el mismo cliente vuelve tres veces en el mes, son tres conversaciones y una sola atención.',
      },
      {
        termino: 'Cierre',
        definicion:
          'Una cita agendada o un pedido confirmado. Es lo que mide si el asistente está vendiendo, no solo respondiendo.',
      },
      {
        termino: 'Excedente',
        definicion:
          'Si superas las conversaciones de tu plan, cada bloque adicional de 150 conversaciones cuesta 50 Bs. No se corta el servicio ni se te cobra sorpresa: te avisamos al llegar al 80 %.',
      },
    ],
  },
};
