# 05 — Contenido y secciones del sitio

> Guion de contenido página por página, con textos base en español (Bolivia, tuteo sin
> voseo) listos para adaptarse al diseño. Los textos ⚠️ dependen del documento comercial
> de Silvana. Todo texto de interfaz vive en `src/contenido/` y `src/i18n/`; este
> documento es la especificación, no el código.

---

## 0. Elementos globales

**Header (fijo, 64 px):** logo + "NovuChat" · Cómo funciona · Soluciones ▾ · Consola ·
Precios · Nosotros · [Ingresar → consola, secundario] · [Pedir una demo, primario] ·
selector idioma · selector tema · menú hamburguesa en móvil.

**Footer:** logo; columnas: Producto (Cómo funciona, Soluciones, Consola, Precios,
Preguntas frecuentes) · Empresa (Nosotros, AAB1 ↗, Contacto) · Legal (Privacidad,
Términos) · Ingresar a la consola. Línea legal: "NovuChat es un servicio de AAB1 —
Javier Andres Alberdi Baptista · NIT 2441214012 · La Paz, Bolivia". Insignia
"Canal oficial: WhatsApp Business Cloud API de Meta" (sin logos de Meta salvo bajo sus
lineamientos de marca).

**Asistente flotante (abajo a la derecha):** botón con el ícono del logo (burbuja con
tres puntos) y etiqueta "Asistente virtual". Ventana con encabezado "Asistente virtual
de NovuChat · es una IA", saludo, chips: "¿Cuánto cuesta?", "¿Cómo se instala?",
"Quiero una demo".

**Barra de aviso (opcional, hasta el 10/09):** "Estamos en la Rueda de Negocios el 9 y 10
de septiembre — instalación bonificada para los primeros 10 comercios" ⚠️.

---

## 1. Inicio `/`

### 1.1 Héroe

- **Insignia:** "Asistentes de WhatsApp con IA para negocios de Bolivia"
- **Título:** "El primer empleado de tu negocio que **nunca duerme**."
- **Bajada:** "NovuChat atiende a tus clientes por WhatsApp las 24 horas: responde,
  agenda citas en tu calendario, toma pedidos y cobra por QR. Lo instalamos en 48 horas y
  tú lo controlas desde tu celular."
- **CTA primario:** "Pedir una demo" → `/demo`. **CTA secundario:** "Ver cómo funciona".
- **Prueba social (fila):** "Canal oficial de Meta" · "Instalación en 48 h" · "Responde
  en menos de 1 minuto" · "Tú ves todo desde la consola".
- **Visual:** animación de una conversación real (burbujas): cliente escribe "¿tienen
  turno mañana en la tarde?" → asistente responde con tres horarios reales → "lunes a las
  11" → confirmación con la cita creada en el calendario (ícono). Datos ficticios.

### 1.2 El problema (4 tarjetas)

Pérdida de ventas · Citas olvidadas · Clientes que no vuelven · Equipo desgastado. Cada
una: ícono, título, una frase (doc 02 §2). Debajo, el comparador de velocidad de
respuesta (asistente < 1 min · humano en horario 15–60 min · fuera de horario: perdido).

### 1.3 Qué hace NovuChat (6 tarjetas)

Atiende 24/7 · Agenda en tu calendario real · Toma pedidos y cobra por QR · Recuerda
las citas 24 h antes · Deriva a una persona cuando hace falta · Consola para el dueño.

### 1.4 IA real vs. chatbots de botones (comparativa dos columnas)

Texto del pitch (doc 02 §3). Ejemplo: "Si el cliente cambia de opinión a mitad del
pedido, el asistente adapta la orden, recalcula el total y manda el QR."

### 1.5 Soluciones por rubro (3 tarjetas → páginas de vertical)

Salud y Belleza · Gastronomía · Comercio y Retail.

### 1.6 Así se ve en la vida real (conversación de ejemplo, Demo B)

Cliente: "Hola, quiero una hamburguesa doble, sin cebolla. Es para mandar a Calacoto."
Asistente: "Hamburguesa doble sin cebolla registrada. El total con envío a Calacoto es
45 Bs. Aquí tienes el QR para el pago:" [imagen QR **rotulada "DEMOSTRACIÓN — este QR no
cobra"**]. Cliente: "Listo, ya pagué." [comprobante]. Asistente: "¡Pago confirmado! Tu
pedido ya se está preparando. Tiempo estimado: 25 min."

### 1.7 La consola de tu negocio (sección con captura)

"Mira qué está haciendo tu asistente y cambia lo que necesites, desde el celular."
Viñetas: conversaciones en vivo · horarios, servicios y precios · funcionarios y agendas
· cierres del mes · reclamos y bitácora. CTA: "Conocer la consola" → `/consola`;
enlace "Ya soy cliente: ingresar" → consola.

### 1.8 Planes (resumen de 3 tarjetas) → `/precios`

### 1.9 Cómo lo instalamos en 48 horas (4 pasos)

Análisis → Desarrollo → Pruebas → Despliegue. "Tú no programas nada."

### 1.10 Compromiso (banda)

"Nuestro asistente siempre dice que es una IA. Los cobros de demostración siempre se
rotulan como simulados. Usamos únicamente el canal oficial de WhatsApp Business."

### 1.11 FAQ corto (5 preguntas) → `/preguntas-frecuentes`

### 1.12 CTA final

"¿Lo vemos en tu negocio?" [Pedir una demo] [Escribir por WhatsApp].

---

## 2. Cómo funciona `/como-funciona`

1. **Qué pasa cuando un cliente escribe** (diagrama simple, sin jerga): WhatsApp → el
   asistente entiende el mensaje → consulta tu agenda o catálogo → responde → te avisa.
2. **Memoria por cliente:** recuerda la conversación de cada número por separado.
3. **Agenda real:** consulta disponibilidad en Google Calendar y crea la cita; si el
   horario está ocupado, ofrece alternativas; **nunca confirma una cita que no existe**.
4. **Pedidos y cobros:** variantes, notas, envío por zona, QR, comprobante, aviso al
   dueño. Cobro real sujeto a integración bancaria ⚠️ (hoy: comprobante validado por el
   negocio).
5. **Recordatorios 24 h antes** por plantilla aprobada de WhatsApp.
6. **Derivación a humano:** tras 3 intentos fallidos o a pedido del cliente.
7. **Qué necesitamos de ti:** número de WhatsApp (o te damos uno), lista de servicios o
   productos con precios, horarios, calendario de Google, tono deseado.
8. **Qué NO hacemos:** no usamos WhatsApp "pirata" (dispositivos vinculados o APIs no
   oficiales) porque Meta bloquea esos números; no hacemos que el asistente se haga pasar
   por una persona.

---

## 3. Soluciones (una página por vertical)

Plantilla común: héroe con el rubro, 3 casos de uso, conversación de ejemplo (guiones de
`Analisis/03-plan-demos.md`), qué configura el dueño en la consola (captura de
`ConfiguracionVertical`), plan recomendado, CTA de demo.

- **Salud y Belleza:** agendamiento; belleza muestra precios, salud no (y explica por qué:
  la valoración la hace el profesional); recordatorio; reagendamiento; funcionarios con
  agenda propia y especialidades.
- **Gastronomía:** pedido con notas, envío por zona, QR, comprobante, cocina avisada,
  tiempo estimado.
- **Comercio y Retail:** catálogo, variantes talla/color, datos de envío (nombre y CI)
  antes del QR, coordinación con flota.

---

## 4. Consola `/consola`

- Héroe: "Tu negocio, bajo control, desde el celular." [Ingresar a la consola].
- Galería de pantallas (capturas reales con datos ficticios): Tablero, Conversaciones,
  Configuración, Funcionarios, Cierres, Cuenta, Reclamos, Bitácora.
- **Roles:** Dueño (configura todo), Operador (mira conversaciones y registra reclamos),
  NovuChat (soporte; nunca edita tu configuración sin tu pedido).
- **Seguridad explicada sin jerga:** "Cada negocio ve solo lo suyo. Las reglas que lo
  garantizan se prueban automáticamente en cada cambio (más de 200 pruebas). El personal
  de NovuChat entra únicamente con cuenta de Google y segundo factor."
- **Estado de cuenta y suspensión:** "Si un pago se atrasa, sigues viendo tus datos y el
  motivo; tus clientes reciben un mensaje neutro, nunca se enteran."
- FAQ propio: ¿funciona en el celular?, ¿cuántas personas pueden entrar?, ¿puedo
  exportar mis contactos?

---

## 5. Precios `/precios` ⚠️

Tabla de 3 planes (doc 02 §5) con: precio/mes, cierres incluidos, excedentes, lo que
incluye cada uno (asistente 24/7, agenda, pedidos, recordatorios, consola, soporte),
fidelización solo en Pro (marcar "próximamente" si no está lista). Instalación: 350 Bs
(bonificada en la Rueda de Negocios). Nota sobre costos de Meta e IA. Calculadora
opcional: "¿Cuántas citas o pedidos cierras al mes?" → plan sugerido. CTA por plan:
"Empezar con Impulso" → `/demo?plan=impulso`. Glosario: cierre, atención, interacción.

---

## 6. Demo `/demo`

Formulario (isla): nombre, negocio, rubro (select), ciudad, WhatsApp (+591 por defecto),
correo, ¿cuántos clientes atiendes por día? (rango), ¿qué te interesa? (agenda / pedidos /
ambos), mensaje, casilla de aceptación de privacidad. Éxito: "Listo, te escribimos por
WhatsApp en menos de 24 horas hábiles." Al lado: **Simulador** (versión web del
`Demo-Recursos/Simulador-NovuChat-v2.html`, sin WhatsApp real) para que el prospecto
"chatee" con un negocio ficticio.

---

## 7. Nosotros `/nosotros`

AAB1 (consultoría tecnológica boliviana, nube, IA); Andres Alberdi (arquitectura,
25 años de experiencia, certificaciones AWS/GCP/IA) y Silvana (diseño funcional y
experiencia comercial) ⚠️ confirmar apellido y descripción; por qué Bolivia; el
compromiso ético (tres puntos); enlace a www.aab1.website.

---

## 8. Preguntas frecuentes `/preguntas-frecuentes` (JSON-LD `FAQPage`)

1. ¿Necesito un número nuevo de WhatsApp? — No necesariamente; podemos conectar el tuyo
   si es WhatsApp Business, o darte uno de nuestra cuenta verificada.
2. ¿Qué pasa si el cliente manda un audio o una foto? — El asistente responde con
   cortesía y pide texto, o deriva a una persona (transcripción de audio: ⚠️
   próximamente).
3. ¿Puede equivocarse? — Sí; por eso nunca confirma una cita sin verificar que exista en
   tu calendario y deriva a una persona cuando no está seguro.
4. ¿El asistente dice que es una IA? — Siempre, si le preguntan.
5. ¿Cobra de verdad? — Muestra el QR de tu banco y valida el comprobante que envía el
   cliente; el cobro se acredita en tu cuenta. En demostraciones, el QR está rotulado como
   simulado.
6. ¿Cuánto tarda la instalación? — 48 horas desde que tenemos tu información.
7. ¿Qué pasa si no pago un mes? — Se suspende el asistente; conservas tus datos y el
   acceso a la consola en modo lectura.
8. ¿Dónde están mis datos? — En Google Cloud (Firebase), en servidores de la región de
   São Paulo ⚠️ (confirmar región elegida), aislados por negocio.
9. ¿Puedo cambiar de plan? — Sí, en cualquier momento; el cambio aplica el mes siguiente.
10. ¿Sirve para varias sucursales? — Sí: cada número de WhatsApp es un asistente
    (hasta 20 por cuenta verificada).

---

## 9. Contacto `/contacto`

Formulario corto (nombre, correo, WhatsApp, mensaje) + botón `wa.me/591XXXXXXXX?text=…`
⚠️ + correo ⚠️ + "La Paz, Bolivia". Horario de atención ⚠️.

---

## 10. SEO por página

| Página | `<title>` | Descripción (≤ 155) |
|---|---|---|
| Inicio | NovuChat — Asistente de WhatsApp con IA para tu negocio en Bolivia | Atiende 24/7, agenda citas, toma pedidos y cobra por QR. Instalación en 48 horas y consola desde tu celular. |
| Cómo funciona | Cómo funciona NovuChat | Qué pasa cuando un cliente te escribe por WhatsApp: entiende, agenda, cobra y te avisa. Sin programar nada. |
| Consola | La consola de NovuChat | Mira las conversaciones, configura horarios y precios y controla tu asistente desde el celular. |
| Precios | Planes y precios de NovuChat | Planes desde 150 Bs al mes. Instalación en 48 horas. Sin contratos largos. |
| Salud y Belleza | Asistente de WhatsApp para salones y consultorios | … |
| Gastronomía | Asistente de WhatsApp para restaurantes y delivery | … |
| Comercio | Asistente de WhatsApp para tiendas | … |

**JSON-LD:** `Organization` (NovuChat, `parentOrganization` AAB1, `contactPoint`,
`sameAs`), `SoftwareApplication` (`applicationCategory: BusinessApplication`,
`offers` con los tres planes en BOB), `FAQPage`, `BreadcrumbList` en subpáginas.
**Open Graph:** imagen 1200×630 con logo sobre fondo pizarra y una burbuja de
conversación; `og:locale es_BO`, alterno `en_US`.

---

## 11. Textos del asistente virtual del sitio (base de conocimiento, resumen)

La Function conoce: qué es NovuChat, para quién, los tres rubros, planes y precios ⚠️,
proceso de 48 h, qué necesita el cliente, canal oficial, consola y roles, compromiso
ético, contacto y cómo pedir una demo. **No conoce** ni inventa: infraestructura,
proveedores internos, clientes reales, descuentos no publicados, fechas de nuevas
funciones. Ante cotizaciones a medida o dudas técnicas: deriva al formulario de demo.
