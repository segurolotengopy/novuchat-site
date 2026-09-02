# 08 — Sistema de diseño del sitio (derivado del artefacto "Panel NovuChat")

> Fuente: artefacto de Claude Design **"Panel NovuChat"** (versión del 2026-09-02,
> https://claude.ai/code/artifact/d6bf0471-494b-441f-b637-bca480a4b1b7), leído tras la
> modificación de Andres. Este documento fija **los tokens exactos** que el sitio hereda,
> las adaptaciones que un sitio comercial necesita respecto de un panel, y las mejores
> prácticas para aplicarlos. Reemplaza la "paleta de arranque" provisional del doc 07.

---

## 1. Qué cambió en el diseño de la consola

La versión nueva del artefacto alinea la consola con el logotipo. Los tokens ya no son
los del Modernist rojo; ahora:

| Rol | Tema claro | Tema oscuro (`[data-tema="oscuro"]`) |
|---|---|---|
| Fondo `--color-bg` | `#f3f2f2` | `#171615` |
| Superficie `--color-surface` | `#eae9e9` | `#211f1e` |
| Texto `--color-text` | `#201e1d` | `#f3f2f2` |
| **Acento `--color-accent`** | **`#3d4753` (gris pizarra del logo)** | **`#35e2a0` (verde menta del logo)** |
| Texto sobre acento `--color-on-accent` | `#ffffff` | `#16211d` |
| **Acento 2 `--color-accent-2`** | **`#12c489` (verde, estados positivos y marca)** | igual |
| Divisor `--color-divider` | `color-mix(#201e1d 40%, transparent)` | `color-mix(#f3f2f2 45%, transparent)` |
| Rampa acento (100→900) | `#e7eaed #ced4da #aab3bd #7b8794 #3d4753 #343d47 #2b333b #212830 #171c22` | 500 `#35e2a0`, 600 `#12c489` |
| Rampa acento 2 (100→900) | `#ddf9ee #b5f2da #7ee7bd #35e2a0 #12c489 #0ea975 #0b855c #086546 #064733` | igual |
| Neutros (100→900) | `#f8f4f4 #eae7e7 #d7d3d3 #bab6b6 #9b9797 #7d7979 #605d5d #444141 #2d2b2b` | igual |
| Tipografía | Archivo 400 / 600 / 800; títulos 800 con `letter-spacing -0.015em`, línea 1.12; cuerpo 15 px, línea 1.55 | |
| Espaciado | 4 · 8 · 12 · 16 · 24 · 32 px | |
| Radios | **0 px** en todo (`--radius-sm/md/lg: 0`) | |
| Sombras | `0 1px 2px` / `0 3px 10px` / `0 12px 32px` con tinta `#2d2b2b` al 14/16/22 % | negras al 50/55/60 % |
| Etiquetas oscuras | `.tag-accent` `#2b333b`/`#cfd6dd`; `.tag-accent-2` `#0b3a2b`/`#7ee7bd`; `.tag-neutral` `#2d2b2b`/`#eae7e7` | |

Decisiones de diseño que el sitio hereda tal cual:

- **En claro, el pizarra es el acento y el menta es el énfasis**; en oscuro se invierte:
  el menta pasa a ser el acento. Es una solución elegante a la tensión que señalaba el
  doc 02 §8 (queda resuelta: D2 cerrada).
- Enlaces en `--color-accent`, hover en `--color-accent-600`.
- Botón primario: fondo acento, texto `--color-bg` (en oscuro, texto `#171615`).
  Secundario: borde divisor, hover con 7 % de tinta. Fantasma: texto acento.
- Divisores de **2 px** en barra superior y tablas; 1 px en filas.
- Barra superior: logo a 26 px + "NovuChat" en Archivo 800 17 px + divisor vertical +
  identidad del negocio + etiqueta de rol a la derecha.
- Alturas táctiles de **48 px** en campos y botones de ingreso; 36 px en botones de
  ícono del panel.
- **Estados con texto útil** (sin permiso, cargando, error, vacío): dicen qué pasó, por
  qué no es un error y qué hacer, con dos acciones. El sitio copia el patrón para el
  formulario y el asistente.
- **Cobro de demostración**: rótulo "DEMOSTRACIÓN — ESTE QR NO COBRA" en la imagen,
  en el pie y en la confirmación; bloque con candado explicando que el negocio no
  puede editarlo. El sitio reproduce el mismo bloque en la conversación de ejemplo.

Pantallas del artefacto: Ingreso, Negocios, Conversaciones, Configuración, Funcionarios,
Contactos, Uso, Cuenta, Reclamos, Bitácora, Cobro de demostración, Sin permiso; con
conmutadores de perfil (Dueño/Operador/NovuChat), rubro (Peluquería/Restaurante),
pantalla (celular/escritorio), tema y estado (normal/cargando/error/vacío/sin permiso).

**Hallazgo a corregir en la consola (no en este proyecto):** el texto del prototipo usa
**voseo** ("Mirá", "Revisá", "volvé", "tocá", "vos sola"), contrario al tono "tuteo, sin
voseo" del prompt original. El sitio usa tuteo en todos los textos; conviene avisar a
Silvana para unificar la consola.

---

## 2. Contraste (WCAG 2.1 AA) — lo que se puede y no se puede hacer

| Combinación | Ratio | Uso permitido |
|---|---|---|
| Pizarra `#3d4753` sobre fondo claro `#f3f2f2` | 8,45 | Texto, botones, ícono: todo |
| Texto `#201e1d` sobre `#f3f2f2` | 14,9 | Todo |
| **Verde `#12c489` sobre claro `#f3f2f2`** | **2,02** | **Solo relleno/decoración; nunca texto ni ícono informativo** |
| Verde 700 `#0b855c` sobre claro | 4,15 | Texto ≥ 14 px normal (AA) — usar para enlaces "positivos" en claro |
| Verde 800 `#086546` sobre blanco | 7,09 | Texto pequeño, etiquetas (AAA) |
| Menta `#35e2a0` sobre oscuro `#171615` | 10,8 | Texto y botones en oscuro |
| Oscuro `#16211d` sobre menta `#35e2a0` | 9,9 | Texto del botón primario en oscuro |
| Pizarra `#3d4753` sobre menta `#35e2a0` | 5,64 | Texto sobre bloques menta en claro (AA) |
| Verde `#12c489` sobre oscuro `#171615` | 8,0 | Texto en oscuro |

Reglas prácticas para el sitio:

1. Texto verde en tema claro: `--color-accent-2-700` o más oscuro. El `#12c489` se usa
   como **fondo de insignias** (con texto `--color-accent-2-900`), en los "tres puntos"
   del motivo gráfico, en barras y en el resplandor del héroe.
2. Botón primario en claro: **pizarra con texto blanco** (como la consola). Si se quiere
   un botón menta en claro (por ejemplo el CTA del héroe), el texto va en `#16211d` y el
   menta es `#35e2a0`, no `#12c489`.
3. En oscuro, el menta es protagonista: CTA, enlaces, puntos del logo.
4. Foco visible: anillo de 2 px `--color-accent` con `outline-offset: 2px`; en oscuro,
   menta. Nunca `outline: none` sin reemplazo.

---

## 3. Tokens del sitio (`src/estilos/tokens.css`)

El sitio **importa los tokens de la consola sin renombrarlos** y agrega solo lo que un
sitio comercial necesita. Así, cuando Claude Design entregue el sitio, el diff es mínimo
y un cambio de marca se propaga a los dos productos.

```css
:root {
  /* === heredados de la consola (copiar literalmente de diseno.css + bloque nuevo) === */
  --color-bg: #f3f2f2; --color-surface: #eae9e9; --color-text: #201e1d;
  --color-accent: #3d4753; --color-on-accent: #ffffff; --color-accent-2: #12c489;
  --color-divider: color-mix(in srgb, #201e1d 40%, transparent);
  /* rampas accent / accent-2 / neutral 100–900: ver §1 */
  --font-heading: "Archivo", system-ui, sans-serif; --font-heading-weight: 800;
  --font-body: "Archivo", system-ui, sans-serif;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-6: 24px; --space-8: 32px;
  --radius-sm: 0; --radius-md: 0; --radius-lg: 0;
  --shadow-sm: 0 1px 2px color-mix(in srgb, #2d2b2b 14%, transparent);
  --shadow-md: 0 3px 10px color-mix(in srgb, #2d2b2b 16%, transparent);
  --shadow-lg: 0 12px 32px color-mix(in srgb, #2d2b2b 22%, transparent);

  /* === propios del sitio === */
  --space-10: 40px; --space-16: 64px; --space-24: 96px;      /* ritmo de secciones */
  --ancho-lectura: 68ch; --ancho-contenido: 1120px;
  --color-accent-2-texto: var(--color-accent-2-700);          /* verde legible en claro */
  --color-fondo-alterno: #ffffff;                             /* secciones alternadas */
  --color-pizarra-bloque: #2b333b;                            /* bandas oscuras dentro del tema claro */
  --color-ok: #0b855c; --color-aviso: #b26a00; --color-error: #b3261e;
  --tipo-h1: clamp(34px, 6vw, 56px); --tipo-h2: clamp(26px, 4vw, 38px);
  --tipo-h3: 22px; --tipo-cuerpo: 16px; --tipo-cuerpo-m: 17px;  /* 17 px en móvil */
  --anillo-foco: 0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-accent);
}
[data-tema="oscuro"] {
  --color-bg: #171615; --color-surface: #211f1e; --color-text: #f3f2f2;
  --color-accent: #35e2a0; --color-on-accent: #16211d;
  --color-accent-500: #35e2a0; --color-accent-600: #12c489;
  --color-divider: color-mix(in srgb, #f3f2f2 45%, transparent);
  --shadow-sm: 0 1px 2px rgba(0,0,0,.5); --shadow-md: 0 3px 12px rgba(0,0,0,.55); --shadow-lg: 0 14px 36px rgba(0,0,0,.6);
  --color-accent-2-texto: #7ee7bd; --color-fondo-alterno: #1d1b1a; --color-pizarra-bloque: #211f1e;
  --color-ok: #35e2a0; --color-aviso: #f2b544; --color-error: #ff8a80;
}
```

Gestión del tema: `tema.ts` de la consola sin cambios (preferencia del sistema por
defecto, atributo forzable, `color-scheme` sincronizado, `localStorage` en `try/catch`).
Un `<script>` en línea de 6 líneas en el `<head>` aplica el atributo **antes del primer
pintado** para evitar el destello claro→oscuro (permitido por la CSP mediante `nonce`
o `sha256` del script; documentar el hash en `docs/csp.md`).

---

## 4. Adaptaciones de panel → sitio comercial (mejores prácticas)

Un panel optimiza densidad; un sitio de ventas optimiza claridad y ritmo. Se mantiene
el ADN (Archivo pesada, radios 0, divisores de 2 px, pizarra + menta) y se ajusta:

| Aspecto | Consola | Sitio | Motivo |
|---|---|---|---|
| Cuerpo | 15 px | 16 px escritorio, 17 px móvil | Lectura en Android de gama media, a un brazo de distancia |
| Títulos | 42 px máx. | h1 `clamp(34, 6vw, 56)`, h2 `clamp(26, 4vw, 38)` | Jerarquía comercial; escala fluida sin saltos |
| Ancho | fluido | contenido 1120 px, texto 68ch | Líneas de 60–75 caracteres |
| Ritmo vertical | 12–24 px | secciones 64 px móvil / 96 px escritorio | Aire entre bloques de venta |
| Fondo | un solo `--color-bg` | alterna `--color-bg` / `--color-fondo-alterno` y una banda pizarra (`#2b333b`, texto claro, menta como acento) para "Compromiso" y CTA final | Ritmo visual sin sombras ni gradientes |
| Botones | 36–48 px | CTA primario 52 px móvil, 48 px escritorio; siempre ≥ 44 px | Objetivo táctil |
| Tarjetas | superficie plana | superficie plana + borde superior 2 px pizarra o menta según categoría | Categorización sin color de fondo |
| Motivo gráfico | — | los **tres puntos** del logo (`···` en menta) como viñeta, separador y en el indicador "escribiendo…" del asistente | Identidad reconocible sin ilustraciones |
| Burbujas de chat | — | cliente: `--color-surface`, borde 1 px; asistente: `--color-accent-100` (claro) / `#2b333b` (oscuro), con el isotipo a 16 px; radios 0 | Coherencia con el sistema; no imitar WhatsApp |
| Imágenes | — | capturas de la consola en WebP con **marco de 2 px `--color-text`** (como el prototipo) | Mismo encuadre que el artefacto |
| Iconografía | inline | SVG en línea, trazo 1,75 px, 24 px, `currentColor` | CSP y tema |
| Movimiento | latido `opacity .55→1` | solo `opacity` y `transform`; ≤ 300 ms; desactivado con `prefers-reduced-motion` | Rendimiento y accesibilidad |

**Header del sitio (64 px):** logo 26 px + "NovuChat" Archivo 800 17 px (igual que la
consola), menú en 14 px, divisor inferior 2 px. "Ingresar" como `.btn-secondary`;
"Pedir una demo" como `.btn-primary`. En oscuro el primario es menta.

**Footer:** fondo `--color-surface`, divisor superior 2 px, texto 13 px al 70 %.

---

## 5. Componentes que el sitio toma prestados de la consola

Copiar las clases de `diseno.css` (mismos nombres, sin renombrar): `.btn`, `.btn-primary`,
`.btn-secondary`, `.btn-ghost`, `.btn-icon`, `.btn-block`, `.field`, `.input`, `.tag`,
`.tag-accent`, `.tag-accent-2`, `.tag-neutral`, `.tag-outline`, `.card*`, `.table`,
`.nav`, `.dialog*`, `.elev-*`. Los componentes nuevos del sitio (`.seccion`, `.heroe`,
`.burbuja`, `.plan`, `.acordeon`, `.chip`, `.banda`) se escriben con los mismos tokens y
se documentan en `docs/componentes.md` con captura y estados.

Estados obligatorios por componente (patrón del prototipo): normal, cargando, error,
vacío, sin permiso/límite. Cada estado con título, explicación de una línea y hasta dos
acciones.

---

## 6. Logotipo

- Vectorizar el JPEG: isotipo (círculo pizarra con anillo blanco y cola, tres puntos
  menta con resplandor opcional) + logotipo "NovuChat" en la fuente del logo. Entregar
  `logo.svg`, `logo-horizontal.svg`, `isotipo.svg`, `logo-mono.svg`, `logo-oscuro.svg`.
- En oscuro: el círculo pasa a `#f3f2f2` o se mantiene pizarra con anillo claro; los
  puntos siempre menta.
- Favicon: isotipo a 32/64 px sin resplandor (en 16 px los puntos se funden: usar un solo
  punto).
- El isotipo es el botón del asistente flotante (56 px, fondo pizarra en claro, menta en
  oscuro).

---

## 7. Checklist de fidelidad al sistema (para el CI y la revisión)

- [ ] Ningún color hexadecimal fuera de `tokens.css` (lint de CSS: `stylelint-declaration-strict-value`).
- [ ] Ningún `border-radius` distinto de los tokens (0).
- [ ] Ningún verde `#12c489` como `color` de texto en tema claro.
- [ ] Archivo se sirve desde `/fuentes/` con `font-display: swap` y preload del latin 400.
- [ ] Todos los estados (cargando/error/vacío/límite) existen en formulario y asistente.
- [ ] Tuteo sin voseo en todos los textos (lint de palabras: `mirá|revisá|tocá|volvé|vos\b|podés|tenés`).
- [ ] Contraste verificado con `axe` en claro y oscuro.
