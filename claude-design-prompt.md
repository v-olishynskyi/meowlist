Design a complete mobile-first UI prototype for a playful, light, single-page-style birthday wishlist website called “MeowList”.

The website uses:

- Tailwind CSS
- daisyUI
- daisyUI `cupcake` theme as a base
- Angular-compatible HTML structure
- Lucide-style outline icons
- minimal custom CSS
- responsive mobile-first layout
- pastel visual accents
- subtle cat-themed branding

The design must feel:

- joyful
- warm
- playful
- light
- clean
- friendly
- modern
- cozy
- slightly whimsical

Do not create a complex dashboard, admin panel, or multi-page application.

The product has only two main routes:

1. `/`
2. `/wishlists/:id`

All other user interactions happen inside modals, drawers, bottom sheets, or overlays controlled by URL query parameters.

---

# 🎨 Design System — CSS Variables (IMPORTANT)

You MUST explicitly define every color used in the design as CSS variables compatible with daisyUI theme system.

⚠️ Important clarification: these variables are NOT meant to be used directly in CSS files. Instead, they are intended to be mapped into a DaisyUI theme (e.g. extending `cupcake`) and then consumed via Tailwind utility classes (e.g. `bg-primary`, `text-base-content`, etc.).

All colors from the palette must be mapped into variables like:

```css
--bg-background: #fff9f1;
--bg-surface: #ffffff;
--bg-muted: #f4f3f8;

--primary: #a98afb;
--primary-content: #ffffff;

--secondary: #ffc4d6;
--secondary-content: #3f3658;

--accent: #bdefd6;
--accent-content: #3f3658;

--success: #8edcb5;
--warning: #ffe9a9;
--error: #ff8fa8;

--text-base: #3f3658;
--text-muted: #6b6280;

--border: #e9e6f2;
--ring: #a98afb;
```

### How these variables should be used

These variables are meant to override or extend the default **daisyUI cupcake theme** inside a theme configuration file, for example:

```js
// tailwind.config.js (daisyUI theme extension)
themes: [
  {
    cupcake: {
      ...require('daisyui/src/theming/themes')['cupcake'],
      primary: '#A98AFB',
      secondary: '#FFC4D6',
      accent: '#BDEFD6',
      'base-100': '#FFF9F1',
      'base-content': '#3F3658',
    },
  },
];
```

### Tailwind usage (IMPORTANT)

After mapping, components MUST use Tailwind classes only:

✅ Correct:

```html
<div class="bg-base-100 text-base-content">
  <button class="btn btn-primary">
    <span class="text-base-content/70"></span>
  </button>
</div>
```

❌ Incorrect:

```css
background-color: var(--bg-background);
color: var(--text-base);
```

### Design rules

- Every UI section background must map to a Tailwind semantic color (`base-100`, `base-200`, etc.)
- Every badge state must use DaisyUI semantic colors (`success`, `warning`, `error`, `info`)
- Every button state must use DaisyUI button variants (`btn-primary`, `btn-secondary`, etc.)
- No hardcoded hex colors in components
- No direct usage of CSS variables in component styles

### Summary

This system is designed so that:

- CSS variables define the **design source of truth**
- DaisyUI theme maps them into semantic tokens
- Tailwind classes are the **only layer used in components**

This ensures full theming flexibility while keeping the UI implementation clean and consistent.

---

# Product concept

MeowList is a simple birthday and event wishlist service.

A user can:

- create a wishlist for an event
- add gifts to the wishlist
- share the wishlist link
- allow guests to reserve full gifts

This is not a crowdfunding platform.

Guests reserve an entire gift.

Do not include:

- fundraising progress bars
- money contributions
- shared payments
- contribution amounts
- “Contribute” buttons
- payment forms
- gift collection jars

Use wording such as:

- “Choose this gift”
- “Reserve this gift”
- “I’ll get this”
- “This gift is already chosen”
- “You reserved this gift”

---

# Route architecture

The website has only two routes.

## Route 1: `/`

Public landing page.

Primary action:

- “Create wishlist”

Flow:

`/?action=auth` → auth modal
`/?action=create-wishlist` → create modal
`/wishlists/:id` → redirect after creation

---

## Route 2: `/wishlists/:id`

Public wishlist page.

Visible without authentication.

---

# URL-driven modal architecture

All major actions must be controlled via query params.

Examples:

- `/?action=auth`
- `/?action=create-wishlist`
- `/wishlists/abc?action=add-gift`
- `/wishlists/abc?action=choose-gift&giftId=1`

Modals must:

- be shareable
- survive refresh
- close via browser back
- not navigate away from route

---

# Layout principles

- no dashboard UI
- no admin panels
- no persistent bottom navigation
- no multi-page app feel

Use:

- top navbar
- centered content
- modal-driven flows
- drawers only for account actions

---

# Route `/` — landing page

## 1. Header

- logo
- name
- sign in
- avatar menu

---

## 2. Hero

Headline:

“Create a wishlist your friends will actually use”

CTA:

“Create wishlist”

Secondary:

“View example”

---

## 3. How it works

3 steps:

- Create
- Share
- Reserve

---

## 4. Example wishlist preview

Mock wishlist card.

---

## 5. Benefits

- no duplicates
- simple sharing
- mobile friendly

---

## 6. Final CTA

“Create your wishlist”

---

## 7. Footer

Minimal.

---

# Route `/wishlists/:id`

## 1. Event hero

- title
- date
- location
- author

---

## 2. Gifts

Cards with:

- image
- title
- tags
- status
- action

---

## 3. States

- available
- reserved
- reserved by user
- owner view

---

# Mobile-first + Desktop breakpoint change

IMPORTANT CHANGE:

- Mobile-first remains default
- Desktop layout breakpoint is now:

```
1440px (NOT 1024px)
```

At ≥1440px:

- use wider container
- 2–3 column grid for gifts
- split hero layout
- side share panel allowed

Do NOT introduce sidebar navigation.

---

# Pastel system

Use variables ONLY.

Map:

- lavender
- mint
- peach
- pink
- blue
- yellow

All must be defined in CSS variables.

---

# Cat-themed design

- subtle mascot
- paw accents
- playful but minimal

---

# daisyUI usage

Use:

- card
- btn
- modal
- badge
- navbar
- drawer

---

# REQUIRED OUTPUT RULES

You must:

- define ALL colors as CSS variables
- avoid hardcoded hex in components
- use 1440px breakpoint
- keep modal-driven architecture
- keep two-route system
