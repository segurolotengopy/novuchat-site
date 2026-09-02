import { precios } from '../src/contenido/precios.es';
import { preguntas } from '../src/contenido/faq.es';
import { verticales } from '../src/contenido/verticales.es';
import { sitio } from '../src/contenido/sitio.es';
import {
  heroe,
  problema,
  capacidades,
  comparativa,
  instalacion48,
  compromiso,
} from '../src/contenido/inicio.es';

/**
 * Corpus del asistente, **derivado del contenido del sitio**.
 *
 * POR QUÉ SE DERIVA Y NO SE ESCRIBE A MANO. El sitio de referencia tenía la
 * base de conocimiento duplicada en dos archivos, y las dos copias se
 * separaron: el chat decía un precio y la página decía otro. Aquí el asistente
 * **no puede** contradecir a la página, porque lee de los mismos objetos que la
 * página renderiza. Si Andres cambia un precio en `precios.es.ts`, cambian los
 * dos a la vez.
 *
 * QUÉ NO ENTRA (riesgo S-3 del doc 04): infraestructura, proveedores internos,
 * costos propios, clientes reales, descuentos no publicados y cualquier
 * mención a AAB1 (decisión de Andres del 2026-09-02). El corpus solo puede
 * contener lo que ya es público en el sitio.
 */

export interface Fragmento {
  id: string;
  texto: string;
  titulo: string;
  url: string;
}

const bs = (n: number) => `${n.toLocaleString('es-BO')} Bs`;

export function construirCorpus(): Fragmento[] {
  const fragmentos: Fragmento[] = [];

  // — Qué es —
  fragmentos.push({
    id: 'que-es',
    titulo: 'Qué es NovuChat',
    url: '/',
    texto:
      `NovuChat es un asistente para WhatsApp con inteligencia artificial, para negocios de ${sitio.contacto.pais}. ` +
      `${heroe.bajada} ` +
      `Se resume así: ${sitio.lema}`,
  });

  // — Qué hace —
  for (const c of capacidades) {
    fragmentos.push({
      id: `capacidad-${ranurar(c.titulo)}`,
      titulo: c.titulo,
      url: '/',
      texto: `${c.titulo}. ${c.texto}`,
    });
  }

  // — El problema que resuelve —
  fragmentos.push({
    id: 'problema',
    titulo: 'Qué problema resuelve',
    url: '/',
    texto: `${problema.titulo}. ${problema.bajada} ${problema.tarjetas
      .map((t) => `${t.titulo}: ${t.texto}`)
      .join(' ')}`,
  });

  // — Contra los chatbots de botones —
  fragmentos.push({
    id: 'ia-contra-botones',
    titulo: comparativa.titulo,
    url: '/',
    texto: comparativa.columnas
      .map((c) => `${c.titulo}: ${c.puntos.join('; ')}.`)
      .join(' '),
  });

  // — Resumen de precios —
  // Existe porque la calibración lo pidió: «¿cuánto cuesta?», que es la
  // pregunta más frecuente de un sitio comercial, no recuperaba ningún plan.
  // Los fragmentos por plan responden «qué incluye el plan X», no «cuánto
  // cuesta esto». Son preguntas distintas y necesitan material distinto.
  fragmentos.push({
    id: 'precios-resumen',
    titulo: 'Cuánto cuesta NovuChat',
    url: '/precios',
    texto:
      `¿Cuánto cuesta NovuChat? Hay tres planes mensuales en bolivianos: ` +
      precios.planes
        .map((p) => `${p.nombre} a ${bs(p.precioBs)} al mes con ${p.conversaciones.toLocaleString('es-BO')} conversaciones`)
        .join(', ') +
      `. El más económico es ${precios.planes[0]!.nombre}, desde ${bs(precios.planes[0]!.precioBs)} al mes. ` +
      `Aparte se paga una única instalación de ${bs(precios.instalacion.estandar)}. ` +
      `El precio incluye el consumo de la inteligencia artificial y las conversaciones de WhatsApp.`,
  });

  // — Planes, uno por plan para que la recuperación sea precisa —
  for (const plan of precios.planes) {
    fragmentos.push({
      id: `plan-${plan.id}`,
      titulo: `Plan ${plan.nombre}`,
      url: '/precios',
      texto:
        `El plan ${plan.nombre} cuesta ${bs(plan.precioBs)} al mes e incluye ` +
        `${plan.conversaciones.toLocaleString('es-BO')} conversaciones mensuales. ${plan.resumen} ` +
        `Incluye: ${plan.incluye
          .map((c) => (c.proximamente ? `${c.texto} (todavía no está disponible, es una función próxima)` : c.texto))
          .join('; ')}.`,
    });
  }

  // — Instalación y excedentes —
  fragmentos.push({
    id: 'instalacion-costo',
    titulo: 'Cuánto cuesta la instalación',
    url: '/precios',
    texto:
      `La instalación se paga una sola vez y cuesta ${bs(precios.instalacion.estandar)}. ` +
      `Incluye: ${precios.instalacion.incluye.join('; ')}. ` +
      `Si el negocio necesita integraciones a medida, la instalación arranca en ${bs(precios.instalacion.aMedidaDesde)}. ` +
      (precios.instalacion.bonificacion ?? ''),
  });

  fragmentos.push({
    id: 'excedentes',
    titulo: 'Qué pasa si me paso del plan',
    url: '/precios',
    texto:
      `Si se superan las conversaciones incluidas en el plan, cada bloque adicional de ` +
      `${precios.excedente.conversaciones} conversaciones cuesta ${bs(precios.excedente.precioBs)}. ` +
      `No se corta el servicio ni se cobra sin avisar: se avisa al llegar al 80 % del plan. ` +
      `El consumo de la inteligencia artificial y las conversaciones de WhatsApp están incluidos en el precio del plan.`,
  });

  // — Cómo se cuenta —
  fragmentos.push({
    id: 'como-se-cuenta',
    titulo: precios.comoContamos.titulo,
    url: '/precios',
    texto: `${precios.comoContamos.parrafos.join(' ')} ${precios.comoContamos.glosario
      .map((g) => `${g.termino}: ${g.definicion}`)
      .join(' ')}`,
  });

  // — Instalación en 48 horas —
  fragmentos.push({
    id: 'instalacion-proceso',
    titulo: instalacion48.titulo,
    url: '/como-funciona',
    texto:
      `${instalacion48.titulo}. ${instalacion48.bajada} ` +
      instalacion48.pasos.map((p, i) => `Paso ${i + 1}, ${p.titulo}: ${p.texto}`).join(' '),
  });

  // — Rubros —
  for (const v of verticales) {
    fragmentos.push({
      id: `rubro-${v.id}`,
      titulo: v.nombre,
      url: `/soluciones/${v.id}`,
      texto:
        `Para el rubro ${v.nombre}: ${v.bajada} ` +
        v.casos.map((c) => `${c.titulo}: ${c.texto}`).join(' ') +
        ` El plan recomendado para este rubro es ${v.planRecomendado}.`,
    });
  }

  // — Compromiso ético —
  fragmentos.push({
    id: 'compromiso',
    titulo: compromiso.titulo,
    url: '/nosotros',
    texto: compromiso.puntos.join(' '),
  });

  // — Contacto —
  fragmentos.push({
    id: 'contacto',
    titulo: 'Cómo contactarnos',
    url: '/contacto',
    texto:
      `Para hablar con una persona: WhatsApp ${sitio.contacto.whatsapp} o correo ${sitio.contacto.correo}. ` +
      `Estamos en ${sitio.contacto.ciudad}, ${sitio.contacto.pais}. ` +
      `Para una demostración conviene dejar los datos en el formulario de la página de demostración; ` +
      `respondemos por WhatsApp en menos de 24 horas hábiles.`,
  });

  // — Preguntas frecuentes, una por pregunta —
  for (const p of preguntas) {
    fragmentos.push({
      id: `faq-${ranurar(p.pregunta)}`,
      titulo: p.pregunta,
      url: '/preguntas-frecuentes',
      texto: `Pregunta: ${p.pregunta} Respuesta: ${p.respuesta}`,
    });
  }

  return fragmentos;
}

/** Identificador estable y legible a partir de un título. */
function ranurar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .split('-')
    .slice(0, 5)
    .join('-');
}
