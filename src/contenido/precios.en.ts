import type { Precios } from './tipos';

/**
 * English mirror of `precios.es.ts`. Typed against the same interface, so the
 * compiler complains if a key is missing on either side. Prices, plan ids and
 * limits are the same objects of the same business: only the wording changes.
 *
 * Amounts are in US dollars (see `precioUsd`); billing is issued in bolivianos
 * at the Bolivian Central Bank official rate.
 */
export const pricing: Precios = {
  planes: [
    {
      id: 'impulso',
      nombre: 'Impulso',
      precioUsd: 20,
      conversaciones: 120,
      resumen: 'For the business that is starting to miss messages.',
      incluye: [
        { texto: 'AI assistant that understands natural language, around the clock' },
        { texto: '120 conversations per month' },
        { texto: 'Up to 25 assistant replies per conversation' },
        { texto: 'Booking connected to your Google Calendar' },
        { texto: 'Console to see everything from your phone' },
        { texto: 'Official WhatsApp Business channel' },
      ],
    },
    {
      id: 'crecimiento',
      nombre: 'Crecimiento',
      precioUsd: 40,
      conversaciones: 200,
      resumen: 'For a busy schedule and several people attending customers.',
      destacado: true,
      incluye: [
        { texto: 'Everything in Impulso' },
        { texto: '200 conversations per month' },
        { texto: 'Up to 25 assistant replies per conversation' },
        { texto: 'Multiple staff members, each with their own calendar: nobody ends up double-booked' },
        { texto: 'Orders from your catalogue, with the total and delivery already calculated' },
        { texto: 'Automatic reminder 24 hours before the appointment' },
        { texto: 'Variants, per-item notes and delivery by zone', proximamente: true },
        { texto: 'The assistant listens to voice notes', proximamente: true },
        { texto: 'Google Sheets integration', proximamente: true },
      ],
    },
    {
      id: 'pro',
      nombre: 'Pro',
      precioUsd: 70,
      conversaciones: 300,
      resumen: 'For several branches or a high volume of orders.',
      incluye: [
        { texto: 'Everything in Crecimiento' },
        { texto: '300 conversations per month' },
        { texto: 'Up to 25 assistant replies per conversation' },
        { texto: 'Priority technical support' },
        { texto: 'Broadcast through approved templates', proximamente: true },
        { texto: 'Loyalty points programme', proximamente: true },
      ],
    },
  ],

  instalacion: {
    estandar: 65,
    aMedidaDesde: 125,
    bonificacion:
      'Setup waived for the first ten businesses that secure their first month during the Rueda de Negocios.',
    incluye: [
      'Nobody at NovuChat reads your conversations unless you grant access',
      'Official verification of your number with Meta',
      'Your services, prices, hours and assistant tone loaded in',
      'Connection to your Google Calendar',
      'Testing with real cases before going live',
    ],
  },

  excedente: { precioUsd: 10, conversaciones: 25 },

  comoContamos: {
    titulo: 'How we count conversations',
    parrafos: [
      'A conversation is every message exchanged with the same customer over 24 continuous hours. Someone who writes at nine, asks again at noon and closes the order at six is one conversation. The assistant replies up to 25 times within that conversation; if more is needed, we let you know so someone on your team can take over.',
      'We do it this way because it does not punish you for talking: a three-message conversation and a twenty-message one cost the same. Charging per message would force you to watch how much the assistant says, and a curt assistant sells less.',
      'Your console shows the same number we invoice, plus two figures worth watching: how many distinct people you served and how many closes were achieved.',
    ],
    glosario: [
      {
        termino: 'Conversation',
        definicion:
          'Every message with the same customer within 24 continuous hours, with up to 25 assistant replies. This is the billing unit.',
      },
      {
        termino: 'Served customer',
        definicion:
          'A distinct person attended in the period. The same customer coming back three times in a month is three conversations and one served customer. It is not billed: it tells you how many different people you reached.',
      },
      {
        termino: 'Close',
        definicion:
          'A booked appointment or a confirmed order. It measures whether the assistant is selling, not just replying.',
      },
      {
        termino: 'Overage',
        definicion:
          'Beyond your plan, each additional block of 25 conversations costs USD 10 and never expires. We warn you at 80 % of your plan, and nothing is ever billed without your approval.',
      },
    ],
  },
};
