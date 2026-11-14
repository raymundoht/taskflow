import {
  addTask,
  editTask,
  toggleTask,
  removeTask,
  clearCompleted,
  filterTasks,
  summarize,
} from './tasks.js';

const KEY = 'taskflow.tasks';
const PRIORITY_LABELS = { high: 'Alta', medium: 'Media', low: 'Baja' };

let tasks = [];
let filter = 'all';
let query = '';

const $ = (s) => document.querySelector(s);

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    tasks = Array.isArray(raw) ? raw : [];
  } catch {
    tasks = [];
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch {
    /* localStorage no disponible en modo restringido */
  }
}

function render() {
  const list = $('#list');
  list.replaceChildren();

  const visible = filterTasks(tasks, filter, query);

  for (const t of visible) {
    const li = document.createElement('li');
    li.className = `task-item${t.done ? ' done' : ''}`;

    const label = document.createElement('label');
    label.className = 'task-label';

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = Boolean(t.done);
    box.addEventListener('change', () => act(() => toggleTask(tasks, t.id)));

    const titleSpan = document.createElement('span');
    titleSpan.className = 'task-title';
    titleSpan.textContent = t.title; // Uso de textContent: previene inyección XSS

    const prio = t.priority || 'medium';
    const badge = document.createElement('span');
    badge.className = `priority-badge priority-${prio}`;
    badge.textContent = PRIORITY_LABELS[prio] ?? 'Media';

    label.append(box, titleSpan, badge);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-action';
    editBtn.textContent = 'Editar';
    editBtn.setAttribute('aria-label', `Editar ${t.title}`);
    editBtn.addEventListener('click', () => {
      const next = window.prompt('Editar título de la tarea:', t.title);
      if (next !== null) {
        act(() => editTask(tasks, t.id, next));
      }
    });

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn-action btn-delete';
    del.textContent = 'Eliminar';
    del.setAttribute('aria-label', `Eliminar ${t.title}`);
    del.addEventListener('click', () => act(() => removeTask(tasks, t.id)));

    actions.append(editBtn, del);
    li.append(label, actions);
    list.append(li);
  }

  const emptyState = $('#empty-state');
  if ( emptyState ) {
    emptyState.hidden = visible.length > 0;
  }

  const s = summarize(tasks);
  $('#summary').textContent = `${s.done} de ${s.total} completadas (${s.percent}%)`;

  if ($('#stat-total')) $('#stat-total').textContent = String(s.total);
  if ($('#stat-pending')) $('#stat-pending').textContent = String(s.pending);
  if ($('#stat-done')) $('#stat-done').textContent = String(s.done);
  if ($('#stat-percent')) $('#stat-percent').textContent = `${s.percent}%`;

  const bar = $('#progress-bar');
  const container = $('#progress-container');
  if (bar) bar.style.width = `${s.percent}%`;
  if (container) container.setAttribute('aria-valuenow', String(s.percent));

  const clearBtn = $('#clear-completed');
  if (clearBtn) {
    clearBtn.hidden = s.done === 0;
  }
}

function act(fn) {
  try {
    tasks = fn();
    $('#error').textContent = '';
    save();
    render();
  } catch (e) {
    $('#error').textContent = e.message;
  }
}

$('#form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('#title');
  const prioritySelect = $('#priority');
  const priority = prioritySelect ? prioritySelect.value : 'medium';
  act(() => addTask(tasks, input.value, Date.now(), priority));
  if (!$('#error').textContent) {
    input.value = '';
    input.focus();
  }
});

document.querySelectorAll('[data-filter]').forEach((btn) => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((b) => {
      const isCurrent = b === btn;
      b.classList.toggle('active', isCurrent);
      b.setAttribute('aria-pressed', String(isCurrent));
    });
    render();
  });
});

const searchInput = $('#search');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    query = e.target.value;
    render();
  });
}

const clearBtn = $('#clear-completed');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    act(() => clearCompleted(tasks));
  });
}

const seedBtn = $('#seed-btn');
if (seedBtn) {
  seedBtn.addEventListener('click', () => {
    act(() => {
      let next = [...tasks];
      const samples = [
        ['Escribir pruebas unitarias para casos normales, límite e inválidos', 'high'],
        ['Configurar protección de la rama main en GitHub', 'high'],
        ['Documentar PR bloqueado por CI en la bitácora', 'medium'],
        ['Verificar despliegue automático en GitHub Pages', 'low'],
      ];
      for (const [title, prio] of samples) {
        try {
          next = addTask(next, title, Date.now(), prio);
        } catch {
          /* ignorar si alguna ya existe */
        }
      }
      return next;
    });
  });
}

load();
render();
