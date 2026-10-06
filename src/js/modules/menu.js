import { $, $$ } from "./helpers.js";

// ======================
// Menu (боковая навигация)
// ======================
export const initMenu = ({ scrollLock } = {}) => {
  const menu = $(".menu");
  if (!menu) return;

  const buttons = $$(".menu-btn");
  const toggles = $$(".menu__toggle", menu);
  const isOpen = () => menu.classList.contains("open");

  const setState = (open) => {
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", String(!open));
    buttons.forEach((btn) => btn.setAttribute("aria-expanded", String(open)));
  };

  const openMenu = () => {
    if (isOpen()) return;
    setState(true);
    scrollLock?.lock?.("menu");
    $(".menu__close", menu)?.focus({ preventScroll: true });
  };

  const closeMenu = () => {
    if (!isOpen()) return;
    setState(false);
    scrollLock?.unlock?.("menu");
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => (isOpen() ? closeMenu() : openMenu()));
  });

  // Аккордеон подменю
  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
    });
  });

  menu.addEventListener("click", (e) => {
    if (
      e.target === menu ||
      e.target.closest(".menu__close") ||
      e.target.closest("a[href]")
    ) closeMenu();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  return { open: openMenu, close: closeMenu };
};
