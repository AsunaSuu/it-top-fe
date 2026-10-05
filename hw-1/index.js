const state = {
  todos: [],
  filter: 'all',
  search: '',
};

let isSaving = false;

const todoForm = document.querySelector('#todoForm');
const todoInput = document.querySelector('#todoInput');
const todoList = document.querySelector('#todoList');
const searchInput = document.querySelector('#searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.querySelector('#clearCompletedBtn');
const totalCount = document.querySelector('#totalCount');
const activeCount = document.querySelector('#activeCount');
const doneCount = document.querySelector('#doneCount');
const headerBadge = document.querySelector('#headerBadge');

function wait(delay, value) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, delay);
  });
}

function saveTodo(todo) {
  return wait(500, todo);
}

function removeTodoFromServer(id) {
  return wait(500, id);
}

function clearCompletedOnServer() {
  return wait(500, true);
}

function createDeleteHandler(id) {
  return function () {
    deleteTodo(id);
  };
}

function createToggleHandler(id) {
  return function () {
    toggleTodo(id);
  };
}

async function addTodo() {
  if (isSaving) return;

  const text = todoInput.value.trim();
  if (!text) return;

  isSaving = true;

  const submitButton = todoForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Сохраняем...';

  const newTodo = {
    id: Date.now(),
    text: text,
    completed: false,
  };

  await saveTodo(newTodo);

  state.todos.push(newTodo);
  todoInput.value = '';
  renderTodos();

  submitButton.disabled = false;
  submitButton.textContent = 'Добавить';
  isSaving = false;
}

async function deleteTodo(id) {
  if (isSaving) return;
  isSaving = true;

  const li = todoList.querySelector(`[data-id="${id}"]`);
  if (li) {
    li.classList.add('loading');
  }

  await removeTodoFromServer(id);

  state.todos = state.todos.filter((todo) => todo.id !== id);
  renderTodos();

  isSaving = false;
}

function toggleTodo(id) {
  const todo = state.todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    renderTodos();
  }
}

function searchTodos() {
  state.search = searchInput.value;
  renderTodos();
}

function getFilteredTodos() {
  const searchLower = state.search.toLowerCase();

  return state.todos.filter((todo) => {
    const matchesSearch = todo.text.toLowerCase().includes(searchLower);

    if (state.filter === 'active') {
      return !todo.completed && matchesSearch;
    }
    if (state.filter === 'completed') {
      return todo.completed && matchesSearch;
    }
    return matchesSearch;
  });
}

async function clearCompleted() {
  if (isSaving) return;

  const hasCompleted = state.todos.some((todo) => todo.completed);
  if (!hasCompleted) return;

  isSaving = true;
  clearCompletedBtn.disabled = true;
  clearCompletedBtn.textContent = 'Сохраняем...';

  await clearCompletedOnServer();

  state.todos = state.todos.filter((todo) => !todo.completed);
  renderTodos();

  clearCompletedBtn.disabled = false;
  clearCompletedBtn.textContent = 'Очистить выполненные';
  isSaving = false;
}

function renderTodos() {
  const filtered = getFilteredTodos();
  todoList.innerHTML = '';

  if (filtered.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.className = 'empty-state';
    emptyLi.textContent = 'Ничего не найдено';
    todoList.appendChild(emptyLi);
  } else {
    filtered.forEach((todo) => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.completed ? ' completed' : '');
      li.dataset.id = todo.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', createToggleHandler(todo.id));

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = todo.text;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', createDeleteHandler(todo.id));

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
    });
  }

  updateStats();
}

function updateStats() {
  const total = state.todos.length;
  const active = state.todos.filter((t) => !t.completed).length;
  const done = state.todos.filter((t) => t.completed).length;

  totalCount.textContent = total;
  activeCount.textContent = active;
  doneCount.textContent = done;

  headerBadge.textContent = active + ' tasks';
}

function setActiveFilter(button) {
  state.filter = button.dataset.filter;
  filterButtons.forEach((btn) => btn.classList.remove('active'));
  button.classList.add('active');
  renderTodos();
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTodo();
});

searchInput.addEventListener('input', () => {
  searchTodos();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveFilter(button);
  });
});

clearCompletedBtn.addEventListener('click', () => {
  clearCompleted();
});

renderTodos();
