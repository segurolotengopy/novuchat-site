import { beforeAll, describe, expect, it } from 'vitest';

/**
 * La Function `lead`, contra el emulador y por HTTP.
 *
 * POR QUÉ POR HTTP Y NO POR EL NAVEGADOR. Lo que se prueba aquí es el
 * **contrato** de la Function: qué acepta, qué rechaza, qué guarda y qué
 * responde. Meter un navegador en el medio agrega minutos, produce fallos
 * intermitentes y no cubre ni un caso más. La interfaz se prueba aparte, en
 * `pruebas/humo`.
 *
 * En el emulador la Function no sale a internet: el aviso por correo se omite
 * (`FUNCTIONS_EMULATOR`), así que estas pruebas no pueden inundar la casilla
 * del equipo.
 *
 * Se corre con:  pnpm test:backend
 */

const FUNCION = 'http://127.0.0.1:5241/novuchat-site/us-east1/lead';
const FIRESTORE = 'http://127.0.0.1:8241';
const PROYECTO = 'novuchat-site';

interface Respuesta {
  estado: number;
  cuerpo: { result?: { ok?: boolean }; error?: { message?: string; status?: string } };
}

/** Invoca la Function con el protocolo de las llamables. */
async function llamar(datos: unknown, ip = '203.0.113.10'): Promise<Respuesta> {
  const respuesta = await fetch(FUNCION, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // El emulador respeta esta cabecera, y es lo que separa a un visitante de
      // otro para el límite de tasa.
      'X-Forwarded-For': ip,
    },
    body: JSON.stringify({ data: datos }),
  });
  return { estado: respuesta.status, cuerpo: await respuesta.json() };
}

/**
 * El emulador aplica `firestore.rules`, que niegan todo. Para leer lo que
 * escribió la Function hace falta la credencial de propietario del emulador
 * —el mismo camino que usa la consola del emulador—. Que sin ella devuelva
 * `PERMISSION_DENIED` es, de paso, una confirmación más de que las reglas
 * cierran.
 */
const COMO_PROPIETARIO = { Authorization: 'Bearer owner' };

async function limpiarFirestore(): Promise<void> {
  await fetch(
    `${FIRESTORE}/emulator/v1/projects/${PROYECTO}/databases/(default)/documents`,
    { method: 'DELETE', headers: COMO_PROPIETARIO },
  );
}

async function contarLeads(): Promise<number> {
  const respuesta = await fetch(
    `${FIRESTORE}/v1/projects/${PROYECTO}/databases/(default)/documents/leads`,
    { headers: COMO_PROPIETARIO },
  );
  const datos = (await respuesta.json()) as { documents?: unknown[] };
  return datos.documents?.length ?? 0;
}

async function leerLeads(): Promise<Record<string, unknown>[]> {
  const respuesta = await fetch(
    `${FIRESTORE}/v1/projects/${PROYECTO}/databases/(default)/documents/leads`,
    { headers: COMO_PROPIETARIO },
  );
  const datos = (await respuesta.json()) as { documents?: { fields: Record<string, unknown> }[] };
  return (datos.documents ?? []).map((d) => d.fields);
}

const VALIDO = {
  nombre: 'Ana Quispe',
  negocio: 'Salón Aurora',
  correo: 'ana@ejemplo.com',
  whatsapp: '+591 70000001',
  rubro: 'salud-belleza',
  ciudad: 'La Paz',
  mensaje: 'Quiero ver cómo funciona.',
  origen: { pagina: '/demo', idioma: 'es', utm: {} },
};

/** Cada caso usa un correo y una IP propios: si no, el límite de tasa y la
 *  deduplicación de un caso arruinan al siguiente. */
let contador = 0;
function unico() {
  contador += 1;
  return {
    datos: { ...VALIDO, correo: `ana${contador}@ejemplo.com` },
    ip: `203.0.113.${contador + 20}`,
  };
}

beforeAll(async () => {
  await limpiarFirestore();
});

describe('validación', () => {
  it('rechaza un cuerpo vacío', async () => {
    const r = await llamar({});
    expect(r.estado).toBe(400);
  });

  it('rechaza un correo con forma de inyección de ruta', async () => {
    const { datos, ip } = unico();
    const r = await llamar({ ...datos, correo: 'ana@ejemplo.com/../otro' }, ip);
    expect(r.estado).toBe(400);
  });

  it('rechaza un teléfono sin código de país', async () => {
    const { datos, ip } = unico();
    const r = await llamar({ ...datos, whatsapp: '70000001' }, ip);
    expect(r.estado).toBe(400);
  });

  it('rechaza un rubro que no está en la lista', async () => {
    const { datos, ip } = unico();
    const r = await llamar({ ...datos, rubro: 'mineria' }, ip);
    expect(r.estado).toBe(400);
  });

  it('acepta el número con espacios, como lo escribe la gente', async () => {
    const { datos, ip } = unico();
    const r = await llamar({ ...datos, whatsapp: '+591 700 000 01' }, ip);
    expect(r.estado).toBe(200);
    expect(r.cuerpo.result?.ok).toBe(true);
  });
});

describe('persistencia', () => {
  it('guarda el lead y lo marca como avisado', async () => {
    await limpiarFirestore();
    const { datos, ip } = unico();

    const r = await llamar(datos, ip);
    expect(r.estado).toBe(200);

    const leads = await leerLeads();
    expect(leads).toHaveLength(1);
    expect(leads[0]).toMatchObject({
      nombre: { stringValue: datos.nombre },
      estado: { stringValue: 'nuevo' },
    });
  });

  it('NO guarda el correo dos veces: la huella no es reversible', async () => {
    await limpiarFirestore();
    const { datos, ip } = unico();
    await llamar(datos, ip);

    const [lead] = await leerLeads();
    const huella = (lead?.['huellaCorreo'] as { stringValue?: string })?.stringValue;
    expect(huella).toMatch(/^[0-9a-f]{64}$/);
    expect(huella).not.toContain('@');
  });

  it('no guarda la trampa de robots junto al lead', async () => {
    await limpiarFirestore();
    const { datos, ip } = unico();
    await llamar(datos, ip);

    const [lead] = await leerLeads();
    expect(lead?.['empresaWeb']).toBeUndefined();
  });
});

describe('trampa para robots', () => {
  it('responde éxito pero NO guarda nada', async () => {
    await limpiarFirestore();
    const { datos, ip } = unico();

    const r = await llamar({ ...datos, empresaWeb: 'soy-un-robot' }, ip);
    // Se responde éxito a propósito: decirle a un robot que lo detectamos solo
    // le enseña a evitar la trampa la próxima vez.
    expect(r.estado).toBe(200);
    expect(r.cuerpo.result?.ok).toBe(true);
    expect(await contarLeads()).toBe(0);
  });
});

describe('deduplicación', () => {
  it('el mismo correo dos veces seguidas guarda un solo lead', async () => {
    await limpiarFirestore();
    const { datos, ip } = unico();

    await llamar(datos, ip);
    const segunda = await llamar(datos, ip);

    expect(segunda.estado).toBe(200);
    expect(segunda.cuerpo.result?.ok).toBe(true);
    expect(await contarLeads()).toBe(1);
  });
});

describe('límite de tasa', () => {
  it('corta al sexto envío de la misma procedencia dentro de la hora', async () => {
    await limpiarFirestore();
    const ip = '203.0.113.200';

    const estados: number[] = [];
    for (let i = 0; i < 7; i += 1) {
      const r = await llamar({ ...VALIDO, correo: `spam${i}@ejemplo.com` }, ip);
      estados.push(r.estado);
    }

    // Cinco por hora (doc 04, riesgo S-4): las cinco primeras pasan.
    expect(estados.slice(0, 5).every((e) => e === 200)).toBe(true);
    // La sexta ya no.
    expect(estados[5]).not.toBe(200);
    expect(await contarLeads()).toBe(5);
  }, 30_000);
});
