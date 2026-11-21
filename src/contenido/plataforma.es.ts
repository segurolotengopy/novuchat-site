/**
 * Contenido de /plataforma: cómo está pensada la plataforma, en español simple.
 *
 * Decisiones de Andres (2026-11-20): una página nueva con tres bloques
 * (negocios aislados, tu número y tu cuenta, cómo entran los mensajes) y
 * NovuTienda como «Próximamente». Sin nombres de clientes. Los términos de oferta
 * prohibidos del sitio (`pnpm prohibiciones`) no se escriben. Sin cifras de Meta (la única
 * frase sobre lo que cobra Meta es `precios.mensajeriaMeta`).
 */

export interface Bloque {
  titulo: string;
  bajada: string;
  puntos: { titulo: string; texto: string }[];
}

export const plataformaIntro = {
  titulo: 'Una plataforma, un asistente propio para cada negocio',
  bajada:
    'Muchos negocios usan NovuChat, pero cada uno tiene lo suyo separado: su número, sus datos, sus conversaciones y su asistente. Así está pensado, en palabras simples.',
};

export const aislamiento: Bloque = {
  titulo: 'Cada negocio, aislado de los demás',
  bajada:
    'Imagina un edificio con una oficina por negocio, cada una con su llave. Todos comparten el edificio, pero nadie entra a la oficina del vecino.',
  puntos: [
    {
      titulo: 'Tu información es solo tuya',
      texto:
        'Tus conversaciones, tu catálogo, tu agenda y tu configuración viven separados de los de cualquier otro negocio. Nadie de otro negocio puede verlos.',
    },
    {
      titulo: 'Cada persona entra con su rol',
      texto:
        'El dueño y el operador de tu negocio entran con su cuenta y ven solo lo que su rol permite. Un usuario de otro negocio no puede abrir tus datos.',
    },
    {
      titulo: 'Tus clientes nunca se mezclan',
      texto:
        'El asistente guarda la conversación de cada cliente por separado, por su número de teléfono. Lo que habla un cliente nunca aparece en la conversación de otro.',
    },
    {
      titulo: 'Tu asistente corre a tu medida',
      texto:
        'Cada negocio tiene su propio asistente, con sus horarios, servicios y tono. Un cambio que hacemos para otro negocio no puede afectar al tuyo.',
    },
    {
      titulo: 'Los límites los controla el sistema',
      texto:
        'Las conversaciones, productos y agendas de tu plan se cuentan y se hacen cumplir en el servidor, no solo en la pantalla.',
    },
  ],
};

export const tuCuenta: Bloque = {
  titulo: 'Tu número, tu cuenta de WhatsApp Business',
  bajada:
    'El número y la cuenta de WhatsApp Business son tuyos, a tu nombre y en tu propia cuenta de Meta. NovuChat los conecta con tu asistente.',
  puntos: [
    {
      titulo: 'Lo que haces tú',
      texto:
        'Tienes (o creas, con nuestra guía) tu cuenta de Meta y tu WhatsApp Business. Eres dueño del número y de la tarjeta con la que Meta cobra sus conversaciones, y aceptas los permisos que Meta te pide.',
    },
    {
      titulo: 'Lo que hacemos nosotros',
      texto:
        'Te guiamos en el alta paso a paso, conectamos tu número a tu asistente, aprobamos contigo las plantillas de mensajes y vigilamos que todo funcione.',
    },
    {
      titulo: 'Cómo se paga',
      texto:
        'Meta le cobra directamente al negocio por sus mensajes. NovuChat cobra su servicio aparte, con el plan que elijas. Son dos facturas distintas y siempre sabes cuál es cuál.',
    },
    {
      titulo: 'Los mensajes son tuyos',
      texto:
        'Los mensajes y las conversaciones son de tu negocio, no de NovuChat. Hoy varios negocios ya atienden así; el alta se hace con nuestra ayuda, no de forma automática.',
    },
    {
      titulo: 'Un detalle a tener en cuenta',
      texto:
        'Mientras un número está conectado al asistente, ya no se puede responder con él desde la aplicación del celular. Por eso, si atiendes desde la aplicación, te recomendamos un número nuevo.',
    },
  ],
};

export const receptor: Bloque = {
  titulo: 'Cómo entran los mensajes: el receptor (WAM)',
  bajada:
    'WAM es la puerta de entrada. Recibe, de parte de WhatsApp, los mensajes que tus clientes te escriben y los entrega a tu asistente.',
  puntos: [
    {
      titulo: 'Recibe',
      texto:
        'Toma cada mensaje que le llega a tu número por el canal oficial de WhatsApp Business de Meta. Es el único canal que usamos: nada de aplicaciones no oficiales.',
    },
    {
      titulo: 'Comprueba',
      texto:
        'Verifica que el mensaje viene de verdad de WhatsApp y de tu cuenta, y descarta los repetidos, antes de que tu asistente lo lea.',
    },
    {
      titulo: 'Entrega solo a tu asistente',
      texto:
        'Cada mensaje llega únicamente al negocio al que pertenece. Aunque la puerta sea compartida, cada negocio recibe solo lo suyo.',
    },
    {
      titulo: 'Permite avisar',
      texto:
        'También deja enviar avisos con plantillas de mensaje aprobadas por Meta, como los recordatorios de citas.',
    },
  ],
};

export const novutienda = {
  titulo: 'NovuTienda',
  etiqueta: 'Próximamente',
  bajada:
    'Estamos preparando una herramienta para comercios: inventario con varios almacenes, caja, recibos y un sitio de ventas propio, conectados a tu asistente de WhatsApp. Todavía está en pruebas y no se puede contratar. Cuando esté disponible lo anunciaremos aquí.',
};

export const plataformaCierre = {
  titulo: '¿Quieres que conectemos tu número?',
  bajada: 'Cuéntanos tu negocio y te explicamos el alta, paso a paso.',
};
