# Política de seguridad de contenido — excepciones y por qué existen

> Formato heredado de `~/NovuChat/admin/SEGURIDAD.md` §5bis. **Cada excepción de
> la CSP lleva aquí una línea con qué habilita y qué se rompe si se quita.** Una
> excepción sin entrada en este archivo es un defecto.
>
> La política vive en `firebase.json` y la aplica Firebase Hosting. No se puede
> probar con `astro dev`: use `pnpm build && pnpm csp` (puerto 5245) y mire la
> consola del navegador. Cualquier «Refused to…» es un defecto, no un aviso.

## Directivas y sus excepciones

| Directiva | Origen permitido | Qué habilita | Qué se rompe si se quita |
|---|---|---|---|
| `default-src` | `'none'` | Todo lo no declarado queda prohibido por omisión | — |
| `script-src` | `'self'` | Nuestro JavaScript y las islas de Preact | El sitio deja de ser interactivo |
| | `https://www.google.com`, `https://www.gstatic.com` | reCAPTCHA Enterprise, que sostiene App Check | App Check no obtiene token: las Functions rechazan al visitante legítimo |
| | `https://www.googletagmanager.com` | Etiqueta de Google (GA4) | No hay analítica de audiencia ni medición de campañas |
| | `https://connect.facebook.net` | Píxel de Meta | No hay medición ni remarketing de la pauta en Meta |
| `style-src` | `'self' 'unsafe-inline'` | Estilos propios y los que reCAPTCHA inyecta en línea | El widget de reCAPTCHA se ve roto. **`'unsafe-inline'` nunca en `script-src`.** Se puede retirar el día que se use el widget invisible sin estilos en línea |
| `img-src` | `'self' data:` | Imágenes propias y SVG en línea | Se pierden logotipo, capturas y el QR de demostración |
| | `https://www.gstatic.com` | Recursos gráficos de reCAPTCHA | Widget incompleto |
| | `https://www.google-analytics.com`, `https://www.facebook.com` | Balizas de medición por imagen de GA4 y del píxel | Se pierden eventos de medición |
| `font-src` | `'self'` | Archivo servida desde `/fuentes/` | Se cae a la tipografía del sistema |
| `connect-src` | `'self'` | Peticiones al propio origen | — |
| | `https://firebaseappcheck.googleapis.com`, `https://content-firebaseappcheck.googleapis.com` | Canje del token de App Check | Ni el formulario ni el asistente funcionan |
| | `https://www.google.com` | Evaluación de reCAPTCHA | Igual que arriba |
| | `https://us-east1-novuchat-site.cloudfunctions.net` | Llamadas a las Functions `lead` y `asistente` | El formulario y el asistente fallan en silencio. **Depende de la región**: si las Functions se mueven, hay que cambiar este origen |
| | `https://www.google-analytics.com`, `https://analytics.google.com`, `https://region1.google-analytics.com` | Envío de eventos de GA4 | Sin analítica |
| | `https://www.facebook.com` | Envío de eventos del píxel | Sin medición de pauta |
| `frame-src` | `https://www.google.com` | Desafío visual de reCAPTCHA cuando el puntaje es bajo | El visitante sospechoso no puede completar el desafío y queda bloqueado |
| | `https://www.facebook.com` | Marco de respaldo del píxel | Medición degradada |
| `frame-ancestors` | `'none'` | Nadie puede incrustar el sitio | Protege de clickjacking (riesgo S-7) |
| `base-uri` | `'none'` | Impide reescribir la base de las URL relativas | Vector de inyección |
| `form-action` | `'self'` | Los formularios solo pueden enviarse a nuestro origen. **FormSubmit se llama desde la Function, no desde el navegador**, justamente para no abrir esto | Un tercero podría recibir los datos del formulario |
| `object-src` | `'none'` | Sin `<object>`, `<embed>` ni Flash | Vector clásico |
| `worker-src`, `manifest-src` | `'self'` | Workers y manifiesto propios | — |
| `upgrade-insecure-requests` | — | Fuerza HTTPS en subrecursos | Contenido mixto |

## Scripts en línea

El script anti-destello del tema (aplica `data-tema` **antes del primer
pintado**, para evitar el salto claro→oscuro) es el único `<script>` en línea del
sitio. Se autoriza por **hash SHA-256**, nunca con `'unsafe-inline'`.

- **Hash vigente:** `sha256-9D8Iby2VzhAdvSMmJ+6wMz0Xz3M/3V6Jfl9QJOalgFU=`
- Contenido exacto que lo produce (una sola línea, sin salto final), definido en
  `src/layouts/Base.astro` como `antiDestello`:

  ```js
  (function(){try{var t=localStorage.getItem('novuchat.tema');var o=t==='oscuro'||((!t||t==='sistema')&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(o){r.dataset.tema='oscuro'}r.style.colorScheme=o?'dark':'light'}catch(e){}})();
  ```

- Recalcular así:

  ```bash
  printf '%s' "$CONTENIDO" | openssl dgst -sha256 -binary | openssl base64
  ```
- Si el script cambia una sola letra, el hash cambia y el navegador lo bloquea
  sin avisar. Procedimiento: modificar el script, recalcular el hash, actualizar
  `firebase.json` y esta tabla, y verificar con `pnpm csp`.

## Cabeceras que acompañan a la CSP

| Cabecera | Valor | Por qué |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Riesgo S-8: degradación a HTTP |
| `X-Content-Type-Options` | `nosniff` | Impide que el navegador adivine tipos |
| `X-Frame-Options` | `DENY` | Refuerzo de `frame-ancestors` para navegadores viejos |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | El sitio público **sí** quiere que sus enlaces salientes lleven origen; por eso no es `no-referrer` como en la consola |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=(), payment=(), usb=()` | Ninguna de esas capacidades se usa |
| `Cross-Origin-Opener-Policy` | `same-origin` | Aísla el contexto de navegación |

## El resto del JavaScript NO puede ir en línea

`astro.config.mjs` fija `vite.build.assetsInlineLimit: 0`. **No lo cambie.**

Con el valor por defecto, Astro incrusta los scripts pequeños de los componentes
dentro del HTML. Como no llevan hash, la CSP los rechaza y el fallo es
completamente silencioso: no hay error en la página, simplemente el conmutador de
tema y el banner de consentimiento dejan de responder. Pasó durante la Fase 1 y
se detectó comprobando el estado del DOM, no mirando la página.

La prueba de humo `pruebas/humo/sitio.spec.ts` recorre las dieciocho rutas y
falla ante cualquier mensaje «Refused to…», para que esto no pueda repetirse sin
que alguien se entere.

## Regla de mantenimiento

Cualquier dominio nuevo es una **decisión explícita**, no un ajuste de
conveniencia: primero se busca la alternativa autoalojada. Si no la hay, se
agrega aquí con su justificación antes de tocar `firebase.json`.
