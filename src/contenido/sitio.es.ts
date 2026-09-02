import type { Sitio } from './tipos';

/**
 * Contenido global: navegación, pie, contacto y aviso.
 *
 * Nota importante (decisión de Andres, 2026-09-02): **el sitio no menciona a
 * AAB1**. NovuChat se presenta como comercio independiente, por motivos
 * tributarios. La identidad legal se declara desde `pendientes.ts` cuando el
 * NIT propio exista.
 */
export const sitio: Sitio = {
  nombre: 'NovuChat',
  lema: 'El primer empleado de tu negocio que nunca duerme.',

  contacto: {
    correo: 'silvana@novuchat.site',
    whatsapp: '+591 70661250',
    whatsappEnlace: '59170661250',
    ciudad: 'La Paz',
    pais: 'Bolivia',
  },

  // La barra se retira sola el 11 de septiembre: la fecha vive en el contenido,
  // no en un despliegue que haya que recordar hacer.
  aviso: {
    texto:
      'Estamos en la Rueda de Negocios el 9 y 10 de septiembre — instalación bonificada para los primeros diez negocios.',
    hasta: '2026-09-11',
  },

  navegacion: [
    { texto: 'Cómo funciona', ruta: '/como-funciona' },
    { texto: 'Soluciones', ruta: '/soluciones/salud-belleza' },
    { texto: 'Consola', ruta: '/consola' },
    { texto: 'Precios', ruta: '/precios' },
    { texto: 'Nosotros', ruta: '/nosotros' },
  ],

  pie: [
    {
      titulo: 'Producto',
      enlaces: [
        { texto: 'Cómo funciona', ruta: '/como-funciona' },
        { texto: 'Salud y Belleza', ruta: '/soluciones/salud-belleza' },
        { texto: 'Gastronomía', ruta: '/soluciones/gastronomia' },
        { texto: 'Comercio y Retail', ruta: '/soluciones/comercio' },
        { texto: 'La consola', ruta: '/consola' },
        { texto: 'Precios', ruta: '/precios' },
      ],
    },
    {
      titulo: 'Empresa',
      enlaces: [
        { texto: 'Nosotros', ruta: '/nosotros' },
        { texto: 'Preguntas frecuentes', ruta: '/preguntas-frecuentes' },
        { texto: 'Contacto', ruta: '/contacto' },
        { texto: 'Pedir una demostración', ruta: '/demo' },
      ],
    },
    {
      titulo: 'Legal',
      enlaces: [
        { texto: 'Política de privacidad', ruta: '/privacidad' },
        { texto: 'Términos del servicio', ruta: '/terminos' },
      ],
    },
  ],

  lineaLegal: 'NovuChat · La Paz, Bolivia',
};

/** Canal oficial, se repite en el pie y en varias páginas. */
export const insigniaCanal = 'Canal oficial: WhatsApp Business Cloud API de Meta';
