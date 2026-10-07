import { $ } from "./helpers.js";

// ======================
// Schedule (секция закрепляется, расписание прокручивается внутри неё)
// ======================
export const initSchedule = () => {
  const section = $(".schedule");
  if (!section || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const win = $(".schedule__window", section);
  const card = $(".schedule__card", section);
  if (!win || !card) return;

  gsap.registerPlugin(ScrollTrigger);

  // дальше карточку двигает скролл страницы — внутренний скролл окна отключаем
  section.classList.add("is-pinned");
  win.removeAttribute("data-lenis-prevent");

  const header = $(".header");
  const headerHeight = () => (header ? header.offsetHeight : 0);
  // на сколько карточка (с отступами окна) выше самого окна
  const distance = () => {
    const style = getComputedStyle(win);
    const content = card.offsetHeight + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    return Math.max(0, content - win.clientHeight);
  };

  gsap.to(card, {
    y: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: () => `top ${headerHeight()}px`,
      end: () => `+=${distance()}`,
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
};
