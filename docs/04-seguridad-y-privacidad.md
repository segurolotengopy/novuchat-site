# 04 — Seguridad y privacidad del sitio

> Reglas que Claude Code debe respetar al construir `novuchat.site`, el modelo de
> amenazas del sitio público y la política de privacidad base. Hereda el estilo de
> `~/NovuChat/admin/SEGURIDAD.md`: cada control se mapea a un riesgo concreto.

---

## 1. Prohibiciones duras (heredadas y propias)

1. **Nunca** un token, App Secret, clave de API o clave de servicio en un archivo del
   repositorio (es público). Solo `.env` ignorado y Secret Manager. `.env.example` con
   valores vacíos.
2. **Nunca** `innerHTML`, `dangerouslySetInnerHTML`, `set:html` de Astro con datos que no
   sean literales del repositorio, `eval` ni `new Function`. El CI rompe la compilación si
   aparecen fuera de la lista blanca (`set:html` solo para JSON-LD generado en build).
3. **Nunca** scripts, estilos, fuentes ni imágenes desde CDN. La CSP lo bloquea y el
   fallo es silencioso.
4. **Nunca** una clave JSON de cuenta de servicio en GitHub. Despliegue por OIDC (WIF).
5. **Nunca** lectura de Firestore desde el navegador. `firestore.rules` niega todo.
6. **Nunca** una llamada al modelo de IA desde el cliente. Solo desde la Function con
   App Check.
7. **Nunca** presentar el asistente del sitio como una persona. Se llama "asistente
   virtual" y, si le preguntan, dice que es una IA.
8. **Nunca** prometer en el sitio algo que la plataforma no hace todavía (fidelización,
   cobro real automático, integraciones no construidas). Se rotula "próximamente" o no
   se publica.
9. **Nunca** publicar datos de clientes reales (nombres de comercios, teléfonos,
   capturas con conversaciones) sin consentimiento escrito. Las capturas usan los datos
   sembrados ficticios ("Salón Aurora", "Parrilla El Fogón", teléfonos `5917000000x`).

---

## 2. Modelo de amenazas del sitio público

| ID | Amenaza | Control | Verificación |
|---|---|---|---|
| S-1 | **Abuso del asistente** (bucle de mensajes que consume presupuesto de IA) | App Check exigido; límite de tasa por token/IP en Firestore (20/10 min, 100/día); `maxOutputTokens` 400; timeout 12 s; alerta de presupuesto | Prueba unitaria del limitador; prueba de humo con 25 llamadas seguidas → la 21 devuelve `resource-exhausted` |
| S-2 | **Inyección de prompt** vía mensaje o historial fabricado | Filtro por palabra completa; historial ≤ 8 turnos validado; prompt de sistema reinyectado al final; el modelo no tiene herramientas ni acceso a datos | Casos de prueba con 10 frases de inyección conocidas; la respuesta no revela el prompt ni cambia de rol |
| S-3 | **Exfiltración de información interna** por el asistente | La base de conocimiento solo contiene lo publicable; nada de infraestructura, cuentas ni números internos | Revisión del archivo `conocimiento.ts` en cada PR (checklist) |
| S-4 | **Spam / relleno de leads** | App Check; honeypot; validación de esquema; deduplicación 10 min; límite 5 leads/hora por token | Prueba unitaria de validación y deduplicación |
| S-5 | **Lectura de leads por terceros** | `firestore.rules` niega todo al cliente; Functions con Admin SDK; leads visibles solo en consola de Firebase / consola NovuChat (superadmin) | Prueba de reglas con el emulador: `assertFails` en `get`/`list`/`create` de `leads` **con** un documento sembrado (evitar el "verde en vacío" documentado en `admin/LEEME.md`) |
| S-6 | **XSS** desde respuestas del asistente o del formulario | Astro/Preact escapan por defecto; el texto del asistente se renderiza como texto (negritas por componente, no por HTML); prohibición 2 en CI | Caso de prueba: respuesta con `<img onerror>` se ve como texto |
| S-7 | **Clickjacking / incrustación** | `frame-ancestors 'none'`, `X-Frame-Options: DENY` | `pnpm csp` + intento de `<iframe>` desde otra página |
| S-8 | **Degradación a HTTP** | HSTS con preload; `upgrade-insecure-requests` | Cabeceras en producción |
| S-9 | **Cadena de suministro** (dependencia comprometida) | `pnpm audit` y Snyk/Dependabot en CI; `lockfile` versionado; sin `postinstall` de terceros | CI |
| S-10 | **Despliegue desde un fork** | WIF con condición de atributos atada a `repository` y `ref` (ver `admin/SEGURIDAD.md` §4) | Revisar la condición al crear el proveedor OIDC |
| S-11 | **Fuga de datos personales en logs** | Correos y teléfonos enmascarados en logs; IP hasheada con sal en `conversacionesAsistente` | Prueba de `saneo.ts` |
| S-12 | **Secretos en el historial de git** | Pre-commit con verificador de saneo (copiar `scripts/verificar-saneo.sh` y `.pre-commit-config.yaml` de `~/NovuChat`) | `pre-commit install` en cada clon |
| S-13 | **Enlace a la consola apuntando a un dominio equivocado** (phishing por error de configuración) | `PUBLIC_URL_CONSOLA` validada en build contra una lista blanca (`consola.novuchat.site`, `novuchat-admin-prod.web.app`) | Prueba de build |
| S-14 | **Tercero de correo con datos de prospectos** | Resend con clave en Secret Manager; o FormSubmit **declarado en privacidad**; nunca `spread` de campos del formulario al cuerpo de la petición (`_cc`, `_replyto` son instrucciones de FormSubmit) | Revisión de `lead.ts` |
| S-15 | **reCAPTCHA Enterprise bloqueando usuarios legítimos** | App Check en modo monitoreo la primera semana; token de debug documentado para desarrollo | Métricas de App Check en la consola de Firebase |

---

## 3. Cabeceras y CSP

La política completa está en `03-arquitectura-sitio.md` §6. Reglas de mantenimiento:

- Cada excepción de la CSP lleva un comentario en `docs/csp.md` con **qué habilita y qué
  se rompe si se quita** (formato de `admin/SEGURIDAD.md` §5bis).
- Cualquier dominio nuevo (analítica, video externo, mapa) es una decisión explícita, no
  un ajuste de conveniencia. Preferir alternativas autoalojadas.
- Probar con `pnpm csp` (sirve `dist/` con las cabeceras reales de `firebase.json`) antes
  de cada despliegue. Cualquier "Refused to…" en la consola del navegador es un defecto.

---

## 4. App Check

- Registrar la app web en App Check con **reCAPTCHA Enterprise** (la misma clave de sitio
  puede usarse en varios dominios: `novuchat.site`, `www`, `localhost` para desarrollo).
- Fase 1: modo **monitoreo** (las Functions con `enforceAppCheck: false` pero registrando
  `request.app`); Fase 2 (tras 7 días sin falsos positivos): `enforceAppCheck: true`.
- Desarrollo: `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true` y registrar el token en la
  consola (como documenta `AAB1-landing/README.md`).

---

## 5. Política de privacidad (contenido base para `/privacidad`)

Adaptación de `AAB1-landing/privacidad.html` al producto. Última actualización: fecha del
despliegue. Secciones:

1. **Quiénes somos.** NovuChat es un servicio de AAB1 (Javier Andres Alberdi Baptista,
   empresa unipersonal, NIT 2441214012, La Paz, Bolivia). Responsable de datos y contacto.
2. **Datos que tratamos en este sitio.** (a) Formulario de contacto/demo: nombre, correo,
   teléfono, empresa, rubro, mensaje. (b) Asistente virtual del sitio: el texto de la
   conversación, el idioma, la página desde la que se escribió y un identificador técnico
   no reversible. (c) Datos técnicos: los que Firebase Hosting y reCAPTCHA Enterprise
   registran para seguridad. **No usamos cookies de publicidad ni analítica de terceros**
   (o declarar GA4 si se decide usarlo).
3. **El asistente virtual es una inteligencia artificial.** Sus respuestas se generan con
   modelos de terceros (Google Gemini; Anthropic Claude en producción). El mensaje se envía
   al proveedor solo para generar la respuesta; según los términos de esos proveedores
   para API, no se usa para entrenar sus modelos. No escriba en el chat datos sensibles ni
   contraseñas.
4. **Para qué usamos los datos.** Responder consultas, coordinar demostraciones y
   propuestas, mejorar el asistente. No vendemos ni cedemos los datos con fines
   comerciales.
5. **El servicio NovuChat para comercios (cuando usted es cliente final de un negocio).**
   Sección espejo de la 2 de AAB1: el negocio que le escribe por WhatsApp es el
   **responsable** de sus datos; NovuChat actúa como **encargado** siguiendo sus
   instrucciones; datos tratados (número, contenido, estados de entrega, datos de la cita
   o del pedido, comprobantes de pago si los envía); papel de Meta (WhatsApp Business
   Cloud API; verificación criptográfica de origen); el asistente se identifica como IA y
   puede derivar a una persona; cómo dejar de recibir mensajes (**BAJA** o bloquear el
   número); plazos de conservación; cobros de demostración rotulados como simulados.
6. **Medidas de seguridad, declaradas porque están implementadas.** TLS + HSTS; cifrado
   en reposo en Google Cloud; verificación de origen de las peticiones (App Check);
   límites de tasa; negación de acceso directo a la base de datos; mínimo privilegio;
   análisis automático de dependencias; registros sin datos sensibles; aislamiento por
   negocio en la consola (reglas probadas). Mantener esta lista **sincronizada** con lo
   que realmente está desplegado.
7. **Con quién compartimos.** Google Cloud / Firebase (hospedaje, base de datos,
   verificación); proveedor de correo transaccional; proveedor del modelo de IA; Meta
   Platforms (canal de WhatsApp); autoridad competente por requerimiento legal.
8. **Sus derechos.** Acceso, rectificación, eliminación, retiro del consentimiento,
   oposición. Plazo de respuesta y verificación de identidad.
9. **Contacto** del responsable.
10. **Ley aplicable** (Estado Plurinacional de Bolivia) y cambios.

**Requisito de Meta:** esta URL debe ser pública, estable y estar enlazada desde el
footer de todas las páginas; se declara en la configuración de la app de Meta y en la
Business Verification.

---

## 6. Términos del servicio (contenido base para `/terminos`)

Objeto del servicio; planes, límites (cierres/atenciones/interacciones), excedentes,
facturación mensual en bolivianos; instalación y plazo de 48 h (qué necesita del
cliente); obligaciones del cliente (uso conforme a las políticas de WhatsApp Business,
no spam, veracidad de la configuración); suspensión por falta de pago (el comercio
conserva la vista de sus datos; el mensaje al cliente final es neutro); baja y
exportación de datos; disponibilidad y soporte (horario, canal); propiedad intelectual
(configuración del cliente es del cliente; la plataforma es de NovuChat); limitación de
responsabilidad (dependencia de Meta y proveedores de IA); ley y jurisdicción.

---

## 7. Checklist de seguridad antes del primer despliegue

- [ ] `firestore.rules` niega todo y la prueba con documento sembrado está en verde.
- [ ] `pnpm csp` sin ningún "Refused to".
- [ ] Ningún dominio externo fuera de la lista: `google.com`, `gstatic.com`,
      `*.googleapis.com` (App Check), `*.cloudfunctions.net` (o rewrite).
- [ ] Secretos creados en Secret Manager: `GEMINI_API_KEY`, `RESEND_API_KEY`
      (requiere a Andres).
- [ ] App Check registrado (requiere a Andres); modo monitoreo activo.
- [ ] Presupuesto con alerta en `novuchat-site` (requiere a Andres).
- [ ] WIF configurado con condición estricta (requiere a Andres); ninguna clave JSON.
- [ ] Verificador de saneo instalado (`pre-commit install`) y en CI.
- [ ] `/privacidad` y `/terminos` publicados y enlazados en el footer.
- [ ] Prueba de inyección de prompt (10 casos) en verde.
- [ ] Lighthouse móvil ≥ 90 en rendimiento, accesibilidad, buenas prácticas y SEO.
