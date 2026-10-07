// ------------------ HELPERS ------------------

/**
 * Creates initials from a full name.
 * @param {string} name
 * @returns {string}
 */
/**
 * Get initials.
 */
function addTaskGetInitials(name) {
  return String(name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * Generates a simple numeric hash from a string.
 * Used to create consistent avatar colors.
 * @param {string} str
 * @returns {number}
 */
/**
 * Hash string.
 */
function addTaskHashString(str) {
  let h = 0;
  const s = String(str || "");

  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;

  return Math.abs(h);
}

/**
 * Returns a color class based on a seed value.
 * @param {string} seed
 * @returns {string}
 */
/**
 * Color class for.
 */
function addTaskColorClassFor(seed) {
  return "avatar-color-" + (addTaskHashString(seed) % 12);
}

/**
 * Determines the avatar color class for a contact.
 * @param {{id?:string,email?:string,name?:string,colorClass?:string}} contact
 * @returns {string}
 */
/**
 * Get contact color class.
 */
function addTaskGetContactColorClass(contact) {
  if (contact && contact.colorClass) return contact.colorClass;

  const seed = contact?.id || contact?.email || contact?.mail || contact?.name || contact?.namen || "";
  return addTaskColorClassFor(seed);
}

// ------------------ CLEAR ------------------

/**
 * Clears the entire add task form and resets internal state.
 */
/**
 * Clear form.
 */
function clearForm() {
  const root = getAddTaskRoot();
  const els = getClearFormEls(root);
  clearAddTaskInputs(els);
  resetAddTaskState(root);
}

/**
 * Get clear form elements.
 */
function getClearFormEls(root) {
  return {
    root: root,
    title: document.getElementById("title") || document.getElementById("titel"),
    description: document.getElementById("description"),
    dueDate: document.getElementById("date"),
    category: document.getElementById("category"),
    assigned: document.getElementById("assigned"),
    subtaskInput: document.getElementById("subtasks"),
  };
}

/**
 * Clear add task inputs.
 */
function clearAddTaskInputs(els) {
  if (els.title) els.title.value = "";
  if (els.description) els.description.value = "";
  if (els.dueDate) els.dueDate.value = "";
  if (els.category) els.category.value = "";
  if (els.assigned) els.assigned.value = "";
  if (els.subtaskInput) els.subtaskInput.value = "";
}

/**
 * Reset add task state.
 */
function resetAddTaskState(root) {
  setCategorySelection("");
  clearSelectedContacts();
  resetPendingSubtasks();
  clearPriorityButtons(root);
  selectedPriority = null;
  refreshAssignedContacts();
  setDefaultPriority();
}

/**
 * Clear selected contacts.
 */
function clearSelectedContacts() {
  if (selectedContacts) selectedContacts.clear();
}

/**
 * Reset pending subtasks.
 */
function resetPendingSubtasks() {
  pendingSubtasks = [];
  renderSubtasks();
}

/**
 * Clear priority buttons.
 */
function clearPriorityButtons(root) {
  const priorityBtns = root.querySelectorAll(".priority-section li");
  priorityBtns.forEach((btn) => btn.classList.remove("--selected"));
}

/**
 * Refresh assigned contacts.
 */
function refreshAssignedContacts() {
  populateAssignedContacts();
  renderSelectedContacts();
}

/**
 * Resets the add task form.
 */
/**
 * Reset add task form.
 */
function resetAddTaskForm() {
  clearForm();
}

/**
 * Returns the root container for the add task page.
 * Falls back to the document if the container is not found.
 * @returns {HTMLElement|Document}
 */
/**
 * Get add task root.
 */
function getAddTaskRoot() {
  return document.getElementById("addTaskRoot") || document;
}

// ------------------ ADD TASK CONTEXT ------------------

/**
 * Determines the task status based on overlay data
 * or URL query parameters.
 * @returns {string}
 */
/**
 * Get add task status.
 */
function getAddTaskStatus() {
  const overlay = document.getElementById("addTaskOverlayBackdrop");

  if (overlay && overlay.dataset && overlay.dataset.status) {
    return overlay.dataset.status;
  }

  return new URLSearchParams(location.search).get("status") || "todo";
}

// ------------------ VALIDATION MODAL ------------------

/**
 * Initializes validation modal behavior.
 */
/**
 * Initialize validation modal.
 */
function initValidationModal() {
  const modal = document.getElementById("validationModal");
  const closeBtn = document.getElementById("validationClose");
  const okBtn = document.getElementById("validationOk");

  if (!modal) return;

  if (closeBtn) closeBtn.addEventListener("click", closeValidationModal);
  if (okBtn) okBtn.addEventListener("click", closeValidationModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeValidationModal();
  });
}

/**
 * Opens the validation modal.
 */
/**
 * Open validation modal.
 */
function openValidationModal() {
  const modal = document.getElementById("validationModal");
  if (!modal) return;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

/**
 * Closes the validation modal.
 */
/**
 * Close validation modal.
 */
function closeValidationModal() {
  const modal = document.getElementById("validationModal");
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

// addTasks.html Select fild Aniemation
/**
 * Select animate.
 */
function selectAnimate() {
  const wrapper = document.querySelector(".select-wrapper");
  wrapper.classList.toggle("open");
}
