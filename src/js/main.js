// Точка входа → dist/js/main.js (esbuild, один файл)
import { $, debounce } from "./modules/helpers.js";
import { updateMultiplier } from "./modules/multiplier.js";
import { refreshLayout } from "./modules/layout.js";
import { initLenis } from "./modules/lenis.js";
import { createScrollLock } from "./modules/scroll-lock.js";
import { initMenu } from "./modules/menu.js";
import { initFooter } from "./modules/footer.js";
import { initHero } from "./modules/hero.js";
import { initAbout } from "./modules/about.js";
import { initVip } from "./modules/vip.js";
import { initBanya } from "./modules/banya.js";
import { initSpa } from "./modules/spa.js";
import { initNews } from "./modules/news.js";
import { initDishes } from "./modules/dishes.js";
import { initReviews } from "./modules/reviews.js";
import { initFaq } from "./modules/faq.js";
import { initBathSpace } from "./modules/bath-space.js";
import { initCuisine } from "./modules/cuisine.js";
import { initSchedule } from "./modules/schedule.js";
import { initBookForm } from "./modules/book-form.js";
import { initModals } from "./modules/modals.js";
import { initPhoneMask } from "./modules/phone-mask.js";
import { initReveal } from "./modules/reveal.js";

(() => {
  "use strict";

  const initHeader = () => {
    const header = $(".header");
    if (!header) return;
    const toggle = () => header.classList.toggle("scrolled", window.scrollY > 10);
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });

    // Выбор языка
    const lang = $(".header__lang", header);
    const langBtn = $(".header__lang-btn", header);
    if (!lang || !langBtn) return;
    const setLang = (open) => {
      lang.classList.toggle("open", open);
      langBtn.setAttribute("aria-expanded", String(open));
    };
    langBtn.addEventListener("click", () => setLang(!lang.classList.contains("open")));
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".header__lang")) setLang(false);
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setLang(false);
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    updateMultiplier();
    const lenis = initLenis();
    const scrollLock = createScrollLock(lenis);

    initHeader();
    initFooter();
    initHero();
    initAbout();
    initVip();
    initBanya();
    initSpa();
    initNews();
    initDishes();
    initReviews();
    initFaq();
    initBathSpace();
    initCuisine();
    initSchedule();
    initBookForm();
    initPhoneMask();
    initReveal();
    const menu = initMenu({ scrollLock });
    const modals = initModals({ scrollLock, closeMobileMenu: menu?.close });

    refreshLayout();

    window.addEventListener("resize", debounce(() => {
      updateMultiplier();
      refreshLayout();
    }, 150));
  });
})();
