# 02 — Contexto de negocio y producto NovuChat

> Todo lo que el sitio web tiene que contar, extraído de `~/NovuChat/` (CLAUDE.md,
> ESTADO.md, Analisis/, Preliminares/Presentación NovuChat.html, admin/DISENO.md).
> Este documento es la **fuente de contenido** para `05-contenido-y-secciones.md`.
> Los datos comerciales marcados con ⚠️ deben confirmarse con el documento comercial
> que enviará Silvana antes de publicarse.

---

## 1. Qué es NovuChat

**Asistentes conversacionales de WhatsApp para PyMEs bolivianas**, construidos con
**n8n + IA** sobre la **Cloud API oficial de Meta**. El asistente atiende a los clientes
del negocio las 24 horas, agenda citas en el calendario real, toma pedidos con variantes
y notas, cobra por QR y avisa al dueño. Se instala en **48 horas** y el dueño lo
administra desde una **consola web** pensada para el celular.

Proyecto conjunto de **Andres Alberdi** (arquitectura, infraestructura, comercial) y
**Silvana** (diseño funcional, guiones, material comercial). Empresa detrás: **AAB1**
(www.aab1.website), empresa unipersonal boliviana con NIT, sede en La Paz.

**Frase de posicionamiento (del pitch deck):** *"El primer empleado de tu negocio que
nunca duerme."*

---

## 2. El problema que resuelve (mensajes del pitch)

- **Pérdida de ventas:** los clientes escriben fuera de horario o en hora pico; sin
  respuesta, se van con la competencia.
- **Ausencias costosas:** en clínicas y salones los clientes olvidan sus citas y dejan
  huecos irrecuperables.
- **Falta de retención:** el 80 % no vuelve porque nada lo incentiva a regresar. ⚠️
- **Desgaste operativo:** el equipo pierde horas respondiendo lo mismo a mano.

**Velocidad de respuesta:** asistente IA < 1 minuto (99 %); humano en horario de
oficina 15–60 minutos (45 %); humano fuera de horario: perdido. *"Responder en el primer
minuto aumenta las probabilidades de conversión en un 391 %."* ⚠️ (cita sin fuente en el
deck: verificar o atribuir antes de publicar).

---

## 3. Propuesta de valor

| Pilar | Qué promete | Qué lo respalda técnicamente |
|---|---|---|
| **Asistente IA 24/7** | Recepcionista virtual en WhatsApp que entiende lenguaje natural y nunca duerme | AI Agent de n8n con memoria por número de teléfono; Gemini en demos, Claude en producción |
| **Agenda real** | Consulta disponibilidad y crea la cita en Google Calendar; no inventa horarios | Herramienta `consultar_disponibilidad` + `agendar_cita`; compuerta que verifica que el evento exista antes de confirmar |
| **Cierre de ventas** | Toma el pedido, calcula el total, envía QR y confirma al recibir el comprobante | Demo B: variantes talla/color, notas, datos para envío, QR, alerta al dueño |
| **Recordatorios** | Recordatorio automático 24 h antes de la cita | Flujo `demo-a-recordatorios` con plantilla aprobada de Meta; marca anti-duplicado |
| **Fidelización** | Puntos por compra desde el chat (Plan Pro) | ⚠️ Módulo anunciado en el deck; no existe implementación aún: presentar como "próximamente" o retirar |
| **Consola del negocio** | El dueño ve conversaciones, configura horarios, servicios, precios y funcionarios, desde el celular | Panel React + Firebase multi-tenant, 226 pruebas en verde |
| **Canal oficial** | Número de WhatsApp Business propio, sin riesgo de bloqueo | Solo Meta Cloud API (prohibición 1 de CLAUDE.md) |
| **Instalación en 48 h** | Análisis → desarrollo → pruebas → despliegue sin que el cliente programe nada | Función `altaTenant` + `Config del negocio` centralizado |

**Diferenciador contra "chatbots de agencias":** los árboles de botones se rompen ante
errores de tipeo, audios o cambios de opinión; NovuChat entiende contexto, adapta el
pedido y recalcula el total.

**Compromiso ético (innegociable, de CLAUDE.md):** el asistente **nunca niega ser una IA**;
los cobros de demostración se rotulan como simulados en la imagen, el pie y la
confirmación; el mensaje a un cliente de un comercio suspendido es neutro.

---

## 4. Verticales (soluciones por industria)

| Vertical | Casos de uso | Demo que lo sostiene |
|---|---|---|
| **Salud y Belleza** (peluquerías, estética, consultorios odontológicos) | Agendamiento sin intervención humana; recordatorio 24 h antes; reagendamiento por el cliente; belleza muestra precios, salud no (maneja la objeción y deriva) | Demo A — "Salón Aurora" (ficticio) |
| **Gastronomía** (restaurantes, delivery) | Pedido con notas especiales; cálculo con envío por zona; QR de pago; validación del comprobante; derivación a humano solo en excepciones | Demo B — "Parrilla El Fogón" (ficticio) |
| **Comercio y Retail** (tiendas de ropa, etc.) | Navegación de catálogo; variantes talla/color; datos de envío (nombre y CI) antes del QR; coordinación con flota | Demo B |

Regla común: **límite de 3 rechazos y derivación a un humano**; horario y zona
`America/La_Paz` inyectados al agente; respuesta cortés a audios, imágenes y botones.

---

## 5. Planes y precios (⚠️ **Andres definirá los planes definitivos; lo siguiente es lo que dice el pitch y se reemplaza íntegro**)

| Plan | Precio | Incluye |
|---|---|---|
| **Impulso** | 150 Bs/mes | Hasta 50 pedidos/citas |
| **Crecimiento** | 250 Bs/mes | Hasta 150 pedidos/citas |
| **Pro** | 350 Bs/mes | Hasta 400 pedidos/citas + módulo de fidelización |

- Excedentes: **35 Bs por cada 50 pedidos adicionales**.
- Instalación regular: **350 Bs**; **oferta Rueda de Negocios: 0 Bs** (100 % bonificada)
  para los primeros 10 comercios que aseguren su primer mes.
- Unidad de facturación real (ESTADO.md, 2026-09-01): la consola cuenta **cierres**
  (citas o pedidos confirmados), **atenciones** (personas únicas por período) e
  **interacciones** (respuestas del asistente, a partir de la segunda por conversación).
  El sitio debe usar el mismo vocabulario que la consola.
- Costos de terceros que el cliente debe conocer (para la sección de FAQ): conversaciones
  de WhatsApp Business (tarifa de Meta por conversación iniciada por el negocio) y consumo
  del modelo de IA, ambos incluidos o no según el plan ⚠️.

---

## 6. Cómo se contrata (proceso de 48 h)

1. **Análisis** (reunión de 1 h): rubro, servicios, precios, horarios, funcionarios,
   tono del asistente.
2. **Desarrollo**: alta del negocio en la consola (`altaTenant`), carga de configuración,
   conexión del número de WhatsApp (o alta de uno nuevo en la WABA de NovuChat).
3. **Pruebas**: ensayo con los guiones de casos de prueba (agendar, rechazar, cambiar de
   opinión, audio, fuera de horario).
4. **Despliegue**: publicación del flujo y entrega de accesos a la consola.

Lo que requiere trámite de Meta y puede tardar días: verificación del negocio para tener
plantillas propias y más de 2 números por WABA (techo de 20 comercios por WABA verificada).

---

## 7. La consola NovuChat (producto complementario que el sitio debe enlazar)

- **Qué es:** panel web multi-tenant donde cada comercio administra su asistente y donde
  NovuChat administra a sus clientes. React 19 + Vite + TypeScript sobre Firebase
  (Auth con custom claims, Firestore con reglas de aislamiento, Cloud Functions).
- **Perfiles:** dueño del negocio (admin), operador, personal de NovuChat
  (superadministrador, solo con Google + 2FA).
- **Pantallas:** Ingreso (pestañas "Soy un comercio" / "Soy de NovuChat"), Tablero,
  Negocios, Conversaciones, Configuración (varía por rubro), Funcionarios, Contactos,
  Cierres (antes "Uso"), Cuenta, Reclamos, Bitácora.
- **Ubicación en el disco:** `~/NovuChat/admin/`. Proyectos Firebase `novuchat-admin-dev`
  y `novuchat-admin-prod` (creados el 2026-08-29 bajo la cuenta del panel).
- **URL pública:** ⚠️ **pendiente de decisión**. Recomendación: `consola.novuchat.site`
  como dominio personalizado de Hosting del proyecto `novuchat-admin-prod` (ver
  `03-arquitectura-sitio.md` §7). Mientras no exista, el sitio enlaza a
  `https://novuchat-admin-prod.web.app` y **debe agregarse el dominio nuevo a `frame-src`
  y a los dominios autorizados de Auth**, o el inicio de sesión con Google fallará en
  silencio (`admin/SEGURIDAD.md` §5bis).
- **Diseño:** artefacto de Claude Design **"Panel NovuChat"** (versión 2026-09-02):
  tipografía **Archivo** (400/600/800) autoalojada, radios **0 px**, fondo `#f3f2f2`,
  texto `#201e1d`, **acento gris pizarra `#3d4753` en claro y verde menta `#35e2a0` en
  oscuro**, verde `#12c489` como segundo acento; tema oscuro por `[data-tema="oscuro"]`;
  botones de 44–48 px; pestañas de ingreso; 12 pantallas con estados. Tokens completos
  en `08-sistema-de-diseno.md`.

---

## 8. Identidad visual actual

- **Logo** (entregado el 2026-09-02, dos versiones: fondo transparente y fondo blanco):
  burbuja de conversación en **gris pizarra `#485460`** (aprox.) con anillo blanco interior
  y **tres puntos verde menta `#44FCAC`** (aprox., con leve resplandor); palabra
  "NovuChat" en gris pizarra, sans geométrica redondeada (parecida a Montserrat/Nunito
  bold).
- **Tensión resuelta (2026-09-02):** la consola ya adoptó los colores del logo: pizarra
  `#3d4753` como acento en tema claro y menta `#35e2a0` como acento en oscuro, con verde
  `#12c489` para estados positivos. El sitio hereda esos tokens sin renombrarlos
  (`08-sistema-de-diseno.md`). Pendiente en la consola: reemplazar el bloque `:root` de
  `admin/web/src/diseno.css` por el nuevo y corregir el voseo del prototipo.
- Se debe **evitar imitar a WhatsApp** (verde `#25D366`): cercano, no confundible. El
  menta `#35e2a0` cumple.

---

## 9. Datos de contacto y legales (para footer, contacto y JSON-LD)

| Dato | Valor | Fuente |
|---|---|---|
| Empresa | AAB1 — Javier Andres Alberdi Baptista, empresa unipersonal | AAB1-landing footer |
| NIT | 2441214012 | AAB1-landing footer |
| Sede | La Paz, Bolivia | idem |
| WhatsApp comercial | +591 72047339 | idem (⚠️ decidir si NovuChat usa un número propio) |
| Correo | ⚠️ definir (`hola@novuchat.site`, `ventas@novuchat.site`) — requiere configurar el correo del dominio | — |
| Dominio | novuchat.site | Andres |
| Repositorio | github.com/segurolotengopy/novuchat-site | Andres |
| Sitio hermano | www.aab1.website | Andres |

---

## 10. Vocabulario (usar exactamente estas palabras en el sitio)

| Decir | No decir |
|---|---|
| negocio, comercio | tenant |
| asistente virtual, asistente | bot, chatbot (salvo al contrastar con "chatbots tradicionales") |
| consola, panel del negocio | dashboard, admin |
| permiso | claim, rol técnico |
| conexión con WhatsApp | webhook, API |
| cita, pedido, cierre | booking, order, conversión |
| persona atendida, atención, interacción | usuario único, sesión |
| cobro de demostración (simulado) | pago de prueba (ambiguo) |
