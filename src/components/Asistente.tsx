import { useEffect, useRef, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { llamar, mensajeDeError } from '../lib/firebase';
import { registrarEvento } from '../lib/medicion';

/**
 * Asistente virtual del sitio.
 *
 * Se presenta **siempre** como una inteligencia artificial, en el encabezado y
 * en el saludo. Es la prohibición 7 de `CLAUDE.md` y no depende de que el
 * modelo se acuerde: está escrito en la interfaz.
 *
 * Todo el conocimiento vive en el servidor. Aquí no hay ni una respuesta
 * precargada salvo el saludo y el mensaje de caída: duplicar la base de
 * conocimiento en el cliente fue uno de los errores del sitio de referencia, y
 * además la dejaría a la vista de cualquiera.
 */

interface Mensaje {
  de: 'cliente' | 'asistente';
  texto: string;
}

const SALUDO: Mensaje = {
  de: 'asistente',
  texto:
    'Hola. Soy el asistente virtual de NovuChat y soy una inteligencia artificial. ' +
    '¿Qué te gustaría saber?',
};

interface Props {
  whatsapp: string;
}

/** Identificador de sesión, solo para agrupar los turnos de una conversación. */
function nuevaSesion(): string {
  return `s-${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
}

export default function Asistente({ whatsapp }: Props): JSX.Element {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([SALUDO]);
  const [texto, setTexto] = useState('');
  const [esperando, setEsperando] = useState(false);
  const [sugerencias, setSugerencias] = useState<string[]>([
    '¿Cuánto cuesta?',
    '¿Cómo se instala?',
    'Quiero una demostración',
  ]);

  const sesion = useRef<string>('');
  const fondo = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);

  if (sesion.current === '') sesion.current = nuevaSesion();

  useEffect(() => {
    if (abierto) campo.current?.focus();
  }, [abierto]);

  useEffect(() => {
    fondo.current?.scrollTo({ top: fondo.current.scrollHeight });
  }, [mensajes, esperando]);

  async function preguntar(pregunta: string): Promise<void> {
    const limpia = pregunta.trim();
    if (limpia === '' || esperando) return;

    const conMio: Mensaje[] = [...mensajes, { de: 'cliente', texto: limpia }];
    setMensajes(conMio);
    setTexto('');
    setEsperando(true);

    try {
      const respuesta = await llamar<
        Record<string, unknown>,
        { respuesta: string; sugerencias?: string[] }
      >('asistente', {
        mensaje: limpia,
        // Solo los últimos ocho turnos: el servidor no acepta más, y mandar
        // menos abarata cada llamada.
        historial: conMio.slice(-9, -1).map((m) => ({
          rol: m.de === 'cliente' ? 'usuario' : 'asistente',
          texto: m.texto,
        })),
        idioma: document.documentElement.lang === 'en' ? 'en' : 'es',
        pagina: window.location.pathname,
        sesion: sesion.current,
      });

      setMensajes([...conMio, { de: 'asistente', texto: respuesta.respuesta }]);
      if (respuesta.sugerencias) setSugerencias(respuesta.sugerencias);
    } catch (fallo) {
      // Respaldo: no se inventa una respuesta, se ofrece una vía que funciona.
      setMensajes([
        ...conMio,
        {
          de: 'asistente',
          texto: `${mensajeDeError(fallo)} También puedes ver los precios en /precios o pedir una demostración en /demo.`,
        },
      ]);
    } finally {
      setEsperando(false);
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        class="asistente-boton"
        onClick={() => {
          setAbierto(true);
          registrarEvento('abrir_asistente');
        }}
        aria-label="Abrir el asistente virtual"
      >
        <img src="/isotipo.svg" alt="" width="30" height="30" />
        <span>Asistente virtual</span>
      </button>
    );
  }

  return (
    <div class="asistente" role="dialog" aria-label="Asistente virtual de NovuChat">
      <header class="asistente-cabecera">
        <div>
          <strong>Asistente virtual</strong>
          <span class="texto-apagado" style="display: block; font-size: 12px">
            Es una inteligencia artificial
          </span>
        </div>
        <button
          type="button"
          class="btn btn-icon btn-secondary"
          onClick={() => setAbierto(false)}
          aria-label="Cerrar el asistente"
        >
          ✕
        </button>
      </header>

      <div class="asistente-cuerpo" ref={fondo} aria-live="polite">
        {mensajes.map((m, i) => (
          <div key={i} class={`burbuja burbuja-${m.de}`}>
            <span class="solo-lectores">
              {m.de === 'cliente' ? 'Tú:' : 'Asistente:'}
            </span>
            {m.texto}
          </div>
        ))}

        {esperando && (
          <div class="burbuja burbuja-asistente escribiendo" aria-label="Escribiendo">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <div class="asistente-chips">
        {sugerencias.map((s) => (
          <button key={s} type="button" class="chip" onClick={() => void preguntar(s)}>
            {s}
          </button>
        ))}
      </div>

      <form
        class="asistente-pie"
        onSubmit={(e) => {
          e.preventDefault();
          void preguntar(texto);
        }}
      >
        <label class="solo-lectores" for="asistente-texto">
          Escribe tu pregunta
        </label>
        <input
          id="asistente-texto"
          ref={campo}
          class="input"
          value={texto}
          maxLength={1000}
          placeholder="Escribe tu pregunta…"
          onInput={(e) => setTexto(e.currentTarget.value)}
        />
        <button class="btn btn-cta" type="submit" disabled={esperando || texto.trim() === ''}>
          Enviar
        </button>
      </form>

      <p class="asistente-nota">
        ¿Prefieres una persona?{' '}
        <a href={`https://wa.me/${whatsapp}`} rel="noopener">
          Escríbenos por WhatsApp
        </a>
        .
      </p>
    </div>
  );
}
