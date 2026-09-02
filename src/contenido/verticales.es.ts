import type { Vertical, Turno } from './tipos';

/**
 * Páginas por rubro. Todos los negocios y teléfonos son ficticios
 * («Salón Aurora», «Parrilla El Fogón»), como exige la prohibición 9 de
 * CLAUDE.md: nunca datos de clientes reales.
 */
export const verticales: Vertical[] = [
  {
    id: 'salud-belleza',
    nombre: 'Salud y Belleza',
    titulo: 'Asistente de WhatsApp para salones y consultorios',
    bajada:
      'Agenda sola, recuerda las citas y libera a tu equipo del teléfono. Cada profesional con su propia agenda y sus especialidades.',
    negocioEjemplo: 'Salón Aurora',
    casos: [
      {
        titulo: 'Agenda sin que nadie intervenga',
        texto:
          'El cliente pide turno, el asistente consulta la disponibilidad real de cada profesional y crea la cita en el calendario. Si el horario está ocupado, ofrece alternativas.',
      },
      {
        titulo: 'Recordatorio 24 horas antes',
        texto:
          'Se manda solo, por una plantilla aprobada de WhatsApp. El cliente puede confirmar o reagendar respondiendo el mismo mensaje.',
      },
      {
        titulo: 'Precios cuando corresponde',
        texto:
          'En belleza el asistente da precios. En salud no los inventa: explica que la valoración la hace el profesional y agenda la consulta.',
      },
    ],
    conversacion: [
      { de: 'cliente', texto: 'Hola, quiero teñirme el pelo esta semana' },
      {
        de: 'asistente',
        texto:
          'Con gusto. El tinte completo cuesta 180 Bs y toma unas dos horas. Tengo el jueves a las 10:00 y el viernes a las 15:00 con Carla. ¿Alguno te sirve?',
      },
      { de: 'cliente', texto: 'el viernes pero mas tarde se puede?' },
      {
        de: 'asistente',
        texto:
          'El viernes después de las 15:00 solo queda 17:30. ¿Te la agendo?',
      },
      { de: 'cliente', texto: 'sí porfa' },
      {
        de: 'asistente',
        texto:
          'Listo. Tinte completo con Carla, el viernes a las 17:30 en Salón Aurora. Te escribo el jueves para recordarte.',
      },
    ],
    planRecomendado: 'crecimiento',
    foto: { archivo: '/imagenes/pyme-belleza.webp', alt: 'Peluquería atendiendo a una clienta' },
  },

  {
    id: 'gastronomia',
    nombre: 'Gastronomía',
    titulo: 'Asistente de WhatsApp para restaurantes y delivery',
    bajada:
      'Toma el pedido con sus notas, calcula el envío por zona, manda el QR y avisa a la cocina.',
    negocioEjemplo: 'Parrilla El Fogón',
    casos: [
      {
        titulo: 'Pedidos con notas y variantes',
        texto:
          '«Sin cebolla», «bien cocida», «uno sin picante». El asistente lo registra y lo pasa tal cual a la cocina.',
      },
      {
        titulo: 'Envío calculado por zona',
        texto:
          'El cliente dice a dónde va y el total sale con el costo de envío ya sumado. Sin idas y vueltas.',
      },
      {
        titulo: 'Cobro por QR y comprobante',
        texto:
          'Manda el QR de tu banco, recibe el comprobante y confirma el pedido. En demostraciones el QR está rotulado como simulado.',
      },
    ],
    conversacion: [
      {
        de: 'cliente',
        texto: 'Hola, quiero una hamburguesa doble, sin cebolla. Es para mandar a Calacoto.',
      },
      {
        de: 'asistente',
        texto:
          'Hamburguesa doble sin cebolla registrada. El total con envío a Calacoto es 45 Bs. Aquí tienes el QR para el pago:',
        qrDemostracion: true,
      },
      { de: 'cliente', texto: 'Listo, ya pagué' },
      {
        de: 'asistente',
        texto:
          '¡Pago confirmado! Tu pedido ya se está preparando. Tiempo estimado: 25 minutos.',
      },
    ],
    planRecomendado: 'crecimiento',
    foto: { archivo: '/imagenes/pyme-gastro.webp', alt: 'Restaurante preparando pedidos para llevar' },
  },

  {
    id: 'comercio',
    nombre: 'Comercio y Retail',
    titulo: 'Asistente de WhatsApp para tiendas',
    bajada:
      'Responde por talla, color y stock a cualquier hora, toma los datos de envío y cierra la venta con el QR.',
    negocioEjemplo: 'Tienda Aurora',
    casos: [
      {
        titulo: 'Catálogo con variantes',
        texto:
          'Talla, color y disponibilidad real. Si algo se acabó, ofrece la alternativa más parecida en vez de dejar al cliente sin respuesta.',
      },
      {
        titulo: 'Datos de envío antes del cobro',
        texto:
          'Pide nombre y carnet para la guía de envío antes de mandar el QR, así el paquete sale el mismo día.',
      },
      {
        titulo: 'Ventas de madrugada',
        texto:
          'La mayoría de las consultas llegan cuando la tienda está cerrada. El asistente las convierte igual.',
      },
    ],
    conversacion: [
      { de: 'cliente', texto: '¿Tienen la casaca negra en talla M?' },
      {
        de: 'asistente',
        texto: 'Sí, quedan dos en talla M a 320 Bs. ¿La quieres con envío a domicilio?',
      },
      { de: 'cliente', texto: 'Sí, a Sopocachi' },
      {
        de: 'asistente',
        texto:
          'Perfecto. Necesito tu nombre y carnet para la guía de envío, y te mando el QR por 320 Bs más 15 Bs de envío.',
      },
    ],
    planRecomendado: 'crecimiento',
    foto: { archivo: '/imagenes/pyme-retail.webp', alt: 'Tienda de ropa atendiendo a una clienta' },
  },
];

/** Búsqueda por identificador, para las rutas dinámicas. */
export const porId = (id: string): Vertical | undefined =>
  verticales.find((v) => v.id === id);

/** La conversación que se muestra en el inicio, con el QR de demostración. */
export const conversacionDemostracion: Turno[] =
  verticales.find((v) => v.id === 'gastronomia')!.conversacion;
