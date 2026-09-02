#!/usr/bin/env node
/**
 * =============================================================================
 * SELLADO DE LA CSP — hashes de los scripts en línea que genera el build
 * =============================================================================
 *
 * EL PROBLEMA. Astro emite algunos `<script>` **en línea** que no se pueden
 * externalizar: el arranque de hidratación de cada isla (`client:idle`,
 * `client:visible`). Con `script-src 'self'` el navegador los bloquea, y el
 * fallo es mudo: el formulario y el asistente simplemente no reaccionan. Lo
 * detectó la prueba de humo, no el ojo.
 *
 * LA SOLUCIÓN, Y POR QUÉ ESTA. Las alternativas eran `'unsafe-inline'`
 * —inaceptable, anula la protección entera— o un `nonce`, que exige generar un
 * valor por respuesta y Firebase Hosting sirve archivos estáticos. Queda el
 * hash: se calcula el SHA-256 de cada script en línea del `dist/` y se escribe
 * en `script-src`. Autoriza exactamente esos scripts y ningún otro; si alguien
 * inyecta uno, sigue bloqueado.
 *
 * Se ejecuta **dentro de `pnpm build`**, de modo que los hashes no se pueden
 * quedar viejos por descuido. `--verificar` no escribe: falla si `firebase.json`
 * no coincide con el `dist/` actual, y eso corre en `pnpm verificar`.
 *
 * Uso:  node scripts/sellar-csp.mjs [--verificar]
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';

const RAIZ = resolve(new URL('..', import.meta.url).pathname);
const DIST = join(RAIZ, 'dist');
const CONFIG = join(RAIZ, 'firebase.json');

/** Orígenes fijos de `script-src`. Cada uno está justificado en docs/csp.md. */
const ORIGENES = [
  "'self'",
  'https://www.google.com',
  'https://www.gstatic.com',
  'https://www.googletagmanager.com',
  'https://connect.facebook.net',
];

function* archivosHtml(dir) {
  for (const entrada of readdirSync(dir)) {
    const completa = join(dir, entrada);
    if (statSync(completa).isDirectory()) yield* archivosHtml(completa);
    else if (extname(entrada) === '.html') yield completa;
  }
}

/** Contenido de cada `<script>` sin `src`. */
function scriptsEnLinea(html) {
  const encontrados = [];
  const patron = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
  let coincidencia;
  while ((coincidencia = patron.exec(html)) !== null) {
    const atributos = coincidencia[1] ?? '';
    // Los bloques de datos (JSON-LD) no los ejecuta el navegador y la CSP no
    // los mira: hashearlos solo agregaría ruido a la política.
    if (/type\s*=\s*["']application\/(ld\+json|json)["']/i.test(atributos)) continue;
    encontrados.push(coincidencia[2] ?? '');
  }
  return encontrados;
}

function hashDe(contenido) {
  return `'sha256-${createHash('sha256').update(contenido, 'utf8').digest('base64')}'`;
}

if (!existsSync(DIST)) {
  console.error('No existe dist/. Corra antes:  pnpm exec astro build');
  process.exit(1);
}

const hashes = new Set();
let totalScripts = 0;
for (const archivo of archivosHtml(DIST)) {
  for (const contenido of scriptsEnLinea(readFileSync(archivo, 'utf8'))) {
    totalScripts += 1;
    hashes.add(hashDe(contenido));
  }
}

const ordenados = [...hashes].sort();
const nuevoScriptSrc = `script-src ${[...ORIGENES.slice(0, 1), ...ordenados, ...ORIGENES.slice(1)].join(' ')}`;

const config = JSON.parse(readFileSync(CONFIG, 'utf8'));
const cabecera = config.hosting.headers
  .find((h) => h.source === '**')
  .headers.find((h) => h.key === 'Content-Security-Policy');

const anterior = cabecera.value;
const actualizado = anterior.replace(/script-src [^;]+/, nuevoScriptSrc);

const soloVerificar = process.argv.includes('--verificar');

if (anterior === actualizado) {
  console.log(
    `CSP sellada: ${ordenados.length} hash(es) para ${totalScripts} script(s) en línea.`,
  );
  process.exit(0);
}

if (soloVerificar) {
  console.error(
    '\nLa CSP de firebase.json no coincide con el dist/ actual.\n\n' +
      `  script-src esperado:\n    ${nuevoScriptSrc}\n\n` +
      'Regenérela con:  pnpm build\n\n' +
      'Si no se regenera, el navegador bloqueará los scripts de las islas en\n' +
      'silencio: el formulario y el asistente dejarán de responder.\n',
  );
  process.exit(1);
}

cabecera.value = actualizado;
writeFileSync(CONFIG, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
console.log(
  `CSP actualizada: ${ordenados.length} hash(es) para ${totalScripts} script(s) en línea.`,
);
