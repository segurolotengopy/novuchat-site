import type { Bolsa, BolsaSeguimiento, Instalacion, Precios } from './tipos';

const instalacion: Instalacion = {
  estandar: 65,
  aMedidaDesde: 125,
  aMedidaEjemplos: [
    'Integration with your ERP or in-house system',
    'Real-time queries to your systems',
    'Complex multi-department flows',
  ],
  aMedidaNota:
    'This is custom development, quoted case by case: these are not standard features of the assistant.',
  incluye: [
    'Turnkey initial setup: your assistant arrives ready to serve customers',
    'Nobody at NovuChat reads your conversations unless you grant access',
    "We connect your number to Meta's official WhatsApp Business channel; the account stays in your name",
    'Your services, prices, hours and assistant tone loaded in',
    'Connection to your Google Calendar',
    'Testing with real cases before going live',
  ],
};

const bolsas: Bolsa[] = [{ conversaciones: 300, precioUsd: 15 }];

// Marked "Coming soon": the platform does not sell it or count those messages
// yet (prohibition 8 of CLAUDE.md). Removing the label means setting
// `proximamente: false` and reindexing. The 48-hour rules and the notice live
// ONLY here (see `BolsaSeguimiento`). No Meta figures: it only says Meta charges separately.
const bolsaSeguimiento: BolsaSeguimiento = {
  titulo: 'Follow-up message bundle',
  mensajes: 300,
  precioUsd: 10,
  proximamente: true,
  descripcion:
    "It covers the messages your business sends more than 48 hours after the customer's last message, for example a follow-up a week later. Those messages are bought with this bundle, only with your own WhatsApp Business account. In addition, Meta charges each of those messages as a marketing template in your account.",
  reglas: [
    "A follow-up sent within 48 hours goes inside the customer's conversation and NovuChat does not bill it separately, even if the customer replies. Meta may charge it in your account.",
    'Plans do not include follow-up messages beyond 48 hours.',
    'Reminders for a booked appointment, up to 2 per appointment, do not count as follow-up messages; Meta may charge them in your account.',
    "Any other message your business starts more than 48 hours after the customer's last message does count as a follow-up.",
  ],
  avisoProximamente: 'The follow-up bundle is not available yet, it is an upcoming feature.',
};

const bolsasResumen = bolsas
  .map((b, i) => `${b.conversaciones}${i === 0 ? ' conversations' : ''} for USD ${b.precioUsd}`)
  .join(', ')
  .replace(/, ([^,]+)$/, ' or $1');

// Variant without free allowances or figures (Andres's decision, 2026-10-06; see ESTADO finding 61).
// It is the ONLY sentence on the site about what Meta charges, except for the
// figure-free mention of the marketing template in `bolsaSeguimiento.descripcion`.
const mensajeriaMeta =
  "Meta charges for messaging per message, under its current rates. The amount depends on how many messages are sent and of which type; you can check the current rates on Meta's website.";

/**
 * English mirror of `precios.es.ts`. Typed against the same interface, so the
 * compiler complains if a key is missing on either side. Prices, plan ids and
 * limits are the same business data, but they are COPIED BY HAND from
 * `precios.es.ts`: only the wording should change.
 * `pruebas/unidad/paridad-precios.test.ts` fails if any figure drifts apart.
 *
 * Amounts are in US dollars (see `precioUsd`); billing is issued in bolivianos
 * at the Bolivian Central Bank official rate.
 */
export const pricing: Precios = {
  bajada:
    'Prepaid monthly service, on your own WhatsApp Business account. You pay NovuChat the monthly fee and the setup; WhatsApp messaging you pay directly to Meta, in your account. Below we explain what you pay, to whom, and what we need from you.',

  planes: [
    {
      id: 'impulso',
      nombre: 'Impulso',
      precioUsd: 25,
      conversaciones: 200,
      resumen: 'For the business that is starting to miss messages.',
      caminos: [
        {
          icono: '📅',
          titulo: 'Bookings',
          texto: '1 calendar connected to your Google Calendar, with an automatic reminder 24 hours ahead.',
        },
        {
          icono: '🛒',
          titulo: 'Sales',
          texto: 'A catalogue of up to 20 products, with the total and delivery already calculated.',
        },
      ],
      incluye: [
        { texto: 'AI assistant that understands natural language, around the clock' },
        { texto: 'Console to see everything from your phone' },
      ],
    },
    {
      id: 'crecimiento',
      nombre: 'Crecimiento',
      precioUsd: 50,
      conversaciones: 500,
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
        { texto: 'Console to see everything from your phone' },
      ],
    },
    {
      id: 'pro',
      nombre: 'Pro',
      precioUsd: 90,
      conversaciones: 1000,
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
        { texto: 'Console to see everything from your phone' },
        { texto: 'Priority technical support' },
      ],
    },
  ],

  notaMeta: '+ WhatsApp messaging, paid directly to Meta',
  pie: 'Prepaid monthly service. Prices in USD, charged in Bs at the Official Exchange Rate of the Central Bank of Bolivia. The customer pays Meta directly for messaging costs.',
  mensajeriaMeta,

  quePagas: {
    titulo: 'What you pay, and to whom',
    items: [
      {
        aQuien: 'To NovuChat, every month',
        que: 'Your monthly plan fee, in advance. It is set in dollars and charged in bolivianos at the Central Bank of Bolivia official exchange rate of the first business day of the month. It includes the assistant, the AI and the console.',
      },
      {
        aQuien: 'To NovuChat, once',
        que: `The setup: USD ${instalacion.estandar}, a one-time payment made in advance, when the service starts.`,
      },
      {
        aQuien: 'To Meta, depending on usage',
        que: `WhatsApp messaging. You pay it directly to Meta, with your card and in your own account: NovuChat does not charge it. ${mensajeriaMeta}`,
      },
      {
        aQuien: 'To NovuChat, only if you approve it',
        que: `A conversation bundle, if you go over your plan: ${bolsasResumen}.`,
      },
    ],
  },

  queNecesitamos: {
    titulo: 'What we need from you',
    items: [
      'Your WhatsApp Business account at Meta, in your business name, and the number the assistant will use',
      'A card registered in your Meta account, for messaging',
      'Your services or products with their prices',
      'Your opening hours, and who handles each service if there are several people',
      'Your Google Calendar, if you take bookings',
      'The tone you want the assistant to speak in',
    ],
  },

  instalacion,

  bolsas,
  bolsasResumen,

  bolsaSeguimiento,

  bolsasTexto: {
    titulo: 'Conversation bundles',
    texto:
      'If you go over the conversations in your plan, you can add a bundle. Bundles never expire. We write to you at 80 % of your plan so you can choose between a bundle and moving up a plan, and no bundle is ever billed without your approval.',
  },

  excepcional: {
    titulo: 'Exceptional option: with Meta messaging included',
    paraQuien:
      'For a business that does not have, and does not want to manage, a Meta account. In this option WhatsApp conversations are included in the price and we get the new number. It is not our standard offer: it is offered case by case.',
    conversaciones: { impulso: 100, crecimiento: 220, pro: 500 },
    diferencias: [
      'WhatsApp conversations with your customers are included in the price: you do not pay Meta for them',
      'We get the new number, and it is included in the setup',
      'The setup includes the verification of the number with Meta',
    ],
    instalacionUsd: instalacion.estandar,
    bolsa: { conversaciones: 30, precioUsd: 10 },
    nota: 'Offered case by case. If this is your situation, write to us and we will look at it with you.',
  },

  comoContamos: {
    titulo: 'How we count conversations',
    parrafos: [
      'A conversation is up to 25 assistant replies to the same customer within 24 continuous hours. Someone who writes at nine, asks again at noon and closes the order at six is one conversation. If the same customer needs more than 25 replies within those 24 hours, the assistant keeps helping them and from reply 26 a new conversation is counted. Once 24 hours have passed since their first message, the count starts over.',
      'We do it this way because it does not punish you for talking: a three-message conversation and a twenty-message one cost the same. Charging per message would force you to watch how much the assistant says, and a curt assistant sells less. And the assistant does not leave a customer halfway for going past 25 replies.',
      'Your console shows the same number we invoice, plus two figures worth watching: how many distinct people you served and how many closes were achieved.',
    ],
    glosario: [
      {
        termino: 'Conversation',
        definicion:
          'Up to 25 assistant replies to the same customer within 24 continuous hours. From reply 26 within those 24 hours another one is counted; after 24 hours the count resets. This is the billing unit.',
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
        termino: 'Bundle',
        definicion: `Additional conversations for when you go over your plan: ${bolsasResumen}. It never expires. We warn you at 80 % of your plan, and no bundle is ever billed without your approval.`,
      },
      {
        termino: 'Follow-up message',
        // Getter on purpose: derived from `bolsaSeguimiento` on every read (see precios.es.ts).
        get definicion() {
          return `A message your business sends more than 48 hours after the customer's last message. ${bolsaSeguimiento.reglas[1]} ${bolsaSeguimiento.reglas[2]}${bolsaSeguimiento.proximamente ? ` ${bolsaSeguimiento.avisoProximamente}` : ''}`;
        },
      },
    ],
  },
};
