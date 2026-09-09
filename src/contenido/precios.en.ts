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
      precioUsd: 25,
      conversaciones: 100,
      resumen: 'For the business that is starting to miss messages.',
      caminos: [
        {
          icono: '📅',
          titulo: 'Bookings',
          texto: 'One calendar connected to your Google Calendar, with an automatic reminder 24 hours ahead.',
        },
        {
          icono: '🛒',
          titulo: 'Sales',
          texto: 'A catalogue of up to 20 products, with the total and delivery already calculated.',
        },
      ],
      incluye: [
        { texto: 'AI assistant that understands natural language, around the clock' },
        { texto: '100 conversations per month' },
        { texto: 'Console to see everything from your phone' },
        { texto: 'Official WhatsApp Business channel' },
      ],
    },
    {
      id: 'crecimiento',
      nombre: 'Crecimiento',
      precioUsd: 50,
      conversaciones: 220,
      resumen: 'For a busy schedule and several people attending customers.',
      destacado: true,
      caminos: [
        {
          icono: '📅',
          titulo: 'Bookings',
          texto: 'Up to 5 calendars, one per person: nobody ends up double-booked. With an automatic reminder 24 hours ahead.',
        },
        {
          icono: '🛒',
          titulo: 'Sales',
          texto: 'A catalogue of up to 100 products, with the total and delivery already calculated.',
        },
      ],
      incluye: [
        { texto: 'AI assistant that understands natural language, around the clock' },
        { texto: '220 conversations per month' },
        { texto: 'Console to see everything from your phone' },
        { texto: 'Official WhatsApp Business channel' },
      ],
    },
    {
      id: 'pro',
      nombre: 'Pro',
      precioUsd: 90,
      conversaciones: 500,
      resumen: 'For several branches or a high volume of orders.',
      caminos: [
        {
          icono: '📅',
          titulo: 'Bookings',
          texto: 'Up to 10 calendars, one per person or per branch. With an automatic reminder 24 hours ahead.',
        },
        {
          icono: '🛒',
          titulo: 'Sales',
          texto: 'A catalogue of up to 500 products, with the total and delivery already calculated.',
        },
      ],
      incluye: [
        { texto: 'AI assistant that understands natural language, around the clock' },
        { texto: '500 conversations per month' },
        { texto: 'Console to see everything from your phone' },
        { texto: 'Official WhatsApp Business channel' },
        { texto: 'Priority technical support' },
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

  excedente: { precioUsd: 10, conversaciones: 30 },

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
          'Beyond your plan, each additional block of up to 30 conversations costs USD 10 and never expires. We warn you at 80 % of your plan, and nothing is ever billed without your approval.',
      },
    ],
  },
};
