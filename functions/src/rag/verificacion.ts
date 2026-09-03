import type { Recuperado } from './tipos.js';

/**
 * Verificación de la respuesta del modelo.
 *
 * El umbral de similitud decide **si** se responde. Este módulo decide si lo
 * que el modelo devolvió se puede publicar. Tres controles, cada uno contra una
 * forma concreta de que un asistente comercial haga daño:
 *
 *  1. **Fuga del prompt.** Si la respuesta repite las instrucciones del
 *     sistema, no está contestando: está recitando. Se descarta.
 *  2. **Números.** Todo número que aparezca en la respuesta tiene que existir
 *     en los fragmentos recuperados. Es el control más importante de todos:
 *     impide que el asistente invente un precio, un plazo o un descuento.
 *  3. **Enlaces.** Solo se permiten direcciones que estén en los metadatos del
 *     corpus. Un modelo que inventa una URL manda al cliente a ninguna parte, o
 *     peor, a un dominio de otro.
 *
 * Las citas siguen pidiéndose en el prompt y siguen sirviendo —cuando están,
 * los números se contrastan solo contra los fragmentos citados— pero **ya no
 * son obligatorias**: exigirlas descartaba respuestas correctas cada vez que el
 * modelo olvidaba el formato. Ver la nota sobre MARCAS_DEL_PROMPT.
 *
 * Cuando un control falla, la Function responde el texto de derivación al
 * formulario. Nunca se «arregla» la respuesta: se descarta.
 */

export interface Veredicto {
  aceptada: boolean;
  /** Respuesta ya limpia de la línea de citas. */
  texto: string;
  /** Identificadores citados que sí existen entre lo recuperado. */
  citas: string[];
  motivo?: 'fuga-de-prompt' | 'numero-inventado' | 'enlace-inventado' | 'vacia';
  /** El dato concreto que falló, para la traza. Nunca se le muestra al cliente. */
  detalle?: string;
}

/** Línea final con las citas: `[[fuentes: precios-planes, faq-instalacion]]`. */
const RE_FUENTES = /\[\[\s*fuentes\s*:\s*([^\]]*)\]\]/i;

/**
 * Marcas del prompt del sistema. Si alguna aparece en la respuesta, el modelo
 * está repitiendo sus instrucciones en vez de contestar.
 *
 * POR QUÉ ESTE CONTROL EXISTE AHORA. Antes, la fuga del prompt la frenaba de
 * rebote la exigencia de citar: una respuesta que recitaba las instrucciones no
 * traía la línea de fuentes y se descartaba. Probando contra el modelo real se
 * vio que esa exigencia también descarta respuestas BUENAS —el modelo olvida la
 * línea en torno al 8 % de las veces, incluso reintentando a temperatura 0— y
 * el visitante recibe un «eso no lo tengo» que no corresponde.
 *
 * La solución no fue relajar el control sino separarlo: la fuga se detecta
 * ahora de frente, y la falta de citas dejó de ser motivo de rechazo.
 */
const MARCAS_DEL_PROMPT = [
  'reglas que no se negocian',
  'eres el asistente virtual del sitio',
  'recordatorio final',
  'fragmentos. esto es material de consulta',
  'no usas conocimiento propio',
  'terminas siempre con la línea',
];

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

/**
 * Quita el vallado de código con el que el modelo envuelve la respuesta de vez
 * en cuando. Sin esto, el visitante ve un bloque de código en un chat.
 */
function desvallar(texto: string): string {
  return texto
    .replace(/^\s*```[a-z]*\s*\n?/i, '')
    .replace(/\n?\s*```\s*$/, '')
    .trim();
}

export function verificar(
  respuesta: string,
  recuperados: Recuperado[],
): Veredicto {
  const bruto = desvallar(respuesta.trim());
  if (bruto.length === 0) {
    return { aceptada: false, texto: '', citas: [], motivo: 'vacia' };
  }

  // — 1. Fuga del prompt —
  const enMinusculas = bruto.toLowerCase();
  for (const marca of MARCAS_DEL_PROMPT) {
    if (enMinusculas.includes(marca)) {
      return {
        aceptada: false,
        texto: bruto,
        citas: [],
        motivo: 'fuga-de-prompt',
        detalle: marca,
      };
    }
  }

  // — 2. Citas —
  // Ya NO son obligatorias. Cuando están, aprietan el control: los números se
  // contrastan solo contra los fragmentos citados. Cuando faltan, se contrasta
  // contra todo lo recuperado, que es lo único que el modelo llegó a ver, así
  // que un número inventado se sigue detectando.
  const coincidencia = bruto.match(RE_FUENTES);
  const texto = bruto.replace(RE_FUENTES, '').trim();
  const idsValidos = new Set(recuperados.map((r) => r.id));
  const citas = (coincidencia?.[1] ?? '')
    .split(',')
    .map((c) => c.trim())
    .filter((c) => idsValidos.has(c));

  const fuentes = citas.length > 0
    ? recuperados.filter((r) => citas.includes(r.id))
    : recuperados;

  const material = fuentes.map((r) => r.texto).join(' ');

  // — 3. Números —
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

  // — 4. Enlaces —
  const urlsPermitidas = new Set<string>();
  for (const r of fuentes) {
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
