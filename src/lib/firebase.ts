import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from 'firebase/app-check';
import { getFunctions, httpsCallable, type Functions } from 'firebase/functions';

/**
 * Cliente de Firebase para las islas.
 *
 * Solo se carga cuando una isla lo necesita: el resto del sitio es HTML puro y
 * no descarga nada de esto.
 *
 * Lo único que hace el navegador con Firebase es **llamar a las Functions**.
 * Nunca lee ni escribe Firestore: `firestore.rules` lo niega y así el dato de
 * un prospecto no depende de que el navegador se porte bien (riesgo S-5).
 */

const config = {
  apiKey: import.meta.env['PUBLIC_FIREBASE_API_KEY'],
  authDomain: import.meta.env['PUBLIC_FIREBASE_AUTH_DOMAIN'],
  projectId: import.meta.env['PUBLIC_FIREBASE_PROJECT_ID'],
  storageBucket: import.meta.env['PUBLIC_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: import.meta.env['PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
  appId: import.meta.env['PUBLIC_FIREBASE_APP_ID'],
};

/**
 * Región de las Cloud Functions. **Se valida en build.**
 *
 * Tiene que coincidir con la que declaran las propias Functions
 * (`region: 'us-east1'` en `functions/src/asistente.ts` y `lead.ts`). Si no
 * coincide, el SDK construye una URL de un despliegue que no existe
 * —`https://<region>-novuchat-site.cloudfunctions.net/…`— y la llamada muere en
 * el navegador: sin registro en la nube, sin error 4xx, solo un «No pudimos
 * enviarlo» en pantalla.
 *
 * Pasó de verdad. `PUBLIC_REGION_FUNCTIONS` conservó `southamerica-east1` desde
 * el arranque del proyecto, cuando las Functions ya se habían movido a
 * `us-east1`. **El asistente y el formulario nunca funcionaron desde un
 * navegador**, y no se detectó porque las pruebas de la Function se hacían
 * contra su URL directa, que no pasa por esta constante.
 *
 * Falla el build, como con `PUBLIC_URL_CONSOLA`: es una comprobación barata
 * contra un fallo caro y silencioso.
 */
const REGION_FUNCTIONS = 'us-east1';

function resolverRegion(): string {
  const valor = import.meta.env['PUBLIC_REGION_FUNCTIONS'];
  if (valor && valor !== REGION_FUNCTIONS) {
    throw new Error(
      `PUBLIC_REGION_FUNCTIONS="${valor}" no coincide con la región donde están ` +
        `desplegadas las Functions ("${REGION_FUNCTIONS}"). El navegador llamaría a ` +
        'una URL inexistente y el asistente y el formulario fallarían en silencio.',
    );
  }
  return REGION_FUNCTIONS;
}

const REGION = resolverRegion();

let app: FirebaseApp | undefined;
let funciones: Functions | undefined;

function iniciar(): Functions {
  if (funciones) return funciones;

  app = initializeApp(config);

  const claveSitio = import.meta.env['PUBLIC_RECAPTCHA_SITE_KEY'];
  if (claveSitio) {
    // App Check comprueba que la petición sale de nuestro sitio y no de un
    // script. En desarrollo se usa un token de depuración registrado en la
    // consola; sin él, App Check bloquearía el trabajo local.
    if (import.meta.env.DEV) {
      (globalThis as Record<string, unknown>)['FIREBASE_APPCHECK_DEBUG_TOKEN'] = true;
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(claveSitio),
      isTokenAutoRefreshEnabled: true,
    });
  }

  funciones = getFunctions(app, REGION);
  return funciones;
}

/** Llama a una Function por su nombre, con tipos a los dos lados. */
export async function llamar<Entrada, Salida>(
  nombre: 'lead' | 'asistente',
  datos: Entrada,
): Promise<Salida> {
  const invocar = httpsCallable<Entrada, Salida>(iniciar(), nombre);
  const respuesta = await invocar(datos);
  return respuesta.data;
}

/** Traduce un error de Functions a algo que una persona pueda leer. */
export function mensajeDeError(error: unknown): string {
  const codigo = (error as { code?: string } | undefined)?.code ?? '';
  const mensaje = (error as { message?: string } | undefined)?.message ?? '';

  if (codigo.includes('resource-exhausted')) {
    return mensaje || 'Recibimos varios envíos desde aquí. Escríbenos por WhatsApp.';
  }
  if (codigo.includes('invalid-argument')) {
    return mensaje || 'Revisa los datos, algo no quedó bien.';
  }
  if (codigo.includes('unauthenticated') || codigo.includes('permission-denied')) {
    return 'No pudimos verificar que la petición venga de este sitio. Recarga la página e inténtalo otra vez.';
  }
  return 'No pudimos enviarlo. Inténtalo de nuevo o escríbenos por WhatsApp.';
}
