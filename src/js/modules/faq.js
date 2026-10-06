import { $, $$ } from "./helpers.js";
import { refreshLayout } from "./layout.js";

// ======================
// FAQ (аккордеон: открыт только один пункт)
// ======================
export const initFaq = () => {
  const list = $(".faq__list");
  if (!list) return;

  const toggles = $$(".faq__toggle", list);

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggles.forEach((el) => el.setAttribute("aria-expanded", String(el === toggle && !expanded)));
    });
  });

  // высота страницы меняется после раскрытия
  list.addEventListener("transitionend", (e) => {
    if (e.propertyName === "grid-template-rows") refreshLayout();
  });
};
