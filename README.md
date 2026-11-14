# TaskFlow — Gestor de Tareas Web

Aplicación web de gestión de tareas desarrollada con **HTML5, CSS3 y JavaScript ES Modules sin dependencias externas**, diseñada para cumplir con todos los criterios de ingeniería de pruebas, integración continua (CI), reglas de fusión protegidas y despliegue automatizado de **Unit 4 · Evidence 4: Test and Release a Web App**.

- **Aplicación desplegada (GitHub Pages):** [https://raymundoht.github.io/taskflow/](https://raymundoht.github.io/taskflow/)
- **Repositorio en GitHub:** [https://github.com/raymundoht/taskflow](https://github.com/raymundoht/taskflow)
- **Integración Continua (CI):** [https://github.com/raymundoht/taskflow/actions](https://github.com/raymundoht/taskflow/actions) (`.github/workflows/ci.yml` — ejecuta las 23 pruebas unitarias y verifica el build en cada Pull Request)
- **Despliegue Continuo (CD):** `.github/workflows/deploy.yml` (prueba, empaqueta `dist/` y publica en GitHub Pages al fusionar en `main`)

---

## Tabla de contenidos
1. [Requisitos previos](#1-requisitos-previos)
2. [Instalación desde un clon limpio](#2-instalación-desde-un-clon-limpio)
3. [Ejecución en local](#3-ejecución-en-local)
4. [Pruebas unitarias (Normales, Límite e Inválidas)](#4-pruebas-unitarias-normales-límite-e-inválidas)
5. [Construcción (Build de producción)](#5-construcción-build-de-producción)
6. [Proceso de despliegue](#6-proceso-de-despliegue)
7. [Reglas de merge y protección de `main`](#7-reglas-de-merge-y-protección-de-main)
8. [Bitácora de desarrollo (Development Log)](#8-bitácora-de-desarrollo-development-log)
9. [Estructura del proyecto](#9-estructura-del-proyecto)
10. [Seguridad y manejo de secretos](#10-seguridad-y-manejo-de-secretos)

---

## 1. Requisitos previos
- **Node.js 22 LTS** o superior (incluye el ejecutor nativo de pruebas `node:test` y soporte de ES Modules).
- **Git** 2.30+.
- No requiere `npm install` ni paquetes de terceros: el proyecto tiene **cero dependencias externas**, por lo que corre inmediatamente desde un clon limpio.

---

## 2. Instalación desde un clon limpio

```bash
git clone https://github.com/raymundoht/taskflow.git
cd taskflow
```

Para comprobar que el entorno está listo tras clonar:

```bash
node --version   # Debe mostrar v22.x.x o superior
npm test         # Ejecuta las 23 pruebas unitarias inmediatamente
```

---

## 3. Ejecución en local

Inicia el servidor estático incluido en `scripts/serve.js`:

```bash
npm start
```

Abre en tu navegador: **[http://localhost:3000](http://localhost:3000)**

*(Si deseas usar otro puerto, ejecuta `PORT=4000 npm start`).*

### Funcionalidades principales de la aplicación
- **Creación de tareas con prioridad:** Alta (`high`), Media (`medium`) o Baja (`low`), con validación de longitud máxima (80 caracteres) y prevención de duplicados.
- **Edición y cambio de estado:** Marca/desmarca tareas como completadas, edita su título o elimínalas individualmente.
- **Filtros combinados y búsqueda en vivo:** Filtra por estado (*Todas*, *Pendientes*, *Hechas*) y busca por texto en tiempo real.
- **Limpieza rápida:** Botón para eliminar todas las tareas completadas en un paso.
- **Panel de métricas y barra de progreso:** Calcula total, pendientes, completadas y porcentaje de avance redondeado.
- **Persistencia local:** Almacenamiento automático en `localStorage` bajo la clave `taskflow.tasks`.

---

## 4. Pruebas unitarias (Normales, Límite e Inválidas)

Para ejecutar toda la suite de pruebas unitarias:

```bash
npm test
```

Las **23 pruebas unitarias** están implementadas en [`test/tasks.test.js`](test/tasks.test.js) usando `node:test` y `node:assert/strict`, divididas explícitamente en las tres categorías evaluadas en la rúbrica:

| Categoría | Cantidad | Casos cubiertos |
| :--- | :---: | :--- |
| **1. Casos normales** | 8 | Creación con prioridad por defecto y personalizada, inmutabilidad, alternar estado (`toggleTask`), editar título (`editTask`), eliminar por ID (`removeTask`), limpiar completadas (`clearCompleted`), filtrado por estado/búsqueda (`filterTasks`) y cálculo de métricas (`summarize`). |
| **2. Casos límite (Edge)** | 7 | `summarize([])` con lista vacía devuelve `0%` sin división entre cero (`NaN`), `100%` al completar todas, recorte y colapso de espacios repetidos, límite exacto de 80 vs. 81 caracteres (`MAX_TITLE_LENGTH`), generación de IDs únicos tras borrar elementos intermedios, edición cambiando solo mayúsculas/minúsculas y búsquedas sin coincidencias. |
| **3. Casos inválidos** | 8 | Rechazo de títulos vacíos o de solo espacios (`RangeError`), tipos no textuales como `null`/`number`/`undefined` (`TypeError`), lista de tareas inválida (`TypeError`), títulos duplicados sin importar mayúsculas/espacios (`Error`), prioridades desconocidas (`RangeError`), edición duplicada o con ID inexistente (`Error`), `toggleTask`/`removeTask` con ID inexistente y filtros desconocidos (`RangeError`). |

---

## 5. Construcción (Build de producción)

Para generar la carpeta estática lista para producción (`dist/`):

```bash
npm run build
```

Este comando limpia `dist/` y copia únicamente los artefactos públicos (`index.html` y `src/`).

---

## 6. Proceso de despliegue

El proyecto se despliega automáticamente en **GitHub Pages** mediante GitHub Actions (`.github/workflows/deploy.yml`) cada vez que un Pull Request se fusiona en `main`.

La guía operativa completa para cualquier integrante del equipo (**Antes de desplegar → Desplegar → Verificar → Revertir (Rollback) → Registrar → Limpieza de recursos**) se encuentra documentada paso a paso en:

- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

---

## 7. Reglas de merge y protección de `main`

La rama `main` está protegida con las siguientes reglas obligatorias:
1. **Pull Request obligatorio** antes de fusionar (prohibido hacer `git push` directo a `main`).
2. **Al menos 1 aprobación** de revisión de código requerida.
3. **Status check obligatorio (`test`) en verde** y rama actualizada con respecto a `main`.
4. **Evidencia de Pull Request bloqueado y luego corregido:** Documentada paso a paso con su script reproducible (`./scripts/demo-blocked-pr.sh`) en:

- **[docs/BRANCH_PROTECTION.md](docs/BRANCH_PROTECTION.md)**

---

## 8. Bitácora de desarrollo (Development Log)

El registro cronológico con las entradas fechadas (qué se hizo, por qué, evidencia en commits/capturas y problemas encontrados con su solución) se encuentra en:

- **[docs/DEVELOPMENT_LOG.md](docs/DEVELOPMENT_LOG.md)**

---

## 9. Estructura del proyecto

```text
taskflow/
├── index.html                        # Interfaz principal de la aplicación
├── package.json                      # Scripts npm (test, start, build) y motor Node >= 22
├── src/
│   ├── tasks.js                      # Lógica pura de negocio (100% cubierta por pruebas unitarias)
│   ├── app.js                        # Controlador de interfaz (DOM + localStorage)
│   └── styles.css                    # Diseño responsivo y accesible
├── test/
│   └── tasks.test.js                 # 23 pruebas unitarias (normales, límite e inválidas)
├── scripts/
│   ├── serve.js                      # Servidor HTTP local sin dependencias (con protección de rutas)
│   ├── build.js                      # Empaquetador hacia dist/ para GitHub Pages
│   └── demo-blocked-pr.sh            # Script multiplataforma para demostrar un PR bloqueado por CI
├── .github/
│   ├── pull_request_template.md      # Plantilla de verificación para cada Pull Request
│   └── workflows/
│       ├── ci.yml                    # Workflow CI: ejecuta pruebas y build en cada PR
│       └── deploy.yml                # Workflow CD: pruebas + build + publicación en GitHub Pages
└── docs/
    ├── DEPLOYMENT.md                 # Manual operativo: antes, desplegar, verificar, rollback y registro
    ├── BRANCH_PROTECTION.md          # Reglas de protección de main y caso documentado de PR bloqueado
    └── DEVELOPMENT_LOG.md            # Bitácora de desarrollo con entradas fechadas, evidencias y fixes
```

---

## 10. Seguridad y manejo de secretos
- **Cero secretos en el repositorio:** No se almacenan contraseñas, tokens personales (PAT), llaves privadas ni archivos `.env` en el historial de Git (`.gitignore` bloquea cualquier archivo `.env*`).
- **Autenticación efímera OIDC:** El despliegue a GitHub Pages utiliza únicamente el token efímero automático de GitHub Actions (`GITHUB_TOKEN`) con permisos mínimos (`contents: read`, `pages: write`, `id-token: write`).
- **Prevención de XSS:** Todos los textos ingresados por el usuario se insertan en el DOM mediante `textContent`, nunca con `innerHTML`.
