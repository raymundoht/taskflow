#!/usr/bin/env bash
# Crea una rama con un cambio que rompe una prueba (para documentar un PR bloqueado).
#   ./scripts/demo-blocked-pr.sh        -> rompe la prueba y sube la rama
#   ./scripts/demo-blocked-pr.sh --fix  -> corrige y sube de nuevo
set -euo pipefail
BRANCH=feature/demo-bloqueado
if [[ "${1:-}" == "--fix" ]]; then
  git switch "$BRANCH"
  sed -i 's/(done \/ total) \* 10)/(done \/ total) * 100)/' src/tasks.js
  git commit -am "fix: restaurar el cálculo del porcentaje"
  git push
  exit 0
fi
git switch main && git pull
git switch -c "$BRANCH"
sed -i 's/(done \/ total) \* 100)/(done \/ total) * 10)/' src/tasks.js
npm test || echo "(Las pruebas fallan a propósito: es lo esperado)"
git commit -am "feat: cambiar el cálculo del porcentaje (rompe una prueba)"
git push -u origin "$BRANCH"
echo "Ahora abre el Pull Request hacia main y toma la captura del check en rojo."
