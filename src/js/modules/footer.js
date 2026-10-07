import { $, $$ } from "./helpers.js";

// ======================
// Footer (аккордеон колонок на мобильных)
// ======================
export const initFooter = () => {
  const footer = $(".footer");
  if (!footer) return;

  const toggles = $$(".footer__toggle", footer);
  const mobile = window.matchMedia("(max-width: 767px)");

  const sync = () => toggles.forEach((toggle) => { toggle.disabled = !mobile.matches; });
  sync();
  mobile.addEventListener("change", sync);

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
    });
  });
};
