# Defectos encontrados en el estándar DevSecOps v2

Corregidos **en local** en este repositorio. Los dos afectan a cualquier
proyecto que aplique el estándar, así que conviene subirlos a
`~/SeguridadGeneral`. Este repositorio no modifica esa ruta.

Fecha: 2026-09-03 · Detectados aplicando el estándar a `novuchat-site`.

---

## 1. `.github/trivy.yaml` anula `bloquear_en` del manifiesto

**Archivo del estándar:** `.github/trivy.yaml` (v2.0, 2026-08-24).

El archivo declara un bloque `severity`. La configuración de Trivy **tiene
prioridad sobre el parámetro del workflow**, así que el `bloquear_en:
CRITICAL,HIGH` de `.devsecops.yml` deja de aplicarse: cualquier hallazgo MEDIUM
rompe el pipeline.

**Cómo se destapó.** CVE-2026-41907 (severidad MEDIA) en `uuid@9.0.1`,
transitiva de `firebase-admin`, sin versión parcheada aguas arriba. Bloqueaba
todos los runs sin que hubiera un solo hallazgo CRITICAL ni HIGH.

**Corrección aplicada:** eliminar el bloque `severity` del archivo y dejar que
mande el workflow. La explicación quedó como comentario en el propio archivo.

**Síntoma para reconocerlo en otro repositorio:** el job `seguridad-estatica`
en rojo con un resumen que solo lista MEDIUM o LOW.

---

## 2. La acción de ZAP no respeta `zap-rules.tsv`

**Archivos del estándar:** `.github/workflows/_reusable-dast.yml`,
`.github/zap-rules.tsv`.

Los dos documentan el mismo contrato: `FAIL` falla el job, `WARN` reporta sin
fallar, `IGNORE` calla. El comentario del workflow lo dice literalmente
(«fail_action: true → el job falla si alguna regla marcada FAIL en rules.tsv
dispara») y la cabecera del TSV también.

**La acción no se comporta así.** `zaproxy/action-baseline` con
`fail_action: true` falla ante **cualquier** alerta, WARN incluidas; con
`false` no falla nunca. En la práctica el archivo de reglas solo servía para
silenciar con `IGNORE`, y las 41 reglas marcadas `FAIL` no hacían nada que no
hicieran las demás.

**Cómo se destapó.** El job en rojo con `FAIL-NEW: 0`, `WARN-NEW: 9`,
`PASS: 61`: nueve avisos informativos —cabeceras de caché, `Sec-Fetch-Dest`,
`style-src unsafe-inline`, este último documentado y aceptado— bloqueando la
fusión sin un solo fallo.

**Por qué no se resolvió con `IGNORE`.** Habría puesto el job en verde borrando
los nueve avisos del informe. Un aviso que deja de verse deja de revisarse, y
entre esos nueve hay tres que sí tocan decisiones de arquitectura (ver
`docs/csp.md`, «Avisos de OWASP ZAP relacionados con cabeceras»).

**Corrección aplicada:** `fail_action: false` en los dos pasos de ZAP, y un paso
nuevo que evalúa el informe contra el TSV —
`.github/scripts/evaluar-zap.py`, que cruza los `pluginid` del
`report_json.json` con los IDs marcados `FAIL`—. El contrato documentado pasa a
cumplirse de verdad: los avisos siguen imprimiéndose, solo bloquean los `FAIL`.

**Verificación:** probado con dos informes sintéticos — los nueve avisos reales
salen con código 0; los mismos nueve más una alerta `10020`
(anti-clickjacking, marcada `FAIL`) salen con código 1 y un `::error::`.

---

## Recomendación

Llevar las dos correcciones al estándar. La segunda incluye un archivo nuevo
(`.github/scripts/evaluar-zap.py`), que el `bootstrap-repo.sh` tendría que
copiar junto con `zap-rules.tsv`.

---

## 3. `CODEOWNERS` llega sin rellenar y bloquea el repositorio

**Archivos del estándar:** `.github/CODEOWNERS`, `bootstrap-repo.sh`, ruleset
`proteger-main`.

La plantilla nombra equipos de marcador —`@ORG/desarrollo`, `@ORG/plataforma`,
`@ORG/seguridad`— y `bootstrap-repo.sh` no los sustituye por nada. A la vez, el
ruleset que crea el propio bootstrap activa `require_code_owner_review: true`.

**El resultado es un bloqueo sin salida.** GitHub busca un propietario válido
para las rutas tocadas, no encuentra ninguno porque esos equipos no existen, y
entonces **ninguna aprobación satisface el requisito**. La PR queda en `BLOCKED`
con una aprobación legítima ya registrada y sin ningún mensaje que explique por
qué. Es especialmente confuso porque `reviewDecision` se queda en `null` en vez
de decir `REVIEW_REQUIRED`.

**Cómo se destapó.** PR #1 de `novuchat-site`: aprobada por `@AndresAlberdi`
sobre el commit correcto, con los 20 checks en verde, y aun así sin poder
fusionarse.

**Corrección aplicada:** reescribir `CODEOWNERS` con la cuenta real y quitar las
rutas que no existen en el proyecto (`/infra/`, `/Dockerfile`, `/.aws/`,
`/src/auth/`, `/pyproject.toml`, etc.).

**Recomendación para el estándar:** que `bootstrap-repo.sh` pregunte por los
propietarios y falle si quedan marcadores `@ORG/`, o que no active
`require_code_owner_review` mientras el archivo tenga marcadores sin sustituir.

**Aviso de operación:** el ruleset trae también
`dismiss_stale_reviews_on_push: true`, así que corregir `CODEOWNERS` invalida
las aprobaciones existentes y hay que volver a aprobar. No hay forma de evitarlo:
el arreglo es en sí mismo un push.

---

## 4. `dependabot.yml` sin `cooldown` (hallazgo de Semgrep, no defecto de diseño)

La plantilla no declara `cooldown` en ninguno de sus cinco ecosistemas, y el
propio SAST del estándar lo marca (`dependabot-missing-cooldown`), cinco veces,
como hilos de revisión sin resolver. Con
`required_review_thread_resolution: true` en el ruleset, esos hilos **también
bloquean la fusión**, así que el estándar se marca a sí mismo y se bloquea solo.

Corregido añadiendo `cooldown` a los cinco ecosistemas (mayor 30 días, menor 7,
parche 3). Conviene llevarlo a la plantilla.

---

## 5. `dependabot.yml` con `ignore` vacío: Dependabot rechaza el archivo entero

La plantilla trae, en la entrada de npm:

```yaml
    ignore:
      # Ejemplo de excepción con justificación (revisar cada trimestre):
      # - dependency-name: "firebase"
      #   update-types: ["version-update:semver-major"]
      []
```

Ese `[]` hace fallar la validación de Dependabot:

```
The property '#/updates/1/ignore' did not contain a minimum number of items 1
```

**Y el archivo se rechaza entero**, así que **Dependabot no corre en absoluto**:
ni actualizaciones de seguridad, ni de versiones, en ningún ecosistema. El
repositorio parece tener gestión de dependencias y no la tiene.

Es el más silencioso de los cinco. No rompe el pipeline —la validación de
Dependabot no es un check obligatorio—, solo deja la PR en `UNSTABLE`, que es
fácil confundir con «checks todavía corriendo». Se descubrió porque `UNSTABLE`
persistía con todo lo demás en verde.

**Corrección aplicada:** quitar la clave `ignore` y dejar el ejemplo comentado.
Una lista de excepciones vacía no significa nada; la ausencia de la clave sí.

**Recomendación para el estándar:** quitar el `[]` de la plantilla y validar
`dependabot.yml` en el bootstrap contra el esquema de Dependabot.

---

## 6. `dependabot.yml` declara ecosistemas que el proyecto no tiene

La plantilla trae los cinco ecosistemas —github-actions, npm, pip, docker,
terraform— para cualquier repositorio. **Dependabot no ignora los que no
aplican:** intenta actualizarlos, no encuentra manifiesto y falla.

```
ERROR Error during file fetching; aborting: No Dockerfiles nor Kubernetes YAML found in /
```

En este proyecto —que no tiene Dockerfile, ni `requirements.txt`, ni `/infra`—
son tres runs en rojo por semana, indefinidamente. Se descubrió al fusionar la
PR #1: en cuanto el archivo dejó de estar mal formado (defecto 5), Dependabot
arrancó por primera vez y falló de inmediato.

**Corrección aplicada:** dejar solo `github-actions` y `npm`, con una nota de por
qué y cuándo volver a añadir los otros.

**Recomendación para el estándar:** que `bootstrap-repo.sh` emita únicamente los
ecosistemas cuyo manifiesto exista en el repositorio, o que comente los demás.

---

## Nota sobre el orden en que aparecieron

Los defectos 3, 5 y 6 estaban encadenados y solo se ven de uno en uno: el
`CODEOWNERS` sin rellenar bloqueaba la fusión, y hasta arreglarlo no se veía que
`dependabot.yml` era inválido; hasta arreglar eso, Dependabot no llegaba a
correr, y hasta que corrió no se supo que declaraba ecosistemas inexistentes.
Merece la pena arreglarlos juntos en el estándar: por separado, cada uno esconde
al siguiente.

---

## 7. El job de producción no prepara pnpm, y las Functions no se pueden desplegar

**Archivo del estándar:** `.github/workflows/ci-node-firebase.yml`, job
`desplegar-produccion`.

El job prepara Node pero no corepack, a diferencia del job `calidad`, que sí lo
hace. Mientras el despliegue se limite a `hosting,firestore:rules` —el valor por
defecto de `FIREBASE_DEPLOY_ONLY`— no se nota. En cuanto se añade `functions`,
que es lo normal en un proyecto Firebase, `firebase deploy` ejecuta el hook
`predeploy` de `firebase.json` y este falla:

```
/bin/sh: 1: pnpm: not found
Error: functions predeploy error: Command terminated with non-zero exit code 127
```

**Lo peor es cuándo falla.** El job corre *después* de la compuerta de
aprobación del Environment `production`. Es decir: la persona aprueba el pase a
producción, y solo entonces se descubre que el despliegue no puede ni empezar.
Un fallo así debería salir en `calidad`, no al otro lado de la puerta.

**Corrección aplicada:** habilitar corepack e instalar las dependencias de
`functions/` antes del despliegue.

**Recomendación para el estándar:** preparar corepack en `desplegar-produccion`
igual que en `calidad`, o validar en `preparar` que el hook `predeploy` de
`firebase.json` se pueda ejecutar con las herramientas que el job de despliegue
tendrá disponibles.

### Nota aparte: el primer despliegue no tiene copia de rollback

En el mismo run apareció, en el paso de la copia para rollback:

```
Error: Could not find a version on the channel live for site novuchat-site.
```

Es esperable —no hay nada en `live` todavía— y el paso lleva
`continue-on-error: true`, así que no rompe nada. Vale la pena saberlo igual:
**el primer pase a producción es el único sin vuelta atrás automática.** A
partir del segundo, el canal `previa` ya tiene contenido. El paso de rollback de
`post-despliegue` contempla el caso y no falla si el canal no existe.

---

## 8. `firebase deploy` sale con código 0 habiendo fallado, y el pipeline lo cree

**Archivo del estándar:** `.github/workflows/ci-node-firebase.yml`, paso
«Desplegar hosting + reglas (producción)».

El paso confía en el código de salida de `firebase deploy`, protegido con
`set -euo pipefail`. No basta: **firebase-tools rotula los fallos de Functions
como avisos (`⚠`) y termina con código 0.**

En el pase de `v0.1.1` el paso dio **verde** con este registro:

```
⚠  functions: ... had HTTP Error: 409, Could not create bucket gcf-v2-sources-...
⚠  functions:  failed to create function projects/.../functions/asistente
Build failed with status: FAILURE and message: This project is using pnpm but you
have not included the Functions Framework in your dependencies.
```

Las dos Functions sin desplegar, la versión de hosting en estado `CREATED` y
nunca `FINALIZED` —o sea, el sitio sin publicar, 404 en todas sus URL— y el
resumen del job diciendo «Producción desplegada».

Lo salvó el health check de `post-despliegue`, que devolvió 404 diez veces
seguidas y disparó el rollback. Es decir: la defensa en profundidad funcionó,
pero el control que debía detectarlo primero afirmó lo contrario. **Un
despliegue que miente es peor que uno que falla**, porque el acta de producción
se firma con lo que dice el pipeline.

**Corrección aplicada:** guardar la salida del despliegue y fallar el paso si
contiene marcas de fallo (`failed to create function`, `Build failed with
status`, `had HTTP Error`, …), en vez de confiar solo en el código de salida.

**Recomendación para el estándar:** aplicarlo en los cuatro proveedores, y
considerar además una verificación por resultado —que el canal `live` tenga una
publicación nueva y que las funciones existan— en lugar de leer el registro.

### Hallazgos del proyecto en el mismo run

- **`@google-cloud/functions-framework` era obligatorio y no estaba.** El
  buildpack de Google lo exige explícitamente cuando el proyecto usa pnpm.
  Añadido a `functions/package.json`.
- **El 409 del bucket `gcf-v2-sources-…` fue una carrera**, no un permiso: las
  dos Functions intentaron crearlo a la vez en el primer despliegue. El bucket
  ya existe, así que no se repite.
