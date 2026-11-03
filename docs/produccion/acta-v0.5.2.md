# Acta de pase a producción — novuchat.site — v0.5.2 — 2026-11-03 (preparada, sin ejecutar)

Commit candidato: `21b5670` (`origin/main`) · Modo: A · Run CI de main: [41692028480](https://github.com/segurolotengopy/novuchat-site/actions/runs/41692028480), `success`
Preparado por: Claude Code (skill `pase-a-produccion`) · Aprueba: Andres Alberdi (pendiente) · Producción hoy: `v0.5.1`, `https://novuchat.site` responde 200.

## Veredicto: se puede proceder. Es un pase de mantenimiento sin cambio visible para el cliente.

Versión propuesta: **patch** (`v0.5.2`). Todo son `chore`/`ci`: no hay `feat` ni `fix` de producto. No cambió contenido público, así que no hace falta reindexar el asistente (`pnpm rag:cotejar` pasó en la verificación local).

## Cambios incluidos (desde `v0.5.1`, 10 PR)

| PR | Qué |
|---|---|
| #84 | `firebase-admin` 14.5.0 (elimina `uuid@9.0.1`, P14) y avisos HIGH nuevos (undici, vite, re2js, body-parser, zod) |
| #69 | astro 7.4.2, `@astrojs/preact` 6.1.1, firebase 12.19.0 (los hashes de la CSP se resellaron en el build) |
| #67, #82, #83, #89 | postcss-selector-parser, fast-uri (raíz y functions), qs |
| #79 | 14 herramientas de desarrollo (no llegan al sitio) |
| #86 | 10 acciones de GitHub fijadas por SHA |
| #87 | `pnpm listo` corre en `calidad` al etiquetar (P15) |
| #88 | texto de la excepción CVE-2026-41907 al día (uuid@8.3.2) |

## Checklist

| # | Control | Estado | Evidencia |
|---|---|---|---|
| 1 | `main` sincronizada, candidato = HEAD | cumple | `21b5670` = `origin/main` |
| 2 | CI de main en verde | cumple | run 41692028480: calidad, construir, SAST, SCA, secretos, Checkov, compuerta-pr en `success`; CodeQL y Scorecard `success` |
| 3 | `pnpm listo` | cumple | «Listo para producción: no quedan datos sin confirmar» |
| 4 | Humo y CSP | cumple | `pnpm verificar` con #79: 109 pruebas y 86 de humo en verde (local, 2026-11-03); el humo no corre en PR |
| 5 | PR abiertos / incidentes | cumple | ninguno abierto; sin issues `incidente` |
| 6 | Dependabot alta/crítica | cumple | 0 abiertas |
| 7 | Code scanning | no bloqueante | 4 high de Scorecard a nivel repositorio (CodeReview, Maintained, Vulnerabilities, BranchProtection), sin archivo; no vienen de este cambio |
| 8 | Excepciones | cumple | CVE-2026-41907 vence 2026-12-01 (28 días: renovar o cerrar); CKV_GHA_7 vence 2026-12-30 |
| 9 | Requisitos modo A | cumple | repo público; Environment `production` con revisor `segurolotengopy`; rulesets `proteger-main` y `proteger-tags`; `APROBADORES_PROD` definida |
| 10 | Firma de tags | cumple | `user.signingkey` ED25519 y `tag.gpgSign=true` |
| 11 | Reglas Firestore / IAM | sin cambios | `git diff v0.5.1..main` no toca `firestore.rules` |
| 12 | Smoke en producción tras el despliegue | pendiente | se hace después del pase |

## Riesgos y lo no verificado

- Las acciones nuevas de #86 en `release.yml` (`softprops/action-gh-release`) y `scorecard.yml` (`scorecard-action` 2.5.0) no corrieron antes en un PR: el primero se ejercita con esta etiqueta. Scorecard ya corrió en main con éxito.
- Astro 7.4.2 resella la CSP: `pnpm csp:verificar` pasó, pero no se vio en un navegador real.

## Plan de rollback

Hosting: el pipeline copia `live` a `previa` antes de desplegar; vuelta atrás con `firebase hosting:clone novuchat-site:previa novuchat-site:live`. Functions: redesplegar la etiqueta `v0.5.1`.

## Pendientes antes de aprobar

1. Andres autoriza etiquetar `v0.5.2` y aprobar el Environment `production`.
2. Verificar `https://novuchat.site` y el asistente después del despliegue.
