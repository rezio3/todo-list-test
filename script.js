const baseUrl = "https://akademia-bachmana-backend.onrender.com/";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const formatedDate = date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return formatedDate !== "Invalid Date" ? formatedDate : "Brak deadlinu";
};

// FETCHERY
const getTasksList = async () => {
  const res = await fetch(`${baseUrl}api/tasks`);
  if (!res.ok) throw new Error("Bład podczas pobiera listy zadań");
  return res.json();
};

const handleLoadingLayout = (isLoading) => {
  const loadingOverlay = document.getElementById("loadingOverlay");
  isLoading
    ? loadingOverlay.classList.remove("hide")
    : loadingOverlay.classList.add("hide");
};

const addTask = async (task) => {
  const res = await fetch(`${baseUrl}api/tasks`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Błąd podczas dodawania zadania.");
  return res.json();
};

const removeTask = async (id) => {
  try {
    handleLoadingLayout(true);
    const res = await fetch(`${baseUrl}api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Nie udało się usunąć zadania");
    showTasks();
    handleLoadingLayout(false);
  } catch (error) {
    handleLoadingLayout(false);
    console.error(error);
  }
};
const markDone = async (id) => {
  try {
    handleLoadingLayout(true);
    const res = await fetch(`${baseUrl}api/tasks/${id}/toggle`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Nie udało się zaktualizować statusu zadania");
    showTasks();
    handleLoadingLayout(false);
  } catch (error) {
    handleLoadingLayout(false);
    console.error(error);
  }
};
const editTask = async (task) => {
  try {
    handleLoadingLayout(true);
    const res = await fetch(`${baseUrl}api/tasks/${task._id}`, {
      method: "PUT",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error("Nie udało się edytować zadania");
    showTasks();
    handleLoadingLayout(false);
  } catch (error) {
    handleLoadingLayout(false);
    console.error(error);
  }
};

const taskContainer = document.getElementById("taskList");
const addTaskButton = document.getElementById("addTaskButton");

addTaskButton.addEventListener("click", () => {
  const taskDescriptionInput = document.getElementById("taskDescriptionInput");
  const dateInput = document.getElementById("dateInput");
  const isoString = dateInput.value
    ? new Date(dateInput.value).toISOString()
    : null;

  const description = taskDescriptionInput.value;

  handleLoadingLayout(true);
  addTask(
    isoString === null
      ? { description: description }
      : { description: description, deadline: isoString }
  )
    .then(() => {
      handleLoadingLayout(false);
      showTasks();
    })
    .catch(() => {
      handleLoadingLayout(false);
    });
});

const handleInputToEditTask = (task, isOpen) => {
  const taskContainer = document.getElementById(`task-${task._id}`);
  if (isOpen) {
    const existingInput = taskContainer.querySelector(".edit-input");
    const existingButton = taskContainer.querySelector(".edit-save-btn");
    if (existingInput) existingInput.remove();
    if (existingButton) existingButton.remove();
    return;
  }
  const descriptionInput = document.createElement("input");
  const saveButton = document.createElement("button");

  descriptionInput.type = "text";
  descriptionInput.value = task.description;
  descriptionInput.classList.add("edit-input");
  saveButton.innerText = "Zapisz";
  saveButton.classList.add("edit-save-btn");
  saveButton.addEventListener("click", () => {
    const updatedTask = { ...task, description: descriptionInput.value };
    editTask(updatedTask);
  });

  taskContainer.appendChild(descriptionInput);
  taskContainer.appendChild(saveButton);
};

async function showTasks() {
  try {
    handleLoadingLayout(true);
    const data = await getTasksList();
    const { tasks } = data;
    taskContainer.innerHTML = "";

    tasks.forEach((taskItem) => {
      const singleTask = document.createElement("div");
      singleTask.classList.add("task-container");
      singleTask.id = `task-${taskItem._id}`;

      if (taskItem.completed) {
        singleTask.classList.add("completed");
      }

      singleTask.innerHTML = `
<p>${taskItem.description}</p>
<span>${formatDate(taskItem.deadline)}</span>
<div class="buttons-container">
<button class="done-btn">Zrobione</button>
<button class="edit-btn">Edytuj</button>
<button class="delete-btn">Usuń</button>
</div>
`;
      let isEditOpen = true;
      singleTask
        .querySelector(".done-btn")
        .addEventListener("click", function () {
          markDone(taskItem._id);
        });
      singleTask
        .querySelector(".edit-btn")
        .addEventListener("click", function () {
          isEditOpen = !isEditOpen;
          handleInputToEditTask(taskItem, isEditOpen);
        });
      singleTask
        .querySelector(".delete-btn")
        .addEventListener("click", function () {
          removeTask(taskItem._id);
        });

      taskContainer.appendChild(singleTask);
      handleLoadingLayout(false);
    });
  } catch (error) {
    handleLoadingLayout(false);
    console.error("Błąd" + error);
  }
}

showTasks();
