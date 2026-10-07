import { $ } from "./helpers.js";
import { s } from "./multiplier.js";

// ======================
// Bath space (слайдер фотографий с подписями)
// ======================
export const initBathSpace = () => {
  const slider = $(".bath-space__slider");
  if (!slider || typeof Swiper === "undefined") return;

  new Swiper(slider, {
    slidesPerView: "auto",
    spaceBetween: s(8),
    speed: 600,
    grabCursor: true,
  });
};
