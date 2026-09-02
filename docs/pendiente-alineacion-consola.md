# Pendiente en la consola: alinear el sistema visual con el sitio

> **Destino: el repositorio `~/NovuChat/`, no este.** Se escribe aquí porque
> desde `novuchat-site` no se modifica nada de la consola (`CLAUDE.md`,
> prohibición 11). Copie este archivo cuando trabaje allá:
>
> ```bash
> cp docs/pendiente-alineacion-consola.md ~/NovuChat/admin/PENDIENTE-ALINEACION-SITIO.md
> ```

## Qué pasó

El 2026-09-02, Andres decidió que **el sitio comercial adopta los tokens del
prototipo de Claude Design**, no los del doc 08 que la consola implementa hoy.
La consecuencia es que los dos productos ya no se parecen: un cliente que ve
novuchat.site y al día siguiente entra a la consola percibe dos productos
distintos.

## La diferencia, en concreto

| | Consola hoy (doc 08) | Sitio (prototipo) |
|---|---|---|
| Fondo | `#f3f2f2` gris | `#f7f3ec` crema |
| Superficie | `#eae9e9` | `#ffffff` |
| Texto | `#201e1d` | `#1c211f` |
| Acento claro | `#3d4753` | `#2f3a44` |
| Divisor | 40 % de tinta | 16 % de tinta |
| **Radios** | **0 px en todo** | **8 / 16 / 28 px; botones, etiquetas y campos en píldora** |
| Sombras | cortas y duras | largas y suaves (`0 34px 80px`) |
| Fondo oscuro | `#171615` | `#101614` |
| Acento oscuro | `#35e2a0` | `#35e2a0` (coinciden) |
| Verde de marca | `#12c489` | `#12c489` (coinciden) |

Los dos acentos verdes y la tipografía (**Archivo**, autoalojada) ya coinciden:
lo que cambia es la temperatura del fondo, el tono del pizarra y, sobre todo,
**los radios**.

## Qué habría que hacer allá

1. Reemplazar el bloque `:root` y `[data-tema="oscuro"]` de
   `admin/web/src/diseno.css` por los valores de
   `novuchat-site/src/estilos/tokens.css`.
2. Cambiar `--radius-sm/md/lg` de `0` a `8px / 16px / 28px` y añadir
   `--radius-pildora: 999px` para `.btn`, `.tag`, `.seg` y `.input`.
3. Revisar las pantallas densas (tablas, listas de conversaciones): con radios
   el aire cambia y algunas separaciones se quedan cortas.
4. **Corregir el voseo del prototipo de la consola** («Mirá», «Revisá»,
   «volvé», «tocá», «vos sola»). El sitio usa tuteo y lo verifica en el CI con
   `pnpm prohibiciones`; conviene el mismo control allá.

## Qué NO hay que cambiar

- El verde `#12c489` sigue prohibido como color de texto en tema claro: da 2,0:1
  sobre fondo claro. Para texto se usa `#0b855c` (`--verde-texto`).
- Archivo se sigue sirviendo desde `/fuentes/`, nunca desde Google Fonts.

## Alternativa

Si la consola no se toca, hay que asumir que sitio y panel son dos marcas
visualmente distintas y decirlo explícitamente, para que nadie lo trate como un
defecto más adelante.
