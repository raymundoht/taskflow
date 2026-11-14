# TaskFlow

Gestor de tareas web (HTML + JavaScript, **sin dependencias**) hecho para la *Evidence 4: Test and Release a Web App* de Desarrollo Web Integral.

- **Sitio publicado:** `https://<USUARIO>.github.io/<REPOSITORIO>/` ← reemplaza al desplegar
- **Estado de CI:** ver la pestaña *Actions* del repositorio

## Requisitos
- Node.js 22 o superior y npm (solo para probar y servir en local). No hay `npm install` que hacer: el proyecto no tiene dependencias.

## Instalar
```bash
git clone https://github.com/<USUARIO>/<REPOSITORIO>.git
cd <REPOSITORIO>
```

## Ejecutar en local
```bash
npm start          # abre http://localhost:3000
```

## Probar
```bash
npm test           # 15 pruebas unitarias (node:test): casos normales, límite e inválidos
```

## Desplegar
El despliegue es automático: cada vez que algo se fusiona en `main`, el workflow **Deploy** ejecuta las pruebas, construye `dist/` y publica en GitHub Pages. El procedimiento completo (antes, desplegar, verificar, revertir y registrar) está en [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Flujo de trabajo y reglas de merge
- `main` está protegida: solo se cambia con *pull request*, con 1 aprobación y con el check `test` en verde. Detalles y comandos en [docs/BRANCH_PROTECTION.md](docs/BRANCH_PROTECTION.md).
- La bitácora de desarrollo está en [docs/DEVELOPMENT_LOG.md](docs/DEVELOPMENT_LOG.md).

## Estructura
```
index.html           página principal
src/tasks.js         lógica pura (la que se prueba)
src/app.js           interfaz (DOM + localStorage)
test/tasks.test.js   pruebas unitarias
scripts/             servidor local y build
.github/workflows/   CI (ci.yml) y despliegue (deploy.yml)
docs/                despliegue, reglas de merge y bitácora
```

## Seguridad
No se guardan contraseñas, tokens ni llaves en el repositorio. El despliegue usa los permisos integrados de GitHub Actions (`GITHUB_TOKEN`), sin secretos propios.
