# CLAUDE.md

Conventions for AI assistants working on this repository.

## Project

Website for **Codel - كودل**, an Iraqi software company. Primary audience reads Arabic, so the site is Arabic-first and right-to-left.

The site has real content and is due for a full redesign. Passages marked **Current design** describe how the site looks today; a redesign may replace them. Everything else in this file is a standing rule.

## Stack

- Nuxt **4.6.4**, pinned exactly in `package.json`. Do not bump it without being asked.
- TypeScript in strict mode. Strictness comes from `typescript.strict: true` in `nuxt.config.ts`, which Nuxt writes into the generated `.nuxt/tsconfig.*.json` files referenced by the root `tsconfig.json`.
- SCSS for all styling.
- Node `^22.22.3 || ^24.15.0 || >=26.0.0` (Nuxt 4.6.4 requirement).

## Styling (SCSS only)

- Use `<style scoped lang="scss">` in `.vue` files, or the global stylesheet at `app/assets/scss/main.scss`.
- `main.scss` contains **only** font faces, design tokens (as CSS custom properties) and a basic reset with base element styles. Consume tokens in components with `var(--token)`.
- Site-level tokens not yet in `tokens.json`: `--page-gutter` and the motion tokens `--duration-fast` (feedback), `--duration-base` (UI transitions), `--duration-slow` (larger moves and fades), `--duration-entrance` (the home hero's load sequence), `--stagger`, `--ease-out`, `--ease-in-out`. Use them instead of literal timings. Also site-level: the type scale `--text-hero`, `--text-title`, `--text-name`, `--text-figure` (prices and years, always below `--text-title`), `--text-flow`, `--text-lead`, `--text-small`; the points `--point-sm` and `--point-md`; `--stroke`; and `--glow-accent`, the one lime glow (put it on a pseudo-element and change only its opacity).
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
- The brand lean is `--slant-angle` (10deg). It applies to buttons, tags and decorative bars, never to text, inputs, cards or images, and the label is turned back upright. Write it as `skewX(calc(var(--slant-angle) * -1))` on the element and `skewX(var(--slant-angle))` on an inner label span; the element keeps the global focus ring.
- On a lime ground set `--focus: var(--on-accent)` so the focus ring stays visible.
- **Current design:** two motifs with one job each. The lean marks what you act on: the lime WhatsApp call bar in the home hero (with the lime glow, running off the window edge), the lime contact band that closes the home page (with the glow) and the dark WhatsApp button on it, the lime header button, the outlined action buttons, the menu button, the platform tags and the bar between the two founding years; things you read stay upright. A small lime point marks what is live now: the current page in the navigation, "في الدوام الآن" (dark, on the lime band), the 2024 launch year, and the start of each outlined action button. Nothing else is lime: plain links are `--text` with a muted underline that turns lime on hover.

## TypeScript

- Use `<script setup lang="ts">` in every component and page.
- No `any`, no `@ts-ignore` / `@ts-expect-error` unless unavoidable and commented with the reason.
- Handle `string | string[]` route params and possibly-`undefined` values explicitly.

## Routing

File-based routing under `app/pages/`. One file per route:

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

Only one layout exists: `app/layouts/default.vue`. It holds the skip link, the header (logo and main navigation), `<main id="main" tabindex="-1">`, the footer (site links in `<nav aria-label="روابط الموقع">` and contact details) and the site-wide share tags.

- The header is sticky and its content sits in the same `--container-max` column as the pages (`html` has `scroll-padding-block-start` so in-page targets clear it). It is sticky only under `.js` or from `60em`: without JavaScript on a narrow screen the links wrap into a tall list that would cover focused content.
- Below `60em` the links fold behind a menu button (`aria-expanded`, `aria-controls="site-menu"`). The menu closes on Escape (focus returns to the button), on a press or focus move outside the header, on any link click or route change, and when the window widens past the breakpoint. Listeners are added only while it is open and removed on unmount. Keep the breakpoint in step between `wideQuery` (script) and `$nav-wide` (styles).
- An inline head script adds `class="js"` to `<html>` before the first paint. Styles that collapse the menu are written under `.js`, so without JavaScript the links stay a visible wrapping list and the button stays hidden. Never hide content behind `.js` that a visitor needs.
- `/solutions/<slug>` marks "حلولنا" with `layout__link--section`; the exact page link keeps `aria-current="page"`.
- A page that draws its own full-width sections sets `definePageMeta({ fullWidth: true })`; the layout then drops the centred column and its padding from `<main>`. Today only the home page uses it.

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
- Main navigation: the `links` array in `app/layouts/default.vue`. `cta: true` draws an entry as the leaning lime button with the glow at the end of the bar (only "تواصل معنا").

Data files are plain typed constants, not utilities or composables. Do not add logic to them.

**Pages with real content:** `/`, `/about`, `/services`, `/solutions`, `/solutions/[slug]`, `/contact`, `/faq`. The founding story on `/about` is written from the two years only. The description under each service, and each product's description and feature list, are drafts: the product text was taken from the products' repositories and the service text from the service names, and the owner has not reviewed them.

**Home page** (`app/pages/index.vue`). The headline `برامج جاهزة، وبرمجيات على مقاسك.` restates the two offerings and is a draft the owner has not reviewed; so are the line above it, the lede under it, the intro sentences under "حلولنا الجاهزة" and "خدماتنا", the call and button labels, the WhatsApp message that "اسأل عنه على واتساب" pre-fills (the same phrase as `/solutions/[slug]`), and the two status lines. The status ("في الدوام الآن" or "خارج ساعات الدوام الآن") is worked out in the browser after mount from `company.openingHours` in the `Asia/Baghdad` time zone; nothing time-dependent renders on the server, and its line's space is reserved under `.js` so it never shifts the page. Product entries show only owner facts (name, tagline, price, platform), not the draft descriptions or features; every product and service comes from the data files through `v-for`. Section `h2`s always outrank product names.

**Current design** of the home page: sections in this order, each composed differently on one shared content column (`--container-max`, `--page-gutter`): a poster hero (a short line above a two-line headline, the leaning lime call bar, then the lede, in-page links to the products and services, and a phone link); ready-made products as two equal plates whose rows line up through subgrid, price-forward, with "اسأل عنه على واتساب" and a details link; the five service titles as one flowing block of large type separated by grey points; a company section (the goal sentence from `/about` beside the two founding years joined by a leaning bar); and the lime contact band from the previous design, restored at the owner's request with the lime glow (heading, the sentence with the hours, live status, the dark leaning WhatsApp button, then phone, email and "كل طرق التواصل"); it spans the window, and from `80em` it starts on the content edge with the lean. From `64em` the call bar's leading edge sits 42% into the column and the hero's links start on that line; below that the bar starts at the column edge. The bar and the band run past the window edge and their sections clip them, so the page never scrolls sideways. Type sizes come from the site-level type tokens in `main.scss`.

**Images.** Product screenshots go in `public/solutions/<slug>/` (plain lowercase file names) and are listed in the product's `images` array in `app/data/solutions.ts`: `{ src: '/solutions/<slug>/<file>', alt, width, height }`. `alt` is Arabic and describes only what is visible; `width` and `height` are the file's real pixel size. The detail page shows a gallery only when the array is not empty: the first image loads eagerly, the rest lazily, inside a fixed 16:10 frame with `object-fit: contain` (no layout shift, no cropping). Flag any file over 500 KB to the owner. No screenshots exist yet (none were supplied) and no video player is planned.

**Pages still placeholder** (an Arabic `<h1>` and one placeholder `<p>`, not linked from the navigation, `robots: noindex`, never in a sitemap): `/careers`, `/blog`, `/privacy`, `/terms`. Do not write legal text for `/privacy` or `/terms`. No team or vision text exists yet; do not write any.

**Components.** Reusable components may live in `app/components/` (Nuxt auto-imports them). Each is a `.vue` file with `<script setup lang="ts">`, typed props and `<style scoped lang="scss">`. Facts reach a component from `app/data/*.ts`, never typed into it. Today there is one: `ActionLink.vue`, the link for actions, with `look="bar"` (the leaning lime call bar), `look="ink"` (the dark leaning call button for a lime ground) or `look="outline"` (a leaning outlined button with a lime point); `newTab` adds `target="_blank"`, `rel="noopener noreferrer"` and a visually hidden "(يفتح في نافذة جديدة)", and `hiddenSuffix` makes a shared label unique for screen readers.

**Still not allowed** until the owner says otherwise: extra layouts, composables, utilities, stores, plugins, a contact form (there is no backend), analytics, a `docs/` folder, or any Markdown file other than `README.md` and `CLAUDE.md` (agent definitions under `.claude/` are exempt). The only Nuxt special file beyond `app.vue` and the layout is `app/error.vue`. Keep `README.md` (including the Arabic `دليل التسليم` section, whose line numbers point into the two data files) in sync when routes, commands or data-file lines change.

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
- Grids use `minmax(min(<size>, 100%), 1fr)` so nothing overflows at 320px. Page gutters use `var(--page-gutter)` (`clamp(var(--space-4), 5vw, var(--space-6))`). In RTL, overflow runs off the left edge: check sideways scroll, not only `scrollWidth`.
- `main.scss` neutralises transitions and animations under `prefers-reduced-motion: reduce`; any new motion must still be optional.
- Motion is CSS only (no animation library, no IntersectionObserver). Load and scroll animations sit inside `@media (prefers-reduced-motion: no-preference)`; scroll-linked ones also inside `@supports (animation-timeline: view())`, so without support they simply show their end state. Animate `transform`, `scale`, `translate` and `opacity` only. Do not add entrance animations to every section; today the home hero is the site's one load sequence. Keyboard focus can scroll an element into view before its scroll-linked animation ends, so an animated element that is or holds a link drops its animation on `:focus-visible` / `:focus-within`: nothing is ever focused half-faded or half-drawn.
- Links that open in a new tab (WhatsApp) carry `rel="noopener noreferrer"`. Phone, WhatsApp and email links come from `company.ts` only.

## AI tooling

The repository is public. Never commit tool output, caches, credentials or media; `graphify-out/`, `.claude-flow/`, `.claude/settings.local.json`, `.gemini/` and `.codex/` are gitignored.

- **Agents** in `.claude/agents/`, taken from `msitarzewski/agency-agents` (MIT) at commit `b859c51`, each with a Codel header: `ux-architect`, `ui-designer`, `frontend-developer` (the only one that edits files), `ui-finish-gate-reviewer`, `accessibility-auditor`, `performance-benchmarker`. This file overrides anything in an agent's own text.
- **Graphify** (`graphify-out/`, local only) maps code, this file and the README. Use it for questions that cross files or link a rule to code: `graphify query "<symbol or rule name>" --budget 800` (it matches keywords, so name the thing). After code changes run `graphify update .` (no LLM cost). `.graphifyignore` replaces `.gitignore` for Graphify, so it repeats the secrets and build-output rules; keep it in step. An update keeps nodes from files it no longer reads, so prune those after changing the ignore list. Re-extracting this file or the README (`/graphify --update`) spends tokens; do it only when asked. For work inside one file, read the file.
- **Codebase Memory** MCP (project `D-dev_projects-codel`) gives exact symbols, callers (`trace_path`) and the impact of a diff (`detect_changes`). It does not index `app/assets/`; search the SCSS with grep.
- The ruflo plugins are switched off for this project in `.claude/settings.json`.
- Video work (OpenMontage) lives in its own workspace outside this repository. Never add Python, video tooling or rendered media here.

## Commands

```bash
npm install
npm run dev        # dev server
npm run build      # production build
npm run generate   # static generation
npm run preview    # preview production build
```
