# Codel - كودل

Starter website project for **Codel (كودل)**, an Iraqi software company.
Brand layer is in (colors, fonts, logo, favicon) and the main pages carry real Arabic content: services, the two ready-made products with prices, working hours, contact details and the company story. Careers, blog, privacy and terms are still placeholders. No components yet.

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

| Route                | Page                       | File                              |
| -------------------- | -------------------------- | --------------------------------- |
| `/`                  | Home                       | `app/pages/index.vue`             |
| `/about`             | About                      | `app/pages/about.vue`             |
| `/services`          | Services                   | `app/pages/services.vue`          |
| `/solutions`         | Solutions (listing)        | `app/pages/solutions/index.vue`   |
| `/solutions/[slug]`  | Solution detail (dynamic)  | `app/pages/solutions/[slug].vue`  |
| `/contact`           | Contact                    | `app/pages/contact.vue`           |
| `/faq`               | FAQ                        | `app/pages/faq.vue`               |
| `/careers`           | Careers (additional)       | `app/pages/careers.vue`           |
| `/blog`              | Blog (additional)          | `app/pages/blog.vue`              |
| `/privacy`           | Privacy Policy (additional)| `app/pages/privacy.vue`           |
| `/terms`             | Terms & Conditions (additional) | `app/pages/terms.vue`        |

Notes:

- Real content: `/`, `/about`, `/services`, `/solutions`, `/solutions/[slug]`, `/contact`, `/faq`. Placeholders: `/careers`, `/blog`, `/privacy`, `/terms`; they carry `robots: noindex` and stay out of the navigation and any sitemap.
- Unknown addresses (including an unknown `/solutions/<slug>`) show `app/error.vue`, the branded error page, inside the default layout. The server build answers them with status 404; the static build ships it as `404.html`.
- Structured data (JSON-LD): a `ProfessionalService` block on the home page and a `Product` block (name, price in IQD) on each product page, built from the two data files.
- `/solutions/[slug]` serves the products in `app/data/solutions.ts` (`nuqta-plus`, `dalaly`); any other slug returns a 404. `npm run generate` renders them because `/solutions` links to each one.
- Company facts (services, phones, email, address, hours) live in `app/data/company.ts`; the ready-made products (names, prices, features, images) live in `app/data/solutions.ts`. Edit those two files to change content. `CLAUDE.md` lists every fact.
- Product screenshots go in `public/images/solutions/<slug>/` and are listed in the product's `images` array.

## Dependencies

- `nuxt` (pinned to exactly `4.6.4`), `vue`, `vue-router`: same as the official Nuxt 4 starter.
- `sass` (dev): the one addition, required for Nuxt/Vite to compile SCSS.

## Brand assets

- Design tokens (colors, spacing, radius, shadow, slant) live in `app/assets/scss/main.scss` as CSS custom properties. They mirror the Codel design system: dark theme active, light theme declared but not switched on. The page gutter, the motion tokens (durations, easing, stagger), the type scale, the point sizes, the stroke and the lime glow are site-level additions in the same file.
- Imagery: the products' real screens. The hero layers a Nuqta Plus screen and a Dalaly screen in perspective, lit in the products' colours, over an engineering grid (phones get focused crops); each product has a showcase with two real screenshots (`public/images/solutions/<slug>/`, framed by `app/components/ProductWindow.vue`) in the product's own colours. Buttons, tags and decorative bars lean (the brand slant); lime marks what you act on and what is live now.
- Motion: the hero's entrance is plain CSS (text first, then the screens). GSAP with ScrollTrigger and SplitText, loaded on the client, adds the rest: the hero's screens follow the pointer by depth and drift apart on scroll, section headings rise word by word, product screens open like a shutter and tilt toward the pointer, the service tiles rise row by row, the years bar draws and the contact band sweeps in. All of it is off under `prefers-reduced-motion: reduce`, and anything that takes keyboard focus is shown in its end state.
- Fonts are self-hosted in `public/fonts/`: Rubik (display and headings) and Readex Pro (body and UI), as subset variable woff2 files for Arabic and Latin. Both are licensed under the SIL Open Font License; the license texts are beside the files.
- Logo files are in `public/brand/` (full logo and symbol, each in white, ink and lime). The favicon is `public/favicon.svg`: the symbol, ink on light browser themes and lime on dark ones.
- `public/brand/og.png` (1200×630) is the share image: the white logo on the dark `--bg`, rendered from `codel-full-white.svg`.

## Project layout

```
app/
  app.vue                  # NuxtLayout + NuxtPage
  error.vue                # branded 404 / error page (uses the default layout)
  layouts/default.vue      # the only layout (skip link, sticky header with a small-screen menu, main, footer, site-wide share tags)
  pages/                   # one file per route
  data/                    # company.ts and solutions.ts: the facts the pages show
  assets/scss/main.scss    # font faces, design tokens, reset and base styles
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

| ماذا تريد أن تغيّر | السطر |
| --- | --- |
| الرقم الأساسي (هاتف وواتساب) | 19 إلى 21 |
| رقم الواتساب الثاني | 25 و 26 |
| البريد الإلكتروني | 29 |
| العنوان | 30، ونفس العنوان مقسّماً في السطر 32 (غيّر الاثنين معاً) |
| ساعات الدوام | 33 (النص الذي يظهر للزائر)، ونفس الساعات بنظام 24 ساعة في السطر 35 (غيّر الاثنين معاً) |

- كل رقم يُكتب بثلاث صيغ. مثال للرقم 07824082356: الصيغة الظاهرة `'0782 408 2356'`، ورابط الاتصال `'tel:+9647824082356'`، ورابط واتساب `'https://wa.me/9647824082356'` (احذف الصفر الأول وضع 964 قبله).
- غيّر الكلام بين علامتي `' '` فقط، ولا تحذف الفواصل أو الأقواس.
- إذا تغيّرت أرقام الأسطر، ابحث في الملف عن الكلمة (مثلاً `email`).

### 3. تغيير سعر برنامج: الملف `app/data/solutions.ts`

- نقطة بلس: السطر 47، `priceIqd: 175000`
- دلالي: السطر 68، `priceIqd: 150000`

اكتب الرقم بدون فواصل. يظهر السعر تلقائياً بصيغة "175,000 دينار عراقي" في صفحة الحلول وصفحة البرنامج والأسئلة الشائعة.

### 4. إضافة صورة لبرنامج

1. ضع الصورة في المجلد `public/images/solutions/nuqta-plus/` (لنقطة بلس) أو `public/images/solutions/dalaly/` (لدلالي). أنشئ المجلد إذا لم يكن موجوداً. اسم الملف بأحرف إنكليزية صغيرة بدون مسافات، مثل `sales-screen.png`.
2. اعرف مقاس الصورة بالبكسل: في ويندوز اضغط على الصورة بالزر الأيمن ← خصائص ← التفاصيل ← الأبعاد.
3. في `app/data/solutions.ts` أضف الصورة داخل `images` (السطر 49 لنقطة بلس، السطر 70 لدلالي) بنفس شكل الصور الموجودة فيه:

```ts
images: [
  { src: '/images/solutions/nuqta-plus/sales-screen.png', alt: 'شاشة البيع في نقطة بلس', width: 1280, height: 800 }
]
```

- `alt` وصف قصير بالعربي لما يظهر في الصورة فقط.
- `width` و `height` هما مقاس الصورة الحقيقي.
- لصورة ثانية أضف سطراً مثله بعد فاصلة.
- اجعل حجم كل صورة أقل من 500 كيلوبايت حتى تفتح الصفحة بسرعة.

### 5. إضافة برنامج جديد

في `app/data/solutions.ts` انسخ مجموعة برنامج كاملة (من `{` إلى `}`)، والصقها بعد آخر برنامج مع فاصلة بينهما، ثم غيّر:

- `slug`: اسم قصير بالإنكليزي بأحرف صغيرة وشَرطات، مثل `my-program`. يصير عنوان الصفحة `/solutions/my-program`.
- `nameAr` و `nameEn` و `tagline` و `description` و `features` و `priceIqd` و `platform` و `images`.

يظهر البرنامج تلقائياً في الصفحة الرئيسية وصفحة الحلول والأسئلة الشائعة، وتُنشأ له صفحة خاصة.

### 6. بناء الموقع النهائي ورفعه

1. اكتب في الطرفية: `npm run generate`
2. يُنشأ المجلد `.output/public`. ارفع **محتوى** هذا المجلد (وليس المجلد نفسه) إلى أي استضافة مواقع ثابتة (Static Hosting).
3. الملف `404.html` داخل المجلد هو صفحة "الصفحة غير موجودة". أغلب الاستضافات تستخدمه تلقائياً؛ إذا لم تفعل، اختره صفحةً للخطأ 404 من إعدادات الاستضافة.

### 7. عند معرفة اسم النطاق (الدومين): `siteUrl`

عدّل ثلاثة ملفات، ثم أعد البناء بالأمر `npm run generate`. في الأمثلة التالية ضع نطاقك مكان `https://example.com`:

1. `app/data/company.ts` السطر 14: `siteUrl: 'https://example.com',` (مع `https://` وبدون `/` في النهاية). بهذا تحصل كل صفحة تلقائياً على رابط canonical و og:url ورابط كامل لصورة المشاركة.
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
- **مراجعة النصوص المكتوبة كمسودة**: الجملة تحت كل خدمة، ووصف كل برنامج وقائمة مميزاته، وقصة الشركة في صفحة "من نحن"، وفي الصفحة الرئيسية: العنوان الرئيسي والسطر الصغير فوقه والجملة تحته، والجملتان تحت عنواني "حلولنا الجاهزة" و"خدماتنا"، ونصوص أزرار التواصل، ووصف كل برنامج ومميزاته الأربع الظاهرة في الصفحة الرئيسية، ورسالة واتساب الجاهزة التي يفتحها زر "اسأل عنه على واتساب"، وعبارتا حالة الدوام ("في الدوام الآن" و"خارج ساعات الدوام الآن").
- **الفريق والرؤية والوظائف والمقالات**: لا يوجد نص لها بعد.
- **سياسة الخصوصية والشروط والأحكام**: يكتبها صاحب الشركة أو يوافق عليها (ومحامٍ إذا صار الموقع يجمع بيانات). الصفحتان الآن مؤقتتان ومخفيتان عن محركات البحث.
- **صور البرنامجين وأي فيديو**: لم تُرفع أي صورة أو فيديو بعد. طريقة الإضافة في الخطوة 4.
- **شعار عربي (Wordmark)**: الموجود هو الشعار اللاتيني فقط؛ اسم "كودل" يُكتب كنص.
- **نموذج تواصل وأدوات إحصاء الزوار**: غير موجودة لأن الموقع بلا خادم (Backend). لا تُضاف إلا بقرار من صاحب الشركة.
