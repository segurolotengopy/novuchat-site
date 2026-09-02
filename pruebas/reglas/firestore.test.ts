import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

/**
 * Reglas de Firestore — riesgo S-5 del doc 04.
 *
 * EL DETALLE QUE HACE QUE ESTAS PRUEBAS SIRVAN. Cada `assertFails` se ejecuta
 * **contra un documento que existe**, sembrado antes con las reglas
 * deshabilitadas. Un `permission-denied` sobre un documento inexistente pasa
 * igual y no prueba nada: la suite quedaría verde con las reglas abiertas de
 * par en par. Está documentado en `~/NovuChat/admin/LEEME.md` y es la razón de
 * ser del bloque `beforeEach` de abajo.
 *
 * Se corre con el emulador:  pnpm test:rules
 */

const PROYECTO = 'novuchat-site-reglas';

let entorno: RulesTestEnvironment;

beforeAll(async () => {
  entorno = await initializeTestEnvironment({
    projectId: PROYECTO,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8241,
    },
  });
});

afterAll(async () => {
  await entorno?.cleanup();
});

/** Siembra un documento en cada colección, con las reglas deshabilitadas. */
beforeEach(async () => {
  await entorno.clearFirestore();
  await entorno.withSecurityRulesDisabled(async (contexto) => {
    const db = contexto.firestore();
    await setDoc(doc(db, 'leads/lead-sembrado'), {
      nombre: 'Ana Quispe',
      correo: 'ana@ejemplo.com',
      estado: 'nuevo',
    });
    await setDoc(doc(db, 'conversacionesAsistente/sesion-sembrada'), {
      idioma: 'es',
    });
    await setDoc(doc(db, 'conversacionesAsistente/sesion-sembrada/turnos/turno-1'), {
      mensaje: '¿Cuánto cuesta?',
    });
    await setDoc(doc(db, 'limites/clave-sembrada'), { marcas: [1, 2, 3] });
    await setDoc(doc(db, 'coleccionInventada/documento'), { algo: true });
  });
});

const COLECCIONES = [
  { nombre: 'leads', ruta: 'leads/lead-sembrado' },
  { nombre: 'conversacionesAsistente', ruta: 'conversacionesAsistente/sesion-sembrada' },
  { nombre: 'turnos del asistente', ruta: 'conversacionesAsistente/sesion-sembrada/turnos/turno-1' },
  { nombre: 'limites', ruta: 'limites/clave-sembrada' },
  { nombre: 'una colección cualquiera', ruta: 'coleccionInventada/documento' },
];

describe('el cliente no puede tocar Firestore', () => {
  for (const { nombre, ruta } of COLECCIONES) {
    describe(nombre, () => {
      it('no puede leer el documento, que SÍ existe', async () => {
        const db = entorno.unauthenticatedContext().firestore();
        await assertFails(getDoc(doc(db, ruta)));
      });

      it('tampoco puede leerlo autenticado', async () => {
        // No hay usuarios en este proyecto, pero si mañana los hubiera, la
        // regla tiene que seguir negando: el sitio nunca lee de Firestore.
        const db = entorno.authenticatedContext('alguien').firestore();
        await assertFails(getDoc(doc(db, ruta)));
      });

      it('no puede escribir encima', async () => {
        const db = entorno.unauthenticatedContext().firestore();
        await assertFails(updateDoc(doc(db, ruta), { alterado: true }));
      });

      it('no puede borrarlo', async () => {
        const db = entorno.unauthenticatedContext().firestore();
        await assertFails(deleteDoc(doc(db, ruta)));
      });

      it('no puede crear uno nuevo al lado', async () => {
        const db = entorno.unauthenticatedContext().firestore();
        await assertFails(setDoc(doc(db, `${ruta}-nuevo`), { creado: true }));
      });
    });
  }

  it('no puede listar los leads, que es el dato más sensible del sitio', async () => {
    const db = entorno.unauthenticatedContext().firestore();
    await assertFails(getDocs(collection(db, 'leads')));
  });

  it('no puede listar las conversaciones del asistente', async () => {
    const db = entorno.unauthenticatedContext().firestore();
    await assertFails(getDocs(collection(db, 'conversacionesAsistente')));
  });
});

describe('la siembra es real', () => {
  it('los documentos existen de verdad antes de cada prueba', async () => {
    // Si esta prueba fallara, todas las de arriba serían un falso verde: un
    // `permission-denied` sobre la nada no demuestra que las reglas cierren.
    await entorno.withSecurityRulesDisabled(async (contexto) => {
      const db = contexto.firestore();
      for (const { ruta } of COLECCIONES) {
        const instantanea = await getDoc(doc(db, ruta));
        if (!instantanea.exists()) {
          throw new Error(`No se sembró ${ruta}: las pruebas de reglas no valen nada.`);
        }
      }
    });
  });
});
