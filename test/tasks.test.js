import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addTask, toggleTask, removeTask, filterTasks, summarize, validateTitle, MAX_TITLE_LENGTH } from '../src/tasks.js';

// --- Casos normales ---
test('addTask agrega una tarea nueva con id y estado pendiente', () => {
  const out = addTask([], 'Estudiar pruebas', 1000);
  assert.deepEqual(out, [{ id: 1, title: 'Estudiar pruebas', done: false, createdAt: 1000 }]);
});

test('addTask no modifica la lista original (inmutabilidad)', () => {
  const original = [];
  addTask(original, 'Una tarea');
  assert.equal(original.length, 0);
});

test('toggleTask alterna el estado de la tarea indicada', () => {
  const tasks = addTask(addTask([], 'A'), 'B');
  const out = toggleTask(tasks, 2);
  assert.equal(out[1].done, true);
  assert.equal(out[0].done, false);
  assert.equal(toggleTask(out, 2)[1].done, false);
});

test('filterTasks devuelve solo pendientes o solo hechas', () => {
  let tasks = addTask(addTask([], 'A'), 'B');
  tasks = toggleTask(tasks, 1);
  assert.deepEqual(filterTasks(tasks, 'done').map((t) => t.title), ['A']);
  assert.deepEqual(filterTasks(tasks, 'active').map((t) => t.title), ['B']);
  assert.equal(filterTasks(tasks).length, 2);
});

test('summarize calcula total, hechas, pendientes y porcentaje', () => {
  let tasks = addTask(addTask(addTask([], 'A'), 'B'), 'C');
  tasks = toggleTask(tasks, 1);
  assert.deepEqual(summarize(tasks), { total: 3, done: 1, pending: 2, percent: 33 });
});

test('removeTask elimina solo la tarea indicada', () => {
  const tasks = addTask(addTask([], 'A'), 'B');
  assert.deepEqual(removeTask(tasks, 1).map((t) => t.title), ['B']);
});

// --- Casos límite ---
test('summarize con lista vacía da 0% sin dividir entre cero', () => {
  assert.deepEqual(summarize([]), { total: 0, done: 0, pending: 0, percent: 0 });
});

test('validateTitle recorta espacios y colapsa espacios repetidos', () => {
  assert.equal(validateTitle('   Hacer   la   tarea  '), 'Hacer la tarea');
});

test('validateTitle acepta exactamente el largo máximo y rechaza uno más', () => {
  assert.equal(validateTitle('a'.repeat(MAX_TITLE_LENGTH)).length, MAX_TITLE_LENGTH);
  assert.throws(() => validateTitle('a'.repeat(MAX_TITLE_LENGTH + 1)), RangeError);
});

test('addTask asigna ids únicos aunque se haya eliminado una tarea intermedia', () => {
  let tasks = addTask(addTask(addTask([], 'A'), 'B'), 'C');
  tasks = removeTask(tasks, 2);
  tasks = addTask(tasks, 'D');
  assert.deepEqual(tasks.map((t) => t.id), [1, 3, 4]);
});

// --- Casos inválidos ---
test('addTask rechaza títulos vacíos o solo espacios', () => {
  assert.throws(() => addTask([], ''), RangeError);
  assert.throws(() => addTask([], '    '), RangeError);
});

test('addTask rechaza valores que no son texto', () => {
  assert.throws(() => addTask([], null), TypeError);
  assert.throws(() => addTask([], 42), TypeError);
});

test('addTask rechaza títulos duplicados sin distinguir mayúsculas', () => {
  const tasks = addTask([], 'Comprar pan');
  assert.throws(() => addTask(tasks, 'comprar PAN'), /Ya existe/);
});

test('toggleTask y removeTask fallan con un id inexistente', () => {
  assert.throws(() => toggleTask([], 99), /No existe/);
  assert.throws(() => removeTask([], 99), /No existe/);
});

test('filterTasks rechaza un filtro desconocido', () => {
  assert.throws(() => filterTasks([], 'otro'), RangeError);
});
