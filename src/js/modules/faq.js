import { $$ } from "./helpers.js";
import { refreshLayout } from "./layout.js";

// ======================
// FAQ (аккордеон)
// ======================
const initList = (list) => {
  const toggles = $$(".faq__toggle", list);

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggles.forEach((el) => el.setAttribute("aria-expanded", String(el === toggle && !expanded)));
    });
  });

  list.addEventListener("transitionend", (e) => {
    if (e.propertyName === "grid-template-rows") refreshLayout();
  });
};

export const initFaq = () => $$(".faq__list").forEach(initList);
