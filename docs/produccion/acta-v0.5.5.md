# Acta de pase a producción — novuchat.site — v0.5.5 — 2026-11-04

Commit: 308df76 (main) | Modo: A (repositorio público) | Preparado por: Claude Code | Aprueba: Andres (pendiente)

## Cambios incluidos (desde v0.5.4)
- feat(consola): funciones nuevas de la plataforma en `/consola`, `/en/consola` y `/como-funciona` (#95): Conversaciones con búsqueda y filtros, Tomar la conversación, fotos/audios/documentos (a pedido), turno partido, bloquear contacto, comprobantes recibidos y miniCRM. Fuente: lista verificada de NovuChat Principal del 03/11/2026.

## Checklist
| # | Control | Estado | Evidencia |
|---|---|---|---|
| 1 | main al día; commit candidato = origin/main | cumple | 308df76 |
| 2 | CI de main en verde (calidad, seguridad, construir) | cumple | runs 41785139669 y 41785139679 en success; staging y humo según el run en curso |
| 3 | Sin cambios de CSP ni de reglas/IAM | cumple | solo páginas Astro; `firebase.json` sin diferencias |
| 4 | Corpus del asistente sin cambios | cumple | no se tocó `src/contenido/`; no requiere reindexar |
| 5 | Texto sin afirmar pagos ni mostrar datos reales | cumple | `pnpm verificar` y `pnpm prohibiciones` en verde en el PR |

## Plan de rollback
`firebase hosting:clone novuchat-site:previa novuchat-site:live` (el pipeline copia `live` a `previa` antes de desplegar).

## Pendientes antes de aprobar
1. Que termine el run de main en curso (humo en staging).
2. Aprobación de Andres para la etiqueta firmada y el entorno `production`.
