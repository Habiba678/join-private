 /**
 * Creates a letter group header.
 * @param {string} letter
 * @returns {string}
 */
function letterGroupTemplate(letter) {
  return `
    <div class="letter-group">
      ${letter}
    </div>
  `;
}

/**
 * Creates one contact list item.
 * @param {Object} c
 * @param {boolean} isActive
 * @returns {string}
 */
function contactListItemTemplate(c, isActive) {
  return `
    <div class="contact-item ${isActive ? "active" : ""}" data-id="${c.id}">
      <div class="avatar ${c.colorClass}">
        ${c.initials}
      </div>
      <div class="contact-text">
        <div class="contact-name">${c.name}</div>
        <div class="contact-mail">${c.email}</div>
      </div>
    </div>
  `;
}

/**
 * Creates the action buttons for a contact.
 * @param {Object} c
 * @returns {string}
 */
function contactActionsTemplate(c) {
  return `
    <div class="contact-actions">
      <button class="contact-action edit" data-action="edit" data-id="${c.id}">
        <img src="../assets/icons/edit.svg" alt="">
        <span>Edit</span>
      </button>
      <button class="contact-action delete" data-action="delete" data-id="${c.id}">
        <img src="../assets/icons/delete.svg" alt="">
        <span>Delete</span>
      </button>
    </div>
  `;
}

/**
 * Creates the full contact details view.
 * @param {Object} c
 * @returns {string}
 */
function contactDetailsTemplate(c) {
  return `
    ${contactDetailsTopbarTemplate()}
    ${contactDetailsHeaderTemplate(c)}
    ${contactDetailsInfoTemplate(c)}
  `;
}

/**
 * Creates the contact details top bar.
 * @returns {string}
 */
function contactDetailsTopbarTemplate() {
  return `
    <div class="contact-detail-topbar">
      <button class="mobile-back-btn" id="mobileBackBtn" type="button">
        <img src="../assets/icons/pfeil-links-blue.png" alt="">
      </button>
      <div class="contact-detail-topbar-spacer"></div>
    </div>
  `;
}

/**
 * Creates the header section of the details view.
 * @param {Object} c
 * @returns {string}
 */
function contactDetailsHeaderTemplate(c) {
  return `
    <div class="contact-detail-header">
      <div class="avatar big ${c.colorClass}">
        ${c.initials}
      </div>
      <div class="contact-detail-headtext">
        <h2 class="contact-detail-name">${c.name}</h2>
        ${contactActionsTemplate(c)}
      </div>
    </div>
  `;
}

/**
 * Creates the info section of the details view.
 * @param {Object} c
 * @returns {string}
 */
function contactDetailsInfoTemplate(c) {
  return `
    <div class="contact-info">
      <h3>Contact Information</h3>
      <p>
        <strong>Email</strong><br>
        <a href="mailto:${c.email}">${c.email}</a>
      </p>
      <p>
        <strong>Phone</strong><br>
        <span>${c.phone || "-"}</span>
      </p>
    </div>
  `;
}

/**
 * Creates the left side of the modal.
 * @param {string} mode
 * @returns {string}
 */
function modalLeftTemplate(mode) {
  return `
    <div class="modal-left">
      <button class="modal-close" id="closeAddContact" type="button">×</button>
      <img src="../assets/icons/logo-white.svg" class="modal-logo" alt="">
      <h2 class="modal-title">${
        String(mode || "").trim().toLowerCase() === "edit"
          ? "Edit contact"
          : "Add contact"
      }</h2>
      <p class="modal-subtitle">Tasks are better with a team!</p>
      <div class="modal-line"></div>
    </div>
  `;
}

/**
 * Creates the avatar section inside the modal.
 * @param {string} mode
 * @param {Object} data
 * @returns {string}
 */
function modalAvatarTemplate(mode, data) {
  return String(mode || "").trim().toLowerCase() === "edit"
    ? `
      <div class="modal-person ${data && data.colorClass ? data.colorClass : ""}">
        <span class="modal-initials">${data && data.initials ? data.initials : ""}</span>
      </div>
    `
    : `
      <div class="modal-person">
        <img src="../assets/icons/person.png" alt="">
      </div>
    `;
}

/**
 * Creates the modal action buttons.
 * @param {string} mode
 * @param {Object} data
 * @returns {string}
 */
function modalActionsTemplate(mode, data) {
  return `
    <div class="modal-actions">
      ${buildModalSecondaryAction(buildModalActionsView(mode, data))}
      ${buildModalPrimaryAction(buildModalActionsView(mode, data))}
    </div>
  `;
}

/**
 * Builds the action state for the modal.
 * @param {string} mode
 * @param {Object} data
 * @returns {{edit:boolean,id:string}}
 */
function buildModalActionsView(mode, data) {
  return {
    edit: isEditMode(mode),
    id: isEditMode(mode) && data ? data.id : ""
  };
}

/**
 * Creates the secondary modal action button.
 * @param {{edit:boolean,id:string}} view
 * @returns {string}
 */
function buildModalSecondaryAction(view) {
  return `
    <button type="button"
            class="${view.edit ? "btn-cancel contact-action" : "btn-cancel"}"
            id="${view.edit ? "modalSecondaryBtn" : "closeAddContact"}"
            data-action="${view.edit ? "delete" : "cancel"}"
            data-id="${view.id}">
      ${view.edit ? "Delete" : "Cancel"}
      <img src="../assets/icons/${view.edit ? "delete.svg" : "iconoir_cancel.svg"}" alt="">
    </button>
  `;
}

/**
 * Creates the primary modal action button.
 * @param {{edit:boolean,id:string}} view
 * @returns {string}
 */
function buildModalPrimaryAction(view) {
  return `
    <button type="submit" class="btn-create">
      ${view.edit ? "Save" : "Create contact"}
      <img src="../assets/icons/check-white.svg" alt="">
    </button>
  `;
}

/**
 * Creates the form section of the modal.
 * @param {string} mode
 * @param {Object} data
 * @returns {string}
 */
function modalFormTemplate(mode, data) {
  return `
    <form id="addContactForm"
          novalidate
          data-mode="${normalizeMode(mode)}"
          data-edit-id="${data && data.id ? data.id : ""}">
      ${modalNameFieldTemplate(data)}
      ${modalEmailFieldTemplate(data)}
      ${modalPhoneFieldTemplate(data)}
      ${modalActionsTemplate(mode, data)}
    </form>
  `;
}

/**
 * Creates the name input field.
 * @param {Object} data
 * @returns {string}
 */
function modalNameFieldTemplate(data) {
  return `
    <div class="input-wrapper">
      <input id="contactName" type="text" placeholder="Name" required value="${data?.name || ""}">
      <img src="../assets/icons/person.png" class="input-icon" alt="">
      <div class="input-error-message" id="nameError"></div>
    </div>
  `;
}

/**
 * Creates the email input field.
 * @param {Object} data
 * @returns {string}
 */
function modalEmailFieldTemplate(data) {
  return `
    <div class="input-wrapper">
      <input id="contactEmail" type="email" placeholder="Email" required value="${data?.email || ""}">
      <img src="../assets/icons/mail.png" class="input-icon" alt="">
      <div class="input-error-message" id="emailError"></div>
    </div>
  `;
}

/**
 * Creates the phone input field.
 * @param {Object} data
 * @returns {string}
 */
function modalPhoneFieldTemplate(data) {
  return `
    <div class="input-wrapper">
      <input id="contactPhone" type="text" placeholder="Phone" value="${data?.phone || ""}">
      <img src="../assets/icons/call.svg" class="input-icon" alt="">
      <div class="input-error-message" id="phoneError"></div>
    </div>
  `;
}

/**
 * Normalizes the modal mode value.
 * @param {string} mode
 * @returns {string}
 */
function normalizeMode(mode) {
  return String(mode || "").trim().toLowerCase();
}

/**
 * Checks whether the modal is in edit mode.
 * @param {string} mode
 * @returns {boolean}
 */
function isEditMode(mode) {
  return normalizeMode(mode) === "edit";
}

/**
 * Creates the right side of the modal.
 * @param {string} mode
 * @param {Object} data
 * @returns {string}
 */
function modalRightTemplate(mode, data) {
  return `
    <div class="modal-right">
      ${modalAvatarTemplate(mode, data || {})}
      ${modalFormTemplate(mode, data || {})}
    </div>
  `;
}

/**
 * Creates the inner modal structure.
 * @param {string} mode
 * @param {Object} data
 * @returns {string}
 */
function contactModalInnerTemplate(mode, data) {
  return `
    <div class="modal">
      ${modalLeftTemplate(mode)}
      ${modalRightTemplate(mode, data || {})}
    </div>
  `;
}

/**
 * Creates the full contact modal.
 * @param {string} mode
 * @param {Object} data
 * @returns {string}
 */
function contactModalTemplate(mode, data) {
  return `
    <div class="modal-backdrop d-none" id="addContactModal">
      ${contactModalInnerTemplate(mode, data || {})}
    </div>
    <div id="contactSuccessToast" class="contact-toast d-none">
      Contact successfully created
    </div>
  `;
}