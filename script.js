document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');
    const errorMessage = document.getElementById('errorMessage');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function renderTasks(taskArray = tasks, parentElement = taskList, level = 0) {
        console.log("Rendering tasks:", taskArray);
        parentElement.innerHTML = '';
        taskArray.forEach((task, index) => {
            if (!task) {
                console.error("Encountered null task at index:", index);
                return; // Skip this iteration
            }
            const li = document.createElement('li');
            li.style.marginLeft = `${level * 20}px`;
            li.innerHTML = `
                <div class="task-content priority-${task.priority || 'low'}">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="${task.completed ? 'completed' : ''}">${task.text || 'Unnamed Task'}</span>
                    <div class="task-actions">
                        <select class="priority-select">
                            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                        </select>
                        <button class="edit-task">✏️</button>
                        <button class="remove-task">×</button>
                        <button class="add-subtask">+</button>
                    </div>
                </div>
            `;
            const taskContent = li.querySelector('.task-content');
            const checkbox = taskContent.querySelector('input[type="checkbox"]');
            
            checkbox.addEventListener('change', () => {
                toggleTask(taskArray, index);
            });

            taskContent.addEventListener('click', (e) => {
                if (e.target === taskContent || e.target === taskContent.querySelector('span')) {
                    checkbox.click();
                }
            });

            taskContent.querySelector('.remove-task').addEventListener('click', (e) => {
                e.stopPropagation();
                removeTask(taskArray, index);
            });
            taskContent.querySelector('.add-subtask').addEventListener('click', (e) => {
                e.stopPropagation();
                addSubtaskInput(li, taskArray, index);
            });
            taskContent.querySelector('.edit-task').addEventListener('click', (e) => {
                e.stopPropagation();
                editTask(taskContent, taskArray, index);
            });
            taskContent.querySelector('.priority-select').addEventListener('change', (e) => {
                e.stopPropagation();
                task.priority = e.target.value;
                taskContent.className = `task-content priority-${task.priority}`;
                saveTasks();
            });

            parentElement.appendChild(li);

            if (task.subtasks && Array.isArray(task.subtasks) && task.subtasks.length > 0) {
                const subList = document.createElement('ul');
                subList.className = 'subtask-list';
                li.appendChild(subList);
                renderTasks(task.subtasks, subList, level + 1);
            }
        });
        
        saveTasks();
    }

    function editTask(taskContent, taskArray, index) {
        // Check if the task is already being edited
        if (taskContent.querySelector('.edit-input')) {
            return; // Exit the function if an edit input already exists
        }

        const span = taskContent.querySelector('span');
        const text = span.textContent;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = text;
        input.classList.add('edit-input');
        
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.classList.add('save-edit');
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.classList.add('cancel-edit');
        
        // Replace the span with the input
        span.replaceWith(input);
        
        // Add save and cancel buttons after the input
        input.insertAdjacentElement('afterend', cancelButton);
        cancelButton.insertAdjacentElement('afterend', saveButton);
        
        // Add editing class to task content
        taskContent.classList.add('editing');
        
        input.focus();
        
        saveButton.addEventListener('click', () => saveEdit(taskArray, index, input.value, taskContent, span));
        cancelButton.addEventListener('click', () => cancelEdit(taskContent, span, input));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit(taskArray, index, input.value, taskContent, span);
            }
        });
    }

    function saveEdit(taskArray, index, newText, taskContent, span) {
        taskArray[index].text = newText.trim();
        span.textContent = newText.trim();
        cancelEdit(taskContent, span, taskContent.querySelector('.edit-input'));
        renderTasks();
    }

    function cancelEdit(taskContent, span, input) {
        input.replaceWith(span);
        taskContent.querySelector('.save-edit')?.remove();
        taskContent.querySelector('.cancel-edit')?.remove();
        taskContent.classList.remove('editing');
    }

    function addTask(e) {
        e.preventDefault();
        console.log("Add task function called");
        const text = taskInput.value.trim();
        console.log("Task text:", text);
        if (text) {
            console.log("Adding new task");
            const newTask = { 
                text, 
                completed: false, 
                subtasks: [], 
                priority: 'low' 
            };
            tasks.push(newTask);
            taskInput.value = '';
            errorMessage.textContent = '';
            taskInput.placeholder = "Enter a new task";
            console.log("Tasks array:", tasks);
            renderTasks();
        } else {
            console.log("Empty task, showing error");
            errorMessage.textContent = 'Task cannot be empty!';
            taskInput.placeholder = "";
        }
    }

    function addSubtaskInput(parentLi, taskArray, index) {
        // Check if a subtask input already exists
        if (parentLi.querySelector('.subtask-input')) {
            return; // Exit the function if an input already exists
        }

        const subTaskInput = document.createElement('input');
        subTaskInput.type = 'text';
        subTaskInput.placeholder = 'Enter subtask';
        subTaskInput.classList.add('subtask-input');
        
        const addButton = document.createElement('button');
        addButton.textContent = 'Add';
        addButton.classList.add('subtask-add-button');

        const addSubtask = () => {
            const text = subTaskInput.value.trim();
            if (text) {
                if (!taskArray[index].subtasks) {
                    taskArray[index].subtasks = [];
                }
                taskArray[index].subtasks.push({ text, completed: false, subtasks: [], priority: 'low' });
                renderTasks();
            } else {
                removeSubtaskInput();
            }
        };

        addButton.addEventListener('click', addSubtask);

        subTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSubtask();
            }
        });

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.classList.add('subtask-cancel-button');
        cancelButton.addEventListener('click', removeSubtaskInput);

        function removeSubtaskInput() {
            parentLi.removeChild(subTaskInput);
            parentLi.removeChild(addButton);
            parentLi.removeChild(cancelButton);
        }

        parentLi.appendChild(subTaskInput);
        parentLi.appendChild(addButton);
        parentLi.appendChild(cancelButton);
        subTaskInput.focus();
    }

    function toggleTask(taskArray, index) {
        taskArray[index].completed = !taskArray[index].completed;
        if (taskArray[index].subtasks) {
            taskArray[index].subtasks.forEach(subtask => subtask.completed = taskArray[index].completed);
        }
        renderTasks();
    }

    function removeTask(taskArray, index) {
        taskArray.splice(index, 1);
        renderTasks();
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    addTaskButton.addEventListener('click', (e) => {
        console.log("Add button clicked");
        addTask(e);
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            console.log("Enter key pressed in input");
            e.preventDefault(); // Prevent form submission
            addTask(e);
        }
    });

    taskInput.addEventListener('input', () => {
        if (taskInput.value.trim()) {
            errorMessage.textContent = '';
            taskInput.placeholder = "Enter a new task";
        }
    });

    renderTasks();

    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const modeText = document.getElementById('modeText');

    // Set the text to "Dark Mode" and keep it that way
    modeText.textContent = 'Dark Mode';

    // Check if dark mode preference is stored in localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    // Set initial dark mode state
    if (isDarkMode) {
        body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }

    // Toggle dark mode
    function toggleDarkMode() {
        body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
    }

    darkModeToggle.addEventListener('change', toggleDarkMode);
});