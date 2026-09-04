#!/usr/bin/env -S npx tsx
/**
 * =============================================================================
 * ¿EL ÍNDICE DEL ASISTENTE SIGUE EN SINTONÍA CON EL CONTENIDO DEL SITIO?
 * =============================================================================
 * El corpus se DERIVA de `src/contenido/`. Si alguien cambia un precio y no
 * reindexa, el sitio muestra una cifra y el asistente cita otra —con la
 * confianza de estar citando la fuente—. `pnpm verificar` no lo detecta, porque
 * el índice es un JSON válido y las pruebas siguen pasando.
 *
 * Esto compara, sin llamar a Vertex ni gastar un céntimo, los fragmentos que
 * `construir-corpus` produce HOY contra los que quedaron guardados en el índice.
 *
 * Uso:  pnpm rag:cotejar
 * Sale con 1 si hay diferencias: entonces toca `pnpm rag:indexar`.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { construirCorpus } from './construir-corpus';
import type { Indice } from '../functions/src/rag/tipos';

const RAIZ = resolve(new URL('..', import.meta.url).pathname);

const indice = JSON.parse(
  readFileSync(resolve(RAIZ, 'functions/src/rag/indice.json'), 'utf8'),
) as Indice;

const ahora = construirCorpus();
const guardado = indice.fragmentos;

const porId = <T extends { id: string }>(xs: T[]) => new Map(xs.map((x) => [x.id, x]));
const mapaAhora = porId(ahora);
const mapaGuardado = porId(guardado);

const nuevos = ahora.filter((f) => !mapaGuardado.has(f.id)).map((f) => f.id);
const sobran = guardado.filter((f) => !mapaAhora.has(f.id)).map((f) => f.id);
const cambiados = ahora
  .filter((f) => {
    const g = mapaGuardado.get(f.id);
    return g && g.texto.trim() !== f.texto.trim();
  })
  .map((f) => f.id);

const problemas = nuevos.length + sobran.length + cambiados.length;

process.stdout.write(
  `Corpus: ${ahora.length} fragmentos · Índice: ${guardado.length}\n`,
);

if (problemas === 0) {
  process.stdout.write('El índice está al día: mismos fragmentos y mismo texto.\n');
  process.exit(0);
}

if (nuevos.length) process.stdout.write(`\nEn el contenido pero NO en el índice (${nuevos.length}):\n  ${nuevos.join('\n  ')}\n`);
if (sobran.length) process.stdout.write(`\nEn el índice pero YA NO en el contenido (${sobran.length}):\n  ${sobran.join('\n  ')}\n`);
if (cambiados.length) process.stdout.write(`\nMismo id, TEXTO DISTINTO (${cambiados.length}):\n  ${cambiados.join('\n  ')}\n`);

process.stdout.write(
  '\nEl asistente responde con el índice, no con el sitio: hasta reindexar,\n' +
    'puede citar datos que la página ya no muestra.\n' +
    'Ejecute `pnpm rag:indexar` y luego `pnpm rag:calibrar`.\n',
);
process.exit(1);
