# Acta de pase a producción — novuchat.site — v0.1.4 — 2026-09-04

Commit: `732aa17` · Tag: `v0.1.4` (firmado, ED25519, verificado por el pipeline)
Run: [33916983812](https://github.com/segurolotengopy/novuchat-site/actions/runs/33916983812) · Modo: A
Aprobó el despliegue: Andres Alberdi (`segurolotengopy`) · Revisó la PR #12: `AndresAlberdi`

## Veredicto: desplegado y verificado en ejecución.

Este pase no cambia lo que el sitio muestra: cambia **con qué identidad corren
las Functions**. Por eso la verificación no se detuvo en que el job diera verde
—un permiso corto no se ve como despliegue fallido, sino como funciones que
arrancan bien y fallan al ejecutarse—.

## Qué cambia

Las Functions gen2 corrían con la cuenta de cómputo del proyecto, que lleva
`roles/editor`: escritura sobre casi todo. Contradecía el resto del diseño —las
reglas de Firestore niegan todo al cliente precisamente para que solo estas dos
funciones escriban— y ampliaba el alcance de cualquier fallo al proyecto entero
en vez de a tres colecciones.

Ahora corren con `novuchat-functions@novuchat-site.iam.gserviceaccount.com`, con
permisos deducidos de lo que el código usa de verdad:

| Rol | Para qué |
|---|---|
| `roles/datastore.user` | `leads`, `conversacionesAsistente`, `turnos` |
| `roles/aiplatform.user` | Vertex AI por ADC |
| `roles/logging.logWriter` | `functions.logger` |
| `roles/monitoring.metricWriter` | métricas de Cloud Run |
| `roles/secretmanager.secretAccessor` | **por secreto**: solo `SAL_HASH` y `FORMSUBMIT_ALIAS` |

Deja de poder: desplegar, tocar IAM, leer otros secretos, borrar la base de
datos, modificar reglas o cambiar hosting.

## Evidencia, verificada contra la nube

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Identidad de ejecución de ambas Functions | `novuchat-functions@…` en `asistente` y en `lead` |
| 2 | Estado de las Functions | `ACTIVE`, gen2, `us-east1` |
| 3 | **Vertex con la cuenta nueva** | respondió «800 Bs… a medida arranca en 1.500 Bs», correcto según el corpus |
| 4 | **Secretos accesibles** | `lead` arranca y valida con su propio mensaje |
| 5 | **Registros** | llegan de ambas (`INFO`, `DEBUG`, `WARNING`) |
| 6 | Sitio | `novuchat.site` → 200 |
| 7 | Canal `live` | `FINALIZED` — «producción v0.1.4 (run 33916983812)» |
| 8 | Canal `previa` (rollback) | refrescado a 2026-09-04T21:05:55Z |

El punto 5 era el riesgo concreto: sin `logging.logWriter` todo responde igual y
los registros desaparecen sin que nada avise.

## Incidencia del pase, sin consecuencias

El primer intento de aprobación falló con `422 — No pending deployment requests
to approve or reject`. No era del despliegue: el revisor del Environment es
`segurolotengopy` y el comando salió con `AndresAlberdi`, para quien
efectivamente no había nada que aprobar. Se repitió anteponiendo
`GH_CONFIG_DIR=$HOME/.config/gh-pro`, que es la vía que no muta estado
compartido. El run quedó intacto mientras tanto.

## Riesgo abierto que introduce este pase

**La cuenta de cómputo por defecto conserva `roles/editor`** sobre el proyecto:

```
50331646927-compute@developer.gserviceaccount.com
  roles/aiplatform.user
  roles/editor
```

Ya no la usa nada de este sitio, pero mientras siga ahí el trabajo está a
medias: queda una identidad con permiso de editor sobre todo el proyecto, sin
dueño claro, que **cualquier recurso nuevo de Compute o Cloud Run adoptaría por
defecto** sin que nadie lo decida.

Revocarlo es destructivo y puede afectar a otros servicios del proyecto, así que
no se hizo en el mismo pase. Comprobar primero quién más la usa; si nadie:

```bash
gcloud projects remove-iam-policy-binding novuchat-site \
  --member="serviceAccount:50331646927-compute@developer.gserviceaccount.com" \
  --role="roles/editor"
```

## Riesgos aceptados, vigentes

| Asunto | Estado |
|---|---|
| **`FORMSUBMIT_ALIAS` sin configurar** | El lead se guarda en Firestore pero **no llega correo**. Lo más urgente si se manda tráfico |
| **App Check en monitoreo** | `enforceAppCheck: false` (doc 04 §4). El CORS restringido de v0.1.3 compensa en parte |
| **Identidad legal provisional** | AAB1 / NIT 2441214012 hasta el NIT propio de NovuChat |
| CVE-2026-41907 (`uuid`, MEDIA) | Excepción registrada, vence 2026-12-01 |
| TypeScript 6 | Excepción en `dependabot.yml`: `@astrojs/check` no lo admite de verdad. Revisar 2026-12-01 |

## Pendientes

1. Configurar `FORMSUBMIT_ALIAS` y ejercitar el formulario de punta a punta.
2. Retirar `roles/editor` de la cuenta de cómputo por defecto.
3. Pasar App Check a `enforceAppCheck: true` tras la semana de monitoreo.
4. Cerrar la PR #2 (TypeScript 6), que no debe fusionarse.
