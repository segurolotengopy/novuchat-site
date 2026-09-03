# Acta de pase a producción — novuchat.site — v0.1.0 — 2026-09-02

**Alcance:** primer despliegue de las Cloud Functions `lead` y `asistente`.
**Commit candidato:** `chore/estandar-devsecops` (PR #1), **sin fusionar a `main`**.
**Modo:** A (repositorio público).
**Preparado por:** Claude Code (habilidad `pase-a-produccion`).
**Aprueba:** Andres Alberdi — **pendiente**.

> ## Veredicto: el pase NO debe proceder todavía.
>
> Cinco controles bloqueantes están en rojo. Ninguno es un defecto del código:
> son piezas de gobernanza y de identidad federada que aún no existen. Están
> listados en la sección «Pendientes», con lo que hace falta para cerrarlos.

---

## 1. Versión propuesta y por qué

No hay tags previos: este sería el primero. Los commits desde el inicio incluyen
`feat`, `fix`, `ci`, `test`, `docs` y `chore`, sin ningún `BREAKING CHANGE`.

Se propone **v0.1.0**, no v1.0.0, por dos razones:

1. El doc 06 reserva `v1.0.0` para el lanzamiento público, que exige el
   contenido comercial definitivo y las páginas legales completas.
2. `pnpm listo` está en rojo: falta la razón social y el NIT de NovuChat, que
   `/privacidad` y `/terminos` necesitan y que la verificación de negocio de
   Meta exige.

---

## 2. Cambios incluidos

- `ci`: estándar DevSecOps v2 (stack `node-firebase`, modo A).
- `feat`: esqueleto Astro 7 con CSP real, `firestore.rules` de negación total y
  verificadores propios.
- `feat`: sistema de diseño, contenido y 18 rutas.
- `feat`: conmutador de rubro; carrusel de ejemplos.
- `feat`: backend con RAG estricto, Functions `lead` y `asistente`, islas Preact.
- `feat`: Vertex AI en lugar de la API de AI Studio; umbral del RAG medido.
- `test`: la Function `lead` probada contra el emulador.
- `chore`: retención (TTL), acceso (IAM) y canal de vista previa.
- `ci`: correcciones para que el pipeline llegue a verde.

---

## 3. Checklist

### Repositorio y Git

| ID | Control | Estado | Evidencia |
|---|---|---|---|
| REP-01 | Manifiesto `.devsecops.yml` completo | **Verde** | `modo: A`, `cobertura_minima: 70`, 2 ambientes, 0 excepciones |
| REP-02 | Ruleset de `main` con PR, historial lineal y check `compuerta-pr` | **Verde** | `proteger-main` activo: `deletion`, `non_fast_forward`, `required_linear_history`, `pull_request`, `required_status_checks → compuerta-pr` |
| REP-03 | Revisores requeridos | **Verde** | Environment `production` con revisor `segurolotengopy` |
| REP-04 | `CODEOWNERS` cubre rutas críticas | **Verde** | `.github/CODEOWNERS` versionado |
| REP-05 | Historial sin secretos | **Verde** | `gitleaks git --redact --exit-code 1 .` → 13 commits, `no leaks found` |
| REP-06 | Sin `.env`, claves ni `tfvars` versionados | **Verde** | `git ls-files` filtrado: sin resultados (solo `.env.example`) |
| REP-08 | Tag semántico `vX.Y.Z` | **Rojo** | No existe ningún tag. Es el paso final, humano |
| REP-09 | Dependabot activo | **Verde** | `.github/dependabot.yml` con 5 ecosistemas |

### Pipeline

| ID | Control | Estado | Evidencia |
|---|---|---|---|
| PIP-01 | Run completo en verde del workflow del stack | **Rojo** | El pipeline nunca ha corrido sobre `main`; la rama sigue sin fusionar |
| PIP-02 | Acciones fijadas por SHA | **Verde** | Ninguna referencia `uses:` sin SHA de 40 caracteres |
| PIP-05 | `seguridad-estatica` sin CRITICAL/HIGH | **Verde** | `./security-local.sh`: `CRITICAL=0 HIGH=0 MEDIUM=8`, informe en `.security-reports/ultimo/resumen.md` |
| PIP-06 | Cobertura ≥ 70 % | **Verde**, al límite | 70,19 % de sentencias · 70,83 % de líneas · 58,57 % de ramas |
| PIP-09 | DAST y humo | **No verificado** | Depende de `desplegar-staging`, que nunca corrió |
| PIP-10 | Workflow `probar-identidad` en verde | **Rojo** | El archivo no existe en el repositorio |
| PIP-11 | CodeQL activo | **Verde** | `codeql.yml` en verde en cada push de la rama |

### Seguridad de la aplicación

| ID | Control | Estado | Evidencia |
|---|---|---|---|
| — | Secret scanning y push protection | **Verde** | `secret_scanning: enabled`, `secret_scanning_push_protection: enabled` |
| — | Reglas de Firestore | **Verde** | 28 pruebas con el emulador, **cada `assertFails` con documento sembrado** |
| — | Contrato de la Function `lead` | **Verde** | 11 pruebas por HTTP contra el emulador |
| — | Inyección de prompt (S-2) | **Verde** | 10 casos; ninguna respuesta cedida supera el verificador |
| — | Aviso a terceros (S-14) | **Verde** | `construirAviso` no admite campos `_cc`/`_next`/`_replyto` |
| — | Retención de datos | **Verde** | TTL `ACTIVE` sobre `expira` en `turnos` y `limites` |
| — | Sitio con cabeceras reales | **Verde** | Canal de vista previa sin ninguna violación de CSP |

### Requisitos del modo A

| Control | Estado | Evidencia |
|---|---|---|
| Repositorio público | **Verde** | `visibility=PUBLIC` |
| CodeQL y secret scanning | **Verde** | ver arriba |
| Environment `production` con revisor | **Verde** | creado con `segurolotengopy` como revisor |
| Ruleset de `main` con `compuerta-pr` | **Verde** | ver REP-02 |
| Secretos de despliegue | **Rojo** | `gh secret list` vacío: faltan `GCP_WIF_PROVIDER`, `GCP_SA_DEPLOY_STAGING`, `GCP_SA_DEPLOY_PROD` |

---

## 4. Riesgos aceptados

Ninguna excepción registrada en `.devsecops.yml`. Se anota un hallazgo
**no bloqueante** para seguimiento:

| Hallazgo | Severidad | Estado |
|---|---|---|
| CVE-2026-41907 en `uuid@9.0.1`, transitiva de `firebase-admin` | MEDIA | Sin versión parcheada disponible aguas arriba. Se revisará cuando `firebase-admin` actualice `gaxios` |

---

## 5. Defecto del estándar detectado en esta preparación

`.github/trivy.yaml` declaraba `severity: [CRITICAL, HIGH, MEDIUM]`, y el archivo
de configuración de Trivy **tiene prioridad sobre el parámetro del workflow**.
El efecto es que `bloquear_en: CRITICAL,HIGH` del manifiesto no significaba nada:
cualquier hallazgo MEDIUM rompía el pipeline. Se corrigió en este repositorio
quitando la declaración.

**Afecta a cualquier proyecto que use el estándar** y conviene llevarlo a
`~/SeguridadGeneral/02-pipelines/`.

---

## 6. Plan de rollback

**No hay nada que revertir:** `gcloud run services list --project novuchat-site`
devuelve vacío. Este sería el primer despliegue.

Para el siguiente release, los comandos quedan preparados:

```bash
# Identificar la revisión activa antes de desplegar
gcloud run services describe lead --region us-east1 --project novuchat-site --format='value(status.latestReadyRevisionName)'
```

```bash
# Volver atrás
gcloud run services update-traffic lead --region us-east1 --project novuchat-site --to-revisions <REVISION>=100
```

El sitio estático se revierte por canal:

```bash
firebase hosting:clone novuchat-site:previa novuchat-site:live --project novuchat-site
```

---

## 7. Pendientes antes de aprobar

1. **Identidad federada (WIF).** Sin esto no hay despliegue posible desde el
   pipeline y la alternativa —una clave JSON— está prohibida. Ejecutar
   `~/SeguridadGeneral/03-scripts/setup-oidc-gcp.sh` y cargar
   `GCP_WIF_PROVIDER`, `GCP_SA_DEPLOY_STAGING` y `GCP_SA_DEPLOY_PROD`.
2. **Workflow `probar-identidad`** (plantilla del doc 02 del estándar) en verde
   para `production`.
3. **Fusionar la PR #1 a `main`** y que el pipeline complete un run verde ahí.
4. **Razón social y NIT de NovuChat** en `src/contenido/pendientes.ts`, hasta que
   `pnpm listo` pase.
5. **Crear el tag**, que es el paso humano de la sección 8.

---

## 8. Comandos del pase (los ejecuta una persona, no Claude Code)

```bash
git checkout main && git pull --ff-only
```

```bash
git tag -s v0.1.0 -m "Release v0.1.0 — novuchat.site"
```

```bash
git push origin v0.1.0
```

En modo A, el push del tag dispara `desplegar-produccion` del
`ci-node-firebase.yml`, y hay que **aprobar el Environment `production`** en ese
run.

`vars.TAG_FIRMADO_REQUERIDO` está en `false`, así que la firma no es obligatoria;
`-s` se recomienda igual. Si `git config user.signingkey` no está configurada,
hay que hacerlo antes o crear el tag sin `-s`.

**Con cinco controles bloqueantes en rojo, este pase no debe ejecutarse aunque
los comandos estén a mano.**
