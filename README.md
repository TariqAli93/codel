# Codel - كودل

Starter website project for **Codel (كودل)**, an Iraqi software company.
Brand layer is in (colors, fonts, logo, favicon) and the main pages carry real Arabic content: services, the two ready-made products with prices, working hours, contact details and the company story. Careers, blog, privacy and terms are still placeholders.

**Stack:** Nuxt 4.6.4 (pinned) · TypeScript (strict) · SCSS · no UI libraries or CSS frameworks.

The document is Arabic and right-to-left by default (`<html lang="ar" dir="rtl">`, set in `nuxt.config.ts`). The site ships in the dark theme (`data-theme="dark"`).

## Requirements

- Node.js `^22.22.3 || ^24.15.0 || >=26.0.0` (required by Nuxt 4.6.4)
- npm

## Setup

```bash
# install dependencies
npm install

# start the dev server (http://localhost:3000)
npm run dev

# production build
npm run build

# preview the production build locally
npm run preview

# static site generation (output in .output/public)
npm run generate
```

## Routes

| Route               | Page                            | File                             |
| ------------------- | ------------------------------- | -------------------------------- |
| `/`                 | Home                            | `app/pages/index.vue`            |
| `/about`            | About                           | `app/pages/about.vue`            |
| `/services`         | Services                        | `app/pages/services/index.vue`   |
| `/services/[id]`    | Service detail (dynamic)        | `app/pages/services/[id].vue`    |
| `/solutions`        | Solutions (listing)             | `app/pages/solutions/index.vue`  |
| `/solutions/[slug]` | Solution detail (dynamic)       | `app/pages/solutions/[slug].vue` |
| `/contact`          | Contact                         | `app/pages/contact.vue`          |
| `/faq`              | FAQ                             | `app/pages/faq.vue`              |
| `/careers`          | Careers (additional)            | `app/pages/careers.vue`          |
| `/blog`             | Blog (additional)               | `app/pages/blog.vue`             |
| `/privacy`          | Privacy Policy (additional)     | `app/pages/privacy.vue`          |
| `/terms`            | Terms & Conditions (additional) | `app/pages/terms.vue`            |

Notes:

- Real content: `/`, `/about`, `/services`, `/solutions`, `/solutions/[slug]`, `/contact`, `/faq`. Placeholders: `/careers`, `/blog`, `/privacy`, `/terms`; they carry `robots: noindex` and stay out of the navigation and any sitemap.
- Unknown addresses (including an unknown `/solutions/<slug>`) show `app/error.vue`, the branded error page, inside the default layout. The server build answers them with status 404; the static build ships it as `404.html`.
- Structured data (JSON-LD): a `ProfessionalService` block on the home page and a `Product` block (name, price in IQD) on each product page, built from the two data files.
- `/solutions/[slug]` serves the products in `app/data/solutions.ts` (`nuqta-plus`, `dalaly`); any other slug returns a 404. `npm run generate` renders them because `/solutions` links to each one.
- Company facts (services, phones, email, address, hours) live in `app/data/company.ts`; the ready-made products (names, prices, features, images) live in `app/data/solutions.ts`. Edit those two files to change content. `CLAUDE.md` lists every fact.
- Product screenshots go in `public/images/solutions/<slug>/` and are listed in the product's `images` array.

## Workline V8.3 design review

The root Nuxt route now renders the full-viewport Workline hero, business discovery, product panels, services index, factual proof and CTA. The shared layout uses the same spacing and action geometry across routes. Service detail routes use the permanent IDs in `company.ts`. The contact form opens a prefilled WhatsApp message; there is no submission backend. Hero artwork: [VectorElements / Unsplash](https://unsplash.com/illustrations/isometric-business-people-interacting-with-technology-and-data-lyKf9UWWrdg), Unsplash License; a local inline SVG is the fallback. Product screenshots and fonts are local. Legal and team content remain unapproved placeholders. This branch keeps the existing Nuxt/SCSS stack; Tailwind/shadcn-vue migration is not included. Build, static generation, visual parity and accessibility need verification before merge.

## Dependencies

- `nuxt` (pinned to exactly `4.6.4`), `vue`, `vue-router`: same as the official Nuxt 4 starter.
- `sass` (dev): the one addition, required for Nuxt/Vite to compile SCSS.

## Brand assets

- Design tokens (colors, spacing, radius, shadow, slant) live in `app/assets/scss/main.scss` as CSS custom properties. They mirror the Codel design system: dark theme active, light theme declared but not switched on. The page gutter, the motion tokens (durations, easing, stagger), the type scale, the point sizes, the stroke and the lime glow are site-level additions in the same file.
- Imagery: the products' real screens (`public/images/solutions/<slug>/`, framed by `app/components/ProductWindow.vue`) in the products' own colours. The home page tells one story in five chapters around one centred window that stays on screen, each chapter's headings on the same line above it: Codel, Nuqta Plus at its point of sale, the same program's figures and reports, Dalaly on its sand ground, then custom software and the call on lime. Buttons, tags and decorative bars lean (the brand slant); lime marks what you act on and what is live now.
- Motion: the home page's opening enters with plain CSS. On a desktop-sized window, GSAP with ScrollTrigger (loaded on the client) turns the story into a cinematic stage: the story's viewport sticks to the window and one scrubbed timeline hands the window and the text from chapter to chapter (the slab steps aside, screens are swept in along the brand's lean, the camera moves in on what each chapter is about). On phones, tablets and short windows the chapters flow as a page and reveal themselves once. All of it is off under `prefers-reduced-motion: reduce` (the story is then a plain page), and anything that takes keyboard focus is brought into view in its end state. The code lives in `app/components/HomeStory.vue` (layout), `StoryStage.vue`, `StoryChapter.vue` and `SplitWords.vue`, the chapters in `app/components/home/`, and the motion in `app/composables/home/` (`useStoryMotion.ts` and the modules it uses).
- Fonts are self-hosted in `public/fonts/`: Rubik (display and headings) and Readex Pro (body and UI), as subset variable woff2 files for Arabic and Latin. Both are licensed under the SIL Open Font License; the license texts are beside the files.
- Logo files are in `public/brand/` (full logo and symbol, each in white, ink and lime). The favicon is `public/favicon.svg`: the symbol, ink on light browser themes and lime on dark ones.
- `public/brand/og.png` (1200×630) is the share image: the white logo on the dark `--bg`, rendered from `codel-full-white.svg`.

## Project layout

```
app/
  app.vue                  # NuxtLayout + NuxtPage
  error.vue                # branded 404 / error page (uses the default layout)
  layouts/default.vue      # the only layout (skip link, sticky header with a small-screen menu, main, footer, site-wide share tags)
  components/              # reusable components; the home page's story is HomeStory, StoryStage, StoryChapter and SplitWords
  components/home/         # the home page's chapters (HomeIntro, HomeChapterHead, HomeChapterMedia, HomeServices, HomeServiceScene)
  composables/home/        # the home story's motion (useStoryMotion and the modules it uses)
  pages/                   # one file per route
  data/                    # company.ts and solutions.ts: the facts the pages show
  assets/scss/main.scss    # font faces, design tokens, reset and base styles
  assets/scss/_story.scss  # the home story's shared SCSS variables and mixins (no CSS output)
public/
  brand/                   # logo SVGs + og.png (share image)
  fonts/                   # Rubik and Readex Pro (woff2) + OFL licenses
  favicon.svg
  robots.txt
nuxt.config.ts
tsconfig.json
```

## دليل التسليم

هذا القسم لصاحب الشركة. لا يحتاج خبرة برمجية، فقط الحاسبة ومحرر نصوص (مثل VS Code أو Notepad).

### 1. تشغيل الموقع على الحاسبة

1. ثبّت **Node.js** من موقع nodejs.org: الإصدار 24 (LTS). الإصدارات المقبولة: 22.22.3 أو أحدث، أو 24.15.0 أو أحدث. للتأكد اكتب `node -v` في الطرفية.
2. افتح الطرفية (Terminal) داخل مجلد المشروع، واكتب مرة واحدة فقط: `npm install`
3. لتشغيل الموقع اكتب: `npm run dev` ثم افتح المتصفح على `http://localhost:3000`. أي تعديل تحفظه يظهر في المتصفح مباشرة.

### 2. تغيير معلومات الشركة: الملف `app/data/company.ts`

| ماذا تريد أن تغيّر            | السطر                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| الرقم الأساسي (هاتف وواتساب) | 23 إلى 25                                                                            |
| رقم الواتساب الثاني          | 29 و 30                                                                              |
| البريد الإلكتروني            | 33                                                                                   |
| العنوان                      | 34، ونفس العنوان مقسّماً في السطر 36 (غيّر الاثنين معاً)                                 |
| ساعات الدوام                 | 37 (النص الذي يظهر للزائر)، ونفس الساعات بنظام 24 ساعة في السطر 39 (غيّر الاثنين معاً) |

- كل رقم يُكتب بثلاث صيغ. مثال للرقم 07824082356: الصيغة الظاهرة `'0782 408 2356'`، ورابط الاتصال `'tel:+9647824082356'`، ورابط واتساب `'https://wa.me/9647824082356'` (احذف الصفر الأول وضع 964 قبله).
- غيّر الكلام بين علامتي `' '` فقط، ولا تحذف الفواصل أو الأقواس.
- إذا تغيّرت أرقام الأسطر، ابحث في الملف عن الكلمة (مثلاً `email`).

### 3. تغيير سعر برنامج: الملف `app/data/solutions.ts`

- نقطة بلس: السطر 49، `priceIqd: 175000`
- دلالي: السطر 71، `priceIqd: 150000`

اكتب الرقم بدون فواصل. يظهر السعر تلقائياً بصيغة "175,000 دينار عراقي" في صفحة الحلول وصفحة البرنامج والأسئلة الشائعة.

### 4. إضافة صورة لبرنامج

1. ضع الصورة في المجلد `public/images/solutions/nuqta-plus/` (لنقطة بلس) أو `public/images/solutions/dalaly/` (لدلالي). أنشئ المجلد إذا لم يكن موجوداً. اسم الملف بأحرف إنكليزية صغيرة بدون مسافات، مثل `sales-screen.png`.
2. اعرف مقاس الصورة بالبكسل: في ويندوز اضغط على الصورة بالزر الأيمن ← خصائص ← التفاصيل ← الأبعاد.
3. في `app/data/solutions.ts` أضف الصورة داخل `images` (السطر 52 لنقطة بلس، السطر 74 لدلالي) بنفس شكل الصور الموجودة فيه:

```ts
images: [
  {
    src: "/images/solutions/nuqta-plus/sales-screen.png",
    alt: "شاشة البيع في نقطة بلس",
    width: 1280,
    height: 800,
  },
];
```

- `alt` وصف قصير بالعربي لما يظهر في الصورة فقط.
- `width` و `height` هما مقاس الصورة الحقيقي.
- لصورة ثانية أضف سطراً مثله بعد فاصلة.
- اجعل حجم كل صورة أقل من 500 كيلوبايت حتى تفتح الصفحة بسرعة.

### 5. إضافة برنامج جديد

في `app/data/solutions.ts` انسخ مجموعة برنامج كاملة (من `{` إلى `}`)، والصقها بعد آخر برنامج مع فاصلة بينهما، ثم غيّر:

- `slug`: اسم قصير بالإنكليزي بأحرف صغيرة وشَرطات، مثل `my-program`. يصير عنوان الصفحة `/solutions/my-program`.
- `nameAr` و `nameEn` و `tagline` و `description` و `features` و `priceIqd` و `platform` و `images`.
- `look`: ألوان البرنامج، `'violet'` أو `'sand'`.

يظهر البرنامج تلقائياً في الصفحة الرئيسية وصفحة الحلول والأسئلة الشائعة، وتُنشأ له صفحة خاصة.

### 6. بناء الموقع النهائي ورفعه

1. اكتب في الطرفية: `npm run generate`
2. يُنشأ المجلد `.output/public`. ارفع **محتوى** هذا المجلد (وليس المجلد نفسه) إلى أي استضافة مواقع ثابتة (Static Hosting).
3. الملف `404.html` داخل المجلد هو صفحة "الصفحة غير موجودة". أغلب الاستضافات تستخدمه تلقائياً؛ إذا لم تفعل، اختره صفحةً للخطأ 404 من إعدادات الاستضافة.

### 7. عند معرفة اسم النطاق (الدومين): `siteUrl`

عدّل ثلاثة ملفات، ثم أعد البناء بالأمر `npm run generate`. في الأمثلة التالية ضع نطاقك مكان `https://example.com`:

1. `app/data/company.ts` السطر 18: `siteUrl: 'https://example.com',` (مع `https://` وبدون `/` في النهاية). بهذا تحصل كل صفحة تلقائياً على رابط canonical و og:url ورابط كامل لصورة المشاركة.
2. `public/robots.txt`: أضف في آخره سطراً: `Sitemap: https://example.com/sitemap.xml`
3. `public/sitemap.xml`: ملف جديد فيه الصفحات الثماني العامة فقط. صفحات الوظائف والمدونة والخصوصية والشروط لا تُضاف.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc></url>
  <url><loc>https://example.com/about</loc></url>
  <url><loc>https://example.com/services</loc></url>
  <url><loc>https://example.com/solutions</loc></url>
  <url><loc>https://example.com/solutions/nuqta-plus</loc></url>
  <url><loc>https://example.com/solutions/dalaly</loc></url>
  <url><loc>https://example.com/contact</loc></url>
  <url><loc>https://example.com/faq</loc></url>
</urlset>
```

### 8. ما زال ينتظر صاحب الشركة

- **اسم النطاق (الدومين)**: مطلوب للخطوة 7 أعلاه.
- **طريقة تسعير البرنامجين**: هل السعر دفعة واحدة، أم لكل جهاز، أم اشتراك؟ وماذا يحصل العميل مقابل السعر؟ الموقع الآن يعرض المبلغ فقط.
- **مراجعة النصوص المكتوبة كمسودة**: الجملة تحت كل خدمة، ووصف كل برنامج وقائمة مميزاته، وقصة الشركة في صفحة "من نحن"، وفي الصفحة الرئيسية: العنوان الرئيسي ("من شغلك، إلى برنامج يشتغل.") والسطر الصغير فوقه والجملة تحته، والعناوين الصغيرة فوق كل فصل (مثل "برنامج جاهز")، وعنوان الفصل الثالث ("من نقطة البيع، إلى أرقام يومك.") والجملة تحته، وعنوان الخاتمة ("لم تجد برنامجك؟ نبرمجه لك.")، ونصوص أزرار التواصل، ووصف كل برنامج ومميزاته الأربع الظاهرة في الصفحة الرئيسية، ورسالة واتساب الجاهزة التي تفتحها أزرار "اسأل عنه على واتساب" و"استفسر عن هذه الخدمة" وزر "راسلنا على واتساب" في خاتمة الصفحة الرئيسية، وعبارتا حالة الدوام ("في الدوام الآن" و"خارج ساعات الدوام الآن")، وفي صفحة الحلول الجملة تحت العنوان ("برامج جاهزة للاستخدام، بأسعار معلنة.") وخاتمتها ("تحتاج حلاً غير موجود هنا؟" و"نبرمجه لك حسب طلبك.")، وخاتمة صفحتي الخدمات ومن نحن ("لديك مشروع أو فكرة؟" و"أخبرنا بما تحتاجه على واتساب أو بالبريد الإلكتروني.")، وفي صفحة الأسئلة الشائعة الجملة تحت العنوان ("إجابات عن خدماتنا وبرامجنا وأسعارها ودوامنا.") وخاتمتها ("لم تجد إجابتك؟" و"اسألنا مباشرة على واتساب.").
- **الفريق والرؤية والوظائف والمقالات**: لا يوجد نص لها بعد.
- **سياسة الخصوصية والشروط والأحكام**: يكتبها صاحب الشركة أو يوافق عليها (ومحامٍ إذا صار الموقع يجمع بيانات). الصفحتان الآن مؤقتتان ومخفيتان عن محركات البحث.
- **صور البرنامجين وأي فيديو**: لم تُرفع أي صورة أو فيديو بعد. طريقة الإضافة في الخطوة 4.
- **شعار عربي (Wordmark)**: الموجود هو الشعار اللاتيني فقط؛ اسم "كودل" يُكتب كنص.
- **نموذج تواصل وأدوات إحصاء الزوار**: غير موجودة لأن الموقع بلا خادم (Backend). لا تُضاف إلا بقرار من صاحب الشركة.

## V8.4 — Editorial Product Experience

Refines the native Workline design: directional hero image composition, wider product chapters, short screenshot selectors, a clear price/action row, compact service index, factual purchase evidence, a larger shared CTA, and full-width footer wordmark with particle interaction. Uses existing brand tokens and typed product/company data. Native scrolling replaces the previous Lenis mount; the dependency and superseded cinematic modules are deliberately retained for a separate cleanup. External hero artwork and license remain as documented above. Review the root route, solutions listing/detail, service routes, and shared layout in a real browser. This revision needs build, visual, responsive and accessibility checks before merge.

### V8.4.1 — rendered-site polish

Follow-up to the V8.4 browser review. The existing product screenshot assets and paths were confirmed in GitHub. Initial and explicitly selected product images now load eagerly in a stable stage, with an error/retry state instead of a blank panel. Headings no longer depend on scroll-linked opacity. Wider desktop layout, separated hero image/text, more compact product information and adjacent pricing/action, integrated screenshot navigation, stronger CTA proportions, and larger footer directory text. Build and browser validation remain required before merge; the original missing screenshot root cause has not been reproduced.

### V8.5 — continuing art direction

V8.5 is an iteration of the approved Workline design, not a final release. It improves the shared header and type scale, replaces the heavy screenshot frame with real thumbnail navigation, preserves initial image loading and retry handling, aligns product purchase information, gives open services a larger detail area and animated functional icon, and uses asymmetric evidence with direct links to the two real products. Hero depth is pointer-driven on fine pointers only, and heading content remains visible. Footer branding, all routes, semantic tokens, and native scrolling remain. The native build and visual/keyboard/responsive audit are still required; no 10/10 score is claimed.

### V8.6 — Spatial Editorial

Continues V8.5: shared isometric workplane behind the existing licensed hero artwork, keyboard-operable service exhibition with five original schematic illustrations, upright screenshot thumbnails with separate leaning selection shells, compact product purchasing areas, and direct customer questions answered from existing product and company data. No new dependencies, fabricated product imagery or claims. The review branch must pass the native Nuxt build, strict type check, responsive and browser interaction checks before merge.

## V9.5 — Folded Field review branch

The homepage is a native Vue port of the V9.5 interactive prototype: the exact desktop/mobile folded-material JPEGs and original WebGL2 fragment shader (with a defined square operation for negative inputs), seven scroll-driven scenes using the full-resolution local product assets, a typographic service selector, an editorial proof ledger, and a full-width CTA. The existing native inner pages, shared header/footer, cursor, company facts, local fonts and logo are preserved. No new dependencies. Shader Studio was an inspiration, not the source of an exported preset.

The shader is optional: static artwork is always present, motion is paused offscreen and in hidden tabs, context loss falls back to the static image, and reduced motion disables the shader and displays product screenshots inline. Native build, strict TypeScript, static generation, visual comparison and real GPU testing remain required before merge.

## V9.8 — Liquid Loom

Independent alternative to Lightfall and Obsidian Cut, based on merged V9.5. Inspired by Forma Liquid Particle Studio's published description of cursor-reactive particle sculpture and scroll morphing, plus Shader Studio's procedural WebGL approach. Live reference/editor not accessible in this session; original GLSL rather than template code or Studio export. A stratified 40,000-point desktop / 24,000-point portrait mesh forms a twisted ribbon, gathers over 2.15 seconds, deforms locally under pointer movement, then unfolds into a diagonal sheet on native scroll. No perpetual idle loop. Existing renderer extended for point primitives; responsive static SVG approximations and reduced-motion fallback. Original copy, brand, product scrollytelling and routes unchanged. Zero new dependencies.

GLSL vertex/fragment pair compiled, linked and rendered using local OpenGL ES 3 software rendering at 1440×820 and 390×780; pointer and scroll states also rendered. Nuxt build, browser integration, hardware GPU performance and accessibility remain unverified. No Claude subagent execution.

## V9.8.1 — Liquid Loom / Infinite Weave

Refinement of merged Liquid Loom. Periodic closed weave with matching seam coordinates, larger projected surface, tapered particle hems, viewport alpha falloff and softened sheet endpoints during scroll unfolding. Independent intro and ambient clocks, subtle breathing and traveling lime highlight, localized velocity-driven swirl and reversible scroll morph. 52,000 desktop / 30,000 portrait submitted points; idle rendering targets 30/24 fps with 60 fps target during entry and active interaction. Explicit pause/play control; reduced motion, hidden-tab/offscreen suspension and cleanup. Responsive static SVG approximations use the same closed geometry and opacity falloff. No new dependencies, unchanged brand, page structure and product storytelling. Local OpenGL ES 3 software rendering passed for desktop, portrait, pointer and scroll states. Native Nuxt build, browser integration, actual GPU frame times and accessibility still require verification.
