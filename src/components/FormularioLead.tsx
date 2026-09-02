import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { llamar, mensajeDeError } from '../lib/firebase';
import { registrarEvento } from '../lib/medicion';

/**
 * Formulario de solicitud de demostración.
 *
 * Estados obligatorios del sistema de diseño: normal, cargando, error y éxito.
 * Cada uno dice qué pasó y qué hacer, nunca solo «error».
 *
 * A diferencia del sitio de referencia, que mostraba éxito pasara lo que
 * pasara, aquí el éxito **es real**: si la Function falla, se dice y se ofrece
 * WhatsApp, porque el mensaje de un prospecto no se puede perder en silencio.
 */

type Estado = 'normal' | 'cargando' | 'error' | 'exito';

interface Props {
  /** Plan preseleccionado, si vino de `/precios`. */
  planInicial?: string;
  whatsapp: string;
  correo: string;
  rubros: { id: string; nombre: string }[];
  planes: { id: string; nombre: string }[];
  /**
   * `demo` pide todo lo que hace falta para preparar una demostración;
   * `contacto` es la versión corta. Es la misma Function y el mismo camino de
   * código: una sola cosa que probar y que mantener.
   */
  variante?: 'demo' | 'contacto';
}

export default function FormularioLead({
  planInicial = '',
  whatsapp,
  correo,
  rubros,
  planes,
  variante = 'demo',
}: Props): JSX.Element {
  const completo = variante === 'demo';
  const [estado, setEstado] = useState<Estado>('normal');
  const [error, setError] = useState('');

  async function enviar(evento: JSX.TargetedEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const campos = new FormData(formulario);

    setEstado('cargando');
    setError('');

    try {
      await llamar<Record<string, unknown>, { ok: boolean }>('lead', {
        nombre: String(campos.get('nombre') ?? ''),
        // En la versión corta no se pregunta el negocio: se usa el nombre,
        // que es lo único que tenemos y basta para responder.
        negocio: String(campos.get('negocio') ?? campos.get('nombre') ?? ''),
        correo: String(campos.get('correo') ?? ''),
        whatsapp: String(campos.get('whatsapp') ?? ''),
        rubro: String(campos.get('rubro') ?? 'otro'),
        ciudad: String(campos.get('ciudad') ?? ''),
        clientes: String(campos.get('clientes') ?? ''),
        interes: String(campos.get('interes') ?? ''),
        plan: String(campos.get('plan') ?? ''),
        mensaje: String(campos.get('mensaje') ?? ''),
        empresaWeb: String(campos.get('empresaWeb') ?? ''),
        origen: {
          pagina: window.location.pathname,
          idioma: document.documentElement.lang === 'en' ? 'en' : 'es',
          utm: Object.fromEntries(
            [...new URLSearchParams(window.location.search).entries()]
              .filter(([clave]) => clave.startsWith('utm_'))
              .slice(0, 6),
          ),
        },
      });

      setEstado('exito');
      registrarEvento('generate_lead', 'Lead');
      formulario.reset();
    } catch (fallo) {
      setEstado('error');
      setError(mensajeDeError(fallo));
    }
  }

  if (estado === 'exito') {
    return (
      <div class="card elev-md" role="status">
        <p class="card-kicker">Listo</p>
        <h2 class="card-title">Te escribimos en menos de 24 horas hábiles</h2>
        <p class="card-body">
          Recibimos tus datos. Te contactamos por WhatsApp para coordinar la
          demostración, y no hace falta que prepares nada.
        </p>
        <button
          type="button"
          class="btn btn-secondary"
          onClick={() => setEstado('normal')}
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  const cargando = estado === 'cargando';

  return (
    <form class="card elev-md" onSubmit={enviar} noValidate={false}>
      <h2 class="card-title">
        {completo ? 'Cuéntanos de tu negocio' : 'Envíanos un mensaje'}
      </h2>

      <div class="field">
        <label for="nombre">Tu nombre</label>
        <input class="input" id="nombre" name="nombre" autocomplete="name" required minLength={2} maxLength={80} />
      </div>

      {completo && (
        <div class="field">
        <label for="negocio">Nombre del negocio</label>
        <input class="input" id="negocio" name="negocio" autocomplete="organization" required minLength={2} maxLength={120} />
      </div>
      )}

      {completo && (
        <div class="field">
        <label for="rubro">Rubro</label>
        <select class="input" id="rubro" name="rubro" required>
          {rubros.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
          <option value="otro">Otro</option>
        </select>
      </div>
      )}

      {completo && (
        <div class="field">
        <label for="ciudad">Ciudad</label>
        <input class="input" id="ciudad" name="ciudad" autocomplete="address-level2" maxLength={80} />
      </div>
      )}

      <div class="field">
        <label for="whatsapp">WhatsApp</label>
        <input class="input" id="whatsapp" name="whatsapp" type="tel" value="+591 " autocomplete="tel" required />
        <p class="field-pista">Con el código de país, así te podemos escribir.</p>
      </div>

      <div class="field">
        <label for="correo">Correo</label>
        <input class="input" id="correo" name="correo" type="email" autocomplete="email" required maxLength={160} />
      </div>

      {completo && (
        <div class="field">
        <label for="clientes">¿Cuántos clientes atiendes por día?</label>
        <select class="input" id="clientes" name="clientes">
          <option>1 a 10</option>
          <option>10 a 30</option>
          <option>30 a 100</option>
          <option>más de 100</option>
        </select>
      </div>
      )}

      {completo && (
        <div class="field">
        <label for="interes">¿Qué te interesa?</label>
        <select class="input" id="interes" name="interes">
          <option>Agenda de citas</option>
          <option>Pedidos y cobros</option>
          <option>Las dos cosas</option>
        </select>
      </div>
      )}

      {completo && (
        <div class="field">
        <label for="plan">Plan que te interesa</label>
        <select class="input" id="plan" name="plan">
          <option value="">Todavía no sé</option>
          {planes.map((p) => (
            <option key={p.id} value={p.id} selected={p.id === planInicial}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>
      )}

      <div class="field">
        <label for="mensaje">Algo que quieras contarnos</label>
        <textarea class="input" id="mensaje" name="mensaje" rows={4} maxLength={2000} />
      </div>

      {/* Trampa para robots: una persona nunca la ve ni la puede completar. */}
      <div class="trampa" aria-hidden="true">
        <label for="empresaWeb">No completar</label>
        <input id="empresaWeb" name="empresaWeb" tabIndex={-1} autocomplete="off" />
      </div>

      <label class="radio" style="align-items: flex-start; gap: 10px">
        <input
          type="checkbox"
          name="privacidad"
          required
          style="position: static; width: auto; height: auto; opacity: 1"
        />
        <span style="font-size: 14px">
          He leído la <a href="/privacidad">política de privacidad</a> y acepto que
          me contacten.
        </span>
      </label>

      <button class="btn btn-cta btn-block btn-grande" type="submit" disabled={cargando}>
        {cargando ? 'Enviando…' : completo ? 'Pedir la demostración' : 'Enviar'}
      </button>

      {/* `aria-live`: quien usa lector de pantalla se entera del resultado sin
          tener que ir a buscarlo. */}
      <div aria-live="polite">
        {estado === 'error' && (
          <div class="field-error">
            <p style="margin: 0 0 var(--space-2)">{error}</p>
            <a class="btn btn-secondary" href={`https://wa.me/${whatsapp}`} rel="noopener">
              Escribir por WhatsApp
            </a>{' '}
            <a class="btn btn-ghost" href={`mailto:${correo}`}>
              {correo}
            </a>
          </div>
        )}
      </div>
    </form>
  );
}
