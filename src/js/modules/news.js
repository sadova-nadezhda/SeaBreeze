import { $, $$ } from "./helpers.js";
import { s } from "./multiplier.js";
import { refreshLayout } from "./layout.js";
import { reducedMotion } from "./reveal.js";

// ======================
// News (слайдеры карточек: афиши и акции)
// ======================
const initSliders = () => {
  if (typeof Swiper === "undefined") return;

  $$(".news__slider").forEach((slider) => {
    new Swiper(slider, {
      slidesPerView: "auto",
      spaceBetween: s(8),
      speed: 600,
      grabCursor: true,
    });
  });
};

// ======================
// Страница новостей: «Показать еще» открывает скрытые карточки порциями
// ======================
const initMore = () => {
  $$(".news--list").forEach((section) => {
    const list = $(".news__list", section);
    const btn = $(".news__more", section);
    if (!list || !btn) return;

    const step = Number(list.dataset.step) || 6;
    const hiddenCards = () => $$(".news__card[hidden]", list);

    if (!hiddenCards().length) {
      btn.hidden = true;
      return;
    }

    btn.addEventListener("click", () => {
      const batch = hiddenCards().slice(0, step);
      batch.forEach((card) => { card.hidden = false; });
      if (!hiddenCards().length) btn.hidden = true;

      if (typeof gsap !== "undefined" && !reducedMotion()) {
        gsap.fromTo(batch,
          { clipPath: "inset(50% 0% 50% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power3.inOut", clearProps: "clipPath" });
      }

      refreshLayout();
    });
  });
};

export const initNews = () => {
  initSliders();
  initMore();
};
