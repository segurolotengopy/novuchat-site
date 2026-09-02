# ESTADO — novuchat.site

> Bitácora viva del proyecto. Se actualiza al cerrar cada sesión de trabajo.
> **Nunca** contiene secretos: claves, tokens ni valores de `.env`.

Última actualización: **2026-09-02**

---

## 1. Dónde estamos

**Fases 0, 1 y 2 construidas.** El sitio tiene sus dieciocho rutas y su sistema
de diseño; el backend tiene las dos Functions, el RAG estricto y las islas que
encienden el formulario y el asistente. Falta **generar el índice del RAG** (la
única pieza que necesita la clave de Gemini), crear los secretos y desplegar.

| Pieza | Estado |
|---|---|
| Repositorio `github.com/segurolotengopy/novuchat-site` | público, rama `main`, remoto por SSH con la clave `id_ed25519_segurolotengo` |
| Estándar DevSecOps v2 | aplicado (stack `node-firebase`, modo A); pre-commit instalado |
| Astro 7 + Preact + sitemap | instalado; `pnpm verificar` en verde |
| Proyecto Firebase `novuchat-site` (nº 50331646927) | plan Blaze, presupuesto de 10 USD con alertas al 50/90/100 % |
| Firestore | `(default)` en **us-east1**, modo nativo, protección de borrado activa |
| App web | `NovuChat sitio` — `1:50331646927:web:54f472bf096c63a0caf0ba` |
| App Check | reCAPTCHA Enterprise registrado, TTL 3600 s, `minValidScore 0.5`, modo monitoreo |
| Dominios | `novuchat.site` y `www` → `OWNERSHIP_ACTIVE` + `HOST_ACTIVE`; certificado en emisión |
| Píxel de Meta | `1058454173766291`, dominio verificado |
| GA4 | `G-BDYVHDEH9R`, detrás del banner de consentimiento |
| Search Console | verificado por TXT |
| Contenido y páginas | **18 rutas** (13 en español, 5 en inglés) + 404 |
| Sistema de diseño | `tokens.css`, `base.css`, `componentes.css` con los tokens del prototipo |
| Logotipo | `isotipo.svg`, `isotipo-claro.svg`, `favicon.svg`, `favicon.ico`, `og.png` |
| Formularios de demo y contacto | isla Preact `FormularioLead`, conectada a la Function |
| Asistente del sitio | isla Preact `Asistente`, con RAG estricto en el servidor |
| Function `lead` | validación, trampa de robots, límite de tasa, deduplicación, Firestore y aviso por FormSubmit **desde el servidor** |
| Function `asistente` | límite de tasa, filtro de términos, recuperación con umbral, verificación de la respuesta |
| Índice del RAG | **pendiente**: necesita `GEMINI_API_KEY` para generarse |
| Secretos en Secret Manager | **pendientes**: `GEMINI_API_KEY`, `FORMSUBMIT_ALIAS`, `SAL_HASH` |

---

## 2. Decisiones tomadas

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-09-02 | **Todo recurso de nube en `us-east1`** | Instrucción de Andres. Reemplaza a `southamerica-east1` del doc 06. Afecta la CSP (`connect-src`) y la respuesta del FAQ sobre ubicación de datos |
| 2026-09-02 | **Astro 7**, no Astro 5 | El doc 03 fue escrito cuando 5 era la versión vigente; se usa la estable actual |
| 2026-09-02 | Tokens visuales **del prototipo**, no los del doc 08 | Decisión de Andres. El sitio queda más cálido y redondeado que la consola; la consola debería alinearse después |
| 2026-09-02 | **Sin ninguna referencia a AAB1** en el sitio ni en el RAG | Régimen tributario: NovuChat factura como comercio, AAB1 es desarrollador. Se abrirá un NIT propio de NovuChat |
| 2026-09-02 | **GA4 + píxel de Meta**, con banner de consentimiento | Habrá pauta publicitaria. Reabre la decisión D5 (que era "sin analítica") |
| 2026-09-02 | **FormSubmit** en fase 1, no Resend | El correo del dominio todavía no existe. La Function `lead` lo llama desde el servidor: no se abre `formsubmit.co` en la CSP y se conserva App Check |
| 2026-09-02 | **RAG estricto** para el asistente | Reemplaza la inyección completa de la base de conocimiento del doc 03 §5.1 |
| 2026-09-02 | Unidad comercial: **"conversaciones"** (todos los mensajes con un cliente en 24 h) | Unifica el vocabulario del diseño ("chats"), la presentación ("conversaciones") y la consola ("cierres/atenciones/interacciones") |
| 2026-09-02 | Planes 250 / 450 / 850 Bs, setup 800 Bs, a medida desde 1.500 Bs, excedentes 50 Bs × 150 | Confirmados contra el diseño y `Presentación NovuChat2.html` |
| 2026-09-02 | `staging` y `production` en el **mismo** proyecto Firebase | Staging es un canal de vista previa de Hosting; no hay presupuesto para dos proyectos |
| 2026-09-02 | Ninguna dependencia ejecuta scripts de instalación (`allowBuilds: false`) | Riesgo S-9: los `postinstall` de terceros son superficie de cadena de suministro |

---

## 2bis. Evidencia de verificación (2026-09-02)

| Control | Resultado |
|---|---|
| `pnpm verificar` | verde: lint, typecheck, pruebas, prohibiciones, build y humo |
| `pnpm humo` | **66 pruebas en verde** (móvil y escritorio) |
| `pnpm pruebas` | **61 pruebas de unidad**: saneo, verificación del RAG, corpus, inyección de prompt y aviso de leads |
| `pnpm test:rules` | **28 pruebas de reglas** contra el emulador, cada una con documento sembrado |
| Lighthouse móvil `/` | rendimiento 100 · accesibilidad 100 · buenas prácticas 100 · SEO 100 |
| Lighthouse móvil `/precios` y `/demo` | 100 / 100 / 100 / 100 |
| `axe` (wcag2a/aa, wcag21a/aa) | sin fallos graves ni críticos, en tema claro y oscuro |
| CSP | las 18 rutas cargan sin ningún «Refused to» |
| Peso del inicio | HTML 29,2 KB + CSS 16,5 KB + JS 25,4 KB (presupuesto: 300 KB) |

## 3. Hallazgos que costaron tiempo

1. **Dos identidades de GitHub en la misma máquina.** La clave SSH por defecto
   (`id_ed25519`) es de la cuenta `AndresAlberdi`, pero el repositorio es de
   `segurolotengopy`. El push falla con *"Permission denied"* aunque `gh` esté
   autenticado. La clave correcta es `id_ed25519_segurolotengo`, con el alias
   `github-segurolotengo` en `~/.ssh/config`. **El remoto debe usar ese alias**,
   no `git@github.com`.
2. **La ubicación de Firestore es permanente.** Se creó primero en
   `southamerica-east1` y hubo que borrar y recrear. Al recrear, Google reserva
   el identificador `(default)` unos **200 segundos**: el segundo `create` falla
   con `FAILED_PRECONDITION` hasta que expira. Ahora tiene protección de borrado.
3. **`gcloud` toma el proyecto de cuota de su configuración activa**, que aquí es
   `novuchat-admin-dev` (la consola). Las llamadas a APIs de Firebase y a
   `billing budgets` fallan con `USER_PROJECT_DENIED` hasta que se pasa
   `X-Goog-User-Project: novuchat-site` o `CLOUDSDK_CORE_PROJECT=novuchat-site`.
   **Nunca** cambiar el proyecto global: rompería el trabajo de la consola.
4. **pnpm 11 exige decidir explícitamente sobre cada `postinstall`.** El ajuste
   ya no va en `package.json` sino en `allowBuilds:` de `pnpm-workspace.yaml`, y
   el valor `set this to true or false` bloquea `pnpm install` hasta resolverlo.
5. **El export del prototipo declara las familias `Figtree` y `Caprasimo`** pero
   sus `@font-face` apuntan a los `.woff2` de **Archivo**. Es un artefacto de la
   exportación: la tipografía real es Archivo y así se mantiene.
6. **La CSP no se puede probar con `astro dev`.** Solo `pnpm build && pnpm csp`
   sirve `dist/` con las cabeceras reales de `firebase.json` (puerto 5245, para
   no chocar con el emulador de Hosting en el 5240).
7. **Astro incrusta los scripts pequeños en el HTML y la CSP los mata en
   silencio.** El conmutador de tema y el banner de consentimiento no
   funcionaban, sin un solo error visible en la página. Se arregla con
   `vite.build.assetsInlineLimit: 0` en `astro.config.mjs`, que fuerza archivos
   externos cubiertos por `script-src 'self'`. **No lo cambie.**
8. **`.nav a` le gana en especificidad a `.btn-cta`.** El botón «Pedir una demo»
   del encabezado heredaba el color del texto: en tema oscuro quedaba texto
   claro sobre menta, 1,6:1. Lo detectó `axe`, no el ojo. Los selectores de
   navegación y de banda llevan `:not(.btn)`.
9. **`build.format: 'file'` hace que `Astro.url.pathname` termine en `.html`.**
   La canónica y los `hreflang` salían como `/precios.html`, que Google habría
   indexado como duplicado de `/precios`. Se normaliza en `Base.astro`.
10. **Un SVG cargado con `<img>` no ve las variables CSS del documento.** El
    hueco del isotipo se dejó transparente, que resuelve claro y oscuro sin
    duplicar archivos; para fondos oscuros existe `isotipo-claro.svg`.
11. **Un carrusel no puede deducir su posición de `scrollLeft` en cada clic.**
    Mientras la animación suave está en vuelo, `scrollLeft` devuelve un punto
    intermedio y las flechas saltan de diapositiva equivocada. El índice se
    lleva en una variable y el desplazamiento solo lo reconcilia cuando quedó
    **sobre** una diapositiva. Además hay contextos donde el navegador descarta
    la animación suave: si a los 350 ms no se movió, se salta al destino, para
    que una flecha nunca quede sin efecto.
12. **`role="group"` sobre un `<article>` deja el árbol de accesibilidad mal
    formado.** Las diapositivas son `div`. Lo detectó Lighthouse.
13. **Astro emite scripts en línea para hidratar las islas, y la CSP los
    bloquea en silencio.** El formulario y el asistente no reaccionaban, sin
    error visible. No se pueden externalizar ni usar `nonce` (Hosting sirve
    archivos estáticos), así que `scripts/sellar-csp.mjs` calcula el SHA-256 de
    cada uno dentro de `pnpm build` y los escribe en `firebase.json`.
    `pnpm csp:verificar` falla si quedan viejos.
14. **El punto activo del carrusel saltaba durante la vuelta.** Al animar de la
    cuarta a la primera, el desplazamiento pasa *por encima* de las
    intermedias; el reconciliador leía la posición en ese instante. Ahora se
    ignora mientras el movimiento está en vuelo.
15. **`functions/` se instala con `--ignore-workspace`.** Firebase empaqueta ese
    directorio por su cuenta y no puede depender de enlaces al espacio de
    trabajo de la raíz.

---

## 3bis. Cómo mirar el sitio

Hay **dos servidores** y sirven para cosas distintas. Confundirlos es la causa
más probable de un «el preview da errores»:

| Comando | Dirección | Para qué |
|---|---|---|
| `pnpm dev` | `http://localhost:4321` | Ver contenido y diseño, con recarga en caliente. **No aplica las cabeceras de seguridad**, así que aquí una violación de la CSP no se ve |
| `pnpm build && pnpm csp` | `http://127.0.0.1:5245` | Ver el sitio compilado con las cabeceras **reales** de `firebase.json`. Es el único que sirve para verificar la CSP |

El segundo solo existe mientras el comando está corriendo: si la ventana quedó
abierta en el 5245 y el proceso se cerró, el navegador da un error de conexión.
`.claude/launch.json` deja el primero listo para arrancar desde el editor.

## 4. Próximos pasos

**De Claude Code:**

1. Generar el índice del RAG en cuanto exista `GEMINI_API_KEY`, y calibrar el
   umbral de similitud con un conjunto dorado de preguntas reales. Hoy el
   umbral (0,62) es un valor de partida razonable, **no medido**.
2. Capturas reales de la consola para la página `/consola`.
3. Primer despliegue a un canal de vista previa de Hosting.
4. Pruebas de humo del formulario y del asistente contra los emuladores.

**De Andres:**

1. Razón social y NIT de NovuChat para `/privacidad` y `/terminos` (en trámite).
2. ID del píxel de Meta; confirmar zona horaria La Paz y moneda BOB en GA4.
3. Casilla de correo para activar FormSubmit, y luego los MX y el SPF del dominio
   (se perdieron al reescribir el DNS en Namecheap).
4. Perfil de Empresa de Google para el SEO local.
5. Workload Identity Federation y los secretos del repositorio
   (`GCP_WIF_PROVIDER`, `GCP_SA_DEPLOY_STAGING`, `GCP_SA_DEPLOY_PROD`).
6. Confirmar los nombres de los planes (Impulso/Crecimiento/Pro vs.
   Base/Crecimiento/Corporativo del diseño).
