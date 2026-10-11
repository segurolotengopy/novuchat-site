import { describe, expect, it } from 'vitest';
import {
  RecuperadorEnMemoria,
  filtrarPorUmbral,
  similitudCoseno,
} from '../../functions/src/rag/recuperador';
import type { Incrustador, Indice } from '../../functions/src/rag/tipos';
import { construirCorpus } from '../../scripts/construir-corpus';
import { precios } from '../../src/contenido/precios.es';

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

  // Subir el umbral no puede encoger el contexto: el umbral decide SI se
  // responde; el piso, QUÉ material de apoyo ve el modelo.
  it('el piso de contexto conserva el material de apoyo bajo el umbral', () => {
    const r = (id: string, similitud: number) =>
      ({ id, similitud, titulo: id, url: '/', texto: id }) as unknown as Parameters<typeof filtrarPorUmbral>[0][number];
    const lista = [r('a', 0.75), r('b', 0.66), r('c', 0.6)];
    expect(filtrarPorUmbral(lista, 0.7, 0.64).map((x) => x.id)).toEqual(['a', 'b']);
    // Si el mejor no llega al umbral, no hay contexto que valga.
    expect(filtrarPorUmbral([r('b', 0.69), r('c', 0.66)], 0.7, 0.64)).toEqual([]);
  });
});

/** Formas de decir que lo que paga Meta va incluido en el precio. */
const DICE_INCLUIDAS = [
  /(conversaciones|mensajer[ií]a) de WhatsApp (est[aá]n|van|va|est[aá]) incluid/i,
  /inclu(ye|ido|idas?)\b[^.]*\b(conversaciones|mensajer[ií]a) de WhatsApp/i,
];

describe('corpus derivado del sitio', () => {
  const corpus = construirCorpus();

  it('tiene fragmentos y todos con identificador único', () => {
    expect(corpus.length).toBeGreaterThan(20);
    expect(new Set(corpus.map((f) => f.id)).size).toBe(corpus.length);
  });

  it('ningún fragmento queda vacío ni desmesurado', () => {
    for (const f of corpus) {
      expect(f.texto.trim().length, f.id).toBeGreaterThan(40);
      // Guarda de cordura, no un límite del modelo de embeddings: 2200 caracteres son
      // unos 550 tokens. Se subió de 2000 el 2026-10-11 porque el glosario de
      // `como-se-cuenta` suma la regla de los recordatorios de cita.
      expect(f.texto.length, f.id).toBeLessThan(2200);
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
    //
    // Antes esta prueba prohibía la cadena «USD», porque el único sitio donde
    // aparecían dólares era ese estudio. Desde la revisión de precios del
    // 2026-09-08 la tarifa pública está EN dólares, así que la cadena dejó de
    // distinguir lo interno de lo publicable y prohibirla habría bloqueado el
    // precio de verdad. Se prohíben los términos del estudio, que es lo que la
    // prueba quería proteger.
    const internos = ['costo por atención', 'costo por conversación', 'margen', 'markup'];
    for (const f of corpus) {
      const texto = f.texto.toLowerCase();
      for (const termino of internos) {
        expect(texto, `${f.id} menciona "${termino}"`).not.toContain(termino);
      }
    }
  });

  it('rotula como próximas las funciones que no existen todavía', () => {
    // Se comprueba la REGLA, no la presencia: que cada prestación marcada
    // `proximamente` en el contenido llegue al corpus con su advertencia.
    //
    // Antes esta prueba exigía que hubiera AL MENOS UNA función próxima en
    // algún plan, y el 2026-09-09 empezó a fallar porque no quedó ninguna: los
    // planes se rehicieron con el esquema «elige tu camino» y se retiró lo que
    // la presentación ya no ofrece. Exigir que exista una promesa a futuro es
    // lo contrario de lo que la prohibición 8 quiere: cero es el mejor número.
    for (const plan of precios.planes) {
      const fragmento = corpus.find((f) => f.id === `plan-${plan.id}`);
      expect(fragmento, `falta el fragmento del plan ${plan.id}`).toBeDefined();
      for (const c of plan.incluye.filter((x) => x.proximamente)) {
        expect(
          fragmento!.texto,
          `${plan.id}: «${c.texto}» va sin la advertencia de que no está disponible`,
        ).toContain(`${c.texto} (todavía no está disponible`);
      }
    }
  });

  it('el corpus dice que los caminos son excluyentes', () => {
    // El malentendido que la oferta nueva viene a evitar es creer que un plan
    // trae agenda Y catálogo. Si el asistente los lista seguidos, lo reintroduce
    // él solo, y el asistente es lo que más gente va a leer.
    for (const plan of precios.planes) {
      const fragmento = corpus.find((f) => f.id === `plan-${plan.id}`)!;
      // En cifras («1 SOLO … 2 caminos»): el verificador descartaba el «2» que
      // el modelo escribía cuando la fuente decía «dos» (2026-09-15).
      expect(fragmento.texto, `${plan.id} no dice que se elige uno`).toContain('ELIGE 1 SOLO');
      expect(fragmento.texto, `${plan.id} no separa los caminos`).toContain('O BIEN');
    }
  });

  it('cada plan dice su tope de conversaciones y que la mensajería la paga el negocio a Meta', () => {
    for (const plan of precios.planes) {
      const f = corpus.find((x) => x.id === `plan-${plan.id}`)!;
      expect(f.texto, `${plan.id} sin su tope`).toContain(
        `hasta ${plan.conversaciones.toLocaleString('es-BO')} conversaciones`,
      );
      expect(f.texto, `${plan.id} no dice quién paga la mensajería`).toContain('directamente a Meta');
    }
  });

  it('los literales de la decisión de Andres (2026-10-06 y 2026-10-11) no cambian sin que la prueba lo note', () => {
    expect(precios.planes.map((p) => p.conversaciones)).toEqual([200, 500, 1000]);
    expect(precios.bolsas.map((b) => ({ conversaciones: b.conversaciones, precioUsd: b.precioUsd }))).toEqual([
      { conversaciones: 300, precioUsd: 15 },
    ]);
    expect(precios.bolsaSeguimiento).toMatchObject({ mensajes: 300, precioUsd: 10, proximamente: true });
    expect(Object.values(precios.excepcional.conversaciones)).toEqual([100, 220, 500]);
    expect(precios.excepcional.bolsa).toEqual({ conversaciones: 30, precioUsd: 10 });
  });

  it('las cifras de la opción excepcional no se mezclan con las de la oferta principal', () => {
    // Cada plan: su fragmento no cita el tope que ESE plan tiene en la opción excepcional.
    for (const plan of precios.planes) {
      const f = corpus.find((x) => x.id === `plan-${plan.id}`)!;
      expect(f.texto, `plan-${plan.id} cita su tope excepcional`).not.toContain(
        `hasta ${precios.excepcional.conversaciones[plan.id]} conversaciones`,
      );
      expect(f.texto, `plan-${plan.id} contiene 220`).not.toContain('220');
    }
    // El resumen reúne los 3 planes y se comprueba POR PAR (plan + precio +
    // tope). El «500» del plan Pro excepcional es, además, el tope principal de
    // Crecimiento: una comparación suelta de topes tendría que exceptuarlo y
    // dejaría pasar «Pro a USD 90 con hasta 500». Por par no hay excepción.
    const resumen = corpus.find((x) => x.id === 'precios-resumen')!;
    for (const plan of precios.planes) {
      const par = (tope: number) =>
        `${plan.nombre} a USD ${plan.precioUsd} al mes con hasta ${tope.toLocaleString('es-BO')}`;
      expect(resumen.texto, `precios-resumen no trae el par principal de ${plan.nombre}`).toContain(
        par(plan.conversaciones),
      );
      expect(resumen.texto, `precios-resumen mezcla el par excepcional de ${plan.nombre}`).not.toContain(
        par(precios.excepcional.conversaciones[plan.id]),
      );
    }
    expect(resumen.texto).not.toContain('220');
  });

  it('la opción excepcional existe, se rotula como tal y se consulta caso por caso', () => {
    const f = corpus.find((x) => x.id === 'opcion-excepcional');
    expect(f, 'falta el fragmento opcion-excepcional').toBeDefined();
    expect(f!.texto).toContain('caso por caso');
    expect(f!.texto).toContain('EXCEPCIONAL');
  });

  it('el fragmento de bolsas cita la bolsa vigente y no mezcla la de la opción excepcional', () => {
    const f = corpus.find((x) => x.id === 'excedentes')!;
    expect(f.texto).toContain('300 conversaciones por USD 15');
    for (const b of precios.bolsas) {
      expect(f.texto).toContain(`USD ${b.precioUsd}`);
    }
    // La bolsa de la opción excepcional (30 por USD 10) vive SOLO en su fragmento.
    const bolsaExcepcional = `${precios.excepcional.bolsa.conversaciones} conversaciones por USD ${precios.excepcional.bolsa.precioUsd}`;
    expect(bolsaExcepcional).toBe('30 conversaciones por USD 10');
    for (const otro of corpus.filter((x) => x.id !== 'opcion-excepcional')) {
      expect(otro.texto, `${otro.id} cita la bolsa excepcional`).not.toContain(bolsaExcepcional);
    }
  });

  it('ningún fragmento conserva las bolsas retiradas el 2026-10-11', () => {
    // 50 por USD 10, 100 por USD 20 y 300 por USD 40 ya no se venden. «USD 40»
    // no se confunde con otra cifra vigente (los planes son 25 / 50 / 90).
    for (const f of corpus) {
      expect(f.texto, `${f.id} cita USD 40`).not.toContain('USD 40');
      expect(f.texto, `${f.id} cita la bolsa de 100 por USD 20`).not.toContain('100 por USD 20');
      expect(f.texto, `${f.id} cita la bolsa de 100 por USD 20`).not.toContain('100 conversaciones por USD 20');
      expect(f.texto, `${f.id} cita la bolsa de 50 por USD 10`).not.toContain('50 conversaciones por USD 10');
    }
  });

  it('la bolsa de seguimiento se rotula como próxima y trae la regla de las 48 horas', () => {
    const f = corpus.find((x) => x.id === 'bolsa-seguimiento');
    expect(f, 'falta el fragmento bolsa-seguimiento').toBeDefined();
    expect(f!.texto).toContain('300 mensajes por USD 10');
    // Misma advertencia que las prestaciones próximas de los planes (prohibición 8).
    expect(f!.texto).toContain('todavía no está disponible, es una función próxima');
    expect(f!.texto).toContain('48 horas');
    expect(f!.texto).toContain('NovuChat no lo cobra aparte');
    expect(f!.texto).toContain('plantilla de marketing');
    // La frase de Meta no lleva cifras: solo se dice que Meta cobra aparte.
    expect(f!.texto).not.toMatch(/\$|\bBs\b|centavo/i);
    // Los únicos montos del fragmento son los de la bolsa: ninguna cifra de Meta.
    expect(f!.texto.match(/USD\s?\d+(?:[.,]\d+)*/g)).toEqual([`USD ${precios.bolsaSeguimiento.precioUsd}`]);
    // Y no se presenta como contratable hoy.
    expect(f!.texto).not.toMatch(/ya puedes (comprar|contratar)/i);
  });

  // Los fragmentos que hablan de la bolsa de seguimiento: se reconocen por la
  // palabra y por su monto, no por el id, para que una FAQ o el glosario nuevos
  // que la mencionen queden cubiertos sin tocar la prueba.
  const hablaDeLaBolsaDeSeguimiento = (c = corpus) =>
    c.filter((x) => /seguimiento/i.test(x.texto) && /USD 10\b/.test(x.texto) && x.id !== 'opcion-excepcional').map((x) => x.id);

  it('todo fragmento que ofrece la bolsa de seguimiento dice que es próxima mientras lo sea', () => {
    expect(precios.bolsaSeguimiento.proximamente).toBe(true);
    const ids = hablaDeLaBolsaDeSeguimiento();
    // La prueba no está muda: la bolsa vive al menos en su fragmento y en la FAQ.
    expect(ids).toEqual(expect.arrayContaining(['bolsa-seguimiento']));
    expect(ids.length).toBeGreaterThanOrEqual(3);
    for (const f of corpus.filter((x) => ids.includes(x.id))) {
      expect(f.texto, `${f.id} ofrece la bolsa de seguimiento sin decir que es próxima`).toMatch(
        /todavía no|próxim/i,
      );
    }
  });

  it('con `proximamente` en false ningún texto del corpus dice «no disponible» ni «próxima» para la bolsa de seguimiento', () => {
    const seg = precios.bolsaSeguimiento;
    const antes = seg.proximamente;
    try {
      // Copia en memoria: se simula el día en que la plataforma ya la vende. El
      // contenido deriva el aviso de la bandera (FAQ y glosario, por getters).
      seg.proximamente = false;
      const simulado = construirCorpus();
      // Aquí basta la palabra «seguimiento» (sin exigir el monto): así entra también
      // el glosario, que define el término pero no cita USD 10.
      const ids = simulado.filter((x) => /seguimiento/i.test(x.texto)).map((x) => x.id);
      expect(ids, 'el corpus simulado perdió el glosario').toContain('como-se-cuenta');
      expect(ids, 'el corpus simulado perdió el fragmento de la bolsa').toContain('bolsa-seguimiento');
      for (const f of simulado.filter((x) => ids.includes(x.id))) {
        expect(f.texto, `${f.id} sigue diciendo que no está disponible`).not.toMatch(
          /todavía no está disponible|próxima|próximamente/i,
        );
      }
    } finally {
      seg.proximamente = antes;
    }
    expect(seg.proximamente).toBe(true);
  });

  it('las reglas de las 48 horas salen de `reglas` en cada texto que las dice', () => {
    const { reglas } = precios.bolsaSeguimiento;
    expect(reglas).toHaveLength(3);
    const texto = (id: string) => corpus.find((x) => x.id === id)!.texto;
    // El fragmento de la bolsa y la FAQ de seguimiento traen las dos, literales.
    const idFaq = corpus.find((x) => x.id.startsWith('faq-') && /mensajes de seguimiento/i.test(x.titulo))!.id;
    for (const id of ['bolsa-seguimiento', idFaq]) {
      for (const regla of reglas) {
        expect(texto(id), `${id} no trae la regla literal «${regla}»`).toContain(regla);
      }
    }
    // El glosario (acotado por el tope de longitud) trae la de los planes.
    expect(texto('como-se-cuenta'), 'el glosario no trae la regla de los planes').toContain(reglas[1]);
    expect(texto('como-se-cuenta'), 'el glosario no trae la regla de los recordatorios').toContain(reglas[2]);
  });

  it('ningún fragmento usa el vocabulario que el sitio no publica', () => {
    for (const f of corpus) {
      expect(f.texto, f.id).not.toMatch(/\bbyoc\b|tech provider|centavo/i);
    }
  });

  it('solo la opción excepcional dice que las conversaciones de WhatsApp van incluidas', () => {
    const dicenIncluidas = corpus.filter((f) => DICE_INCLUIDAS.some((r) => r.test(f.texto))).map((f) => f.id);
    expect(dicenIncluidas.sort()).toEqual(['opcion-excepcional']);
  });

  it('la regla de «incluidas» detecta la formulación vieja del resumen (la guarda no está muda)', () => {
    // Texto del resumen ANTES de la oferta con cuenta propia. Si la regla no lo
    // detecta, la prueba anterior pasaría aunque alguien reintrodujera esa frase.
    const viejo = 'El precio incluye el consumo de la inteligencia artificial y las conversaciones de WhatsApp.';
    expect(DICE_INCLUIDAS.some((r) => r.test(viejo))).toBe(true);
    // Y no se dispara con la formulación vigente, que separa las dos ideas.
    const vigente =
      'El precio incluye el consumo de la inteligencia artificial. La mensajería de WhatsApp no está incluida: el negocio la paga a Meta.';
    expect(DICE_INCLUIDAS.some((r) => r.test(vigente))).toBe(false);
  });

  it('las cantidades de la oferta van en cifras, no en letras (hallazgo 56)', () => {
    const ids = ['precios-resumen', 'que-pagas', 'que-necesitamos', 'excedentes', 'bolsa-seguimiento', 'opcion-excepcional'];
    for (const f of corpus.filter((x) => ids.includes(x.id) || x.id.startsWith('plan-'))) {
      expect(f.texto, f.id).not.toMatch(/\b(dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|veinte|treinta|cuarenta|cincuenta|cien|doscientos|trescientos|quinientos|mil)\b/i);
    }
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
