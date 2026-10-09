import { $ } from "./helpers.js";
import { s } from "./multiplier.js";

// ======================
// Reviews (слайдер отзывов)
// ======================
export const initReviews = () => {
  const slider = $(".reviews__slider");
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
