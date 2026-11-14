# Reglas de merge

Regla de `main`: **solo entra código por pull request, con 1 aprobación y con el check `test` en verde.**

## Configuración (Settings → Branches → Add branch ruleset / protection rule, rama `main`)
- [x] Require a pull request before merging → **Required approvals: 1**
- [x] Require status checks to pass before merging → agregar el check **test**
- [x] Require branches to be up to date before merging
- [x] Do not allow bypassing the above settings (si tu cuenta es admin)

Nota: el check `test` solo aparece en el buscador después de que el workflow CI haya corrido al menos una vez (abre un primer PR o haz un push).

### Alternativa con GitHub CLI
```bash
gh auth login
gh api -X PUT repos/<USUARIO>/<REPOSITORIO>/branches/main/protection --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["test"] },
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 1 },
  "restrictions": null
}
JSON
```
La aprobación la debe dar **otra persona** (compañero de equipo con permiso de escritura); nadie puede aprobar su propio PR.

## Pull request bloqueado por una prueba fallida (evidencia obligatoria)
Esta secuencia demuestra la regla. Hay un script: `scripts/demo-blocked-pr.sh`.

1. Crear la rama `feature/demo-bloqueado` y romper a propósito una prueba (el script altera el cálculo del porcentaje en `summarize`).
2. Abrir el pull request → el check **test** queda en rojo y el botón *Merge* aparece bloqueado. **Captura de pantalla 1.**
3. Corregir (el script `--fix` revierte el cambio), hacer push → el check pasa a verde. **Captura de pantalla 2.**
4. Conseguir la aprobación del compañero y fusionar. **Captura de pantalla 3** y enlace del PR.
5. Pegar los enlaces y capturas en `docs/DEVELOPMENT_LOG.md` (entrada "PR bloqueado").
