// ================== ADD TASK → SAVE TO STORAGE ==================
/**
 * Currently selected priority value.
 * @type {string|null}
 */
let selectedPriority = null;
/**
 * Temporary list of subtasks before the task is saved.
 * @type {{title:string, done:boolean}[]}
 */
let pendingSubtasks = [];
/**
 * Stores selected contact IDs.
 * @type {Set<string>}
 */
const selectedContacts = new Set();
/**
 * Cached contacts list for assigned UI.
 * @type {Array}
 */
let cachedContacts = [];
// ------------------ INIT ------------------
/**
 * Initializes the add task page once the DOM is loaded.
 * Sets up UI, listeners and loads contacts.
 */
document.addEventListener("DOMContentLoaded", initAddTaskPage);
/**
 * Initialize add task page.
 */
function initAddTaskPage() {
  getCokkieCheck();
  initAddTaskUi();
  bindAddTaskButtons();
  setAddTaskDateMin();
}
/**
 * Initialize add task UI.
 */
function initAddTaskUi() {
  populateAssignedContacts();
  initPriorityButtons();
  initSubtasks();
  initAssignedDropdown();
  initCategoryDropdown();
  initValidationModal();
}
/**
 * Bind add task buttons.
 */
function bindAddTaskButtons() {
  const root = getAddTaskRoot();
  const createBtn = root.querySelector("#createTaskBtn");
  const clearBtn = root.querySelector(".primary-btn.--primary-btn-cancel");
  if (createBtn) createBtn.addEventListener("click", createTask);
  if (clearBtn) clearBtn.addEventListener("click", clearForm);
}
/**
 * Set add task date minimum.
 */
function setAddTaskDateMin() {
  const dateInput = document.getElementById("date");
  if (!dateInput) return;
  dateInput.setAttribute("min", getLocalDateInputValue());
}
/**
 * Returns today's date in local YYYY-MM-DD format for date inputs.
 * @param {Date} [date]
 */
/**
 * Get local date input value.
 */
function getLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
// ------------------ PRIORITY ------------------
/**
 * Initializes priority buttons and click behavior.
 * Ensures only one priority can be selected.
 */
function initPriorityButtons() {
  const buttons = getAddTaskRoot().querySelectorAll(
    ".priority-section .priority-btn",
  );

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("--selected"));
      btn.classList.add("--selected");
      selectedPriority = btn.textContent.trim();
    });
  });

  setDefaultPriority();
}
/**
 * Sets the default priority (medium) if available.
 */
function setDefaultPriority() {
  const root = getAddTaskRoot();
  const defaultBtn = root.querySelector(".priority-btn.medium");
  if (!defaultBtn) return;

  root
    .querySelectorAll(".priority-section .priority-btn")
    .forEach((b) => b.classList.remove("--selected"));

  defaultBtn.classList.add("--selected");
  selectedPriority = defaultBtn.textContent.trim();
}
// ------------------ SUBTASKS ------------------
/**
 * Initializes subtask input behavior and remove handling.
 */
function initSubtasks() {
  const els = getSubtaskEls();
  if (!els) return;
  bindSubtaskInput(els);
  bindSubtaskClear(els);
  bindSubtaskList(els);
  syncSubtaskButtons(els.input);
}
/**
 * Get subtask elements.
 */
function getSubtaskEls() {
  const input = document.getElementById("subtasks");
  if (!input) return null;
  return {
    input: input,
    btn: document.getElementById("addSubtaskBtn"),
    clearBtn: document.getElementById("clearSubtaskBtn"),
    list: document.getElementById("subtasksList"),
  };
}
/**
 * Bind subtask input.
 */
function bindSubtaskInput(els) {
  if (els.btn) els.btn.onclick = addSubtasksFromInput;
  els.input.onkeydown = (e) => handleSubtaskEnter(e);
  els.input.addEventListener("input", () => syncSubtaskButtons(els.input));
}
/**
 * Handle subtask enter.
 */
function handleSubtaskEnter(e) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  addSubtasksFromInput();
}
/**
 * Bind subtask clear.
 */
function bindSubtaskClear(els) {
  if (!els.clearBtn) return;
  els.clearBtn.onclick = () => clearSubtaskInput(els.input);
}
/**
 * Clear subtask input.
 */
function clearSubtaskInput(input) {
  input.value = "";
  input.focus();
  syncSubtaskButtons(input);
}
/**
 * Sync subtask buttons.
 */
function syncSubtaskButtons(input) {
  const wrap = input.closest(".subtasks-input");
  if (!wrap) return;
  const hasValue = !!input.value.trim();
  wrap.classList.toggle("is-empty", !hasValue);
}
/**
 * Bind subtask list.
 */
function bindSubtaskList(els) {
  if (!els.list) return;
  els.list.onclick = (e) => handleSubtaskListClick(e);
}
/**
 * Handle subtask list click.
 */
function handleSubtaskListClick(e) {
  const item = e.target.closest(".subtasks-item");
  if (!item) return;
  if (handleSubtaskRemove(e)) return;
  if (handleSubtaskEdit(e, item)) return;
  if (handleSubtaskSave(e, item)) return;
  handleSubtaskCancel(e);
}
/**
 * Handle subtask remove.
 */
function handleSubtaskRemove(e) {
  const remove = e.target.closest(".subtasks-remove");
  if (!remove) return false;
  const index = parseInt(remove.dataset.index, 10);
  if (!isNaN(index)) {
    pendingSubtasks.splice(index, 1);
    renderSubtasks();
  }
  return true;
}
/**
 * Handle subtask edit.
 */
function handleSubtaskEdit(e, item) {
  const edit = e.target.closest(".subtasks-edit");
  if (!edit) return false;
  const index = parseInt(edit.dataset.index, 10);
  if (isNaN(index) || !pendingSubtasks[index]) return true;
  const currentTitle = pendingSubtasks[index].title || "";
  startInlineSubtaskEdit(item, index, currentTitle);
  return true;
}
/**
 * Handle subtask save.
 */
function handleSubtaskSave(e, item) {
  const save = e.target.closest(".subtasks-save-edit");
  if (!save) return false;
  const index = parseInt(save.dataset.index, 10);
  if (isNaN(index) || !pendingSubtasks[index]) return true;
  const input = item.querySelector(".subtasks-edit-input");
  if (!input) return true;
  return commitSubtaskTitle(index, input.value);
}
/**
 * Commit subtask title.
 */
function commitSubtaskTitle(index, value) {
  const trimmed = value.trim();
  if (!trimmed) return renderSubtasks(), true;
  pendingSubtasks[index].title = trimmed;
  renderSubtasks();
  return true;
}
/**
 * Handle subtask cancel.
 */
function handleSubtaskCancel(e) {
  const cancel = e.target.closest(".subtasks-cancel-edit");
  if (!cancel) return false;
  renderSubtasks();
  return true;
}
/**
 * Reads subtasks from the input field and adds them to the temporary list.
 * Supports comma, semicolon, or newline separation.
 */
function addSubtasksFromInput() {
  const input = document.getElementById("subtasks");
  if (!input || !input.value.trim()) return;

  input.value
    .split(/[,;\n]+/)
    .map((t) => t.trim())
    .forEach((title) => {
      if (!title) return;
      pendingSubtasks.push({ title, done: false });
    });

  input.value = "";
  renderSubtasks();
}
/**
 * Renders the current list of subtasks in the UI.
 */
function renderSubtasks() {
  const list = document.getElementById("subtasksList");
  if (!list) return;

  list.innerHTML = "";

  pendingSubtasks.forEach((s, i) => {
    list.innerHTML += `
      <li class="subtasks-item">
        <span>${s.title}</span>
        <div class="subtasks-actions">  
        <button class="subtasks-edit" data-index="${i}"><img src="../assets/icons/edit-gray.svg" alt="Edit subtask ${s.title}"></button>
       <span class="subtasks-separator"></span> <button class="subtasks-remove" data-index="${i}"><img src="../assets/icons/delete.svg" alt="Remove subtask ${s.title}"></button>
      </div></li>`;
  });
}
/**
 * Switches a subtask list item into inline edit mode
 * using an input field instead of a prompt.
 * @param {HTMLElement} item
 * @param {number} index
 * @param {string} title
 */
function startInlineSubtaskEdit(item, index, title) {
  if (!item) return;
  item.innerHTML = "";
  const input = createSubtaskEditInput(title);
  const actions = createSubtaskEditActions(index);
  item.appendChild(input);
  item.appendChild(actions);
  focusSubtaskEditInput(input);
}
/**
 * Create subtask edit input.
 */
function createSubtaskEditInput(title) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "subtasks-edit-input";
  input.value = title || "";
  return input;
}
/**
 * Create subtask edit actions.
 */
function createSubtaskEditActions(index) {
  const actions = document.createElement("div");
  actions.className = "subtasks-actions";
  actions.appendChild(createSubtaskSaveBtn(index));
  actions.appendChild(createSubtaskSeparator());
  actions.appendChild(createSubtaskCancelBtn(index));
  return actions;
}
/**
 * Create subtask save button.
 */
function createSubtaskSaveBtn(index) {
  const saveBtn = document.createElement("button");
  saveBtn.className = "subtasks-save-edit";
  saveBtn.dataset.index = String(index);
  saveBtn.innerHTML = '<img src="../assets/icons/check-black.svg" alt="Save subtask">';
  return saveBtn;
}
/**
 * Create subtask separator.
 */
function createSubtaskSeparator() {
  const sep = document.createElement("span");
  sep.className = "subtasks-separator";
  return sep;
}
/**
 * Create subtask cancel button.
 */
function createSubtaskCancelBtn(index) {
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "subtasks-cancel-edit";
  cancelBtn.dataset.index = String(index);
  cancelBtn.innerHTML = '<img src="../assets/icons/iconoir_cancel.svg" alt="Cancel edit">';
  return cancelBtn;
}
/**
 * Focus subtask edit input.
 */
function focusSubtaskEditInput(input) {
  input.focus();
  const len = input.value.length;
  input.setSelectionRange(len, len);
}
