# Acta de pase a producción — novuchat.site — v0.5.8 — 2026-11-21

Commit: 557dadb (main) | Run CI: 44905258775 | Modo: A (repositorio público) | Preparado por: Claude Code | Aprobó: Andres (2026-11-21, chat); desplegado, run 44905483208

## Cambios incluidos (desde v0.5.7)
- feat(consola): sección «Así se ve» en `/consola` y `/en/consola` con 7 capturas de un negocio de ejemplo (Salón Aurora, etiqueta PRUEBA, teléfonos ficticios), en webp, con texto alternativo y pie (#114).
- docs: acta v0.5.7 (#113).

## Checklist
| # | Control | Estado | Evidencia |
|---|---|---|---|
| 1 | main al día; commit candidato = origin/main | cumple | 557dadb |
| 2 | CI de main en verde | cumple | run 44905258775 y CodeQL 44905258776, success |
| 3 | Sin cambios de CSP, reglas ni IAM | cumple | imágenes del mismo origen y CSS; `firebase.json` sin diferencias (guarda de CI) |
| 4 | Corpus del asistente sin cambios | cumple | no se tocó `src/contenido/`; no requiere reindexar |
| 5 | `pnpm verificar` | cumple | 90 pruebas de humo en verde en el PR |
| 6 | Sin datos de clientes reales | cumple | solo «Salón Aurora» con etiqueta PRUEBA y teléfonos 5917000000x |
| 7 | Excepciones vigentes | cumple | CVE-2026-41907 hasta 2027-01-31; workflows hasta 2026-12-30 |
| 8 | Smoke manual | no verificado | sin staging; se verifica en vivo tras el pase |

## Plan de rollback
`firebase hosting:clone novuchat-site:previa novuchat-site:live`.

## Pendientes antes de aprobar
1. Aprobación de Andres para la etiqueta firmada y el entorno `production`.
2. Tras el pase: comprobar que las 7 imágenes carguen en `/consola`.
