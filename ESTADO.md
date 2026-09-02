# ESTADO — novuchat.site

> Bitácora viva del proyecto. Se actualiza al cerrar cada sesión de trabajo.
> **Nunca** contiene secretos: claves, tokens ni valores de `.env`.

Última actualización: **2026-09-02**

---

## 1. Dónde estamos

**Fase 0 (preparación) completa.** El repositorio existe, tiene el estándar
DevSecOps v2 aplicado y el esqueleto de Astro compila. La infraestructura de
Google Cloud está creada y verificada. Todavía no hay contenido ni backend.

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
| Contenido y páginas | pendiente (Fase 1) |
| Functions `lead` y `asistente` | pendiente (Fase 2) |

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

---

## 4. Próximos pasos

**De Claude Code:**

1. Fase 1: `tokens.css` y `componentes.css` con los valores del prototipo,
   `Base.astro`, las 12 rutas del doc 03 §3, contenido tipado en `src/contenido/`,
   logo SVG, favicon, imagen OG, banner de consentimiento.
2. Actualizar `CLAUDE.md` y los docs 05, 06 y 08 con las decisiones del 2026-09-02.
3. Fase 2: `functions/` con `lead` (FormSubmit desde el servidor) y `asistente`
   (RAG estricto), islas Preact, pruebas de unidad, de reglas con documento
   sembrado, de inyección de prompt y de humo.

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
