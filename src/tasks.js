// Lógica pura de TaskFlow: sin DOM, por eso se prueba fácilmente con pruebas unitarias.

export const MAX_TITLE_LENGTH = 80;

/** Valida y normaliza el título de una tarea. Lanza Error si no es válido. */
export function validateTitle(title) {
  if (typeof title !== 'string') throw new TypeError('El título debe ser texto');
  const clean = title.trim().replace(/\s+/g, ' ');
  if (clean.length === 0) throw new RangeError('El título no puede estar vacío');
  if (clean.length > MAX_TITLE_LENGTH) {
    throw new RangeError(`El título no puede superar ${MAX_TITLE_LENGTH} caracteres`);
  }
  return clean;
}

/** Devuelve una nueva lista con la tarea añadida (no modifica la original). */
export function addTask(tasks, title, now = Date.now()) {
  const clean = validateTitle(title);
  const duplicate = tasks.some((t) => t.title.toLowerCase() === clean.toLowerCase());
  if (duplicate) throw new Error('Ya existe una tarea con ese título');
  const id = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  return [...tasks, { id, title: clean, done: false, createdAt: now }];
}

/** Marca/desmarca una tarea. Si el id no existe, lanza Error. */
export function toggleTask(tasks, id) {
  if (!tasks.some((t) => t.id === id)) throw new Error(`No existe la tarea ${id}`);
  return tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

/** Elimina una tarea por id. */
export function removeTask(tasks, id) {
  if (!tasks.some((t) => t.id === id)) throw new Error(`No existe la tarea ${id}`);
  return tasks.filter((t) => t.id !== id);
}

/** Filtra por estado: 'all' | 'active' | 'done'. */
export function filterTasks(tasks, filter = 'all') {
  switch (filter) {
    case 'all': return [...tasks];
    case 'active': return tasks.filter((t) => !t.done);
    case 'done': return tasks.filter((t) => t.done);
    default: throw new RangeError(`Filtro desconocido: ${filter}`);
  }
}

/** Resumen para mostrar en pantalla. El porcentaje es 0 cuando no hay tareas. */
export function summarize(tasks) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  return { total, done, pending: total - done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
