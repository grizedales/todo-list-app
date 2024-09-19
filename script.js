document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');
    const errorMessage = document.getElementById('errorMessage');
    const projectSelect = document.getElementById('projectSelect');
    const addProjectButton = document.getElementById('addProject');

    let projects = JSON.parse(localStorage.getItem('projects')) || [{ name: 'Default Project', tasks: [] }];
    let currentProjectIndex = 0;

    function saveProjects() {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    function renderProjects() {
        projectSelect.innerHTML = '';
        projects.forEach((project, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = project.name;
            projectSelect.appendChild(option);
        });
        projectSelect.value = currentProjectIndex;

        const deleteProjectButton = document.createElement('button');
        deleteProjectButton.innerHTML = '🗑️';
        deleteProjectButton.title = 'Delete Project';
        deleteProjectButton.id = 'deleteProject';
        deleteProjectButton.addEventListener('click', deleteProject);

        const editProjectButton = document.createElement('button');
        editProjectButton.innerHTML = '✏️';
        editProjectButton.title = 'Edit Project';
        editProjectButton.id = 'editProject';
        editProjectButton.addEventListener('click', editProject);

        const projectSelectionDiv = document.querySelector('.project-selection');
        if (projectSelectionDiv.querySelector('#deleteProject')) {
            projectSelectionDiv.removeChild(projectSelectionDiv.querySelector('#deleteProject'));
        }
        if (projectSelectionDiv.querySelector('#editProject')) {
            projectSelectionDiv.removeChild(projectSelectionDiv.querySelector('#editProject'));
        }
        projectSelectionDiv.insertBefore(deleteProjectButton, addProjectButton);
        projectSelectionDiv.insertBefore(editProjectButton, deleteProjectButton);

        addProjectButton.innerHTML = '➕';
        addProjectButton.title = 'Add New Project';

        updateHeader();
    }

    function editProject() {
        console.log("editProject function called");
        const projectSelectionDiv = document.querySelector('.project-selection');
        
        // Remove existing input if any
        const existingInput = projectSelectionDiv.querySelector('.edit-project-input');
        if (existingInput) {
            console.log("Removing existing input");
            cancelProjectEdit(projectSelectionDiv, existingInput);
            return;
        }

        console.log("Creating new input");
        hideProjectElements();

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'edit-project-input';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = projects[currentProjectIndex].name;
        input.placeholder = 'Edit project name';

        const saveButton = document.createElement('button');
        saveButton.innerHTML = '✔️';
        saveButton.title = 'Save';
        saveButton.addEventListener('click', () => saveProjectEdit(input.value));

        const cancelButton = document.createElement('button');
        cancelButton.innerHTML = '❌';
        cancelButton.title = 'Cancel';
        cancelButton.addEventListener('click', () => cancelProjectEdit(projectSelectionDiv, inputWrapper));

        input.addEventListener('keydown', (e) => {
            console.log("Key pressed:", e.key);
            if (e.key === 'Enter') {
                console.log("Enter key pressed");
                e.preventDefault();
                saveProjectEdit(input.value);
            } else if (e.key === 'Escape') {
                console.log("Escape key pressed");
                e.preventDefault();
                cancelProjectEdit(projectSelectionDiv, inputWrapper);
            }
        });

        inputWrapper.appendChild(input);
        inputWrapper.appendChild(saveButton);
        inputWrapper.appendChild(cancelButton);

        projectSelectionDiv.appendChild(inputWrapper);
        input.focus();
    }

    function cancelProjectEdit(projectSelectionDiv, inputWrapper) {
        console.log("Cancelling project edit");
        if (inputWrapper && inputWrapper.parentNode === projectSelectionDiv) {
            projectSelectionDiv.removeChild(inputWrapper);
        }
        showProjectElements();
    }

    function showProjectElements() {
        console.log("Showing project elements");
        const projectSelect = document.getElementById('projectSelect');
        const addProjectButton = document.getElementById('addProject');
        const deleteProjectButton = document.getElementById('deleteProject');
        const editProjectButton = document.getElementById('editProject');

        if (projectSelect) projectSelect.style.display = '';
        if (addProjectButton) addProjectButton.style.display = '';
        if (deleteProjectButton) deleteProjectButton.style.display = '';
        if (editProjectButton) editProjectButton.style.display = '';
    }

    function hideProjectElements() {
        console.log("Hiding project elements");
        const projectSelect = document.getElementById('projectSelect');
        const addProjectButton = document.getElementById('addProject');
        const deleteProjectButton = document.getElementById('deleteProject');
        const editProjectButton = document.getElementById('editProject');

        if (projectSelect) projectSelect.style.display = 'none';
        if (addProjectButton) addProjectButton.style.display = 'none';
        if (deleteProjectButton) deleteProjectButton.style.display = 'none';
        if (editProjectButton) editProjectButton.style.display = 'none';
    }

    function saveProjectEdit(newName) {
        if (newName && newName.trim()) {
            projects[currentProjectIndex].name = newName.trim();
            renderProjects();
            renderTasks();
        }
        const editProjectInput = document.querySelector('.edit-project-input');
        if (editProjectInput) {
            editProjectInput.remove();
        }
        showProjectElements();
    }

    function deleteProject() {
        if (projects.length === 1) {
            alert("You can't delete the last project.");
            return;
        }

        projects.splice(currentProjectIndex, 1);
        currentProjectIndex = Math.min(currentProjectIndex, projects.length - 1);
        renderProjects();
        renderTasks();
    }

    function renderTasks() {
        const currentProject = projects[currentProjectIndex];
        renderTasksHelper(currentProject.tasks, taskList);
        saveProjects();
        updateHeader();
    }

    function renderTasksHelper(taskArray, parentElement, level = 0) {
        parentElement.innerHTML = '';
        taskArray.forEach((task, index) => {
            if (!task) return;
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
            
            checkbox.addEventListener('change', () => toggleTask(taskArray, index));
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
                saveProjects();
            });

            parentElement.appendChild(li);

            if (task.subtasks && Array.isArray(task.subtasks) && task.subtasks.length > 0) {
                const subList = document.createElement('ul');
                subList.className = 'subtask-list';
                li.appendChild(subList);
                renderTasksHelper(task.subtasks, subList, level + 1);
            }
        });
    }

    function addTask(e) {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (text) {
            const newTask = { 
                text, 
                completed: false, 
                subtasks: [], 
                priority: 'low' 
            };
            projects[currentProjectIndex].tasks.push(newTask);
            taskInput.value = '';
            errorMessage.textContent = '';
            taskInput.placeholder = "Enter a new task";
            renderTasks();
        } else {
            errorMessage.textContent = 'Task cannot be empty!';
            taskInput.placeholder = "";
        }
    }

    function addProject() {
        const projectSelectionDiv = document.querySelector('.project-selection');
        
        // Remove existing input if any
        const existingInput = projectSelectionDiv.querySelector('.new-project-input');
        if (existingInput) {
            cancelAddProject(projectSelectionDiv, existingInput);
            return;
        }

        hideProjectElements();

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'new-project-input';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'New project name';

        const addButton = document.createElement('button');
        addButton.innerHTML = '✔️';
        addButton.title = 'Add Project';
        addButton.addEventListener('click', () => saveNewProject(input.value));

        const cancelButton = document.createElement('button');
        cancelButton.innerHTML = '❌';
        cancelButton.title = 'Cancel';
        cancelButton.addEventListener('click', () => cancelAddProject(projectSelectionDiv, inputWrapper));

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveNewProject(input.value);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelAddProject(projectSelectionDiv, inputWrapper);
            }
        });

        inputWrapper.appendChild(input);
        inputWrapper.appendChild(addButton);
        inputWrapper.appendChild(cancelButton);

        projectSelectionDiv.appendChild(inputWrapper);
        input.focus();
    }

    function cancelAddProject(projectSelectionDiv, inputWrapper) {
        if (inputWrapper && inputWrapper.parentNode === projectSelectionDiv) {
            projectSelectionDiv.removeChild(inputWrapper);
        }
        showProjectElements();
    }

    function saveNewProject(projectName) {
        if (projectName && projectName.trim()) {
            projects.push({ name: projectName.trim(), tasks: [] });
            currentProjectIndex = projects.length - 1;
            renderProjects();
            renderTasks();
        }
        const newProjectInput = document.querySelector('.new-project-input');
        if (newProjectInput) {
            newProjectInput.remove();
        }
        showProjectElements();
    }

    function editTask(taskContent, taskArray, index) {
        if (taskContent.querySelector('.edit-input')) return;

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
        
        span.replaceWith(input);
        input.insertAdjacentElement('afterend', cancelButton);
        cancelButton.insertAdjacentElement('afterend', saveButton);
        
        taskContent.classList.add('editing');
        input.focus();
        
        saveButton.addEventListener('click', () => saveEdit(taskArray, index, input.value, taskContent, span));
        cancelButton.addEventListener('click', () => cancelEdit(taskContent, span, input));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveEdit(taskArray, index, input.value, taskContent, span);
            } else if (e.key === 'Escape') {
                cancelEdit(taskContent, span, input);
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

    function addSubtaskInput(parentLi, taskArray, index) {
        if (parentLi.querySelector('.subtask-input')) return;

        const subTaskInput = document.createElement('input');
        subTaskInput.type = 'text';
        subTaskInput.placeholder = 'Enter subtask';
        subTaskInput.classList.add('subtask-input');
        
        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.classList.add('subtask-buttons');

        const addButton = document.createElement('button');
        addButton.textContent = 'Add';
        addButton.classList.add('subtask-add-button');

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.classList.add('subtask-cancel-button');

        const addSubtask = () => {
            const text = subTaskInput.value.trim();
            if (text) {
                if (!taskArray[index].subtasks) {
                    taskArray[index].subtasks = [];
                }
                taskArray[index].subtasks.push({ text, completed: false, subtasks: [], priority: 'low' });
                renderTasks();
            } else {
                removeSubtaskInput(parentLi);
            }
        };

        addButton.addEventListener('click', addSubtask);
        subTaskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSubtask();
            } else if (e.key === 'Escape') {
                removeSubtaskInput(parentLi);
            }
        });

        cancelButton.addEventListener('click', () => removeSubtaskInput(parentLi));

        buttonsWrapper.appendChild(addButton);
        buttonsWrapper.appendChild(cancelButton);

        parentLi.appendChild(subTaskInput);
        parentLi.appendChild(buttonsWrapper);
        subTaskInput.focus();
    }

    function removeSubtaskInput(parentLi) {
        parentLi.querySelector('.subtask-input')?.remove();
        parentLi.querySelector('.subtask-buttons')?.remove();
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

    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask(e);
        }
    });
    taskInput.addEventListener('input', () => {
        if (taskInput.value.trim()) {
            errorMessage.textContent = '';
            taskInput.placeholder = "Enter a new task";
        }
    });

    projectSelect.addEventListener('change', (e) => {
        currentProjectIndex = parseInt(e.target.value);
        renderTasks();
        updateHeader();
    });

    addProjectButton.addEventListener('click', addProject);

    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const modeText = document.getElementById('modeText');

    modeText.textContent = 'Dark Mode';

    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    if (isDarkMode) {
        body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }

    function toggleDarkMode() {
        body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
    }

    darkModeToggle.addEventListener('change', toggleDarkMode);

    function updateHeader() {
        const h1 = document.querySelector('h1');
        const currentProject = projects[currentProjectIndex];
        h1.textContent = `${currentProject.name} ToDo List`;
    }

    renderProjects();
    renderTasks();
    updateHeader();

    const editProjectButton = document.getElementById('editProject');
    if (editProjectButton) {
        editProjectButton.addEventListener('click', editProject);
    }
});