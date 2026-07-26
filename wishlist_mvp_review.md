Загалом план виглядає **сильним для швидкого MVP — приблизно 8/10**. Є чітка продуктова цінність, невелика кількість маршрутів, зрозумілий mobile-first підхід і реалістичний стек: Angular + daisyUI + Supabase.

Основні ризики зараз не у верстці, а в деталях навігації, авторизації та конкурентного бронювання подарунків.

## Що вже добре

### 1. Лише два основні маршрути

```text
/
/wishlists/:id
```

Це вдале обмеження для MVP:

- простіше роутинг;
- простіше пояснити продукт;
- немає зайвого dashboard;
- публічне посилання веде одразу на потрібний wishlist;
- усі другорядні операції залишаються в контексті поточного екрана.

### 2. URL-driven модальні вікна

Підхід на кшталт:

```text
/?action=auth
/?action=create-wishlist

/wishlists/:id?action=reserve-gift&giftId=:giftId
/wishlists/:id?action=edit-gift&giftId=:giftId
```

має важливі переваги:

- браузерна кнопка Back закриває модалку;
- після оновлення сторінки стан не губиться;
- можна поширити посилання на конкретну дію;
- простіше відновити сценарій після авторизації.

Це значно краще, ніж тримати всі модалки тільки в локальних signal-полях.

### 3. Чітко відокремлено бронювання від накопичення грошей

Це важливо для продукту. Основна дія:

```text
Забронювати подарунок
```

а не:

```text
Додати внесок
```

Так продукт залишається простим і не потребує платіжної інфраструктури.

### 4. Відповідний дизайн-стек

daisyUI добре підходить для такого MVP, але я б використовував його як **visual layer**, а не як основу всієї поведінки компонентів.

Наприклад:

- daisyUI — стилі кнопок, форм, карток;
- Angular CDK Dialog/Overlay — поведінка модалок;
- Angular Router — modal state через query params;
- Angular forms — валідація;
- Supabase SDK — дані та авторизація.

---

# Що варто покращити

## 1. Чітко назвати сутності

Зараз у контексті трохи змішуються:

- подія;
- wishlist;
- подарунок.

Для MVP можна домовитися, що **wishlist одночасно є подією**.

Тобто таблиця `wishlists` містить:

```text
title
description
event_date
event_time
location
cover_image
owner_id
```

Не обов’язково створювати окрему сутність `events`, якщо кожен wishlist належить лише одній події.

Структура:

```text
User
  └── Wishlist / Event
        └── Gifts
              └── Reservation
```

У UI краще використовувати такі формулювання:

```text
Створити вішліст
Редагувати подію
Додати подарунок
Забронювати подарунок
```

У коді бажано обрати один основний термін. Наприклад:

```typescript
Wishlist
Gift
GiftReservation
```

Не змішувати `wishlist`, `event`, `wish`, `item` для однієї сутності.

---

## 2. Не використовувати один action для create/edit

Не рекомендую формат:

```text
?action=create/edit-wishlist
```

Краще кожна дія має окреме значення:

```text
?action=create-wishlist
?action=edit-wishlist
?action=delete-wishlist

?action=add-gift
?action=edit-gift
?action=delete-gift

?action=reserve-gift
?action=cancel-reservation
```

Це спрощує:

- типізацію;
- аналітику;
- guards;
- відкриття модалок;
- перевірку параметрів;
- підтримку browser history.

На фронтенді можна мати тип:

```typescript
export type ModalAction =
  | 'auth'
  | 'create-wishlist'
  | 'edit-wishlist'
  | 'delete-wishlist'
  | 'add-gift'
  | 'edit-gift'
  | 'delete-gift'
  | 'reserve-gift'
  | 'cancel-reservation'
  | 'my-profile'
  | 'my-wishlists'
  | 'my-gifts';
```

---

## 3. Централізувати modal routing

Не варто в кожному компоненті окремо читати:

```typescript
route.queryParams
```

Краще створити один сервіс, наприклад:

```text
ModalRouterService
```

Він має відповідати за:

- читання `action`;
- перевірку потрібних параметрів;
- відкриття відповідного dialog;
- закриття modal;
- видалення query params;
- відновлення pending action після авторизації.

Приклад API:

```typescript
modalRouter.open('reserve-gift', {
  giftId,
});

modalRouter.close();
```

Усередині сервіс уже викликає Angular Router:

```typescript
this.router.navigate([], {
  queryParams: {
    action: 'reserve-gift',
    giftId,
  },
  queryParamsHandling: 'merge',
});
```

Це не дасть modal-driven логіці розповзтися по всьому застосунку.

---

## 4. Продумати поведінку кнопки Back

Є два різні сценарії.

### Модалка була відкрита зі сторінки

```text
/wishlists/abc
→ /wishlists/abc?action=reserve-gift
```

Тоді при закритті можна викликати:

```typescript
location.back();
```

### Користувач одразу відкрив URL модалки

```text
/wishlists/abc?action=reserve-gift&giftId=123
```

У browser history може не бути базової сторінки. Тоді `back()` може вивести користувача із сайту.

Потрібна fallback-логіка:

```text
Якщо modal відкритий внутрішньою навігацією:
    history.back()

Якщо modal URL відкритий напряму:
    перейти на /wishlists/abc без query params
```

---

## 5. Не відкривати modal поверх modal

Потенційно може з’явитися така послідовність:

```text
My wishlists modal
  → Edit wishlist modal
    → Delete wishlist confirmation
```

Три накладені модальні вікна дадуть поганий mobile UX.

Краще мати **один modal outlet** і замінювати його контент:

```text
?action=my-wishlists
→ ?action=edit-wishlist&id=123
→ ?action=delete-wishlist&id=123
```

Попередній modal закривається або замінюється, а не залишається під новим.

Для великих областей на кшталт `My wishlists` краще використовувати:

- full-screen dialog на мобільному;
- drawer або large dialog на desktop.

Формально це все ще overlay, а не окрема сторінка.

---

## 6. Авторизація повинна зберігати початкову дію

Сценарій:

```text
Гість натискає “Забронювати подарунок”
→ потрібна авторизація
→ OTP
→ потрібно повернути користувача до бронювання
```

Рекомендований URL:

```text
/wishlists/abc
?action=auth
&next=reserve-gift
&giftId=gift-123
```

Після успішної авторизації:

```text
/wishlists/abc
?action=reserve-gift
&giftId=gift-123
```

Не варто зберігати pending action лише в пам’яті сервісу, бо після reload вона зникне.

Також потрібно обробити:

- користувач закрив auth;
- OTP протермінований;
- gift уже забронювали під час авторизації;
- користувач відкрив URL без `giftId`;
- користувач уже авторизований.

---

## 7. Phone OTP має приховану складність

Авторизація за номером телефону виглядає просто, але для MVP потребує:

- SMS-провайдера;
- вартості кожного повідомлення;
- обмеження повторних відправлень;
- cooldown для resend;
- захисту від SMS abuse;
- CAPTCHA або іншого anti-bot механізму;
- нормалізації номера;
- обробки різних країн.

Обов’язково передбачити:

```text
не більше N OTP-запитів за певний період;
таймер повторної відправки;
ліміт спроб введення коду;
блокування підозрілих запитів;
```

Для UI:

```text
Надіслати код повторно через 00:25
```

Для першої локальної версії можна мати development OTP flow без реального SMS, але production-процес потрібно перевірити до запуску.

---

# Архітектура даних

Для Supabase я б рекомендував таку мінімальну модель.

## `profiles`

```text
id
display_name
avatar_url
created_at
```

`id` відповідає користувачу Supabase Auth.

Не зберігати номер телефону в публічно доступній таблиці без потреби.

## `wishlists`

```text
id
owner_id
title
description
event_date
event_time
location
cover_image_url
public_slug
created_at
updated_at
```

## `gifts`

```text
id
wishlist_id
title
description
image_url
product_url
tags
sort_order
created_at
updated_at
```

Для MVP `tags` можна зберігати як:

```text
text[]
```

Не потрібно одразу створювати окремі таблиці тегів.

## `gift_reservations`

```text
id
gift_id
reserved_by
created_at
cancelled_at
```

Краще окрема таблиця, а не просто:

```text
gifts.reserved_by
```

Це дає:

- історію бронювань;
- простіше скасування;
- можливість аудиту;
- менше змішування gift і reservation;
- майбутню підтримку повторних бронювань.

---

# Найкритичніша технічна частина — атомарне бронювання

Не можна реалізовувати бронювання так:

```typescript
const gift = await loadGift();

if (!gift.reserved) {
  await reserveGift();
}
```

Два користувачі можуть одночасно побачити `available` і обидва забронювати подарунок.

Потрібна database function / RPC:

```text
reserve_gift(gift_id)
```

Вона має виконувати все атомарно:

```text
1. Перевірити, що gift існує.
2. Перевірити доступ до wishlist.
3. Перевірити, що немає активної reservation.
4. Створити reservation.
5. Повернути результат.
```

На рівні БД потрібне унікальне обмеження для активного бронювання.

Концептуально:

```sql
UNIQUE gift_id
WHERE cancelled_at IS NULL
```

Це важливіше за будь-яку перевірку на фронтенді.

Фронтенд також повинен показати conflict state:

```text
Цей подарунок щойно забронювали

Хтось встиг обрати його раніше.
Оберіть інший доступний подарунок.
```

---

# Публічність wishlist

Потрібно визначити, що саме означає «публічний».

Я б для MVP обрав модель **unlisted**:

- wishlist не з’являється в каталозі;
- його бачать ті, хто має посилання;
- URL важко вгадати.

Не варто використовувати лише:

```text
/wishlists/vlads-birthday
```

Такий slug можна перебрати.

Краще:

```text
/wishlists/vlads-birthday-k7m4p2
```

або випадковий public ID:

```text
/wishlists/6ecb8e7a
```

У базі можна окремо зберігати:

```text
id          — внутрішній UUID
public_slug — значення для публічного URL
```

---

# RLS і приватність

RLS потрібно спроєктувати відразу, а не після готового UI.

Правила приблизно такі:

### Anonymous

Може:

- читати wishlist за public identifier;
- читати gifts;
- не може створювати reservation.

### Authenticated guest

Може:

- читати wishlist;
- читати gifts;
- створити reservation через RPC;
- скасувати лише власну reservation;
- переглядати власні reservation.

### Owner

Може:

- редагувати власний wishlist;
- додавати, редагувати й видаляти gifts;
- бачити статус бронювання.

Якщо власник не повинен бачити особу гостя, це необхідно приховати **на рівні API/RLS/view**, а не лише не показувати у верстці.

Інакше власник зможе відкрити Network і побачити:

```text
reserved_by
```

---

# Потрібно визначити суперечливі сценарії

До початку розробки рекомендую письмово зафіксувати відповіді.

## Що відбувається, якщо власник видаляє заброньований подарунок?

Варіанти:

- дозволити, але показати попередження;
- заборонити, поки reservation активна;
- автоматично скасувати reservation.

Для MVP я б дозволив видалення з попередженням:

```text
Цей подарунок уже заброньований.
Після видалення бронювання також буде скасоване.
```

## Чи може власник бачити, хто забронював подарунок?

Рекомендація:

```text
Власник бачить статус, але не особу гостя.
```

## Чи може один користувач забронювати кілька подарунків?

Для MVP — так.

## Чи можна бронювати подарунок після дати події?

Можна:

- блокувати бронювання після події;
- або залишити відкритим.

Я б додав статус:

```text
Event ended
```

але не блокував автоматично в першій версії, якщо це не критично.

## Чи може автор бронювати подарунки у власному wishlist?

Краще заборонити.

## Що відбувається після видалення акаунта?

Потрібно вирішити долю:

- створених wishlist;
- активних reservation;
- завантажених файлів.

Це можна відкласти, але поведінка має бути визначена до production.

---

# UX модалок

Не всі модальні вікна повинні виглядати однаково.

Рекомендую:

### Невеликі підтвердження

```text
Reserve gift
Delete gift
Cancel reservation
```

- стандартний centered dialog;
- bottom sheet на mobile.

### Великі форми

```text
Create wishlist
Edit wishlist
Add gift
Edit gift
My wishlists
My gifts
```

- full-screen dialog на mobile;
- large modal на desktop.

Це дозволить уникнути довгих форм у маленькому вікні.

Також потрібні:

- focus trap;
- відновлення фокусу після закриття;
- Escape;
- backdrop click тільки там, де безпечно;
- scroll locking;
- unsaved changes confirmation.

---

# Кольорова система

Більше пастельних кольорів — хороша ідея, але не треба випадково фарбувати кожен компонент.

Закріпіть семантичні ролі:

```text
Lavender — основні кнопки
Peach — event hero і промо-секції
Mint — доступний подарунок
Baby blue — заброньовано поточним користувачем
Soft yellow — заброньовано кимось іншим
Blush pink — декоративні елементи
Coral red — видалення та помилки
```

Тоді користувач поступово запам’ятає значення кольорів.

Котячу тему краще концентрувати в:

- логотипі;
- hero;
- empty states;
- auth modal;
- success toast;
- loading state.

Не потрібно додавати котячі елементи в кожен input або badge.

---

# Що я б скоротив у першому MVP

Поточний контекст містить досить багато сценаріїв. Для швидкого запуску я б поділив їх.

## Обов’язковий MVP

1. Landing page.
2. Phone OTP.
3. Створення wishlist.
4. Редагування wishlist.
5. Додавання, редагування і видалення gift.
6. Публічне посилання.
7. Перегляд wishlist без авторизації.
8. Reserve gift.
9. Cancel reservation.
10. Стани available / reserved / reserved by me.
11. Атомарне бронювання.
12. RLS.
13. Mobile-first layout.

## Можна спростити

- лише один cover image;
- теги як простий масив рядків;
- без складного сортування;
- без категорій подарунків;
- без QR-коду;
- без окремої privacy-настройки;
- без редагування аватара;
- без складної системи повідомлень;
- без realtime, якщо після бронювання достатньо оновити список.

## Можна перенести після MVP

- My profile;
- повноцінний My gifts;
- додаткові visibility modes;
- декілька типів подій;
- нагадування;
- email/SMS-нотифікації;
- co-owners;
- коментарі;
- архівні wishlist;
- кастомні теми wishlist;
- аналітика переглядів.

`My wishlists` я б залишив, бо без нього автору складно повернутися до створених списків.

---

# Рекомендований порядок розробки

### Етап 1 — каркас

```text
Angular app
Tailwind + daisyUI
/
 /wishlists/:id
ModalRouterService
Базова responsive layout
```

### Етап 2 — Supabase

```text
Auth
profiles
wishlists
gifts
storage
RLS
```

### Етап 3 — owner flow

```text
Create wishlist
Edit wishlist
Delete wishlist
Gift CRUD
My wishlists
```

### Етап 4 — guest flow

```text
Public wishlist
Authentication before reservation
Reserve gift RPC
Cancel reservation
Conflict handling
```

### Етап 5 — polishing

```text
Skeletons
Toasts
Error states
Empty states
Upload errors
Browser back behavior
Direct modal URLs
Accessibility
```

---

# Тести, які обов’язково потрібні

Найважливіші E2E-сценарії:

1. Неавторизований користувач створює wishlist.
2. Неавторизований користувач бронює gift і повертається до pending action після OTP.
3. Два користувачі одночасно бронюють один gift.
4. Користувач відкриває modal URL напряму.
5. Browser Back закриває modal.
6. Reload не губить modal state.
7. Не-власник не може редагувати wishlist через ручну підстановку ID.
8. Користувач не може скасувати чуже бронювання.
9. Власник не бачить `reserved_by`.
10. Видалення заброньованого gift працює за визначеним правилом.
11. Завантаження неправильного формату або завеликого зображення.
12. OTP error, resend і rate limit.

---

# Підсумок

Концепція добре підходить для MVP. Я б зберіг:

```text
2 маршрути
URL-driven modal state
Supabase
Phone OTP
daisyUI
Mobile-first
Повне бронювання подарунка
```

Головні покращення:

1. Зафіксувати точну модель `Wishlist → Gifts → Reservations`.
2. Централізувати query-param модалки.
3. Не допускати modal поверх modal.
4. Зберігати pending action в URL.
5. Реалізувати бронювання через атомарну database function.
6. Закрити доступ через RLS.
7. Використовувати випадковий public identifier.
8. Скоротити другорядні account-функції в першому MVP.
9. Використовувати Angular CDK для поведінки dialog, а daisyUI — для стилізації.
10. До початку коду зафіксувати правила для видалення, приватності й бронювання.
