import { $, $$ } from "./helpers.js";
import { s } from "./multiplier.js";
import { refreshLayout } from "./layout.js";

// ======================
// Cuisine (якоря категорий)
// ======================
const initAnchors = () => {
  const cuisine = $(".cuisine:not(.cuisine--services)");
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

// ======================
// Услуги СПА (табы-переключатели панелей + табы-якоря групп)
// ======================
const initTabs = () => {
  const services = $(".cuisine--services");
  if (!services) return;

  const header = $(".header");
  const nav = $(".cuisine__tabs", services);
  const tabs = $$(".cuisine__tab[role='tab']", services);
  const anchors = $$(".cuisine__tab[data-group]", services);
  const panels = $$(".cuisine__panel", services);

  const headerHeight = () => (header ? header.offsetHeight : 0);
  const scrollTo = (target, offset) => {
    if (window.lenis) window.lenis.scrollTo(target, { offset: -offset });
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
  };

  const stickyOffset = () => headerHeight() + nav.offsetHeight + s(16);
  const centerTab = (tab) => nav.scrollTo({ left: tab.offsetLeft - (nav.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });

  // Активен один таб: якорь группы, до которой доскроллили, иначе — выбранная панель
  let selected = tabs.find((t) => t.getAttribute("aria-selected") === "true");
  let current = null;
  const update = () => {
    const offset = stickyOffset();
    const line = offset + (window.innerHeight - offset) / 3;
    const group = $$(".cuisine__panel:not([hidden]) [data-group]", services)
      .filter((g) => g.getBoundingClientRect().top <= line)
      .pop();
    const anchor = (group && anchors.find((a) => a.dataset.group === group.dataset.group)) || null;
    tabs.forEach((t) => t.classList.toggle("is-active", !anchor && t === selected));
    if (anchor === current) return;
    current = anchor;
    anchors.forEach((a) => {
      const active = a === anchor;
      a.classList.toggle("is-active", active);
      if (active) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    if (anchor) centerTab(anchor);
  };

  const select = (tab) => {
    selected = tab;
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
    panels.forEach((panel) => { panel.hidden = panel.id !== tab.getAttribute("aria-controls"); });
    centerTab(tab);
    refreshLayout();
    update();
    // Табы прилипли — возвращаемся к началу нового списка
    if (services.getBoundingClientRect().top < headerHeight()) scrollTo(services, headerHeight());
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => select(tab)));

  anchors.forEach((anchor) => {
    anchor.addEventListener("click", () => {
      const group = $(`.cuisine__panel:not([hidden]) [data-group="${anchor.dataset.group}"]`, services);
      if (group) scrollTo(group, stickyOffset());
    });
  });

  window.addEventListener("scroll", update, { passive: true });
  update();
};

export const initCuisine = () => {
  initAnchors();
  initTabs();
};
