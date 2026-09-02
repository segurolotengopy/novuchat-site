#!/usr/bin/env node
/**
 * =============================================================================
 * SERVIDOR DE PRUEBA DE LAS CABECERAS DE HOSTING
 * =============================================================================
 *
 * EL PROBLEMA. La política de seguridad de contenido vive en `firebase.json` y
 * la aplica **Firebase Hosting**. `astro dev` y `astro preview` no la ponen. O
 * sea que una violación de la CSP —App Check que no carga, la llamada a la
 * Function bloqueada, el script anti-destello rechazado— **no se ve localmente
 * y aparece recién en producción**, y casi siempre en silencio.
 *
 * QUÉ HACE ESTE SCRIPT. Sirve `dist/` aplicando **las cabeceras leídas de
 * `firebase.json`**, no una copia. Leer del archivo real es lo que evita que la
 * prueba y la producción se separen.
 *
 * Uso:
 *   pnpm build && pnpm csp
 *   # abrir http://127.0.0.1:5245 y mirar la consola del navegador:
 *   # cualquier «Refused to ...» es un defecto, no un aviso.
 *
 * Adaptado de ~/NovuChat/admin/scripts/probar-csp.mjs (consola NovuChat).
 * Diferencia: aquí el sitio es estático con `cleanUrls`, no una SPA; por eso
 * `/precios` se resuelve a `dist/precios.html` y lo que no existe da 404 real.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const RAIZ = resolve(new URL('..', import.meta.url).pathname);
const DIST = join(RAIZ, 'dist');
const PUERTO = Number(process.env.PUERTO_CSP ?? 5245);

if (!existsSync(DIST)) {
  console.error(`No existe ${DIST}. Corra antes:  pnpm build`);
  process.exit(1);
}

// Las cabeceras salen del archivo REAL, no de una copia.
const config = JSON.parse(readFileSync(join(RAIZ, 'firebase.json'), 'utf8'));
const bloqueGeneral = config.hosting.headers.find((h) => h.source === '**');
const CABECERAS = Object.fromEntries(
  bloqueGeneral.headers
    // HSTS molesta en localhost —el navegador recuerda el origen como HTTPS— y
    // no tiene nada que ver con lo que se quiere probar acá.
    .filter((h) => h.key !== 'Strict-Transport-Security')
    .map((h) => [h.key, h.value]),
);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

/** Resuelve una ruta al archivo de `dist/`, respetando `cleanUrls`. */
function resolverDestino(ruta) {
  const candidato = normalize(join(DIST, ruta));
  // `normalize` + comprobación de prefijo: sin esto, `/../../etc/passwd`
  // saldría del directorio servido. Es un script de prueba, pero un script de
  // prueba que escucha en un puerto igual se puede usar contra uno.
  if (!candidato.startsWith(DIST)) return null;
  if (existsSync(candidato) && extname(candidato) !== '') return candidato;
  for (const intento of [`${candidato}.html`, join(candidato, 'index.html')]) {
    if (existsSync(intento)) return intento;
  }
  return null;
}

createServer(async (peticion, respuesta) => {
  const ruta = new URL(peticion.url ?? '/', 'http://x').pathname;
  const destino = resolverDestino(ruta === '/' ? '/index.html' : ruta);

  if (!destino) {
    const err404 = join(DIST, '404.html');
    if (existsSync(err404)) {
      respuesta.writeHead(404, { ...CABECERAS, 'Content-Type': TIPOS['.html'] });
      respuesta.end(await readFile(err404));
      return;
    }
    respuesta.writeHead(404, CABECERAS).end('no encontrado');
    return;
  }

  try {
    const cuerpo = await readFile(destino);
    respuesta.writeHead(200, {
      ...CABECERAS,
      'Content-Type': TIPOS[extname(destino)] ?? 'application/octet-stream',
    });
    respuesta.end(cuerpo);
  } catch {
    respuesta.writeHead(500, CABECERAS).end('error al leer el archivo');
  }
}).listen(PUERTO, '127.0.0.1', () => {
  console.log('\nSirviendo dist/ con las cabeceras reales de firebase.json');
  console.log(`  http://127.0.0.1:${PUERTO}\n`);
  console.log('Cabeceras aplicadas:');
  for (const [k, v] of Object.entries(CABECERAS)) {
    console.log(`  ${k}: ${v.length > 90 ? `${v.slice(0, 90)}…` : v}`);
  }
  console.log('\nEn la consola del navegador, cualquier «Refused to» es una violación.');
});
