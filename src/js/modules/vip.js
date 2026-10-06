import { $, $$ } from "./helpers.js";

// ======================
// VIP (табы кабинетов)
// ======================
export const initVip = () => {
  const vip = $(".vip");
  if (!vip) return;

  const tabs = $$(".vip__tab", vip);
  const panels = $$(".vip__panel", vip);

  const select = (tab) => {
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });
    panels.forEach((panel) => { panel.hidden = panel.id !== tab.getAttribute("aria-controls"); });
    tab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => select(tab)));
};
