# Proceso de Despliegue (Deployment Runbook)

- **Entorno de producción:** GitHub Pages (`github-pages`)
- **Workflow encargado:** [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
- **Artefacto publicado:** Carpeta `dist/` generada por `npm run build` (`index.html` + `src/`)
- **Credenciales requeridas:** Ninguna externa. Usa permisos OIDC nativos de GitHub Actions (`pages: write`, `id-token: write`).

---

## 0. Configuración inicial del entorno (solo la primera vez)

Antes del primer despliegue en un repositorio nuevo de GitHub, cualquier administrador del repositorio debe realizar estos dos pasos:

1. Abrir el repositorio en GitHub e ir a **Settings → Pages**.
2. En **Build and deployment → Source**, seleccionar **GitHub Actions** (en lugar de *Deploy from a branch*).
3. Ir a **Settings → Actions → General** y confirmar que **Actions permissions** esté en *Allow all actions and reusable workflows*.

---

## Fase 1: Antes de desplegar (Before — Pre-Deployment Checklist)

Antes de fusionar cualquier Pull Request hacia `main` que disparará un despliegue a producción, el responsable debe completar esta lista de verificación:

- [ ] **Sincronización local:** Actualizar la rama de trabajo con el último estado de `main`:
  ```bash
  git fetch origin
  git rebase origin/main
  ```
- [ ] **Pruebas unitarias en verde:** Ejecutar la suite completa y confirmar que las 23 pruebas pasan sin fallos:
  ```bash
  npm test
  ```
- [ ] **Verificación del artefacto de producción:** Construir la carpeta `dist/` y comprobar que existen los archivos esperados:
  ```bash
  npm run build
  ls -la dist/ dist/src/
  ```
- [ ] **Prueba funcional rápida en local:** Ejecutar `npm start`, abrir `http://localhost:3000` y probar crear, editar, filtrar, completar y eliminar una tarea.
- [ ] **Auditoría de seguridad (cero secretos):** Confirmar que ningún commit introduce contraseñas, tokens, llaves API ni archivos `.env`:
  ```bash
  git status
  git diff origin/main...HEAD
  ```
- [ ] **Requisitos de Pull Request cumplidos:**
  - El status check **`test`** de GitHub Actions está en verde (`✔`).
  - El Pull Request cuenta con al menos **1 aprobación** de revisión de código.

---

## Fase 2: Desplegar (Deploy)

El despliegue está completamente automatizado al fusionar en `main`:

1. En la página del Pull Request en GitHub, hacer clic en **Merge pull request → Confirm merge**.
2. Al actualizarse `main`, se dispara automáticamente el workflow **Deploy** (`.github/workflows/deploy.yml`), el cual ejecuta dos *jobs* secuenciales:
   - **Job 1 (`test`):** Descarga el código en `ubuntu-latest`, instala Node.js 22 y ejecuta `npm test`. Si alguna prueba falla, el despliegue se cancela inmediatamente (`needs: test`).
   - **Job 2 (`deploy`):** Ejecuta `npm run build`, empaqueta la carpeta `dist/` como artefacto con `actions/upload-pages-artifact@v3` y la publica en GitHub Pages mediante `actions/deploy-pages@v4`.
3. Abrir la pestaña **Actions → Deploy** y observar la ejecución (~45 segundos) hasta que ambos *jobs* muestren el ícono verde (`✔`).
4. Copiar la URL pública mostrada debajo del nodo **`deploy`** (formato: `https://raymundoht.github.io/taskflow/`).

*(Nota: Si se requiere volver a desplegar la rama `main` sin nuevos commits, ir a **Actions → Deploy → Run workflow → Branch: main → Run workflow**).*

---

## Fase 3: Verificar (Verify — Post-Deployment Smoke Tests)

Inmediatamente después de que el workflow **Deploy** termine en verde, verificar el sitio en producción siguiendo esta tabla de pruebas de humo:

| # | Prueba de verificación | Acción a realizar | Resultado esperado |
| :-: | :--- | :--- | :--- |
| 1 | **Acceso público sin sesión** | Abrir `https://raymundoht.github.io/taskflow/` en una **ventana privada / incógnito** | La página carga con estilos completos y el encabezado `TaskFlow v1.1.0 · CI Verified`. |
| 2 | **Consola limpia** | Abrir DevTools (`F12` → pestaña *Console* y *Network*) | `0` errores en rojo y todos los recursos (`index.html`, `styles.css`, `app.js`, `tasks.js`) responden `200 OK`. |
| 3 | **Creación y validación** | Intentar agregar una tarea vacía y luego agregar `"Probar producción"` con prioridad `Alta` | La tarea vacía muestra alerta de error; la tarea válida aparece en la lista con etiqueta `ALTA` y contador `0 de 1 completadas (0%)`. |
| 4 | **Completar y barra de avance** | Marcar la casilla de `"Probar producción"` | El texto se tacha, la barra de progreso sube a `100%` y el resumen muestra `1 de 1 completadas (100%)`. |
| 5 | **Persistencia (`localStorage`)** | Recargar la página (`Cmd+R` / `F5`) en la ventana privada | La tarea y su estado completado permanecen guardados tras recargar. |
| 6 | **Limpieza** | Hacer clic en **Limpiar completadas** | La tarea completada se elimina y el contador vuelve a `0 de 0 completadas (0%)`. |

---

## Fase 4: Revertir en caso de fallo (Roll Back)

Si cualquiera de las pruebas de la Fase 3 falla en producción o se detecta una regresión visual/funcional, cualquier miembro del equipo puede revertir a la última versión estable en menos de 3 minutos siguiendo estos pasos:

### Procedimiento estándar de Rollback (vía Git Revert + Pull Request)

1. **Identificar el commit defectuoso** en el historial de `main`:
   ```bash
   git switch main
   git pull origin main
   git log --oneline -n 5
   ```
2. **Crear una rama de reversión** y deshacer el commit problemático (sin reescribir el historial de `main`):
   ```bash
   git switch -c rollback/revert-bad-release
   # Si el commit en main fue un commit normal o squash:
   git revert --no-edit <SHA_DEL_COMMIT_MALO>
   # Si el commit en main fue un merge commit de PR:
   git revert -m 1 --no-edit <SHA_DEL_MERGE_COMMIT>
   ```
3. **Verificar en local** que las pruebas pasan y el problema desapareció:
   ```bash
   npm test
   npm start
   ```
4. **Subir la rama y abrir un Pull Request de emergencia:**
   ```bash
   git push -u origin rollback/revert-bad-release
   ```
5. Solicitar aprobación prioritaria del compañero, esperar el check **`test`** en verde y fusionar en `main`.
6. El workflow **Deploy** se ejecutará automáticamente y restaurará la versión estable en GitHub Pages.
7. Repetir la **Fase 3 (Verificar)** para confirmar que el sitio en producción volvió a la normalidad.

---

## Fase 5: Registrar (Record)

Cada despliegue a producción (y cualquier rollback si ocurriera) debe registrarse en [`docs/DEVELOPMENT_LOG.md`](DEVELOPMENT_LOG.md) usando la siguiente plantilla:

```markdown
### Registro de Release — YYYY-MM-DD
- **Versión / Commit desplegado:** `<SHA>` (`<enlace al commit en GitHub>`)
- **Ejecución de Actions (Deploy):** `<enlace al run de GitHub Actions>`
- **URL verificada en ventana privada:** `https://raymundoht.github.io/taskflow/`
- **Resultado de verificación (Fase 3):** 6/6 pruebas de humo superadas
- **Incidentes / Rollback:** Ninguno (o descripción de la causa raíz y commit de revert)
```

---

## 6. Limpieza de recursos en la nube (Cloud Resource Cleanup)

- **Durante el semestre / evaluación:** Mantener el sitio de GitHub Pages activo para que el profesor pueda abrir el enlace público en una ventana privada.
- **Al finalizar la evaluación del curso:**
  1. Ir a **Settings → Pages** en el repositorio de GitHub y hacer clic en **Unpublish site** para desactivar el alojamiento estático.
  2. Eliminar ramas temporales de características ya fusionadas (`git push origin --delete feature/demo-bloqueado`).
  3. GitHub Pages y GitHub Actions en repositorios públicos no generan cargos ni dejan servidores virtuales encendidos.
