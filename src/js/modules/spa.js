import { $ } from "./helpers.js";

// ======================
// SPA (восходящий пар на canvas)
// ======================
const PERIOD = 18;
const COUNT = 6;
const INTENSITY = 0.55;
const SOFTNESS = 0.75;
const SCALE = 60;
const SWIRL = 0.4;
const DENSITY = 85; // густота: число клубов в потоке и их плотность, 0..100
const CONTRAST = 0; // тёмная подложка под клубами для светлого фона, 0..100
const PUFFS = 4 + Math.round(DENSITY / 17);
const BODY = 0.65 + (DENSITY / 100) * 0.95;
const CLEAR = 0.6; // насколько пар редеет за текстом в центре, 0..1
// тёплая сероватая дымка вместо чисто белого
const COLOR = "232,224,212";
const SHADOW = "13,37,42";
const SPRITE = 192;

const smooth = (a, b, x) => {
  const v = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return v * v * (3 - 2 * v);
};

// мягкое пятно с радиальным градиентом, дальше оно только масштабируется
const makeSprite = (stops) => {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = SPRITE;
  const c = sprite.getContext("2d");
  const half = SPRITE / 2;
  const g = c.createRadialGradient(half, half, 0, half, half, half);
  stops.forEach(([offset, color]) => g.addColorStop(offset, color));
  c.fillStyle = g;
  c.fillRect(0, 0, SPRITE, SPRITE);
  return sprite;
};

export const initSpa = () => {
  const box = $(".spa__box");
  const canvas = $(".spa__waves");
  if (!box || !canvas) return;

  const ctx = canvas.getContext("2d");
  // клуб пара: плоский профиль без яркого ядра, чтобы читался как дымка, а не вата
  const sprite = makeSprite([
    [0, `rgba(${COLOR},.4)`],
    [0.12 + (1 - SOFTNESS) * 0.32, `rgba(${COLOR},.3)`],
    [0.65, `rgba(${COLOR},.1)`],
    [1, `rgba(${COLOR},0)`],
  ]);
  // маска, которой пар стирается за текстом
  const hole = makeSprite([
    [0, `rgba(0,0,0,${CLEAR})`],
    [0.5, `rgba(0,0,0,${CLEAR * 0.7})`],
    [1, "rgba(0,0,0,0)"],
  ]);
  // тёмная подложка, нужна только при CONTRAST > 0
  const shadow = CONTRAST > 0 && makeSprite([
    [0, `rgba(${SHADOW},.7)`],
    [0.45, `rgba(${SHADOW},.26)`],
    [1, `rgba(${SHADOW},0)`],
  ]);
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

      const opacity = envelope * INTENSITY * 0.18 * BODY;
      for (let j = 0; j < PUFFS; j++) {
        const a = seed + j * 2.4;
        const spread = size * (0.12 + 0.24 * SWIRL);
        const ox = Math.sin(a + theta) * spread;
        const oy = Math.cos(a - theta) * spread;
        if (shadow) {
          ctx.globalAlpha = opacity * (CONTRAST / 100) * 0.75;
          ctx.drawImage(shadow, x + ox - rx + size * 0.035, y + oy - ry + size * 0.045, rx * 2, ry * 2);
        }
        ctx.globalAlpha = opacity;
        ctx.drawImage(sprite, x + ox - rx, y + oy - ry, rx * 2, ry * 2);
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(hole, width * 0.1, height * 0.1, width * 0.8, height * 0.8);
    ctx.globalCompositeOperation = "source-over";
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
