import { $, $$ } from "./helpers.js";
import { s } from "./multiplier.js";

// ======================
// VIP (табы кабинетов, слайдер фотографий)
// ======================
const LOOP_MIN_SLIDES = 6;

// Слайдер живёт только на активной панели: при показе создаётся, при скрытии уничтожается
const destroySlider = (panel) => $(".vip__slider", panel)?.swiper?.destroy(true, true);

const initSlider = (panel) => {
  const slider = $(".vip__slider", panel);
  if (!slider || slider.swiper || typeof Swiper === "undefined") return;

  // Для бесконечной прокрутки с видимыми соседями слайдов должно хватать на оба края
  const wrapper = $(".swiper-wrapper", slider);
  const slides = $$(".vip__slide", slider);
  for (let i = 0; slides.length && wrapper.children.length < LOOP_MIN_SLIDES; i++) {
    const clone = slides[i % slides.length].cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    wrapper.append(clone);
  }

  new Swiper(slider, {
    slidesPerView: "auto",
    centeredSlides: true,
    slideToClickedSlide: true,
    spaceBetween: s(8),
    speed: 600,
    grabCursor: true,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    }
  });
};

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
    panels.forEach((panel) => {
      panel.hidden = panel.id !== tab.getAttribute("aria-controls");
      if (panel.hidden) destroySlider(panel);
      else initSlider(panel);
    });
    tab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => select(tab)));
  panels.filter((panel) => !panel.hidden).forEach(initSlider);
};
