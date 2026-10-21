import { $ } from "./helpers.js";

// ======================
// SPA (восходящий пар на canvas)
// ======================
const PERIOD = 18;
const COUNT = 6;
const INTENSITY = 0.65;
const SOFTNESS = 0.75;
const SCALE = 60;
const SWIRL = 0.4;
const COLOR = "239,245,237";
const SPRITE = 192;

const smooth = (a, b, x) => {
  const v = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return v * v * (3 - 2 * v);
};

// один мягкий клуб пара, дальше он только масштабируется
const makeSprite = () => {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = SPRITE;
  const c = sprite.getContext("2d");
  const half = SPRITE / 2;
  const g = c.createRadialGradient(half, half, 0, half, half, half);
  g.addColorStop(0, `rgba(${COLOR},.7)`);
  g.addColorStop(0.12 + (1 - SOFTNESS) * 0.32, `rgba(${COLOR},.43)`);
  g.addColorStop(0.65, `rgba(${COLOR},.12)`);
  g.addColorStop(1, `rgba(${COLOR},0)`);
  c.fillStyle = g;
  c.fillRect(0, 0, SPRITE, SPRITE);
  return sprite;
};

export const initSpa = () => {
  const box = $(".spa__box");
  const canvas = $(".spa__waves");
  if (!box || !canvas) return;

  const ctx = canvas.getContext("2d");
  const sprite = makeSprite();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  // на мобилке пар скрыт (spa.scss) и не рисуется
  const mobile = window.matchMedia("(max-width: 767px)");
  let width = 1, height = 1;
  let phase = 0, previous = null, raf = 0, visible = false;

  const geometry = () => {
    const rect = box.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (!width || !height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2400000 / (width * height)));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const render = () => {
    ctx.clearRect(0, 0, width, height);
    const size = Math.min(width, height) * (0.16 + SCALE * 0.004);
    for (let i = 0; i < COUNT; i++) {
      const p = (phase + i / COUNT) % 1;
      const seed = i * 2.399963;
      const theta = 2 * Math.PI * phase + seed;
      // поток проявляется внизу и растворяется у верхнего края
      const envelope = smooth(0, 0.18, p) * (1 - smooth(0.72, 1, p));
      const x = width * (0.12 + (0.76 * (i + 0.5)) / COUNT) + Math.sin(theta) * size * 0.65 * SWIRL;
      const y = height * 1.22 - p * (height + size * 1.8);
      const rx = size * (0.7 + p * 0.65);
      const ry = size * (1.2 + p * 0.5);

      ctx.globalAlpha = envelope * INTENSITY * 0.18;
      for (let j = 0; j < 5; j++) {
        const a = seed + j * 2.4;
        const spread = size * (0.12 + 0.24 * SWIRL);
        const ox = Math.sin(a + theta) * spread;
        const oy = Math.cos(a - theta) * spread;
        ctx.drawImage(sprite, x + ox - rx, y + oy - ry, rx * 2, ry * 2);
      }
    }
    ctx.globalAlpha = 1;
  };

  // анимация идёт только когда блок на экране
  const paused = () => !visible || document.hidden || reduced.matches || mobile.matches;

  const frame = (now) => {
    raf = 0;
    if (paused()) return;
    if (previous !== null) phase = (phase + Math.min((now - previous) / 1000, 0.1) / PERIOD) % 1;
    previous = now;
    render();
    raf = requestAnimationFrame(frame);
  };

  const sync = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    previous = null;
    if (!paused()) raf = requestAnimationFrame(frame);
  };

  new ResizeObserver(() => {
    if (mobile.matches) return;
    geometry();
    render();
  }).observe(box);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(box);

  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  mobile.addEventListener("change", () => {
    geometry();
    render();
    sync();
  });
};
