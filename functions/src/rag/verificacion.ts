import type { Recuperado } from './tipos.js';

/**
 * Verificación de la respuesta del modelo.
 *
 * El umbral de similitud decide **si** se responde. Este módulo decide si lo
 * que el modelo devolvió se puede publicar. Son tres controles, y cada uno
 * ataca una forma concreta de que un asistente comercial haga daño:
 *
 *  1. **Citas.** El modelo debe terminar su respuesta con los identificadores de
 *     los fragmentos que usó. Si no cita ninguno válido, no se apoyó en el
 *     corpus: se descarta.
 *  2. **Números.** Todo número que aparezca en la respuesta tiene que existir
 *     en los fragmentos recuperados. Es el control más importante de todos:
 *     impide que el asistente invente un precio, un plazo o un descuento.
 *  3. **Enlaces.** Solo se permiten direcciones que estén en los metadatos del
 *     corpus. Un modelo que inventa una URL manda al cliente a ninguna parte, o
 *     peor, a un dominio de otro.
 *
 * Cuando cualquiera falla, la Function responde el texto de derivación al
 * formulario. Nunca se «arregla» la respuesta: se descarta.
 */

export interface Veredicto {
  aceptada: boolean;
  /** Respuesta ya limpia de la línea de citas. */
  texto: string;
  /** Identificadores citados que sí existen entre lo recuperado. */
  citas: string[];
  motivo?: 'sin-citas' | 'numero-inventado' | 'enlace-inventado' | 'vacia';
  /** El dato concreto que falló, para la traza. Nunca se le muestra al cliente. */
  detalle?: string;
}

/** Línea final con las citas: `[[fuentes: precios-planes, faq-instalacion]]`. */
const RE_FUENTES = /\[\[\s*fuentes\s*:\s*([^\]]*)\]\]/i;

/**
 * Números del texto, normalizados.
 *
 * Se quitan los separadores de miles para que «1.000», «1,000» y «1000» sean el
 * mismo número: si no, el verificador rechazaría respuestas correctas solo
 * porque el modelo eligió otro formato. Los decimales se conservan.
 */
export function numerosDe(texto: string): string[] {
  const encontrados = texto.match(/\d[\d.,]*/g) ?? [];
  return encontrados.map((n) =>
    n
      // Separadores de miles: punto o coma seguidos de exactamente tres dígitos.
      .replace(/[.,](?=\d{3}\b)/g, '')
      .replace(/[.,]$/, ''),
  );
}

/** Direcciones absolutas y rutas del sitio que aparecen en un texto. */
export function enlacesDe(texto: string): string[] {
  return [
    ...(texto.match(/https?:\/\/[^\s)"']+/g) ?? []),
    ...(texto.match(/(?<![\w/])\/[a-z0-9-]+(?:\/[a-z0-9-]+)*/g) ?? []),
  ];
}

export function verificar(
  respuesta: string,
  recuperados: Recuperado[],
): Veredicto {
  const bruto = respuesta.trim();
  if (bruto.length === 0) {
    return { aceptada: false, texto: '', citas: [], motivo: 'vacia' };
  }

  // — 1. Citas —
  const coincidencia = bruto.match(RE_FUENTES);
  const texto = bruto.replace(RE_FUENTES, '').trim();
  const idsValidos = new Set(recuperados.map((r) => r.id));
  const citas = (coincidencia?.[1] ?? '')
    .split(',')
    .map((c) => c.trim())
    .filter((c) => idsValidos.has(c));

  if (citas.length === 0) {
    return { aceptada: false, texto, citas: [], motivo: 'sin-citas' };
  }

  // El material contra el que se contrasta es SOLO lo que se citó, no todo lo
  // recuperado: si el modelo dice apoyarse en un fragmento, el precio tiene que
  // salir de ese fragmento.
  const material = recuperados
    .filter((r) => citas.includes(r.id))
    .map((r) => r.texto)
    .join(' ');

  // — 2. Números —
  const permitidos = new Set(numerosDe(material));
  for (const numero of numerosDe(texto)) {
    if (!permitidos.has(numero)) {
      return {
        aceptada: false,
        texto,
        citas,
        motivo: 'numero-inventado',
        detalle: numero,
      };
    }
  }

  // — 3. Enlaces —
  const urlsPermitidas = new Set<string>();
  for (const r of recuperados.filter((x) => citas.includes(x.id))) {
    urlsPermitidas.add(r.url);
    for (const enlace of enlacesDe(r.texto)) urlsPermitidas.add(enlace);
  }

  for (const enlace of enlacesDe(texto)) {
    if (!urlsPermitidas.has(enlace)) {
      return {
        aceptada: false,
        texto,
        citas,
        motivo: 'enlace-inventado',
        detalle: enlace,
      };
    }
  }

  return { aceptada: true, texto, citas };
}
