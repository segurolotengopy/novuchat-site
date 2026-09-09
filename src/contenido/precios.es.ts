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
      incluye: [
        { texto: 'Asistente con IA que entiende lenguaje natural, 24 horas' },
        { texto: '100 conversaciones al mes' },
        { texto: 'Agenda conectada a tu Google Calendar' },
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
      incluye: [
        { texto: 'Todo lo del plan Impulso' },
        { texto: '220 conversaciones al mes' },
        { texto: 'Varios funcionarios, cada uno con su agenda: nadie queda con dos citas a la vez' },
        { texto: 'Pedidos desde tu catálogo, con el total y el envío ya calculados' },
        { texto: 'Recordatorio automático 24 horas antes de la cita' },
        { texto: 'Variantes, notas por ítem y envío por zona', proximamente: true },
        { texto: 'El asistente escucha audios', proximamente: true },
        { texto: 'Integración con Google Sheets', proximamente: true },
      ],
    },
    {
      id: 'pro',
      nombre: 'Pro',
      precioUsd: 90,
      conversaciones: 500,
      resumen: 'Para varias sucursales o un volumen alto de pedidos.',
      incluye: [
        { texto: 'Todo lo del plan Crecimiento' },
        { texto: '500 conversaciones al mes' },
        { texto: 'Soporte técnico prioritario' },
        { texto: 'Difusión por plantillas aprobadas, contratada aparte por paquete', proximamente: true },
        { texto: 'Programa de fidelización con puntos', proximamente: true },
      ],
    },
  ],

  instalacion: {
    estandar: 65,
    aMedidaDesde: 125,
    bonificacion:
      'Instalación bonificada para los primeros diez negocios que aseguren su primer mes durante la Rueda de Negocios.',
    incluye: [
      'Nadie de NovuChat lee tus conversaciones sin que tú abras el acceso',
      'Verificación oficial de tu número ante Meta',
      'Carga de tus servicios, precios, horarios y el tono del asistente',
      'Conexión con tu Google Calendar',
      'Pruebas con casos reales antes de salir en vivo',
    ],
  },

  excedente: { precioUsd: 10, conversaciones: 25 },

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
          'Si superas las conversaciones de tu plan, cada bloque adicional de 25 conversaciones cuesta USD 10 y no vence. Te avisamos al llegar al 80 % de tu plan, y nunca se te cobra sin que lo apruebes.',
      },
    ],
  },
};
