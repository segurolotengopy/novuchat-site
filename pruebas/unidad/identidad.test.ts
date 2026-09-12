import { describe, expect, it } from 'vitest';
import { SOY_UNA_IA, preguntaPorIdentidad } from '../../functions/src/asistente-logica';

/**
 * Prohibición 7: el asistente dice que es una IA si le preguntan. La respuesta
 * es fija y se da antes del RAG, así que no depende del umbral (con 0,70,
 * «eres una persona o un robot?» quedaba en 0,687 y no se respondía).
 */
describe('pregunta por la identidad del asistente', () => {
  const PREGUNTAN = [
    'eres una persona o un robot?',
    '¿Eres humano?',
    '¿Eres real?',
    '¿estoy hablando con una persona?',
    '¿esto es un bot?',
    '¿me responde una IA?',
    '¿Sos una máquina?',
    'are you a human?',
    'am I talking to a bot?',
  ];

  // Mencionan personas, bots o «real» sin preguntar por el asistente. Si
  // alguna diera positivo, el visitante recibiría «soy una IA» a una pregunta
  // de negocio: un detector que molesta termina apagado.
  const NO_PREGUNTAN = [
    '¿el plan es para una persona?',
    '¿cuánto cuesta?',
    'tengo una peluqueria, me sirve?',
    '¿el asistente escucha audios?',
    '¿el bot me atiende los domingos?',
    '¿me escribe el asistente cuando un cliente real pide cita?',
    '¿quién me responde si el asistente no sabe?',
  ];

  for (const p of PREGUNTAN) {
    it(`responde que es una IA: «${p}»`, () => {
      expect(preguntaPorIdentidad(p)).toBe(true);
    });
  }

  for (const p of NO_PREGUNTAN) {
    it(`no confunde una pregunta de negocio: «${p}»`, () => {
      expect(preguntaPorIdentidad(p)).toBe(false);
    });
  }

  it('la respuesta fija dice que es una inteligencia artificial y no una persona', () => {
    expect(SOY_UNA_IA).toMatch(/inteligencia artificial/);
    expect(SOY_UNA_IA).toMatch(/no soy una persona/);
  });
});
