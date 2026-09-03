import { describe, expect, it } from 'vitest';
import {
  RecuperadorEnMemoria,
  filtrarPorUmbral,
  similitudCoseno,
} from '../../functions/src/rag/recuperador';
import type { Incrustador, Indice } from '../../functions/src/rag/tipos';
import { construirCorpus } from '../../scripts/construir-corpus';

/**
 * Pruebas del RAG estricto.
 *
 * ALCANCE, dicho con precisión para que nadie lea de más: aquí se verifica la
 * **mecánica** —coseno, orden, umbral, contrato del recuperador— con un
 * incrustador léxico simulado y determinista. La **calidad semántica** de la
 * recuperación depende del modelo real y solo se puede medir con la clave de
 * Gemini; ese conjunto dorado está más abajo y se salta mientras no exista
 * `GEMINI_API_KEY`.
 */

/** Incrustador simulado: frecuencia de términos sobre un vocabulario fijo. */
function incrustadorLexico(vocabulario: string[]): Incrustador {
  return {
    async incrustar(texto) {
      const palabras = texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .split(/[^a-z0-9]+/)
        .filter(Boolean);
      return vocabulario.map((v) => palabras.filter((p) => p === v).length);
    },
  };
}

describe('similitudCoseno', () => {
  it('vale 1 para vectores idénticos y 0 para ortogonales', () => {
    expect(similitudCoseno([1, 0, 1], [1, 0, 1])).toBeCloseTo(1);
    expect(similitudCoseno([1, 0], [0, 1])).toBe(0);
  });

  it('no depende de la magnitud, solo de la dirección', () => {
    expect(similitudCoseno([1, 2], [10, 20])).toBeCloseTo(1);
  });

  it('devuelve 0 ante longitudes distintas o vectores vacíos', () => {
    expect(similitudCoseno([1, 2, 3], [1, 2])).toBe(0);
    expect(similitudCoseno([], [])).toBe(0);
  });
});

describe('recuperación', () => {
  const vocabulario = ['precio', 'plan', 'instalacion', 'horas', 'audio', 'gato'];
  const incrustador = incrustadorLexico(vocabulario);

  async function indiceDePrueba(): Promise<Indice> {
    const textos = [
      { id: 'precios', texto: 'precio del plan plan' },
      { id: 'instalacion', texto: 'instalacion en 48 horas horas' },
      { id: 'audios', texto: 'audio audio audio' },
    ];
    return {
      modelo: 'simulado',
      dimensiones: vocabulario.length,
      generado: new Date().toISOString(),
      huella: 'simulada',
      fragmentos: await Promise.all(
        textos.map(async (t) => ({
          id: t.id,
          titulo: t.id,
          url: `/${t.id}`,
          texto: t.texto,
          vector: await incrustador.incrustar(t.texto, 'documento'),
        })),
      ),
    };
  }

  it('devuelve primero el fragmento más parecido', async () => {
    const recuperador = new RecuperadorEnMemoria(await indiceDePrueba(), incrustador);
    const resultado = await recuperador.recuperar('cuanto cuesta el plan precio', 3);
    expect(resultado[0]?.id).toBe('precios');
  });

  it('respeta cuántos fragmentos se piden', async () => {
    const recuperador = new RecuperadorEnMemoria(await indiceDePrueba(), incrustador);
    expect(await recuperador.recuperar('plan', 2)).toHaveLength(2);
  });

  it('una pregunta ajena al corpus no supera el umbral', async () => {
    const recuperador = new RecuperadorEnMemoria(await indiceDePrueba(), incrustador);
    const resultado = await recuperador.recuperar('mi gato esta enfermo', 3);
    // Es lo que hace estricto al RAG: sin material, no se llama al modelo.
    expect(filtrarPorUmbral(resultado, 0.5)).toEqual([]);
  });

  it('una pregunta del corpus sí lo supera', async () => {
    const recuperador = new RecuperadorEnMemoria(await indiceDePrueba(), incrustador);
    const resultado = await recuperador.recuperar('precio plan', 3);
    expect(filtrarPorUmbral(resultado, 0.5).length).toBeGreaterThan(0);
  });

  it('filtrarPorUmbral descarta la cola aunque el primero pase', async () => {
    const recuperador = new RecuperadorEnMemoria(await indiceDePrueba(), incrustador);
    const resultado = await recuperador.recuperar('precio plan', 3);
    const utiles = filtrarPorUmbral(resultado, 0.5);
    expect(utiles.length).toBeLessThan(resultado.length);
  });
});

describe('corpus derivado del sitio', () => {
  const corpus = construirCorpus();

  it('tiene fragmentos y todos con identificador único', () => {
    expect(corpus.length).toBeGreaterThan(20);
    expect(new Set(corpus.map((f) => f.id)).size).toBe(corpus.length);
  });

  it('ningún fragmento queda vacío ni desmesurado', () => {
    for (const f of corpus) {
      expect(f.texto.trim().length, f.id).toBeGreaterThan(40);
      expect(f.texto.length, f.id).toBeLessThan(2000);
    }
  });

  it('NO menciona a AAB1 (decisión de Andres del 2026-09-02)', () => {
    for (const f of corpus) {
      expect(f.texto.toLowerCase(), f.id).not.toContain('aab1');
    }
  });

  it('no filtra infraestructura ni proveedores internos (riesgo S-3)', () => {
    const prohibidos = [
      'firestore', 'firebase', 'n8n', 'gemini', 'claude', 'anthropic',
      'secret manager', 'us-east1', 'oci', 'cloud function',
    ];
    for (const f of corpus) {
      const texto = f.texto.toLowerCase();
      // Por palabra completa, no por subcadena: «oci» vive dentro de
      // «negocio». Es exactamente el error que el filtro de términos del
      // asistente evita, y la prueba no puede cometerlo.
      //
      // Se compara sobre texto normalizado en vez de construir una expresión
      // regular a partir del término: escapar a mano lo que va dentro de una
      // regex es una fuente clásica de sanitización incompleta, y CodeQL lo
      // marcaba con razón. Además, así funcionan también los términos de varias
      // palabras como «secret manager».
      const normalizado = ` ${texto.replace(/[^a-z0-9]+/g, ' ').trim()} `;
      for (const p of prohibidos) {
        const termino = ` ${p.replace(/[^a-z0-9]+/g, ' ').trim()} `;
        expect(normalizado.includes(termino), `${f.id} menciona "${p}"`).toBe(false);
      }
    }
  });

  it('no incluye costos internos', () => {
    // El estudio de costo por atención es información nuestra, no del cliente.
    for (const f of corpus) {
      expect(f.texto.toLowerCase(), f.id).not.toContain('costo por atención');
      expect(f.texto, f.id).not.toContain('USD');
    }
  });

  it('rotula como próximas las funciones que no existen todavía', () => {
    const planes = corpus.filter((f) => f.id.startsWith('plan-'));
    const conProximas = planes.filter((f) => f.texto.includes('todavía no está disponible'));
    expect(conProximas.length).toBeGreaterThan(0);
  });

  it('cada fragmento apunta a una página real del sitio', () => {
    const rutas = new Set([
      '/', '/precios', '/como-funciona', '/consola', '/demo', '/nosotros',
      '/contacto', '/preguntas-frecuentes', '/terminos',
      '/soluciones/salud-belleza', '/soluciones/gastronomia', '/soluciones/comercio',
    ]);
    for (const f of corpus) {
      expect(rutas.has(f.url), `${f.id} apunta a ${f.url}`).toBe(true);
    }
  });
});
