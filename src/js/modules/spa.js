import { $ } from "./helpers.js";

// ======================
// SPA (волны на canvas, расходятся из правого нижнего угла)
// ======================
const PERIOD = 17; // секунд на полный цикл волны
const COUNT = 5;
const INTENSITY = 0.39;
const SOFTNESS = 69;
const COLOR = "198,243,240";

const smooth = (a, b, x) => {
  const v = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return v * v * (3 - 2 * v);
};
// волна проявляется в начале пути и гаснет к концу
const alpha = (p) => smooth(0, 0.16, p) * (1 - smooth(0.7, 1, p)) * INTENSITY;

export const initSpa = () => {
  const box = $(".spa__box");
  const canvas = $(".spa__waves");
  if (!box || !canvas) return;

  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 1, height = 1, cx = 1, cy = 1, start = 1, end = 2;
  let phase = 0, previous = null, raf = 0, visible = false;

  const geometry = () => {
    const rect = box.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (!width || !height) return;
    // центр волн — за правым нижним углом блока
    cx = width * 1.15;
    cy = height * 1.25;
    start = Math.hypot(cx - width, (cy - height) / 0.8) * 0.62;
    end = Math.hypot(cx, cy / 0.8) * 1.12;
    const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2400000 / (width * height)));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const points = (p, i) => {
    const r = start + (end - start) * p;
    const amp = Math.min(width, height) * 0.026;
    const time = phase * Math.PI * 2;
    return Array.from({ length: 45 }, (_, j) => {
      const angle = Math.PI * 0.96 + (j / 44) * Math.PI * 0.6;
      const delta = amp * (Math.sin(angle * 3 + time + i * 0.71) + 0.32 * Math.sin(angle * 5 - time + i * 0.47));
      const rr = r + delta;
      return [cx + Math.cos(angle) * rr, cy + Math.sin(angle) * rr * 0.8];
    });
  };

  const render = () => {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < COUNT; i++) {
      const p = (phase + i / COUNT) % 1;
      const a = alpha(p);
      const pts = points(p, i);

      ctx.beginPath();
      ctx.moveTo(...pts[0]);
      for (let j = 1; j < pts.length - 1; j++) {
        ctx.quadraticCurveTo(...pts[j], (pts[j][0] + pts[j + 1][0]) / 2, (pts[j][1] + pts[j + 1][1]) / 2);
      }
      ctx.lineTo(...pts[pts.length - 1]);

      // вложенные полупрозрачные обводки дают мягкий край
      const band = 28 + SOFTNESS * 1.25;
      for (let pass = 8; pass >= 1; pass--) {
        ctx.lineWidth = (band * pass) / 8;
        ctx.strokeStyle = `rgba(${COLOR},${a * 0.021})`;
        ctx.stroke();
      }
      ctx.lineWidth = 3 + SOFTNESS * 0.05;
      ctx.strokeStyle = `rgba(${COLOR},${a * 0.065})`;
      ctx.stroke();
    }
  };

  // анимация идёт только когда блок на экране, вкладка активна и движение не отключено в системе
  const paused = () => !visible || document.hidden || reduced.matches;

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
    geometry();
    render();
  }).observe(box);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(box);

  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
};
