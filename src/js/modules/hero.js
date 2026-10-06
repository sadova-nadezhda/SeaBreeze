import { $ } from "./helpers.js";

// ======================
// Hero (слайдер фона + плашка перехода)
// ======================
export const initHero = () => {
  const hero = $(".hero");
  if (!hero) return;

  const slider = $(".hero__slider", hero);
  if (slider && typeof Swiper !== "undefined") {
    new Swiper(slider, {
      effect: "fade",
      fadeEffect: { crossFade: true },
      loop: true,
      speed: 800,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: {
        el: $(".hero__pagination", hero),
        clickable: true,
        bulletClass: "hero__bullet",
        bulletActiveClass: "is-active",
      },
    });
  }

  const promo = $(".hero__promo", hero);
  $(".hero__promo-close", hero)?.addEventListener("click", () => { promo.hidden = true; });
};
