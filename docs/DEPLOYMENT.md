# Proceso de despliegue

Destino: **GitHub Pages**, desplegado por el workflow `.github/workflows/deploy.yml`. Sin servidores propios ni secretos.

## 0. Preparación única (solo la primera vez)
1. En GitHub: *Settings → Pages → Build and deployment → Source: **GitHub Actions***.
2. Confirmar que *Settings → Actions → General* permite ejecutar workflows.

## 1. Antes de desplegar (checklist)
- [ ] El pull request fue aprobado y el check **test** está en verde.
- [ ] En local: `git switch main && git pull` y `npm test` pasa.
- [ ] `npm start` y revisión rápida en http://localhost:3000 (agregar, completar y eliminar una tarea).
- [ ] No hay contraseñas, tokens ni archivos `.env` en el cambio (`git diff --staged`).
- [ ] Anotar en `docs/DEVELOPMENT_LOG.md` qué se va a publicar y por qué.

## 2. Desplegar
1. Fusionar el pull request en `main` (botón *Merge*).
2. El workflow **Deploy** arranca solo: corre `npm test` → `npm run build` → publica `dist/`.
3. Seguir el avance en *Actions → Deploy*. Si hace falta volver a desplegar sin cambios: *Actions → Deploy → Run workflow*.

## 3. Verificar
- [ ] *Actions → Deploy* termina en verde y muestra la URL del entorno `github-pages`.
- [ ] Abrir `https://<USUARIO>.github.io/<REPOSITORIO>/` en una **ventana privada**.
- [ ] Agregar una tarea, marcarla y eliminarla; ver que el contador cambia.
- [ ] Recargar la página: las tareas siguen (localStorage).
- [ ] Revisar la consola del navegador: sin errores en rojo.

## 4. Revertir (rollback)
Si la verificación falla:
1. Identificar el commit malo en `main` (*Commits*).
2. Crear una rama y deshacerlo: `git switch -c revert/<descripcion>` y `git revert <sha>` (si fue un merge: `git revert -m 1 <sha>`).
3. Abrir un pull request con ese revert (también pasa por CI y aprobación).
4. Al fusionarlo, **Deploy** publica de nuevo la versión anterior.
5. Alternativa rápida: *Actions → Deploy →* abrir la última ejecución que estaba bien → *Re-run all jobs* (solo funciona si `main` aún apunta a ese commit; si no, usar el revert).
6. Verificar de nuevo con la sección 3.

## 5. Registrar
En `docs/DEVELOPMENT_LOG.md` agregar una entrada con fecha: qué se desplegó, enlace al commit o a la ejecución de Actions, resultado de la verificación y, si hubo rollback, causa y solución.

## Limpieza de recursos
GitHub Pages no genera costos. Si ya no se necesita el sitio: *Settings → Pages → Unpublish site* o borrar el repositorio, para no dejar recursos en la nube.
