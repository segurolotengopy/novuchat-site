import type { Precios } from './tipos';

/**
 * English mirror of `precios.es.ts`. Typed against the same interface, so the
 * compiler complains if a key is missing on either side. Prices, plan ids and
 * limits are the same objects of the same business: only the wording changes.
 */
export const pricing: Precios = {
  planes: [
    {
      id: 'impulso',
      nombre: 'Impulso',
      precioBs: 250,
      conversaciones: 300,
      resumen: 'For the business that is starting to miss messages.',
      incluye: [
        { texto: 'AI assistant that understands natural language, around the clock' },
        { texto: '300 conversations per month' },
        { texto: 'Booking connected to your Google Calendar' },
        { texto: 'Console to see everything from your phone' },
        { texto: 'Official WhatsApp Business channel' },
      ],
    },
    {
      id: 'crecimiento',
      nombre: 'Crecimiento',
      precioBs: 450,
      conversaciones: 1000,
      resumen: 'For a busy schedule and several people attending customers.',
      destacado: true,
      incluye: [
        { texto: 'Everything in Impulso' },
        { texto: '1,000 conversations per month' },
        { texto: 'Multiple staff members, each with their own calendar and specialties' },
        { texto: 'Orders with variants, notes and delivery by zone' },
        { texto: 'Automatic reminder 24 hours before the appointment' },
        { texto: 'The assistant listens to voice notes', proximamente: true },
        { texto: 'Google Sheets integration', proximamente: true },
      ],
    },
    {
      id: 'pro',
      nombre: 'Pro',
      precioBs: 850,
      conversaciones: 2500,
      resumen: 'For several branches or a high volume of orders.',
      incluye: [
        { texto: 'Everything in Crecimiento' },
        { texto: '2,500 conversations per month' },
        { texto: 'Priority technical support' },
        { texto: 'Broadcast through approved templates', proximamente: true },
        { texto: 'Loyalty points programme', proximamente: true },
      ],
    },
  ],

  instalacion: {
    estandar: 800,
    aMedidaDesde: 1500,
    bonificacion:
      'Setup waived for the first ten businesses that secure their first month during the Rueda de Negocios.',
    incluye: [
      'Your business set up on secure servers with an isolated database',
      'Official verification of your number with Meta',
      'Your services, prices, hours and assistant tone loaded in',
      'Connection to your Google Calendar',
      'Testing with real cases before going live',
    ],
  },

  excedente: { precioBs: 50, conversaciones: 150 },

  comoContamos: {
    titulo: 'How we count conversations',
    parrafos: [
      'A conversation is every message exchanged with the same customer over 24 continuous hours, no matter how many. Someone who writes at nine, asks again at noon and closes the order at six is one conversation.',
      'We do it this way because it is the only measure that does not punish you for talking. Charging per message pushes an assistant to answer curtly, and a curt assistant sells less.',
      'Your console shows the same number we invoice, plus two figures worth watching: how many distinct people you served and how many closes were achieved.',
    ],
    glosario: [
      {
        termino: 'Conversation',
        definicion:
          'Every message with the same customer within 24 continuous hours. This is the billing unit.',
      },
      {
        termino: 'Served customer',
        definicion:
          'A distinct person attended in the period. The same customer coming back three times in a month is three conversations and one served customer.',
      },
      {
        termino: 'Close',
        definicion:
          'A booked appointment or a confirmed order. It measures whether the assistant is selling, not just replying.',
      },
      {
        termino: 'Overage',
        definicion:
          'Beyond your plan, each additional block of 150 conversations costs 50 Bs. Service is never cut off and nothing is billed by surprise: we warn you at 80 %.',
      },
    ],
  },
};
