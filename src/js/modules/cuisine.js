import { $, $$ } from "./helpers.js";
import { s } from "./multiplier.js";

// ======================
// Cuisine (якоря категорий)
// ======================
export const initCuisine = () => {
  const cuisine = $(".cuisine");
  if (!cuisine) return;

  const header = $(".header");
  const nav = $(".cuisine__tabs", cuisine);
  const tabs = $$(".cuisine__tab", cuisine);
  const groups = $$(".cuisine__group", cuisine);
  if (!nav || !tabs.length) return;

  const headerHeight = () => (header ? header.offsetHeight : 0);
  const stickyOffset = () => headerHeight() + nav.offsetHeight + s(16);

  let current = null;
  const setActive = (tab) => {
    if (!tab || tab === current) return;
    current = tab;
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      if (active) t.setAttribute("aria-current", "true");
      else t.removeAttribute("aria-current");
    });
    nav.scrollTo({ left: tab.offsetLeft - (nav.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
  };

  const update = () => {
    const offset = stickyOffset();
    const line = offset + (window.innerHeight - offset) / 3;
    const group = groups.filter((g) => g.getBoundingClientRect().top <= line).pop();
    setActive(tabs.find((t) => t.hash === (group ? `#${group.id}` : "#cuisine")));
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      const target = $(tab.hash);
      e.preventDefault();
      e.stopPropagation();
      if (!target) return;
      const offset = target === cuisine ? headerHeight() : stickyOffset();
      if (window.lenis) window.lenis.scrollTo(target, { offset: -offset });
      else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
    });
  });

  window.addEventListener("scroll", update, { passive: true });
  update();
};
