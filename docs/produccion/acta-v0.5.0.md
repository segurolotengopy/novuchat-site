# Acta de pase a producción — novuchat.site — v0.5.0 — 2026-10-11

Commit: `4195d3c` · Tag: `v0.5.0` (anotado y **firmado**, ED25519, firma verificada) · Modo: A
Run: [38115625304](https://github.com/segurolotengopy/novuchat-site/actions/runs/38115625304) — 05:41 → 05:46 UTC del 11/10 (01:41 → 01:46 hora de Bolivia), `success`
Autorizó el pase: Andres Alberdi desde la sesión de Claude Code («publícalo y comprueba»; «sí a cada una» para la excepción de seguridad y el vaciado de `PENDIENTES`)
Ejecutó la fusión: Claude Code con la cuenta `AndresAlberdi` · Ejecutó la aprobación del Environment: Claude Code con la cuenta `segurolotengopy`, por decisión suya

## Veredicto: desplegado y verificado. El sitio promete la oferta con la cuenta propia del cliente.

## Cambios incluidos (desde `v0.4.0`) — [#66](https://github.com/segurolotengopy/novuchat-site/pull/66)

| Tema | Antes | Ahora |
|---|---|---|
| **Planes** | USD 25 / 50 / 90 con 100 / 220 / 500 conversaciones y la mensajería de WhatsApp incluida | Mismos precios con la **cuenta de WhatsApp Business propia del cliente**: **hasta 200 / 500 / 1.000** conversaciones; **el cliente paga la mensajería directamente a Meta** (nota junto a cada precio y pie oficial) |
| **Bolsas** | Una de 30 conversaciones por USD 10 («excedente») | **50 por USD 10, 100 por USD 20 y 300 por USD 40**; no vencen; «bolsa» en el glosario |
| **Explicación** | — | Bloques «Qué pagas y a quién» y «Qué necesitamos de ti» (en `/precios` y, el segundo, en `/como-funciona`) |
| **Oferta anterior** (Meta incluido, número nuevo, 100 / 220 / 500, bolsa 30 por USD 10) | Era la oferta | **Opción excepcional**: colapsada y pequeña al final de `/precios` y `/en/precios`; también en `/terminos` §3 y en el corpus. Nunca en la portada, las tarjetas, la FAQ ni el marcado para Google |
| **Número de WhatsApp** | «Un número nuevo que conseguimos nosotros» | El número es del cliente, a su nombre: «Conectamos tu número al canal oficial de WhatsApp Business de Meta; la cuenta queda a tu nombre» |
| **Instalación en 48 horas** | Desde que tenemos tu información | Desde que **tengas tu cuenta de WhatsApp Business lista** y nos entregues tu información (la verificación de Meta se hace en la cuenta del cliente) |
| **Contactos** | +591 70661250 en todas partes | +591 70661250 (persona) donde se promete una persona; **+591 76988663 (asistente de IA)** en el cierre de la portada, `/contacto` y la FAQ, siempre rotulado «asistente virtual» |
| **`/terminos` §2 a §5** | Meta incluido | Reescritos para la cuenta propia: la mensajería se paga a Meta; obligación de mantener la cuenta y el medio de pago; 48 horas condicionadas |
| **Asistente** | Índice de 41 fragmentos | **46 fragmentos** (huella `6085c6c3…`). El prompt ya no prohíbe hablar de «cuentas» en general: solo de accesos, credenciales, identificadores y configuración técnica; sobre la cuenta del negocio explica lo que dicen los fragmentos |
| **Dependencias** | `proxy-addr` 2.0.7 (**CRITICAL**, `functions/`), `devalue` 5.9.2, `source-map-js` 1.2.1, `sharp` 0.35.4, `http-cache-semantics` 4.2.0 | `proxy-addr` 2.0.8, `devalue` 5.9.4, `source-map-js` 1.2.2, `sharp` 0.35.5, `http-cache-semantics` 4.3.0. Solo lockfiles; `package.json` no cambia. **Sin excepciones nuevas** |
| **Guardas** | — | Regla `vocabulario-oferta` (sin «BYOC», «Tech Provider» ni «centavos» en `src/`), prueba de paridad ES/EN de precios, guardas del corpus más estrictas, `PENDIENTES` como compuerta de `pnpm listo` |

## Cómo se llegó, y lo que costó tiempo

1. **La frase sobre lo que cobra Meta.** El planificador, con la documentación pública de Meta, afirmó que responder dentro de 24 horas es gratis; las hojas de tarifas de la plataforma vigentes desde el 01/10 dicen lo contrario. En vez de elegir una, el sitio publica **solo** «Meta cobra la mensajería por mensaje, según su tarifa vigente», sin gratuidades ni cifras. Además el «1.000» colisiona con el tope del plan Pro y el verificador compara cifras, no a qué se refieren (hallazgo 61).
2. **El script de prueba no era fiel a producción.** `probar-asistente.ts` usaba 400 tokens de salida sin acotar el razonamiento; la Function usa 1.200 con razonamiento de 256 y descarta lo truncado. Salían respuestas cortadas que **no ocurren en producción**. Se igualó la configuración: 26/26 con respuestas completas.
3. **Dos revisiones independientes** (código y seguridad) arrojaron 14 correcciones, todas aplicadas: frase de Meta duplicada, pie mal ubicado en `/en`, la opción excepcional visible en la FAQ, la regla del prompt, «cuenta propia» presentada como prestación incluida, cifras de EN copiadas a mano sin vigilancia, una guarda que no detectaba la regresión que corregía.
4. **El CI del PR falló una vez, con razón.** Trivy decía que `http-cache-semantics` no tenía versión corregida, pero el paso `pnpm audit` sí la conocía (4.3.0, dentro del rango de Astro). Había registrado una excepción de seguridad que **no hacía falta**; la retiré antes de fusionar. Lección: cuando dos herramientas discrepan, probar `pnpm update <paquete> --depth Infinity` antes de pedir una excepción.
5. **Los avisos de dependencias eran heredados de `main`**, publicados el 01 y 05/10, después del último CI verde. Hacían fallar la compuerta de **cualquier** PR, incluidos los de Dependabot. Se corrigieron en este mismo pase.
6. **El clasificador de seguridad bloqueó un commit** que vaciaba `PENDIENTES` y registraba una excepción de CVE, por relajar controles. No se rodeó: se hizo primero lo que era mejora pura (los lockfiles) y los dos cambios se aplicaron después, con el «sí» explícito de Andres.

## Evidencia (contra producción)

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Cloud Run | `asistente-00018-cag` (05:46 UTC) · `lead-00018-cut` (05:45 UTC), 100 % del tráfico, `us-east1` |
| 2 | `/precios` (navegador, escritorio) | Impulso «USD 25 / mes · + USD 65 de instalación, pago único · + la mensajería de WhatsApp, que pagas directamente a Meta · Hasta 200 conversaciones al mes»; Crecimiento USD 50 / hasta 500; Pro USD 90 / hasta 1.000. Las tres bolsas en pantalla. Pie oficial presente |
| 3 | Opción excepcional | Colapsada (`<details data-excepcional>` cerrado) en `/precios` y presente en `/en/precios`; **ausente** en `/`, `/preguntas-frecuentes` y `/en`, incluido su JSON-LD |
| 4 | Las 18 páginas del sitemap | Sin «número nuevo que conseguimos», «conversaciones de WhatsApp están incluidas», «220 conversaciones al mes», «BYOC», «Tech Provider» ni frases prohibidas |
| 5 | CSP servida | `img-src 'self' data: gstatic googletagmanager google-analytics facebook`, sin cambios |
| 6 | Asistente publicado | «¿cuánto cuesta una bolsa de conversaciones y cuánto me cobra Meta?» → «50 conversaciones por USD 10, 100 por USD 20 o 300 por USD 40. La mensajería de WhatsApp la pagas directamente a Meta, con tu tarjeta y en tu propia cuenta…» |
| 7 | Asistente publicado | «¿hay un plan con Meta incluido?» → «Sí, existe una opción excepcional… No es la oferta habitual y se ofrece caso por caso» |
| 8 | Pruebas locales | `pnpm verificar` completo: 103 unidad · 84 humo con `axe` (incluida la opción excepcional abierta, en 2 temas) · prohibiciones · índice de 46 fragmentos al día · CSP. `pnpm listo` sale 0 |
| 9 | Asistente contra Vertex | **26/26**, con respuestas completas; incluye la FAQ de privacidad y dos inyecciones sobre la cuenta (una cortada por el filtro, otra respondida con la derivación fija) |
| 10 | Calibración | Corpus min 0,657 · ajenas max 0,687 · umbral 0,70 sin tocar; margen 0,013 (antes 0,017) |
| 11 | Seguridad | Trivy 0 CRITICAL/HIGH · `pnpm audit --prod`: 1 moderado (raíz) y 2 moderados (`functions/`), no bloquean |
| 12 | CI del PR #66 | 20 checks en verde tras la corrección de dependencias |
| 13 | Aprobación | Registrada en GitHub por `segurolotengopy`, con la autorización de Andres en el comentario |

## Plan de rollback

Estado anterior: `v0.4.0`, Cloud Run `asistente-00017-bor` · `lead-00017-poc`.

```bash
firebase hosting:clone novuchat-site:previa novuchat-site:live
gcloud run services update-traffic asistente --region us-east1 --project novuchat-site --to-revisions asistente-00017-bor=100
gcloud run services update-traffic lead --region us-east1 --project novuchat-site --to-revisions lead-00017-poc=100
```

Volver atrás reintroduce la oferta con Meta incluido y los topes 100 / 220 / 500, y devuelve el CRITICAL de `proxy-addr`: un rollback de este pase debe ser breve y seguido de un arreglo hacia adelante.

## Riesgos vigentes

| Asunto | Estado |
|---|---|
| **La plataforma debe aplicar lo que el sitio ya promete** | Topes 200 / 500 / 1.000 y bolsas 50 / 100 / 300. La oferta anterior cortaba en 100 / 220 / 500. Se avisó a la sesión principal de NovuChat el 11/10 |
| **`/terminos` §2 a §5 sin revisión legal** | Qué pasa al llegar al tope sin bolsa; a nombre de quién queda el número de la opción excepcional; si Meta suspende la cuenta; baja y desconexión del número; el «mensaje neutro» durante la suspensión sale desde la cuenta del cliente. Riesgo **aceptado por Andres** |
| **`/privacidad` no declara el WhatsApp del asistente** (+591 76988663) | NovuChat es **responsable** de esos datos (teléfono, nombre de perfil, mensajes) y la política no dice finalidad, base legal, plazo ni destinatarios. Riesgo **aceptado**; cerrar en 30 días según la política |
| **«Un número conectado al asistente deja de poder usarse desde el celular»** | Afirmación de la FAQ sin confirmar con la plataforma; la coexistencia de Meta podría cambiarlo |
| **Alcance de la instalación** | Conexión del número y acompañamiento en la verificación ante Meta; y si la opción excepcional cuesta USD 65 (se asumió que sí) |
| **La frase de Meta no lleva cifras** | Decisión pendiente de Andres si quiere agregar tarifas; las fuentes discrepan |
| **Prohibición 9 de `CLAUDE.md`** («cada mensaje cuesta 0,89 Bs») | Con cuenta propia el cliente paga a Meta; decidir si se reescribe o se acota a la opción excepcional |
| **Opción excepcional en inglés** | Se publicó por paridad; confirmar si se mantiene |
| **Seguridad del asistente, seguimiento (LOW)** | Control determinista de términos sensibles en la prosa del verificador, y filtro del historial que envía el cliente. Hoy la contención de «cuentas» es la regla del prompt |
| **`pnpm listo` no corre en el CI de despliegue** | Depende de que alguien lo ejecute antes de etiquetar; pasarlo al flujo del pase |
| **Preguntas dobles** | El asistente respondió solo la primera parte de «¿hay un plan con Meta incluido? ¿y puedo usar mi número actual?» |
| **Copia del corpus en la captación** | `Flujos/novuchat-onboarding.json` debe recopiar la huella `6085c6c3…`. Lo hace la sesión de la plataforma. El rubro Educación sigue sin existir en el sitio |
| **Aviso del 80 % y avance al bloque 2** | El sitio los promete; el aviso del 80 % ya está en la plataforma (`base-comercial`), el del bloque 2 sigue sin programarse |
| **Identidad legal provisional** | AAB1 / NIT 2441214012, a sustituir por el NIT propio de NovuChat |
| **«No lo sé» de más con el umbral en 0,70** | Aceptado. Se ve en `conversacionesAsistente`, motivo `bajo-umbral` |
| **«Cobra por QR»** en la portada | Andres decidió mantenerlo (2026-09-11) |
| **Precio del segundo camino** | La FAQ dice «se contrata un plan para cada uno» sin decir si tiene precio distinto |
| **Desarrollo local sin Functions** | Decisión consciente (`CLAUDE.md`) |
| CVE-2026-41907 (`uuid`, MEDIA) | Excepción vigente, vence 2026-12-01 |
| `braces` (osv-scanner, sin versión corregida) | Ni Trivy ni `pnpm audit` lo bloquean hoy |
| Dependabot #53, #55, #56, #61, #65 | Abiertos; fallaban por los avisos heredados. Rebasar sobre `main` y revisar |
| TypeScript 6 | `@astrojs/check` no lo admite de verdad |
| Leads de prueba | Rotulados, se conservan como evidencia (conteo no revisado desde `v0.2.6`) |

**Se cierran** los riesgos de `v0.4.0` «el sitio promete avisos que la plataforma no da» (el del 80 % ya existe), «qué pasa al agotar el plan» (el sitio ahora dice que se compra una bolsa, que se aprueba) y «fix(deps) heredado de `main`».
