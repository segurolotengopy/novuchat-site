# Acta de pase a producción — novuchat.site — v0.4.0 — 2026-09-15

Commit: `fe38391` · Tag: `v0.4.0` (anotado y **firmado**, ED25519, firma verificada) · Modo: A
Run: [35047110928](https://github.com/segurolotengopy/novuchat-site/actions/runs/35047110928) — 02:12 → 02:18 UTC del 16/09 (22:12 → 22:18 del 15/09, hora de Bolivia), `success`
Autorizó el pase: Andres Alberdi desde la sesión de Claude Code («OK, fusiona y despliega»)
Ejecutó la fusión: Claude Code con la cuenta `AndresAlberdi` · Ejecutó la aprobación del Environment: Claude Code con la cuenta `segurolotengopy`, por decisión suya

## Veredicto: desplegado y verificado. Sale a producción la definición nueva de la conversación y el precio de instalación deja de estar escondido.

## Cambios incluidos (desde `v0.3.4`)

| PR | Tema | Antes | Ahora |
|---|---|---|---|
| [#45](https://github.com/segurolotengopy/novuchat-site/pull/45) | Estándar DevSecOps | 2.0 | **2.2** (Semgrep propio, Trivy, ZAP, `security-local.sh` nuevo). Sin efecto en el sitio |
| [#46](https://github.com/segurolotengopy/novuchat-site/pull/46) | **La conversación** (definición contractual de `/precios`, citada por `/terminos`) | Tope: el asistente se detenía en la respuesta 25 y avisaba | **Bloque de hasta 25 respuestas del asistente a un mismo cliente en 24 horas continuas; la 26 abre otra conversación y el asistente sigue.** Decisión de Andres del 13/09 (`NovuChat/Analisis/27`) |
| [#49](https://github.com/segurolotengopy/novuchat-site/pull/49) | Inglés | Seguía con el tope | Al modelo de bloques (`precios.en.ts`, `/en/precios`) |
| #49 | FAQ de la conversación larga | «en el día» | «24 horas continuas», como el glosario y la consola |
| #49 | «El asistente nunca deja a un cliente a medias» | Publicado | Quitado: a las 100 respuestas en la ventana la plataforma deja de contestar a ese teléfono. Queda «no deja a medias por pasar de 25» |
| #49 | `/terminos` §8 | «atención prioritaria» | «soporte técnico prioritario»: «atención» es un término del glosario que no se factura |
| #49 | **Precio de instalación** | Solo en la tarjeta de `/precios`, a 1.514 px en escritorio y 3.535 px en celular, y en `/terminos` | Línea «+ USD 65 de instalación, pago único» bajo el precio en las cinco tarjetas de plan (portada, `/precios`, los tres rubros y las dos en inglés); la nota bajo los planes lo nombra; FAQ nueva «¿Cuánto cuesta la instalación?» |
| #49 | Corpus del asistente | Índice del 12/09: decía «responde hasta 25 veces; si hace falta más, te avisa» | Regenerado, 41 fragmentos, huella `f912bb8c…`. Los fragmentos de plan dicen «ELIGE 1 SOLO de estos 2 caminos» en cifras |
| #49 | `.claude/settings.json` | — | La sesión de Claude Code no puede leer otros proyectos del disco |

## Dos defectos que este pase corrige, y de dónde salieron

1. **El asistente publicado contradecía a la página durante dos días.** `be15f34`
   (13/09) cambió la definición de conversación y se dio por terminado con
   prohibiciones, pruebas y build: tres de los nueve pasos de `pnpm verificar`.
   Quedó fuera `rag:cotejar`, que es justo el que avisa que el índice no
   coincide con el contenido, y la rama no abrió PR hasta el 14, así que el CI
   tampoco lo corrió. Lo encontró la sesión de la plataforma cotejando frases
   para la captación de WhatsApp, no una prueba (hallazgo 59 de `ESTADO.md`).
2. **«En el sitio no hay el precio de instalación»**, reclamo de un prospecto.
   Estaba, pero fuera de la vista: quien entra por la portada o por un rubro
   ve «USD 25 / mes» y descubre los USD 65 en la propuesta.

## Encontrado al verificar antes del pase

- `pnpm asistente:probar` falló 1/16 en «¿cuál es el plan más barato?»: el
  fragmento decía «uno de estos **dos** caminos» en letras, el modelo escribió
  «2» y el verificador lo descartó como número inventado. Hallazgo 56
  repitiéndose. Con las cifras en el corpus: 4/4 aceptadas y 16/16 en la
  corrida completa. Venía de antes; saltó porque la prueba corre en cada
  verificación.
- **La prueba de humo del CI falló por un 404 transitorio**: el canal de vista
  previa del PR recién creado tardó más de los 2,5 minutos que la prueba
  espera. Un minuto después respondía 200 en `/` y `/precios`. Se
  reejecutaron solo los trabajos fallidos: humo y ZAP en verde. No es un
  defecto del sitio; si se repite, conviene alargar la espera del paso.
- **El PR #49 apareció «en conflicto»** porque la misma rama ya se había
  fusionado el 14/09 como #46 con squash: `git` veía el mismo texto como dos
  cambios. Se trajo `main` a la rama; el árbol resultante fue idéntico al
  commit ya verificado (0 líneas de diferencia).

## Evidencia (contra producción)

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Cloud Run | `asistente-00017-bor` · `lead-00017-poc`, 02:17 UTC, 100 % del tráfico, `us-east1` |
| 2 | Las 18 páginas del sitemap | «+ USD 65 de instalación, pago único» en `/`, `/precios` y los tres rubros; «USD 65 one-time setup» en `/en` y `/en/precios`; la FAQ nueva en `/preguntas-frecuentes` y en la portada. Sin frases prohibidas |
| 3 | CSP servida | `img-src` intacta: `'self' data: gstatic googletagmanager google-analytics facebook` |
| 4 | Asistente publicado (navegador) | «y la instalación, ¿cuánto cuesta?» → «La instalación cuesta USD 65 como pago único por adelantado. Si tu negocio necesita desarrollo a medida, como integrarlo con tu sistema propio, la instalación arranca en USD 125 y se cotiza caso por caso.» |
| 5 | Pruebas locales | `pnpm verificar` completo: 85 unidad · prohibiciones · índice al día · build · CSP · 74 humo con `axe`. `pnpm listo` sin datos pendientes |
| 6 | Asistente contra Vertex | **16/16**, con dos casos nuevos: la conversación larga y el precio de instalación. Calibración sin cambios: corpus min 0,657 · ajenas max 0,689 · umbral 0,70 |
| 7 | CI del PR #49 | En verde tras la reejecución: compuerta-pr, calidad, CodeQL, Semgrep, Trivy, Gitleaks, previsualizar, humo y ZAP baseline |
| 8 | Aprobación | Registrada en GitHub por `segurolotengopy`, con la autorización de Andres en el comentario |
| 9 | Firma del tag | `git tag -v v0.4.0`: «Good "git" signature», ED25519 `SHA256:uVo5Nl7U…` |

## Plan de rollback

Estado anterior: `v0.3.4`, Cloud Run `asistente-00016-luw` · `lead-00016-sug`.

```bash
firebase hosting:clone novuchat-site:previa novuchat-site:live
gcloud run services update-traffic asistente --region us-east1 --project novuchat-site --to-revisions asistente-00016-luw=100
gcloud run services update-traffic lead --region us-east1 --project novuchat-site --to-revisions lead-00016-sug=100
```

Volver atrás reintroduce el tope con corte en el sitio y en el asistente, que
ya no es lo que la plataforma cobra: un rollback de este pase tiene que ser
breve y seguido de un arreglo hacia adelante.

## Riesgos vigentes

| Asunto | Estado |
|---|---|
| **El sitio promete avisos que la plataforma todavía no da** | «Te avisamos al llegar al 80 % de tu plan» (`/precios`, `/terminos`, EN, captación) y «te avisamos al número que nos des» al abrir el segundo bloque (FAQ). Ni el aviso del 80 % ni la transición al bloque 2 están programados (`NovuChat/Analisis/27` §5.4.2). Hasta entonces son avisos a mano. Decisión pendiente de Andres: programarlos antes del 01/10 o cambiar los textos |
| **Qué pasa al agotar el plan** | El prepago corta el servicio; no está en la plataforma y el sitio no lo dice. Pendiente |
| **Rubro Educación** | La captación de WhatsApp lo ofrece; el sitio no lo tiene (`NovuChat/CLIENTES/NOVUCHAT/03`). Espera la decisión de Andres y una foto propia |
| **Functions `conocimiento` y `leadWhatsapp`** | Pedidas por la plataforma (`…/02`). Sin la segunda, el prospecto de WhatsApp no se guarda |
| **Copia del corpus en la captación** | `Flujos/novuchat-onboarding.json` lleva la huella anterior; hay que recopiar con `f912bb8c…`. Lo hace la sesión de la plataforma |
| **Identidad legal provisional** | AAB1 / NIT 2441214012, a sustituir por el NIT propio de NovuChat |
| **«No lo sé» de más con el umbral en 0,70** | Aceptado. Se ve en `conversacionesAsistente`, motivo `bajo-umbral` |
| **Filtro de términos frente a contenido nuevo** | Preguntar al asistente publicado con las palabras de un cliente en cada pase. Hecho en este |
| **«Cobra por QR»** en la portada | Andres decidió mantenerlo (2026-09-11) |
| **Precio del segundo camino** | La FAQ dice «se contrata un plan para cada uno» sin decir si tiene precio distinto |
| **Desarrollo local sin Functions** | Decisión consciente (`CLAUDE.md`) |
| CVE-2026-41907 (`uuid`, MEDIA) | Excepción vigente, vence 2026-12-01 |
| Dependabot #47 (Astro 7.3.1), #48 (desarrollo), #34 (actions) | Abiertos, sin revisar |
| TypeScript 6 | `@astrojs/check` no lo admite de verdad |
| Leads de prueba | Rotulados, se conservan como evidencia (conteo no revisado desde `v0.2.6`) |
