// script.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('task-form');
    const titleInput = document.getElementById('task-title');
    const descriptionInput = document.getElementById('task-description');
    const priorityInput = document.getElementById('task-priority');
    const dueDateInput = document.getElementById('task-due-date');
    const categoryInput = document.getElementById('task-category');
    const notesInput = document.getElementById('task-notes');
    const reminderInput = document.getElementById('task-reminder');
    const taskList = document.getElementById('task-list');
    const viewSelect = document.getElementById('view-select');
    const taskFormContainer = document.getElementById('task-form-container');
    const taskTableContainer = document.getElementById('task-table-container');
    const showFormLink = document.getElementById('show-form');
    const showTableLink = document.getElementById('show-table');

    // Inicialmente mostra o formulário
    showTableLink.addEventListener('click', (e) => {
        e.preventDefault();
        taskFormContainer.style.display = 'none';
        taskTableContainer.style.display = 'block';
        loadTasks(); // Carrega as tarefas ao exibir a tabela
    });

    showFormLink.addEventListener('click', (e) => {
        e.preventDefault();
        taskFormContainer.style.display = 'block';
        taskTableContainer.style.display = 'none';
    });

    // Carregar tarefas do localStorage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        taskList.innerHTML = ''; // Limpa a tabela antes de adicionar as tarefas
        tasks.forEach(task => addTaskToTable(task));
    }

    // Adiciona uma tarefa ao localStorage e à tabela
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const task = {
            title: titleInput.value,
            description: descriptionInput.value,
            priority: parseInt(priorityInput.value, 10),
            dueDate: dueDateInput.value,
            category: categoryInput.value,
            notes: notesInput.value,
            reminder: reminderInput.value,
            completed: false // Inicialmente a tarefa não está concluída
        };
        addTaskToStorage(task);
        // Limpar os campos do formulário após adicionar
        titleInput.value = '';
        descriptionInput.value = '';
        priorityInput.value = '';
        dueDateInput.value = '';
        categoryInput.value = '';
        notesInput.value = '';
        reminderInput.value = '';
    });

    function addTaskToStorage(task) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        addTaskToTable(task);
    }

    function addTaskToTable(task) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="completion-checkbox" ${task.completed ? 'checked' : ''} onclick="toggleCompletion(this)"></td>
            <td><input type="text" class="view-only" value="${task.title}" readonly></td>
            <td><input type="text" class="view-only" value="${task.description}" readonly></td>
            <td><input type="number" class="view-only" value="${task.priority}" readonly></td>
            <td><input type="date" class="view-only" value="${task.dueDate}" readonly></td>
            <td><input type="text" class="view-only" value="${task.category}" readonly></td>
            <td><textarea class="view-only" readonly>${task.notes}</textarea></td>
            <td><input type="datetime-local" class="view-only" value="${task.reminder}" readonly></td>
            <td>
                <button class="edit" onclick="startEditing(this)">Editar</button>
                <button class="save" onclick="saveChanges(this)" style="display: none;">Salvar</button>
                <button class="cancel" onclick="cancelEdit(this)" style="display: none;">Cancelar</button>
                <button class="delete" onclick="deleteTask(this)">Excluir</button>
            </td>
        `;
        taskList.appendChild(row);
    }

    window.toggleCompletion = function(checkbox) {
        const row = checkbox.closest('tr');
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const title = row.querySelector('input[type="text"]').value;

        const task = tasks.find(t => t.title === title);
        if (task) {
            task.completed = checkbox.checked;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            row.classList.toggle('completed', checkbox.checked);
        }
    };

    window.startEditing = function(button) {
        const row = button.closest('tr');
        const inputs = row.querySelectorAll('input.view-only, textarea.view-only');
        inputs.forEach(input => {
            input.classList.add('editable');
            input.removeAttribute('readonly');
        });
        row.querySelector('.save').style.display = 'inline-block';
        row.querySelector('.cancel').style.display = 'inline-block';
        button.style.display = 'none';
    };

    window.saveChanges = function(button) {
        const row = button.closest('tr');
        const inputs = row.querySelectorAll('input, textarea');
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const title = row.querySelector('input[type="text"]').value;

        const task = tasks.find(t => t.title === title);
        if (task) {
            inputs.forEach(input => {
                if (input.type === 'text') {
                    task[input.name] = input.value;
                } else if (input.type === 'number') {
                    task[input.name] = parseInt(input.value, 10);
                } else if (input.type === 'date') {
                    task[input.name] = input.value;
                } else if (input.type === 'datetime-local') {
                    task[input[name]] = input.value;
                } else if (input.tagName.toLowerCase() === 'textarea') {
                    task[input.name] = input.value;
                }
            });
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
        inputs.forEach(input => {
            input.setAttribute('readonly', 'readonly');
            input.classList.remove('editable');
        });
        row.querySelector('.save').style.display = 'none';
        row.querySelector('.cancel').style.display = 'none';
        row.querySelector('.edit').style.display = 'inline-block';
    };

    window.cancelEdit = function(button) {
        const row = button.closest('tr');
        const inputs = row.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.setAttribute('readonly', 'readonly');
            input.classList.remove('editable');
        });
        row.querySelector('.save').style.display = 'none';
        row.querySelector('.cancel').style.display = 'none';
        row.querySelector('.edit').style.display = 'inline-block';
    };

    window.deleteTask = function(button) {
        const row = button.closest('tr');
        const title = row.querySelector('input[type="text"]').value;
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => task.title !== title);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        row.remove();
    };

    function filterTasks() {
        const view = viewSelect.value;
        const rows = Array.from(taskList.querySelectorAll('tr')).slice(1); // Ignora o cabeçalho

        rows.sort((a, b) => {
            const aTitle = a.querySelector('input[type="text"]').value;
            const bTitle = b.querySelector('input[type="text"]').value;

            const aDate = a.querySelector('input[type="date"]').value;
            const bDate = b.querySelector('input[type="date"]').value;

            const aPriority = parseInt(a.querySelector('input[type="number"]').value, 10);
            const bPriority = parseInt(b.querySelector('input[type="number"]').value, 10);

            const aCategory = a.querySelector('input[type="text"]').value;
            const bCategory = b.querySelector('input[type="text"]').value;

            if (view === 'date') {
                return new Date(aDate) - new Date(bDate);
            } else if (view === 'priority') {
                return aPriority - bPriority;
            } else if (view === 'category') {
                return aCategory.localeCompare(bCategory);
            }
            return 0; // Retorna 0 se o critério não for reconhecido
        });

        taskList.innerHTML = '';
        taskList.appendChild(document.querySelector('thead').parentNode); // Adiciona o cabeçalho novamente
        rows.forEach(row => taskList.appendChild(row));
    }

    viewSelect.addEventListener('change', filterTasks);

    // Carregar tarefas ao iniciar
    loadTasks();
});
