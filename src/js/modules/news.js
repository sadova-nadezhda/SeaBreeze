import { $, $$ } from "./helpers.js";
import { s } from "./multiplier.js";
import { refreshLayout } from "./layout.js";

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
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      }
    });
  });
};

// ======================
// «Показать еще» открывает скрытые карточки порциями
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
      hiddenCards().slice(0, step).forEach((card) => { card.hidden = false; });
      if (!hiddenCards().length) btn.hidden = true;

      refreshLayout();
    });
  });
};

export const initNews = () => {
  initSliders();
  initMore();
};
