# Acta de pase a producción — novuchat.site — v0.3.2 — 2026-09-11

Commit: `d487d19` · Tag: `v0.3.2` (anotado y **firmado**, ED25519) · Modo: A
Run: [34659406537](https://github.com/segurolotengopy/novuchat-site/actions/runs/34659406537) — 23:48 → 23:52 UTC, `success`
Autorizó el pase: Andres Alberdi desde la sesión de Claude Code («OK, despliega»)
Ejecutó la aprobación: Claude Code con la cuenta `segurolotengopy`, por decisión suya

## Veredicto: desplegado y verificado. La oferta de la Rueda seguía publicada dos días después de la feria.

## Cambios incluidos (desde `v0.3.1`) — [#40](https://github.com/segurolotengopy/novuchat-site/pull/40)

| Tema | Antes (publicado) | Ahora |
|---|---|---|
| Barra superior | «Estamos en la Rueda de Negocios… instalación bonificada» | Sin barra |
| Instalación | USD 65 «una sola vez», bonificada para los diez primeros | USD 65, **pago único por adelantado al inicio del servicio**, llave en mano |
| Planes | sin modalidad | **Prepago mensual** |
| FAQ | — | «¿Cuándo se paga?» |
| `/nosotros` | «Precios en bolivianos — Sin tarifas en dólares» | «Sabes cuánto pagas antes de pagar» |
| `/en` | «In bolivianos» | «Prepaid monthly» |
| Impulso · Citas | «Una agenda» | «1 agenda» |
| CI | — | Regla `pago-confirmado` (prohibición 9) |

## Tres defectos que ya estaban publicados

1. **La barra «se retiraba sola» solo en el comentario.** `hasta` se compara
   con la fecha del build: en un sitio estático, la barra se va con el primer
   despliegue posterior, no antes.
2. **Dos restos del paso a dólares (`v0.3.0`)** que vivían en `src/pages/`, no
   en `src/contenido/`, que es donde se buscó entonces.
3. **El asistente respondía «no lo sé» a «¿cuánto cuesta?» de forma
   intermitente.** El verificador descartó una respuesta por
   `numero-inventado: 1`: el modelo escribió una cifra que la fuente decía con
   palabra. Con la cifra en la fuente, 13/13. Al ser intermitente, una corrida
   buena no prueba del todo la causa.

## La prohibición 9, ahora en el CI

Las presentaciones 7 y 8 trajeron de vuelta «¡Pago confirmado!» y «asegurar el
pago exitosamente». Hasta este pase solo lo impedía que alguien se acordara.
`verificar-prohibiciones.mjs` rechaza esas frases y sus variantes en `src/`, de
donde salen las páginas y el corpus del asistente. **Probado con las dos frases
textuales en un archivo temporal**: las detecta; sobre el árbol real, cero
hallazgos.

## Evidencia (contra producción)

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Las 18 páginas del sitemap | Ninguna contiene «pago confirmado», «asegurar el pago», «pago exitoso», «transferencia exitosa», «Rueda de Negocios» ni «bonificad» |
| 2 | Textos nuevos | «Servicio prepago mensual» en `/precios`; «por adelantado, al inicio del servicio» en `/`, `/precios`, `/preguntas-frecuentes`; «Sabes cuánto pagas…» en `/nosotros`; «Prepaid monthly» en `/en` y `/en/precios` |
| 3 | Asistente publicado (navegador, App Check) | «¿el asistente le confirma el pago?» → «No, el asistente no confirma el pago. Quien valida el comprobante eres tú, y quien confirma que entró la plata es tu banco.» |
| 4 | Asistente publicado | «¿Cuánto cuesta la instalación y cuándo se paga?» → «USD 65 y es un pago único que se hace por adelantado, al inicio del servicio…» |
| 5 | Cloud Run | `asistente-00014-xuh` · `lead-00014-zoq`, 100 % del tráfico, `us-east1` |
| 6 | Pruebas | `pnpm verificar`: 67 unidad · 74 humo · CSP · prohibiciones. `pnpm listo` sin pendientes. Vertex 13/13 |
| 7 | CI del PR #40 | Todo en verde, incluido OWASP ZAP |
| 8 | Tag | `git tag -v v0.3.2` → firma correcta |

## Plan de rollback

Estado anterior: `v0.3.1`, Cloud Run `asistente-00013-rel` · `lead-00013-piq`.

```bash
firebase hosting:clone novuchat-site:previa novuchat-site:live
gcloud run services update-traffic asistente --region us-east1 --project novuchat-site --to-revisions asistente-00013-rel=100
gcloud run services update-traffic lead --region us-east1 --project novuchat-site --to-revisions lead-00013-piq=100
```

Las Functions no cambiaron de código en este pase, solo el índice del
asistente: el rollback de Hosting basta salvo que falle el asistente.

## Riesgos vigentes

| Asunto | Estado |
|---|---|
| **Identidad legal provisional** | AAB1 / NIT 2441214012, a sustituir por el NIT propio de NovuChat |
| **Umbral del asistente** | `pnpm rag:calibrar` sugiere 0,70 (los grupos del corpus se solapan); sigue en 0,64. Pendiente de decisión |
| **«Cobra por QR»** en la portada | El asistente manda el QR y recibe el comprobante; cobra el banco. Andres decidió mantenerlo (2026-09-11) |
| **Precio del segundo camino** | La FAQ dice «se contrata un plan para cada uno» sin decir si tiene precio distinto |
| **Desarrollo local sin Functions** | Decisión consciente (`CLAUDE.md`): el camino de llamada del cliente no se ejercita en local |
| CVE-2026-41907 (`uuid`, MEDIA) | Excepción vigente, vence 2026-12-01 |
| TypeScript 6 | `@astrojs/check` no lo admite de verdad |
| Leads de prueba | Rotulados, se conservan como evidencia (conteo no revisado desde `v0.2.6`) |

**Se cierra** el riesgo «token de depuración de App Check sin registrar» del
acta de `v0.2.6`: no era lo que bloqueaba el desarrollo local (lo bloquea el
`cors`) y quedó como recomendación en `CLAUDE.md`.
