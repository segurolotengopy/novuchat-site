/**
 * Medición: GA4 y píxel de Meta, ambos **detrás del consentimiento**.
 *
 * Nada se carga hasta que la persona acepta. Si rechaza, o si no responde, no
 * se descarga ni un byte de Google ni de Meta y no se escribe ninguna cookie de
 * terceros. La decisión se guarda en `localStorage`, no en una cookie, porque
 * es un dato del propio navegador y no necesita viajar en cada petición.
 *
 * Los dos orígenes están declarados en la CSP y justificados en `docs/csp.md`.
 * No se usa `eval` ni `innerHTML`: las etiquetas se crean con la API del DOM.
 */

const CLAVE = 'novuchat.consentimiento';

export type Consentimiento = 'aceptado' | 'rechazado';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & {
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      callMethod?: (...args: unknown[]) => void;
    };
    _fbq?: unknown;
  }
}

export function leerConsentimiento(): Consentimiento | null {
  try {
    const v = localStorage.getItem(CLAVE);
    return v === 'aceptado' || v === 'rechazado' ? v : null;
  } catch {
    // Ventana privada o almacenamiento bloqueado: se trata como «sin respuesta»,
    // que es la opción que no mide nada.
    return null;
  }
}

export function guardarConsentimiento(valor: Consentimiento): void {
  try {
    localStorage.setItem(CLAVE, valor);
  } catch {
    /* ver leerConsentimiento */
  }
}

let cargado = false;

/** Carga GA4 y el píxel. Idempotente: llamarla dos veces no duplica nada. */
export function activarMedicion(): void {
  if (cargado) return;
  cargado = true;

  const ga4 = import.meta.env['PUBLIC_GA4_MEASUREMENT_ID'];
  const pixel = import.meta.env['PUBLIC_META_PIXEL_ID'];

  if (ga4) {
    const etiqueta = document.createElement('script');
    etiqueta.async = true;
    etiqueta.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`;
    document.head.appendChild(etiqueta);

    window.dataLayer = window.dataLayer || [];
    const gtag: (...args: unknown[]) => void = (...args) => {
      window.dataLayer!.push(args);
    };
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', ga4, { anonymize_ip: true });
  }

  if (pixel) {
    // Equivalente al fragmento oficial de Meta, escrito a mano para no depender
    // de una cadena evaluada.
    const cola: unknown[] = [];
    const fbq = ((...args: unknown[]) => {
      if (window.fbq?.callMethod) window.fbq.callMethod(...args);
      else cola.push(args);
    }) as NonNullable<Window['fbq']>;
    fbq.queue = cola;
    fbq.loaded = true;
    fbq.version = '2.0';
    window.fbq = fbq;
    window._fbq = fbq;

    const etiqueta = document.createElement('script');
    etiqueta.async = true;
    etiqueta.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(etiqueta);

    fbq('init', pixel);
    fbq('track', 'PageView');
  }
}

/**
 * Registra un evento en las dos plataformas, si están activas.
 * `nombreMeta` usa los eventos estándar de Meta (Lead, Contact, ViewContent).
 */
export function registrarEvento(
  nombre: string,
  nombreMeta?: string,
  datos: Record<string, unknown> = {},
): void {
  window.gtag?.('event', nombre, datos);
  if (nombreMeta) window.fbq?.('track', nombreMeta, datos);
}
