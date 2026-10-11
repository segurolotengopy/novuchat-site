import { describe, expect, it } from 'vitest';
import { pricing } from '../../src/contenido/precios.en';
import { precios } from '../../src/contenido/precios.es';

/**
 * Paridad numérica ES/EN de la oferta.
 *
 * `precios.en.ts` repite a mano las cifras de `precios.es.ts` (el tipado
 * obliga a que existan las claves, no a que los valores coincidan). Una cifra
 * distinta entre idiomas sería publicar dos ofertas a la vez: esta prueba la
 * detecta.
 */
const datosSeguimiento = (t: typeof precios) => ({
  mensajes: t.bolsaSeguimiento.mensajes,
  precioUsd: t.bolsaSeguimiento.precioUsd,
  proximamente: t.bolsaSeguimiento.proximamente,
});

describe('paridad numérica entre precios.es y precios.en', () => {
  it('cada plan tiene el mismo id, precio y tope de conversaciones', () => {
    const resumen = (t: typeof precios) =>
      t.planes.map((p) => ({ id: p.id, precioUsd: p.precioUsd, conversaciones: p.conversaciones }));
    expect(resumen(pricing)).toEqual(resumen(precios));
  });

  it('cada plan trae los mismos límites de caminos (agendas y productos)', () => {
    // La primera cifra del texto de cada camino es el límite (1 / 5 / 10 agendas,
    // 20 / 100 / 500 productos). Las demás cifras son redacción de cada idioma.
    const cifras = (t: typeof precios) =>
      t.planes.map((p) => p.caminos.map((c) => c.texto.match(/\d+/)?.[0]));
    expect(cifras(pricing)).toEqual(cifras(precios));
  });

  it('las bolsas coinciden en cantidad y precio', () => {
    expect(pricing.bolsas).toEqual(precios.bolsas);
  });

  it('la bolsa de seguimiento coincide en mensajes, precio y rótulo de próxima', () => {
    expect(datosSeguimiento(pricing)).toEqual(datosSeguimiento(precios));
    // La descripción y las reglas de las 48 horas llevan las mismas cifras en ambos idiomas.
    const cifras = (t: typeof precios) => [
      t.bolsaSeguimiento.descripcion.match(/\d+/g),
      ...t.bolsaSeguimiento.reglas.map((r) => r.match(/\d+/g)),
    ];
    expect(cifras(pricing)).toEqual(cifras(precios));
    expect(pricing.bolsaSeguimiento.reglas).toHaveLength(precios.bolsaSeguimiento.reglas.length);
  });

  it('la opción excepcional coincide en conversaciones y bolsa', () => {
    expect(pricing.excepcional.conversaciones).toEqual(precios.excepcional.conversaciones);
    expect(pricing.excepcional.bolsa).toEqual(precios.excepcional.bolsa);
    expect(pricing.excepcional.instalacionUsd).toBe(precios.excepcional.instalacionUsd);
  });

  it('la instalación estándar y a medida coinciden', () => {
    expect(pricing.instalacion.estandar).toBe(precios.instalacion.estandar);
    expect(pricing.instalacion.aMedidaDesde).toBe(precios.instalacion.aMedidaDesde);
  });

  it('los resúmenes de bolsas dicen las mismas cifras en ambos idiomas', () => {
    const cifras = (t: string) => t.match(/\d+/g);
    expect(cifras(pricing.bolsasResumen)).toEqual(cifras(precios.bolsasResumen));
  });

  it('la prueba no está muda: detecta una cifra que difiere', () => {
    const copia = structuredClone(pricing);
    copia.planes[2]!.conversaciones = 999;
    const resumen = (t: typeof precios) => t.planes.map((p) => p.conversaciones);
    expect(resumen(copia)).not.toEqual(resumen(precios));
    copia.bolsaSeguimiento.precioUsd = 11;
    expect(datosSeguimiento(copia)).not.toEqual(datosSeguimiento(precios));
    copia.bolsaSeguimiento.reglas[1] = copia.bolsaSeguimiento.reglas[1]!.replace('48', '72');
    expect(copia.bolsaSeguimiento.reglas.map((r) => r.match(/\d+/g))).not.toEqual(
      precios.bolsaSeguimiento.reglas.map((r) => r.match(/\d+/g)),
    );
  });
});
