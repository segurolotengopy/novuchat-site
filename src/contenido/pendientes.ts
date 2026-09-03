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

export const PENDIENTES: Pendiente[] = [];

/** Verdadero si no queda ningún dato sin confirmar. */
export const listoParaProduccion = PENDIENTES.length === 0;
