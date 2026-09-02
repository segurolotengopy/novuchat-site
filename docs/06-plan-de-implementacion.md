# 06 — Plan de implementación

> Fases, tareas para Claude Code y, separadas, las intervenciones que requieren a Andres
> (consolas, autorizaciones, decisiones). Fechas de referencia: demos comerciales el 9 y
> 10 de septiembre de 2026; congelamiento de la plataforma el 8.

---

## 0. Decisiones pendientes (bloquean partes del trabajo)

| # | Decisión | Opciones | Recomendación | Bloquea |
|---|---|---|---|---|
| D1 | Framework del sitio | Astro + Preact · React + Vite (como la consola) | **Astro + Preact** (doc 03 §2) | Fase 1 |
| D2 | Acento de marca | — | **Cerrada 2026-09-02:** la consola ya usa pizarra `#3d4753` (claro) y menta `#35e2a0` (oscuro); el sitio hereda los tokens (doc 08) | — |
| D3 | URL de la consola | `consola.novuchat.site` · `novuchat-admin-prod.web.app` | **Subdominio** | Header/footer (configurable) |
| D4 | Correo de leads | Resend (clave) · FormSubmit (sin clave, declarado) | **Resend** | Fase 2 |
| D5 | Analítica | Ninguna · GA4 con excepción de CSP | **Ninguna en fase 1** | CSP |
| D6 | Datos comerciales (planes, precios, oferta, fidelización, cifras) | **Andres define los planes en breve**; el resto viene del documento comercial de Silvana | Construir la página de precios con datos en `src/contenido/planes.es.ts` y dejar los del deck como marcador ⚠️ hasta recibir los definitivos | Contenido de precios, FAQ, JSON-LD `Offer`, base de conocimiento del asistente |
| D7 | Correo y WhatsApp de contacto de NovuChat | Número de AAB1 · número propio | ⚠️ Andres | Contacto, JSON-LD |
| D8 | Video de héroe | Video · animación CSS | **Animación CSS** | Héroe |

---

## 1. Fase 0 — Preparación del repositorio (Claude Code, ½ día)

1. Clonar `github.com/segurolotengopy/novuchat-site` en `~/Novuchat-site` (si el
   directorio ya es el clon, verificar remoto).
2. Aplicar el estándar DevSecOps v2 (`aplicar-estandar-devsecops`): `bootstrap-repo.sh`,
   `.devsecops.yml`, workflow, pre-commit con verificador de saneo, `CONVENCIONES-REPO-PUBLICO.md`.
3. Copiar `CLAUDE.md` y `docs/` de este paquete a la raíz.
4. Inicializar Astro (`pnpm create astro@latest`, plantilla mínima, TypeScript estricto),
   `@astrojs/preact`, `@astrojs/sitemap`, Vitest, Playwright, ESLint.
5. Copiar de `~/NovuChat/admin/`: `web/public/fuentes/*.woff2`, `web/src/lib/tema.ts`,
   `functions/src/saneo.ts` (adaptado), `scripts/probar-csp.mjs`, `scripts/verificar-saneo.sh`,
   `.pre-commit-config.yaml`.
6. `firebase.json`, `.firebaserc` (`novuchat-site`), `firestore.rules` (negación total),
   `firestore.indexes.json` vacío, `.env.example`.
7. Commit inicial (sin push hasta que Andres confirme que el remoto está limpio).

**Requiere a Andres:** confirmar que el repositorio remoto está vacío o indicar la rama
base; D1.

---

## 2. Fase 1 — Sistema de diseño y esqueleto (Claude Code, 1 día)

1. `src/estilos/tokens.css` con los tokens del doc 08 §3 (heredados del artefacto
   "Panel NovuChat" + los propios del sitio), tema oscuro por `[data-tema="oscuro"]`,
   tipografía Archivo, espaciados, radios 0, sombras; lint de colores fuera de tokens.
2. `Base.astro` (head SEO/OG/JSON-LD/hreflang, header, footer, selector de tema e
   idioma, enlace a la consola por `PUBLIC_URL_CONSOLA`).
3. Componentes `ui/` y `seccion/` con contenido de `src/contenido/` (ES completo, EN de
   las páginas principales).
4. Todas las rutas del mapa (doc 03 §3) con contenido del doc 05, marcando los ⚠️ con
   un comentario `<!-- CONFIRMAR -->` que el build de producción rechaza si sigue ahí
   (`pnpm verificar` busca la marca).
5. Logo vectorizado (SVG) a partir del JPEG; favicon; imagen OG.
6. Lighthouse local ≥ 90; `axe` sin errores críticos.

**Requiere a Andres:** D2, D8; entregar el documento comercial (D6) cuando llegue.

---

## 3. Fase 2 — Backend: leads y asistente (Claude Code, 1 día)

1. `functions/` en TypeScript (Node 22): `lead.ts`, `asistente.ts`, `conocimiento.ts`,
   `saneo.ts`, `proveedores/gemini.ts` (+ `anthropic.ts` con la misma interfaz).
2. Límite de tasa en Firestore (`limites/`), deduplicación de leads, honeypot.
3. Islas `FormularioLead.tsx` y `Asistente.tsx` (Preact) con App Check, estados
   cargando/error/éxito, `aria-live`, teclado, chips.
4. Pruebas: unidad (validación, limitador, filtro, saneo), reglas con emulador (con
   documento sembrado), inyección de prompt (10 casos, con el proveedor simulado),
   humo Playwright (formulario y chat contra emuladores).
5. `pnpm csp` en verde.

**Requiere a Andres (en la consola de Google Cloud / Firebase, proyecto `novuchat-site`):**

- Plan **Blaze** con presupuesto y alerta (sugerido: 10 USD).
- Habilitar Firestore (modo nativo, región `southamerica-east1`) y Cloud Functions.
- Crear los secretos `GEMINI_API_KEY` y `RESEND_API_KEY` en Secret Manager (Claude Code
  prepara los comandos `firebase functions:secrets:set …`; Andres los ejecuta porque
  requieren su sesión y las claves).
- App Check: registrar la app web con reCAPTCHA Enterprise y compartir la **clave de
  sitio** (es pública; va en `.env` como `PUBLIC_RECAPTCHA_SITE_KEY`).
- D4, D7.

---

## 4. Fase 3 — CI/CD y despliegue (Claude Code + Andres, ½ día)

1. `ci.yml`: lint, typecheck, pruebas, prohibiciones de renderizado, verificador de
   saneo, build, Lighthouse CI.
2. `despliegue.yml`: build + `firebase deploy --only hosting,functions,firestore:rules`
   con OIDC; despliegue a canal de vista previa en cada PR (`hosting:channel:deploy`)
   y a producción en `main` con etiqueta `vX.Y.Z` (`pase-a-produccion`).
3. `scripts/desplegar-local.sh` como respaldo manual (sin `--force`, sin push automático).

**Requiere a Andres:** Workload Identity Federation (pool, proveedor GitHub con
condición estricta, cuenta de servicio con roles mínimos) — Claude Code entrega los
comandos `gcloud` exactos; secretos y variables en GitHub (`WIF_PROVIDER`,
`WIF_SERVICE_ACCOUNT`, `FIREBASE_PROJECT_ID`); dominio `novuchat.site` + `www` en
Hosting y registros DNS en el registrador; D3 y los cuatro pasos de dominio de la
consola (doc 03 §7).

---

## 5. Fase 4 — Contenido definitivo y lanzamiento (1 día)

1. Incorporar el documento comercial: precios, oferta, cifras con fuente, fidelización.
2. Capturas reales de la consola con la siembra (`pnpm sembrar` en `~/NovuChat/admin`).
3. Textos EN de las páginas principales.
4. Política de privacidad y términos revisados por Andres.
5. Pruebas de aceptación: formulario llega por correo; asistente responde en < 6 s;
   límite de tasa actúa; CSP limpia; Lighthouse; enlaces (incluida la consola) correctos.
6. Despliegue `v1.0.0`; declarar la URL de privacidad en la app de Meta.

**Requiere a Andres:** revisión legal de privacidad/términos; aprobación del contenido;
ejecución del tag de producción.

---

## 6. Después del lanzamiento (fase 5, iterativo)

- Llevar a `~/NovuChat/admin/web/src/diseno.css` el bloque `:root`/`[data-tema="oscuro"]`
  nuevo del artefacto y corregir el voseo del prototipo (tarea de la consola, no de este
  repositorio).
- Ver leads y conversaciones del asistente desde la consola NovuChat (rol superadmin).
- Aviso de leads por WhatsApp con plantilla aprobada.
- Transcripción de audios en el asistente de ventas (si se implementa en la plataforma).
- Blog / casos de éxito reales (con consentimiento).
- Exigir App Check (`enforceAppCheck: true`) tras la semana de monitoreo.

---

## 7. Estimación

| Fase | Claude Code | Andres |
|---|---|---|
| 0 Preparación | 3 h | 15 min |
| 1 Diseño y esqueleto | 6–8 h | 30 min (decisiones) |
| 2 Backend | 6–8 h | 45 min (consola de Google) |
| 3 CI/CD | 3 h | 45 min (WIF, DNS) |
| 4 Contenido y lanzamiento | 4–6 h | 1–2 h (revisión) |
| **Total** | **≈ 3–4 días** | **≈ 4 h** |

Las fases 1 y 2 pueden correr en paralelo (dos sesiones de Claude Code) si el diseño ya
llegó.
