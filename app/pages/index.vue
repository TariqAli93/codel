<script setup lang="ts">
import { company, services } from '~/data/company'
import { solutions } from '~/data/solutions'

// The hero's call bar and the closing contact band run to the edge of the window,
// so this page draws its own widths instead of the layout's centred column.
definePageMeta({ fullWidth: true })

const title = 'الرئيسية / Home'
const description = 'كودل شركة برمجيات عراقية في بغداد: برمجة وتصميم المواقع وتطبيقات الهواتف، برامج جاهزة مثل نقطة بلس ودلالي، إدارة السيرفرات، وخدمات برمجية حسب الطلب.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })

// Structured data for search engines: only the facts in app/data/company.ts.
const organization = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: company.name,
  telephone: company.phones.main.tel.replace('tel:', ''),
  email: company.email,
  address: {
    '@type': 'PostalAddress',
    addressCountry: company.addressParts.countryCode,
    addressLocality: company.addressParts.city,
    streetAddress: company.addressParts.district
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: company.openingHours.days,
      opens: company.openingHours.opens,
      closes: company.openingHours.closes
    }
  ]
}

useHead({
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(organization) }]
})

const price = (value: number) => new Intl.NumberFormat('en-US').format(value)
</script>

<template>
  <div class="home">
    <section class="home__hero home__grid" aria-labelledby="home-title">
      <h1 id="home-title" class="home__title">
        <span class="home__title-line">برامج جاهزة لعملك،</span> <span class="home__title-line">وبرمجيات نبنيها على مقاسه.</span>
      </h1>

      <p class="home__lede">
        كودل شركة برمجيات عراقية في {{ company.addressParts.city }}. نقدّم برامج جاهزة للاستخدام،
        ونصمّم ونبرمج المواقع والتطبيقات والأنظمة حسب طلبك.
      </p>

      <a class="home__cta" :href="company.phones.main.whatsapp" target="_blank" rel="noopener noreferrer">
        <!-- Kept on one line: the spaces keep label and number apart in the link's accessible name. -->
        <span class="home__cta-content">
          <span class="home__cta-label">راسلنا على واتساب</span> <span class="home__cta-divider" aria-hidden="true" /> <span class="home__cta-number" dir="ltr">{{ company.phones.main.display }}</span>
        </span>
      </a>

      <p class="home__hero-more">
        <a class="home__link" href="#home-solutions">حلولنا الجاهزة وأسعارها</a>
      </p>
    </section>

    <section class="home__section home__grid" aria-labelledby="home-solutions">
      <div class="home__head">
        <h2 id="home-solutions" class="home__heading">حلولنا الجاهزة</h2>
        <p class="home__intro">اختر البرنامج الذي يناسب عملك، وإن لم تجده هنا نبرمجه لك.</p>
        <p class="home__more"><NuxtLink class="home__link" to="/solutions">كل الحلول</NuxtLink></p>
      </div>

      <ul class="home__products home__body">
        <li v-for="solution in solutions" :key="solution.slug" class="home__product">
          <div class="home__product-names">
            <h3 class="home__product-name">{{ solution.nameAr }}</h3>
            <p class="home__product-latin"><span dir="ltr">{{ solution.nameEn }}</span></p>
          </div>
          <p class="home__product-tagline">{{ solution.tagline }}</p>

          <div class="home__product-foot">
            <dl class="home__product-facts">
              <div class="home__product-fact">
                <dt class="home__visually-hidden">السعر</dt>
                <dd>
                  <span class="home__price"><span class="home__price-text">{{ price(solution.priceIqd) }} دينار عراقي</span></span>
                </dd>
              </div>
              <div class="home__product-fact">
                <dt>يعمل على</dt>
                <dd>{{ solution.platform }}</dd>
              </div>
            </dl>

            <NuxtLink class="home__product-link" :to="`/solutions/${solution.slug}`">
              <span>تفاصيل {{ solution.nameAr }}</span>
              <!-- Points left: forward in RTL. -->
              <svg class="home__arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M19 12H5m6-6-6 6 6 6" />
              </svg>
            </NuxtLink>
          </div>
        </li>
      </ul>
    </section>

    <section class="home__section home__grid" aria-labelledby="home-services">
      <div class="home__head">
        <h2 id="home-services" class="home__heading">خدماتنا</h2>
        <p class="home__intro">من تصميم الواجهة وبرمجتها إلى إدارة السيرفر الذي يشغّلها.</p>
        <p class="home__more"><NuxtLink class="home__link" to="/services">تفاصيل الخدمات</NuxtLink></p>
      </div>

      <ul class="home__services home__body">
        <li v-for="service in services" :key="service.title" class="home__service">
          <h3 class="home__service-title">{{ service.title }}</h3>
          <p class="home__service-text">{{ service.text }}</p>
        </li>
      </ul>
    </section>

    <section class="home__section home__grid" aria-labelledby="home-company">
      <div class="home__head">
        <h2 id="home-company" class="home__heading">شركة ناشئة من {{ company.addressParts.city }}</h2>
      </div>

      <div class="home__body">
        <ol class="home__timeline">
          <li class="home__stop">
            <span class="home__year">{{ company.founded.idea }}</span>
            <span class="home__stop-label">بداية الفكرة</span>
          </li>
          <li class="home__stop">
            <span class="home__year">{{ company.founded.launch }}</span>
            <span class="home__stop-label">انطلاق الشركة</span>
          </li>
        </ol>
        <p class="home__statement">هدفنا أن نبني برمجيات تخدم الأعمال في العراق.</p>
        <p class="home__more"><NuxtLink class="home__link" to="/about">قصتنا</NuxtLink></p>
      </div>
    </section>

    <section class="home__contact home__grid" aria-labelledby="home-contact">
      <div class="home__field">
        <h2 id="home-contact" class="home__contact-title">لديك مشروع أو فكرة؟</h2>
        <p class="home__contact-text">
          أخبرنا بما تحتاجه على واتساب أو بالبريد الإلكتروني. الدوام {{ company.hours.days }}، {{ company.hours.time }}.
        </p>
        <ul class="home__contact-actions">
          <li>
            <a class="home__contact-button" :href="company.phones.main.whatsapp" target="_blank" rel="noopener noreferrer">
              <span class="home__contact-button-inner">
                <span>راسلنا على واتساب</span> <span dir="ltr">{{ company.phones.main.display }}</span>
              </span>
            </a>
          </li>
          <li><a class="home__contact-link" :href="`mailto:${company.email}`" dir="ltr">{{ company.email }}</a></li>
          <li><NuxtLink class="home__contact-link" to="/contact">كل طرق التواصل</NuxtLink></li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
// The brand lean, and the counter-slant that turns a label back upright.
$lean: skewX(calc(var(--slant-angle) * -1));
$upright: skewX(var(--slant-angle));

// Page grid. Every section shares one set of column lines: a heading column (5/12) and a body
// column (7/12) inside the content width, plus outer tracks that reach the window edge so a bar
// can start on a column line and run off the page.
$content: calc(var(--container-max) - 2 * var(--page-gutter));
$gap: clamp(var(--space-6), 4vw, var(--space-8));
// The content width at this viewport. 100cqi is the width of .home, the query container below.
$inner: calc(min(100cqi - 2 * var(--page-gutter), #{$content}) - #{$gap});
// Above this width the heading and body columns sit side by side.
$wide: 64em;
// Above this width the outer track is wide enough for the contact band's slanted end.
$band-lean: 80em;

// Type scale: one step per role, and section headings always outrank product names.
$text-display: clamp(2.25rem, 1rem + 5.2vw, 5.5rem); // h1; its first line stays whole on a 375px phone
$text-title: clamp(2.125rem, 1.45rem + 2.8vw, 3.75rem); // h2
$text-name: clamp(1.875rem, 1.35rem + 2.2vw, 3.125rem); // product names, years
$text-lead: clamp(1.1875rem, 1.05rem + 0.6vw, 1.5rem); // service titles, taglines, the goal
$text-large: clamp(1.0625rem, 1rem + 0.3vw, 1.25rem); // lede and contact text

.home {
  container-type: inline-size;

  // ---------------------------------------------------------------------------
  // Shared section pieces
  // ---------------------------------------------------------------------------

  &__grid {
    display: grid;
    // Fallback without container units: the two inner tracks share the space.
    grid-template-columns:
      [full-start] minmax(var(--page-gutter), 1fr)
      [content-start] minmax(0, calc((#{$content} - #{$gap}) * 5 / 12))
      [head-end] $gap
      [body-start] minmax(0, calc((#{$content} - #{$gap}) * 7 / 12))
      [content-end] minmax(var(--page-gutter), 1fr)
      [full-end];
    // Exact 5/12 and 7/12 of the content width at every viewport.
    grid-template-columns:
      [full-start] minmax(var(--page-gutter), 1fr)
      [content-start] calc(#{$inner} * 5 / 12)
      [head-end] $gap
      [body-start] calc(#{$inner} * 7 / 12)
      [content-end] minmax(var(--page-gutter), 1fr)
      [full-end];

    > * {
      grid-column: content-start / content-end;
    }
  }

  &__section {
    padding-block-start: clamp(var(--space-8), 8vw, var(--space-10));
  }

  // Heading, intro and link read as one group. On wide screens the group holds the heading
  // column and stays in view while the body column scrolls past it.
  &__head {
    margin-block-end: clamp(var(--space-6), 5vw, var(--space-7));

    @media (width >= $wide) {
      position: sticky;
      inset-block-start: calc(var(--header-height) + var(--space-7));
      grid-column: content-start / head-end;
      align-self: start;
      margin-block-end: 0;
    }
  }

  &__body {
    @media (width >= $wide) {
      grid-column: body-start / content-end;
    }
  }

  &__heading {
    margin: 0 0 var(--space-3);
    font-size: $text-title;
    line-height: 1.25;
    font-weight: 800;
  }

  &__intro {
    max-inline-size: 30rem;
    color: var(--text-muted);
  }

  &__more {
    margin-block-start: var(--space-2);
  }

  // Standalone text links: 44px touch target (WCAG 2.5.5).
  &__link {
    display: inline-flex;
    align-items: center;
    min-block-size: 44px;
    font-weight: 600;
    text-decoration-color: color-mix(in srgb, currentColor 45%, transparent);
    transition: text-decoration-color var(--duration-fast) var(--ease-out);

    @media (hover: hover) {
      &:hover {
        text-decoration-color: currentColor;
      }
    }
  }

  &__visually-hidden {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  // ---------------------------------------------------------------------------
  // Hero
  // ---------------------------------------------------------------------------

  &__hero {
    padding-block: clamp(var(--space-8), 8vw, var(--space-10)) clamp(var(--space-5), 3vw, var(--space-7));
    // The call bar's slanted far end runs past the window edge.
    overflow: clip;
  }

  &__title {
    margin-block-end: clamp(var(--space-5), 3.5vw, var(--space-7));
    font-size: $text-display;
    line-height: 1.22;
    font-weight: 800;
  }

  &__title-line {
    display: block;
    text-wrap: balance;
  }

  &__lede {
    max-inline-size: 34rem;
    font-size: $text-large;
    line-height: 1.85;
    color: var(--text-muted);
  }

  // The main call: a lime bar with the brand lean. It starts on a column line and runs off the
  // window edge; on wide screens that line is the one every section's body column starts on.
  &__cta {
    grid-column: content-start / full-end;
    display: flex;
    align-items: center;
    min-block-size: clamp(4rem, 3.2rem + 2vw, 5.25rem);
    margin-block-start: var(--space-6);
    // Past the edge, so the slanted end never shows; the hero clips it.
    margin-inline-end: calc(var(--space-7) * -1);
    padding-inline: var(--space-6);
    border-radius: var(--radius-sm);
    background-color: var(--primary);
    color: var(--on-primary);
    text-decoration: none;
    transform: $lean;
    transform-origin: left center; // inline end in RTL: the bar grows out of the window edge
    transition: background-color var(--duration-fast) var(--ease-out);

    @media (hover: hover) {
      &:hover {
        background-color: var(--primary-hover);
      }
    }

    &:active {
      background-color: var(--primary-active);
    }
  }

  &__cta-content {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-4);
    padding-block: var(--space-3);
    transform: $upright;
    transition: translate var(--duration-base) var(--ease-out);

    // Leans forward a step on hover (forward is to the left in RTL).
    @media (hover: hover) {
      .home__cta:hover & {
        translate: calc(var(--space-2) * -1) 0;
      }
    }
  }

  &__cta-label {
    font-family: var(--font-display);
    font-size: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);
    font-weight: 700;
    line-height: 1.4;
  }

  &__cta-divider {
    inline-size: 2px;
    block-size: 1.375rem;
    border-radius: var(--radius-pill);
    background-color: currentColor;
    opacity: 0.35;
    transform: $lean;
  }

  &__cta-number {
    font-size: 1.0625rem;
    font-weight: 500;
  }

  &__hero-more {
    margin-block-start: var(--space-3);
  }

  // Lede in the heading column, call bar from the body column to the window edge.
  @media (width >= $wide) {
    &__lede,
    &__hero-more {
      grid-column: content-start / head-end;
    }

    &__lede {
      grid-row: 2;
      align-self: center;
    }

    &__cta {
      grid-column: body-start / full-end;
      grid-row: 2;
      align-self: center;
      margin-block-start: 0;
    }

    &__hero-more {
      grid-row: 3;
    }
  }

  // Narrow phones: number under the label, no divider.
  @media (width < 26em) {
    &__cta-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 0;
    }

    &__cta-divider {
      display: none;
    }
  }

  // ---------------------------------------------------------------------------
  // Ready-made products
  // ---------------------------------------------------------------------------

  &__products {
    display: grid;
    gap: var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__product {
    position: relative;
    padding: clamp(var(--space-5), 3vw, var(--space-7));
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background-color: var(--surface);
    transition: background-color var(--duration-base) var(--ease-out);

    @media (hover: hover) {
      &:hover {
        background-color: var(--surface-raised);
      }
    }

    // The whole entry is the link's hit area; show its focus on the entry as well.
    &:has(.home__product-link:focus-visible) {
      border-color: var(--focus);
    }
  }

  // The Latin name follows the Arabic one on its baseline: one name, two scripts.
  &__product-names {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--space-4);
  }

  &__product-name {
    margin: 0;
    font-size: $text-name;
    line-height: 1.25;
    font-weight: 800;
  }

  &__product-latin {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  &__product-tagline {
    margin-block-start: var(--space-2);
    font-size: $text-lead;
    font-weight: 500;
    line-height: 1.55;
  }

  // Price and platform, then the way in. Stacked in every entry, so a longer product name
  // never moves its link to a different place from the others.
  &__product-foot {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
    margin-block-start: var(--space-5);
  }

  &__product-facts {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-6);
  }

  &__product-fact {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);

    dt {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    dd {
      font-weight: 600;
    }
  }

  // Price tag: lime with the brand lean, the figure turned back upright.
  &__price {
    display: inline-flex;
    padding: var(--space-1) var(--space-4);
    border-radius: var(--radius-sm);
    background-color: var(--accent);
    color: var(--on-accent);
    transform: $lean;
  }

  &__price-text {
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.5;
    font-variant-numeric: tabular-nums;
    transform: $upright;
  }

  &__product-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-block-size: 44px;
    font-weight: 600;
    text-decoration: none;

    // Stretches the link over the whole entry.
    &::after {
      content: '';
      position: absolute;
      inset: 0;
    }
  }

  // Stroke close to the weight of the label beside it.
  &__arrow {
    flex: none;
    inline-size: 1.25em;
    block-size: 1.25em;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: translate var(--duration-base) var(--ease-out);

    // Steps forward while the pointer is anywhere on the entry.
    @media (hover: hover) {
      .home__product:hover & {
        translate: calc(var(--space-1) * -1) 0;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Services
  // ---------------------------------------------------------------------------

  // Grouped by space alone: the gap between services is several times the gap inside one.
  &__services {
    display: grid;
    gap: clamp(var(--space-6), 3vw, var(--space-7));
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__service-title {
    display: flex;
    gap: var(--space-4);
    margin: 0;
    font-size: $text-lead;
    line-height: 1.45;
    font-weight: 700;

    // Lime lean marker in place of a number: the services are not a sequence.
    // Centred on the first line, so a title that wraps keeps it at its start.
    &::before {
      content: '';
      flex: none;
      inline-size: 0.5rem;
      block-size: 0.875em;
      margin-block-start: calc((1lh - 0.875em) / 2);
      border-radius: 2px;
      background-color: var(--accent);
      transform: $lean;
    }
  }

  // Hangs under the title text, clear of the marker.
  &__service-text {
    max-inline-size: 36rem;
    margin-block-start: var(--space-2);
    padding-inline-start: calc(0.5rem + var(--space-4));
    color: var(--text-muted);
  }

  // ---------------------------------------------------------------------------
  // Company
  // ---------------------------------------------------------------------------

  // Idea, then launch: a real sequence, joined by a leaning bar.
  &__timeline {
    display: grid;
    grid-template-columns: auto minmax(1.5rem, 1fr) auto;
    align-items: center;
    gap: clamp(var(--space-3), 3vw, var(--space-5));
    max-inline-size: 34rem;
    margin: 0;
    padding: 0;
    list-style: none;
    view-timeline-name: --home-timeline;

    &::before {
      content: '';
      grid-column: 2;
      grid-row: 1;
      block-size: 6px;
      border-radius: var(--radius-pill);
      background-color: var(--accent);
      transform: $lean;
      transform-origin: right center; // inline start in RTL: the bar runs from the idea to the launch
    }
  }

  &__stop {
    display: flex;
    flex-direction: column;
    grid-row: 1;

    &:first-child {
      grid-column: 1;
    }

    &:last-child {
      grid-column: 3;
    }
  }

  &__year {
    font-family: var(--font-display);
    font-size: $text-name;
    font-weight: 800;
    line-height: 1.2;
  }

  &__stop-label {
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  &__statement {
    max-inline-size: 30rem;
    margin-block-start: var(--space-6);
    font-size: $text-lead;
    font-weight: 500;
    line-height: 1.6;
    text-wrap: balance;
  }

  // ---------------------------------------------------------------------------
  // Contact band
  // ---------------------------------------------------------------------------

  &__contact {
    padding-block: clamp(var(--space-8), 8vw, var(--space-10)) var(--space-8);
    overflow: clip;
  }

  &__field {
    // The band is lime: dark text, and a dark focus ring so it stays visible.
    --focus: var(--on-accent);

    position: relative;
    isolation: isolate;
    grid-column: full-start / full-end;
    // Below the container width the outer track is one gutter, so the text keeps the content edge.
    padding: clamp(var(--space-7), 7vw, var(--space-9)) var(--page-gutter);
    color: var(--on-accent);

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      background-color: var(--accent);
    }

    // Leans like the hero bar once there is room for its slanted start; the far end runs past
    // the window edge.
    @media (width >= $band-lean) {
      grid-column: content-start / full-end;
      padding-inline: clamp(var(--space-7), 6vw, var(--space-9)) var(--space-7);

      &::before {
        inset-inline-end: calc(var(--space-9) * -1);
        border-radius: var(--radius-lg);
        transform: $lean;
      }
    }
  }

  &__contact-title {
    margin: 0 0 var(--space-4);
    font-size: $text-title;
    line-height: 1.25;
    font-weight: 800;
  }

  &__contact-text {
    max-inline-size: 36rem;
    font-size: $text-large;
  }

  &__contact-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-6);
    margin-block-start: var(--space-6);
    padding: 0;
    list-style: none;
  }

  &__contact-button {
    display: inline-flex;
    align-items: center;
    min-block-size: var(--control-lg);
    padding-inline: var(--space-6);
    border-radius: var(--radius-sm);
    background-color: var(--on-accent);
    color: var(--accent);
    font-weight: 600;
    text-decoration: none;
    transform: $lean;
    transition:
      background-color var(--duration-fast) var(--ease-out),
      scale var(--duration-fast) var(--ease-out);

    @media (hover: hover) {
      &:hover {
        background-color: var(--surface-raised);
      }
    }

    &:active {
      scale: 0.96;
    }
  }

  &__contact-button-inner {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0 var(--space-3);
    padding-block: var(--space-2);
    transform: $upright;
  }

  &__contact-link {
    display: inline-flex;
    align-items: center;
    min-block-size: 44px;
    font-weight: 600;
    color: var(--on-accent);
    text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
    transition: text-decoration-color var(--duration-fast) var(--ease-out);

    @media (hover: hover) {
      &:hover {
        text-decoration-color: currentColor;
      }
    }
  }
}

// -----------------------------------------------------------------------------
// Motion. One load sequence for the hero, and two bars that draw as they scroll into view.
// All of it is optional: nothing here runs under prefers-reduced-motion, and without
// scroll-driven animation support the bars are simply drawn.
// -----------------------------------------------------------------------------

@media (prefers-reduced-motion: no-preference) {
  .home__title-line {
    animation: home-rise var(--duration-entrance) var(--ease-out) both;

    & + & {
      animation-delay: var(--stagger);
    }
  }

  .home__lede {
    animation: home-rise var(--duration-entrance) var(--ease-out) calc(var(--stagger) * 2) both;
  }

  .home__cta {
    animation: home-wipe var(--duration-entrance) var(--ease-out) calc(var(--stagger) * 3) both;
  }

  .home__cta-content {
    animation: home-fade var(--duration-slow) var(--ease-out) calc(var(--stagger) * 3 + var(--duration-entrance) * 0.5) both;
  }

  .home__hero-more {
    animation: home-fade var(--duration-slow) var(--ease-out) calc(var(--stagger) * 6) both;
  }

  @supports (animation-timeline: view()) {
    .home__timeline::before {
      animation: home-wipe linear both;
      animation-timeline: --home-timeline;
      animation-range: entry 30% cover 50%;
    }

    .home__service {
      view-timeline-name: --home-service;
    }

    .home__service-title::before {
      transform-origin: center bottom;
      animation: home-grow linear both;
      animation-timeline: --home-service;
      animation-range: entry 40% cover 25%;
    }
  }
}

@keyframes home-rise {
  from {
    opacity: 0;
    transform: translateY(0.3em);
  }
}

@keyframes home-fade {
  from {
    opacity: 0;
  }
}

@keyframes home-wipe {
  from {
    scale: 0 1;
  }
}

@keyframes home-grow {
  from {
    scale: 1 0;
  }
}
</style>
