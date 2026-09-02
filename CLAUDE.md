# novuchat.site — instrucciones de proyecto para Claude Code

Sitio web comercial de **NovuChat** (asistentes conversacionales de WhatsApp con IA para
PyMEs bolivianas). Proyecto Firebase **`novuchat-site`** (cuenta alberdi.andres,
propietario), dominio **novuchat.site**, repositorio público
`github.com/segurolotengopy/novuchat-site`. Empresa: AAB1 (www.aab1.website).

Proyecto de **Andres** (arquitectura, infraestructura, comercial) y **Silvana** (diseño
funcional, material comercial). Hito: demos comerciales el **9 y 10 de septiembre de
2026**.

## Lea primero

| Documento | Para qué |
|---|---|
| `docs/01-analisis-referencia-aab1-landing.md` | Qué se reutiliza y qué no del sitio de referencia (AAB1-landing) |
| `docs/02-contexto-negocio-y-producto.md` | Qué es NovuChat, verticales, planes, consola, identidad, vocabulario |
| `docs/03-arquitectura-sitio.md` | Stack (Astro + Preact + Firebase), mapa del sitio, estructura, Functions, CSP, dominios |
| `docs/04-seguridad-y-privacidad.md` | Prohibiciones, modelo de amenazas, política de privacidad y términos base |
| `docs/05-contenido-y-secciones.md` | Guion de contenido página por página, SEO, base de conocimiento del asistente |
| `docs/06-plan-de-implementacion.md` | Fases, decisiones pendientes y qué requiere a Andres |
| `docs/07-prompt-claude-design.md` | Prompt del diseño para Claude Design |
| `docs/09-prompt-claude-code.md` | Prompt de arranque y discrepancias del diseño de referencia con estas reglas |
| `docs/diseno/landing-design.html` | Diseño de referencia del sitio (artefacto de Claude Design exportado): estructura, textos, tokens; **no es código de producción** |
| `docs/08-sistema-de-diseno.md` | Tokens de la consola. **Superado en parte:** ver la nota de decisiones de abajo |
| `docs/csp.md` | Cada excepción de la CSP, qué habilita y qué se rompe si se quita |
| `docs/pendiente-alineacion-consola.md` | Diferencia visual entre sitio y consola, y cómo cerrarla |
| `ESTADO.md` | Dónde estamos, decisiones, hallazgos que costaron tiempo, próximos pasos |

La plataforma (flujos n8n y consola) vive en `~/NovuChat/`; su `CLAUDE.md`, `ESTADO.md`
y `admin/{DISENO,SEGURIDAD,LEEME}.md` son la referencia de producto y de seguridad. **No
modifique nada en `~/NovuChat/` desde este proyecto.**

## Idioma y estilo

Español latinoamericano (Bolivia), tuteo en el sitio, **sin voseo**. Con Andres:
respuestas técnicas rigurosas, explicando el *porqué*, interactivas en los puntos
críticos. Andres tiene 25 años de experiencia en arquitectura y gestión; experiencia media
programando. Ejecute todo lo que pueda por su cuenta, verifíquelo y entregue resultados;
señale con claridad **qué requiere su intervención** (consolas, claves, DNS, decisiones)
y no lo mezcle con pasos que Claude Code puede hacer.

## Decisiones que superan a los documentos (2026-09-02)

Los docs 01–09 se escribieron antes de estas decisiones de Andres. Donde haya
contradicción, **manda esta lista**.

| Tema | Decisión vigente | Qué documento queda desactualizado |
|---|---|---|
| **Región de nube** | **Todo en `us-east1`.** Firestore y Functions. Determina `connect-src` y la respuesta del FAQ sobre ubicación de datos | doc 06 (decía `southamerica-east1`) |
| **Sistema visual** | Tokens **del prototipo** (`docs/diseno/landing-design.html`, los dos últimos bloques): fondo crema `#f7f3ec`, acento `#2f3a44`, **radios 8/16/28 px y controles en píldora** | doc 08 (radios 0, fondo gris) |
| **Identidad** | **Ninguna referencia a AAB1** en el sitio ni en el RAG. NovuChat factura como comercio con NIT propio, en trámite | docs 02 §9, 04 §5, 05 §0 y §7 |
| **Analítica** | **GA4 + píxel de Meta**, ambos detrás de un banner de consentimiento y declarados en `/privacidad` | doc 06 D5 (decía «ninguna») |
| **Correo de leads** | **FormSubmit**, llamado **desde la Function `lead`**, nunca desde el navegador. Resend queda para después | doc 06 D4 |
| **Asistente** | **RAG estricto**: umbral **medido** en 0,64, y si no se alcanza no se llama al modelo | doc 03 §5.1 punto 4 |
| **Proveedor de IA** | **Vertex AI** con la cuenta de servicio, sin clave de API. La API de AI Studio usa créditos de prepago que se agotan aparte | doc 03 §2 |
| **Unidad comercial** | **«Conversaciones»** = todos los mensajes con un cliente en 24 h continuas. Definida en `/precios` y en `/terminos` | doc 02 §5 |
| **Planes** | Impulso 250 / Crecimiento 450 / Pro 850 Bs. Instalación 800 Bs (a medida desde 1.500). Excedente 50 Bs por 150 conversaciones | doc 02 §5 |
| **Generador** | **Astro 7**, no 5 | doc 03 §2 |

## Arquitectura (resumen)

```
Navegador ──► Firebase Hosting (Astro estático + CSP estricta)
                 ├── isla Asistente ──► Function `asistente` (App Check, límite de tasa, Gemini/Claude)
                 └── isla Formulario ──► Function `lead` (App Check, validación, Firestore, correo)
             Firestore: leads · conversacionesAsistente · limites  (reglas: todo denegado al cliente)
             Enlace "Ingresar" ──► consola NovuChat (proyecto novuchat-admin-prod, otro dominio)
```

## PROHIBICIONES DURAS

1. **Nunca** un secreto (API key, token, clave de servicio) en un archivo versionado. El
   repositorio es público. Solo `.env` (ignorado) y Secret Manager.
2. **Nunca** `innerHTML`, `dangerouslySetInnerHTML`, `set:html` con datos que no sean
   literales del repositorio, `eval` ni `new Function`. El CI lo verifica.
3. **Nunca** scripts, estilos, fuentes ni imágenes desde CDN o dominios externos. La CSP
   los bloquea sin avisar. Archivo se sirve desde `/fuentes/`.
4. **Nunca** una clave JSON de cuenta de servicio en GitHub ni en el disco. Despliegue
   por OIDC (Workload Identity Federation).
5. **Nunca** leer ni escribir Firestore desde el navegador. Todo pasa por Functions.
6. **Nunca** llamar al modelo de IA desde el cliente, ni sin App Check en la Function.
7. **Nunca** presentar el asistente del sitio como una persona: se llama "asistente
   virtual" y dice que es una IA si le preguntan.
8. **Nunca** publicar funcionalidades que la plataforma no tenga (fidelización, cobro
   real automático) sin rótulo "próximamente", ni cifras comerciales sin confirmar
   (marcadas ⚠️ en los docs) en producción: `pnpm verificar` falla si queda una marca
   `<!-- CONFIRMAR -->`.
9. **Nunca** datos de clientes reales: capturas y ejemplos usan "Salón Aurora",
   "Parrilla El Fogón" y teléfonos `5917000000x`.
10. **Nunca** desplegar con `--force`, ni `git add .` + push automático desde un script.
11. **Nunca** tocar el proyecto Firebase de la consola (`novuchat-admin-*`) ni el de los
    demos desde este repositorio.

## Reglas de diseño y contenido

- Identidad: los tokens **del prototipo**, en `src/estilos/tokens.css`: fondo crema
  `#f7f3ec`, acento pizarra `#2f3a44` en claro, menta `#35e2a0` en oscuro, verde
  `#12c489` como segundo acento; Archivo autoalojada; radios 8/16/28 px con los
  controles en píldora. El verde `#12c489` **nunca** como texto en tema claro
  (2,0:1): usar `--verde-texto`. Ningún color ni radio literal fuera de `tokens.css`.
- Cuidado con la especificidad al escribir CSS de navegación o de bandas: una regla
  como `.nav a` le gana a `.btn-cta` y deja el botón con el color equivocado. Use
  `:not(.btn)`. Ya pasó una vez y lo detectó `axe`.
- Vocabulario del doc 02 §10: "negocio", "asistente", "consola", "cita/pedido/cierre".
  Nunca "tenant", "bot", "dashboard", "API" en textos públicos.
- El QR de demostración lleva el rótulo "DEMOSTRACIÓN — este QR no cobra" en la imagen y
  en el pie; no se atenúa ni se esconde.
- Todo texto público vive en `src/contenido/` y `src/i18n/` (ES obligatorio, EN de las
  páginas principales), tipado para que falte ninguna clave.
- Tema claro/oscuro con `tema.ts` de la consola: preferencia del sistema por defecto,
  `[data-tema="oscuro"]` forzable; tokens duplicados solo bajo ese atributo.
- Enlace a la consola por `PUBLIC_URL_CONSOLA`, validado en build contra la lista blanca
  (`consola.novuchat.site`, `novuchat-admin-prod.web.app`).

## Flujo de trabajo

```bash
pnpm install
pnpm dev                 # Astro + islas (SIN cabeceras CSP: no sirve para probar la política)
pnpm emuladores          # Functions + Firestore (puertos 5241/8241; distintos de la consola)
pnpm pruebas             # unidad + reglas (emulador) + inyección de prompt
pnpm humo                # Playwright contra emuladores
pnpm build && pnpm csp   # sirve dist/ con las cabeceras REALES de firebase.json → 0 "Refused to"
pnpm verificar           # lint + typecheck + pruebas + prohibiciones + build + humo
pnpm listo               # compuerta de producción: falla si queda un dato sin confirmar
pnpm rag:indexar         # regenera el índice del asistente desde el contenido del sitio
pnpm rag:calibrar        # mide la recuperación y el umbral contra el índice real
```

- **Si cambia el contenido del sitio hay que reindexar** (`pnpm rag:indexar`) y
  volver a calibrar: el corpus del asistente se deriva de `src/contenido/`, y un
  índice viejo hace que el asistente cite precios que la página ya no muestra.

- `pnpm verificar` **no** bloquea por datos pendientes: para eso está `pnpm listo`,
  que lee `src/contenido/pendientes.ts` y falla si queda alguno. Así se puede
  trabajar con un dato en trámite sin romper el desarrollo, pero no se puede
  desplegar con él.

- Antes de dar algo por terminado: `pnpm verificar` en verde, `pnpm csp` sin violaciones,
  Lighthouse móvil ≥ 90, y probado en un celular real (o emulación) — reportar el
  resultado **real**.
- Pruebas de reglas: cada `assertFails` debe ejecutarse **con** un documento sembrado
  (un `permission-denied` sobre un documento inexistente pasa igual y no prueba nada;
  ver `~/NovuChat/admin/LEEME.md`).
- Al terminar una sesión, actualice `ESTADO.md` (crear en la primera sesión): dónde
  estamos, decisiones, hallazgos que costaron tiempo, próximos pasos. Nunca secretos.
- Estándar DevSecOps v2 del repositorio (`aplicar-estandar-devsecops`) y
  `pase-a-produccion` para cada release con etiqueta `vX.Y.Z`.

## Lo que requiere a Andres (no lo intente Claude Code)

Plan Blaze y presupuesto; Firestore y Functions habilitados; secretos en Secret Manager
(`GEMINI_API_KEY`, `RESEND_API_KEY`); registro de App Check (clave de sitio de reCAPTCHA
Enterprise); Workload Identity Federation y secretos de GitHub; dominios `novuchat.site`,
`www` y `consola.novuchat.site` con sus registros DNS; dominios autorizados de Auth en la
consola; decisiones D1–D8 del doc 06 §0; revisión de privacidad y términos; documento
comercial de Silvana. Claude Code prepara los comandos exactos y los deja listos.
