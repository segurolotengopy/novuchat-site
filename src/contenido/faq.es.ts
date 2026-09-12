import type { Pregunta } from './tipos';

/**
 * Preguntas frecuentes. Alimentan la página `/preguntas-frecuentes`, el bloque
 * corto del inicio y el JSON-LD `FAQPage`: una sola fuente, sin duplicar texto.
 *
 * Las respuestas no prometen nada que la plataforma no haga hoy
 * (prohibición 8 de CLAUDE.md).
 */
export const preguntas: Pregunta[] = [
  {
    pregunta: '¿Necesito un número nuevo de WhatsApp?',
    respuesta:
      'Sí, y lo conseguimos nosotros: un número nuevo a tu nombre, dedicado al asistente, incluido en la instalación. Tu WhatsApp de siempre sigue igual y es donde te avisamos cuando una conversación necesita a una persona. Conectar tu número actual es posible, pero entonces dejarías de poder responder desde el celular con ese número, así que hoy no lo recomendamos.',
  },
  {
    pregunta: '¿Qué pasa si el cliente manda un audio o una foto?',
    respuesta:
      'Hoy el asistente responde con cortesía pidiendo que lo escriba, o deriva la conversación a una persona de tu equipo.',
  },
  {
    pregunta: '¿Puede equivocarse?',
    respuesta:
      'Sí, como cualquiera. Por eso está construido para no equivocarse en lo que importa: nunca confirma una cita sin verificar que exista en tu calendario, no inventa precios que no le diste y, si no está seguro después de tres intentos, deriva a una persona.',
  },
  {
    pregunta: '¿El asistente dice que es una inteligencia artificial?',
    respuesta:
      'Siempre, si le preguntan. Es un compromiso que no negociamos: nunca se hace pasar por una persona.',
  },
  {
    pregunta: '¿Cobra de verdad?',
    respuesta:
      'Muestra el QR de tu banco y recibe el comprobante que envía el cliente; quien lo valida eres tú, y quien confirma que entró la plata es tu banco. El dinero se acredita directamente en tu cuenta, nunca pasa por nosotros. En las demostraciones el QR está rotulado como simulado y no cobra nada.',
  },
  {
    pregunta: '¿Cuánto tarda la instalación?',
    respuesta:
      '48 horas desde que tenemos tu información: servicios o productos con precios, horarios y tu calendario. Lo que puede tardar más es el trámite de verificación de tu negocio ante Meta, que no depende de nosotros.',
  },
  {
    pregunta: '¿Qué pasa si no pago un mes?',
    respuesta:
      'Se suspende el asistente, pero conservas tus datos y el acceso a la consola en modo lectura. A tus clientes les llega un mensaje neutro: nunca se enteran de que hubo un problema de pago.',
  },
  {
    pregunta: '¿Los costos de WhatsApp y de la inteligencia artificial son aparte?',
    respuesta:
      'No. El consumo del modelo de inteligencia artificial y las conversaciones de WhatsApp están incluidos en tu plan. Lo único que se cobra aparte son los excedentes, si superas las conversaciones incluidas, y te avisamos antes de llegar. Tampoco te cobramos por cada mensaje que responde el asistente, aunque a nosotros WhatsApp nos los cobre.',
  },
  {
    pregunta: '¿Dónde están mis datos?',
    respuesta:
      'En la infraestructura de Google Cloud, en servidores de Estados Unidos, con la información de cada negocio aislada de la de los demás. Las reglas que garantizan ese aislamiento se prueban automáticamente en cada cambio.',
  },
  {
    pregunta: '¿Ustedes pueden leer las conversaciones de mis clientes?',
    respuesta:
      'No, salvo que tú lo autorices. Ser dueños de NovuChat no nos da acceso: para entrar a dar soporte hace falta que un administrador de tu negocio abra un permiso, que dura entre una y veinticuatro horas, queda registrado y caduca solo. No podemos dárnoslo nosotros mismos. Las reglas que lo garantizan se prueban con más de doscientos casos automáticos en cada cambio.',
  },
  {
    pregunta: '¿Puedo cambiar de plan?',
    respuesta:
      'Sí, en cualquier momento. El cambio se aplica el mes siguiente, sin recalcular el mes en curso.',
  },
  {
    pregunta: '¿Sirve para varias sucursales?',
    respuesta:
      'Sí. Cada número de WhatsApp es un asistente con su propia configuración, y todos se administran desde la misma consola.',
  },
  {
    pregunta: '¿Puedo tener citas y ventas a la vez?',
    respuesta:
      'Sí. Cada camino vive en su propio número de WhatsApp, así que se contrata un plan para cada uno y los dos se administran desde la misma consola. Escríbenos y lo armamos contigo: no hace falta que elijas hoy y te arrepientas después, se puede sumar el segundo cuando quieras.',
  },
  {
    pregunta: '¿Por qué tengo que elegir entre citas y ventas?',
    respuesta:
      'Porque son dos formas distintas de atender y cada una necesita su propia configuración: la de citas mira tu calendario, la de ventas mira tu catálogo. Un plan trae una de las dos, con el tamaño que corresponde a su nivel. Si tu negocio necesita las dos, se contratan las dos.',
  },
  {
    pregunta: '¿En qué moneda pago?',
    respuesta:
      'Los precios están en dólares y el cobro se hace en bolivianos, al Tipo de Cambio Oficial del Banco Central de Bolivia. Tomamos el del primer día hábil de cada mes y lo mantenemos todo ese mes, así que sabes exactamente cuánto vas a pagar antes de hacerlo, y puedes verificarlo en la página del Banco Central.',
  },
  {
    pregunta: '¿Cuándo se paga?',
    respuesta:
      'Todo es prepago. Cada mes del plan se paga por adelantado, y la instalación es un pago único que también se hace por adelantado, al inicio del servicio. No hay contratos largos ni permanencia.',
  },
  {
    pregunta: '¿Qué pasa si una conversación se hace muy larga?',
    respuesta:
      'El asistente responde hasta 25 veces por conversación. Si una consulta necesita más que eso, casi siempre es porque se trabó: te avisamos al número que nos des y la toma alguien de tu equipo, con todo el contexto de lo que ya se habló.',
  },
  {
    pregunta: '¿Qué necesitan de mí para empezar?',
    respuesta:
      'Un número nuevo, que conseguimos nosotros; la lista de servicios o productos con precios; tus horarios y quién atiende cada servicio; tu calendario de Google y el tono con el que quieres que hable el asistente. Nada más: tú no programas nada.',
  },
];

/** Las cinco que se muestran en el inicio. */
export const preguntasDestacadas: Pregunta[] = preguntas.slice(0, 5);
