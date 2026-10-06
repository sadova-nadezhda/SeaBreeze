import { $ } from "./helpers.js";
import { s } from "./multiplier.js";

// ======================
// About (слайдер фотографий)
// ======================
export const initAbout = () => {
  const slider = $(".about__slider");
  if (!slider || typeof Swiper === "undefined") return;

  new Swiper(slider, {
    slidesPerView: "auto",
    spaceBetween: s(8),
    speed: 600,
    grabCursor: true,
  });
};
