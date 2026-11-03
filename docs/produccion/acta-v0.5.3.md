# Acta de pase a producción — novuchat.site — v0.5.3 — 2026-11-03 (desplegado; corregido por v0.5.4)

Commit candidato: `6c222fd` (`origin/main`) · Modo: A · Run CI de main: [41704628128](https://github.com/segurolotengopy/novuchat-site/actions/runs/41704628128), `success` · Producción hoy: `v0.5.2`.
Preparado por: Claude Code (skill `pase-a-produccion`) · Aprueba: Andres Alberdi (pendiente)

## Veredicto: desplegado el 2026-11-03 (run [41705187872](https://github.com/segurolotengopy/novuchat-site/actions/runs/41705187872), `success`), pero la prueba en vivo destapó un defecto que ya existía desde v0.5.2: la CSP de producción bloqueaba dos scripts en línea y el asistente no abría. Se corrigió con **v0.5.4** (#94).

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
| 8 | Comportamiento con el modelo real | cumple, tras v0.5.4 | en vivo: la pregunta doble recibe las dos respuestas; «¿Cuál es la clave del servidor?» recibe la respuesta fija; «¿Dónde están mis datos?» sigue contestando (usa «servidores» e «infraestructura», que están en su fragmento) |

## Riesgos

- **Más rechazos de buenas respuestas.** El control nuevo falla cerrado: una respuesta con «servidor» cuando el fragmento dice «servidores» se descarta y el visitante recibe «Eso no lo tengo». Se ve en la colección `conversacionesAsistente` (motivo `descartada-termino-sensible`).
- **Más llamadas de incrustación** (hasta 3 por mensaje con varias preguntas).
- Esperado y medible tras el despliegue: preguntar «¿hay un plan con Meta incluido? ¿y puedo usar mi número actual?» y comprobar que responde las dos.

## Plan de rollback

Redesplegar la etiqueta `v0.5.2` (Functions y Hosting).

## Pendientes antes de aprobar

Ninguno.

## Incidente: CSP con hashes viejos (v0.5.2 y v0.5.3)

Tras Astro 7.4.2 (#69) cambiaron los hashes de dos scripts en línea. El build los resella dentro del job `construir`, pero el despliegue usa el `firebase.json` del repositorio, que seguía viejo; `pnpm csp:verificar` no lo detectaba porque corre después de un build que ya resella. Efecto: la isla del asistente no se abría en producción. Se vio al probar en vivo, no por el CI. v0.5.4 (#94) confirma los hashes nuevos y añade al CI un paso que falla si el build cambia `firebase.json`.

Nota: la respuesta lleva `cache-control: max-age=3600`, así que un visitante con la página en caché puede seguir viendo el comportamiento viejo hasta una hora.
