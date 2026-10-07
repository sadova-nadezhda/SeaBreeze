import { $, $$ } from "./helpers.js";
import { blurIn, reducedMotion } from "./reveal.js";

// ======================
// Hero (интро + слайдер фона + плашка перехода)
// ======================

const playIntro = (hero) => {
  if (typeof gsap !== "undefined" && !reducedMotion()) {
    const header = $(".header__container");
    const contactBtn = $(".contact-btn");
    const items = [$(".hero__title", hero), ...$$(".hero__info > *", hero), $(".hero__promo", hero)].filter(Boolean);

    const tl = gsap.timeline();
    tl.fromTo($(".hero__slider", hero), { scale: 0.8 }, { scale: 1, duration: 1.4, ease: "power3.inOut", clearProps: "transform" });
    if (header) tl.fromTo(header, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out", clearProps: "opacity" }, "-=0.4");
    tl.add(blurIn(items, { stagger: 0.15 }), "-=0.3");
    if (contactBtn) tl.fromTo(contactBtn, { translate: "100% 0" }, { translate: "0% 0", duration: 0.7, ease: "power3.out", clearProps: "translate" });
  }
  hero.classList.add("is-ready");
};

export const initHero = () => {
  const hero = $(".hero");
  if (!hero) return;

  playIntro(hero);

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
