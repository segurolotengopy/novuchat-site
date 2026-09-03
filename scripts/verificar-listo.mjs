#!/usr/bin/env node
/**
 * =============================================================================
 * COMPUERTA DE PRODUCCIÓN — datos pendientes de confirmación
 * =============================================================================
 * La prohibición 8 de `CLAUDE.md` impide publicar datos comerciales o legales
 * sin confirmar. Esa comprobación NO puede vivir en `pnpm verificar`, porque
 * entonces nadie podría trabajar mientras falte un dato; vive aquí, y el
 * despliegue a producción la ejecuta.
 *
 * Uso:  pnpm listo
 * Sale con 1 y lista los pendientes si queda alguno sin resolver.
 */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const RAIZ = resolve(new URL('..', import.meta.url).pathname);
const ARCHIVO = join(RAIZ, 'src/contenido/pendientes.ts');

const fuente = readFileSync(ARCHIVO, 'utf8');
// Acepta las dos formas: la lista vacía en una línea (`= [];`) y la lista con
// entradas repartidas en varias. Antes solo reconocía la segunda y, al quedar
// vacía, el script se caía diciendo que no podía leer el archivo.
const bloque =
  fuente.match(/export const PENDIENTES:\s*Pendiente\[\]\s*=\s*\[([\s\S]*?)\n\];/) ??
  fuente.match(/export const PENDIENTES:\s*Pendiente\[\]\s*=\s*\[(\s*)\];/);

if (!bloque) {
  console.error(
    'No se pudo leer PENDIENTES en src/contenido/pendientes.ts. ' +
      '¿Cambió la forma del archivo? Actualice scripts/verificar-listo.mjs.',
  );
  process.exit(2);
}

const entradas = [...bloque[1].matchAll(/id:\s*'([^']+)'[\s\S]*?descripcion:\s*\n?\s*'([^']*)'[\s\S]*?responsable:\s*'([^']*)'[\s\S]*?afecta:\s*\n?\s*'([^']*)'/g)];

if (entradas.length === 0) {
  console.log('Listo para producción: no quedan datos sin confirmar.');
  process.exit(0);
}

console.error(`\nNO listo para producción: ${entradas.length} dato(s) sin confirmar.\n`);
for (const [, id, descripcion, responsable, afecta] of entradas) {
  console.error(`  [${id}] ${descripcion}`);
  console.error(`    responsable: ${responsable}`);
  console.error(`    afecta: ${afecta}\n`);
}
console.error(
  'Resuelva cada uno en src/contenido/pendientes.ts (complete el valor y borre\n' +
    'la entrada de PENDIENTES) antes de desplegar a producción.\n',
);
process.exit(1);
