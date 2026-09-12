# Acta de pase a producción — novuchat.site — v0.3.1 — 2026-09-09

Commit: `381b12c` · Tag: `v0.3.1` (anotado y **firmado**, ED25519) · Modo: A
Run: [34311798890](https://github.com/segurolotengopy/novuchat-site/actions/runs/34311798890) — 04:39 → 04:42 UTC, `success`
Autorizó el pase: Andres Alberdi desde la sesión de Claude Code
Ejecutó la aprobación: Claude Code con la cuenta `segurolotengopy`, por decisión suya
Acta escrita a posteriori (2026-09-12)

## Veredicto: desplegado y verificado horas antes de la Rueda de Negocios.

El sitio pasó a decir lo mismo que la presentación que se usó en la feria.

## Cambios incluidos (desde `v0.3.0`)

| PR | Qué |
|---|---|
| [#38](https://github.com/segurolotengopy/novuchat-site/pull/38) | Cifras definitivas (documento 22): Impulso USD 25 / 100 conv., Crecimiento USD 50 / 220, Pro USD 90 / 500. «¡Pago confirmado!» sale del ejemplo de gastronomía; la difusión deja de figurar dentro de un plan. Nace la **prohibición 9** |
| [#39](https://github.com/segurolotengopy/novuchat-site/pull/39) | **«Elige tu camino»** (presentación 7): cada plan trae Citas **o** Ventas, nunca los dos. Recordatorios desde Impulso. Excedente USD 10 por **hasta 30**. Se retiran audios, Sheets, variantes, fidelización y difusión |

## El cambio de fondo

No fue de textos. `incluye` decía «Todo lo del plan Impulso» y sumaba
prestaciones: justo lo que hacía creer que por USD 50 iban dos negocios en un
mismo número. `caminos` pasó a ser un campo aparte del tipo `Plan`, para que la
tarjeta no pueda volver a leerse como una suma. El corpus lleva «ELIGE UNO … O
BIEN …» y una prueba lo exige.

## Dos defectos que aparecieron al verificar

1. **La prueba `rotula como próximas…` exigía que existiera al menos una
   función próxima**, es decir, una promesa a futuro: lo contrario de la
   prohibición 8. Falló cuando no quedó ninguna. Ahora comprueba la regla, no
   la presencia.
2. **`axe` marcó contraste insuficiente en tema oscuro** en el texto de los
   caminos: `--color-neutral-700` es fijo y queda gris sobre gris. Pasó a
   `color-mix()` sobre `--color-text`.

## Evidencia (contra producción)

| # | Comprobación | Resultado |
|---|---|---|
| 1 | `/precios` servido | «Impulso USD 25 / mes … 100 conversaciones … Elige tu solución: Citas — o bien — Ventas» |
| 2 | Excedente | «Cada bloque adicional de hasta 30 conversaciones cuesta USD 10 y no vence» |
| 3 | Asistente publicado | «El plan Crecimiento te permite elegir entre Citas o Ventas, no incluye ambos…» |
| 4 | Pruebas | `pnpm verificar` en verde, 74 · `pnpm listo` sin pendientes · Vertex 13/13 |
| 5 | Cloud Run | `asistente-00013-rel` · `lead-00013-piq`, creadas 04:42 UTC, `us-east1` |
| 6 | Presentación 7 | Las dos frases de pago corregidas a mano y devueltas |

## Plan de rollback

`firebase hosting:clone novuchat-site:previa novuchat-site:live`

Hoy no aplica: `previa` guarda el sitio anterior al **último** despliegue.

## Riesgos vigentes

Ver el acta de `v0.3.2`, que es la vigente.
