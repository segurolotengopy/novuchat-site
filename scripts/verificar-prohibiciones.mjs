#!/usr/bin/env node
/**
 * =============================================================================
 * VERIFICADOR DE PROHIBICIONES — novuchat.site
 * =============================================================================
 * Comprueba, sobre el código fuente y el contenido, lo que `CLAUDE.md` prohíbe
 * y que ni ESLint ni Stylelint pueden ver (plantillas .astro, textos, marcas de
 * confirmación pendiente). Falla con código 1 si encuentra algo.
 *
 * Controles:
 *   1. Renderizado de HTML crudo: innerHTML, outerHTML, dangerouslySetInnerHTML,
 *      set:html, eval, new Function.        → prohibición 2
 *   2. Dominios externos en el código: CDN de scripts, estilos o fuentes.
 *                                            → prohibición 3
 *   3. Marcas `<!-- CONFIRMAR -->` en el contenido. → prohibición 8
 *   4. Voseo en los textos públicos.               → CLAUDE.md, idioma y estilo
 *   5. `PUBLIC_URL_CONSOLA` fuera de la lista blanca. → riesgo S-13
 *
 * Uso:  pnpm prohibiciones
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative, resolve } from 'node:path';

const RAIZ = resolve(new URL('..', import.meta.url).pathname);

const DIRECTORIOS_IGNORADOS = new Set([
  'node_modules', 'dist', '.astro', '.git', 'material-previo',
  '.security-reports', '.deploy-log', 'lib', 'coverage', 'test-results',
  'playwright-report',
]);
// La exportación del prototipo es referencia visual, no código de producción.
const RUTAS_IGNORADAS = [
  'docs/diseno/',
  // Las propias herramientas nombran los patrones prohibidos para poder buscarlos.
  'eslint.config.js',
  'scripts/verificar-prohibiciones.mjs',
  // Documenta la marca `<!-- CONFIRMAR -->` para explicar por qué no se usa.
  'src/contenido/pendientes.ts',
];

/** Código nuestro que sí se renderiza o se despliega. */
const esCodigoDelSitio = (ruta) =>
  ruta.startsWith('src/') || ruta.startsWith('functions/') || ruta.startsWith('pruebas/');
const EXTENSIONES = new Set(['.astro', '.ts', '.tsx', '.js', '.mjs', '.jsx', '.css', '.md']);

// `set:html` solo se permite para el JSON-LD, que se genera en build a partir
// de objetos del repositorio y se serializa con JSON.stringify.
const EXCEPCIONES_SET_HTML = new Set([
  // JSON-LD: se construye con objetos del repositorio y se serializa con
  // JSON.stringify. No hay dato de usuario en el camino.
  'src/components/DatosEstructurados.astro',
  // Script anti-destello del tema: literal del repositorio, autorizado en la
  // CSP por hash SHA-256 (nunca por 'unsafe-inline'). Ver docs/csp.md.
  'src/layouts/Base.astro',
]);

// Espejo EXACTO de los orígenes de la CSP de `firebase.json`, más los dominios
// propios. Se listan hosts completos, no dominios padre: `googleapis.com` a
// secas dejaría pasar `fonts.googleapis.com`, que la CSP sí bloquea.
const DOMINIOS_PERMITIDOS = [
  'novuchat.site',
  'www.novuchat.site',
  'novuchat-site.web.app',
  'novuchat-admin-prod.web.app',
  'consola.novuchat.site',
  'us-east1-novuchat-site.cloudfunctions.net',
  'firebaseappcheck.googleapis.com',
  'content-firebaseappcheck.googleapis.com',
  'www.google.com',
  'www.gstatic.com',
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'analytics.google.com',
  'region1.google-analytics.com',
  'connect.facebook.net',
  'www.facebook.com',
];

const LISTA_BLANCA_CONSOLA = [
  'https://consola.novuchat.site',
  'https://novuchat-admin-prod.web.app',
];

const REGLAS = [
  {
    id: 'render-crudo',
    prohibicion: 'CLAUDE.md 2 — nunca innerHTML/set:html/eval con datos no literales',
    patron: /\b(innerHTML|outerHTML|dangerouslySetInnerHTML|insertAdjacentHTML)\b|\bnew\s+Function\s*\(|(?<![.\w])eval\s*\(/g,
    aplicaA: (ruta) => esCodigoDelSitio(ruta) && ['.astro', '.ts', '.tsx', '.js', '.jsx'].includes(extname(ruta)),
  },
  {
    id: 'set-html',
    prohibicion: 'CLAUDE.md 2 — `set:html` solo para el JSON-LD generado en build',
    patron: /set:html/g,
    aplicaA: (ruta) => extname(ruta) === '.astro' && !EXCEPCIONES_SET_HTML.has(ruta),
  },
  {
    id: 'voseo',
    prohibicion: 'CLAUDE.md — español de Bolivia, tuteo sin voseo',
    patron: /\b(mirá|revisá|tocá|volvé|dejá|entrá|escribí|elegí|podés|tenés|querés|sabés|hacé|vos)\b/gi,
    aplicaA: (ruta) => ruta.startsWith('src/'),
  },
  {
    id: 'confirmar',
    prohibicion: 'CLAUDE.md 8 — no publicar datos sin confirmar',
    patron: /<!--\s*CONFIRMAR\s*-->/g,
    aplicaA: (ruta) => ruta.startsWith('src/'),
  },
];

/** Recorre el árbol devolviendo rutas relativas a la raíz del repositorio. */
function* recorrer(dir) {
  for (const entrada of readdirSync(dir)) {
    if (DIRECTORIOS_IGNORADOS.has(entrada) || entrada.startsWith('.')) continue;
    const completa = join(dir, entrada);
    const rel = relative(RAIZ, completa);
    if (RUTAS_IGNORADAS.some((p) => rel.startsWith(p))) continue;
    if (statSync(completa).isDirectory()) yield* recorrer(completa);
    else if (EXTENSIONES.has(extname(entrada))) yield rel;
  }
}

const hallazgos = [];

for (const rel of recorrer(RAIZ)) {
  const contenido = readFileSync(join(RAIZ, rel), 'utf8');
  const lineas = contenido.split('\n');

  for (const regla of REGLAS) {
    if (!regla.aplicaA(rel)) continue;
    lineas.forEach((linea, i) => {
      if (linea.includes('prohibiciones:permitido')) return;
      const patron = new RegExp(regla.patron.source, regla.patron.flags);
      if (patron.test(linea)) {
        hallazgos.push({ rel, linea: i + 1, regla: regla.id, prohibicion: regla.prohibicion, texto: linea.trim().slice(0, 120) });
      }
    });
  }

  // Dominios externos: solo importan los que CARGAN un recurso (`src=`,
  // `<link href=`, `url(...)` de CSS, `import` de un módulo remoto). Un enlace
  // de navegación a un sitio externo —una cita, una fuente— no lo bloquea la
  // CSP y no es un hallazgo.
  if (['.astro', '.ts', '.tsx', '.js', '.jsx', '.css'].includes(extname(rel))) {
    lineas.forEach((linea, i) => {
      const cargas =
        linea.match(/(?:\bsrc\s*=\s*["'{`]|url\(\s*["']?|\bfrom\s+["']|<link[^>]+href\s*=\s*["'])(https?:\/\/[\w.-]+)/g) ?? [];
      for (const bruto of cargas) {
        const encontrado = bruto.match(/https?:\/\/[\w.-]+/);
        if (!encontrado) continue;
        const url = encontrado[0];
        const host = url.replace(/^https?:\/\//, '');
        if (host === 'localhost' || host.startsWith('127.0.0.1')) continue;
        if (DOMINIOS_PERMITIDOS.includes(host)) continue;
        hallazgos.push({
          rel, linea: i + 1, regla: 'dominio-externo',
          prohibicion: 'CLAUDE.md 3 — sin CDN ni recursos de dominios externos',
          texto: url,
        });
      }
    });
  }
}

// Riesgo S-13: el enlace a la consola solo puede apuntar a la lista blanca.
const rutaEnv = join(RAIZ, '.env');
if (existsSync(rutaEnv)) {
  const linea = readFileSync(rutaEnv, 'utf8')
    .split('\n')
    .find((l) => l.startsWith('PUBLIC_URL_CONSOLA='));
  const valor = linea?.slice('PUBLIC_URL_CONSOLA='.length).trim();
  if (valor && !LISTA_BLANCA_CONSOLA.includes(valor)) {
    hallazgos.push({
      rel: '.env', linea: 0, regla: 'url-consola',
      prohibicion: `doc 04 S-13 — PUBLIC_URL_CONSOLA fuera de la lista blanca (${LISTA_BLANCA_CONSOLA.join(', ')})`,
      texto: valor,
    });
  }
}

if (hallazgos.length === 0) {
  console.log('Prohibiciones: sin hallazgos.');
  process.exit(0);
}

console.error(`\nProhibiciones: ${hallazgos.length} hallazgo(s).\n`);
for (const h of hallazgos) {
  console.error(`  ${h.rel}:${h.linea}  [${h.regla}]`);
  console.error(`    ${h.prohibicion}`);
  console.error(`    ${h.texto}\n`);
}
process.exit(1);
