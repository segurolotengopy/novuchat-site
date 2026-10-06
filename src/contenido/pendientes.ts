/**
 * DATOS PENDIENTES DE CONFIRMACIÓN
 * =============================================================================
 * La prohibición 8 de `CLAUDE.md` impide publicar datos comerciales o legales
 * sin confirmar. En vez de esparcir marcas `<!-- CONFIRMAR -->` por las páginas
 * —que romperían cada build— los pendientes viven aquí, tipados y en un solo
 * lugar.
 *
 * Efecto de un pendiente sin resolver:
 *   · `pnpm verificar` (desarrollo)  → sigue en verde.
 *   · `pnpm listo` (previo al despliegue a producción) → FALLA y los lista.
 *   · En la página, el bloque afectado se muestra con un aviso visible, nunca
 *     con un dato inventado.
 *
 * Para resolver uno: reemplace `null` por el valor real y borre la entrada de
 * `PENDIENTES`.
 */

export interface Pendiente {
  id: string;
  /** Qué falta, en una línea. */
  descripcion: string;
  /** Quién lo tiene que resolver. */
  responsable: string;
  /** Dónde se nota en el sitio. */
  afecta: string;
}

/**
 * Identidad legal que se declara en `/privacidad` y `/terminos`, y que Meta
 * exige para la verificación del negocio.
 *
 * **VALOR PROVISIONAL** (Andres, 2026-09-03): se usa AAB1 hasta que salga el
 * NIT propio de NovuChat, que está en trámite.
 *
 * DÓNDE APARECE Y DÓNDE NO. Solo en `/privacidad` y `/terminos`, porque una
 * política de privacidad sin responsable identificable no sirve de nada y Meta
 * la rechaza. **No** aparece en el pie de las demás páginas, ni en el JSON-LD,
 * ni en el corpus del asistente: la decisión del 2026-09-02 de no presentar
 * NovuChat como AAB1 en el material comercial sigue en pie, y su motivo
 * —NovuChat facturará como comercio y AAB1 es desarrollador— no cambia porque
 * el dato sea provisional.
 *
 * Al recibir el NIT propio, se reemplazan los dos valores y no hay nada más
 * que tocar.
 */
export const identidadLegal: { razonSocial: string; nit: string } | null = {
  razonSocial: 'AAB1 — Javier Andres Alberdi Baptista',
  nit: '2441214012',
};

export const PENDIENTES: Pendiente[] = [
  {
    id: 'plataforma-limites-y-bolsas',
    descripcion:
      'La plataforma todavía no aplica los topes 200 / 500 / 1.000 ni las bolsas 50 / 100 / 300 de la oferta con cuenta propia',
    responsable: 'Andres (sesión de la plataforma)',
    afecta: '/precios, portada, /terminos, FAQ y corpus del asistente',
  },
  {
    id: 'frase-mensajeria-meta',
    descripcion:
      'Elegir la frase sobre lo que cobra Meta: las fuentes discrepan (tarifas de la plataforma vigentes desde el 01/10/2026 frente a la página pública de Meta); se publicó una variante sin gratuidades ni cifras',
    responsable: 'Andres',
    afecta: 'precios.mensajeriaMeta: /precios, FAQ de costos y corpus',
  },
  {
    id: 'numeros-de-whatsapp',
    descripcion:
      'Confirmar el reparto: +591 70661250 donde se promete una persona y +591 76988663 (asistente de IA) en portada, FAQ y contacto',
    responsable: 'Andres',
    afecta: 'sitio.contacto, portada, /preguntas-frecuentes, /contacto, corpus',
  },
  {
    id: 'terminos-revision-legal',
    descripcion:
      'Revisar las secciones 2, 3, 4 y 5 de /terminos reescritas para la oferta con cuenta propia',
    responsable: 'Andres',
    afecta: '/terminos',
  },
  {
    id: 'privacidad-whatsapp-asistente',
    descripcion:
      'Decidir si /privacidad debe declarar los datos de quien escribe al WhatsApp del asistente de NovuChat, al que ahora enlaza el sitio',
    responsable: 'Andres',
    afecta: '/privacidad (sin cambios en este PR)',
  },
  {
    id: 'alcance-instalacion',
    descripcion:
      'Confirmar qué incluye la instalación con cuenta propia (conexión del número, acompañamiento en la verificación ante Meta) y si la opción excepcional cuesta USD 65',
    responsable: 'Andres',
    afecta: 'precios.instalacion, precios.excepcional, FAQ de instalación, /terminos 4',
  },
  {
    id: 'numero-actual-aplicacion',
    descripcion:
      'Confirmar con la plataforma que un número conectado al asistente deja de poder usarse desde la aplicación de WhatsApp del celular',
    responsable: 'Andres (sesión de la plataforma)',
    afecta: 'FAQ del número nuevo y del número actual',
  },
];

/** Verdadero si no queda ningún dato sin confirmar. */
export const listoParaProduccion = PENDIENTES.length === 0;
