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
