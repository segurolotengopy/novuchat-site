# Acta de pase a producción — novuchat.site — v0.2.5 — 2026-09-06

Commit: `94f4a78` · Tag: `v0.2.5` (creado y empujado por Claude Code, sin firma)
Run: [34064390811](https://github.com/segurolotengopy/novuchat-site/actions/runs/34064390811) · Modo: A
Autorizó el pase: Andres Alberdi desde la sesión de Claude Code
Ejecutó la aprobación: Claude Code con la cuenta `segurolotengopy`, por decisión suya

## Veredicto: desplegado. Dos fallos de `v0.2.4`, **ambos invisibles a la vista**.

## 1. El logo del asistente salía con ancho cero

El SVG cargaba —`complete: true`, natural 150×150— y se pintaba con
`width: 0px`.

La causa es mía: puse `min-width: 0` en `.asistente-marca`, y como el reinicio
global tiene `img { max-width: 100% }`, al colapsar el contenedor **ese 100 %
pasó a valer cero**. En local no se veía porque solo ocurre con el panel
estrecho, y la comprobación se hizo a ancho de escritorio.

El `min-width: 0` va ahora en el hijo de texto, que es donde hacía falta, y el
icono lleva medidas explícitas con `max-width: none` para no depender del ancho
del padre.

## 2. El banner de consentimiento tapaba el botón del asistente en móvil

Este es peor, y llevaba en pie desde que existe el banner. Los dos elementos son
`position: fixed` en el bajo de la pantalla, y el banner va en `z-index` 70
contra 50: **en un teléfono no se podía abrir el chat hasta decidir sobre la
medición**.

El botón se oculta mientras el banner está a la vista y aparece en cuanto el
visitante elige. En pantallas anchas no se solapan y la regla no se aplica.

## Quién los encontró

**La prueba nueva, no una captura.** Playwright falló con «intercepts pointer
events», que es literalmente lo que le pasa a un dedo sobre ese botón.

Se añaden las dos comprobaciones al conjunto de humo —tamaño real del logo, y
que nadie tape el botón—, porque:

- un elemento **presente pero de tamaño cero** se ve perfecto en el DOM;
- un elemento **visible pero cubierto** se ve perfecto en una imagen.

Ninguna captura de pantalla distingue esos dos casos del caso sano.

## Evidencia (contra el sitio publicado, a 375 px)

```json
{"con_banner":   {"viewport":375, "banner_visible":true, "boton_display":"none"},
 "tras_decidir": {"boton_display":"", "cubierto_por_banner":false},
 "logo":         "26x26"}
```

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Logo del panel a 375 px | 26×26 (antes 0×26) |
| 2 | Botón con el banner visible | `display: none` — ningún control inalcanzable |
| 3 | Botón tras decidir | visible y **no cubierto** |
| 4 | Captura del panel abierto en móvil | isotipo junto a «Asistente virtual» |
| 5 | Cloud Run | `asistente-00010-yeb` · `lead-00010-gen`, ambos `us-east1` |
| 6 | Sitio · `live` | 200 · `FINALIZED` v0.2.5 |
| 7 | Pruebas | 72 en verde |

## Plan de rollback

`firebase hosting:clone novuchat-site:previa novuchat-site:live`

## Riesgos vigentes

| Asunto | Estado |
|---|---|
| **App Check** | `enforceAppCheck: false`, pero **ya hay evidencia para activarlo**: las peticiones del navegador del propietario llegan con `conToken: true`. Cambio de una línea, pendiente de decisión |
| **Identidad legal provisional** | AAB1 / NIT 2441214012, a sustituir por el NIT propio de NovuChat |
| CVE-2026-41907 (`uuid`, MEDIA) | Vence 2026-12-01 |
| TypeScript 6 | `@astrojs/check` no lo admite de verdad |
| Cuatro leads de prueba | Rotulados, se conservan como evidencia |

## Lección de la serie v0.2.3 – v0.2.5

Los tres fallos de esta tanda —la región, el logo, el banner— **pasaron por una
verificación**. Una por `curl` en vez de por el navegador, otra a ancho de
escritorio, otra por captura de pantalla. Las tres verificaciones eran ciertas y
ninguna probaba lo que hacía falta probar.

Lo que los encontró fue, en orden: recorrer el camino real del usuario, una
prueba automática, y un barrido exhaustivo. **Nada de eso es mirar.**
