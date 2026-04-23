/**
 * Navigation Module
 * Handles menu toggle functionality
 */

export function showMenu() {
  const menu = document.getElementById("menu");
  const closeIcon = document.getElementById("close-icon");
  const openIcon = document.getElementById("open-icon");

  if (menu && closeIcon && openIcon) {
    menu.style.opacity = 1;
    menu.style.zIndex = 22;
    openIcon.style.display = 'none';
    closeIcon.style.display = 'block';
    openIcon.setAttribute('aria-expanded', 'true');
    closeIcon.setAttribute('aria-expanded', 'true');
  }
}

export function hideMenu() {
  const menu = document.getElementById("menu");
  const closeIcon = document.getElementById("close-icon");
  const openIcon = document.getElementById("open-icon");

  if (menu && closeIcon && openIcon) {
    menu.style.opacity = 0;
    menu.style.zIndex = -1;
    closeIcon.style.display = 'none';
    openIcon.style.display = 'block';
    openIcon.setAttribute('aria-expanded', 'false');
    closeIcon.setAttribute('aria-expanded', 'false');
  }
}

// Initialize navigation functionality
function initNavigation() {
  const openIcon = document.getElementById("open-icon");
  const closeIcon = document.getElementById("close-icon");

  if (openIcon) {
    openIcon.onclick = showMenu;
  }

  if (closeIcon) {
    closeIcon.onclick = hideMenu;
  }

  document.querySelectorAll('.main-nav a[href^="#"]').forEach((link) => {
    link.addEventListener('click', hideMenu);
  });

  console.log('Navigation system initialized');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initNavigation);

// Export for global access
window.showMenu = showMenu;
window.hideMenu = hideMenu;
