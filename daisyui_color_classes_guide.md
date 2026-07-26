У daisyUI важливо розрізняти:

1. **семантичні назви кольорів** — `primary`, `base-100`, `success`;
2. **Tailwind utility-класи** — `bg-primary`, `text-base-content`, `border-error`;
3. **кольорові модифікатори компонентів** — `btn-primary`, `badge-success`, `alert-warning`.

daisyUI використовує семантичні токени через CSS-змінні, тому один і той самий клас автоматично отримує інший фактичний колір при зміні теми. ([daisyui.com](https://daisyui.com/docs/colors/))

# 1. Повний список кольорових токенів daisyUI

Усього базова кольорова система містить **20 назв**.

## Кольори бренду

### `primary`

Головний колір бренду та найважливіших дій.

```html
<button class="btn btn-primary">
  Створити вішліст
</button>
```

Використовуйте для:

- головної CTA-кнопки;
- підтвердження основної дії;
- активного стану важливого елемента;
- основного акценту бренду;
- посилань, які мають привертати увагу.

Для PurrList це може бути лавандовий або пастельно-фіолетовий.

Не використовуйте `primary` для кожної кнопки на сторінці — інакше основна дія перестане виділятися.

```html
<div class="bg-primary text-primary-content">
  Основний брендований блок
</div>
```

### `primary-content`

Колір тексту та іконок, які знаходяться **на фоні `primary`**.

```html
<button class="bg-primary text-primary-content">
  Створити
</button>
```

Не варто використовувати його як звичайний колір тексту сторінки:

```html
<!-- Невдалий варіант -->
<p class="text-primary-content">
  Опис сторінки
</p>
```

`primary-content` підібраний саме для контрасту з `primary`, а не з `base-100`. ([daisyui.com](https://daisyui.com/docs/colors/))

---

### `secondary`

Другий колір бренду. Він повинен підтримувати `primary`, але не конкурувати з ним.

```html
<button class="btn btn-secondary">
  Переглянути приклад
</button>
```

Для PurrList його можна використовувати для:

- другорядних CTA;
- декоративних event-блоків;
- кнопки «Поділитися»;
- окремих акцентних карток;
- менш важливих позитивних дій.

Наприклад, `primary` може бути лавандовим, а `secondary` — пастельно-рожевим або персиковим.

### `secondary-content`

Текст та іконки поверх `secondary`.

```html
<div class="bg-secondary text-secondary-content">
  День народження вже скоро
</div>
```

---

### `accent`

Додатковий акцентний колір.

На відміну від `primary`, він не повинен використовуватися для головної дії всього продукту. Це колір невеликих деталей, вибраних елементів і візуальних акцентів.

```html
<span class="badge badge-accent">
  Новий
</span>
```

Для PurrList підійде для:

- тегів подарунка;
- декоративних chips;
- невеликих інтерактивних деталей;
- вибраного filter chip;
- котячих декоративних елементів;
- secondary highlight.

Наприклад, `accent` може бути м’ятним.

### `accent-content`

Контент поверх `accent`.

```html
<span class="bg-accent text-accent-content">
  Розмір S
</span>
```

---

### `neutral`

Нейтральний, зазвичай темний або малонасичений колір.

```html
<button class="btn btn-neutral">
  Закрити
</button>
```

Підходить для:

- темних кнопок;
- footer;
- контрастного navbar;
- нейтральних активних елементів;
- частин інтерфейсу, які не мають конкретного емоційного значення.

Для світлого PurrList я б використовував `neutral` обмежено — наприклад, для текстово-контрастної кнопки або footer.

Не потрібно використовувати `neutral` замість звичайного тексту. Для основного тексту існує `base-content`.

### `neutral-content`

Текст та іконки поверх `neutral`.

```html
<footer class="bg-neutral text-neutral-content">
  PurrList
</footer>
```

Офіційно `primary`, `secondary`, `accent` є брендованими кольорами, а `neutral` призначений для ненасичених частин UI. Кожен із них має відповідний `*-content` токен для foreground-контенту. ([daisyui.com](https://daisyui.com/docs/colors/))

# 2. Базові кольори поверхонь

Ці кольори формують основну структуру сторінки.

## `base-100`

Основна поверхня сторінки.

```html
<body class="bg-base-100 text-base-content">
```

Використовуйте для:

- основного фону сторінки;
- карток на трохи темнішому фоні;
- modal;
- dropdown;
- основної чистої поверхні.

У світлій темі це зазвичай найбіліший або найсвітліший колір.

Для PurrList:

```text
base-100 → білий або дуже світлий кремовий
```

---

## `base-200`

Трохи темніший базовий фон, який створює відділення поверхонь.

```html
<main class="min-h-screen bg-base-200">
  <article class="card bg-base-100">
    ...
  </article>
</main>
```

Використовуйте для:

- загального фону сторінки;
- секцій;
- вторинних поверхонь;
- фону навколо білих карток;
- легкого візуального elevation без тіні.

Для вашого сайту хороший базовий патерн:

```html
<body class="bg-base-200 text-base-content">
  <main class="bg-base-100">
    ...
  </main>
</body>
```

---

## `base-300`

Ще темніший базовий відтінок.

```html
<div class="border border-base-300">
```

Найчастіше підходить для:

- border;
- divider;
- input border;
- skeleton;
- disabled backgrounds;
- hover-фону;
- візуального розмежування блоків.

```html
<div class="divider before:bg-base-300 after:bg-base-300">
  або
</div>
```

У більшості випадків `base-300` не повинен бути основним великим фоном.

---

## `base-content`

Основний колір тексту та іконок на базових поверхнях.

```html
<h1 class="text-base-content">
  Створіть свій вішліст
</h1>
```

Використовуйте для:

- заголовків;
- основного тексту;
- іконок;
- labels;
- тексту у формах.

Для другорядного тексту не потрібен окремий сірий токен. daisyUI рекомендує використовувати opacity:

```html
<p class="text-base-content/70">
  Короткий опис функціоналу
</p>

<span class="text-base-content/50">
  Необов’язкове поле
</span>
```

`base-content` автоматично стає темним у світлій темі та світлим у темній. Для muted-тексту daisyUI рекомендує модифікатори прозорості на кшталт `/70`, `/50` або `/30`. ([daisyui.com](https://daisyui.com/docs/colors/))

# 3. Семантичні кольори станів

## `info`

Інформаційний стан. Це не успіх і не помилка — просто корисне повідомлення.

```html
<div class="alert alert-info">
  Ваш номер телефону не буде показаний публічно.
</div>
```

Використовуйте для:

- пояснень;
- інструкцій;
- privacy notes;
- інформації про процес;
- статусу «Ви обрали цей подарунок»;
- повідомлень без ризику або помилки.

Для PurrList `info` може бути baby blue.

### `info-content`

Текст на фоні `info`.

```html
<div class="bg-info text-info-content">
  Посилання скопійовано
</div>
```

Компонент `alert-info` сам підбирає потрібний foreground, тому вручну `text-info-content` зазвичай не потрібен.

---

## `success`

Успішна, безпечна або завершена дія.

```html
<div class="alert alert-success">
  Подарунок успішно заброньовано.
</div>
```

Використовуйте для:

- успішного створення;
- успішного збереження;
- доступного подарунка;
- підтвердження бронювання;
- завершеної операції;
- стану «Available».

Для PurrList `success` може бути м’яким м’ятно-зеленим.

### `success-content`

Текст та іконки поверх `success`.

```html
<span class="bg-success text-success-content">
  Доступний
</span>
```

---

## `warning`

Стан, що потребує уваги, але не обов’язково є помилкою.

```html
<div class="alert alert-warning">
  Подію заплановано вже на завтра.
</div>
```

Використовуйте для:

- попередження перед дією;
- подарунка, який уже обраний кимось іншим;
- незбережених змін;
- неповних даних;
- наближення дедлайну;
- потенційно ризикованої, але не руйнівної дії.

Для PurrList це може бути пастельно-жовтий.

Не використовуйте `warning` для звичайних декоративних жовтих елементів. Семантичний колір повинен зберігати своє значення.

### `warning-content`

Контент на фоні `warning`.

```html
<span class="bg-warning text-warning-content">
  Уже обрано
</span>
```

---

## `error`

Помилка, небезпека або destructive action.

```html
<div class="alert alert-error">
  Не вдалося забронювати подарунок.
</div>
```

Використовуйте для:

- validation errors;
- невдалого запиту;
- видалення;
- конфлікту бронювання;
- недоступного ресурсу;
- критичного повідомлення.

```html
<button class="btn btn-error">
  Видалити вішліст
</button>
```

Не використовуйте `error` для кнопки «Скасувати». Cancel — це нейтральна дія:

```html
<button class="btn btn-ghost">
  Скасувати
</button>

<button class="btn btn-error">
  Видалити
</button>
```

### `error-content`

Контент поверх `error`.

```html
<p class="bg-error text-error-content">
  Сталася помилка
</p>
```

`info`, `success`, `warning` та `error` є семантичними кольорами станів, і кожен має відповідний `*-content` токен для контенту на кольоровому фоні. ([daisyui.com](https://daisyui.com/docs/colors/))

# 4. Повна шпаргалка токенів

| Токен | Основне призначення |
|---|---|
| `primary` | Головна дія і головний колір бренду |
| `primary-content` | Контент поверх `primary` |
| `secondary` | Другий колір бренду, другорядні CTA |
| `secondary-content` | Контент поверх `secondary` |
| `accent` | Невеликі акценти, tags, selected state |
| `accent-content` | Контент поверх `accent` |
| `neutral` | Нейтральна темна або ненасичена поверхня |
| `neutral-content` | Контент поверх `neutral` |
| `base-100` | Основна поверхня, card, modal |
| `base-200` | Фон сторінки або секції |
| `base-300` | Border, divider, disabled surface |
| `base-content` | Основний текст та іконки |
| `info` | Інформаційне повідомлення |
| `info-content` | Контент поверх `info` |
| `success` | Успіх, безпечний або доступний стан |
| `success-content` | Контент поверх `success` |
| `warning` | Попередження або стан, що потребує уваги |
| `warning-content` | Контент поверх `warning` |
| `error` | Помилка, небезпека, видалення |
| `error-content` | Контент поверх `error` |

Це повний набір офіційних семантичних кольорових назв daisyUI. ([daisyui.com](https://daisyui.com/docs/colors/))

# 5. Усі utility-префікси

Кожен із наведених вище кольорів можна використовувати з Tailwind color utilities.

## Фон

```html
bg-primary
bg-secondary
bg-accent
bg-neutral
bg-base-100
bg-base-200
bg-base-300
bg-info
bg-success
bg-warning
bg-error
```

## Текст

```html
text-primary
text-primary-content
text-base-content
text-success
text-error
```

## Рамка

```html
border-primary
border-base-300
border-error
```

## Focus ring

```html
ring-primary
ring-error
ring-offset-base-100
```

## Gradient

```html
from-primary
via-secondary
to-accent
```

Для вашого дизайну я б не зловживав gradient-класами, оскільки ви орієнтуєтеся на чисті пастельні заливки.

## SVG

```html
fill-primary
stroke-primary
```

## Тіні

```html
shadow-primary
shadow-error
```

Зазвичай краще використовувати кольорові тіні дуже обмежено.

## Інші доступні utility-класи

```html
outline-primary
divide-base-300
accent-primary
caret-primary
decoration-primary
placeholder-base-content
ring-offset-base-100
```

Повний офіційний список шаблонів:

```text
bg-{COLOR}
text-{COLOR}
border-{COLOR}
from-{COLOR}
via-{COLOR}
to-{COLOR}
ring-{COLOR}
fill-{COLOR}
stroke-{COLOR}
shadow-{COLOR}
outline-{COLOR}
divide-{COLOR}
accent-{COLOR}
caret-{COLOR}
decoration-{COLOR}
placeholder-{COLOR}
ring-offset-{COLOR}
```

Усі семантичні назви daisyUI можна підставляти в ці Tailwind utility-класи. ([daisyui.com](https://daisyui.com/docs/colors/))

# 6. Прозорість кольорів

Будь-який токен можна використовувати з opacity modifier:

```html
bg-primary/10
bg-primary/20
text-base-content/70
border-primary/30
text-error/80
```

Практичні значення:

```text
/100 — повний колір
/80  — трохи приглушений
/70  — secondary text
/50  — muted text або border
/20  — м’який tinted background
/10  — дуже легкий акцентний фон
```

Приклад м’якого badge:

```html
<span class="rounded-full bg-success/15 px-3 py-1 text-success">
  Доступний
</span>
```

Приклад інформаційного callout:

```html
<div class="border border-info/30 bg-info/10 text-base-content">
  Номер телефону потрібен для збереження бронювання.
</div>
```

При використанні daisyUI як Tailwind-плагіна opacity може задаватися значенням від 0 до 100; офіційна документація також рекомендує opacity для muted-тексту. ([daisyui.com](https://daisyui.com/docs/colors/))

# 7. Component modifier-класи

Коли компонент має готовий кольоровий modifier, краще використовувати його замість ручної комбінації кольорів.

```html
<button class="btn btn-primary">Створити</button>
```

замість:

```html
<button class="btn bg-primary text-primary-content border-primary">
  Створити
</button>
```

`btn-primary` сам задає background, border і правильний `primary-content` для тексту. Підтримка конкретних modifier-класів залежить від компонента. ([daisyui.com](https://daisyui.com/docs/colors/))

Найпоширеніші патерни:

```html
btn-primary
btn-secondary
btn-accent
btn-neutral
btn-info
btn-success
btn-warning
btn-error
```

```html
badge-primary
badge-secondary
badge-accent
badge-neutral
badge-info
badge-success
badge-warning
badge-error
```

```html
alert-info
alert-success
alert-warning
alert-error
```

```html
input-primary
input-secondary
input-accent
input-info
input-success
input-warning
input-error
```

```html
checkbox-primary
radio-primary
toggle-primary
range-primary
progress-primary
```

Наприклад:

```html
<input
  class="input input-error"
  type="text"
  aria-invalid="true"
/>

<p class="mt-1 text-sm text-error">
  Вкажіть назву подарунка
</p>
```

# 8. Рекомендована схема для PurrList

Я б закріпив ролі так:

```text
primary       → lavender / soft purple
secondary     → blush pink або peach
accent        → mint
neutral       → warm dark gray
base-100      → white / warm cream
base-200      → light cream page background
base-300      → soft gray-lavender border
base-content  → dark warm violet-gray

info          → baby blue
success       → pastel mint-green
warning       → soft yellow
error         → soft coral-red
```

Практичне використання:

| Елемент PurrList | Колір |
|---|---|
| «Створити вішліст» | `primary` |
| «Поділитися» | `secondary` або `btn-outline` |
| Теги подарунка | `accent` |
| Загальний фон | `base-200` |
| Картки та modal | `base-100` |
| Рамки | `base-300` |
| Основний текст | `base-content` |
| Muted текст | `base-content/60` |
| «Ви обрали цей подарунок» | `info` |
| «Доступний» | `success` |
| «Уже обрано» | `warning` |
| Видалення і validation error | `error` |

# 9. Приклад правильної картки подарунка

```html
<article class="card border border-base-300 bg-base-100 shadow-sm">
  <figure class="bg-base-200">
    <img
      src="/images/headphones.jpg"
      alt="Навушники Sony"
    />
  </figure>

  <div class="card-body">
    <div class="flex items-start justify-between gap-3">
      <h2 class="card-title text-base-content">
        Sony WH-1000XM5
      </h2>

      <span class="badge badge-success">
        Доступний
      </span>
    </div>

    <p class="text-base-content/65">
      Бажано у чорному кольорі
    </p>

    <div class="flex flex-wrap gap-2">
      <span class="badge badge-accent badge-soft">
        Black
      </span>

      <span class="badge badge-secondary badge-soft">
        Over-ear
      </span>
    </div>

    <div class="card-actions mt-3">
      <a class="btn btn-ghost">
        Переглянути
      </a>

      <button class="btn btn-primary">
        Обрати подарунок
      </button>
    </div>
  </div>
</article>
```

## Головне правило

Не думайте:

```text
primary = фіолетовий
success = зелений
error = червоний
```

Думайте:

```text
primary = головна дія
success = успішний або безпечний стан
error = помилка або небезпечна дія
base-200 = фон нижнього рівня
base-100 = поверхня над ним
```

Фактичні відтінки визначає активна daisyUI-тема, а семантичне значення класів залишається незмінним. ([daisyui.com](https://daisyui.com/docs/colors/))
