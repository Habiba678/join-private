/** Breakpoint used to detect mobile devices */
const MOBILE_BP = 680;

/**
 * Checks if the current viewport matches the mobile breakpoint.
 * @returns {boolean}
 */
window.isMobile = function () {
  return window.matchMedia && window.matchMedia(`(max-width: ${MOBILE_BP}px)`).matches;
};

/**
 * Returns a DOM element by id.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function el(id) {
  return document.getElementById(id);
}

/**
 * Returns the mobile actions menu element.
 * @returns {HTMLElement|null}
 */
function menuEl() {
  return el("mobileActionsMenu");
}

/**
 * Returns the floating mobile menu button.
 * @returns {HTMLElement|null}
 */
function btnEl() {
  return el("mobileMenuBtn");
}

/**
 * Gets the currently selected contact id.
 * @returns {string}
 */
function getSelectedId() {
  try {
    return typeof selectedId !== "undefined" ? selectedId : "";
  } catch {
    return "";
  }
}

/**
 * Updates dataset ids for edit and delete buttons in the mobile menu.
 * @returns {void}
 */
function syncMenuIds() {
  const menu = menuEl();
  if (!menu) return;

  const editBtn = menu.querySelector('[data-action="edit"]');
  const delBtn = menu.querySelector('[data-action="delete"]');

  const id = getSelectedId();

  if (editBtn) editBtn.dataset.id = id || "";
  if (delBtn) delBtn.dataset.id = id || "";
}

/**
 * Shows the contact details view on mobile.
 * @returns {void}
 */
window.showMobileDetails = function () {
  if (!window.isMobile()) return;
  document.body.classList.add("show-contact-details");
  const btn = btnEl();
  if (btn) btn.classList.remove("d-none");
  syncMenuIds();
  window.closeMobileMenu();
};

/**
 * Switches back to the contact list view on mobile.
 * @returns {void}
 */
window.showMobileList = function () {
  document.body.classList.remove("show-contact-details");
  const btn = btnEl();
  if (btn) btn.classList.add("d-none");
  window.closeMobileMenu();
};

/**
 * Toggles the mobile actions menu.
 * @returns {void}
 */
window.toggleMobileMenu = function () {
  const menu = menuEl();
  if (!menu) return;

  syncMenuIds();

  if (menu.classList.contains("is-open")) {
    window.closeMobileMenu();
  } else {
    menu.classList.remove("d-none");
    menu.classList.add("is-open");
  }
};

/**
 * Closes the mobile actions menu.
 * @returns {void}
 */
window.closeMobileMenu = function () {
  const menu = menuEl();
  if (!menu) return;
  menu.classList.remove("is-open");
  menu.classList.add("d-none");
};

/**
 * Handles clicks outside the mobile menu.
 * @param {MouseEvent} e
 * @returns {void}
 */
window.handleOutsideMobileMenuClick = function (e) {
  if (!window.isMobile()) return;

  const menu = menuEl();
  if (!menu || !menu.classList.contains("is-open")) return;

  const insideMenu = e.target.closest("#mobileActionsMenu");
  const onBtn = e.target.closest("#mobileMenuBtn");

  if (!insideMenu && !onBtn) window.closeMobileMenu();
};

/**
 * Handles mobile navigation buttons.
 * @param {MouseEvent} e
 * @returns {void}
 */
function handleMobileButtonsClick(e) {
  if (!window.isMobile()) return;

  if (e.target.closest("#mobileBackBtn")) {
    e.preventDefault();
    window.showMobileList();
    return;
  }

  if (e.target.closest("#mobileMenuBtn")) {
    e.preventDefault();
    window.toggleMobileMenu();
    return;
  }
}

document.addEventListener("click", function (e) {
  handleMobileButtonsClick(e);
  window.handleOutsideMobileMenuClick && window.handleOutsideMobileMenuClick(e);
});

/**
 * Adjusts layout when the viewport size changes.
 */
window.addEventListener("resize", () => {
  if (!window.isMobile()) window.showMobileList();
});

document.addEventListener("DOMContentLoaded", () => {
  const menu = menuEl();
  if (menu) menu.classList.add("d-none");

  if (window.isMobile()) window.showMobileList();
  else {
    const btn = btnEl();
    if (btn) btn.classList.add("d-none");
  }

  syncMenuIds();
});

/**
 * Extends renderDetails to update the mobile menu.
 */
(function () {
  if (typeof window.renderDetails !== "function") return;

  const _renderDetails = window.renderDetails;
  window.renderDetails = function () {
    _renderDetails();
    syncMenuIds();
    if (window.isMobile()) window.showMobileDetails();
  };
})();