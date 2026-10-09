import { $$ } from "./helpers.js";

// ======================
// Появление элементов при скролле
// ======================
const TYPES = {
  blur: {
    from: { opacity: 0, filter: "blur(12px)", transition: "none" },
    to: { opacity: 1, filter: "blur(0px)", duration: 0.9, ease: "power2.out", clearProps: "opacity,filter,transition" },
    stagger: 0.08,
  },
  clip: {
    from: { clipPath: "inset(50% 0% 50% 0%)" },
    to: { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power3.inOut", clearProps: "clipPath" },
    stagger: 0,
  },
  down: {
    from: { clipPath: "inset(0% 0% 100% 0%)" },
    to: { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power3.inOut", clearProps: "clipPath" },
    stagger: 0.15,
  },
};

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const blurIn = (targets, vars = {}) => gsap.fromTo(targets, TYPES.blur.from, { ...TYPES.blur.to, ...vars });

const reveal = (type) => {
  const { from, to, stagger } = TYPES[type];
  const items = $$(`.reveal-${type}`).filter((el) => !el.closest("[hidden]"));
  if (!items.length) return;

  gsap.set(items, from);
  ScrollTrigger.batch(items, {
    start: "top 90%",
    once: true,
    // fromTo, а не to: браузер сокращает inset(50% 0% 50% 0%) до inset(50% 0%),
    // и gsap, читая старт из стилей, анимирует только верхний край
    onEnter: (batch) => gsap.fromTo(batch, from, { ...to, stagger: Math.min(stagger, 0.8 / batch.length) }),
  });
};

export const initReveal = () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || reducedMotion()) return;
  gsap.registerPlugin(ScrollTrigger);

  Object.keys(TYPES).forEach(reveal);
};
