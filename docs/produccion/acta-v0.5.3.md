# Acta de pase a producción — novuchat.site — v0.5.3 — 2026-11-03 (preparada, sin ejecutar)

Commit candidato: `6c222fd` (`origin/main`) · Modo: A · Run CI de main: [41704628128](https://github.com/segurolotengopy/novuchat-site/actions/runs/41704628128), `success` · Producción hoy: `v0.5.2`.
Preparado por: Claude Code (skill `pase-a-produccion`) · Aprueba: Andres Alberdi (pendiente)

## Veredicto: se puede proceder. Cambia el comportamiento del asistente; el contenido público no cambia.

Versión propuesta: **patch** (`v0.5.3`): es endurecimiento y mejora del asistente, sin contenido nuevo (no se reindexa).

## Cambios incluidos (desde `v0.5.2`) — [#92](https://github.com/segurolotengopy/novuchat-site/pull/92)

| Tema | Antes | Ahora |
|---|---|---|
| **P16 términos sensibles** | La contención de «cuentas» era solo la regla del prompt | El verificador descarta una respuesta con un término bloqueado que no esté en los fragmentos recuperados |
| **P16 historial** | El historial que manda el navegador pasaba tal cual | Se descartan los turnos con términos bloqueados, en cualquier rol |
| **P17 preguntas dobles** | Se recuperaba con el mensaje entero y respondía solo la primera | Se parte en hasta 3 preguntas, se recupera por cada una (hasta 6 fragmentos) y el prompt pide responder todas |

## Checklist

| # | Control | Estado | Evidencia |
|---|---|---|---|
| 1 | `main` = candidato | cumple | `6c222fd` = `origin/main` |
| 2 | CI de main | cumple | run 41704628128, CodeQL y Scorecard `success` |
| 3 | `pnpm listo` | cumple | «no quedan datos sin confirmar» |
| 4 | Pruebas | cumple | 117 de unidad (8 nuevas), prohibiciones y `rag:cotejar` en verde |
| 5 | PR abiertos / Dependabot alto | cumple | 0 / 0 |
| 6 | Reglas Firestore | sin cambios | el diff no las toca |
| 7 | Requisitos modo A | cumple | verificados el 2026-11-03 para v0.5.2; sin cambios |
| 8 | Comportamiento con el modelo real | **no verificado** | Vertex solo corre en producción |

## Riesgos

- **Más rechazos de buenas respuestas.** El control nuevo falla cerrado: una respuesta con «servidor» cuando el fragmento dice «servidores» se descarta y el visitante recibe «Eso no lo tengo». Se ve en la colección `conversacionesAsistente` (motivo `descartada-termino-sensible`).
- **Más llamadas de incrustación** (hasta 3 por mensaje con varias preguntas).
- Esperado y medible tras el despliegue: preguntar «¿hay un plan con Meta incluido? ¿y puedo usar mi número actual?» y comprobar que responde las dos.

## Plan de rollback

Redesplegar la etiqueta `v0.5.2` (Functions y Hosting).

## Pendientes antes de aprobar

1. Andres autoriza etiquetar `v0.5.3` y aprobar el Environment `production`.
2. Probar el asistente en vivo con una pregunta doble y una con «clave» o «servidor».
