#!/usr/bin/env bash
# Crea una rama con un cambio que rompe una prueba unitaria para documentar
# el Pull Request bloqueado por el status check `test` en GitHub Actions.
#
# Uso:
#   ./scripts/demo-blocked-pr.sh        -> rompe la prueba en la rama feature/demo-bloqueado y hace push
#   ./scripts/demo-blocked-pr.sh --fix  -> restaura la lógica correcta y hace push para desbloquear el PR

set -euo pipefail

BRANCH="feature/demo-bloqueado"

if [[ "${1:-}" == "--fix" ]]; then
  git switch "$BRANCH"
  node -e '
    import("node:fs").then((fs) => {
      const src = fs.readFileSync("src/tasks.js", "utf8");
      const fixed = src.replace("(done / total) * 10)", "(done / total) * 100)");
      fs.writeFileSync("src/tasks.js", fixed);
    });
  '
  npm test
  git commit -am "fix: restaurar el cálculo correcto del porcentaje en summarize"
  git push
  echo "Corrección enviada. Verifica en GitHub que el check 'test' pase a verde."
  exit 0
fi

git switch main
git pull --ff-only || true
git switch -c "$BRANCH"

node -e '
  import("node:fs").then((fs) => {
    const src = fs.readFileSync("src/tasks.js", "utf8");
    const broken = src.replace("(done / total) * 100)", "(done / total) * 10)");
    fs.writeFileSync("src/tasks.js", broken);
  });
'

npm test || echo "(Las pruebas fallan a propósito: este fallo bloqueará el Pull Request en CI)"
git commit -am "feat: alterar cálculo del porcentaje (rompe prueba unitaria para demostrar bloqueo)"
git push -u origin "$BRANCH"
echo "Ahora abre el Pull Request hacia 'main' en GitHub y toma la captura del check 'test' en rojo."
