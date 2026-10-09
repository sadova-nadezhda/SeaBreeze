import { $, $$ } from "./helpers.js";
import { s } from "./multiplier.js";

// ======================
// Book form (онлайн-бронирование: день, время, билеты, заказ)
// ======================
const format = (n) => n.toLocaleString("ru-RU");

// 1 час, 3 часа, 5 часов
const pluralHours = (n) => {
  const word = n % 10 === 1 && n % 100 !== 11 ? "час" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "часа" : "часов";
  return `${n} ${word}`;
};

const initPicker = (picker) => {
  const slider = $(".book-form__slider", picker);
  if (!slider || typeof Swiper === "undefined") return;

  new Swiper(slider, {
    slidesPerView: "auto",
    slidesPerGroupAuto: true,
    spaceBetween: s(8),
    speed: 500,
    navigation: {
      prevEl: $(".book-form__arrow--prev", picker),
      nextEl: $(".book-form__arrow--next", picker),
    },
  });
};

export const initBookForm = () => {
  const form = $(".book-form");
  if (!form) return;

  $$(".book-form__picker", form).forEach(initPicker);

  const setText = (key, text, root = form) => $$(`[data-book="${key}"]`, root).forEach((el) => (el.textContent = text));

  const select = (items, active) => items.forEach((el) => {
    el.classList.toggle("is-active", el === active);
    el.setAttribute("aria-pressed", String(el === active));
  });

  // День посещения
  const days = $$(".book-form__day", form);
  const dateInput = $('input[name="date"]', form);
  const setDay = (day) => {
    const { date, label, short, gender } = day.dataset;
    select(days, day);
    if (gender) form.dataset.gender = gender;
    if (dateInput) dateInput.value = date;
    setText("label", label);
    setText("short", short);
    $$('[data-book="gender"]', form).forEach((el) => {
      el.textContent = el.dataset[gender];
      if (el.hasAttribute("data-gender")) el.dataset.gender = gender;
    });
  };
  days.forEach((day) => day.addEventListener("click", () => setDay(day)));

  // Кабинеты (VIP): у выбранного берём цену и длительность аренды
  const rooms = $$(".book-form__room-input", form);
  const getRoom = () => rooms.find((room) => room.checked);

  // Время посещения
  const times = $$(".book-form__time", form);
  const timeInput = $('input[name="time"]', form);
  const showTime = () => {
    const value = timeInput ? timeInput.value : "";
    const hours = Number(getRoom()?.dataset.hours) || 0;
    if (!hours) return setText("time", value);

    const [h, m] = value.split(":");
    const end = `${String((Number(h) + hours) % 24).padStart(2, "0")}:${m}`;
    setText("time", `${value} - ${end} (${pluralHours(hours)})`);
  };
  const setTime = (time) => {
    const value = time.textContent.trim();
    select(times, time);
    if (timeInput) timeInput.value = value;
    showTime();
  };
  times.forEach((time) => time.addEventListener("click", () => setTime(time)));

  // Билеты и итог
  const tickets = $$(".book-form__ticket", form);
  const pay = $(".book-form__pay", form);
  const depositRow = $("[data-deposit]", form);
  const discountRow = $("[data-discount]", form);
  const getQty = (name) => Number($(`[data-ticket="${name}"] .book-form__counter-input`, form)?.value) || 0;
  const update = () => {
    let total = 0;

    const room = getRoom();
    if (room) {
      const { name, guests, price, hours } = room.dataset;
      const rent = Number(price) || 0;
      const discount = Math.round((rent * (Number(discountRow?.dataset.discount) || 0)) / 100);
      const deposit = Math.round((rent * (Number(depositRow?.dataset.deposit) || 0)) / 100);
      total += rent + deposit - discount;

      setText("room", name);
      setText("guests", guests);
      setText("hours", pluralHours(Number(hours) || 0));
      setText("rent", format(rent));
      setText("deposit", format(deposit));
      setText("discount", format(discount));
      showTime();

      const img = $(".book-form__room-img", room.closest(".book-form__room"));
      const orderImg = $('[data-book="img"]', form);
      if (img && orderImg) orderImg.src = img.src;
    }

    tickets.forEach((ticket) => {
      const input = $(".book-form__counter-input", ticket);
      const min = Number(ticket.dataset.min) || 0;
      const max = Number(ticket.dataset.max) || Infinity;
      // Детский билет нельзя купить без взрослого: без него счётчик обнуляется и блокируется
      const locked = ticket.dataset.requires ? !getQty(ticket.dataset.requires) : false;
      if (locked) input.value = 0;
      const qty = Number(input.value) || 0;
      const sum = qty * Number(ticket.dataset.price);
      total += sum;

      $('[data-step="-1"]', ticket).disabled = qty <= min;
      $('[data-step="1"]', ticket).disabled = locked || qty >= max;
      setText("sum", format(sum), ticket);

      const line = $(`[data-line="${ticket.dataset.ticket}"]`, form);
      if (!line) return;
      line.hidden = qty === 0;
      setText("sum", format(sum), line);
      const count = $('[data-book="qty"]', line);
      if (count) {
        count.hidden = qty < 2;
        count.textContent = `× ${qty}`;
      }
    });

    setText("total", format(total));
    if (pay) pay.disabled = total === 0;
  };

  tickets.forEach((ticket) => {
    const input = $(".book-form__counter-input", ticket);
    const min = Number(ticket.dataset.min) || 0;
    const max = Number(ticket.dataset.max) || Infinity;

    $$(".book-form__counter-btn", ticket).forEach((btn) => btn.addEventListener("click", () => {
      const next = (Number(input.value) || 0) + Number(btn.dataset.step);
      input.value = Math.min(max, Math.max(min, next));
      update();
    }));
  });

  rooms.forEach((room) => room.addEventListener("change", update));

  const activeDay = days.find((day) => day.classList.contains("is-active"));
  const activeTime = times.find((time) => time.classList.contains("is-active"));
  if (activeDay) setDay(activeDay);
  if (activeTime) setTime(activeTime);
  update();
};
