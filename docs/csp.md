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

## Scripts en línea: sellado automático

El sitio tiene cuatro `<script>` en línea que no se pueden externalizar: el
anti-destello del tema y los arranques de hidratación que Astro genera para cada
isla (`client:idle`, `client:visible`). Con `script-src 'self'` el navegador los
bloquea, y el fallo es **mudo**: el formulario y el asistente dejan de responder
sin un error visible. Lo detectó la prueba de humo, no el ojo.

Las alternativas eran `'unsafe-inline'` —que anula la protección entera— o un
`nonce`, que exige generar un valor por respuesta y Firebase Hosting sirve
archivos estáticos. Queda el **hash**.

**Los hashes no se mantienen a mano.** `scripts/sellar-csp.mjs` corre dentro de
`pnpm build`: recorre `dist/`, calcula el SHA-256 de cada script en línea y
reescribe `script-src` en `firebase.json`. `pnpm csp:verificar` —parte de
`pnpm verificar`— falla si la política quedó vieja respecto del `dist/` actual.

Los bloques `application/ld+json` se excluyen a propósito: el navegador no los
ejecuta y la CSP no los mira.

El anti-destello, por ser el único que escribimos nosotros, queda documentado
aparte. Su contenido exacto (una sola línea, sin salto final) vive en
`src/layouts/Base.astro` como `antiDestello`:

  ```js
  (function(){try{var t=localStorage.getItem('novuchat.tema');var o=t==='oscuro'||((!t||t==='sistema')&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(o){r.dataset.tema='oscuro'}r.style.colorScheme=o?'dark':'light'}catch(e){}})();
  ```

Si cambia una sola letra el hash cambia, y `pnpm build` lo recalcula solo.

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

## Avisos de OWASP ZAP relacionados con cabeceras (triaje, 2026-09-03)

El escaneo pasivo del CI reporta **cero fallos** (`FAIL-NEW: 0`, `PASS: 61`) y
catorce avisos —el resumen los agrupa en nueve; el informe JSON los desglosa—. Se documentan aquí porque tres de ellos tocan decisiones de esta
política y conviene que la próxima persona que los vea no los reabra desde cero.
Ninguno se silenció con `IGNORE`: siguen apareciendo en cada informe.

| Aviso | Veredicto | Razón |
|---|---|---|
| `10055` CSP: `style-src unsafe-inline` | **Aceptado, ya documentado** | reCAPTCHA Enterprise inyecta estilos en línea y el sitio usa atributos `style`. Sin `unsafe-inline` el widget no se dibuja. El vector que preocupa —inyección de contenido— está cerrado por otro lado: `script-src` no lo lleva y el CI prohíbe `innerHTML`, `set:html`, `eval` y `new Function`. |
| `10031` Atributo HTML controlable por el usuario (potencial XSS) | **No aplicable** | Es una heurística sobre reflexión de parámetros. El sitio es **estático**: la respuesta se construye en el build y no existe ningún camino por el que un parámetro de la petición llegue al HTML. La única escritura al DOM es de las islas, y ninguna usa `innerHTML` (verificado por `pnpm verificar`). |
| `90004` Falta `Cross-Origin-Embedder-Policy` | **Decisión: no se añade** | `require-corp` obliga a que **todo** recurso de terceros mande `Cross-Origin-Resource-Policy`. reCAPTCHA, GA4 y el píxel de Meta no lo hacen: la cabecera rompería el formulario y la analítica. Lo que habilita —aislamiento de origen para `SharedArrayBuffer` y temporizadores de alta resolución— no se usa. `Cross-Origin-Opener-Policy` sí está puesta, que es la que aporta aislamiento sin romper nada. |
| `10015`, `10049`, `10050` (caché) | No aplicable | Los activos con huella se sirven `immutable` **a propósito** (ver la sección de cabeceras). No hay respuestas con datos personales que cachear: el sitio no tiene sesión. |
| `10024` Información sensible en la URL | Falso positivo | Lo dispara `?utm_*` del enlace de la campaña. No hay datos personales en ninguna URL. |
| `10094` Divulgación de Base64 | Falso positivo | Son los hashes SHA-256 de la propia CSP y los `integrity` del build. |
| `90005` Faltan `Sec-Fetch-Dest`, `-Mode`, `-Site`, `-User` | Fuera de nuestro control | Son cabeceras de **petición** que pone el navegador; ZAP no las manda. Nada que corregir en el servidor. |
| `120000` Información en `localStorage` | Sin datos personales | Solo hay dos claves, `novuchat.tema` y `novuchat.consentimiento`: la preferencia de tema y la decisión sobre la analítica. El sitio no tiene sesión ni guarda nada del visitante. |
| `90004` Falta `Cross-Origin-Resource-Policy` | No aplicable | Misma regla que COEP. `CORP` protege recursos ante quien los incruste; aquí lo que se sirve es un sitio público pensado para verse. |

Los tres primeros se revisan en cada release. Si algún día se deja de usar
reCAPTCHA, `10055` y `90004` cambian de veredicto.
