// ------------------ CONTACTS / MULTI SELECT ------------------

/**
 * Loads contacts and populates the assign dropdown.
 */
async function populateAssignedContacts() {
  const dropdown = document.getElementById("assignedDropdown");
  if (!dropdown) return;
  resetAssignedDropdown(dropdown);
  const list = await getContactsListFromStorage();
  list.forEach((c) => appendAssignedContactRow(dropdown, c));
}
/**
 * Reset assigned dropdown.
 */
function resetAssignedDropdown(dropdown) {
  dropdown.innerHTML = "";
}
/**
 * Get contacts list from storage.
 */
async function getContactsListFromStorage() {
  const data = await loadContactsFromStorage();
  const list = Array.isArray(data) ? data : Object.values(data || {});
  syncCachedContacts(list);
  return list;
}
/**
 * Sync cached contacts.
 */
function syncCachedContacts(list) {
  if (!Array.isArray(list)) return;
  if (list.length || !cachedContacts.length) cachedContacts = list;
}
/**
 * Get cached contacts list.
 */
function getCachedContactsList() {
  return Array.isArray(cachedContacts) ? cachedContacts : [];
}
/**
 * Get contacts list for avatars.
 */
async function getContactsListForAvatars() {
  const cached = getCachedContactsList();
  if (cached.length) return cached;
  return await getContactsListFromStorage();
}
/**
 * Append assigned contact row.
 */
function appendAssignedContactRow(dropdown, contact) {
  if (!contact?.id) return;
  dropdown.appendChild(buildAssignedContactRow(contact));
}
/**
 * Build assigned contact row.
 */
function buildAssignedContactRow(contact) {
  const row = document.createElement("div");
  row.className = "contact-option";
  row.dataset.id = String(contact.id);
  row.innerHTML = getAssignedContactRowHtml(contact);
  row.onclick = (e) => {
    e.stopPropagation();
    toggleContact(contact.id);
  };
  return row;
}
/**
 * Get assigned contact row HTML.
 */
function getAssignedContactRowHtml(contact) {
  const name = getContactLabel(contact);
  const colorClass = addTaskGetContactColorClass(contact);
  const checked = selectedContacts.has(normalizeContactId(contact.id)) ? "checked" : "";
  return (
    `<div class="contact-avatar ${colorClass}">${addTaskGetInitials(name)}</div>` +
    `<span>${name}</span>` +
    `<input type="checkbox" ${checked}>`
  );
}
/**
 * Toggles selection state of a contact.
 * @param {string} id Contact ID
 */
function toggleContact(id) {
  const key = normalizeContactId(id);
  selectedContacts.has(key) ? selectedContacts.delete(key) : selectedContacts.add(key);
  updateAssignedCheckboxes();
  renderSelectedContacts();
}
/**
 * Updates the checked state of checkboxes in the existing
 * dropdown without rebuilding all rows.
 */
function updateAssignedCheckboxes() {
  const dropdown = document.getElementById("assignedDropdown");
  if (!dropdown) return;
  const rows = dropdown.querySelectorAll(".contact-option");
  rows.forEach((row) => {
    const id = row.dataset.id;
    if (!id) return;
    const input = row.querySelector('input[type="checkbox"]');
    if (!input) return;
    input.checked = selectedContacts.has(id);
  });
}
/**
 * Renders selected contacts as avatars.
 */
async function renderSelectedContacts() {
  const text = document.getElementById("assignedText");
  if (!text) return;
  if (!selectedContacts.size) return setAssignedPlaceholder(text);
  const view = await buildSelectedContactsView();
  text.innerHTML = view.avatarsHtml + view.moreHtml;
}
/**
 * Set assigned placeholder.
 */
function setAssignedPlaceholder(text) {
  text.textContent = "Select contacts to assign";
}
/**
 * Build selected contacts view.
 */
async function buildSelectedContactsView() {
  const list = await getContactsListForAvatars();
  const selectedIds = Array.from(selectedContacts);
  const visible = selectedIds.slice(0, 8);
  const remaining = selectedIds.length - visible.length;
  return {
    avatarsHtml: addTaskBuildContactAvatarsHtml(list, visible),
    moreHtml: buildMoreAvatarsHtml(remaining),
  };
}
/**
 * Build contact avatars HTML.
 */
function addTaskBuildContactAvatarsHtml(list, ids) {
  return ids
    .map((id) => addTaskBuildSingleAvatarHtml(list, id))
    .join("");
}
/**
 * Build single avatar HTML.
 */
function addTaskBuildSingleAvatarHtml(list, id) {
  const c = findContactById(list, id);
  if (!c) return "";
  const colorClass = addTaskGetContactColorClass(c || {});
  const label = getContactLabel(c);
  return `<span class="contact-avatar ${colorClass}">${addTaskGetInitials(label)}</span>`;
}

/**
 * Normalize contact id.
 */
function normalizeContactId(id) {
  return String(id);
}

/**
 * Find contact by id.
 */
function findContactById(list, id) {
  const key = normalizeContactId(id);
  return list.find((x) => normalizeContactId(x.id) === key);
}
/**
 * Get contact label.
 */
function getContactLabel(contact) {
  return contact?.name || contact?.namen || contact?.email || contact?.mail || contact?.id || "";
}
/**
 * Build more avatars HTML.
 */
function buildMoreAvatarsHtml(remaining) {
  if (remaining > 0) return `<span class="contact-avatar contact-avatar-more">+${remaining}</span>`;
  return "";
}
/**
 * Initializes dropdown behavior for the contact selector.
 */
function initAssignedDropdown() {
  const els = getAssignedDropdownEls();
  if (!els) return;
  bindAssignedInput(els);
  bindAssignedArrow(els);
  bindAssignedOutside(els);
}
/**
 * Get assigned dropdown elements.
 */
function getAssignedDropdownEls() {
  const input = document.getElementById("assignedInput");
  const dropdown = document.getElementById("assignedDropdown");
  const arrow = document.getElementById("dropdownArrow");
  if (!input || !dropdown || !arrow) return null;
  return { input: input, dropdown: dropdown, arrow: arrow, wrapper: input.closest(".multi-select") };
}
/**
 * Bind assigned input.
 */
function bindAssignedInput(els) {
  els.input.onclick = (e) => {
    e.stopPropagation();
    toggleAssignedDropdown(els);
  };
}
/**
 * Bind assigned arrow.
 */
function bindAssignedArrow(els) {
  els.arrow.onclick = (e) => {
    e.stopPropagation();
    toggleAssignedDropdown(els);
  };
}
/**
 * Bind assigned outside.
 */
function bindAssignedOutside(els) {
  document.addEventListener("click", (e) => {
    if (els.wrapper && els.wrapper.contains(e.target)) return;
    closeAssignedDropdown(els);
  });
}
/**
 * Toggle assigned dropdown.
 */
function toggleAssignedDropdown(els) {
  if (els.dropdown.classList.contains("hidden")) return openAssignedDropdown(els);
  closeAssignedDropdown(els);
}
/**
 * Open assigned dropdown.
 */
function openAssignedDropdown(els) {
  els.dropdown.classList.remove("hidden");
  els.arrow.classList.add("open");
}
/**
 * Close assigned dropdown.
 */
function closeAssignedDropdown(els) {
  els.dropdown.classList.add("hidden");
  els.arrow.classList.remove("open");
}
// ------------------ CATEGORY SELECT ------------------
/**
 * Initializes dropdown behavior for the category selector.
 */
function initCategoryDropdown() {
  const els = getCategoryDropdownEls();
  if (!els) return;
  bindCategoryInput(els);
  bindCategoryArrow(els);
  bindCategoryOptions(els);
  bindCategoryOutside(els);
  setCategorySelection(els.hidden.value || "");
}
/**
 * Get category dropdown elements.
 */
function getCategoryDropdownEls() {
  const input = document.getElementById("categoryInput");
  const dropdown = document.getElementById("categoryDropdown");
  const arrow = document.getElementById("categoryArrow");
  const hidden = document.getElementById("category");
  if (!input || !dropdown || !arrow || !hidden) return null;
  const wrapper = input.closest(".category-select") || input.parentElement;
  return { input: input, dropdown: dropdown, arrow: arrow, hidden: hidden, wrapper: wrapper };
}
/**
 * Bind category input.
 */
function bindCategoryInput(els) {
  els.input.onclick = (e) => {
    e.stopPropagation();
    toggleCategoryDropdown(els);
  };
}
/**
 * Bind category arrow.
 */
function bindCategoryArrow(els) {
  els.arrow.onclick = (e) => {
    e.stopPropagation();
    toggleCategoryDropdown(els);
  };
}
/**
 * Bind category options.
 */
function bindCategoryOptions(els) {
  els.dropdown.addEventListener("click", (e) => {
    const option = e.target.closest(".category-option");
    if (!option) return;
    setCategorySelection(option.dataset.value || "");
    closeCategoryDropdown(els);
  });
}
/**
 * Bind category outside.
 */
function bindCategoryOutside(els) {
  document.addEventListener("click", (e) => {
    if (els.wrapper && els.wrapper.contains(e.target)) return;
    closeCategoryDropdown(els);
  });
}
/**
 * Toggle category dropdown.
 */
function toggleCategoryDropdown(els) {
  if (els.dropdown.classList.contains("hidden")) return openCategoryDropdown(els);
  closeCategoryDropdown(els);
}
/**
 * Open category dropdown.
 */
function openCategoryDropdown(els) {
  els.dropdown.classList.remove("hidden");
  els.arrow.classList.add("open");
}
/**
 * Close category dropdown.
 */
function closeCategoryDropdown(els) {
  els.dropdown.classList.add("hidden");
  els.arrow.classList.remove("open");
}
/**
 * Applies the category selection to hidden input and UI.
 * @param {string} value
 */
/**
 * Set category selection.
 */
function setCategorySelection(value) {
  const els = getCategorySelectionEls();
  if (!els) return;
  const label = updateCategoryOptions(els.dropdown, value);
  applyCategorySelection(els, value, label);
}
/**
 * Get category selection elements.
 */
function getCategorySelectionEls() {
  const hidden = document.getElementById("category");
  const text = document.getElementById("categoryText");
  const dropdown = document.getElementById("categoryDropdown");
  if (!hidden || !text || !dropdown) return null;
  return { hidden: hidden, text: text, dropdown: dropdown };
}
/**
 * Update category options.
 */
function updateCategoryOptions(dropdown, value) {
  const options = dropdown.querySelectorAll(".category-option");
  let label = "Select task category";
  options.forEach((option) => {
    const isSelected = option.dataset.value === value;
    if (isSelected) label = option.textContent.trim();
    option.classList.toggle("selected", isSelected);
  });
  return label;
}
/**
 * Apply category selection.
 */
function applyCategorySelection(els, value, label) {
  els.hidden.value = value || "";
  els.text.textContent = label;
  els.text.classList.toggle("placeholder", !value);
}
