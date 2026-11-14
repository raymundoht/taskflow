import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addTask,
  editTask,
  toggleTask,
  removeTask,
  clearCompleted,
  filterTasks,
  summarize,
  validateTitle,
  validatePriority,
  MAX_TITLE_LENGTH,
  PRIORITIES,
} from '../src/tasks.js';

describe('1. Casos normales (Normal cases)', () => {
  test('addTask agrega una tarea nueva con id, prioridad media por defecto y estado pendiente', () => {
    const out = addTask([], 'Estudiar pruebas unitarias', 1000);
    assert.deepEqual(out, [
      {
        id: 1,
        title: 'Estudiar pruebas unitarias',
        done: false,
        priority: 'medium',
        createdAt: 1000,
      },
    ]);
  });

  test('addTask acepta prioridades personalizadas (high, low) y mantiene inmutabilidad', () => {
    const original = [];
    const out = addTask(original, 'Configurar rama protegida', 2000, 'high');
    assert.equal(original.length, 0);
    assert.equal(out[0].priority, 'high');
    assert.deepEqual(PRIORITIES, ['low', 'medium', 'high']);
  });

  test('toggleTask alterna el estado de la tarea indicada sin alterar las demás', () => {
    const tasks = addTask(addTask([], 'Tarea A', 100), 'Tarea B', 200);
    const toggled = toggleTask(tasks, 2);
    assert.equal(toggled[1].done, true);
    assert.equal(toggled[0].done, false);
    assert.equal(toggleTask(toggled, 2)[1].done, false);
  });

  test('editTask actualiza el título de una tarea existente y normaliza espacios', () => {
    const tasks = addTask([], 'Título original', 100);
    const updated = editTask(tasks, 1, '  Título   actualizado  ');
    assert.equal(updated[0].title, 'Título actualizado');
    assert.equal(tasks[0].title, 'Título original');
  });

  test('removeTask elimina únicamente la tarea con el id indicado', () => {
    const tasks = addTask(addTask([], 'Tarea A'), 'Tarea B');
    const remaining = removeTask(tasks, 1);
    assert.deepEqual(
      remaining.map((t) => t.title),
      ['Tarea B']
    );
  });

  test('clearCompleted elimina todas las tareas hechas y conserva las pendientes', () => {
    let tasks = addTask(addTask(addTask([], 'A'), 'B'), 'C');
    tasks = toggleTask(tasks, 1);
    tasks = toggleTask(tasks, 3);
    const activeOnly = clearCompleted(tasks);
    assert.deepEqual(
      activeOnly.map((t) => t.title),
      ['B']
    );
  });

  test('filterTasks filtra por estado (all, active, done) y por búsqueda de texto', () => {
    let tasks = addTask(addTask(addTask([], 'Configurar CI'), 'Escribir README'), 'Desplegar Pages');
    tasks = toggleTask(tasks, 1);
    assert.deepEqual(
      filterTasks(tasks, 'done').map((t) => t.title),
      ['Configurar CI']
    );
    assert.deepEqual(
      filterTasks(tasks, 'active').map((t) => t.title),
      ['Escribir README', 'Desplegar Pages']
    );
    assert.deepEqual(
      filterTasks(tasks, 'all', 'pages').map((t) => t.title),
      ['Desplegar Pages']
    );
  });

  test('summarize calcula total, hechas, pendientes y porcentaje redondeado', () => {
    let tasks = addTask(addTask(addTask([], 'A'), 'B'), 'C');
    tasks = toggleTask(tasks, 1);
    assert.deepEqual(summarize(tasks), {
      total: 3,
      done: 1,
      pending: 2,
      percent: 33,
    });
  });
});

describe('2. Casos límite (Edge cases)', () => {
  test('summarize con lista vacía devuelve 0% sin dividir entre cero (NaN)', () => {
    assert.deepEqual(summarize([]), {
      total: 0,
      done: 0,
      pending: 0,
      percent: 0,
    });
  });

  test('summarize con todas las tareas completadas devuelve exactamente 100%', () => {
    let tasks = addTask(addTask([], 'A'), 'B');
    tasks = toggleTask(toggleTask(tasks, 1), 2);
    assert.deepEqual(summarize(tasks), {
      total: 2,
      done: 2,
      pending: 0,
      percent: 100,
    });
  });

  test('validateTitle recorta espacios extremos y colapsa múltiples espacios internos', () => {
    assert.equal(validateTitle('   Hacer   la    tarea  '), 'Hacer la tarea');
  });

  test('validateTitle acepta exactamente MAX_TITLE_LENGTH (80) y rechaza 81 caracteres', () => {
    const exact = 'a'.repeat(MAX_TITLE_LENGTH);
    assert.equal(validateTitle(exact).length, MAX_TITLE_LENGTH);
    assert.throws(() => validateTitle('a'.repeat(MAX_TITLE_LENGTH + 1)), RangeError);
  });

  test('addTask asigna ids únicos incrementales aunque se haya eliminado una tarea intermedia', () => {
    let tasks = addTask(addTask(addTask([], 'A'), 'B'), 'C');
    tasks = removeTask(tasks, 2);
    tasks = addTask(tasks, 'D');
    assert.deepEqual(
      tasks.map((t) => t.id),
      [1, 3, 4]
    );
  });

  test('editTask permite guardar el mismo título en la misma tarea (cambio de mayúsculas)', () => {
    const tasks = addTask([], 'revisar código');
    const edited = editTask(tasks, 1, 'Revisar Código');
    assert.equal(edited[0].title, 'Revisar Código');
  });

  test('clearCompleted y filterTasks con búsqueda sin coincidencias devuelven arreglos vacíos', () => {
    const tasks = addTask([], ' Única tarea ');
    assert.deepEqual(clearCompleted([]), []);
    assert.deepEqual(filterTasks(tasks, 'all', 'inexistente'), []);
  });
});

describe('3. Casos inválidos (Invalid cases)', () => {
  test('addTask rechaza títulos vacíos o compuestos solo por espacios en blanco', () => {
    assert.throws(() => addTask([], ''), RangeError);
    assert.throws(() => addTask([], '     '), RangeError);
  });

  test('addTask y validateTitle rechazan valores que no son texto (null, números, objetos)', () => {
    assert.throws(() => addTask([], null), TypeError);
    assert.throws(() => addTask([], 42), TypeError);
    assert.throws(() => validateTitle(undefined), TypeError);
  });

  test('addTask rechaza una lista de tareas que no sea un arreglo válido', () => {
    assert.throws(() => addTask(null, 'Tarea válida'), TypeError);
  });

  test('addTask rechaza títulos duplicados sin distinguir mayúsculas ni espacios extra', () => {
    const tasks = addTask([], 'Comprar pan');
    assert.throws(() => addTask(tasks, '  comprar   PAN '), /Ya existe/);
  });

  test('addTask y validatePriority rechazan prioridades desconocidas', () => {
    assert.throws(() => validatePriority('urgent'), RangeError);
    assert.throws(() => addTask([], 'Tarea', 1000, 'critical'), RangeError);
  });

  test('editTask falla si el nuevo título duplica otra tarea o si el id no existe', () => {
    const tasks = addTask(addTask([], 'Tarea 1'), 'Tarea 2');
    assert.throws(() => editTask(tasks, 2, 'tarea 1'), /Ya existe otra tarea/);
    assert.throws(() => editTask(tasks, 99, 'Tarea nueva'), /No existe/);
  });

  test('toggleTask y removeTask lanzan error cuando el id no existe', () => {
    assert.throws(() => toggleTask([], 99), /No existe/);
    assert.throws(() => removeTask([], 99), /No existe/);
  });

  test('filterTasks rechaza un filtro desconocido o un query que no sea texto', () => {
    assert.throws(() => filterTasks([], 'otro'), RangeError);
    assert.throws(() => filterTasks([], 'all', 123), TypeError);
  });
});
