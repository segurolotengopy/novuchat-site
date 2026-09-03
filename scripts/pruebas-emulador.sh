#!/usr/bin/env bash
# Corre una suite de Vitest desde la raíz del repositorio.
#
# `firebase emulators:exec` ejecuta su script con el directorio de trabajo en
# `functions/` cuando emula funciones, no en la raíz. Desde ahí no existe
# `node_modules/.bin/vitest` y el comando falla con un 127 que no dice por qué.
# Este envoltorio fija el directorio y quita la ambigüedad.
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
exec ./node_modules/.bin/vitest run "$@"
