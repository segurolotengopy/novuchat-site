# Acta de pase a producción — novuchat.site — v0.1.3 — 2026-09-04

Commit: `ae496cc` · Tag: `v0.1.3` (firmado, ED25519, verificado por el pipeline)
Run: [33868574077](https://github.com/segurolotengopy/novuchat-site/actions/runs/33868574077) · Modo: A
Aprobó el despliegue: Andres Alberdi · Revisó la PR #9: `AndresAlberdi`

## Veredicto: pase limpio. Primero sin incidencias.

A diferencia de `v0.1.2`, que costó cinco intentos, este desplegó a la primera.
Los tropiezos anteriores eran del entorno y quedaron cerrados.

Y por primera vez la firma del tag **se verificó**: `TAG_FIRMADO_REQUERIDO`
pasó a `true` durante el pase anterior, así que ahora un tag sin firma se
rechaza antes de la compuerta, no después.

## Qué corrige esta versión

| Corrección | Verificación en producción |
|---|---|
| **Banner de consentimiento** — `[hidden]` no lo ocultaba porque `.consentimiento` declara `display: flex`, y cualquier `display` de autor gana a la regla del navegador | visitante nuevo → `display: flex`; tras elegir → `display: none`; al navegar a `/precios` → sigue oculto |
| **CORS sin restringir** — `onCall` reflejaba cualquier origen | origen ajeno → **sin cabecera** (bloqueado); `novuchat.site` → permitido; el asistente sigue respondiendo |
| **`CODEOWNERS` con una sola cuenta** — dejaba PR imposibles de aprobar si la autoría se invertía | ya en `main` con las dos cuentas |

## Evidencia

| # | Comprobación | Resultado |
|---|---|---|
| 1 | `novuchat.site`, `www`, `/precios` | 200 |
| 2 | Canal `live` | `FINALIZED` — «producción v0.1.3 (run 33868574077)» |
| 3 | **Canal `previa` (rollback)** | **con publicación de 2026-09-04T12:02:22Z** |
| 4 | Cabeceras de seguridad | 3/3 (CSP, HSTS, X-Frame-Options) |
| 5 | Functions `us-east1` | `asistente` y `lead` `ACTIVE` |
| 6 | Asistente contra Vertex real | responde con datos del corpus y rotula «próximamente» lo que no existe |
| 7 | Flujo de consentimiento completo | correcto en las tres fases |

## Riesgo cerrado desde el acta anterior

**Ya hay rollback automático.** El canal `previa` tiene copia de la versión
anterior. En `v0.1.2` estaba vacío porque cuando corrió no había nada en `live`;
ese era el único pase sin vuelta atrás.

## Riesgos aceptados, vigentes

| Asunto | Estado |
|---|---|
| **App Check en monitoreo** | `enforceAppCheck: false`, decisión documentada (doc 04 §4). Ahora el CORS restringido compensa en parte: un sitio ajeno ya no puede llamar desde el navegador |
| **`FORMSUBMIT_ALIAS` sin configurar** | El lead se guarda en Firestore pero **no llega correo**. Lo más urgente si se va a mandar tráfico |
| **SA de ejecución con `roles/editor`** | Le bastaría `datastore.user` + `aiplatform.user` |
| **Identidad legal provisional** | AAB1 / NIT 2441214012 hasta el NIT propio de NovuChat |
| CVE-2026-41907 (`uuid`, MEDIA) | Excepción registrada, vence 2026-12-01 |

## Pendientes

1. Configurar `FORMSUBMIT_ALIAS` y ejercitar el formulario real de punta a punta.
2. Pasar App Check a `enforceAppCheck: true` tras la semana de monitoreo.
3. Cuenta de servicio dedicada para las Functions.
4. Subir los ocho defectos del estándar a `~/SeguridadGeneral`.
5. Revisar las PR de Dependabot abiertas (#2, #4, #5), la primera cosecha desde
   que quedó operativo.
