import {
  CAMPOS_RESERVADOS_FORMSUBMIT,
  neutralizar,
  neutralizarEncabezado,
} from './saneo.js';

/**
 * Lógica pura del formulario de leads.
 *
 * Vive aparte de `lead.ts` por la misma razón que `asistente-logica.ts`: para
 * poder probarla sin el entorno de Cloud Functions. Aquí no se importa
 * `firebase-functions` ni `zod`, así que las pruebas de unidad corren en un
 * runner que solo instaló las dependencias de la raíz —que es exactamente lo
 * que hace el CI—. Cuando `construirAviso` vivía en `lead.ts`, el job de
 * calidad fallaba con `Cannot find package 'firebase-functions/v2/https'`.
 */

/** Los datos de un lead ya validados. `lead.ts` valida con zod contra esto. */
export interface DatosLead {
  nombre: string;
  negocio: string;
  correo: string;
  whatsapp: string;
  rubro: 'salud-belleza' | 'gastronomia' | 'comercio' | 'otro';
  ciudad: string;
  clientes: string;
  interes: string;
  plan: 'impulso' | 'crecimiento' | 'pro' | '';
  mensaje: string;
  origen: {
    pagina: string;
    idioma: 'es' | 'en';
    utm: Record<string, string>;
  };
  /** Trampa para robots: una persona nunca la completa. */
  empresaWeb: string;
}

/**
 * Cuerpo del aviso por correo.
 *
 * NUNCA se vuelcan los campos del formulario tal cual en la petición
 * (riesgo S-14 del doc 04). FormSubmit interpreta como instrucciones los campos
 * que empiezan por guion bajo —`_cc`, `_replyto`, `_next`— así que un `spread`
 * del objeto recibido dejaría que quien rellena el formulario redirigiera el
 * aviso a su propia casilla. Se construye campo por campo, con nombres fijos, y
 * cada valor pasa por `neutralizar`.
 */
export function construirAviso(datos: DatosLead): Record<string, string> {
  const cuerpo: Record<string, string> = {
    _subject: neutralizarEncabezado(`Nuevo lead de NovuChat: ${datos.negocio}`, 120),
    // Sin plantilla HTML del tercero: el correo llega como tabla simple.
    _template: 'table',
    _captcha: 'false',
    Nombre: neutralizar(datos.nombre, 80),
    Negocio: neutralizar(datos.negocio, 120),
    Correo: neutralizar(datos.correo, 160),
    WhatsApp: neutralizar(datos.whatsapp, 20),
    Rubro: neutralizar(datos.rubro, 20),
    Ciudad: neutralizar(datos.ciudad, 80),
    'Clientes por dia': neutralizar(datos.clientes, 40),
    'Que le interesa': neutralizar(datos.interes, 60),
    'Plan que mira': neutralizar(datos.plan, 20),
    Mensaje: neutralizar(datos.mensaje, 2000),
    'Pagina de origen': neutralizar(datos.origen.pagina, 120),
    Idioma: neutralizar(datos.origen.idioma, 4),
  };

  // Doble red: si algún día alguien agrega un campo dinámico aquí arriba, este
  // barrido impide que un nombre reservado se cuele.
  for (const reservado of CAMPOS_RESERVADOS_FORMSUBMIT) {
    if (reservado !== '_subject' && reservado !== '_template' && reservado !== '_captcha') {
      delete cuerpo[reservado];
    }
  }

  return cuerpo;
}
