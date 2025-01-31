document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("task-input");
    const addTaskButton = document.getElementById("add-task");
    const taskList = document.getElementById("task-list");
    const errorMessage = document.getElementById("error-message");
    const tasksFile = "tasks.json";

    const fetchTasks = async () => {
      try {
        const response = await fetch(tasksFile);
        const tasks = await response.json();
        tasks.forEach(task => {
          const taskItem = createTaskItem(task.text, task.completed);
          taskList.appendChild(taskItem);
        });
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    const saveTasksToFile = async (tasks) => {
      try {
        await fetch("/saveTasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tasks)
        });
      } catch (error) {
        console.error("Error saving tasks:", error);
      }
    };

    const saveTasks = () => {
      const tasks = [];
      taskList.querySelectorAll("li").forEach(li => {
        tasks.push({
          text: li.querySelector("span").textContent,
          completed: li.classList.contains("completed")
        });
      });
      saveTasksToFile(tasks);
    };

    const createTaskItem = (taskText, completed = false) => {
      const li = document.createElement("li");
      if (completed) li.classList.add("completed");

      const span = document.createElement("span");
      span.textContent = taskText;

      const actions = document.createElement("div");
      actions.classList.add("actions");

      const editButton = document.createElement("button");
      editButton.innerHTML = "✏️";
      editButton.addEventListener("click", () => editTask(li, span));

      const saveButton = document.createElement("button");
      saveButton.innerHTML = "💾";
      saveButton.style.display = "none";
      saveButton.addEventListener("click", () => saveTask(li, span, saveButton, editButton));

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = completed;
      checkbox.addEventListener("change", () => {
        li.classList.toggle("completed");
        saveTasks();
      });

      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = "🗑️";
      deleteButton.addEventListener("click", () => {
        li.remove();
        saveTasks();
      });

      actions.append(checkbox, editButton, saveButton, deleteButton);
      li.append(span, actions);
      return li;
    };

    const addTask = () => {
      const taskText = taskInput.value.trim();
      if (taskText === "") {
        errorMessage.textContent = "Task cannot be empty.";
        return;
      }
      errorMessage.textContent = "";
      const taskItem = createTaskItem(taskText);
      taskList.appendChild(taskItem);
      taskInput.value = "";
      saveTasks();
    };

    const editTask = (li, span) => {
      const saveButton = li.querySelector("button:nth-child(3)");
      const editButton = li.querySelector("button:nth-child(2)");
      span.contentEditable = "true";
      span.focus();
      saveButton.style.display = "inline";
      editButton.style.display = "none";
    };

    const saveTask = (li, span, saveButton, editButton) => {
      span.contentEditable = "false";
      saveButton.style.display = "none";
      editButton.style.display = "inline";
      saveTasks();
    };

    addTaskButton.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") addTask();
    });

    fetchTasks();
  });
