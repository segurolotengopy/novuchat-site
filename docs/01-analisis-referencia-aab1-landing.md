# 01 — Análisis del proyecto de referencia `AAB1-landing`

> Fuente analizada: `~/.gemini/antigravity/scratch/AAB1-landing/` (sitio publicado como
> www.aab1.website / aab1-landing.web.app). Fecha del análisis: 2026-09-02.
> Propósito: extraer lo que conviene **reutilizar**, lo que conviene **mejorar** y lo que
> **no debe repetirse** en `novuchat.site`.

---

## 1. Inventario del proyecto

| Área | Archivo(s) | Tamaño | Rol |
|---|---|---|---|
| Página principal | `index.html` | 46 KB | Una sola página con 6 secciones + footer + widget de chat |
| Política de privacidad | `privacidad.html` | 16 KB | Página independiente, bilingüe por `data-i18n` |
| Estilos | `styles.css` | 13 KB | Sistema de diseño propio (tokens CSS, tema claro/oscuro, glassmorphism) |
| Lógica de interfaz | `app.js` | 8,6 KB | i18n, tema, menú móvil, animaciones, formulario, chat |
| Agente IA (cliente) | `src/services/aiSupport.js` | 14 KB | Llamada a Cloud Function + RAG local de respaldo |
| Agente IA (servidor) | `functions/index.js` | 10 KB | Cloud Function `onCall` → Gemini, con App Check |
| Leads | `src/services/leadService.js` | 2,4 KB | Firestore + FormSubmit + copia en localStorage |
| Firebase | `src/config/firebase.js`, `firebase.json`, `.firebaserc` | — | App Check reCAPTCHA Enterprise, Hosting, rewrites |
| i18n | `src/i18n/translations.js` | 39 KB | Diccionarios ES/EN (≈ 200 claves) |
| Pruebas | `src/__tests__/aab1.test.js` | 3,2 KB | 8 pruebas Vitest sobre el RAG local, filtros e i18n |
| Build / despliegue | `vite.config.js`, `deploy.sh`, `package.json` | — | Vite 8 multi-página; script de despliegue con pruebas + Snyk + deploy + push |
| Utilitarios | `fill_html_es.js`, `replace_script.cjs` | — | Scripts de una sola vez para inyectar traducciones (no forman parte del sitio) |
| Activos | `assets/aab1-logo.png` (4,1 MB), `assets/aab1-animation.mp4` (2,4 MB) | 6,5 MB | Logo y video de héroe |

**Stack:** HTML estático + CSS + JavaScript ES Modules, empaquetado con **Vite 8**, sin
framework de UI. Backend serverless: **Firebase Hosting + Cloud Functions v2 (Node 20) +
Cloud Firestore + App Check**. Modelo de IA: **Gemini** (`gemini-2.0-flash` con respaldo
`gemini-1.5-flash-latest`) vía REST con clave en **Secret Manager**.

---

## 2. Funcionalidades

### 2.1 Estructura de la página principal

1. **Header fijo** con logo, selector de idioma ES/EN, selector de tema día/noche y menú
   hamburguesa en móvil.
2. **Héroe** con título en dos tonos (texto + `gradient-text`), descripción, dos CTA
   ("Iniciar Consultoría", "Ver Proyecto Estrella") y **video en bucle** dentro de una
   tarjeta de vidrio.
3. **Portafolio de servicios**: dos grillas de tarjetas (4 primarias + 4 complementarias),
   cada una con ícono Material, título y descripción.
4. **Proyecto estrella (ENCUENTRAME.BO)**: caso de éxito con desafío/solución, tarjetas de
   arquitectura, botones a artículo y video (el enlace de YouTube cambia con el idioma), y
   grilla de socios con LinkedIn.
5. **Alianzas**: tres tarjetas-enlace a organizaciones aliadas.
6. **Sobre el fundador**: trayectoria + insignias de certificaciones + grilla de enlaces
   oficiales.
7. **Contacto**: columna de datos (correo, WhatsApp `wa.me`, sede) + formulario (nombre,
   correo, teléfono con selector de código de país, empresa, servicio, mensaje) con estado
   de éxito y botón "enviar otro".
8. **Footer** con datos legales (NIT, tipo de empresa, actividad, dirección) y enlace a
   la Política de Privacidad.
9. **Widget flotante de asistente IA** (botón redondo con insignia "IA" + ventana de chat).

### 2.2 Internacionalización

- Diccionarios `translations.es` / `translations.en` con claves planas.
- Atributos `data-i18n` (innerHTML) y `data-i18n-ph` (placeholder). Persistencia en
  `localStorage('aab1_lang')`. Cambia también `<html lang>`.
- **Observación:** `el.innerHTML = dict[key]` permite HTML dentro de traducciones; es
  aceptable porque el diccionario es estático, pero no debe usarse con texto de usuario.

### 2.3 Tema claro / oscuro

- Tokens CSS en `:root` (oscuro por defecto) y `[data-theme="light"]`. Persistencia en
  `localStorage('aab1_theme')`. Ícono del botón cambia (`light_mode` / `dark_mode`).
- **Observación:** no respeta `prefers-color-scheme`; el oscuro es siempre el inicial.

### 2.4 Captura de leads (`leadService.js`)

Estrategia de **triple redundancia**, en este orden:

1. Copia inmediata en `localStorage('aab1_leads_local')` (nunca se pierde en el navegador).
2. Correo por **FormSubmit** (`https://formsubmit.co/ajax/<correo>`), sin credencial, con
   plantilla de tabla y `_captcha: false`.
3. Escritura en Firestore `leads/` con **timeout de 3,5 s** (`Promise.race`); si falla,
   devuelve éxito con `isFallback: true`.

La interfaz **siempre muestra éxito** (incluso en `catch`), priorizando la experiencia del
prospecto sobre la fidelidad del estado. El correo destino está fijado en código
(`TARGET_LEAD_EMAIL`) y cubierto por una prueba.

### 2.5 SEO y datos estructurados

- `<title>`, `description`, `keywords`, `author`, `robots`, `canonical`, Open Graph,
  Twitter Cards, verificación de dominio de Facebook, Google Analytics 4 (`gtag`).
- **JSON-LD** con `@graph`: `ProfessionalService` (con `founder`, `address`,
  `contactPoint`, `knowsAbout`), `Person` (con `sameAs` y `hasCredential`) y
  `SoftwareApplication` (con `award`).
- Es el punto más maduro del sitio y **debe replicarse** en novuchat.site con los tipos
  `Organization`/`SoftwareApplication`/`Offer`/`FAQPage`.

---

## 3. El agente conversacional (la parte más interesante)

### 3.1 Arquitectura de dos niveles

```
Navegador                                Firebase
┌─────────────────────────┐              ┌──────────────────────────────┐
│ askAAB1Assistant()      │  onCall +    │ Cloud Function `asistente`   │
│  1. filtro local de     │  App Check   │  1. exige request.app        │
│     términos prohibidos ├─────────────►│  2. tamaño ≤ 8 KB            │
│  2. httpsCallable       │              │  3. history ≤ 20 turnos      │
│  3. si falla → RAG local│◄─────────────┤  4. mismo filtro de términos │
│     (sin red, sin BD)   │   respuesta  │  5. Gemini 2.0 → 1.5 (fallback)│
└─────────────────────────┘              │     temp 0,15 · 450 tokens   │
                                         └──────────────────────────────┘
```

**Base de conocimiento (RAG "cero base de datos"):** un bloque de texto
(`AAB1_KNOWLEDGE_BASE`) con identidad, servicios, proyecto estrella, alianzas y contactos,
inyectado como `system_instruction`. Está **duplicado** en cliente y servidor (deuda:
dos copias que se desincronizan).

**Respaldo local (`queryLocalAAB1RAG`):** motor de coincidencia de palabras clave con
respuestas fijas por tema (equipo, alianzas, fundador, proyecto, contacto) y respuesta
genérica. Garantiza que el widget **nunca queda mudo** aunque App Check rechace, la
Function falle o no haya red.

**Detección de idioma:** heurística por lista de palabras inglesas (≥ 1 coincidencia ⇒
`en`). Funciona para ES/EN; se rompe con texto mixto ("hello, ¿qué servicios tienen?").
En el servidor el modelo recibe la instrucción de responder en el idioma del usuario, que
es lo que realmente resuelve el caso general.

### 3.2 Medidas de seguridad del agente

| Control | Dónde | Comentario |
|---|---|---|
| Lista de términos restringidos (`superadmin`, `password`, `token`, `firestore`, `prompt injection`, `bypass`…) | cliente **y** servidor | Defensa en profundidad correcta: el cliente es solo cortesía; el servidor es el control real |
| `enforceAppCheck: true` + `if (!request.app)` | servidor | Bloquea llamadas desde fuera del sitio (curl, scripts) |
| Límite de tamaño 8 KB y de historial 20 | servidor | Acota costo y evita relleno de contexto |
| `temperature: 0.15`, `maxOutputTokens: 450` | servidor | Respuestas deterministas y cortas |
| Prompt de sistema con reglas: no revelar configuración, derivar cotizaciones al formulario, no inventar | servidor | Correcto pero **no verificable**: no hay pruebas contra el modelo |
| Clave de Gemini en `defineSecret` | servidor | Correcto: nunca en el cliente ni en el repositorio |

**Debilidades a corregir en NovuChat:**

- El filtro por subcadena bloquea consultas legítimas (`"administración"` contiene `admin`;
  `"tokens de WhatsApp"` contiene `token`). Conviene usar coincidencia por palabra completa
  y una respuesta que no suene a bloqueo.
- El historial lo manda el cliente sin firmar: un atacante con App Check válido puede
  fabricar turnos "del modelo" para dirigir la respuesta. Mitigación barata: reinyectar
  el prompt de sistema al final o limitar el historial a 6 turnos.
- No hay **límite de tasa** por origen ni por sesión (solo lo que App Check impone). Un
  bucle de 1 000 llamadas cuesta dinero real. NovuChat debe añadir contador por IP/token
  en Firestore o `express-rate-limit` equivalente.
- No hay registro de conversaciones ni métricas de uso del asistente (se pierde el
  material de ventas más valioso: qué preguntan los prospectos).

---

## 4. Seguridad de la plataforma

### 4.1 Lo que está bien

- **App Check con reCAPTCHA Enterprise** inicializado en el cliente y **exigido** en la
  Function. Es la medida más importante del proyecto.
- Secretos en Secret Manager; `.gitignore` excluye `.env*`, `*.pem`, `*.key`, `.firebase`.
- `deploy.sh` ejecuta **pruebas unitarias y Snyk** antes de publicar.
- Todos los enlaces externos llevan `rel="noopener noreferrer"`.

### 4.2 Lo que falta (y que novuchat.site debe cubrir desde el día uno)

| Hallazgo | Riesgo | Corrección en NovuChat |
|---|---|---|
| **No hay `firestore.rules` en el repositorio** y el cliente escribe directo en `leads/` | Cualquiera con la configuración pública de Firebase puede insertar documentos arbitrarios (spam, relleno de cuota) o, si las reglas son laxas, leer los leads de otros | Reglas explícitas: `allow create` solo con esquema validado y tamaño acotado; **nunca** `read` desde el cliente; o mejor, mover la creación a una Function con App Check |
| **Sin cabeceras de seguridad en `firebase.json`** (no hay CSP, HSTS, X-Frame-Options…) | Clickjacking, inyección de scripts de terceros, degradación a HTTP | Copiar la política de la consola NovuChat (`admin/firebase.json`) y adaptarla al sitio público |
| Recursos externos: Google Fonts (íconos), `googletagmanager.com`, `formsubmit.co` | Cada dominio externo es una excepción de CSP y un tercero con acceso a datos | Íconos SVG en línea; fuentes autoalojadas en `/fuentes/`; analítica solo si se acepta la excepción |
| **FormSubmit** recibe nombre, correo, teléfono y mensaje del prospecto **sin contrato de tratamiento** | Datos personales en un tercero gratuito, y `_captcha: false` deja el canal abierto a spam | Enviar el correo desde una Cloud Function (Resend/SendGrid con clave en Secret Manager, o Gmail API) y, si se mantiene FormSubmit, **declararlo en la política de privacidad** |
| Copia de leads en `localStorage` del navegador del prospecto | Datos de un formulario persistidos en el dispositivo de quien lo llenó (no es grave, pero es innecesario) | Eliminar; usar solo memoria de sesión |
| `deploy.sh` usa `--force` y hace `git add .` + push automático | Puede versionar archivos no deseados; el `--force` salta confirmaciones | Pipeline en GitHub Actions con OIDC (estándar DevSecOps ya aplicado en `~/NovuChat`) |
| Logo PNG de **4,1 MB** cargado 7 veces por página (header, badges, footer, favicon) | Rendimiento y LCP pobres | Logo SVG (< 10 KB) + WebP/AVIF para fotos; `loading="lazy"` |
| `alert()` para validación de correo | Bloquea el hilo; mal en móvil | Mensaje en línea accesible (`aria-live`) |
| Detección de idioma por lista de palabras | Falsos positivos | Usar `navigator.language` + selector manual; que el modelo decida el idioma de respuesta |

---

## 5. Declaración de privacidad (`privacidad.html`)

Es un documento **bien construido** y adaptado a la realidad del negocio (WhatsApp Business
Cloud API, encargado vs. responsable, OTP). Estructura:

1. Quiénes somos (responsable de datos identificado).
2. **Mensajería por WhatsApp** (sección destacada): datos tratados (número, contenido,
   estados de entrega, OTP), finalidad, protección de los códigos (SHA-256 con sal,
   vencimiento 5 min, 3 intentos, enmascarado en logs), **papel de Meta** (verificación
   HMAC SHA-256 de webhooks), **actuación por cuenta de empresas clientes** (AAB1 como
   encargado del tratamiento), baja con la palabra **BAJA**, plazos de conservación.
3. Información recopilada en el resto de servicios.
4. Uso de la información.
5. **Medidas de seguridad "declaradas porque están implementadas"**: TLS + HSTS, cifrado en
   reposo, autenticación obligatoria en API, verificación de origen, límites de tasa,
   mínimo privilegio, análisis de vulnerabilidades, registros sin datos sensibles.
6. Con quién se comparte (infraestructura, empresas clientes, requerimiento legal).
7. Derechos (acceso, rectificación, eliminación, retiro de consentimiento, oposición).
8. Contacto del responsable.
9. Ley aplicable (Bolivia) y cambios.

**Para NovuChat** esta política es la base ideal, con tres ajustes obligatorios:

- Cambiar el rol: **NovuChat es el encargado del tratamiento** de los datos de los clientes
  finales de cada PyME; **la PyME es la responsable**. Debe existir además un anexo o
  contrato de encargo con cada comercio.
- Declarar el **uso de modelos de IA de terceros** (Google Gemini / Anthropic Claude) para
  generar respuestas, qué se les envía y que no se usan para entrenar (según los términos
  de cada proveedor), y que **el asistente siempre se identifica como IA** (prohibición 4
  de `~/NovuChat/CLAUDE.md`).
- Incluir el **cobro simulado** en demos y el tratamiento de comprobantes de pago
  (imágenes) cuando exista cobro real.
- Declarar los terceros del sitio web: Firebase/Google Cloud, proveedor de correo de leads,
  analítica (si se usa) y reCAPTCHA Enterprise (que fija cookies y envía señales a Google).

**Cumplimiento de Meta:** la política de privacidad pública con URL estable es requisito
de la **Business Verification** y de la revisión de la app de WhatsApp. `novuchat.site/privacidad`
debe existir **antes** de pedir la verificación con el dominio nuevo.

---

## 6. Diseño visual (referencia, no para copiar)

- Paleta AAB1: azules corporativos (`#003865`, `#185F96`, `#2A78B0`) sobre fondo noche
  `#071526`; texto pizarra `#E0E6ED`. Tipografía Inter (no cargada: cae al sistema).
- Recursos: tarjetas de vidrio (`backdrop-filter`), "puntos de luz" radiales, gradiente en
  palabras clave del título, animación de revelado por `IntersectionObserver`, botón
  flotante con `scale(1.08)` al pasar.
- Bordes redondeados 10–20 px; sombras suaves; `max-width: 1200px`.

NovuChat **no debe heredar esta estética**: su identidad sale del logo (gris pizarra +
verde menta) y del sistema de diseño "Modernist" de la consola. Ver `07-prompt-claude-design.md`.

---

## 7. Pruebas y calidad

- 8 pruebas Vitest: correo de leads, claves i18n, detección de idioma, filtro de
  seguridad, respuestas del RAG local por tema.
- **Nada prueba la Cloud Function**, ni el formulario, ni la accesibilidad, ni el
  rendimiento. Para NovuChat: pruebas de la Function con `firebase-functions-test`,
  pruebas de reglas de Firestore con el emulador (el patrón ya existe en
  `~/NovuChat/admin/pruebas/`), Lighthouse CI con umbrales (≥ 90 en rendimiento,
  accesibilidad y SEO) y `axe` en CI.

---

## 8. Resumen: qué se lleva NovuChat de AAB1-landing

**Reutilizar (adaptado):** estructura de secciones comerciales; patrón i18n por
`data-i18n` (o mejor, un diccionario tipado); agente de dos niveles (Function + respaldo
local) con App Check; JSON-LD completo; política de privacidad como plantilla; pipeline
de pruebas antes de publicar; formulario con selector de país y estado de éxito.

**Mejorar:** reglas de Firestore, cabeceras de seguridad, límite de tasa del asistente,
envío de correo desde el servidor, activos livianos, accesibilidad, respeto a
`prefers-color-scheme`, filtro de términos por palabra completa, registro de
conversaciones del asistente como fuente de inteligencia comercial.

**No repetir:** dependencias externas innecesarias (íconos remotos, FormSubmit sin
declarar), base de conocimiento duplicada en dos archivos, `alert()`, PNG de 4 MB,
despliegue con `--force` y push automático, `localStorage` con datos de terceros.
