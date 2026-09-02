# 07 — Prompt para Claude Design: sitio comercial de NovuChat

> Instrucciones de uso: pegar en Claude Design **todo lo que está debajo de la línea**,
> adjuntando (1) los dos archivos del logo (fondo transparente y fondo blanco) y (2) el
> artefacto de la consola **"Panel NovuChat"** (versión del 2026-09-02) como sistema de
> diseño de partida. La sección "Planes" se completa con los planes que definirá Andres
> antes de pegar; si aún no están, dejar el bloque ⚠️ y pedir a Claude Design una tabla
> de tres planes con precios de ejemplo claramente marcados como provisionales.
>
> Prompt base de la consola, para coherencia: `~/NovuChat/Preliminares/prompt-diseno-panel.md`.

---

Diseña el **sitio web comercial de NovuChat** (`novuchat.site`), una página de ventas
completa, no una landing de una sola sección. Parte del sistema de diseño que ya creaste
para la consola de NovuChat (artefacto adjunto **"Panel NovuChat"**) y **reutiliza sus
tokens tal cual** —los mismos nombres y valores de color, la tipografía **Archivo**, los
radios de 0 px, los divisores de 2 px, los botones, campos, etiquetas y los estados
vacío/cargando/error/sin permiso—, de modo que el sitio y la consola se sientan como un
solo producto. Lo que cambia es el **ritmo**: un sitio de ventas necesita más aire, más
jerarquía y más imagen que un panel; adapta la escala sin cambiar el ADN.

## Qué es el producto

NovuChat vende **asistentes conversacionales de WhatsApp con inteligencia artificial** a
pequeñas y medianas empresas de Bolivia. El asistente atiende a los clientes del negocio
las 24 horas: responde preguntas, **agenda citas en el calendario real** del negocio (y no
inventa horarios), **toma pedidos** con variantes y notas, **cobra por QR** y valida el
comprobante, envía **recordatorios 24 horas antes** de la cita y avisa al dueño. Usa
únicamente el **canal oficial de WhatsApp Business (Meta)**. Se instala en **48 horas** y el
dueño lo controla desde una **consola web** pensada para el celular (la que ya diseñaste).

Frase de posicionamiento: **"El primer empleado de tu negocio que nunca duerme."**

Rubros: **Salud y Belleza** (peluquerías, estética, consultorios odontológicos: agenda y
recordatorios), **Gastronomía** (pedidos con notas, envío por zona, cobro por QR) y
**Comercio y Retail** (catálogo, tallas y colores, datos de envío, cobro).

Empresa detrás: AAB1, consultoría tecnológica boliviana (La Paz).

## Quién visita el sitio, que es lo que más condiciona el diseño

1. **Dueño o dueña de una PyME boliviana**, no técnico, que llega desde el celular
   (Android de gama media, con datos móviles) por un enlace de WhatsApp, un QR de un
   folleto o una búsqueda. Tiene 30 segundos de atención. Quiere saber tres cosas: qué
   hace, cuánto cuesta y cómo lo consigue. Si no lo entiende de un vistazo, cierra.
2. **Visitante de la Rueda de Negocios** (9 y 10 de septiembre de 2026) que escanea un QR
   durante la demostración y quiere dejar sus datos ahí mismo.
3. **Cliente actual** que entra a buscar el botón **"Ingresar"** de la consola. Tiene que
   encontrarlo en dos segundos, en el celular y en la computadora.

Diseña para el primer perfil. El tercero solo necesita que el enlace a la consola sea
inconfundible.

## Tono

Español latinoamericano de Bolivia, **tuteo, sin voseo**. Cordial, directo, concreto.
Sin jerga técnica: nunca "bot", "API", "webhook", "tenant", "dashboard". Decir
"asistente", "conexión con WhatsApp", "negocio", "consola". Los beneficios se muestran con
conversaciones reales, no con adjetivos.

## Identidad visual (la parte que requiere criterio)

**Logotipo adjunto:** burbuja de conversación en **gris pizarra** con un anillo blanco
interior y **tres puntos verde menta** con leve resplandor, y la palabra "NovuChat" en
gris pizarra con una sans geométrica redondeada. Es la marca; no la rediseñes, pero
entrega sus variantes: horizontal, vertical, solo isotipo (la burbuja), monocromo, sobre
fondo oscuro, y a 26 px de alto para la barra superior (la misma altura que usa la
consola).

**Paleta: la de la consola, sin cambios.** Tema claro: fondo `#f3f2f2`, superficie
`#eae9e9`, texto `#201e1d`, **acento pizarra `#3d4753`** (botón primario con texto blanco,
enlaces, énfasis), **segundo acento verde `#12c489`** (estados positivos, insignias, los
tres puntos del motivo gráfico), rampas de acento y neutros ya definidas. Tema oscuro:
fondo `#171615`, superficie `#211f1e`, texto `#f3f2f2`, **acento menta `#35e2a0`** con
texto `#16211d` sobre él. Respeta dos restricciones medidas: (a) el verde `#12c489` **no
alcanza contraste AA como texto sobre fondo claro** (2,0:1): úsalo solo como relleno y,
para texto verde en claro, usa `#0b855c` o más oscuro; (b) el producto vive junto a
WhatsApp en la cabeza del usuario: debe sentirse **cercano sin imitar el verde de WhatsApp
(#25D366)**. Puedes proponer un CTA en menta `#35e2a0` con texto `#16211d` en el héroe del
tema claro si mejora la conversión, pero indícalo como variante, no como cambio del
sistema.

**Tipografía:** Archivo (pesos 400, 600, 800), como en la consola, autoalojada. Escala
del sitio: cuerpo 16 px (17 px en celular), h1 fluido de 34 a 56 px, h2 de 26 a 38 px,
títulos en 800 con interletrado −0,015 em.

**Estructura y componentes:** los de la consola (radios 0, divisores de 2 px, botones de
44–52 px de alto, pestañas, tarjetas planas, etiquetas). Agrega los que un sitio necesita
y no existen en el panel: burbujas de conversación (cliente en superficie, asistente en
`accent-100` con el isotipo a 16 px), tarjeta de plan, acordeón de preguntas, chips de
sugerencia del asistente, banda oscura en pizarra `#2b333b` para "Compromiso" y la
llamada final, indicador "escribiendo…" con los tres puntos del logo. Usa el marco de
2 px en color de texto para encuadrar capturas de la consola, como en el prototipo.

**Tono en el diseño:** tuteo **sin voseo** en todos los textos de muestra (el prototipo
de la consola tiene "mirá / revisá / tocá": no los repitas; escribe "mira / revisa /
toca").

## Páginas y secciones (entregar como pantallas en celular y escritorio)

1. **Inicio**, con estas secciones en orden:
   - Héroe: insignia "Asistentes de WhatsApp con IA para negocios de Bolivia"; título
     "El primer empleado de tu negocio que nunca duerme."; bajada de dos líneas; dos
     botones: **"Pedir una demo"** (primario) y "Ver cómo funciona"; una **conversación
     animada** como visual principal (cliente: "¿tienen turno mañana en la tarde?";
     asistente ofrece tres horarios reales; cliente elige; confirmación con la cita en el
     calendario). Debajo, cuatro pruebas: Canal oficial de Meta · Instalación en 48 h ·
     Responde en menos de 1 minuto · Tú ves todo desde la consola.
   - El problema (4 tarjetas: ventas perdidas fuera de horario, citas olvidadas, clientes
     que no vuelven, equipo desgastado) y un comparador de velocidad de respuesta
     (asistente < 1 min · humano en horario 15–60 min · fuera de horario: perdido).
   - Qué hace NovuChat (6 tarjetas).
   - "IA de verdad vs. chatbots de botones" (dos columnas).
   - Soluciones por rubro (3 tarjetas).
   - "Así se ve en la vida real": conversación de pedido con QR de pago. **Regla
     innegociable:** el QR que aparece es de demostración y lleva el rótulo
     **"DEMOSTRACIÓN — este QR no cobra"** impreso en la imagen y repetido en el pie;
     diséñalo para que sea imposible de pasar por alto, sin atenuarlo ni esconderlo. Es un
     compromiso ético del producto.
   - La consola de tu negocio: captura de la consola (usa tus propias pantallas del
     artefacto) con 5 viñetas y dos enlaces: "Conocer la consola" y "Ya soy cliente:
     ingresar".
   - Planes (3 tarjetas resumidas).
   - Cómo lo instalamos en 48 horas (4 pasos).
   - Banda de compromiso: "Nuestro asistente siempre dice que es una IA. Los cobros de
     demostración siempre se rotulan como simulados. Usamos únicamente el canal oficial de
     WhatsApp Business."
   - 5 preguntas frecuentes (acordeón) y llamada final: "¿Lo vemos en tu negocio?"
2. **Cómo funciona**: un diagrama simple, sin jerga, de lo que pasa cuando un cliente
   escribe (WhatsApp → el asistente entiende → consulta tu agenda o catálogo → responde →
   te avisa), más "qué necesitamos de ti" y "qué NO hacemos".
3. **Solución por rubro** (una plantilla, tres variantes: Salud y Belleza, Gastronomía,
   Comercio): casos de uso, conversación de ejemplo, qué configura el dueño, plan
   recomendado.
4. **Consola**: galería de pantallas, roles (Dueño, Operador, NovuChat), seguridad
   explicada sin jerga ("cada negocio ve solo lo suyo"), botón "Ingresar a la consola".
5. **Precios** ⚠️ **[REEMPLAZAR CON LOS PLANES QUE DEFINA ANDRES]**: diseña una tabla de
   tres planes con precio mensual en bolivianos, lo que incluye cada uno (cierres o citas
   incluidos, recordatorios, consola, soporte), un plan destacado como recomendado,
   excedentes, costo de instalación y una oferta de lanzamiento resaltada. Incluye un
   glosario breve de "cierre", "atención" e "interacción", que son las unidades que
   muestra la consola.
6. **Pedir una demo**: formulario (nombre, negocio, rubro, ciudad, WhatsApp con +591,
   correo, clientes por día, qué te interesa, mensaje, casilla de privacidad) con estados
   cargando, error y éxito ("te escribimos por WhatsApp en menos de 24 horas hábiles"), y
   al lado un **simulador**: un chat de prueba con un negocio ficticio.
7. **Nosotros**, **Preguntas frecuentes**, **Contacto**, **Privacidad** y **Términos**
   (para estas, basta la plantilla de página de texto).

## Elementos globales

- **Barra superior** (64 px): logo a 24 px, menú (Cómo funciona · Soluciones · Consola ·
  Precios · Nosotros), botón secundario **"Ingresar"** (va a la consola), botón primario
  **"Pedir una demo"**, selector de idioma ES/EN, selector de tema. En móvil: logo,
  "Ingresar" visible siempre, hamburguesa.
- **Pie**: columnas Producto / Empresa / Legal, "Ingresar a la consola", línea legal
  ("NovuChat es un servicio de AAB1 · NIT · La Paz, Bolivia") y la mención "Canal oficial:
  WhatsApp Business Cloud API de Meta" sin usar logos de Meta.
- **Asistente virtual flotante** (abajo a la derecha): botón con el isotipo (la burbuja)
  y etiqueta "Asistente virtual"; ventana con encabezado que dice **"es una IA"** de forma
  visible, saludo, tres chips ("¿Cuánto cuesta?", "¿Cómo se instala?", "Quiero una demo"),
  campo de texto, estados cargando/error/límite alcanzado ("por hoy alcanzamos el límite
  de este chat; déjanos tus datos en el formulario").
- **Barra de aviso** opcional hasta el 10 de septiembre: "Estamos en la Rueda de Negocios
  el 9 y 10 de septiembre — instalación bonificada para los primeros 10 comercios".

## Requisitos de usabilidad, en orden

1. **Celular primero**, con datos móviles: sin video pesado; la conversación del héroe es
   una animación de burbujas, no un video.
2. **Tres respuestas en el primer pantallazo**: qué hace, cuánto cuesta (o dónde verlo),
   cómo lo consigo.
3. **"Ingresar" siempre visible** para el cliente actual.
4. **Accesible de verdad**: contraste AA (recuerda el menta), foco visible, navegación por
   teclado del acordeón y del chat, textos que crecen al 200 % sin romper, objetivos de
   toque de 44 px, animaciones que respetan "reducir movimiento".
5. **Estados que se olvidan**: formulario con error de red, chat sin respuesta, página
   404, aviso de cookies **no hace falta** (no usamos cookies de terceros) pero sí el
   enlace a privacidad junto al formulario.

## Restricción técnica

El sitio se construye como páginas estáticas con islas de interactividad, con una
política de seguridad de contenido estricta: **nada de CDN, ni fuentes remotas, ni
scripts de terceros** (ni siquiera Google Fonts en producción; Archivo se sirve desde el
mismo dominio). Todo lo que diseñes tiene que poder empaquetarse con el sitio: SVG en
línea para íconos e ilustraciones, imágenes WebP, animaciones CSS. Sin mapas embebidos ni
videos de YouTube.

## Entregables

1. Inicio, Consola, Precios y Pedir una demo en celular y escritorio, en tema claro y
   oscuro.
2. Plantilla de página de rubro y plantilla de página de texto (privacidad).
3. Sistema de diseño extendido: los tokens de la consola **sin renombrar** más los
   componentes nuevos del sitio (burbujas, tarjeta de plan, acordeón, chips, banda,
   indicador "escribiendo…"), con sus estados, en claro y oscuro.
4. El logotipo en sus variantes y el isotipo como favicon y como botón del asistente.
5. Una imagen para compartir en redes (1200×630) con el logo y una burbuja de
   conversación.
6. Una lista de las diferencias deliberadas entre sitio y consola (escala, ritmo,
   componentes nuevos), para que quien mantenga los dos productos sepa qué es
   intencional.

---

### Tokens de partida para Claude Code

Ya no hace falta una paleta provisional: los tokens definitivos, extraídos del artefacto
"Panel NovuChat", están en `08-sistema-de-diseno.md` §1 y §3. Claude Code construye con
esos valores desde la Fase 1; el entregable de Claude Design solo agrega componentes.
