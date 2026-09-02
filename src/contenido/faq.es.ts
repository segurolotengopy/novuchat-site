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
      'No necesariamente. Podemos conectar el tuyo si es WhatsApp Business, o darte uno de nuestra cuenta verificada. Si conectamos el tuyo, dejas de usar la aplicación en el celular para ese número: las conversaciones pasan a verse en la consola.',
  },
  {
    pregunta: '¿Qué pasa si el cliente manda un audio o una foto?',
    respuesta:
      'Hoy el asistente responde con cortesía pidiendo que lo escriba, o deriva la conversación a una persona de tu equipo. Escuchar audios es una función que estamos construyendo; cuando esté lista te avisamos.',
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
      'Muestra el QR de tu banco y valida el comprobante que te envía el cliente; el dinero se acredita directamente en tu cuenta, nunca pasa por nosotros. En las demostraciones el QR está rotulado como simulado y no cobra nada.',
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
      'No. El consumo del modelo de inteligencia artificial y las conversaciones de WhatsApp están incluidos en tu plan. Lo único que se cobra aparte son los excedentes, si superas las conversaciones incluidas, y te avisamos antes de llegar.',
  },
  {
    pregunta: '¿Dónde están mis datos?',
    respuesta:
      'En la infraestructura de Google Cloud, en servidores de Estados Unidos, con la información de cada negocio aislada de la de los demás. Las reglas que garantizan ese aislamiento se prueban automáticamente en cada cambio.',
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
    pregunta: '¿Qué necesitan de mí para empezar?',
    respuesta:
      'Tu número de WhatsApp (o te damos uno), la lista de servicios o productos con precios, tus horarios, tu calendario de Google y el tono con el que quieres que hable el asistente. Nada más: tú no programas nada.',
  },
];

/** Las cinco que se muestran en el inicio. */
export const preguntasDestacadas: Pregunta[] = preguntas.slice(0, 5);
