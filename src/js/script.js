/* 
    JS File to create, manage, delete tasks using LocalStorage
    Path : src/js/script.js
*/

// Constants



// Load saved tasks

const savedTasks = localStorage.getItem("tasksList")

let currentFilter = 'all'; // Valeurs possibles: 'all', 'todo', 'done'

// --- ÉTAT GLOBAL ---
let activeFilters = {
    status: 'all',
    priority: 'all',
    category: 'all'
};

let tasksList = []
if (savedTasks) {
    tasksList = JSON.parse(savedTasks)
    renderTasks()
}

// Utilities

function saveToLocalStorage() {
    localStorage.setItem("tasksList", JSON.stringify(tasksList));
}

// CRUD Functions

function createTask(title, description, category, priority, dueDate) {
    const task = {
        id : crypto.randomUUID(),
        title : title,
        description : description,
        category : category,
        isDone : false,
        priority : priority,
        dueDate : dueDate
    }
    return task
}

function addTask(title, description, category, priority, dueDate) {
    tasksList.push(createTask(title,description,category,priority,dueDate))
    saveToLocalStorage()
    renderTasks()
}

function updateTask(id, updates) {
    const index = tasksList.findIndex(task => task.id === id);
    if (index !== -1) {
        Object.assign(tasksList[index], updates)
        saveToLocalStorage()
        renderTasks()
    }
}

function toggleTaskStatus(id) {
    const task = tasksList.find(t => t.id === id);
    if (task) {
        task.isDone = !task.isDone;
        saveToLocalStorage();
        renderTasks();
    }
}

function deleteTask(id) {
    const index = tasksList.findIndex(task => task.id === id)
    if (index !== -1) {
        tasksList.splice(index, 1)
        saveToLocalStorage()
        renderTasks()
    }
}

// Filtering & Sorting functions

// --- LOGIQUE DE FILTRE ---
function updateFilters(type, value) {
    activeFilters[type] = value;
    renderTasks();
    document.getElementById('filter-dropdown').classList.remove('active');
}

// --- LOGIQUE DE TRI ---
function applySort(type) {
    if (type === 'priority') {
        tasksList.sort((a, b) => b.priority - a.priority);
    } else if (type === 'date') {
        tasksList.sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }
    renderTasks();
    document.getElementById('sort-dropdown').classList.remove('active');
}

// --- RENDER ---
function renderTasks() {
    const listElement = document.getElementById('task-list');
    listElement.innerHTML = "";

    const filteredTasks = tasksList.filter(task => {
        const matchStatus = activeFilters.status === 'all' || 
                           (activeFilters.status === 'done' ? task.isDone : !task.isDone);
        const matchPriority = activeFilters.priority === 'all' || 
                             task.priority === activeFilters.priority;
        const matchCategory = activeFilters.category === 'all' || 
                             task.category === activeFilters.category;

        return matchStatus && matchPriority && matchCategory;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item priority-${task.priority === 0 ? 'low' : task.priority === 1 ? 'medium' : 'high'}`;
        if (task.isDone) li.classList.add('done');

        li.innerHTML = `
            <div class="task-info">
                <div class="task-header">
                    <span class="category-tag">${task.category}</span>
                    <span class="due-date">${task.dueDate || 'No date'}</span>
                </div>
                <h4>${task.title}</h4>
                <p>${task.description}</p>
            </div>
            <div class="task-actions">
                <button onclick="toggleTaskStatus('${task.id}')" class="check-btn">✓</button>
                <button onclick="deleteTask('${task.id}')" class="delete-btn">×</button>
            </div>
        `;
        listElement.appendChild(li);
    });
}

// Event Listeners

const addBtn = document.getElementById('add-btn');
const closeModal = document.getElementById('close-modal');
const modalOverlay = document.getElementById('modal-overlay');
const filterBtn = document.getElementById('filter-btn');
const sortBtn = document.getElementById('sort-btn');

addBtn.addEventListener('click', () => {
    modalOverlay.classList.add('active');
    document.getElementById('task-title').focus();
});

closeModal.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});

const saveBtn = document.getElementById('save-task');

saveBtn.addEventListener('click', () => {
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    const category = document.getElementById('task-category').value;
    const priority = parseInt(document.getElementById('task-priority').value);
    const dueDate = document.getElementById('task-date').value;

    if (title.trim() === "") {
        alert("Please enter a title");
        return;
    }

    addTask(title, description, category, priority, dueDate);

    document.getElementById('task-title').value = "";
    document.getElementById('task-desc').value = "";
    document.getElementById('task-date').value = "";

    modalOverlay.classList.remove('active');
});

// Ouverture du menu Filtre
filterBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Empêche la fermeture immédiate
    document.getElementById('filter-dropdown').classList.toggle('active');
    document.getElementById('sort-dropdown').classList.remove('active');
});

// Ouverture du menu Tri
sortBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('sort-dropdown').classList.toggle('active');
    document.getElementById('filter-dropdown').classList.remove('active');
});

// Fermer les menus si on clique n'importe où ailleurs sur la page
window.addEventListener('click', () => {
    document.getElementById('filter-dropdown')?.classList.remove('active');
    document.getElementById('sort-dropdown')?.classList.remove('active');
});