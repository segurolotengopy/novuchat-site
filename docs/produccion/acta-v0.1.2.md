# Acta de pase a producción — novuchat.site — v0.1.2 — 2026-09-03

Commit: `e357d8b` · Tag: `v0.1.2` (firmado, ED25519, verificado)
Run: [33789833644](https://github.com/segurolotengopy/novuchat-site/actions/runs/33789833644) · Modo: A
Preparado y verificado por: Claude Code · Aprobó el despliegue: Andres Alberdi
Revisó las PR: `AndresAlberdi` · Fusionó: Claude Code, con la aprobación registrada

## Veredicto: el pase se ejecutó. El sitio está en producción.

Verificado **contra la nube**, no contra el registro del pipeline — que en este
mismo pase demostró que puede decir «Producción desplegada» sin haber publicado
nada.

## Evidencia

| # | Comprobación | Resultado |
|---|---|---|
| 1 | `novuchat.site`, `www`, `.web.app`, `/precios`, `/en/`, `/privacidad` | 200 |
| 2 | Publicación en canal `live` | `FINALIZED` — «producción v0.1.2 (run 33789833644)» |
| 3 | Cabeceras reales servidas | CSP con hashes, HSTS `preload`, COOP, `X-Frame-Options: DENY`, `nosniff`, Permissions-Policy |
| 4 | Functions en `us-east1` | `asistente` y `lead`, `ACTIVE`, gen2 |
| 5 | Asistente de punta a punta contra Vertex real | responde con datos del corpus: «Impulso, 250 Bs al mes, 300 conversaciones» |
| 6 | `lead` invocable y validando | rechaza payload vacío y correo inválido con su propio mensaje |
| 7 | Índice compuesto `leads(huellaCorreo, creado)` | `READY` |
| 8 | Reglas de Firestore | publicadas |
| 9 | Canal `previa` (rollback) | existe, **vacío** |

## Riesgos aceptados, vigentes

| Asunto | Estado | Cuándo se cierra |
|---|---|---|
| **Sin rollback automático** | El canal `previa` está vacío: cuando corrió el pase no había nada en `live` que copiar | Desde el próximo pase hay copia |
| **App Check en monitoreo** | `enforceAppCheck: false` en ambas funciones, decisión documentada (doc 04 §4) | Tras una semana sin falsos positivos |
| **SA de ejecución con `roles/editor`** | Es el de cómputo por defecto; le bastaría `datastore.user` + `aiplatform.user` | Mejora propuesta con cuenta dedicada |
| CVE-2026-41907 (`uuid`, MEDIA) | Excepción registrada | 2026-12-01 |

## Lo que costó cinco intentos

Ningún fallo fue del código del sitio. Todos eran condiciones del entorno o de
la plantilla del estándar, y cada uno escondía al siguiente:

1. `pnpm` ausente en el job de despliegue → el hook `predeploy` moría (PR #6).
2. `deploy-production` sin `datastore.indexAdmin` → no podía crear el índice.
3. `cloudbilling.googleapis.com` sin habilitar → `firebase-tools` intentaba
   habilitarla y no tenía permiso. Resuelto habilitándola una vez, en vez de
   darle a la CI la capacidad de habilitar APIs.
4. `@google-cloud/functions-framework` ausente → el buildpack lo exige con pnpm
   (PR #7).
5. Política de limpieza de Artifact Registry sin definir → `firebase deploy`
   pedía `--force`, que la prohibición 10 descarta. Resuelto aplicándola una vez
   con `firebase functions:artifacts:setpolicy`.

Y dos fallos que el pipeline no reportó:

- **El paso de despliegue dio verde con todo caído** (PR #7 lo corrige).
- **`lead` quedó sin `allUsers`** por haber sido *actualizada* y no *creada*:
  devolvía 403 a todo el mundo, con el formulario del sitio muerto, y el
  pipeline en verde.

## Endurecimiento aplicado durante el pase

- `TAG_FIRMADO_REQUERIDO = true`: la firma del tag pasa a ser un control que el
  pipeline verifica, no documentación. Antes se firmaba sin que nada lo mirara.
- El paso de despliegue falla ante marcas de fallo en su propia salida.
- `cors` restringido a los tres orígenes del sitio en ambas funciones.

## Pendientes

1. Ejercitar el formulario de contacto real desde el sitio, con `FORMSUBMIT_ALIAS`
   configurado (hoy es el marcador `sin-configurar`, así que no notifica).
2. Pasar App Check a `enforceAppCheck: true` tras la semana de monitoreo.
3. Cuenta de servicio dedicada para las Functions, sin `roles/editor`.
4. Sustituir la identidad legal provisional (AAB1 / NIT 2441214012) por el NIT
   propio de NovuChat.
5. Subir los ocho defectos del estándar a `~/SeguridadGeneral`.
