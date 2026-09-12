# Acta de pase a producción — novuchat.site — v0.3.0 — 2026-09-08

Commit: `304af1c` · Tag: `v0.3.0` (anotado y **firmado**, ED25519) · Modo: A
Run: [34253048661](https://github.com/segurolotengopy/novuchat-site/actions/runs/34253048661) — 16:45 → 16:50 UTC, `success`
Autorizó el pase: Andres Alberdi desde la sesión de Claude Code
Ejecutó la aprobación: Claude Code con la cuenta `segurolotengopy`, por decisión suya
Acta escrita a posteriori (2026-09-12)

## Veredicto: desplegado. Vigente solo doce horas: lo reemplazó `v0.3.1`.

Las cifras de este pase (USD 20 / 40 / 70) venían del documento 18 y las superó
el 22 esa misma noche. El acta se conserva porque lo que cambió **de forma
permanente** —la moneda, el tope de 25, el número nuevo, el carrusel— entró
aquí.

## Cambios incluidos (desde `v0.2.6`)

| PR | Qué |
|---|---|
| [#36](https://github.com/segurolotengopy/novuchat-site/pull/36) | Precios en dólares (`precioBs` → `precioUsd`), `priceCurrency: 'USD'` en el JSON-LD, instalación USD 65 / a medida USD 125, excedente con «no vence», tope de 25 respuestas, número de WhatsApp nuevo |
| [#37](https://github.com/segurolotengopy/novuchat-site/pull/37) | «Soluciones por rubro» pasa a un carrusel de cuatro (entra Consultorios); el tope de 25 sale de las tarjetas y queda una vez al pie |
| [#35](https://github.com/segurolotengopy/novuchat-site/pull/35) | `pnpm asistente:probar` daba 12/13 de forma permanente por un caso correcto |
| #32, #33 | Acta de `v0.2.6` y la nota de por qué `pnpm dev` no llega a las Functions |

## Lo que más costaba si se olvidaba

`priceCurrency: 'BOB'` con el valor 20: **Google habría anunciado el plan a 20
bolivianos** en los resultados de búsqueda.

Y `scripts/construir-corpus.ts`, que el documento no mencionaba: es la fuente
del asistente. Sin tocarlo, el chat habría seguido citando bolivianos mientras
la página decía dólares. Fue lo que motivó el pase: Andres vio al asistente
publicado cotizar 250 Bs.

## Defecto encontrado al verificar

**Las diapositivas 3 y 4 del carrusel no cargaban su imagen.** `loading="lazy"`
no se dispara de forma fiable cuando la imagen entra por desplazamiento
horizontal dentro de un contenedor. Lo encontró una prueba de Playwright
(`naturalWidth > 0`), no una captura: media diapositiva en blanco se ve
perfecta en el DOM.

## Evidencia

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Pruebas | `pnpm verificar` en verde, 74 (dos nuevas del carrusel) |
| 2 | Datos pendientes | `pnpm listo` sin pendientes |
| 3 | Asistente contra Vertex | 13/13, citando «Impulso desde USD 20» |
| 4 | Cloud Run | `asistente-00012-ful` · `lead-00012-hoj`, creadas 16:49 UTC, `us-east1` |
| 5 | Tag | `git tag -v v0.3.0` → firma correcta |

## Plan de rollback

`firebase hosting:clone novuchat-site:previa novuchat-site:live`

Hoy no aplica: `previa` guarda el sitio anterior al **último** despliegue.

## Riesgos vigentes

Ver el acta de `v0.3.2`, que es la vigente.
