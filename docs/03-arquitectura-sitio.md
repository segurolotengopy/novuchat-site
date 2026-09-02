# 03 — Arquitectura del sitio `novuchat.site`

> Decisiones técnicas para que Claude Code construya el sitio. Cada decisión lleva su
> *porqué*. Donde hay alternativas razonables se indica la recomendada y el costo de la
> otra.

---

## 1. Objetivos técnicos

1. **Sitio comercial completo** (no una landing de una sección): héroe, problema,
   solución, verticales, cómo funciona, consola, precios, casos/demos, FAQ, sobre
   nosotros, contacto, privacidad, términos.
2. **Asistente IA** de ventas en la página, con las mismas garantías que la consola
   (App Check, filtro servidor, límite de tasa, sin credenciales en el cliente).
3. **Captura de leads** confiable, con notificación por correo y por WhatsApp al equipo.
4. **Enlace a la consola** visible en el header ("Ingresar") y en el footer.
5. **Seguridad al nivel de la consola**: CSP estricta, sin CDN, sin `innerHTML` con datos
   de usuario, reglas de Firestore probadas.
6. **Rendimiento**: Lighthouse ≥ 90 en móvil (el público entra desde Android de gama
   media), peso inicial < 300 KB sin contar el video.
7. **Bilingüe ES/EN** desde el inicio (el patrón de AAB1 funciona; EN es secundario).

---

## 2. Stack

| Capa | Elección | Por qué |
|---|---|---|
| Generador | **Astro 5** (salida estática, islas de interactividad) | Un sitio comercial es 95 % contenido estático; Astro entrega HTML puro sin JavaScript salvo en los componentes que lo necesitan (chat, formulario, selector de tema). Mejor LCP y SEO que una SPA. Soporta i18n por rutas (`/`, `/en/`) de forma nativa. |
| Islas interactivas | **Preact** (o React si se prefiere compartir componentes con la consola) | El chat y el formulario necesitan estado; Preact pesa 4 KB. Si se quiere reutilizar `diseno.css` y componentes de la consola, React es válido (misma ergonomía, +40 KB). |
| Estilos | **CSS plano con tokens** (`src/estilos/tokens.css` + `componentes.css`), con los **mismos nombres de token y clases** que `~/NovuChat/admin/web/src/diseno.css` y los valores del artefacto "Panel NovuChat" (doc 08) | Misma disciplina que la consola: un solo lugar para el look; un cambio de marca se propaga a los dos productos; sin Tailwind ni CDN (la CSP lo prohíbe). |
| Tipografía | **Archivo** variable, autoalojada en `/fuentes/` (copiar los `.woff2` de la consola) | Coherencia con la consola y `font-src 'self'`. |
| Íconos | SVG en línea (conjunto propio, ≤ 24 íconos) | Sin Google Fonts Icons ni CDN. |
| Hosting | **Firebase Hosting** del proyecto `novuchat-site` | Requisito del proyecto; cabeceras y rewrites en `firebase.json`. |
| Backend | **Cloud Functions v2 (Node 22)** en el mismo proyecto: `asistente`, `lead` | Igual patrón que AAB1 pero con las correcciones del doc 01. |
| Datos | **Cloud Firestore** (colecciones `leads`, `conversacionesAsistente`, `limites`) | Sin acceso de lectura desde el cliente; escritura solo vía Functions. |
| Anti-abuso | **App Check con reCAPTCHA Enterprise** (modo monitoreo → exigido) | Igual que la consola. |
| IA | **Gemini 2.5 Flash** vía `@google/genai` en la Function (clave en Secret Manager); interfaz de proveedor intercambiable a Anthropic | Coherente con "Gemini en demos, Claude en producción". |
| Correo | **Resend** (clave en Secret Manager) desde la Function `lead`; alternativa sin clave: FormSubmit **declarado en privacidad** | Evita un tercero gratuito con datos de prospectos y permite plantillas propias. |
| Analítica | **Ninguna en la fase 1**, o GA4 solo si se acepta la excepción de CSP y se declara en privacidad | Cada dominio externo es superficie de ataque; los leads y las conversaciones del asistente dan más señal comercial que el pageview. |
| Pruebas | Vitest (unidad), `firebase-functions-test`, `@firebase/rules-unit-testing` (emulador), Playwright (humo), Lighthouse CI, `axe-core` | Patrón ya existente en `~/NovuChat/admin/pruebas/`. |
| CI/CD | GitHub Actions con **Workload Identity Federation** (sin claves JSON), estándar DevSecOps v2 (`aplicar-estandar-devsecops`) | Ya aplicado al repositorio `NovuChat`; se replica. |
| Gestor de paquetes | pnpm, Node 24 | Igual que la consola. |

**Alternativa considerada y descartada:** repetir el enfoque de AAB1 (HTML + Vite sin
framework). Funciona para 6 secciones y un idioma; con 12 páginas × 2 idiomas, componentes
repetidos (tarjetas de plan, FAQ, testimonios) y JSON-LD por página, el mantenimiento a
mano se vuelve frágil. Astro conserva la sencillez (HTML en archivos `.astro`) y agrega
componentes, layouts e i18n.

---

## 3. Mapa del sitio (rutas)

```
/                       Inicio (héroe, problema, solución, verticales, consola, precios, FAQ corto, CTA)
/como-funciona          Proceso de 48 h, arquitectura explicada para no técnicos, qué necesita el cliente
/soluciones/salud-belleza
/soluciones/gastronomia
/soluciones/comercio     Una página por vertical: casos de uso, conversación de ejemplo, plan recomendado
/consola                 Qué ve el dueño: pantallas, roles, seguridad del aislamiento, enlace "Ingresar"
/precios                 Planes, excedentes, instalación, qué incluye, calculadora simple (opcional)
/demo                    Solicitar demostración (formulario largo) + conversación simulada embebida (Simulador v2)
/nosotros                AAB1, Andres y Silvana, por qué Bolivia, compromiso ético (IA declarada, cobros rotulados)
/preguntas-frecuentes    FAQ completo (JSON-LD FAQPage)
/contacto                Formulario corto + WhatsApp + correo
/privacidad              Política de privacidad (URL estable para Meta)
/terminos                Términos del servicio y condiciones de los planes
/en/...                  Espejo en inglés de las páginas principales (inicio, precios, consola, contacto, privacidad)
```

**Enlace a la consola:** botón "Ingresar" en el header (secundario, visible en móvil),
tarjeta en la sección "Consola" del inicio, y enlace en el footer. Destino configurable
por variable `PUBLIC_URL_CONSOLA` (ver §7).

---

## 4. Estructura del repositorio

```
novuchat-site/
├── CLAUDE.md                      instrucciones para Claude Code (este paquete)
├── docs/                          los documentos 01–07
├── astro.config.mjs               i18n: defaultLocale 'es', locales ['es','en']
├── firebase.json                  hosting (cabeceras, rewrites, caché), functions, emulators
├── .firebaserc                    { "projects": { "default": "novuchat-site" } }
├── firestore.rules                negación total desde el cliente (todo pasa por Functions)
├── firestore.indexes.json
├── package.json / pnpm-workspace.yaml
├── public/
│   ├── fuentes/archivo-*.woff2    copiadas de ~/NovuChat/admin/web/public/fuentes/
│   ├── logo.svg · logo-blanco.svg · favicon.svg · og.png (1200×630)
│   └── robots.txt · sitemap (generado por @astrojs/sitemap)
├── src/
│   ├── layouts/Base.astro         head (SEO, JSON-LD, OG), header, footer, selector tema/idioma
│   ├── pages/                     rutas ES; src/pages/en/ rutas EN
│   ├── components/
│   │   ├── seccion/               Heroe, Problema, Solucion, Verticales, Consola, Precios, FAQ, CTA
│   │   ├── ui/                    Boton, Tarjeta, Insignia, Acordeon, Pestanas
│   │   ├── Asistente.tsx          isla: chat flotante (Preact)
│   │   └── FormularioLead.tsx     isla: formulario con validación y estados
│   ├── contenido/                 datos en TS/JSON: planes, verticales, faq, equipo (ES y EN)
│   ├── i18n/                      diccionarios ui.es.ts / ui.en.ts + utilidades
│   ├── estilos/tokens.css · base.css · componentes.css
│   └── lib/firebase.ts            init + App Check (solo en islas)
├── functions/
│   ├── src/index.ts               exporta asistente y lead
│   ├── src/asistente.ts           validación, filtro, límite de tasa, proveedor IA
│   ├── src/lead.ts                validación, Firestore, correo, aviso a WhatsApp (opcional)
│   ├── src/conocimiento.ts        base de conocimiento (ÚNICA copia, en el servidor)
│   ├── src/saneo.ts               escapado y límites (copiar de la consola)
│   └── src/proveedores/{gemini,anthropic}.ts
├── pruebas/                       reglas, saneo, asistente, humo
└── .github/workflows/             ci.yml (pruebas, lint, prohibiciones) · despliegue.yml (OIDC)
```

---

## 5. Componentes de backend

### 5.1 Function `asistente` (onCall, `enforceAppCheck: true`)

Flujo:

1. Rechazar sin `request.app`. Validar `mensaje` (string, ≤ 1 000 caracteres) e
   `historial` (≤ 8 turnos, cada uno ≤ 1 000 caracteres, roles válidos).
2. **Límite de tasa**: documento `limites/{hashDeTokenAppCheck|ip}` con ventana deslizante
   (p. ej. 20 mensajes / 10 min y 100 / día). Si se excede → respuesta cortés con enlace
   al formulario, código `resource-exhausted`.
3. **Filtro de términos** por palabra completa (`\b`) sobre texto normalizado; respuesta
   neutra ("Sobre acceso y configuración interna no puedo ayudarte; para eso está el
   formulario…").
4. Prompt de sistema = reglas + base de conocimiento (`conocimiento.ts`) + fecha/hora
   `America/La_Paz` + idioma preferido del cliente (`navigator.language` enviado por la
   isla). El prompt del sistema **se reinyecta al final** del contexto como recordatorio
   de reglas, para resistir historiales manipulados.
5. Llamada al proveedor (`gemini-2.5-flash`, temperatura 0,2, ≤ 400 tokens, 12 s de
   tiempo máximo) con respaldo a un segundo modelo.
6. Registro en `conversacionesAsistente/{sesion}` (mensaje, respuesta, idioma, página de
   origen, tiempos) **sin IP en claro** (hash con sal) — es la fuente de inteligencia
   comercial.
7. Respuesta `{ respuesta, sugerencias?: string[] }` (chips de seguimiento: "Ver precios",
   "Pedir demo").

Reglas del prompt (heredadas de la consola): se presenta como asistente virtual de
NovuChat, **dice que es una IA si le preguntan**, no inventa precios ni plazos fuera de
la base de conocimiento, deriva cotizaciones y demos al formulario, responde en el idioma
del usuario, no habla de la infraestructura.

**Respaldo en el cliente**: si la Function falla, la isla muestra tres respuestas fijas
(precios, cómo funciona, contacto) leídas de `contenido/` — sin base de conocimiento
duplicada, solo enlaces.

### 5.2 Function `lead` (onCall, `enforceAppCheck: true`)

1. Validación estricta de esquema (nombre 2–80, correo RFC, teléfono E.164 con código de
   país, rubro ∈ lista, tamaño de mensaje ≤ 2 000, honeypot vacío).
2. Deduplicación: mismo correo en 10 min → responde éxito sin reenviar.
3. Escritura en `leads/{id}` con `origen` (página, idioma, UTM), `estado: 'nuevo'`.
4. Correo al equipo (Resend, plantilla con tabla) y **acuse al prospecto** (opcional).
5. Aviso por WhatsApp al equipo mediante plantilla aprobada (opcional, fase 2; reutiliza la
   WABA y `scripts/listar-plantillas.sh` de `~/NovuChat`).
6. Respuesta `{ ok: true }`; la interfaz muestra éxito real, y error real si falla dos
   veces (a diferencia de AAB1, que siempre muestra éxito).

### 5.3 Firestore

- `firestore.rules`: **`allow read, write: if false;`** para todo. El cliente nunca toca
  Firestore; solo las Functions con el SDK Admin. Prueba con el emulador que confirme la
  negación.
- Colecciones: `leads`, `conversacionesAsistente`, `limites`. TTL de 90 días en
  `conversacionesAsistente` y `limites` (política TTL de Firestore).

---

## 6. `firebase.json` (base)

```json
{
  "hosting": {
    "public": "dist",
    "cleanUrls": true,
    "trailingSlash": "never",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      { "source": "**", "headers": [
        { "key": "Content-Security-Policy",
          "value": "default-src 'none'; script-src 'self' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.gstatic.com; font-src 'self'; media-src 'self'; connect-src 'self' https://firebaseappcheck.googleapis.com https://content-firebaseappcheck.googleapis.com https://www.google.com https://us-central1-novuchat-site.cloudfunctions.net; frame-src https://www.google.com; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'; worker-src 'self'; manifest-src 'self'; upgrade-insecure-requests" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), camera=(), microphone=(), payment=(), usb=()" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]},
      { "source": "/_astro/**", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
      { "source": "/fuentes/**", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
    ]
  },
  "functions": [{ "source": "functions", "codebase": "sitio", "runtime": "nodejs22",
                  "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"] }],
  "firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json" },
  "emulators": { "functions": { "port": 5241 }, "firestore": { "port": 8241 }, "hosting": { "port": 5240 }, "ui": { "enabled": true, "port": 4241 } }
}
```

Notas:

- `style-src 'unsafe-inline'` solo por reCAPTCHA; se retira si se usa el widget invisible
  sin estilos en línea. `'unsafe-inline'` **nunca** en `script-src`.
- La región de las Functions (`us-central1` o `southamerica-east1`) determina el origen de
  `connect-src`; con `httpsCallable` el SDK llama a `https://<region>-<proyecto>.cloudfunctions.net`.
  Alternativa: rewrite `/api/**` → función y `connect-src 'self'` (más limpio; requiere
  `httpsCallableFromURL`).
- **La CSP no se prueba con `astro dev`**: copiar `scripts/probar-csp.mjs` de la consola y
  correr `pnpm csp` antes de cada despliegue.
- Referrer-Policy `strict-origin-when-cross-origin` (no `no-referrer` como la consola)
  porque el sitio público quiere que sus enlaces salientes lleven origen.
- Puertos de emuladores distintos de los de la consola (8231/9299/5230) para poder tener
  los dos levantados.

---

## 7. Dominios y enlace a la consola

| Recurso | Dominio | Proyecto Firebase | Cuenta |
|---|---|---|---|
| Sitio público | `novuchat.site` + `www.novuchat.site` (redirige a apex) | `novuchat-site` | alberdi.andres (propietario) |
| Consola | **`consola.novuchat.site`** (recomendado) | `novuchat-admin-prod` | cuenta del panel (`GOOGLE_ACCOUNT_PANEL`) |
| Consola de desarrollo | `novuchat-admin-dev.web.app` (sin dominio propio) | `novuchat-admin-dev` | idem |

Por qué un subdominio y no una ruta (`novuchat.site/consola`): son proyectos Firebase
distintos, con cabeceras, Auth y CSP propias; un subdominio los separa en el navegador
(cookies, `frame-ancestors`, `authDomain`) y permite que cada uno despliegue por su cuenta.

**Pasos que requieren a Andres** (una sola vez, en la consola de Firebase):

1. Hosting → Dominios personalizados → agregar `novuchat.site` y `www` en `novuchat-site`;
   crear en el registrador los registros A/AAAA o TXT que Firebase indique.
2. En `novuchat-admin-prod`: agregar `consola.novuchat.site`; registro CNAME/A.
3. En `novuchat-admin-prod` → Authentication → Dominios autorizados: agregar
   `consola.novuchat.site`.
4. En `~/NovuChat/admin/firebase.json`, `frame-src`: agregar
   `https://consola.novuchat.site` (o mantener `authDomain` en `*.firebaseapp.com` y no
   cambiar nada; ver `admin/SEGURIDAD.md` §5bis).
5. Definir en el sitio `PUBLIC_URL_CONSOLA=https://consola.novuchat.site`.

Mientras 2–4 no estén hechos, `PUBLIC_URL_CONSOLA=https://novuchat-admin-prod.web.app`.

---

## 8. Internacionalización

- Astro i18n con `defaultLocale: 'es'` sin prefijo y `en` con prefijo `/en/`.
- Contenido en `src/contenido/*.{es,en}.ts` (tipado: la misma interfaz para los dos
  idiomas; el compilador avisa si falta una clave).
- `hreflang` alternos en el `<head>`; selector de idioma en el header conserva la ruta
  equivalente.
- El asistente responde en el idioma del usuario; la interfaz del widget usa el
  diccionario `ui`.
- **No usar `innerHTML` para traducciones**: Astro interpola texto escapado; si una
  traducción necesita marcado, se compone con componentes.

---

## 9. Tema claro / oscuro

Copiar `tema.ts` de la consola: preferencia del sistema por defecto, `data-tema="oscuro"`
forzable desde un control, `color-scheme` sincronizado, persistencia en `localStorage`
envuelta en `try/catch`. Tokens duplicados **solo** bajo `[data-tema="oscuro"]`, nunca en
`@media` (misma razón que documenta `tema.ts`).

---

## 10. Rendimiento y activos

- Logo en **SVG** (vectorizar el JPEG entregado; el trazo es simple: círculo, cola, tres
  puntos, texto). Favicon SVG + PNG 512 para `manifest`.
- Video de héroe **opcional**: si se usa, ≤ 1,5 MB, `preload="none"`, `poster` WebP,
  respetar `prefers-reduced-motion`. Alternativa recomendada: **animación CSS/SVG de una
  conversación de WhatsApp** (burbujas que aparecen), 0 KB de video.
- Imágenes de las pantallas de la consola: capturas reales (con datos sembrados de
  "Salón Aurora") en WebP, con `loading="lazy"` y `width/height` declarados.
- Fuentes: `font-display: swap`, 3 subconjuntos de Archivo (como la consola), preload del
  latin 400.
- Presupuesto: HTML+CSS+JS inicial ≤ 300 KB; islas cargadas con `client:idle` /
  `client:visible`.

---

## 11. Accesibilidad

Contraste AA según la tabla del doc 08 §2 (el verde `#12c489` **no alcanza AA como texto
en claro**: usar `--color-accent-2-700` o más oscuro; el pizarra `#3d4753` y el menta en
oscuro sí cumplen), foco visible, navegación por teclado del chat y del acordeón, `aria-live` para
respuestas del asistente y estados del formulario, `prefers-reduced-motion`, tamaños de
toque ≥ 44 px, textos que crecen al 200 % sin romper.

---

## 12. Observabilidad y costos

- Presupuesto de facturación con alerta en `novuchat-site` (plan Blaze necesario para
  Functions v2 y llamadas salientes).
- Logs estructurados en las Functions (sin datos personales en claro).
- Panel mínimo de leads: se lee desde la **consola NovuChat** (rol superadministrador)
  en una fase posterior, o desde la consola de Firebase mientras tanto.
- Costos esperados en fase 1: Hosting gratuito; Functions y Firestore dentro del nivel
  gratuito para < 10 000 invocaciones/mes; Gemini Flash ≈ centavos por 1 000 mensajes;
  Resend nivel gratuito (3 000 correos/mes).
