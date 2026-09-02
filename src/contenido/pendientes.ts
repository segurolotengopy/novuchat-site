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
 * Decisión de Andres (2026-09-02): el sitio **no menciona a AAB1**. NovuChat
 * facturará con NIT propio, en trámite. Hasta que exista, las páginas legales
 * muestran el aviso en vez de un dato falso.
 */
export const identidadLegal: { razonSocial: string; nit: string } | null = null;

export const PENDIENTES: Pendiente[] = [
  {
    id: 'identidad-legal',
    descripcion: 'Razón social y NIT de NovuChat (en trámite).',
    responsable: 'Andres',
    afecta: '/privacidad, /terminos, línea legal del pie, JSON-LD Organization',
  },
];

/** Verdadero si no queda ningún dato sin confirmar. */
export const listoParaProduccion = PENDIENTES.length === 0;
