import { $$ } from "./helpers.js";

// ======================
// Phone mask
// ======================
export const initPhoneMask = () => {
  // телефоны + любые поля с data-mask (например, дата "__.__.____")
  const inputs = $$('input[type="tel"], input[data-mask]');
  if (!inputs.length) return;

  const format = (value, matrix) => {
    const prefix = matrix.replace(/\D/g, "");
    const slots = (matrix.match(/[_\d]/g) || []).length;
    const free = slots - prefix.length;
    const head = matrix.slice(0, matrix.indexOf("_"));

    let body = value.startsWith(head)
      ? value.slice(head.length).replace(/\D/g, "")
      : value.replace(/\D/g, "");

    if (prefix === "7" && body.startsWith("8")) {
      body = body.slice(1);
    } else if (body.length > free && body.startsWith(prefix)) {
      body = body.slice(prefix.length);
    }

    body = body.slice(0, free);
    if (!body) return "";

    const digits = prefix + body;
    let res = "";
    let i = 0;
    for (const ch of matrix) {
      if (/[_\d]/.test(ch)) {
        if (i >= digits.length) break;
        res += digits[i++];
      } else {
        res += ch;
      }
    }
    return res.replace(/\D+$/, "");
  };

  inputs.forEach((input) => {
    const matrix = input.dataset.mask || "+7 (___) ___ ____";
    const prefix = matrix.replace(/\D/g, "");

    input.addEventListener("input", (e) => {
      const entered = input.value.replace(/\D/g, "");
      if (e.inputType?.startsWith("delete") && entered.length <= prefix.length) {
        input.value = "";
        return;
      }
      input.value = format(input.value, matrix);
    });
  });
};
