import { describe, expect, it } from 'vitest';
import {
  enlacesDe,
  numerosDe,
  verificar,
} from '../../functions/src/rag/verificacion';
import type { Recuperado } from '../../functions/src/rag/tipos';

/**
 * El verificador es la última compuerta antes de que una respuesta llegue al
 * visitante. Es lo que convierte «le pedimos al modelo que no invente» en
 * «el modelo no puede publicar una invención»: la diferencia entre una
 * instrucción y un control.
 */

const RECUPERADOS: Recuperado[] = [
  {
    id: 'plan-impulso',
    titulo: 'Plan Impulso',
    url: '/precios',
    texto: 'El plan Impulso cuesta 250 Bs al mes e incluye 300 conversaciones mensuales.',
    similitud: 0.9,
  },
  {
    id: 'instalacion-costo',
    titulo: 'Instalación',
    url: '/precios',
    texto: 'La instalación se paga una sola vez y cuesta 800 Bs.',
    similitud: 0.7,
  },
];

describe('numerosDe', () => {
  it('normaliza los separadores de miles', () => {
    // «1.000», «1,000» y «1000» son el mismo número: si no se normaliza, el
    // verificador rechaza respuestas correctas por un detalle de formato.
    expect(numerosDe('1.000 y 1,000 y 1000')).toEqual(['1000', '1000', '1000']);
  });

  it('conserva los decimales', () => {
    expect(numerosDe('cuesta 0,5 puntos')).toEqual(['0,5']);
  });
});

describe('enlacesDe', () => {
  it('encuentra direcciones absolutas y rutas del sitio', () => {
    expect(enlacesDe('mira https://novuchat.site/precios y /demo')).toEqual([
      'https://novuchat.site/precios',
      '/demo',
    ]);
  });
});

describe('verificar', () => {
  it('acepta una respuesta apoyada en los fragmentos', () => {
    const v = verificar(
      'El plan Impulso cuesta 250 Bs al mes. [[fuentes: plan-impulso]]',
      RECUPERADOS,
    );
    expect(v.aceptada).toBe(true);
    expect(v.citas).toEqual(['plan-impulso']);
    // La línea de citas no se le muestra a nadie.
    expect(v.texto).not.toContain('fuentes');
  });

  it('descarta una respuesta sin citas: no se apoyó en el corpus', () => {
    const v = verificar('El plan Impulso cuesta 250 Bs al mes.', RECUPERADOS);
    expect(v.aceptada).toBe(false);
    expect(v.motivo).toBe('sin-citas');
  });

  it('descarta citas que no existen entre lo recuperado', () => {
    const v = verificar('Algo. [[fuentes: fragmento-inventado]]', RECUPERADOS);
    expect(v.aceptada).toBe(false);
    expect(v.motivo).toBe('sin-citas');
  });

  it('DESCARTA UN PRECIO INVENTADO, que es el riesgo comercial de verdad', () => {
    const v = verificar(
      'El plan Impulso cuesta 199 Bs al mes. [[fuentes: plan-impulso]]',
      RECUPERADOS,
    );
    expect(v.aceptada).toBe(false);
    expect(v.motivo).toBe('numero-inventado');
    expect(v.detalle).toBe('199');
  });

  it('descarta un descuento inventado aunque el resto sea correcto', () => {
    const v = verificar(
      'El plan Impulso cuesta 250 Bs, con 30 % de descuento este mes. [[fuentes: plan-impulso]]',
      RECUPERADOS,
    );
    expect(v.aceptada).toBe(false);
    expect(v.motivo).toBe('numero-inventado');
  });

  it('contrasta contra el fragmento CITADO, no contra todo lo recuperado', () => {
    // 800 existe, pero en el fragmento de instalación. Si el modelo cita solo
    // el del plan, no puede sacar de ahí un número que ese fragmento no tiene.
    const v = verificar(
      'El plan Impulso cuesta 800 Bs. [[fuentes: plan-impulso]]',
      RECUPERADOS,
    );
    expect(v.aceptada).toBe(false);
    expect(v.motivo).toBe('numero-inventado');
  });

  it('acepta el mismo número si se cita el fragmento que lo contiene', () => {
    const v = verificar(
      'La instalación cuesta 800 Bs una sola vez. [[fuentes: instalacion-costo]]',
      RECUPERADOS,
    );
    expect(v.aceptada).toBe(true);
  });

  it('descarta un enlace inventado', () => {
    const v = verificar(
      'Mira https://novuchat.site/promociones. [[fuentes: plan-impulso]]',
      RECUPERADOS,
    );
    expect(v.aceptada).toBe(false);
    expect(v.motivo).toBe('enlace-inventado');
  });

  it('acepta el enlace de la página del propio fragmento', () => {
    const v = verificar(
      'Están todos en /precios. [[fuentes: plan-impulso]]',
      RECUPERADOS,
    );
    expect(v.aceptada).toBe(true);
  });

  it('descarta una respuesta vacía', () => {
    expect(verificar('   ', RECUPERADOS).motivo).toBe('vacia');
  });
});
