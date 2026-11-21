# Acta de pase a producción — novuchat.site — v0.5.7 — 2026-11-21

Commit: 5f97e6f (main) | Run CI: 44849644295 | Modo: A (repositorio público) | Preparado por: Claude Code | Aprobó: Andres (2026-11-21, chat); desplegado, run 44903002529

## Cambios incluidos (desde v0.5.6)
- feat(sitio): página `/plataforma` (y `/en/plataforma`): cada negocio aislado de los demás, tu número y tu cuenta de WhatsApp Business, cómo entran los mensajes (receptor) y NovuTienda con rótulo «Próximamente». Entrada «Plataforma» en el menú y enlace en el pie (#112).
- feat(asistente): 4 fragmentos nuevos en el corpus del asistente (52 en total; índice regenerado).
- feat(faq): P18, el segundo plan se paga completo, al mismo precio (#112).
- chore(seguridad): excepción CVE-2026-41907 renovada hasta 2027-01-31 (#100).
- fix(dependabot): etiqueta `dependencies` (#101).
- docs: acta v0.5.6 (#99).

## Checklist
| # | Control | Estado | Evidencia |
|---|---|---|---|
| 1 | main al día; commit candidato = origin/main | cumple | 5f97e6f |
| 2 | CI de main en verde | cumple | run 44849644295: preparar, calidad, construir, seguridad-estatica y compuerta-pr en success; desplegar-produccion omitido (solo corre con tag) |
| 3 | CodeQL y Scorecard de main | cumple | runs 44849644282 y 44849644262, success |
| 4 | Sin cambios de CSP, reglas ni IAM | cumple | contenido y páginas nuevas; `firebase.json` sin diferencias (guarda de CI) |
| 5 | Corpus del asistente cambió y se reindexó | cumple | `pnpm rag:cotejar` y pruebas de unidad en verde; índice de 52 fragmentos |
| 6 | `pnpm verificar` | cumple | 117 pruebas de unidad y 90 de humo en verde en el PR (una caída aislada de Chromium móvil pasó al repetir) |
| 7 | Sin referencias a AAB1, términos prohibidos, cifras de Meta ni datos reales | cumple | `pnpm prohibiciones` en verde |
| 8 | Entorno `production` con revisor humano | cumple | revisor segurolotengopy |
| 9 | Producción responde | cumple | `https://novuchat.site/` → 200 |
| 10 | Excepciones vigentes | cumple | CVE-2026-41907 vence 2027-01-31; excepción de workflows vence 2026-12-30 (renovar o cerrar antes) |
| 11 | Smoke manual en staging | no verificado | el sitio no tiene staging; se verifica en vivo tras el pase |

## Riesgos aceptados
CVE-2026-41907 (uuid 8.3.2 vía functions-framework), hasta 2027-01-31, aprobada por Andres. Excepción de workflows (Checkov), hasta 2026-12-30.

## Plan de rollback
`firebase hosting:clone novuchat-site:previa novuchat-site:live`. El pipeline copia `live` a `previa` antes de desplegar. El índice del asistente viaja con las Functions: si se vuelve atrás, se vuelve también al corpus anterior.

## Pendientes antes de aprobar
1. Aprobación de Andres para la etiqueta firmada `v0.5.7` y el entorno `production`.
2. Tras el pase: comprobar `/plataforma` y `/en/plataforma` en vivo y que el asistente responda sobre la plataforma.
3. Avisar a NovuChat Principal de la nueva huella del corpus, si debe actualizar su copia.
