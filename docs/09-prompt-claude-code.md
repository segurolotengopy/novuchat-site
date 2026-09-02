# 09 — Prompt de arranque para Claude Code

> Cómo usarlo: abrir una terminal en `~/Novuchat-site`, ejecutar `claude`, y pegar
> **todo lo que está debajo de la línea** como primer mensaje. Claude Code leerá
> `CLAUDE.md` automáticamente; el prompt le indica el orden de lectura, el diseño de
> referencia y hasta dónde llegar en la primera sesión.
>
> Antes de pegar, tenga a mano: la decisión sobre los planes (o confirme que siguen en
> ⚠️), y si quiere que Claude Code haga `git push` al final (por defecto **no**).
>
> Notas sobre el diseño de referencia (artefacto *"Novuchat Responsive landing page
> design"*, exportado a `docs/diseno/landing-design.html`):
> - Es un prototipo con sintaxis de plantillas (`{{ }}`, `sc-if`, `sc-for`): se toma como
>   referencia visual y de contenido, **no** se copia como código.
> - Incluye **Google Analytics (`gtag`) y Meta Pixel (`fbq`)** con identificadores de
>   relleno. Contradicen la decisión D5 (sin analítica en fase 1) y la CSP: **no se
>   implementan** hasta que Andres decida lo contrario y se declaren en la política de
>   privacidad.
> - Incluye **testimonios ilustrativos** ("Andrea · peluquería", "Dr. Rojas…") con
>   cuatro **fotografías generadas** (`docs/diseno/fotos/pyme-*.jpg`, 1200×896, 0,7–1 MB
>   cada una). Las frases **no se publican como testimonios reales**: la sección se
>   construye pero queda oculta (`mostrarTestimonios=false`) hasta tener testimonios
>   reales con consentimiento escrito. Las fotos sí pueden usarse como imágenes
>   ilustrativas de cada rubro (convertidas a WebP ≤ 120 KB, con `alt` descriptivo y sin
>   atribuirlas a personas reales).
> - Los planes del diseño (Base 250 / Crecimiento 450 / Corporativo 850 Bs, unidad
>   "chats", setup 800 Bs) **difieren** del pitch (150/250/350 Bs). Andres definirá los
>   definitivos: se construyen como datos en `src/contenido/planes.es.ts` con marca ⚠️.
> - Menciona funciones que la plataforma aún no tiene ("escucha audios", "integración con
>   Google Sheets", "difusión masiva", la cifra "68 % de las ventas"): van con rótulo
>   "próximamente" o marca `<!-- CONFIRMAR -->`, según la prohibición 8 de `CLAUDE.md`.
> - Tokens: coinciden con el doc 08 y agregan `--cta-bg #35e2a0`, `--cta-fg #16211d`,
>   `--cta-bg-hover #12c489`, `--pizarra`, `--banda #2b333b`, `--banda-texto`,
>   `--verde-texto #0b855c`, `--fondo-alterno #fff`, `--ancho 1120px`, `--tipo-h1`,
>   `--tipo-h2`. Se adoptan con esos mismos nombres.

---

Vas a construir el sitio comercial **novuchat.site** en este repositorio. Trabaja en
español (Bolivia), sin voseo, explicando el porqué de cada decisión no trivial, y
señalando por separado lo que requiere mi intervención. Ejecuta y verifica por tu cuenta
todo lo que puedas; no me pidas correr comandos que tú puedes correr.

## 1. Lee, en este orden, antes de tocar nada

1. `CLAUDE.md` (prohibiciones duras y flujo de trabajo).
2. `docs/00-LEEME.md` y luego `docs/03-arquitectura-sitio.md`, `docs/08-sistema-de-diseno.md`,
   `docs/04-seguridad-y-privacidad.md`, `docs/05-contenido-y-secciones.md`,
   `docs/06-plan-de-implementacion.md`. Los docs 01, 02 y 07 son contexto: léelos en
   diagonal.
3. **El diseño de referencia**: `docs/diseno/landing-design.html` (exportación del
   artefacto de Claude Design https://claude.ai/code/artifact/0dc499f8-c9b4-459e-9847-d224862e69ae)
   `docs/diseno/qr-demostracion.png`, `docs/diseno/fotos/` y los logos
   `docs/diseno/logo-fondo-*.jpg`. Extrae de ahí: la estructura de secciones y su
   orden, los textos, los tokens CSS (`:root` y `[data-tema="oscuro"]`, los últimos dos
   bloques), las clases de componente y el JSON-LD. Es un prototipo con sintaxis de
   plantillas: **no lo copies como código**; reconstrúyelo en Astro con los mismos
   tokens y clases.
4. La consola, solo como referencia de lectura: `~/NovuChat/admin/web/src/diseno.css`,
   `~/NovuChat/admin/web/src/lib/tema.ts`, `~/NovuChat/admin/functions/src/saneo.ts`,
   `~/NovuChat/admin/scripts/probar-csp.mjs`, `~/NovuChat/admin/web/public/fuentes/`.
   **No modifiques nada en `~/NovuChat/`.**

Cuando termines de leer, dame un resumen de media página con: lo que entendiste del
alcance, las decisiones D1–D8 que asumes (usa las recomendadas del doc 06 salvo que yo
diga otra cosa) y las **cuatro discrepancias** entre el diseño de referencia y las
reglas del proyecto (analítica y píxel, testimonios ficticios, planes, funciones no
construidas) con cómo las vas a tratar. Espera mi confirmación antes de la Fase 1.

## 2. Fase 0 — Preparación (hazla completa)

- Verifica el estado del repositorio (`git status`, remoto, rama). Si el directorio no es
  un clon de `github.com/segurolotengopy/novuchat-site`, detente y dímelo.
- Aplica el estándar DevSecOps v2 con la habilidad `aplicar-estandar-devsecops`
  (bootstrap, `.devsecops.yml`, workflow, pre-commit con verificador de saneo,
  `CONVENCIONES-REPO-PUBLICO.md`). Instala el gancho de pre-commit.
- Inicializa Astro 5 con TypeScript estricto, `@astrojs/preact`, `@astrojs/sitemap`,
  Vitest, Playwright, ESLint, Stylelint con `declaration-strict-value` para colores.
  pnpm y Node 24.
- Copia las fuentes Archivo a `public/fuentes/`, `tema.ts` a `src/lib/`, adapta
  `saneo.ts` a `functions/src/` y `probar-csp.mjs` a `scripts/`.
- Crea `firebase.json` (con la CSP y cabeceras del doc 03 §6), `.firebaserc`
  (`novuchat-site`), `firestore.rules` con negación total, `firestore.indexes.json`,
  `.env.example` con `PUBLIC_URL_CONSOLA`, `PUBLIC_RECAPTCHA_SITE_KEY` y
  `PUBLIC_FIREBASE_*` vacíos.
- Scripts de `package.json`: `dev`, `build`, `emuladores`, `pruebas`, `humo`, `csp`,
  `verificar` (lint + typecheck + pruebas + prohibiciones de renderizado + búsqueda de
  marcas `<!-- CONFIRMAR -->` y de voseo + build), tal como los describe `CLAUDE.md`.
- Crea `ESTADO.md` con la plantilla de `~/NovuChat/ESTADO.md` (dónde estamos, decisiones,
  hallazgos, próximos pasos; nunca secretos).
- Un commit por paso lógico, con mensajes en español. **No hagas push.**

## 3. Fase 1 — Sistema de diseño y esqueleto (tras mi confirmación)

- `src/estilos/tokens.css` con los tokens del doc 08 §3 **más** los propios del diseño
  de referencia (`--cta-*`, `--pizarra`, `--banda*`, `--verde-texto`,
  `--fondo-alterno`, `--ancho`, `--tipo-h1/h2`), con los mismos nombres. Tema oscuro solo
  bajo `[data-tema="oscuro"]`. Script en línea anti-destello en el `<head>` con hash
  documentado en `docs/csp.md`.
- `src/estilos/componentes.css` con las clases de la consola (`.btn*`, `.field`,
  `.input`, `.tag*`, `.card*`, `.table`, `.nav`, `.dialog*`) y las nuevas del sitio
  (`.seccion`, `.heroe`, `.burbuja`, `.plan`, `.acordeon`, `.chip`, `.banda`, indicador
  "escribiendo…" con los tres puntos).
- `src/layouts/Base.astro`: head con SEO, Open Graph, `hreflang`, JSON-LD
  (`Organization`, `SoftwareApplication` con `Offer` leído de `planes.es.ts`,
  `FAQPage`, `BreadcrumbList`), header de 64 px con "Ingresar" (a `PUBLIC_URL_CONSOLA`,
  validada contra la lista blanca en build) y "Pedir una demo", selector de idioma y de
  tema, barra de aviso condicionada por `mostrarAviso`, footer con línea legal.
- Todas las rutas del doc 03 §3, con el contenido del diseño de referencia y del doc 05
  en `src/contenido/*.es.ts` (tipado) y EN para inicio, precios, consola, contacto y
  privacidad. Todo texto que dependa de una confirmación lleva `<!-- CONFIRMAR -->`.
- Sección de testimonios construida pero desactivada (`mostrarTestimonios=false`).
- Logo vectorizado en SVG a partir de `docs/diseno/logo-fondo-transparente.jpg` y
  `logo-fondo-blanco.jpg`; favicon; imagen OG.
- Verifica: `pnpm verificar` en verde, `pnpm build && pnpm csp` sin ningún "Refused to",
  Lighthouse móvil ≥ 90 en las cuatro categorías, `axe` sin errores críticos en claro y
  oscuro. Reporta los números reales.

## 4. Fase 2 — Backend (después de la Fase 1)

`functions/` en TypeScript (Node 22): `lead.ts` y `asistente.ts` según el doc 03 §5
(App Check, validación, límite de tasa en Firestore, filtro por palabra completa,
proveedor Gemini con interfaz intercambiable a Anthropic, registro sin datos personales
en claro, correo por Resend), islas `FormularioLead.tsx` y `Asistente.tsx` en Preact con
todos los estados, pruebas de unidad, de reglas con documento sembrado, de inyección de
prompt (10 casos) y de humo con Playwright contra los emuladores. Antes de empezar esta
fase, dame la lista exacta de lo que necesito crear en la consola de Google Cloud
(Blaze, Firestore, Functions, secretos, App Check) con los comandos `firebase` y `gcloud`
listos para copiar.

## 5. Reglas de conducta durante el trabajo

- Al cerrar cada fase, actualiza `ESTADO.md` y muéstrame un resumen: qué hiciste, qué
  verificaste (con evidencia), qué queda pendiente de mí.
- Si el diseño de referencia y los documentos se contradicen, mandan los documentos
  (`CLAUDE.md` y `docs/`) y me lo indicas.
- Si algo del diseño no se puede reproducir sin violar la CSP o las prohibiciones,
  propón la alternativa autoalojada y sigue.
- Nunca inventes datos comerciales, testimonios ni cifras: marca y pregunta.
