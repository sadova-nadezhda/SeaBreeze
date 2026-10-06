import { $$ } from "./helpers.js";
import { s } from "./multiplier.js";

// ======================
// News (слайдеры карточек: афиши и акции)
// ======================
export const initNews = () => {
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
