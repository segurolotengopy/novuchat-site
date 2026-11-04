# Acta de pase a producción — novuchat.site — v0.5.6 — 2026-11-04

Commit: f2cd44b (main) | Modo: A (repositorio público) | Preparado por: Claude Code | Aprueba: Andres (pendiente)

## Cambios incluidos (desde v0.5.5)
- feat(sitio): botón flotante de WhatsApp al asistente virtual (#98). Enlace a `wa.me/59176988663` con texto prellenado «Hola, quiero información sobre NovuChat» (en inglés en `/en`). Datos confirmados por NovuChat Principal con WAM: línea de captación, nombre «NovuChat», sin verificar; el sitio no dice «verificado».
- docs: acta v0.5.5 (#96) y ESTADO.md al día (#97).

## Checklist
| # | Control | Estado | Evidencia |
|---|---|---|---|
| 1 | main al día; commit candidato = origin/main | cumple | f2cd44b |
| 2 | CI de main en verde | ver nota | runs de f2cd44b |
| 3 | Sin cambios de CSP, reglas ni IAM | cumple | solo componente Astro y CSS; `firebase.json` sin diferencias (guarda de CI) |
| 4 | Corpus del asistente sin cambios | cumple | no se tocó `src/contenido/`; no requiere reindexar |
| 5 | Sin afirmaciones de verificación ni datos reales | cumple | `pnpm verificar` en verde (86 pruebas de humo) |

## Plan de rollback
`firebase hosting:clone novuchat-site:previa novuchat-site:live`.

## Pendientes antes de aprobar
1. Run de main terminado en verde.
2. Aprobación de Andres para la etiqueta firmada y el entorno `production`.
