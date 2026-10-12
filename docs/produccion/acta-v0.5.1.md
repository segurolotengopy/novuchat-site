# Acta de pase a producción — novuchat.site — v0.5.1 — 2026-10-12

Commit: `e456952` · Tag: `v0.5.1` (anotado y **firmado**, ED25519, firma verificada) · Modo: A
Run: [38209187142](https://github.com/segurolotengopy/novuchat-site/actions/runs/38209187142) — 05:43 → 05:47 UTC del 12/10 (01:43 → 01:47 hora de Bolivia), `success`
Autorizó el pase: Andres Alberdi desde la sesión de Claude Code («Vamos con tus recomendaciones en los 4 puntos, fusiona 72»; «prefiero que la regla salga ya, espero los 30min. Pregunta a Analisis Financiero sobre las decisiones actualizadas. Luego publica»)
Ejecutó la fusión: Claude Code con la cuenta `AndresAlberdi` · Ejecutó la aprobación del Environment: Claude Code con la cuenta `segurolotengopy`, por decisión suya

## Veredicto: desplegado y verificado. Las bolsas públicas dejan de ser las que la plataforma ya no vende.

## Cambios incluidos (desde `v0.5.0`) — [#72](https://github.com/segurolotengopy/novuchat-site/pull/72) y [#73](https://github.com/segurolotengopy/novuchat-site/pull/73)

| Tema | Antes (`v0.5.0`) | Ahora |
|---|---|---|
| **Bolsas** | 50 por USD 10, 100 por USD 20 y 300 por USD 40 | **Bolsa de conversaciones: 300 por USD 15** (no vence, aviso al 80 %, nunca se cobra sin aprobación; se cumple hoy como pago manual) y **bolsa de seguimiento: 300 mensajes por USD 10, rotulada «Próximamente»** |
| **Bolsa de seguimiento** | — | Para mensajes que el negocio envía más de 48 h después del último de su cliente; solo con cuenta propia; Meta los cobra como plantilla de marketing en la cuenta del cliente (sin cifras). Se publica como próxima porque el servidor aún no la vende ni cuenta esos mensajes (prohibición 8) |
| **Reglas del seguimiento** | — | (1) dentro de 48 h va en la conversación y «NovuChat no lo cobra aparte… Meta puede cobrarlo en tu cuenta»; (2) los planes no incluyen seguimiento fuera de 48 h; (3) los recordatorios de una cita agendada, **hasta 2 por cita**, no cuentan (Meta puede cobrarlos); (4) cualquier otro mensaje fuera de 48 h sí cuenta |
| **Frase del celular** | «mientras un número está conectado… ya no puedes responder desde la aplicación» | Redacción de WAM, sin «API» ni coexistencia: «al conectar tu número con el asistente, ese número pasa al canal oficial de WhatsApp Business y deja de funcionar en la aplicación del celular. Por eso recomendamos un número nuevo y dedicado al asistente» |
| **`/terminos`** | actualizado el 6 de octubre | §3 con la bolsa nueva y la de seguimiento; fecha **12 de octubre de 2026** |
| **Asistente** | 46 fragmentos | **48 fragmentos** (bolsa de seguimiento y su FAQ). Si le preguntan por seguimiento responde «Todavía no…» |
| **Fuente única** | Reglas y avisos copiados a mano en varios textos | Las reglas y el aviso de «Próximamente» viven en `bolsaSeguimiento`; tarjeta, FAQ, términos, glosario y corpus los derivan. Quitar el rótulo es `proximamente: false` + reindexar |
| **Guardas** | — | Paridad ES/EN de la bolsa de seguimiento; el corpus no conserva bolsas viejas; con `proximamente:false` simulado ningún texto dice «no disponible»; la regla de recordatorios debe decir «hasta 2 por cita». El tope de cordura de los fragmentos subió de 2000 a 2200 caracteres |

No cambian: planes (25/200, 50/500, 90/1.000), opción excepcional (100/220/500, bolsa de 30 por USD 10), instalación (65 / desde 125), frase de Meta, pie, contactos, `/demo`. El plan de USD 50 por 2.000 sigue siendo contrato excepcional **no publicado**.

## Cómo se llegó, y lo que costó tiempo

1. **Cambio de bolsas llegado por otra sesión.** La sesión de Análisis financiero propuso reemplazar las bolsas; no se tomó como autorización. Andres lo confirmó en este chat.
2. **Revisión de código (7 importantes, 9 menores):** el glosario «Mensaje de seguimiento» chocaba con los recordatorios que los planes ya incluyen; la regla de 48 h parecía decir que Meta no cobra entre la hora 24 y la 48; «no vencen» se le había atribuido a la bolsa de seguimiento sin decisión; el aviso de «Próximamente» estaba copiado en seis textos. Se corrigió con fuente única, y las dos decisiones de fondo se plantearon a Andres, que aceptó las recomendaciones.
3. **El asistente empezaba con «Sí».** A «¿puedo mandar mensajes de seguimiento después de una semana?» contestaba «Sí, puedes…» antes de decir que la bolsa no está disponible. Se corrigió el texto de la FAQ («Todavía no.») y la prueba rechaza una respuesta que empiece con «Sí,». Se descubrió además que la expresión regular de la guarda no funcionaba con la tilde (`\b` después de `í`) y se arregló.
4. **Decisiones que llegaron durante el trabajo.** Andres adelantó la publicación al 12/10 (se había acordado esperar la ventana del 15→16), y Análisis financiero trajo después la decisión de los recordatorios (hasta 2 por cita). Se detuvo la cadena de pruebas ya iniciada y se reinició sobre el texto definitivo.
5. **La fecha de `/terminos`.** Se había fijado el 16 de octubre; al adelantarse el pase habría quedado una fecha futura en un contrato. Se corrigió en el mismo pase.
6. **Falla de entorno, no de código.** `pnpm verificar` falló porque el worktree nuevo no tenía instaladas las dependencias de `functions/`; se instalaron y se repitió la verificación completa.
7. **Comprobación en el navegador.** El aviso de cookies tapaba el campo de texto del asistente y se llevaba los clics; se eligió «Solo lo necesario» y se repitió.

## Evidencia (contra producción)

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Cloud Run | `asistente-00019-qaw` (05:47 UTC) · `lead-00019-qac` (05:46 UTC), 100 % del tráfico, `us-east1` |
| 2 | Las 18 páginas del sitemap | Ninguna bolsa vieja, «número nuevo que conseguimos», «BYOC» ni «Tech Provider»; sin frases prohibidas |
| 3 | `/precios` | «300 conversaciones por USD 15» (3 apariciones), «300 mensajes por USD 10» y el rótulo «Próximamente» (2). `/en/precios` y `/preguntas-frecuentes` con la bolsa nueva |
| 4 | `/terminos` | «12 de octubre de 2026» |
| 5 | Opción excepcional | Ausente de `/`, `/preguntas-frecuentes` y `/en` |
| 6 | CSP servida | `img-src 'self' data: gstatic googletagmanager google-analytics facebook`, sin cambios |
| 7 | Asistente publicado (navegador) | «¿cuánto cuesta una bolsa de conversaciones?» → «USD 15 por 300 conversaciones adicionales… no vencen y nunca se cobran sin tu aprobación… mensajería… directamente a Meta» · «¿puedo mandar mensajes de seguimiento… después de una semana?» → «Todavía no puedes… todavía no está disponible, es una función próxima… 300 mensajes por USD 10… Meta los cobrará como plantilla de marketing» · «¿mi número actual va a seguir funcionando en la aplicación del celular?» → «No… deja de funcionar en la aplicación del celular. Por eso recomendamos un número nuevo y dedicado al asistente» |
| 8 | Pruebas locales | `pnpm verificar` completo: 109 unidad · 86 humo con `axe` · prohibiciones · índice de 48 fragmentos al día · CSP. `pnpm listo` sale 0 |
| 9 | Asistente contra Vertex | **28/28**, respuestas completas |
| 10 | Calibración | Corpus min 0,657 · ajenas max 0,687 · umbral 0,70 sin tocar |
| 11 | CI | #72 y #73: 20 checks en verde cada uno |
| 12 | Aprobación | Registrada en GitHub por `segurolotengopy`, con la autorización de Andres en el comentario |
| 13 | Firma del tag | `git tag -v v0.5.1`: «Good "git" signature», ED25519 `SHA256:uVo5Nl7U…` |

La ventana de 23:30–01:30 de la plataforma no aplica a este pase: es para cambios que afectan a clientes en producción y el sitio no es un cliente. El despliegue crea revisiones nuevas de las Functions sin cortar las vigentes.

## Promesas del sitio que el servidor aún no cumple, hasta la etiqueta

Estado real del servidor al 12/10, informado por la sesión principal de la plataforma (no verificado en este repositorio):

| Lo que el sitio promete | Lo que el servidor hace hoy | Cómo se cubre mientras tanto |
|---|---|---|
| **Topes de 200 / 500 / 1.000 conversaciones** (publicados desde `v0.5.0`) | Corta en **100 / 220 / 500** (los límites de `planes.ts`, comportamiento «Meta incluido») | El tope contratado se asigna a **cada cuenta nueva** con `asignar-plan --conversaciones` (200 / 500 / 1.000), con el «sí» de Andres, y lo corre Cartera. Bellido y las cuentas existentes siguen con sus topes actuales |
| **Aviso al 80 %** | **Existe** y mide el consumo contra las conversaciones incluidas de la cuenta (el tope que tenga asignado): funciona con el tope contratado | — |
| **Aviso al 80 % de la bolsa** | No existe; llega con el bloque 2 | — |
| **Bolsa de conversaciones, 300 por USD 15** | Pagar solo vende la de 30 por USD 10 | Pago manual desde Plataforma, con el «sí» de Andres. Se vende y se acredita en Pagar con la etiqueta del bloque 1 |
| **Bolsa de seguimiento, 300 por USD 10** | No se vende ni se cuentan los mensajes salientes de más de 48 h | El sitio la rotula **«Próximamente»**. Llega con el bloque 2 (depende del contador de salientes) |

**Fecha de la etiqueta de planes y bolsas del servidor: estimada para la noche del 15 al 16/10 (23:30–01:30), sin fecha firme.** Depende de una decisión de Andres sobre cuánto trabajo cabe en la cuota semanal: hoy solo están comprometidos el PR-1 y el PR-2 (tarifa y bolsa de conversaciones); los demás van después del viernes. La sesión principal confirma cuando Andres decida.

## Plan de rollback

Estado anterior: `v0.5.0`, Cloud Run `asistente-00018-cag` · `lead-00018-cut`.

```bash
firebase hosting:clone novuchat-site:previa novuchat-site:live
gcloud run services update-traffic asistente --region us-east1 --project novuchat-site --to-revisions asistente-00018-cag=100
gcloud run services update-traffic lead --region us-east1 --project novuchat-site --to-revisions lead-00018-cut=100
```

Volver atrás republica las bolsas 50 / 100 / 300, que la plataforma ya no vende: un rollback debe ser breve y seguido de un arreglo hacia adelante.

## Riesgos vigentes

| Asunto | Estado |
|---|---|
| **Topes publicados distintos de los del servidor** | El sitio promete 200 / 500 / 1.000 y el servidor corta en 100 / 220 / 500 hasta la etiqueta; una cuenta nueva vendida con el tope publicado necesita que Cartera ejecute `asignar-plan --conversaciones` con el «sí» de Andres. **Si se olvida, el cliente recibe un corte que el sitio no le anunció** |
| **La bolsa de 300 por USD 15 se cumple como pago manual** | `registrarPagoManual` solo conoce la de 30 por USD 10: se registra como 10 unidades con lo recibido en USD 15 y `motivoDiferencia`; queda auditada como diferencia hasta que el bloque de Central agregue la bolsa. Lo opera Plataforma con el «sí» de Andres, no el comercio desde la consola |
| **Bolsa de seguimiento: «Próximamente»** | El servidor no la vende ni cuenta esos mensajes (llega con el bloque 2, que depende del contador de salientes de más de 48 h). Quitar el rótulo: `proximamente: false` en `precios.es.ts` y `precios.en.ts` + `pnpm rag:indexar` |
| **Fecha de la etiqueta de planes y bolsas del servidor** | **Estimada** para la noche del 15 al 16/10, sin fecha firme: sujeta a una decisión de Andres sobre la cuota semanal (hoy solo PR-1 y PR-2). Hasta entonces rige la sección «Promesas del sitio que el servidor aún no cumple» |
| **Reglas de 48 horas frente a la definición de conversación (24 h continuas)** | Un mismo cliente tiene dos relojes. Decisión de redacción pública pendiente de Andres (`ESTADO.md`, 0 bis a) |
| **`/terminos` §3 sin revisión legal** | Anuncia con «habrá» el precio de una bolsa que aún no se vende y afirma cómo clasifica Meta el mensaje («plantilla de marketing»; podría tratarlo como utilidad). Además, los riesgos de §2 a §5 de `v0.5.0` |
| **`/privacidad` no declara el WhatsApp del asistente** (+591 76988663) | Riesgo aceptado en `v0.5.0`; cerrar en 30 días |
| **Prohibición 9 de `CLAUDE.md`** («cada mensaje cuesta 0,89 Bs») | Con cuenta propia la paga el cliente a Meta; decidir si se reescribe o se acota a la opción excepcional |
| **Opción excepcional en inglés** | Publicada por paridad; confirmar si se mantiene |
| **Seguridad del asistente (LOW)** | Control determinista de términos sensibles en la prosa y filtro del historial; hoy la contención de «cuentas» es la regla del prompt |
| **`pnpm listo` no corre en el CI de despliegue** | Depende de que alguien lo ejecute antes de etiquetar |
| **Preguntas dobles** | El asistente suele responder solo la primera parte |
| **Alcance de la instalación** | Conexión del número y acompañamiento en la verificación ante Meta; y si la opción excepcional cuesta USD 65 |
| **Frase de Meta sin cifras** | Pendiente de Andres si quiere agregar tarifas; las fuentes discrepan |
| **Identidad legal provisional** | AAB1 / NIT 2441214012, a sustituir por el NIT propio de NovuChat |
| **«No lo sé» de más con el umbral en 0,70** | Aceptado. Se ve en `conversacionesAsistente`, motivo `bajo-umbral` |
| **«Cobra por QR»** en la portada | Andres decidió mantenerlo (2026-09-11) |
| **Precio del segundo camino** | La FAQ dice «se contrata un plan para cada uno» sin decir si tiene precio distinto |
| **Desarrollo local sin Functions** | Decisión consciente (`CLAUDE.md`) |
| CVE-2026-41907 (`uuid`, MEDIA) | Excepción vigente, vence 2026-12-01 |
| `braces` (osv-scanner, sin versión corregida) | Ni Trivy ni `pnpm audit` lo bloquean hoy |
| Dependabot #55, #61, #67 a #70 | Abiertos; rebasar sobre `main` y revisar |
| TypeScript 6 | `@astrojs/check` no lo admite de verdad |
| Leads de prueba | Rotulados, se conservan como evidencia (conteo no revisado desde `v0.2.6`) |

**Se cierran** los riesgos de `v0.5.0` «la afirmación del número en el celular sin confirmar» (se alineó con la redacción de WAM) y «el sitio muestra bolsas que la plataforma no vende». Huella del corpus desplegado: `e16b733b…` (48 fragmentos, generado el 2026-10-12). El chat de captación de NovuChat no copia el corpus del sitio (lo confirmaron la sesión de Novuchat chat y la principal): no hay nada que recopiar.
