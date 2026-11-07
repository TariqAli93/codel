# CLAUDE.md

Conventions for AI assistants working on this repository.

## Project

Website starter for **Codel - كودل**, an Iraqi software company. Primary audience reads Arabic, so the site is Arabic-first and right-to-left.

## Stack

- Nuxt **4.6.4**, pinned exactly in `package.json`. Do not bump it without being asked.
- TypeScript in strict mode. Strictness comes from `typescript.strict: true` in `nuxt.config.ts`, which Nuxt writes into the generated `.nuxt/tsconfig.*.json` files referenced by the root `tsconfig.json`.
- SCSS for all styling.
- Node `^22.22.3 || ^24.15.0 || >=26.0.0` (Nuxt 4.6.4 requirement).

## No-library rule

- No third-party UI libraries (Vuetify, PrimeVue, Element, etc.).
- No CSS frameworks (Tailwind, Bootstrap, UnoCSS, etc.).
- No new npm dependencies without explicit approval from the project owner.
  The only dependencies are `nuxt`, `vue`, `vue-router` (as in the official starter) and `sass` (dev, needed to compile SCSS).
- No web-font or icon services (no Google Fonts link, no CDN). Fonts are self-hosted in `public/fonts/` (see Brand below).

## Styling (SCSS only)

- Use `<style scoped lang="scss">` in `.vue` files, or the global stylesheet at `app/assets/scss/main.scss`.
- `main.scss` contains **only** font faces, design tokens (as CSS custom properties) and a basic reset with base element styles. Consume tokens in components with `var(--token)`.
- Prefer BEM-style class names (`.block__element--modifier`) written with SCSS `&` nesting.
- No inline `style` attributes, no CSS-in-JS, no `.css` files.
- Use `@use`, never `@import`.
- The site is RTL: use CSS logical properties (`margin-inline-start`, `padding-block`, `inset-inline-end`, `text-align: start`) instead of `left`/`right`.

## Brand

Identity follows the Codel design system (charcoal and lime, dark first). Token names and values in `main.scss` mirror its `tokens.json`; change a value in the design system first, then here.

- Use semantic tokens in components: `--bg`, `--surface`, `--surface-raised`, `--text`, `--text-muted`, `--accent`, `--accent-text`, `--primary`, `--on-primary`, `--border`, `--border-strong`, `--focus`, plus `--space-*`, `--radius-*`, `--shadow-*`, `--control-*`, `--header-height`, `--container-max`. Never write a hex value or a `--charcoal-*` / `--lime-*` primitive in a component.
- The site ships dark: `data-theme="dark"` is set on `<html>` in `nuxt.config.ts`. The `light` theme is declared in `main.scss` but is not switched on; do not add a toggle unless asked.
- Lime as text on a light ground fails contrast. Use `--accent-text` for lime text, `--accent` only as a fill with `--on-accent` on it.
- Fonts: Rubik (`--font-display`, headings and display) and Readex Pro (`--font-sans`, body and UI), self-hosted as subset variable woff2 in `public/fonts/` with their OFL licenses. Arabic body text keeps a line-height of 1.7 or more.
- Never add `letter-spacing` to Arabic and never slant Arabic text.
- Logo files live in `public/brand/`: `-white` on dark grounds, `-ink` on light grounds, `-lime` on dark grounds only. Do not recolor, stretch, redraw or retype the logo. There is no Arabic wordmark; write كودل as live text.
- `public/brand/og.png` (1200×630) is the share image: `codel-full-white.svg` centred on the dark `--bg` (`#101411`), rendered once with headless Chrome. Re-render it the same way if the logo or `--bg` changes.
- The brand lean is `--slant-angle` (10deg). It applies to buttons, tags and decorative bars, never to text, inputs, cards or images, and the label is turned back upright.

## TypeScript

- Use `<script setup lang="ts">` in every component and page.
- No `any`, no `@ts-ignore` / `@ts-expect-error` unless unavoidable and commented with the reason.
- Handle `string | string[]` route params and possibly-`undefined` values explicitly.

## Routing

File-based routing under `app/pages/`. One placeholder file per route:

| Route               | File                             |
| ------------------- | -------------------------------- |
| `/`                 | `app/pages/index.vue`            |
| `/about`            | `app/pages/about.vue`            |
| `/services`         | `app/pages/services.vue`         |
| `/solutions`        | `app/pages/solutions/index.vue`  |
| `/solutions/[slug]` | `app/pages/solutions/[slug].vue` |
| `/contact`          | `app/pages/contact.vue`          |
| `/faq`              | `app/pages/faq.vue`              |
| `/careers`          | `app/pages/careers.vue`          |
| `/blog`             | `app/pages/blog.vue`             |
| `/privacy`          | `app/pages/privacy.vue`          |
| `/terms`            | `app/pages/terms.vue`            |

Only one layout exists: `app/layouts/default.vue`. It holds the skip link, the header (logo and main navigation), `<main id="main" tabindex="-1">`, the footer (contact details) and the site-wide share tags.

`app/error.vue` is the branded error page (Nuxt special file, not a component): Arabic message, a link home, wrapped in `<NuxtLayout>`, `robots: noindex`. An unknown `/solutions/<slug>` throws `createError({ status: 404, statusText: 'Page Not Found', fatal: true })`; keep `statusText` ASCII because it goes into the HTTP status line, and put Arabic text in `error.vue` only. Use `status`/`statusText`, not the deprecated `statusCode`/`statusMessage`.

## Language and direction

- `<html lang="ar" dir="rtl">` is set globally in `nuxt.config.ts` (`app.head.htmlAttrs`). Do not override it per page unless a page is genuinely English-only.
- Page titles are bilingual: `Arabic / English`, set per page with `useSeoMeta({ title, description, ogTitle, ogDescription })`; every title and description is unique. `nuxt.config.ts` sets `titleTemplate: '%s %separator %siteName'` with `templateParams` (`|`, `Codel - كودل`), so every title ends with ` | Codel - كودل` and a page with no title of its own (the static `404.html` / `200.html` shells) shows just `Codel - كودل`. Every page writes an Arabic-only `<h1>` and an Arabic `description`.
- Latin names inside Arabic text sit in `<span dir="ltr">`. Phone numbers and the email link carry `dir="ltr"`. Prices use Western digits through `Intl.NumberFormat('en-US')`: `175,000 دينار عراقي`.
- Company name format: `Codel - كودل`.

## Content policy

Real content only comes from the project owner. Never invent services, products, prices, numbers, clients, team members, claims or legal text.

**Company facts (the only facts so far):**

- Codel (كودل) is an Iraqi startup software company in Baghdad. The idea began in 2020 and the company launched in 2024. It offers ready-made software and custom development.
- Services: برمجة وتصميم المواقع; برمجة وتصميم تطبيقات الهواتف; برامج الحسابات والمخازن والكاشيرات; إدارة السيرفرات; خدمات برمجية حسب الطلب.
- Ready-made products: نقطة بلس / Nuqta Plus (نظام إدارة نقاط البيع والمخازن), 175,000 IQD; دلالي / Dalaly (إدارة عروض مكاتب العقارات), 150,000 IQD. Both run on Windows.
- Phone and WhatsApp: 07824082356. WhatsApp only: 07884841993. Email: business@codelapps.com.
- Address: العراق، بغداد، الدورة، حي دجلة. Hours: الأحد إلى الخميس، من 10 صباحاً إلى 10 مساءً.

**Single source of truth.** Facts live in two data files; pages and the layout import them. Change a fact there, never in a page.

- `app/data/company.ts`: name, `siteUrl`, founding years, phones, email, address, hours, the five services. `addressParts` and `openingHours` repeat the address and hours in the shape JSON-LD needs; keep them in step with `address` and `hours`.
- `app/data/solutions.ts`: the ready-made products (slug, names, tagline, description, features, price in IQD, platform, images). `/solutions`, `/solutions/[slug]`, the home page and the FAQ read it. An unknown slug throws a 404. Add a product by adding an entry; the static build finds it through the link on `/solutions`.
- Main navigation: the `links` array in `app/layouts/default.vue`.

Data files are plain typed constants, not utilities or composables. Do not add logic to them.

**Pages with real content:** `/`, `/about`, `/services`, `/solutions`, `/solutions/[slug]`, `/contact`, `/faq`. The founding story on `/about` is written from the two years only. The description under each service, and each product's description and feature list, are drafts: the product text was taken from the products' repositories and the service text from the service names, and the owner has not reviewed them.

**Images.** Product screenshots go in `public/solutions/<slug>/` (plain lowercase file names) and are listed in the product's `images` array in `app/data/solutions.ts`: `{ src: '/solutions/<slug>/<file>', alt, width, height }`. `alt` is Arabic and describes only what is visible; `width` and `height` are the file's real pixel size. The detail page shows a gallery only when the array is not empty: the first image loads eagerly, the rest lazily, inside a fixed 16:10 frame with `object-fit: contain` (no layout shift, no cropping). Flag any file over 500 KB to the owner. No screenshots exist yet (none were supplied) and no video player is planned.

**Pages still placeholder** (an Arabic `<h1>` and one placeholder `<p>`, not linked from the navigation, `robots: noindex`, never in a sitemap): `/careers`, `/blog`, `/privacy`, `/terms`. Do not write legal text for `/privacy` or `/terms`. No team or vision text exists yet; do not write any.

**Still not allowed** until the owner says otherwise: reusable components, extra layouts, composables, utilities, stores, plugins, a contact form (there is no backend), analytics, a `docs/` folder, or any Markdown file other than `README.md` and `CLAUDE.md`. The only Nuxt special file beyond `app.vue` and the layout is `app/error.vue`. Keep `README.md` (including the Arabic `دليل التسليم` section, whose line numbers point into the two data files) in sync when routes, commands or data-file lines change.

## SEO and sharing

- Site-wide tags live in `app/layouts/default.vue`: `og:type` `website`, `og:locale` `ar_IQ`, `og:site_name`, `og:image` `/brand/og.png` (+ width, height, alt).
- The domain is unknown. `company.siteUrl` is `''`; while it is empty there is **no** canonical link, no `og:url`, and `og:image` stays a relative path. Do not guess a domain. Once the owner gives one, `siteUrl` switches on canonical, `og:url` and an absolute `og:image` for every page; `public/robots.txt` then gets a `Sitemap:` line and `public/sitemap.xml` is created with the eight public routes only (the README handover section has the exact steps).
- JSON-LD via `useHead({ script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(...) }] })`: one `ProfessionalService` block on the home page (name, telephone, email, address, opening hours from `company.ts`) and one `Product` block per product page (name, alternateName, `offers` with price and `priceCurrency: 'IQD'`). Only real facts: no ratings, reviews, availability, URLs or other invented fields.
- Favicon, `theme-color` (the `--bg` hex, the one hex value outside `main.scss`, because a meta tag cannot read a CSS variable) and the two font preloads are set in `nuxt.config.ts`.

## Accessibility conventions (WCAG 2.1 AA)

- One `<header>`, `<main>`, `<footer>` per page (from the layout) and one `<h1>` per page, with no skipped heading levels.
- The skip link `تخطَّ إلى المحتوى` is the first focusable element; it is visually hidden until focused and targets `#main`.
- The global `:focus-visible` outline in `main.scss` is the focus ring; do not remove it on interactive elements.
- Standalone links (navigation, contact links, action links) get `display: inline-flex; align-items: center; min-block-size: 44px`. Links inside a running sentence are exempt.
- Grids use `minmax(min(<size>, 100%), 1fr)` so nothing overflows at 320px. Page gutters use `clamp(var(--space-4), 5vw, var(--space-6))`.
- `main.scss` neutralises transitions and animations under `prefers-reduced-motion: reduce`; any new motion must still be optional.
- Links that open in a new tab (WhatsApp) carry `rel="noopener noreferrer"`. Phone, WhatsApp and email links come from `company.ts` only.

## Commands

```bash
npm install
npm run dev        # dev server
npm run build      # production build
npm run generate   # static generation
npm run preview    # preview production build
```
