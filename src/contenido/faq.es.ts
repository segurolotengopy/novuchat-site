import type { Pregunta } from './tipos';
import { precios } from './precios.es';

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
      'No es obligatorio. El asistente atiende en un número a tu nombre, registrado en tu propia cuenta de WhatsApp Business: puede ser el que ya tienes o uno nuevo que consigas para el asistente. Lo que conviene saber es que, mientras un número está conectado al asistente, ya no puedes responder con ese número desde la aplicación de WhatsApp de tu celular. Por eso, si hoy atiendes con tu número desde la aplicación y quieres seguir haciéndolo, te recomendamos un número nuevo para el asistente.',
  },
  {
    pregunta: '¿Los costos de WhatsApp y de la inteligencia artificial son aparte?',
    respuesta:
      `La inteligencia artificial sí está incluida en tu plan. La mensajería de WhatsApp no: la pagas directamente a Meta, con tu tarjeta y en tu propia cuenta, y NovuChat no la cobra. ${precios.mensajeriaMeta} A nosotros nos pagas la mensualidad del plan, la instalación y, solo si las apruebas, las bolsas de conversaciones.`,
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
    pregunta: '¿Puedo usar mi número actual?',
    respuesta:
      'Sí, siempre que esté a tu nombre y lo registres en tu cuenta de WhatsApp Business. Ten en cuenta que, mientras esté conectado al asistente, ya no puedes responder con ese número desde la aplicación de WhatsApp de tu celular. Si eso te complica, usa un número nuevo para el asistente y deja el de siempre en tu celular. Lo revisamos contigo antes de conectar.',
  },
  {
    pregunta: '¿Cuánto cuesta la instalación?',
    respuesta:
      `USD ${precios.instalacion.estandar}, un pago único que se hace por adelantado, al inicio del servicio y aparte de la mensualidad del plan. Es llave en mano: conectamos tu número al canal oficial de WhatsApp Business de Meta, con la cuenta a tu nombre, cargamos tus servicios, precios, horarios y el tono del asistente, lo conectamos con tu Google Calendar y lo probamos con casos reales. Si tu negocio necesita desarrollo a medida, como integrarlo con tu sistema propio, la instalación arranca en USD ${precios.instalacion.aMedidaDesde} y se cotiza caso por caso.`,
  },
  {
    pregunta: '¿Cuánto tarda la instalación?',
    respuesta:
      '48 horas desde que tengas tu cuenta de WhatsApp Business lista y nos entregues tu información: servicios o productos con precios, horarios y tu calendario. La cuenta y la verificación de tu negocio ante Meta se hacen en tu cuenta de Meta, así que ese tiempo no depende de nosotros; te acompañamos en el trámite.',
  },
  {
    pregunta: '¿Qué pasa si no pago un mes?',
    respuesta:
      'Si no pagas la mensualidad, se suspende el asistente, pero conservas tus datos y el acceso a la consola en modo lectura. A tus clientes les llega un mensaje neutro: nunca se enteran de que hubo un problema de pago. Lo que pagas a Meta va por separado: si ese pago falla, se resuelve en tu cuenta de Meta, y lo que Meta decida sobre tus mensajes no depende de nosotros.',
  },
  {
    pregunta: '¿Qué es una bolsa de conversaciones?',
    respuesta:
      `Es un paquete de conversaciones adicionales para cuando superas las de tu plan: ${precios.bolsasResumen}. Las bolsas no vencen. Te avisamos al llegar al 80 % de tu plan para que decidas si te conviene una bolsa o subir de nivel, y nunca se cobra una bolsa sin que la apruebes. La mensajería de esas conversaciones la sigues pagando directamente a Meta.`,
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
      'Sí. Cada camino vive en su propio número de WhatsApp, así que se contrata un plan para cada uno, cada número en tu cuenta de WhatsApp Business, y los 2 se administran desde la misma consola. Escríbenos y lo armamos contigo: no hace falta que elijas hoy y te arrepientas después, se puede sumar el segundo cuando quieras.',
  },
  {
    pregunta: '¿Por qué tengo que elegir entre citas y ventas?',
    respuesta:
      'Porque son dos formas distintas de atender y cada una necesita su propia configuración: la de citas mira tu calendario, la de ventas mira tu catálogo. Un plan trae una de las dos, con el tamaño que corresponde a su nivel. Si tu negocio necesita las dos, se contratan las dos.',
  },
  {
    pregunta: '¿En qué moneda pago?',
    respuesta:
      'Los precios están en dólares y el cobro se hace en bolivianos, al Tipo de Cambio Oficial del Banco Central de Bolivia. Tomamos el del primer día hábil de cada mes y lo mantenemos todo ese mes, así que sabes exactamente cuánto vas a pagar antes de hacerlo, y puedes verificarlo en la página del Banco Central. Lo que pagas a Meta por la mensajería no pasa por nosotros: lo cobra Meta en tu cuenta, según su tarifa vigente.',
  },
  {
    pregunta: '¿Cuándo se paga?',
    respuesta:
      'Todo es prepago. Cada mes del plan se paga por adelantado, y la instalación es un pago único que también se hace por adelantado, al inicio del servicio. No hay contratos largos ni permanencia. La mensajería de WhatsApp la cobra Meta en tu cuenta, aparte.',
  },
  {
    pregunta: '¿Qué pasa si una conversación se hace muy larga?',
    respuesta:
      'Una conversación son hasta 25 respuestas del asistente a un mismo cliente dentro de 24 horas continuas. Si un cliente necesita más, el asistente sigue atendiéndolo y desde la respuesta 26 se cuenta una conversación nueva. Como una charla tan larga casi siempre es porque algo se trabó, además te avisamos al número que nos des para que alguien de tu equipo la mire, con todo el contexto de lo que ya se habló. En tu consola ves cuántas conversaciones del mes se contaron por este motivo.',
  },
  {
    pregunta: '¿Qué necesitan de mí para empezar?',
    respuesta:
      'Tu cuenta de WhatsApp Business en Meta, a nombre de tu negocio, con el número que va a usar el asistente y una tarjeta registrada para pagar la mensajería; la lista de servicios o productos con precios; tus horarios y quién atiende cada servicio; tu calendario de Google y el tono con el que quieres que hable el asistente. Tú no programas nada.',
  },
];

/** Las cinco que se muestran en el inicio. */
export const preguntasDestacadas: Pregunta[] = preguntas.slice(0, 5);
