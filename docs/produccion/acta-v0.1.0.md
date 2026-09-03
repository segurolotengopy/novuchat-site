# Acta de pase a producción — novuchat.site — v0.1.0 — 2026-09-02

**Alcance:** primer despliegue de las Cloud Functions `lead` y `asistente`.
**Commit candidato:** `chore/estandar-devsecops` (PR #1), **sin fusionar a `main`**.
**Modo:** A (repositorio público). **Un solo ambiente** (decisión de Andres, 2026-09-03).
**Preparado por:** Claude Code (habilidad `pase-a-produccion`).
**Aprueba:** Andres Alberdi — **pendiente**.

> ## Veredicto: el pase NO debe proceder todavía.
>
> El pipeline **ya termina en verde** (run 33707636099, `compuerta-pr` incluida),
> pero **cuatro controles bloqueantes siguen en rojo**. Ninguno es un defecto del
> código: son piezas de gobernanza e identidad federada que todavía no existen.
> Están en la sección «Pendientes», con lo que hace falta para cerrarlas.

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
| REP-01 | Manifiesto `.devsecops.yml` completo | **Verde** | `modo: A`, `cobertura_minima: 70`, 2 ambientes, 1 excepción vigente |
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
| PIP-01 | Run completo en verde del workflow del stack | **Ámbar** | Run [33707636099](https://github.com/segurolotengopy/novuchat-site/actions/runs/33707636099) **en verde de punta a punta**, incluida `compuerta-pr` — pero sobre la rama, no sobre `main`: la PR #1 sigue sin fusionar |
| PIP-02 | Acciones fijadas por SHA | **Verde** | Ninguna referencia `uses:` sin SHA de 40 caracteres |
| PIP-05 | `seguridad-estatica` sin CRITICAL/HIGH | **Verde** | Run 33707636099: Gitleaks, Semgrep y SCA en verde. En local, `./security-local.sh` → `CRITICAL=0 HIGH=0 MEDIUM=7` |
| PIP-06 | Cobertura ≥ 70 % | **Verde**, al límite | 70,19 % de sentencias · 70,83 % de líneas · 58,57 % de ramas |
| PIP-09 | DAST y humo | **No verificado** | Ahora corre contra el canal de vista previa del PR; necesita los secretos de WIF para desplegarlo |
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
| Secretos de despliegue | **Rojo** | `gh secret list` vacío: faltan `GCP_WIF_PROVIDER` y `GCP_SA_DEPLOY_PROD`. Con un solo ambiente ya no hace falta `GCP_SA_DEPLOY_STAGING` |

---

## 4. Riesgos aceptados

| id | herramienta | vence | justificación |
|---|---|---|---|
| CVE-2026-41907 | trivy | 2026-12-01 | `uuid@9.0.1` llega por `firebase-admin > @google-cloud/storage > gaxios > uuid`. **No hay versión parcheada alcanzable**: gaxios 6.x fija `uuid ^9` y firebase-admin 14.3.0 es la última publicada. El impacto en este proyecto es nulo: las Functions no generan identificadores con uuid, solo lo usa el SDK internamente |

Vence dentro de los 90 días que exige el estándar y queda registrada en
`.devsecops.yml`, no silenciada en la herramienta.

---

## 5. Defectos corregidos para llegar hasta aquí

El pipeline nunca había terminado en verde. Seis causas, todas reales:

| # | Causa | Corrección |
|---|---|---|
| 1 | Faltaba `@vitest/coverage-v8`: el job de cobertura no arrancaba | Dependencia agregada |
| 2 | El build fallaba sin `PUBLIC_URL_CONSOLA`. Es el comportamiento correcto —el sitio prefiere romper la compilación antes que publicar un enlace fuera de la lista blanca— pero el runner no tenía de dónde leerlo | Los `PUBLIC_*` pasan a variables del repositorio y se inyectan en el job |
| 3 | `secrets: inherit` entregaba **todos** los secretos al workflow reutilizable, que solo necesita dos. Semgrep lo marcaba y tenía razón | Se pasan uno por uno |
| 4 | Cuatro falsos positivos `react-insecure-request` por las URL `http://127.0.0.1` de los emuladores | `nosemgrep` en la línea, con el motivo junto al código |
| 5 | El emulador de Firestore exige JDK 21 y el runner traía uno anterior. Después, `test:rules` levantaba un **segundo** emulador sobre el que ya levanta el CI: «port taken» | `JAVA_HOME` al JDK 21 de la imagen; la suite se conecta al emulador que encuentre en vez de levantar el suyo |
| 6 | CVE-2026-41907 en `uuid`: **el Trivy del CI la clasifica HIGH y el local, MEDIA**. Por eso `security-local.sh` salía limpio y el pipeline seguía rojo | Excepción registrada con vencimiento (sección 4) |

### Defecto del estándar compartido

Investigando el punto 6 apareció otro problema, que **no era la causa pero sí es
un defecto**: `.github/trivy.yaml` declaraba `severity: [CRITICAL, HIGH, MEDIUM]`,
y el archivo de configuración de Trivy **tiene prioridad sobre el parámetro del
workflow**. Con eso, `bloquear_en: CRITICAL,HIGH` del manifiesto no significa
nada y cualquier hallazgo MEDIUM rompe el pipeline. Se corrigió aquí quitando la
declaración.

**Afecta a cualquier proyecto que use el estándar.** Conviene llevarlo a
`~/SeguridadGeneral/02-pipelines/`.

---

## 5bis. Simplificación a un solo ambiente (2026-09-03)

La plantilla del estándar asume staging y producción en **proyectos distintos**.
Aquí los dos apuntaban al mismo proyecto y al mismo sitio en vivo: «staging» no
aislaba nada y hacía creer que sí, que es la peor combinación posible en un
pipeline. Se retiró.

| Antes | Ahora |
|---|---|
| `construir` en matriz staging + production | un solo artefacto `dist-production` |
| `desplegar-staging` al fusionar a `main` | **fusionar no publica nada** |
| DAST contra `STAGING_URL` (el sitio en vivo) | DAST contra el canal de vista previa del PR, **antes** de fusionar |
| Dos cuentas de servicio y dos secretos | una cuenta y un secreto |
| Entornos `staging` y `production` | solo `production`, con revisor |

Lo que se gana: el mismo artefacto que se analiza es el que se despliega, y se
analiza cuando el hallazgo todavía sale barato. Lo que se pierde: no hay una
prueba de humo contra producción *antes* del tag; la cubre el health check de
`post-despliegue`, con rollback automático al canal `previa`.

También se corrigió `HEALTH_PATH`, que apuntaba a `/healthz`. El sitio es
estático y no tiene esa ruta: el health check habría devuelto 404 y disparado un
rollback en un despliegue correcto.

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
   `~/SeguridadGeneral/03-scripts/setup-oidc-gcp.sh --ambiente prod` y cargar
   `GCP_WIF_PROVIDER` y `GCP_SA_DEPLOY_PROD`. Con un solo ambiente basta una
   cuenta de servicio.
2. **`probar-identidad` en verde.** El workflow ya está en el repositorio; se
   relanza la ejecución del PR una vez existan los secretos.
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
