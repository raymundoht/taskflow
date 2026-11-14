// Lógica pura de TaskFlow: sin acceso al DOM ni efectos secundarios.
// Todas las funciones son puras e inmutables para facilitar las pruebas unitarias.

export const MAX_TITLE_LENGTH = 80;
export const PRIORITIES = Object.freeze(['low', 'medium', 'high']);

/**
 * Valida y normaliza el título de una tarea.
 * Recorta espacios al inicio/final y colapsa múltiples espacios internos.
 * Lanza TypeError si no es string o RangeError si está vacío o supera MAX_TITLE_LENGTH.
 */
export function validateTitle(title) {
  if (typeof title !== 'string') {
    throw new TypeError('El título debe ser texto');
  }
  const clean = title.trim().replace(/\s+/g, ' ');
  if (clean.length === 0) {
    throw new RangeError('El título no puede estar vacío');
  }
  if (clean.length > MAX_TITLE_LENGTH) {
    throw new RangeError(`El título no puede superar ${MAX_TITLE_LENGTH} caracteres`);
  }
  return clean;
}

/**
 * Valida que la prioridad sea 'low', 'medium' o 'high'.
 * Lanza RangeError si recibe un valor desconocido.
 */
export function validatePriority(priority = 'medium') {
  if (typeof priority !== 'string' || !PRIORITIES.includes(priority)) {
    throw new RangeError(`Prioridad inválida: ${priority}. Usa: ${PRIORITIES.join(', ')}`);
  }
  return priority;
}

/**
 * Devuelve una nueva lista con la tarea añadida (no modifica la lista original).
 */
export function addTask(tasks, title, now = Date.now(), priority = 'medium') {
  if (!Array.isArray(tasks)) {
    throw new TypeError('La lista de tareas debe ser un arreglo');
  }
  const clean = validateTitle(title);
  const validPriority = validatePriority(priority);
  const duplicate = tasks.some((t) => t.title.toLowerCase() === clean.toLowerCase());
  if (duplicate) {
    throw new Error('Ya existe una tarea con ese título');
  }
  const id = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  return [
    ...tasks,
    { id, title: clean, done: false, priority: validPriority, createdAt: now },
  ];
}

/**
 * Actualiza el título de una tarea existente por su id.
 * Verifica que el id exista, valida el nuevo título y evita duplicados con otras tareas.
 */
export function editTask(tasks, id, newTitle) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('La lista de tareas debe ser un arreglo');
  }
  const clean = validateTitle(newTitle);
  const exists = tasks.some((t) => t.id === id);
  if (!exists) {
    throw new Error(`No existe la tarea ${id}`);
  }
  const duplicate = tasks.some(
    (t) => t.id !== id && t.title.toLowerCase() === clean.toLowerCase()
  );
  if (duplicate) {
    throw new Error('Ya existe otra tarea con ese título');
  }
  return tasks.map((t) => (t.id === id ? { ...t, title: clean } : t));
}

/**
 * Marca o desmarca una tarea como completada. Si el id no existe, lanza Error.
 */
export function toggleTask(tasks, id) {
  if (!tasks.some((t) => t.id === id)) {
    throw new Error(`No existe la tarea ${id}`);
  }
  return tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

/**
 * Elimina una tarea por id. Si el id no existe, lanza Error.
 */
export function removeTask(tasks, id) {
  if (!tasks.some((t) => t.id === id)) {
    throw new Error(`No existe la tarea ${id}`);
  }
  return tasks.filter((t) => t.id !== id);
}

/**
 * Elimina todas las tareas completadas y devuelve una nueva lista solo con las pendientes.
 */
export function clearCompleted(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('La lista de tareas debe ser un arreglo');
  }
  return tasks.filter((t) => !t.done);
}

/**
 * Filtra tareas por estado ('all' | 'active' | 'done') y opcionalmente por texto de búsqueda.
 */
export function filterTasks(tasks, filter = 'all', query = '') {
  if (!Array.isArray(tasks)) {
    throw new TypeError('La lista de tareas debe ser un arreglo');
  }
  let byStatus;
  switch (filter) {
    case 'all':
      byStatus = [...tasks];
      break;
    case 'active':
      byStatus = tasks.filter((t) => !t.done);
      break;
    case 'done':
      byStatus = tasks.filter((t) => t.done);
      break;
    default:
      throw new RangeError(`Filtro desconocido: ${filter}`);
  }

  if (typeof query !== 'string') {
    throw new TypeError('El texto de búsqueda debe ser texto');
  }
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length === 0) {
    return byStatus;
  }
  return byStatus.filter((t) => t.title.toLowerCase().includes(cleanQuery));
}

/**
 * Calcula estadísticas de las tareas para el panel de progreso.
 * El porcentaje es 0 cuando no hay tareas para evitar división entre cero.
 */
export function summarize(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('La lista de tareas debe ser un arreglo');
  }
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pending = total - done;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, pending, percent };
}
