# Bitácora de Desarrollo (Development Log) — TaskFlow

- **Proyecto:** TaskFlow — Gestor de Tareas Web (`v1.1.0`)
- **Asignatura:** Desarrollo Web Integral · Unit 4 · Evidence 4: Test and Release a Web App (30%)
- **Autor:** Raymundo Javier Herrera Quezada · Grupo IDGBIS92N
- **Stack técnico:** HTML5, CSS3, JavaScript ES Modules, Node.js 22 (`node:test`, `node:http`), GitHub Actions (CI/CD), GitHub Pages

---

## Entrada 1 — 2026-11-13 · Diseño de arquitectura y lógica pura de dominio
- **Qué hice:** Diseñé la arquitectura de **TaskFlow** separando por completo la lógica de negocio (`src/tasks.js`) de la manipulación del DOM (`src/app.js`). Implementé funciones puras e inmutables para validar títulos (`validateTitle`), agregar tareas (`addTask`), cambiar su estado (`toggleTask`), eliminar (`removeTask`), filtrar (`filterTasks`) y calcular estadísticas (`summarize`).
- **Por qué:** Separar la lógica pura del navegador permite ejecutar pruebas unitarias ultrarrápidas en Node.js sin depender de un navegador headless ni librerías externas, garantizando que el proyecto funcione desde un clon limpio.
- **Evidencia:**
  - Commit [`49a95ac`](https://github.com/raymundoht/taskflow/commit/49a95ac) (`feat: lógica pura de tareas (validar, agregar, alternar, filtrar, resumir)`)
  - Archivo [`src/tasks.js`](../src/tasks.js)
- **Problemas y solución:**
  - *Problema:* Al mutar el arreglo original con `.push()` o modificar objetos directamente, era fácil provocar efectos secundarios entre pruebas.
  - *Solución:* Todas las funciones devuelven un nuevo arreglo (`[...tasks, nuevaTarea]`, `.map()`, `.filter()`), preservando la inmutabilidad del estado.

---

## Entrada 2 — 2026-11-13 · Suite inicial de pruebas unitarias con `node:test`
- **Qué hice:** Creé el archivo `test/tasks.test.js` utilizando los módulos nativos `node:test` y `node:assert/strict` de Node.js 22 para cubrir casos normales, casos límite (lista vacía, longitud máxima de 80 caracteres, IDs tras borrar tareas intermedias) y casos inválidos (títulos vacíos, tipos no-string, duplicados, IDs inexistentes y filtros desconocidos).
- **Por qué:** La rúbrica exige al menos 5 pruebas unitarias significativas que evalúen casos normales, límite e inválidos y que corran automáticamente en CI sin fallar.
- **Evidencia:**
  - Commit [`4e0bd44`](https://github.com/raymundoht/taskflow/commit/4e0bd44) (`test: 15 pruebas unitarias (normales, límite e inválidas)`)
  - Archivo [`test/tasks.test.js`](../test/tasks.test.js)
- **Problemas y solución:**
  - *Problema:* Al ejecutar `node --test test/` en Node.js 22 se produjo el error `ERR_MODULE_NOT_FOUND: Cannot find module '.../test'` porque Node interpretó `test/` como un módulo en lugar de un directorio.
  - *Solución:* Configuré el script en `package.json` usando un patrón glob explícito: `"test": "node --test \"test/**/*.test.js\""`.

---

## Entrada 3 — 2026-11-13 · Interfaz web, servidor local y empaquetado a `dist/`
- **Qué hice:** Construí la interfaz web en `index.html`, `src/styles.css` y `src/app.js` con persistencia en `localStorage`, además del servidor de desarrollo `scripts/serve.js` (`npm start`) y el script de empaquetado `scripts/build.js` (`npm run build`).
- **Por qué:** Se requiere que cualquier evaluador o compañero pueda clonar el repositorio y ejecutar `npm start` o `npm run build` inmediatamente sin instalar paquetes externos (`node_modules`).
- **Evidencia:**
  - Commit [`bf2171e`](https://github.com/raymundoht/taskflow/commit/bf2171e) (`feat: interfaz web, servidor local y build a dist/`)
  - Archivos [`index.html`](../index.html), [`scripts/serve.js`](../scripts/serve.js) y [`scripts/build.js`](../scripts/build.js)
- **Problemas y solución:**
  - *Problema:* Si el usuario escribía etiquetas como `<script>alert(1)</script>` en el título de una tarea, usar `innerHTML` abría una vulnerabilidad XSS.
  - *Solución:* Rendericé todos los textos de usuario exclusivamente mediante `textContent` y nodos DOM creados con `document.createElement`.

---

## Entrada 4 — 2026-11-13 · Endurecimiento de seguridad en el servidor HTTP local
- **Qué hice:** Restringí el servidor estático `scripts/serve.js` para que únicamente sirva `/index.html` y archivos bajo `/src/`, bloqueando cualquier intento de acceso a `.git/`, `scripts/`, `test/` o recorridos de directorios (`..`).
- **Por qué:** En la primera versión del servidor local, aunque se bloqueaba `..`, cualquier archivo en la raíz del proyecto (como `package.json` o `README.md`) podía solicitarse por HTTP. Restringirlo a `index.html` y `src/` iguala exactamente lo que se publica en producción (`dist/`).
- **Evidencia:**
  - Commit [`12cf14b`](https://github.com/raymundoht/taskflow/commit/12cf14b) (`fix: el servidor local solo sirve index.html y src/`)
  - Líneas 13-15 de [`scripts/serve.js`](../scripts/serve.js#L13-L15)
- **Problemas y solución:**
  - *Problema:* Solicitudes a rutas como `/package.json` devolvían código `200` en local pero darían `404` en GitHub Pages (`dist/`).
  - *Solución:* Se añadió la condición `const allowed = path === '/index.html' || path.startsWith('/src/')` antes de leer del disco.

---

## Entrada 5 — 2026-11-13 · Configuración de GitHub Actions: CI en Pull Requests y Deploy a Pages
- **Qué hice:** Creé dos flujos de trabajo en `.github/workflows/`:
  1. `ci.yml`: ejecuta `npm test` y `npm run build` automáticamente en cada `pull_request` y `push` hacia `main` bajo el job llamado `test`.
  2. `deploy.yml`: al actualizarse `main`, ejecuta primero el job `test` y, solo si pasa (`needs: test`), construye `dist/` y despliega a GitHub Pages usando tokens OIDC efímeros.
- **Por qué:** Automatizar la verificación impide integrar código roto en `main` y garantiza que cada versión publicada en GitHub Pages haya superado las pruebas unitarias. Sin usar llaves ni tokens personales guardados en el repo.
- **Evidencia:**
  - Commit [`0bed41d`](https://github.com/raymundoht/taskflow/commit/0bed41d) (`ci: workflow de pruebas en cada PR y despliegue a GitHub Pages`)
  - Archivos [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) y [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
- **Problemas y solución:**
  - *Problema:* GitHub Pages por defecto falla con error de permisos si el workflow no declara permisos explícitos de OIDC.
  - *Solución:* Se declaró el bloque `permissions: { contents: read, pages: write, id-token: write }` en `deploy.yml` y `permissions: { contents: read }` en `ci.yml`.

---

## Entrada 6 — 2026-11-13 · Ampliación funcional: prioridades, edición, búsqueda en vivo y panel de métricas
- **Qué hice:** Mejoré el modelo de datos en `src/tasks.js` y la interfaz en `index.html`, `src/app.js` y `src/styles.css` agregando:
  - Niveles de prioridad validados (`high`, `medium`, `low`) con etiquetas visuales.
  - Edición de títulos de tareas existentes (`editTask`) con prevención de duplicados contra otras tareas.
  - Búsqueda de texto en tiempo real combinada con los filtros de estado (`filterTasks(tasks, filter, query)`).
  - Botón para limpiar todas las tareas completadas (`clearCompleted`).
  - Panel de métricas con tarjetas de resumen (Total, Pendientes, Completadas, Avance) y barra de progreso accesible (`role="progressbar"`).
- **Por qué:** Ofrecer una experiencia de usuario completa y profesional que permita demostrar más reglas de negocio y validaciones en las pruebas unitarias y durante la verificación en producción.
- **Evidencia:**
  - Archivos [`src/tasks.js`](../src/tasks.js), [`src/app.js`](../src/app.js), [`src/styles.css`](../src/styles.css) e [`index.html`](../index.html)
- **Problemas y solución:**
  - *Problema:* Al editar una tarea conservando su propio texto pero cambiando una letra a mayúscula (p. ej. de `"revisar código"` a `"Revisar Código"`), una validación ingenua de duplicados la rechazaba por coincidir consigo misma.
  - *Solución:* En `editTask`, excluí la propia tarea de la búsqueda de duplicados usando `t.id !== id && t.title.toLowerCase() === clean.toLowerCase()`.

---

## Entrada 7 — 2026-11-13 · Ampliación a 23 pruebas unitarias estructuradas por categoría de rúbrica
- **Qué hice:** Reestructuré y amplié [`test/tasks.test.js`](../test/tasks.test.js) de 15 a **23 pruebas unitarias**, agrupadas con `describe()` en las tres suites que evalúa la rúbrica:
  1. `1. Casos normales (Normal cases)` — 8 pruebas
  2. `2. Casos límite (Edge cases)` — 7 pruebas
  3. `3. Casos inválidos (Invalid cases)` — 8 pruebas
- **Por qué:** Agrupar las pruebas con `describe()` hace que la salida de `npm test` en la terminal y en los logs de GitHub Actions muestre claramente las 3 categorías exigidas (7 puntos de la rúbrica) y cubra las nuevas funciones (`validatePriority`, `editTask`, `clearCompleted`, búsqueda en `filterTasks`).
- **Evidencia:**
  - Archivo [`test/tasks.test.js`](../test/tasks.test.js)
  - Salida de `npm test`: `ℹ tests 23 | suites 3 | pass 23 | fail 0`
- **Problemas y solución:**
  - *Problema:* Al agregar el campo `priority: 'medium'` al objeto devuelto por `addTask`, la primera prueba unitaria falló con `AssertionError [ERR_ASSERTION]` porque esperaba solo `{ id, title, done, createdAt }`.
  - *Solución:* Actualicé la aserción `assert.deepEqual` del caso normal 1 para verificar explícitamente `priority: 'medium'` y añadí una segunda prueba específica para prioridades personalizadas (`high`, `low`).

---

## Entrada 8 — 2026-11-13 · Corrección de compatibilidad multiplataforma (macOS/Linux) en `demo-blocked-pr.sh`
- **Qué hice:** Reemplacé el comando `sed -i` en [`scripts/demo-blocked-pr.sh`](../scripts/demo-blocked-pr.sh) por un script en línea con `node -e` que lee y reemplaza la fórmula en `src/tasks.js` usando el módulo nativo `node:fs`.
- **Por qué:** El script automatiza la demostración obligatoria del Pull Request bloqueado por una prueba fallida y luego corregido (`--fix`).
- **Evidencia:**
  - Archivo [`scripts/demo-blocked-pr.sh`](../scripts/demo-blocked-pr.sh)
  - Documentación del flujo en [`docs/BRANCH_PROTECTION.md`](BRANCH_PROTECTION.md)
- **Problemas y solución:**
  - *Problema:* En macOS (BSD `sed`), ejecutar `sed -i 's/.../.../' src/tasks.js` falla con `sed: 1: "src/tasks.js": invalid command code s` porque BSD `sed` exige un argumento de extensión (`sed -i ''`), mientras que GNU `sed` en Linux no lo requiere.
  - *Solución:* Al usar `node -e` con `fs.readFileSync` y `fs.writeFileSync`, el script funciona de forma idéntica en macOS, Linux y Windows sin depender de variantes del sistema operativo.

---

## Entrada 9 — 2026-11-13 · Documentación operativa de Despliegue (5 fases) y Reglas de Merge
- **Qué hice:** Redacté y estructuré la documentación técnica del repositorio:
  - [`README.md`](../README.md): guía completa de instalación desde clon limpio, ejecución local, tabla de las 23 pruebas unitarias, build, despliegue, reglas de merge y seguridad.
  - [`docs/DEPLOYMENT.md`](DEPLOYMENT.md): manual operativo dividido en las 5 fases requeridas (**1. Antes de desplegar**, **2. Desplegar**, **3. Verificar con tabla de 6 smoke tests en ventana privada**, **4. Revertir / Rollback con `git revert`**, **5. Registrar**) más **Limpieza de recursos**.
  - [`docs/BRANCH_PROTECTION.md`](BRANCH_PROTECTION.md): configuración paso a paso de la protección de `main` (vía UI y vía `gh api`) y caso documentado del Pull Request bloqueado en `feature/demo-bloqueado`.
- **Por qué:** La rúbrica evalúa con 7 puntos que cualquier compañero de equipo pueda seguir las fases escritas para desplegar, verificar y revertir, y con 6 puntos las reglas de merge y la evidencia del PR bloqueado.
- **Evidencia:**
  - Commit [`77c1b73`](https://github.com/raymundoht/taskflow/commit/77c1b73) y actualización completa en [`README.md`](../README.md), [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) y [`docs/BRANCH_PROTECTION.md`](BRANCH_PROTECTION.md).
- **Problemas y solución:**
  - *Problema:* Si un compañero intenta revertir un merge commit en `main` con `git revert <sha>` simple, Git falla con `error: commit ... is a merge but no -m option was given`.
  - *Solución:* Documenté explícitamente en la Fase 4 de `docs/DEPLOYMENT.md` tanto el comando para commits normales (`git revert --no-edit <SHA>`) como para merge commits (`git revert -m 1 --no-edit <SHA>`).

---

## Entrada 10 — 2026-11-13 · Verificación integral desde entorno limpio (Tests, Build y Servidor Local)
- **Qué hice:** Ejecuté la verificación completa de extremo a extremo en local:
  1. `npm test` → 23 pruebas unitarias en verde (8 normales, 7 límite, 8 inválidas).
  2. `npm run build` → generación limpia del directorio `dist/` con `index.html` y `src/`.
  3. `npm start` → servidor HTTP activo en `http://localhost:3000` verificando la carga de la aplicación y la protección de rutas fuera de `src/`.
- **Por qué:** Garantizar antes del envío final que el repositorio cumple con la lista *"Before you submit"* de la tarea: cero errores en pruebas, build reproducible y cero secretos almacenados.
- **Evidencia:**
  - Ejecución verificada: `ℹ tests 23 | suites 3 | pass 23 | fail 0`
  - Artefacto generado en `dist/` listo para GitHub Pages.
- **Problemas y solución:**
  - *Problema:* La carpeta `dist/` generada por `npm run build` no debe versionarse en Git para no ensuciar los Pull Requests, ya que el workflow `deploy.yml` la construye en fresco en GitHub Actions.
  - *Solución:* Verifiqué que `dist/` y `.env*` estén incluidos en [`.gitignore`](../.gitignore), manteniendo el árbol de trabajo limpio (`git status` sin archivos residuales).

---

## Registro de evidencias en GitHub (para adjuntar al entregar en Teams)

> Completa los enlaces siguientes al subir el repositorio a tu cuenta de GitHub y ejecutar `./scripts/demo-blocked-pr.sh`:

| Evidencia requerida por la rúbrica | Enlace / Ubicación |
| :--- | :--- |
| **1. Enlace al repositorio en GitHub (rama por defecto `main`)** | [https://github.com/raymundoht/taskflow](https://github.com/raymundoht/taskflow) |
| **2. Sitio web desplegado en GitHub Pages (abre en ventana privada)** | [https://raymundoht.github.io/taskflow/](https://raymundoht.github.io/taskflow/) |
| **3. Regla de protección de `main` (PR + 1 aprobación + check `test`)** | [https://github.com/raymundoht/taskflow/settings/branches](https://github.com/raymundoht/taskflow/settings/branches) ([ver guía](BRANCH_PROTECTION.md)) |
| **4. Pull Request bloqueado por prueba fallida y luego fusionado** | [https://github.com/raymundoht/taskflow/pulls](https://github.com/raymundoht/taskflow/pulls) (rama `feature/demo-bloqueado`) |
| **5. Ejecución en verde de CI y Deploy en GitHub Actions** | [https://github.com/raymundoht/taskflow/actions](https://github.com/raymundoht/taskflow/actions) |
