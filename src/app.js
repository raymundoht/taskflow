import { addTask, toggleTask, removeTask, filterTasks, summarize } from './tasks.js';

const KEY = 'taskflow.tasks';
let tasks = [];
let filter = 'all';

const $ = (s) => document.querySelector(s);

function load() {
  try { tasks = JSON.parse(localStorage.getItem(KEY)) ?? []; } catch { tasks = []; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch { /* almacenamiento no disponible */ }
}

function render() {
  const list = $('#list');
  list.replaceChildren();
  for (const t of filterTasks(tasks, filter)) {
    const li = document.createElement('li');
    li.className = t.done ? 'done' : '';
    const label = document.createElement('label');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = t.done;
    box.addEventListener('change', () => act(() => toggleTask(tasks, t.id)));
    label.append(box, ' ', t.title); // textContent: evita inyección de HTML
    const del = document.createElement('button');
    del.textContent = 'Eliminar';
    del.setAttribute('aria-label', `Eliminar ${t.title}`);
    del.addEventListener('click', () => act(() => removeTask(tasks, t.id)));
    li.append(label, del);
    list.append(li);
  }
  const s = summarize(tasks);
  $('#summary').textContent = `${s.done} de ${s.total} completadas (${s.percent}%)`;
}

function act(fn) {
  try { tasks = fn(); $('#error').textContent = ''; save(); render(); }
  catch (e) { $('#error').textContent = e.message; }
}

$('#form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('#title');
  act(() => addTask(tasks, input.value));
  if (!$('#error').textContent) input.value = '';
});
document.querySelectorAll('[data-filter]').forEach((b) =>
  b.addEventListener('click', () => { filter = b.dataset.filter; render(); }));

load();
render();
