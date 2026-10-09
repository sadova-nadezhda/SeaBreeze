import { $ } from "./helpers.js";
import { s } from "./multiplier.js";

// ======================
// Banya (слайдер фотографий)
// ======================
export const initBanya = () => {
  const slider = $(".banya__slider");
  if (!slider || typeof Swiper === "undefined") return;

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
};
