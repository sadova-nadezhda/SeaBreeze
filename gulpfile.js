import gulp from "gulp";
import fileInclude from "gulp-file-include";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import replace from "gulp-replace";
import sharp from "sharp";
import * as esbuild from "esbuild";
import browserSync from "browser-sync";
import { deleteAsync } from "del";
import ttf2woff from "ttf2woff";
import wawoff2 from "wawoff2";
import { Transform } from "node:stream";
import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";

const { src, dest, watch, series, parallel, lastRun } = gulp;
const sass = gulpSass(dartSass);
const bs = browserSync.create();

let isProd = false;

// ======================
// Настройки
// ======================
const config = {
  webp: { quality: 80, effort: 5 },
  maxImageWidth: 2560, // картинки шире будут уменьшены
};

const paths = {
  dist: "dist",
  html: { pages: "src/pages/*.html", watch: "src/{pages,partials}/**/*.html" },
  scss: { entry: "src/scss/style.scss", watch: "src/scss/**/*.scss", dest: "dist/css" },
  js: { entry: "src/js/main.js", watch: "src/js/**/*.js", dest: "dist/js/main.js" },
  vendor: { src: "src/js/vendor/**/*", dest: "dist/js/vendor" },
  vendorCss: { src: "src/scss/vendor/**/*", dest: "dist/css/vendor" },
  img: { src: "src/img/**/*", dest: "dist/img" },
  fonts: { src: "src/fonts/**/*", dir: "src/fonts", scss: "src/scss/fonts.scss", dest: "dist/fonts" },
  static: { src: "src/static/**/*", dest: "dist" },
};

// img/photo.jpg → img/photo.webp (в html, css, srcset, url())
const IMG_RE = /(img\/[^"'\s(),]+?)\.(jpe?g|png)(?=["'\s),?#]|$)/gi;

// ======================
// Задачи
// ======================
export const clean = () => deleteAsync([paths.dist]);

export const html = () =>
  src(paths.html.pages)
    .pipe(fileInclude({ prefix: "@@", basepath: "src/partials", indent: true }))
    .pipe(replace(IMG_RE, "$1.webp"))
    .pipe(dest(paths.dist))
    .pipe(bs.stream());

export const styles = () =>
  src(paths.scss.entry, { sourcemaps: !isProd })
    .pipe(sass({ style: isProd ? "compressed" : "expanded" }).on("error", sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(replace(IMG_RE, "$1.webp"))
    .pipe(dest(paths.scss.dest, { sourcemaps: isProd ? false : "." }))
    .pipe(bs.stream({ match: "**/*.css" }));

export const scripts = async () => {
  try {
    await esbuild.build({
      entryPoints: [paths.js.entry],
      outfile: paths.js.dest,
      bundle: true,
      format: "iife",
      target: "es2018",
      minify: isProd,
      sourcemap: !isProd,
      logLevel: "warning",
    });
    bs.reload();
  } catch {
    // ошибка уже выведена esbuild, dev-сервер не падает
  }
};

export const vendor = () =>
  src(paths.vendor.src, { encoding: false, allowEmpty: true }).pipe(dest(paths.vendor.dest));

export const vendorCss = () =>
  src(paths.vendorCss.src, { encoding: false, allowEmpty: true })
    .pipe(dest(paths.vendorCss.dest))
    .pipe(bs.stream({ match: "**/*.css" }));

// jpg/png → webp + ресайз; svg, gif и прочее копируются как есть
const toWebp = () =>
  new Transform({
    objectMode: true,
    async transform(file, _, cb) {
      if (file.isNull() || !/\.(jpe?g|png)$/i.test(file.path)) return cb(null, file);
      try {
        let img = sharp(file.contents);
        const { width } = await img.metadata();
        if (width > config.maxImageWidth) img = img.resize({ width: config.maxImageWidth });
        file.contents = await img.webp(config.webp).toBuffer();
        file.extname = ".webp";
        cb(null, file);
      } catch (err) {
        console.error(`[images] ${file.relative}: ${err.message}`);
        cb(null, file);
      }
    },
  });

export const images = () =>
  src(paths.img.src, { encoding: false, since: lastRun(images) })
    .pipe(toWebp())
    .pipe(dest(paths.img.dest))
    .pipe(bs.stream());

// ttf → woff2 + woff; уже готовые woff/woff2 копируются как есть
const toWoff = () =>
  new Transform({
    objectMode: true,
    async transform(file, _, cb) {
      if (file.isNull() || !/\.ttf$/i.test(file.path)) return cb(null, file);
      try {
        const woff = file.clone();
        woff.contents = Buffer.from(ttf2woff(new Uint8Array(file.contents)));
        woff.extname = ".woff";
        this.push(woff);
        file.contents = Buffer.from(await wawoff2.compress(file.contents));
        file.extname = ".woff2";
        cb(null, file);
      } catch (err) {
        console.error(`[fonts] ${file.relative}: ${err.message}`);
        cb();
      }
    },
  });

export const fonts = () =>
  src(paths.fonts.src, { encoding: false, since: lastRun(fonts) })
    .pipe(toWoff())
    .pipe(dest(paths.fonts.dest));

// EuclidFlexSemiBold.ttf → font-family: "EuclidFlex"; font-weight: 600
const FONT_WEIGHTS = {
  thin: 100, hairline: 100, extralight: 200, ultralight: 200, light: 300,
  regular: 400, normal: 400, book: 400, medium: 500, semibold: 600, demibold: 600,
  bold: 700, extrabold: 800, ultrabold: 800, heavy: 800, black: 900,
};
const FONT_NAME_RE = new RegExp(`[-_ ]?(${Object.keys(FONT_WEIGHTS).join("|")})?[-_ ]?(italic)?$`, "i");

// src/scss/fonts.scss собирается по списку файлов в src/fonts
export const fontsStyle = async () => {
  const files = existsSync(paths.fonts.dir) ? await readdir(paths.fonts.dir, { recursive: true }) : [];
  const faces = new Map();
  for (const file of files.map((f) => f.replace(/\\/g, "/")).sort()) {
    const [, name, ext] = file.match(/^(.+)\.(ttf|woff2?)$/i) ?? [];
    if (!name) continue;
    const formats = faces.get(name) ?? faces.set(name, new Set()).get(name);
    (ext.toLowerCase() === "ttf" ? ["woff2", "woff"] : [ext.toLowerCase()]).forEach((f) => formats.add(f));
  }

  let scss = "// Файл генерируется автоматически (gulp fontsStyle) — не редактировать\n";
  for (const [name, formats] of faces) {
    const base = name.split("/").pop();
    const [suffix, weight, italic] = base.match(FONT_NAME_RE);
    const family = base.slice(0, base.length - suffix.length) || base;
    const urls = ["woff2", "woff"]
      .filter((f) => formats.has(f))
      .map((f) => `url("../fonts/${name}.${f}") format("${f}")`);
    scss += `
@font-face {
  font-family: "${family}";
  src: ${urls.join(",\n    ")};
  font-weight: ${FONT_WEIGHTS[weight?.toLowerCase()] ?? 400};
  font-style: ${italic ? "italic" : "normal"};
  font-display: swap;
}
`;
  }

  const current = existsSync(paths.fonts.scss) ? await readFile(paths.fonts.scss, "utf8") : null;
  if (current !== scss) await writeFile(paths.fonts.scss, scss);
};

// favicon, robots.txt и т.п. — в корень dist без обработки
export const statics = () =>
  src(paths.static.src, { encoding: false, dot: true, allowEmpty: true }).pipe(dest(paths.static.dest));

// ======================
// Сервер и вотчеры
// ======================
const serve = (done) => {
  bs.init({ server: paths.dist, notify: false, open: false, port: 3000 });
  done();
};

const watcher = () => {
  watch(paths.html.watch, html);
  watch(paths.scss.watch, { ignored: "src/scss/vendor/**" }, styles);
  watch(paths.vendorCss.src, vendorCss);
  watch(paths.js.watch, { ignored: "src/js/vendor/**" }, scripts);
  watch(paths.vendor.src, vendor);
  watch(paths.img.src, images);
  watch(paths.fonts.src, parallel(fonts, fontsStyle));
  watch(paths.static.src, statics);
};

const setProd = (done) => { isProd = true; done(); };

// fontsStyle — до styles, чтобы fonts.scss был готов к компиляции
const compile = series(fontsStyle, parallel(html, styles, scripts, vendor, vendorCss, images, fonts, statics));

export const build = series(setProd, clean, compile);
export default series(clean, compile, serve, watcher);
