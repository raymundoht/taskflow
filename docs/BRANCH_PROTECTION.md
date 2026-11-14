# Reglas de Merge y Evidencia de Pull Request Bloqueado

Política de la rama principal (`main`):
> **Ningún cambio puede subirse directamente a `main`. Todo código debe entrar mediante un Pull Request que cuente con al menos 1 aprobación de revisión y con el status check `test` de GitHub Actions en verde.**

---

## 1. Configuración de protección de la rama `main`

### Opción A — Desde la interfaz web de GitHub (Settings → Branches)
1. En el repositorio de GitHub, ir a **Settings → Branches → Add branch protection rule** (o **Rules → Rulesets → New branch ruleset**).
2. En **Branch name pattern**, escribir: `main`.
3. Activar las siguientes casillas obligatorias:
   - [x] **Require a pull request before merging**
     - [x] **Require approvals:** `1`
     - [x] **Dismiss stale pull request approvals when new commits are pushed**
   - [x] **Require status checks to pass before merging**
     - [x] **Require branches to be up to date before merging**
     - Buscar y añadir el status check: **`test`** *(generado por `.github/workflows/ci.yml`)*
   - [x] **Do not allow bypassing the above settings** *(aplica la regla también a los administradores del repositorio)*
   - [ ] *Allow force pushes* (desactivado)
   - [ ] *Allow deletions* (desactivado)
4. Hacer clic en **Create** / **Save changes**.

> **Nota importante:** El check `test` aparece en el buscador de GitHub después de que `.github/workflows/ci.yml` se ha ejecutado al menos una vez (por ejemplo, al hacer el primer `git push -u origin main`).

### Opción B — Automatización mediante GitHub CLI (`gh`)
Si tienes instalado `gh`, puedes aplicar exactamente la misma regla desde la terminal:

```bash
gh auth login
gh api -X PUT repos/raymundoht/taskflow/branches/main/protection --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["test"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null
}
JSON
```

---

## 2. Documentación de un Pull Request bloqueado por una prueba fallida y luego fusionado

Para demostrar y verificar que las reglas de protección impiden fusionar código defectuoso en `main`, se incluye el script multiplataforma [`scripts/demo-blocked-pr.sh`](../scripts/demo-blocked-pr.sh) y el registro paso a paso del caso ejecutado.

### Fase A — Introducir un error que rompe una prueba unitaria

Se ejecuta el script en modo inicial:

```bash
./scripts/demo-blocked-pr.sh
```

**Qué hace este paso:**
1. Crea la rama `feature/demo-bloqueado` a partir de `main`.
2. Introduce un bug intencional en `src/tasks.js` dentro de la función `summarize(tasks)`, cambiando la fórmula del porcentaje de `(done / total) * 100` a `(done / total) * 10`:
   ```diff
   - const percent = total === 0 ? 0 : Math.round((done / total) * 100);
   + const percent = total === 0 ? 0 : Math.round((done / total) * 10);
   ```
3. Sube la rama a GitHub (`git push -u origin feature/demo-bloqueado`) y se abre el Pull Request hacia `main`.

### Fase B — Bloqueo automático en el Pull Request (CI en rojo)

Al abrir el Pull Request en GitHub, el workflow **CI** (`.github/workflows/ci.yml`) se ejecuta automáticamente y falla en 2 pruebas unitarias de `test/tasks.test.js`:

```text
✖ summarize calcula total, hechas, pendientes y porcentaje redondeado
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
    {
      done: 1,
      pending: 2,
  +   percent: 3,
  -   percent: 33,
      total: 3
    }

✖ summarize con todas las tareas completadas devuelve exactamente 100%
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  +   percent: 10,
  -   percent: 100,

ℹ tests 23 | pass 21 | fail 2
Error: Process completed with exit code 1.
```

**Estado del Pull Request en este punto (Evidencia 1):**
- Check **`CI / test (pull_request)`:** `Failing (exit code 1)` en rojo (`✖`).
- Revisión (**Review required**): `At least 1 approving review is required by reviewers with write access`.
- Botón **Merge pull request:** **Bloqueado (`Merging is blocked`)**.

### Fase C — Corrección del código, aprobación y fusión (CI en verde)

Se ejecuta el script con la bandera `--fix` para corregir el defecto:

```bash
./scripts/demo-blocked-pr.sh --fix
```

**Qué hace este paso:**
1. Restaura la fórmula correcta `(done / total) * 100` en `src/tasks.js`.
2. Verifica en local que las **23 pruebas unitarias pasan** (`ℹ pass 23 | fail 0`).
3. Crea el commit `fix: restaurar el cálculo correcto del porcentaje en summarize` y hace `git push`.

**Resultado final en el Pull Request (Evidencias 2 y 3):**
1. GitHub Actions vuelve a ejecutar automáticamente el job **`test`** sobre el nuevo commit y pasa a **verde (`✔ All checks have passed — 1 successful check`)**.
2. El compañero revisor inspecciona el diff, aprueba el Pull Request (**`1 approving review`**) y el botón **Merge pull request** se habilita en verde.
3. Se fusiona el Pull Request en `main`, lo que dispara automáticamente el workflow **Deploy** hacia GitHub Pages.
