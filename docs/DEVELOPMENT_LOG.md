# Bitácora de desarrollo — TaskFlow

Autor: Raymundo Javier Herrera Quezada · Grupo IDGBIS92N · Desarrollo Web Integral
Herramientas: Node.js 22, GitHub Actions, GitHub Pages; borrador inicial del código y la documentación elaborado con ayuda del asistente Claude.

> **Cómo usar este archivo:** las entradas 1 a 5 describen trabajo ya hecho (los commits existen en el historial). Las entradas 6 a 10 están **por completar**: haz cada paso, pon la **fecha real** de ese día, pega el enlace o la captura y escribe los problemas que encontraste. No dejes fechas inventadas.

---

## Entrada 1 — 2026-11-13 · Idea y lógica del proyecto
- **Qué hice:** definí TaskFlow (gestor de tareas) y escribí la lógica pura en `src/tasks.js`: validar título, agregar, alternar, eliminar, filtrar y resumir.
- **Por qué:** separar la lógica del DOM permite probarla con pruebas unitarias rápidas, sin navegador.
- **Evidencia:** commit `49a95ac` — `<URL del repo>/commit/49a95ac`
- **Problemas y solución:** ninguno relevante; decidí que las funciones no modifiquen la lista original (devuelven una nueva) para evitar errores difíciles de rastrear.

## Entrada 2 — 2026-11-13 · Pruebas unitarias
- **Qué hice:** 15 pruebas con el módulo nativo `node:test`: 6 normales, 4 límite (lista vacía, título de 80 vs 81 caracteres, ids tras eliminar) y 5 inválidas (vacío, no-texto, duplicado, id inexistente, filtro desconocido).
- **Por qué:** la rúbrica pide casos normales, límite e inválidos; usar `node:test` evita instalar dependencias.
- **Evidencia:** commit `4e0bd44` — `<URL del repo>/commit/4e0bd44`
- **Problemas y solución:** `node --test test/` falló en Node 22 con `Cannot find module '/…/test'` (lo trata como archivo). Lo resolví con un glob: `node --test "test/**/*.test.js"`.

## Entrada 3 — 2026-11-13 · Interfaz web y servidor local
- **Qué hice:** `index.html`, `src/app.js` (DOM + localStorage), estilos, `npm start` (servidor estático propio) y `npm run build` que copia a `dist/`.
- **Por qué:** una app que corra desde un clon limpio sin `npm install`.
- **Evidencia:** commit `bf2171e` — `<URL del repo>/commit/bf2171e` · captura de la app: `<pegar captura>`
- **Problemas y solución:** para evitar inyección de HTML mostré los títulos con `textContent` y no con `innerHTML`.

## Entrada 4 — 2026-11-13 · CI y flujo de despliegue
- **Qué hice:** `ci.yml` (corre `npm test` en cada pull request y push a main) y `deploy.yml` (pruebas → build → GitHub Pages).
- **Por qué:** que ningún cambio llegue a main sin pasar pruebas; el job se llama `test` porque ese nombre es el status check que exigirá la protección.
- **Evidencia:** commit `0bed41d` — `<URL del repo>/commit/0bed41d`
- **Problemas y solución:** pendiente de verificar en GitHub (primera ejecución del workflow).

## Entrada 5 — 2026-11-13 · Documentación
- **Qué hice:** README, `docs/DEPLOYMENT.md` (antes, desplegar, verificar, revertir, registrar) y `docs/BRANCH_PROTECTION.md`.
- **Por qué:** que un compañero pueda instalar, probar y desplegar siguiendo solo el texto.
- **Evidencia:** commit `77c1b73` — `<URL del repo>/commit/77c1b73`
- **Problemas y solución:** ninguno.

## Entrada 6 — FECHA: ____ · Subir el repositorio a GitHub
- **Qué hice:** *(crear el repo, `git remote add origin …`, `git push -u origin main`)*
- **Por qué:**
- **Evidencia:** enlace al repo · captura de la pestaña Actions con el primer CI en verde
- **Problemas y solución:**

## Entrada 7 — FECHA: ____ · Proteger la rama main
- **Qué hice:** *(Settings → Branches: PR obligatorio, 1 aprobación, check `test` requerido)*
- **Por qué:**
- **Evidencia:** captura de la regla guardada
- **Problemas y solución:** *(p. ej. el check `test` no aparecía hasta que el CI corrió una vez)*

## Entrada 8 — FECHA: ____ · Pull request bloqueado por una prueba fallida
- **Qué hice:** *(`./scripts/demo-blocked-pr.sh`, abrir PR, ver el check en rojo)*
- **Por qué:** demostrar que la regla de merge funciona.
- **Evidencia:** enlace al PR · captura 1 (check rojo, Merge bloqueado)
- **Problemas y solución:**

## Entrada 9 — FECHA: ____ · Corregir y fusionar ese pull request
- **Qué hice:** *(`./scripts/demo-blocked-pr.sh --fix`, check verde, aprobación del compañero, merge)*
- **Por qué:**
- **Evidencia:** captura 2 (check verde) · captura 3 (PR fusionado con la aprobación) · enlace al commit de merge
- **Problemas y solución:**

## Entrada 10 — FECHA: ____ · Despliegue y verificación
- **Qué hice:** *(activar Pages con Source = GitHub Actions, ver Deploy en verde, abrir el sitio en ventana privada, seguir la lista de `DEPLOYMENT.md`)*
- **Por qué:**
- **Evidencia:** URL del sitio · captura de Actions → Deploy en verde
- **Problemas y solución:** *(y si probaste el rollback, descríbelo aquí)*

## Entrada 11 — FECHA: ____ · Cierre y limpieza
- **Qué hice:** *(clon limpio + `npm test`, repo abierto en ventana privada, recursos que ya no necesito eliminados)*
- **Evidencia:** captura de `npm test` en verde desde un clon limpio
