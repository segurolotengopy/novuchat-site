#!/usr/bin/env -S npx tsx
/**
 * =============================================================================
 * CALIBRACIÓN DEL UMBRAL DEL RAG
 * =============================================================================
 * Mide dos cosas sobre el índice real, con las incrustaciones de verdad:
 *
 *  1. **Recuperación.** De un conjunto de preguntas escritas como las escribiría
 *     un visitante, ¿aparece el fragmento correcto entre los cuatro primeros?
 *  2. **Separación.** ¿Qué tan lejos quedan las preguntas que el corpus NO
 *     puede responder? El umbral vive en esa distancia: por debajo no se llama
 *     al modelo.
 *
 * Un umbral elegido a ojo es una conjetura. Este script lo convierte en una
 * medición, y hay que volver a correrlo cuando cambie el contenido del sitio.
 *
 * Uso:  pnpm rag:calibrar
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const RAIZ = resolve(new URL('..', import.meta.url).pathname);
const INDICE = resolve(RAIZ, 'functions/src/rag/indice.json');
const MODELO = 'gemini-embedding-001';
const PROYECTO = 'novuchat-site';
const REGION = 'us-east1';
const DIMENSIONES = 768;

interface Indice {
  fragmentos: { id: string; titulo: string; texto: string; vector: number[] }[];
}

/**
 * Preguntas como las escribe alguien que entra al sitio: cortas, con errores,
 * sin las palabras exactas del contenido. Cada una con el fragmento que
 * debería recuperar.
 */
const DENTRO: { pregunta: string; espera: string }[] = [
  { pregunta: '¿cuánto cuesta?', espera: 'precios-resumen' },
  { pregunta: 'cual es el plan mas barato', espera: 'plan-impulso' },
  { pregunta: '¿qué incluye el plan del medio?', espera: 'plan-crecimiento' },
  { pregunta: 'quiero el plan mas completo, que trae', espera: 'plan-pro' },
  { pregunta: '¿tienen algo para restaurantes?', espera: 'rubro-gastronomia' },
  { pregunta: 'sirve para una peluqueria?', espera: 'rubro-salud-belleza' },
  { pregunta: 'tengo una tienda de ropa, me sirve', espera: 'rubro-comercio' },
  { pregunta: '¿cuánto tardan en instalarlo?', espera: 'instalacion-proceso' },
  { pregunta: 'que necesitan de mi para empezar', espera: 'instalacion-proceso' },
  { pregunta: '¿la instalación se paga aparte?', espera: 'instalacion-costo' },
  { pregunta: 'que pasa si me paso de los mensajes incluidos', espera: 'excedentes' },
  { pregunta: '¿cómo cuentan las conversaciones?', espera: 'como-se-cuenta' },
  { pregunta: 'el chat cobra de verdad con el qr?', espera: 'capacidad-toma-pedidos-y-cobra-por' },
  { pregunta: 'puede agendar en mi calendario', espera: 'capacidad-agenda-en-tu-calendario-real' },
  { pregunta: 'atiende de noche?', espera: 'capacidad-atiende-las-24-horas' },
  { pregunta: '¿qué hace si no sabe responder algo?', espera: 'capacidad-deriva-a-una-persona' },
  { pregunta: 'necesito un numero nuevo de whatsapp?', espera: 'faq-necesito-un-numero-nuevo-de' },
  { pregunta: 'y si el cliente manda un audio', espera: 'faq-que-pasa-si-el-cliente' },
  { pregunta: '¿el bot dice que es un robot?', espera: 'faq-el-asistente-dice-que-es' },
  { pregunta: 'que pasa si no pago un mes', espera: 'faq-que-pasa-si-no-pago' },
  { pregunta: 'donde guardan mis datos', espera: 'faq-donde-estan-mis-datos' },
  { pregunta: 'puedo cambiar de plan despues', espera: 'faq-puedo-cambiar-de-plan' },
  { pregunta: 'tengo dos locales, funciona igual', espera: 'faq-sirve-para-varias-sucursales' },
  { pregunta: 'los costos de whatsapp son aparte?', espera: 'faq-los-costos-de-whatsapp-y' },
  { pregunta: '¿cómo los contacto?', espera: 'contacto' },
  { pregunta: 'quiero una demostracion', espera: 'contacto' },
  { pregunta: 'en que se diferencian de un chatbot normal', espera: 'ia-contra-botones' },
  { pregunta: 'porque deberia contratarlos', espera: 'problema' },
];

/** Preguntas que el corpus NO puede responder. Deben quedar bajo el umbral. */
const FUERA = [
  '¿cuál es la capital de Francia?',
  'mi gato está enfermo, qué hago',
  'dame una receta de pique macho',
  '¿cuánto está el dólar hoy?',
  'necesito un abogado laboral',
  'cómo se cambia una llanta',
  '¿juega la selección el domingo?',
  'quiero comprar un departamento en Achumani',
  'traduce esto al aymara',
  'cuál es tu opinión sobre las elecciones',
];

function tokenDeAcceso(): string {
  return execFileSync('gcloud', ['auth', 'print-access-token'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

async function incrustarConsulta(texto: string, token: string): Promise<number[]> {
  const respuesta = await fetch(
    `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROYECTO}/locations/${REGION}/publishers/google/models/${MODELO}:predict`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Goog-User-Project': PROYECTO,
      },
      body: JSON.stringify({
        // RETRIEVAL_QUERY, no RETRIEVAL_DOCUMENT: son operaciones distintas y
        // usar el mismo tipo para las dos degrada la recuperación.
        instances: [{ task_type: 'RETRIEVAL_QUERY', content: texto }],
        parameters: { outputDimensionality: DIMENSIONES },
      }),
    },
  );
  if (!respuesta.ok) throw new Error(`${respuesta.status}: ${await respuesta.text()}`);
  const datos = (await respuesta.json()) as {
    predictions: { embeddings: { values: number[] } }[];
  };
  return datos.predictions[0]!.embeddings.values;
}

function coseno(a: number[], b: number[]): number {
  let p = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    p += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  return p / (Math.sqrt(na) * Math.sqrt(nb));
}

const indice = JSON.parse(readFileSync(INDICE, 'utf8')) as Indice;
const token = tokenDeAcceso();

function mejores(vector: number[], cuantos: number) {
  return indice.fragmentos
    .map((f) => ({ id: f.id, similitud: coseno(vector, f.vector) }))
    .sort((a, b) => b.similitud - a.similitud)
    .slice(0, cuantos);
}

console.log(`Calibrando contra ${indice.fragmentos.length} fragmentos…\n`);

let aciertos1 = 0;
let aciertos4 = 0;
const similitudesDentro: number[] = [];
const fallos: string[] = [];

for (const caso of DENTRO) {
  const vector = await incrustarConsulta(caso.pregunta, token);
  const top = mejores(vector, 4);
  similitudesDentro.push(top[0]!.similitud);

  if (top[0]!.id === caso.espera) aciertos1 += 1;
  if (top.some((t) => t.id === caso.espera)) aciertos4 += 1;
  else fallos.push(`  «${caso.pregunta}» → esperaba ${caso.espera}, trajo ${top.map((t) => t.id).join(', ')}`);
}

const similitudesFuera: number[] = [];
for (const pregunta of FUERA) {
  const vector = await incrustarConsulta(pregunta, token);
  similitudesFuera.push(mejores(vector, 1)[0]!.similitud);
}

const min = (n: number[]) => Math.min(...n);
const max = (n: number[]) => Math.max(...n);
const media = (n: number[]) => n.reduce((a, b) => a + b, 0) / n.length;

console.log(`Recuperación sobre ${DENTRO.length} preguntas del corpus:`);
console.log(`  acierto en el primer lugar : ${aciertos1}/${DENTRO.length} (${Math.round((aciertos1 / DENTRO.length) * 100)} %)`);
console.log(`  acierto entre los cuatro   : ${aciertos4}/${DENTRO.length} (${Math.round((aciertos4 / DENTRO.length) * 100)} %)`);
if (fallos.length > 0) {
  console.log('\n  no recuperó el fragmento esperado:');
  console.log(fallos.join('\n'));
}

console.log('\nSimilitud del primer resultado:');
console.log(`  preguntas DEL corpus  : min ${min(similitudesDentro).toFixed(3)} · media ${media(similitudesDentro).toFixed(3)} · max ${max(similitudesDentro).toFixed(3)}`);
console.log(`  preguntas AJENAS      : min ${min(similitudesFuera).toFixed(3)} · media ${media(similitudesFuera).toFixed(3)} · max ${max(similitudesFuera).toFixed(3)}`);

const piso = min(similitudesDentro);
const techo = max(similitudesFuera);

console.log('\nUmbral:');
if (techo < piso) {
  const sugerido = Math.round(((techo + piso) / 2) * 100) / 100;
  console.log(`  Los dos grupos NO se solapan (${techo.toFixed(3)} < ${piso.toFixed(3)}).`);
  console.log(`  Sugerido: ${sugerido} — deja pasar todo lo del corpus y corta todo lo ajeno.`);
} else {
  console.log(`  Los grupos SE SOLAPAN: la peor pregunta del corpus (${piso.toFixed(3)}) queda por`);
  console.log(`  debajo de la mejor pregunta ajena (${techo.toFixed(3)}). No hay un umbral que`);
  console.log('  acierte en los dos lados; conviene priorizar no inventar y aceptar');
  console.log(`  algún "no lo sé" de más. Sugerido: ${(Math.round(techo * 100) / 100 + 0.01).toFixed(2)}`);
}
