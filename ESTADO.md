# ESTADO — novuchat.site

> Bitácora viva del proyecto. Se actualiza al cerrar cada sesión de trabajo.
> **Nunca** contiene secretos: claves, tokens ni valores de `.env`.

Última actualización: **2026-09-02**

---

## 1. Dónde estamos

**Fases 0, 1 y 2 construidas.** El sitio tiene sus dieciocho rutas y su sistema
de diseño; el backend tiene las dos Functions, el RAG estricto y las islas que
encienden el formulario y el asistente. Falta **generar el índice del RAG** (la
única pieza que necesita la clave de Gemini), crear los secretos y desplegar.

| Pieza | Estado |
|---|---|
| Repositorio `github.com/segurolotengopy/novuchat-site` | público, rama `main`, remoto por SSH con la clave `id_ed25519_segurolotengo` |
| Estándar DevSecOps v2 | aplicado (stack `node-firebase`, modo A); pre-commit instalado |
| Astro 7 + Preact + sitemap | instalado; `pnpm verificar` en verde |
| Proyecto Firebase `novuchat-site` (nº 50331646927) | plan Blaze, presupuesto de 10 USD con alertas al 50/90/100 % |
| Firestore | `(default)` en **us-east1**, modo nativo, protección de borrado activa |
| App web | `NovuChat sitio` — `1:50331646927:web:54f472bf096c63a0caf0ba` |
| App Check | reCAPTCHA Enterprise registrado, TTL 3600 s, `minValidScore 0.5`, **exigido** en ambas Functions desde `v0.2.6`; `pnpm prohibiciones` impide volver a `false` en silencio |
| Dominios | `novuchat.site` y `www` → `OWNERSHIP_ACTIVE` + `HOST_ACTIVE`; certificado en emisión |
| Píxel de Meta | `1058454173766291`, dominio verificado |
| GA4 | `G-BDYVHDEH9R`, detrás del banner de consentimiento |
| Search Console | verificado por TXT |
| Contenido y páginas | **18 rutas** (13 en español, 5 en inglés) + 404 |
| Sistema de diseño | `tokens.css`, `base.css`, `componentes.css` con los tokens del prototipo |
| Logotipo | `isotipo.svg`, `isotipo-claro.svg`, `favicon.svg`, `favicon.ico`, `og.png` |
| Formularios de demo y contacto | isla Preact `FormularioLead`, conectada a la Function |
| Asistente del sitio | isla Preact `Asistente`, con RAG estricto en el servidor |
| Function `lead` | validación, trampa de robots, límite de tasa, deduplicación, Firestore y aviso por FormSubmit **desde el servidor** |
| Function `asistente` | límite de tasa, filtro de términos, recuperación con umbral, verificación de la respuesta |
| Índice del RAG | ✔ generado: 34 fragmentos, 563 KB, con Vertex AI |
| Umbral del RAG | ✔ **medido** en 0,64 (`pnpm rag:calibrar`), no elegido a ojo |
| Proveedor de IA | **Vertex AI** con la cuenta de servicio: sin clave de API |
| Identidad federada (WIF) | ✔ pool, proveedor y binding acotados al repositorio; `probar-identidad` en verde |
| Identidades de despliegue | `deploy-previa` (solo Hosting, secreto del repositorio) y `deploy-production` (despliegue completo, **secreto del Environment**) |
| Identidad legal | **provisional**: AAB1 / NIT 2441214012, solo en `/privacidad` y `/terminos` |
| Secretos en Secret Manager | `SAL_HASH` ✔ · `FORMSUBMIT_ALIAS` con el marcador `sin-configurar`, que **falla el patrón a propósito** para que no se envíe nada hasta tener el alias real: el aviso por correo es opcional y el lead se guarda igual · `GEMINI_API_KEY` ya no se usa |
| Índice compuesto de Firestore | ✔ declarado en `firestore.indexes.json` (la deduplicación lo exige en producción) |
| Políticas TTL de Firestore | ✔ activas sobre `expira` en `turnos` y `limites`: se borran solos a los 90 días |
| Rol de Vertex para las Functions | ✔ `roles/aiplatform.user` sobre la cuenta de servicio por defecto |
| Canal de vista previa | ✔ desplegado y verificado, expira el 2026-09-09 |

---

## 2. Decisiones tomadas

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-09-02 | **Todo recurso de nube en `us-east1`** | Instrucción de Andres. Reemplaza a `southamerica-east1` del doc 06. Afecta la CSP (`connect-src`) y la respuesta del FAQ sobre ubicación de datos |
| 2026-09-02 | **Astro 7**, no Astro 5 | El doc 03 fue escrito cuando 5 era la versión vigente; se usa la estable actual |
| 2026-09-02 | Tokens visuales **del prototipo**, no los del doc 08 | Decisión de Andres. El sitio queda más cálido y redondeado que la consola; la consola debería alinearse después |
| 2026-09-02 | **Sin ninguna referencia a AAB1** en el sitio ni en el RAG | Régimen tributario: NovuChat factura como comercio, AAB1 es desarrollador. Se abrirá un NIT propio de NovuChat |
| 2026-09-02 | **GA4 + píxel de Meta**, con banner de consentimiento | Habrá pauta publicitaria. Reabre la decisión D5 (que era "sin analítica") |
| 2026-09-02 | **FormSubmit** en fase 1, no Resend | El correo del dominio todavía no existe. La Function `lead` lo llama desde el servidor: no se abre `formsubmit.co` en la CSP y se conserva App Check |
| 2026-09-02 | **RAG estricto** para el asistente | Reemplaza la inyección completa de la base de conocimiento del doc 03 §5.1 |
| 2026-09-02 | Unidad comercial: **"conversaciones"** (todos los mensajes con un cliente en 24 h) | Unifica el vocabulario del diseño ("chats"), la presentación ("conversaciones") y la consola ("cierres/atenciones/interacciones") |
| 2026-09-02 | Planes 250 / 450 / 850 Bs, setup 800 Bs, a medida desde 1.500 Bs, excedentes 50 Bs × 150 | Confirmados contra el diseño y `Presentación NovuChat2.html` |
| 2026-09-03 | **Un solo ambiente**: se retira `staging` del pipeline | Apuntaba al mismo proyecto y al mismo sitio en vivo que producción: no aislaba nada y hacía creer que sí. Su papel lo cumple el canal de vista previa del PR |
| 2026-09-03 | Dos identidades de despliegue con permisos distintos | Que un PR pueda impersonar la cuenta que despliega Functions y secretos anula la separación de producción. `deploy-previa` solo alcanza Hosting |
| 2026-09-03 | Identidad legal **provisional** AAB1 / NIT 2441214012 | Solo en las páginas legales, que la exigen. El material comercial y el RAG siguen sin mencionar a AAB1: el motivo tributario no cambia porque el dato sea provisional |
| 2026-09-02 | Ninguna dependencia ejecuta scripts de instalación (`allowBuilds: false`) | Riesgo S-9: los `postinstall` de terceros son superficie de cadena de suministro |
| 2026-09-11 | **Presentación 8**: fin de la instalación bonificada; instalación = pago único **por adelantado al inicio del servicio**, llave en mano; planes **prepago mensual**. Se quita la barra de la Rueda de Negocios | Cambio de Silvana. La barra con `hasta` se evalúa al compilar: seguía en el sitio publicado después de la feria |
| 2026-09-11 | `pnpm rag:calibrar` sobre 39 fragmentos: los grupos se solapan (peor del corpus 0,657 < mejor ajena 0,689) y sugiere **0,70**; el umbral sigue en 0,64 | **Pendiente de decisión**: subirlo da más «no lo sé» y menos invención. No se cambió junto con el contenido |
| 2026-09-02 | **Vertex AI en vez de la API de AI Studio** | La API de AI Studio se paga con créditos de prepago que se agotan aparte; Vertex cobra a la cuenta de facturación del proyecto, que ya tiene presupuesto y alertas. Y no necesita clave: se autentica con la cuenta de servicio. Un secreto que no existe no se filtra |

---

## 2bis. Evidencia de verificación (2026-09-02)

| Control | Resultado |
|---|---|
| `pnpm verificar` | verde: lint, typecheck, pruebas, prohibiciones, build y humo |
| `pnpm humo` | **66 pruebas en verde** (móvil y escritorio) |
| `pnpm rag:calibrar` | recuperación **100 %** entre los cuatro primeros (28 preguntas); las preguntas ajenas al negocio quedan por debajo del umbral con 0,017 de margen |
| `pnpm pruebas` | **61 pruebas de unidad**: saneo, verificación del RAG, corpus, inyección de prompt y aviso de leads |
| `pnpm test:rules` | **28 pruebas de reglas** contra el emulador, cada una con documento sembrado |
| `pnpm test:backend` | **11 pruebas de la Function `lead`** por HTTP contra el emulador: validación, trampa de robots, persistencia, deduplicación y límite de tasa |
| Lighthouse móvil `/` | rendimiento 100 · accesibilidad 100 · buenas prácticas 100 · SEO 100 |
| Lighthouse móvil `/precios` y `/demo` | 100 / 100 / 100 / 100 |
| `axe` (wcag2a/aa, wcag21a/aa) | sin fallos graves ni críticos, en tema claro y oscuro |
| CSP | las 18 rutas cargan sin ningún «Refused to» |
| Peso del inicio | HTML 29,2 KB + CSS 16,5 KB + JS 25,4 KB (presupuesto: 300 KB) |

## 3. Hallazgos que costaron tiempo

1. **Dos identidades de GitHub en la misma máquina.** La clave SSH por defecto
   (`id_ed25519`) es de la cuenta `AndresAlberdi`, pero el repositorio es de
   `segurolotengopy`. El push falla con *"Permission denied"* aunque `gh` esté
   autenticado. La clave correcta es `id_ed25519_segurolotengo`, con el alias
   `github-segurolotengo` en `~/.ssh/config`. **El remoto debe usar ese alias**,
   no `git@github.com`.
2. **La ubicación de Firestore es permanente.** Se creó primero en
   `southamerica-east1` y hubo que borrar y recrear. Al recrear, Google reserva
   el identificador `(default)` unos **200 segundos**: el segundo `create` falla
   con `FAILED_PRECONDITION` hasta que expira. Ahora tiene protección de borrado.
3. **`gcloud` toma el proyecto de cuota de su configuración activa**, que aquí es
   `novuchat-admin-dev` (la consola). Las llamadas a APIs de Firebase y a
   `billing budgets` fallan con `USER_PROJECT_DENIED` hasta que se pasa
   `X-Goog-User-Project: novuchat-site` o `CLOUDSDK_CORE_PROJECT=novuchat-site`.
   **Nunca** cambiar el proyecto global: rompería el trabajo de la consola.
4. **pnpm 11 exige decidir explícitamente sobre cada `postinstall`.** El ajuste
   ya no va en `package.json` sino en `allowBuilds:` de `pnpm-workspace.yaml`, y
   el valor `set this to true or false` bloquea `pnpm install` hasta resolverlo.
5. **El export del prototipo declara las familias `Figtree` y `Caprasimo`** pero
   sus `@font-face` apuntan a los `.woff2` de **Archivo**. Es un artefacto de la
   exportación: la tipografía real es Archivo y así se mantiene.
6. **La CSP no se puede probar con `astro dev`.** Solo `pnpm build && pnpm csp`
   sirve `dist/` con las cabeceras reales de `firebase.json` (puerto 5245, para
   no chocar con el emulador de Hosting en el 5240).
7. **Astro incrusta los scripts pequeños en el HTML y la CSP los mata en
   silencio.** El conmutador de tema y el banner de consentimiento no
   funcionaban, sin un solo error visible en la página. Se arregla con
   `vite.build.assetsInlineLimit: 0` en `astro.config.mjs`, que fuerza archivos
   externos cubiertos por `script-src 'self'`. **No lo cambie.**
8. **`.nav a` le gana en especificidad a `.btn-cta`.** El botón «Pedir una demo»
   del encabezado heredaba el color del texto: en tema oscuro quedaba texto
   claro sobre menta, 1,6:1. Lo detectó `axe`, no el ojo. Los selectores de
   navegación y de banda llevan `:not(.btn)`.
9. **`build.format: 'file'` hace que `Astro.url.pathname` termine en `.html`.**
   La canónica y los `hreflang` salían como `/precios.html`, que Google habría
   indexado como duplicado de `/precios`. Se normaliza en `Base.astro`.
10. **Un SVG cargado con `<img>` no ve las variables CSS del documento.** El
    hueco del isotipo se dejó transparente, que resuelve claro y oscuro sin
    duplicar archivos; para fondos oscuros existe `isotipo-claro.svg`.
11. **Un carrusel no puede deducir su posición de `scrollLeft` en cada clic.**
    Mientras la animación suave está en vuelo, `scrollLeft` devuelve un punto
    intermedio y las flechas saltan de diapositiva equivocada. El índice se
    lleva en una variable y el desplazamiento solo lo reconcilia cuando quedó
    **sobre** una diapositiva. Además hay contextos donde el navegador descarta
    la animación suave: si a los 350 ms no se movió, se salta al destino, para
    que una flecha nunca quede sin efecto.
12. **`role="group"` sobre un `<article>` deja el árbol de accesibilidad mal
    formado.** Las diapositivas son `div`. Lo detectó Lighthouse.
13. **Astro emite scripts en línea para hidratar las islas, y la CSP los
    bloquea en silencio.** El formulario y el asistente no reaccionaban, sin
    error visible. No se pueden externalizar ni usar `nonce` (Hosting sirve
    archivos estáticos), así que `scripts/sellar-csp.mjs` calcula el SHA-256 de
    cada uno dentro de `pnpm build` y los escribe en `firebase.json`.
    `pnpm csp:verificar` falla si quedan viejos.
14. **El punto activo del carrusel saltaba durante la vuelta.** Al animar de la
    cuarta a la primera, el desplazamiento pasa *por encima* de las
    intermedias; el reconciliador leía la posición en ese instante. Ahora se
    ignora mientras el movimiento está en vuelo.
15. **`functions/` se instala con `--ignore-workspace`.** Firebase empaqueta ese
    directorio por su cuenta y no puede depender de enlaces al espacio de
    trabajo de la raíz. Consecuencia que costó un intento: un script de la raíz
    **no puede importar** las dependencias de `functions/`.
16. **La API de Gemini de AI Studio se paga con créditos de prepago.** Devuelve
    un 429 idéntico al de un límite de tasa —«prepayment credits are
    depleted»— así que el reintento con espera creciente no sirve de nada: no
    es un límite temporal. Vertex AI, sobre el mismo proyecto, cobra a la
    cuenta de facturación normal y no necesita clave.
17. **La calibración del RAG cambió el contenido, no solo el umbral.** «¿Cuánto
    cuesta?» —la pregunta más frecuente de un sitio comercial— no recuperaba
    ningún plan: los fragmentos por plan responden «qué incluye el plan X», que
    es otra pregunta. Hizo falta un fragmento de resumen de precios. La
    recuperación pasó de 71 % a 100 % entre los cuatro primeros.
18. **La política de cadena de suministro de pnpm bloqueó `@google/genai`** por
    haberse publicado horas antes del cutoff de `minimumReleaseAge`. Al final
    se quitó la dependencia, pero conviene saber que ese control existe y que
    frena instalaciones de paquetes recién publicados.
19. **`FieldValue.delete()` no vale en un `add()`.** Solo funciona en `update()`
    o en `set({merge:true})`; en un `add()` lanza y la Function devolvía 500.
    Se quitaba así la trampa de robots antes de guardar; ahora se desestructura.
    **Lo destapó la prueba contra el emulador**, no la revisión del código.
20. **`firebase emulators:exec` corre su script con el directorio de trabajo en
    `functions/`**, no en la raíz, así que `vitest` no se encuentra y el error
    es un 127 sin explicación. Por eso existe `scripts/pruebas-emulador.sh`.
21. **El emulador de Firestore aplica las reglas también por REST.** Para leer
    lo que escribió la Function hay que mandar `Authorization: Bearer owner`.
    Sin esa cabecera devuelve `PERMISSION_DENIED`, que de paso es una
    confirmación más de que las reglas cierran.
22. **La deduplicación necesita un índice compuesto** (`huellaCorreo` + `creado`).
    El emulador no lo pide y producción sí: sin él, el primer lead real habría
    fallado con `FAILED_PRECONDITION`. Está declarado en `firestore.indexes.json`.
23. **El estándar DevSecOps trae dos controles que no hacen lo que dicen.**
    Los dos se descubrieron con el pipeline en rojo y ningún hallazgo real
    debajo, que es el patrón a reconocer:
    - `.github/trivy.yaml` declaraba `severity`, y la configuración de Trivy
      **manda sobre el parámetro del workflow**: cualquier MEDIUM rompía el
      pipeline y `bloquear_en` del manifiesto no significaba nada.
    - `zaproxy/action-baseline` con `fail_action: true` falla ante **cualquier**
      alerta, WARN incluidas, aunque el workflow y `zap-rules.tsv` prometan que
      solo bloquean las marcadas `FAIL`. Nueve avisos informativos tumbaban el
      job con `FAIL-NEW: 0` y `PASS: 61`.
    Los dos están corregidos en local y anotados en
    `docs/pendiente-estandar-devsecops.md` para subirlos a `~/SeguridadGeneral`.
25. **El primer pase a producción costó cinco intentos, y ninguno falló por el
    código del sitio.** Todos fueron condiciones del entorno o de la plantilla
    del estándar, y cada uno tapaba al siguiente: `pnpm` ausente en el job de
    despliegue → falta de `datastore.indexAdmin` → `cloudbilling` sin habilitar
    → `@google-cloud/functions-framework` ausente → política de limpieza de
    Artifact Registry sin definir. Lección: antes de un primer pase conviene
    verificar por adelantado permisos, APIs y dependencias del *buildpack*, no
    ir descubriéndolos de uno en uno al otro lado de la compuerta de aprobación.
26. **`firebase deploy` puede salir con código 0 habiendo fallado.** Rotula los
    fallos de Functions como avisos y continúa; la versión de hosting se queda
    en `CREATED` y nunca pasa a `FINALIZED`. El paso dio verde con las dos
    Functions caídas y el sitio en 404, diciendo «Producción desplegada». Lo
    destapó el health check, no el despliegue. Corregido: ahora se revisa la
    salida y se falla ante marcas de fallo.
27. **Una función *creada* y una *actualizada* no quedan iguales.** Firebase le
    pone el invocador público (`allUsers`) a la que crea, pero no lo reaplica al
    actualizar. Como `lead` ya existía de un intento parcial, quedó devolviendo
    403 del frontend de Google a todo el mundo —el formulario del sitio muerto—
    mientras `asistente`, recién creada, funcionaba. El pipeline dio verde. Se
    comprueba con `gcloud run services get-iam-policy`.
28. **`onCall` no restringe orígenes por defecto.** Sin la opción `cors`, la
    función refleja el origen que le pregunten: producción devolvía
    `access-control-allow-origin: https://sitio-atacante.example`. Con App Check
    en monitoreo, nada lo compensaba. Corregido fijando los tres orígenes del
    sitio.
29. **`[hidden]` no oculta nada si el componente declara `display`.** El
    `[hidden] { display: none }` del navegador es una regla de agente de
    usuario, y **cualquier `display` de autor le gana**, sin importar la
    especificidad. `.consentimiento { display: flex }` anulaba el atributo: el
    banner guardaba la decisión y se quedaba en pantalla —parecía que los
    botones no funcionaban— y reaparecía en cada página aunque el visitante ya
    hubiera elegido. **Estuvo así en producción.** Arreglado de raíz en el
    reinicio (`[hidden] { display: none !important }`), no en el componente,
    porque es el mismo tipo de fallo que `.nav a` ganándole a `.btn-cta`.
30. **Las tres pruebas de consentimiento pasaban con el banner roto.**
    Comprobaban qué se carga tras decidir —que es el riesgo de privacidad— pero
    ninguna comprobaba que el banner *desapareciera*. Una prueba puede cubrir la
    consecuencia y dejar el gesto sin cubrir. Añadida la que faltaba, y falla
    sin el arreglo.
31. **Las Functions corrían con `roles/editor` sobre todo el proyecto.** Es el
    permiso que trae la cuenta de cómputo por defecto, y gen2 la usa si no se
    dice otra cosa. Desentonaba con el resto: las reglas de Firestore niegan
    todo al cliente para que solo las Functions escriban, y luego esa identidad
    podía desplegar, tocar IAM, leer cualquier secreto o borrar la base. Se pasa
    a una cuenta dedicada con `datastore.user`, `aiplatform.user`,
    `logging.logWriter`, `monitoring.metricWriter` y `secretAccessor` **por
    secreto**, no en el proyecto. El `logWriter` es fácil de olvidar: sin él el
    código funciona y los registros desaparecen.
32. **La «semana de monitoreo» de App Check no registraba nada.** Un comentario
    prometía que «el token igual se registra abajo», pero `peticion.app` solo se
    usaba para la clave del límite de tasa. Al cumplirse la semana no habría
    habido ningún dato con el que decidir, y pasar a `enforceAppCheck: true`
    habría sido una apuesta. Monitorear exige registrar: ahora se anota si la
    petición trajo token, y nada del visitante.
33. **El índice del asistente puede desincronizarse sin que nada falle.** El
    corpus se deriva de `src/contenido/`, pero el índice es un JSON válido: si
    alguien cambia un precio y no reindexa, el sitio muestra una cifra y el
    asistente cita otra, con la confianza de estar citando la fuente. `pnpm
    verificar` pasaba igual. Añadido `pnpm rag:cotejar`, que compara el corpus
    de hoy contra el índice sin llamar a Vertex, y ya forma parte de `verificar`.
34. **El botón «Ingresar» lleva a un 404 en producción.** `PUBLIC_URL_CONSOLA`
    apunta a `novuchat-admin-prod.web.app`, que está en la lista blanca y por
    eso pasa la validación del build —pero la consola no está desplegada—.
    Tampoco resuelve `consola.novuchat.site`. La validación comprobaba que la
    URL fuera *permitida*, no que existiera. Lo destapó `pnpm enlaces` en su
    primera ejecución: dieciocho páginas, diecisiete enlaces internos, y el
    único roto era la llamada a la acción para clientes existentes.
    **Pendiente de Andres**: la consola es otro proyecto y este repositorio no
    la toca.
35. **FormSubmit exige `Referer` y la Function no lo mandaba.** Sin esa
    cabecera responde `success: false` con «Make sure you open this page through
    a web server», que no menciona la cabecera y manda a buscar el fallo donde
    no está. `avisarPorCorreo` mandaba exactamente las cabeceras que fallan, así
    que **habría fallado con el primer lead real**: guardado, `avisado: false`, y
    nadie sabiendo por qué. Se descubrió activando el punto final desde la
    terminal, no revisando el código. Las cabeceras viven ahora en
    `lead-logica.ts` con su prueba.
36. **Los secretos de las Functions están fijados a `versión 1`, no a `latest`.**
    Añadir una versión nueva a Secret Manager **no** surte efecto: hace falta
    redesplegar. Se ve con `gcloud run services describe lead`. Vale para
    `FORMSUBMIT_ALIAS` y para `SAL_HASH`.
37. **Validar que una URL esté PERMITIDA no es validar que exista.** La lista
    blanca de `PUBLIC_URL_CONSOLA` cumplía su papel —evitar que el sitio mande a
    sus clientes a un dominio ajeno— y aun así el botón «Ingresar» llevó a un
    404 durante días: `novuchat-admin-prod.web.app` estaba permitido y muerto.
    La comprobación de existencia solo se puede hacer contra el sitio publicado,
    y por eso vive en `pnpm enlaces`, no en el build. La consola pasó a
    `consola.novuchat.site` y la entrada muerta se retiró de la lista.
38. **Los dominios por defecto de Firebase no se pueden desactivar.**
    `novuchat-site.web.app` y `.firebaseapp.com` servían el sitio entero, y
    Firebase Hosting no ofrece ningún ajuste para apagarlos. Lo que sí se puede
    es no dejar que nadie se quede ahí: redirección al dominio propio en el
    `<head>`, comparando los anfitriones EXACTOS —no `endsWith('.web.app')`,
    porque los canales de vista previa son `novuchat-site--<canal>.web.app` y
    redirigirlos rompería la prueba de humo y el DAST—. Se quitó además el
    dominio por defecto de la lista CORS de las Functions.
39. **El sitio no tenía `robots.txt`.** `/robots.txt` devolvía la página 404,
    que los buscadores leen como «sin restricciones»: funcionaba de casualidad y
    dejaba el sitemap sin anunciar. Ojo: ese archivo se sirve igual desde los
    tres anfitriones, así que **no puede llevar un `Disallow` para el duplicado**
    sin bloquear también el sitio bueno. De los duplicados se ocupan el
    `canonical` —que ya estaba bien— y la redirección.
40. **`maxOutputTokens` incluye los tokens de razonamiento.** `gemini-2.5-flash`
    piensa antes de responder, y ese presupuesto sale del MISMO tope. Con 400,
    el modelo gastaba ~381 pensando y le quedaban 15 para contestar:
    `finishReason: MAX_TOKENS` y la respuesta cortada a media frase —«El plan
    Pro incluye todo lo del plan Crecimiento, 2.»—. El verificador la descartaba
    por «numero-inventado: 2», haciendo bien: ese 2 era el principio de «2.500»
    partido. **El asistente llevaba así desde el primer día**, devolviendo «eso
    no lo tengo» a preguntas que el corpus sí cubre, y nadie lo vio porque las
    preguntas simples caben en el presupuesto. Se acota el razonamiento
    (`thinkingBudget: 256`) en vez de solo subir el techo, para que lo que queda
    para la respuesta esté garantizado.
41. **Una respuesta truncada que pasa el verificador es peor que una
    rechazada.** El visitante recibe media frase sin saber que le falta algo.
    Ahora se mira el `finishReason`: si es `MAX_TOKENS`, se descarta antes de
    verificar. Se detectó midiendo, no leyendo: con la configuración vieja, 3 de
    5 preguntas salían truncadas y aun así el verificador aceptaba las 5.
42. **Retirar `roles/editor` rompió la COMPILACIÓN, no la ejecución.** Las
    Functions gen2 usan la cuenta de cómputo como cuenta de **compilación**
    (`buildConfig.serviceAccount`), aunque la de ejecución sea otra. Al quitarle
    `editor`, las Functions siguieron corriendo —por eso la verificación pasó—
    pero el siguiente despliegue falló con «missing permission on the build
    service account». Ese camino solo se ejercita al desplegar. Resuelto con
    `roles/cloudbuild.builds.builder`, que es el rol mínimo de compilación: sin
    Firestore, IAM, hosting ni secretos.
43. **Una compilación fallida envenena el despliegue siguiente.** Firebase
    registra la huella del código subido ANTES de compilarlo. Si la compilación
    falla y se relanza, compara huellas, las ve iguales y **salta las
    Functions** — con el pipeline en verde. En el pase v0.1.8 se publicó hosting
    y el arreglo del asistente se quedó fuera: producción corría las Functions
    de v0.1.7 con el sitio en v0.1.8, y nada lo decía. Se detecta con
    `gcloud functions list --format="value(name,updateTime)"`: si el
    `updateTime` no avanzó, el código nuevo no está. El workflow ahora lo avisa
    en el resumen, y la única salida limpia es cambiar el código de
    `functions/` —`--force` está prohibido—.
44. **Una promesa comercial no vive en una sola página.** Al corregir tres
    frases de `/precios` que prometían funciones inexistentes, las mismas
    aparecían en `precios.en.ts` y —más concretas, con ejemplos textuales— en
    las tres páginas de rubro: «Sin cebolla, bien cocida» para variantes,
    «Talla, color y disponibilidad real» para stock. Y como el corpus se deriva
    de `src/contenido/`, **el asistente se lo decía a los prospectos**. Un
    cliente de gastronomía lee su página de rubro, no la de precios: corregir
    solo `/precios` habría dejado el problema donde más duele.
45. **El rótulo «próximamente» llega hasta el asistente.** Al mover variantes y
    zonas a ese bloque, el asistente pasó a responder «todavía no están
    disponibles, pero es una función próxima» en vez de prometerlas. Lo que se
    marca en el contenido se propaga solo; lo que se borra, se convierte en «eso
    no lo tengo». Las dos salidas son honestas y no hizo falta tocar el prompt.
46. **El asistente y el formulario NUNCA funcionaron desde un navegador.**
    `PUBLIC_REGION_FUNCTIONS` conservó `southamerica-east1` desde el arranque
    del proyecto, cuando las Functions ya estaban en `us-east1`. El SDK
    construía `https://southamerica-east1-…cloudfunctions.net/…`, una URL que no
    existe, y la llamada moría en el navegador: **sin registro en la nube, sin
    error 4xx, solo «No pudimos enviarlo» en pantalla**.
47. **Probar la Function no es probar el camino del cliente.** El fallo anterior
    duró toda la vida del proyecto porque cada verificación —incluida la del
    correo en v0.1.5, la del asistente contra Vertex y el «13/13»— se hacía
    contra la URL directa de `us-east1`, que **no pasa por la constante de
    región**. La advertencia que se dejó escrita en el acta de v0.1.5 («no se
    verificó el clic real desde el formulario») estaba tapando exactamente esto.
    Una salvedad honesta en un acta no sustituye a la comprobación que nombra.
48. **La ausencia de registros era el dato, no el ruido.** Al fallar el
    navegador no aparecía nada en Cloud Logging, y eso se leyó como «no hubo
    tráfico». Era al revés: significaba que las peticiones no llegaban. Y por lo
    mismo el «no llegó el token de App Check» era una consecuencia, no una
    causa: ese registro ocurre DENTRO de la función.
49. **Un formulario sin hidratar filtra datos personales por la URL.** El
    `onSubmit` de la isla llama a `preventDefault()`, pero si la isla no se ha
    hidratado el navegador hace su envío nativo. Sin `method="post"`, ese envío
    es un GET y nombre, correo y teléfono acaban en la barra de direcciones —y
    en el historial, en la cabecera `Referer` y en los registros de cualquier
    intermediario—. Se vio de verdad al verificar v0.2.3:
    `/demo?nombre=…&whatsapp=%2B591…&correo=…`. Cerrado con `method="post"`,
    que no se usa nunca y por eso mismo hay que ponerlo.
50. **`min-width: 0` en un contenedor flex puede borrar una imagen.** El
    reinicio global tiene `img { max-width: 100% }`; si el contenedor colapsa,
    ese 100 % vale cero y la imagen queda con `width: 0px` **aunque el SVG haya
    cargado**. Pasó con el isotipo del asistente: elemento presente, `complete:
    true`, natural 150×150, ancho computado 0. Se vio en producción y no en
    local porque solo ocurre con el panel estrecho. El `min-width: 0` va en el
    texto, no en el contenedor, y los iconos de tamaño fijo llevan medidas
    explícitas con `max-width: none`.
51. **El banner de consentimiento dejaba inalcanzable al asistente en móvil.**
    Los dos son `position: fixed` en el bajo de la pantalla y el banner va por
    encima (z-index 70 contra 50), así que en un teléfono no se podía abrir el
    chat hasta decidir sobre la medición. **Lo encontró la prueba nueva, no una
    revisión visual**: Playwright falló con «intercepts pointer events», que es
    exactamente lo que le pasa a un dedo. Un elemento visible y tapado se ve
    perfecto en una captura.
52. **Un plazo de calendario no es evidencia.** La regla del doc 04 decía «7
    días sin falsos positivos» para pasar App Check a exigencia. Los 7 días se
    cumplieron, pero durante casi todos ellos **ningún navegador llegaba a
    llamar** por el fallo de región del `v0.2.3`: las 25 peticiones registradas
    eran pruebas por `curl`, todas sin token, y habrían hecho parecer peligroso
    activar la exigencia. La evidencia útil apareció en cuatro horas de tráfico
    real, no en una semana de reloj. Lo que hay que contar son las peticiones
    del camino del usuario, no los días.
53. **Con la exigencia activa, el fallo deja de ser observable desde dentro.**
    Una petición sin token válido se rechaza **antes** del código de la
    Function, así que el `logger.info` que sostuvo el monitoreo pasa a valer
    siempre `true` y no dice nada. La vigilancia se muda a las métricas de App
    Check y a los 401 de Cloud Run. Se retiró el registro en lugar de dejarlo
    dando una falsa sensación de control.
54. **Una comprobación que siempre falla es una comprobación que nadie mira.**
    `pnpm asistente:probar` daba 12/13 de forma permanente por un caso que en
    realidad se comportaba bien: ante «¿me pueden hacer una página web
    también?» el modelo emite ÉL MISMO la frase de derivación, el verificador
    la acepta —es texto correcto— y el script la contaba como «responde». Para
    el visitante es indistinguible de la derivación por umbral: ve exactamente
    lo mismo. De paso se retiró un reintento «por falta de citas» que decía
    replicar a la Function y no replicaba nada: `sin-citas` dejó de ser motivo
    de rechazo, así que la rama estaba muerta y su comentario describía un
    comportamiento de producción que no existe. Un comentario falso es peor que
    código muerto.
55. **En un sitio estático, «se retira sola» significa «se retira al desplegar».**
    La barra de la Rueda tenía `hasta: '2026-09-11'` y un comentario que decía
    que desaparecía sin desplegar. La comparación corre en el build, así que el
    11 de septiembre seguía publicada, con la «instalación bonificada» incluida.
    Y al revisarla aparecieron dos restos de `v0.3.0` que nadie había visto:
    `/nosotros` decía «Sin tarifas en dólares que suben solas» con los planes ya
    en dólares, y la portada en inglés, «In bolivianos». El cambio de moneda se
    buscó en `src/contenido/`; esos dos textos vivían en `src/pages/`.
56. **El verificador compara cifras, no palabras.** La fuente decía «Una
    agenda»; el modelo escribió «1 agenda» y la respuesta a «¿cuánto cuesta?»
    —la pregunta más frecuente— se descartó como `numero-inventado: 1`. El
    control hizo bien su trabajo; el defecto estaba en el contenido. Las
    cantidades del corpus van en cifra. Era intermitente: `v0.3.1` había pasado
    13/13 con el mismo texto.
24. **Silenciar un aviso no es lo mismo que resolverlo.** La salida cómoda para
    ZAP era marcar los nueve `IGNORE`. Habría dado verde borrándolos del
    informe, y entre ellos había tres que tocan decisiones de arquitectura
    —`style-src unsafe-inline`, COEP, reflexión de parámetros—. Se dejaron
    visibles y se escribió el veredicto de cada uno en `docs/csp.md`. Un aviso
    que deja de verse deja de revisarse.

---

## 2ter. Lighthouse sobre producción (2026-09-04)

Medido con Lighthouse 12, móvil emulado, contra `https://novuchat.site` en vivo
—no contra un build local—:

| página | rendimiento | accesibilidad | buenas prácticas | SEO |
|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 |
| `/precios` | 100 | 100 | 100 | 100 |
| `/demo` | 100 | 100 | 100 | 100 |

FCP y LCP 1,8 s · TBT 0 ms · CLS 0.

Cumple el mínimo de `CLAUDE.md` (≥ 90) con margen. Conviene repetirlo tras
cualquier cambio que añada JavaScript o imágenes: el CLS 0 y el TBT 0 son fáciles
de perder y nadie los echa de menos hasta que un cliente se queja.

---

## 3bis. Cómo mirar el sitio

Hay **dos servidores** y sirven para cosas distintas. Confundirlos es la causa
más probable de un «el preview da errores»:

| Comando | Dirección | Para qué |
|---|---|---|
| `pnpm dev` | `http://localhost:4321` | Ver contenido y diseño, con recarga en caliente. **No aplica las cabeceras de seguridad**, así que aquí una violación de la CSP no se ve |
| `pnpm build && pnpm csp` | `http://127.0.0.1:5245` | Ver el sitio compilado con las cabeceras **reales** de `firebase.json`. Es el único que sirve para verificar la CSP |

El segundo solo existe mientras el comando está corriendo: si la ventana quedó
abierta en el 5245 y el proceso se cerró, el navegador da un error de conexión.
`.claude/launch.json` deja el primero listo para arrancar desde el editor.

## 3ter. Verificación en el canal de vista previa (2026-09-02)

`https://novuchat-site--vista-previa-9w2vpn0d.web.app` — expira el 2026-09-09.

| Comprobación | Resultado |
|---|---|
| Cabeceras reales de Hosting | CSP completa, HSTS, `X-Frame-Options: DENY`, `Referrer-Policy` |
| `x-robots-tag` | `noindex`: los canales de vista previa no se indexan |
| Rutas | `/`, `/precios`, `/demo`, `/soluciones/gastronomia`, `/en`, `/terminos` → 200; inexistente → 404 |
| Consola del navegador | sin errores: **ninguna violación de CSP** con las cabeceras de Firebase |
| Tipografía | Archivo cargada desde `/fuentes/`, no del sistema |
| Islas | banner de consentimiento visible, carrusel con sus cuatro diapositivas, botón del asistente presente |
| Imágenes | ninguna rota |

Detalle menor: Firebase Hosting normaliza el `max-age` de HSTS a 31 556 926 en
lugar del 31 536 000 declarado. No cambia nada, pero conviene saberlo antes de
que alguien lo reporte como una diferencia.

## 4. Próximos pasos

**De Claude Code:**

1. Capturas reales de la consola para la página `/consola`.
2. *Recomendación, sin urgencia:* **conectar el cliente a los emuladores en
   desarrollo.** Hoy `pnpm dev` llama a las Functions de producción y el `cors`
   de `v0.2.2` lo rechaza desde `localhost`, así que el asistente y el
   formulario no se pueden probar en local. No tiene impacto en el sitio
   publicado ni en el CI —decisión de Andres, 2026-09-07, dejarlo así— pero
   deja sin ejercitar el camino de llamada del cliente, que es donde vivía el
   fallo de región de `v0.2.3`. Detalle y alternativas en `CLAUDE.md`.

**De Andres:**

1. Reemplazar la identidad legal provisional por el NIT propio de NovuChat
   cuando salga (`src/contenido/pendientes.ts`, dos valores).
2. ID del píxel de Meta; confirmar zona horaria La Paz y moneda BOB en GA4.
3. Los MX y el SPF del dominio (se perdieron al reescribir el DNS en Namecheap).
   El correo de leads ya llega por FormSubmit a `novuchat@novuchat.site`.
4. Perfil de Empresa de Google para el SEO local.

*Resueltos desde que se escribió esta lista:* PR #1 fusionada; WIF y los
secretos del repositorio configurados; nombres de los planes confirmados
(Impulso/Crecimiento/Pro); prueba del asistente contra Vertex real, hecha en
cada verificación desde `v0.2.3`.
