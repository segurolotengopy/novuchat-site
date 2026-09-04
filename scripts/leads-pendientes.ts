#!/usr/bin/env -S npx tsx
/**
 * =============================================================================
 * LEADS GUARDADOS QUE NADIE HA AVISADO
 * =============================================================================
 * Mientras `FORMSUBMIT_ALIAS` no esté configurado, la Function guarda el lead en
 * Firestore con `avisado: false` y NO envía correo. Nada se pierde, pero nadie
 * se entera: si llega tráfico antes de cerrar esa configuración, los leads se
 * acumulan en silencio.
 *
 * Esto es la contrapartida: permite recuperarlos sin consola y sin correo.
 *
 * PRIVACIDAD. Por defecto NO imprime datos personales, solo cuántos hay y
 * cuándo llegaron. Para ver el contacto hace falta `--detalle`, y entonces
 * avisa de lo que se está mostrando. Los leads son datos de personas reales:
 * no los pegue en un chat, un ticket ni un repositorio.
 *
 * Uso:  pnpm leads:pendientes            (recuento y fechas)
 *       pnpm leads:pendientes --detalle  (incluye el contacto)
 */
import { execFileSync } from 'node:child_process';

const PROYECTO = 'novuchat-site';
const DETALLE = process.argv.includes('--detalle');

const token = execFileSync('gcloud', ['auth', 'print-access-token'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'ignore'],
}).trim();

interface Valor { stringValue?: string; booleanValue?: boolean; timestampValue?: string }
interface Documento { name: string; fields?: Record<string, Valor>; createTime?: string }

const respuesta = await fetch(
  `https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents/leads?pageSize=300`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Goog-User-Project': PROYECTO,
    },
  },
);

if (!respuesta.ok) {
  process.stderr.write(`No se pudo leer Firestore: ${respuesta.status}\n${(await respuesta.text()).slice(0, 300)}\n`);
  process.exit(2);
}

const { documents = [] } = (await respuesta.json()) as { documents?: Documento[] };

const pendientes = documents.filter((d) => d.fields?.avisado?.booleanValue !== true);

process.stdout.write(
  `Leads en total: ${documents.length} · sin avisar: ${pendientes.length}\n`,
);

if (pendientes.length === 0) {
  process.stdout.write('Nada pendiente.\n');
  process.exit(0);
}

if (!DETALLE) {
  process.stdout.write('\nid                              recibido\n');
  for (const d of pendientes) {
    const id = d.name.split('/').pop() ?? '?';
    process.stdout.write(`${id.padEnd(30)}  ${d.createTime ?? '—'}\n`);
  }
  process.stdout.write(
    '\nSin datos personales. Use --detalle para ver el contacto.\n' +
      'Lo de fondo se arregla configurando FORMSUBMIT_ALIAS en Secret Manager.\n',
  );
  process.exit(0);
}

process.stdout.write('\n*** DATOS PERSONALES: no los copie fuera de esta terminal ***\n\n');
for (const d of pendientes) {
  const f = d.fields ?? {};
  const v = (k: string) => f[k]?.stringValue ?? '—';
  process.stdout.write(
    `${d.createTime ?? '—'}\n  nombre:   ${v('nombre')}\n  contacto: ${v('correo')} · ${v('telefono')}\n  mensaje:  ${v('mensaje').slice(0, 120)}\n\n`,
  );
}
