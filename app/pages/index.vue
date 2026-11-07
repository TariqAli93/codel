<script setup lang="ts">
import { company, services } from "~/data/company";
import { solutions } from "~/data/solutions";

// The call bars run off the edge of the window, so this page draws its own full-width sections
// instead of the layout's centred column.
definePageMeta({ fullWidth: true });

const title = "الرئيسية / Home";
const description =
  "كودل شركة برمجيات عراقية في بغداد: برمجة وتصميم المواقع وتطبيقات الهواتف، برامج جاهزة مثل نقطة بلس ودلالي، إدارة السيرفرات، وخدمات برمجية حسب الطلب.";

useSeoMeta({ title, description, ogTitle: title, ogDescription: description });

// Structured data for search engines: only the facts in app/data/company.ts.
const organization = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: company.name,
  telephone: company.phones.main.tel.replace("tel:", ""),
  email: company.email,
  address: {
    "@type": "PostalAddress",
    addressCountry: company.addressParts.countryCode,
    addressLocality: company.addressParts.city,
    streetAddress: company.addressParts.district,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: company.openingHours.days,
      opens: company.openingHours.opens,
      closes: company.openingHours.closes,
    },
  ],
};

useHead({
  script: [
    { type: "application/ld+json", innerHTML: JSON.stringify(organization) },
  ],
});

const price = (value: number) => new Intl.NumberFormat("en-US").format(value);

// The same prefilled question as on /solutions/<slug>.
const whatsappAsk = (nameAr: string) =>
  `${company.phones.main.whatsapp}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن ${nameAr}`)}`;

// Open or closed right now, on Baghdad time. Worked out in the browser after mount only, so the
// server-rendered page never carries a time; until then (and without JavaScript) nothing is shown.
const openNow = ref<boolean | null>(null);

onMounted(() => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Baghdad",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  // Both sides are zero-padded HH:MM, so they compare as strings.
  const time = `${part("hour")}:${part("minute")}`;
  const { days, opens, closes } = company.openingHours;
  openNow.value =
    days.includes(part("weekday")) && time >= opens && time < closes;
});
</script>

<template>
  <div class="home">
    <section class="home__hero" aria-labelledby="home-title">
      <div class="home__statement">
        <p class="home__kicker">
          شركة برمجيات عراقية في {{ company.addressParts.city }}
        </p>
        <h1 id="home-title" class="home__title">
          <span class="home__title-line">برامج جاهزة،</span>
          <span class="home__title-line">وبرمجيات على مقاسك.</span>
        </h1>
      </div>

      <ActionLink
        look="bar"
        :to="company.phones.main.whatsapp"
        new-tab
        label="راسلنا على واتساب"
        :detail="company.phones.main.display"
        class="home__call home__call--hero"
      />
    </section>

    <section
      id="ready"
      class="home__section home__section--ready"
      aria-labelledby="ready-title"
    >
      <div class="home__head home__head--split">
        <h2 id="ready-title" class="home__heading">حلولنا الجاهزة</h2>
        <div class="home__head-aside">
          <p class="home__intro">
            اختر البرنامج الذي يناسب عملك، وإن لم تجده هنا نبرمجه لك.
          </p>
          <p class="home__more">
            <NuxtLink class="home__link" to="/solutions">كل الحلول</NuxtLink>
          </p>
        </div>
      </div>

      <ul role="list" class="home__plates">
        <li
          v-for="solution in solutions"
          :key="solution.slug"
          class="home__plate"
        >
          <div class="home__plate-head">
            <div class="home__identity">
              <div class="home__names">
                <h3 class="home__name">{{ solution.nameAr }}</h3>
                <p class="home__latin">
                  <span dir="ltr">{{ solution.nameEn }}</span>
                </p>
              </div>
              <p class="home__chip">
                <span class="home__chip-text"
                  >يعمل على {{ solution.platform }}</span
                >
              </p>
            </div>
          </div>
          <p class="home__tagline">{{ solution.tagline }}</p>
          <p class="home__price">
            <span class="home__price-figure">{{
              price(solution.priceIqd)
            }}</span>
            <span class="home__price-unit">دينار عراقي</span>
          </p>
          <div class="home__actions">
            <ActionLink
              :to="whatsappAsk(solution.nameAr)"
              new-tab
              label="اسأل عنه على واتساب"
              :hidden-suffix="solution.nameAr"
            />
            <NuxtLink class="home__link" :to="`/solutions/${solution.slug}`"
              >تفاصيل {{ solution.nameAr }}</NuxtLink
            >
          </div>
        </li>
      </ul>
    </section>

    <section
      id="services"
      class="home__section home__section--services"
      aria-labelledby="services-title"
    >
      <div class="home__head home__head--stacked">
        <h2 id="services-title" class="home__heading">خدماتنا</h2>
        <p class="home__intro">
          من تصميم الواجهة وبرمجتها إلى إدارة السيرفر الذي يشغّلها.
        </p>
        <p class="home__more">
          <NuxtLink class="home__link" to="/services">تفاصيل الخدمات</NuxtLink>
        </p>
      </div>

      <!-- The frame clips the separator slot that starts each line (see .home__flow). -->
      <div class="home__flow-frame">
        <ul role="list" class="home__flow">
          <li
            v-for="service in services"
            :key="service.title"
            class="home__flow-item"
          >
            {{ service.title }}
          </li>
        </ul>
      </div>
    </section>

    <section
      id="company"
      class="home__section home__section--company"
      aria-labelledby="company-title"
    >
      <div class="home__company-text">
        <h2 id="company-title" class="home__heading">
          شركة ناشئة من {{ company.addressParts.city }}
        </h2>
        <p class="home__goal">هدفنا أن نبني برمجيات تخدم الأعمال في العراق.</p>
        <p class="home__more">
          <NuxtLink class="home__link" to="/about">قصتنا</NuxtLink>
        </p>
      </div>

      <!-- Each year kept on one line: the spaces keep figure and label apart when read aloud. -->
      <ol role="list" class="home__years">
        <li class="home__year home__year--idea">
          <span class="home__year-figure">{{ company.founded.idea }}</span>
          <span class="home__year-node" aria-hidden="true" />
          <span class="home__year-label">بداية الفكرة</span>
        </li>
        <li class="home__year home__year--launch">
          <span class="home__year-figure">{{ company.founded.launch }}</span>
          <span class="home__year-node" aria-hidden="true" />
          <span class="home__year-label">انطلاق الشركة</span>
        </li>
      </ol>
    </section>

    <section
      id="contact"
      class="home__section home__closing"
      aria-labelledby="contact-title"
    >
      <div class="home__band">
        <h2 id="contact-title" class="home__heading">لديك مشروع أو فكرة؟</h2>
        <p class="home__hours">
          أخبرنا بما تحتاجه على واتساب أو بالبريد الإلكتروني. الدوام
          {{ company.hours.days }}، {{ company.hours.time }}.
        </p>
        <div class="home__status-slot">
          <p
            v-if="openNow !== null"
            class="home__status"
            :class="{ 'home__status--open': openNow }"
          >
            <span class="home__status-point" aria-hidden="true" />
            {{ openNow ? "في الدوام الآن" : "خارج ساعات الدوام الآن" }}
          </p>
        </div>

        <ul role="list" class="home__channels">
          <li>
            <ActionLink
              look="ink"
              :to="company.phones.main.whatsapp"
              new-tab
              label="راسلنا على واتساب"
              :detail="company.phones.main.display"
            />
          </li>
          <li>
            <a class="home__link" :href="company.phones.main.tel"
              >أو اتصل
              <span dir="ltr">{{ company.phones.main.display }}</span></a
            >
          </li>
          <li>
            <a class="home__link" :href="`mailto:${company.email}`" dir="ltr">{{
              company.email
            }}</a>
          </li>
          <li>
            <NuxtLink class="home__link" to="/contact">كل طرق التواصل</NuxtLink>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
// The brand lean, and the counter-slant that turns a label back upright.
$lean: skewX(calc(var(--slant-angle) * -1));
$upright: skewX(var(--slant-angle));

// From the window edge to the content column: the same column as the header bar's.
// 100cqi is the width of .home, the query container below (the window without its scrollbar).
$edge: max(
  var(--page-gutter),
  calc((100cqi - var(--container-max)) / 2 + var(--page-gutter))
);

// Below this width everything stacks; from here plates pair up and the services run as one line.
$medium: 48em;
// From here the hero fills the first screen, the call bars start 42% into the column, and section
// heads and the company section split.
$wide: 64em;
// Below this width of a plate's content the platform chip moves under the names (about a 28rem plate).
$plate-narrow: 24rem;
// From here the contact band starts on the content edge with the brand lean.
$band-lean: 80em;

.home {
  container-type: inline-size;

  // ---------------------------------------------------------------------------
  // Shared section pieces
  // ---------------------------------------------------------------------------

  // Every section spans the window; its padding sets the content column.
  &__hero,
  &__section {
    padding-inline: $edge;
  }

  // Each section keeps its own distance from the one before: the rhythm varies on purpose.
  &__section--ready,
  &__section--company {
    padding-block-start: clamp(var(--space-9), 9vw, var(--space-10));
  }

  &__section--services {
    padding-block-start: clamp(var(--space-8), 6vw, var(--space-9));
  }

  &__heading {
    margin: 0 0 var(--space-3);
    font-size: var(--text-title);
    line-height: 1.25;
    font-weight: 800;
  }

  &__intro {
    max-inline-size: 30rem;
    color: var(--text-muted);
    text-wrap: balance;
  }

  &__more {
    margin-block-start: var(--space-2);
  }

  // Standalone links: 44px touch target (WCAG 2.5.5). Colour and underline come from the base link rule.
  // The gap stands in for the space a flex box drops between text and a dir="ltr" span.
  &__link {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    min-block-size: 44px;
    font-weight: 600;
    transition: text-decoration-color var(--duration-fast) var(--ease-out);
  }

  // The hero's lime call bar. It starts on the content's inline-start edge, or 42% into
  // the column on wide screens, and runs past the window's inline-end edge; its section clips the
  // overflow, so the bar's slanted far end never shows and nothing scrolls sideways.
  &__call {
    margin-inline-end: calc(-1 * #{$edge} - var(--space-7));
    transform-origin: left center; // the window edge in RTL: the bar grows out of it

    @media (width >= $wide) {
      margin-inline-start: 42%;
    }
  }

  // ---------------------------------------------------------------------------
  // Hero
  // ---------------------------------------------------------------------------

  &__hero {
    overflow-x: clip;
    padding-block-start: clamp(var(--space-6), 6vw, var(--space-7));

    // A poster: the statement at the top, the foot at the bottom of the first screen and the call
    // bar in the band between them.
    @media (width >= $wide) {
      display: flex;
      flex-direction: column;
      row-gap: var(--space-7);
      min-block-size: min(calc(100svh - var(--header-height)), 56rem);
      padding-block-start: clamp(var(--space-7), 6vw, var(--space-9));
    }
  }

  &__kicker {
    margin-block-end: var(--space-4);
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 1.7;
    color: var(--text-muted);
  }

  &__title {
    margin: 0;
    font-size: var(--text-hero);
    line-height: 1.2;
    font-weight: 800;
  }

  &__title-line {
    display: block;
    text-wrap: balance;
  }

  &__call--hero {
    margin-block-start: var(--space-6);

    @media (width >= $wide) {
      margin-block: auto;
    }
  }

  &__hero-foot {
    display: grid;
    gap: var(--space-3) var(--space-6);
    margin-block-start: var(--space-6);

    @media (width >= $medium) {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
    }

    // The first column is 42% wide, so the in-page links start on the same line as the call bar.
    @media (width >= $wide) {
      grid-template-columns: 42% minmax(0, 1fr) auto;
      align-items: end;
      column-gap: 0;
      margin-block-start: 0;
      padding-block-end: var(--space-7);
    }
  }

  &__lede {
    max-inline-size: 34rem;
    font-size: var(--text-lead);
    line-height: 1.85;
    color: var(--text-muted);

    @media (width >= $medium) {
      grid-column: 1 / -1;
    }

    // Kept clear of the links that start on the 42% line.
    @media (width >= $wide) {
      grid-column: auto;
      padding-inline-end: var(--space-6);
    }
  }

  &__jumps {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-5);
    padding: 0;
    list-style: none;
  }

  &__phone {
    margin: 0;
  }

  // ---------------------------------------------------------------------------
  // Ready-made products
  // ---------------------------------------------------------------------------

  &__head {
    margin-block-end: var(--space-7);
  }

  // Heading at the start, intro and link at the end, on one row: the same split as the plates
  // below, so the intro starts where the second plate starts.
  &__head--split {
    @media (width >= $wide) {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: end;
      column-gap: var(--space-5);

      .home__heading {
        margin: 0;
      }
    }
  }

  &__plates {
    display: grid;
    gap: var(--space-5);
    padding: 0;
    list-style: none;

    // The plates lay their own rows on this grid (subgrid, below), so the row gap would also open
    // up inside each plate: rows of plates are spaced by a margin instead.
    @media (width >= $medium) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      row-gap: 0;
    }
  }

  // Names and chip at the top, price at the foot. The 1fr row takes any spare height, so the price
  // always sits low; without subgrid support, prices still line up across equal-height plates.
  &__plate {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto 1fr auto;
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

    // Side by side, the plates of one row share their four rows (subgrid), so names, taglines,
    // prices and actions line up even when one plate's name or actions wrap and the other's do not.
    @media (width >= $medium) {
      grid-row: span 4;
      grid-template-rows: subgrid;

      &:nth-child(n + 3) {
        margin-block-start: var(--space-5);
      }

      &:last-child:nth-child(odd) {
        grid-column: 1 / -1;
      }
    }
  }

  // The size container that measures the plate's width. It sits inside the plate, not on it:
  // containment would turn the plate's subgrid off.
  &__plate-head {
    container-type: inline-size;
  }

  // Names at the start, chip at the end; in a narrow plate the chip moves under the names, so a
  // product name always keeps a whole line to itself. DOM order stays names, chip.
  &__identity {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: var(--space-4);

    @container (width < #{$plate-narrow}) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  // The Latin name follows the Arabic one on its baseline: one name, two scripts.
  &__names {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--space-3);
  }

  &__name {
    margin: 0;
    font-size: var(--text-name);
    line-height: 1.3;
    font-weight: 800;
  }

  // Latin only, so it may be tracked.
  &__latin {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--text-muted);
  }

  // A tag, so it leans; the text inside is turned back upright. Centred on the first line of the
  // product name.
  &__chip {
    align-self: start;
    justify-self: end;
    display: inline-flex;
    align-items: center;
    block-size: 2rem;
    margin-block-start: calc((var(--text-name) * 1.3 - 2rem) / 2);
    padding-inline: var(--space-3);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.7;
    color: var(--text-muted);
    white-space: nowrap;
    transform: $lean;

    @container (width < #{$plate-narrow}) {
      justify-self: start;
      margin-block-start: var(--space-3);
    }
  }

  &__chip-text {
    transform: $upright;
  }

  &__tagline {
    margin-block-start: var(--space-2);
    font-size: 1.0625rem;
    font-weight: 500;
    line-height: 1.7;
    color: var(--text-muted);
  }

  &__price {
    align-self: end;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--space-2);
    margin: 0;
    padding-block-start: var(--space-7);
  }

  &__price-figure {
    font-family: var(--font-display);
    font-size: var(--text-figure);
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    // Western digits only, never Arabic text.
    letter-spacing: -0.02em;
  }

  &__price-unit {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-muted);
  }

  // Top of its row, so both plates' actions start on one line when only one plate's wrap.
  &__actions {
    align-self: start;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-5);
    margin-block-start: var(--space-5);
  }

  // ---------------------------------------------------------------------------
  // Services
  // ---------------------------------------------------------------------------

  &__head--stacked {
    max-inline-size: 40rem;
    margin-block-end: var(--space-8);
  }

  // Clips the separator slot that starts each line of the flow (see below).
  &__flow-frame {
    overflow-x: clip;
  }

  // The five titles as one block of display type. On phones they stack, tight inside a title and
  // spaced between titles. From $medium they flow, each title whole, with a grey point in a 1em slot
  // before every title; the list is pulled 1em past the frame's inline-start edge, so the slot that
  // starts a line falls in the clipped strip and points only stand between two titles on one line.
  &__flow {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding: 0;
    list-style: none;
    font-family: var(--font-display);
    font-size: var(--text-flow);
    font-weight: 700;
    line-height: 1.3;

    @media (width >= $medium) {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0;
      margin-inline-start: -1em;
      line-height: 1.65;
    }
  }

  &__flow-item {
    text-wrap: balance;

    @media (width >= $medium) {
      white-space: nowrap;

      // The slot: 1em wide with the point centred in it, on the letter bodies rather than the baseline.
      &::before {
        content: "";
        display: inline-block;
        inline-size: var(--point-sm);
        block-size: var(--point-sm);
        margin-inline: calc((1em - var(--point-sm)) / 2);
        border-radius: 50%;
        background-color: var(--border-strong);
        vertical-align: calc(0.25em - var(--point-sm) / 2);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Company
  // ---------------------------------------------------------------------------

  // Statement on one side, the years on the other.
  &__section--company {
    @media (width >= $wide) {
      display: grid;
      grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
      align-items: end;
      column-gap: var(--space-8);
    }
  }

  // Clear of the heading above it: the two are both large and must not crowd.
  &__goal {
    max-inline-size: 18em;
    margin-block-start: calc(var(--space-4) + var(--space-5));
    font-family: var(--font-display);
    font-size: var(--text-flow);
    font-weight: 700;
    line-height: 1.6;
    text-wrap: balance;
  }

  // Idea, then launch: figure, node and label rows shared through subgrid, so the connector
  // (::before, across the first two columns) lines up with both nodes.
  &__years {
    display: grid;
    grid-template-columns: auto minmax(2rem, 1fr) auto;
    grid-template-rows: auto auto auto;
    row-gap: var(--space-3);
    // Stacked, the years keep a short span instead of stretching across a tablet.
    max-inline-size: 28rem;
    margin-block-start: var(--space-7);
    padding: 0;
    list-style: none;

    @media (width >= $wide) {
      max-inline-size: none;
      margin-block-start: 0;
    }

    // A decorative bar, so it leans: from the 2020 node to the 2024 node, with air at both ends.
    &::before {
      content: "";
      grid-column: 1 / 3;
      grid-row: 2;
      align-self: center;
      block-size: 6px;
      margin-inline: calc(var(--point-md) + var(--space-2)) var(--space-2);
      border-radius: var(--radius-pill);
      background-color: var(--border-strong);
      transform: $lean;
    }
  }

  &__year {
    display: grid;
    grid-row: 1 / -1;
    grid-template-rows: subgrid;
    justify-items: start;

    &--idea {
      grid-column: 1;
    }

    &--launch {
      grid-column: 3;
    }
  }

  &__year-figure {
    font-family: var(--font-display);
    font-size: var(--text-figure);
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    color: var(--text-muted);

    .home__year--launch & {
      color: var(--text);
    }
  }

  // Grey for the idea; lime for the launch, because the company is live now.
  &__year-node {
    align-self: center;
    inline-size: var(--point-md);
    block-size: var(--point-md);
    border-radius: 50%;
    background-color: var(--border-strong);

    .home__year--launch & {
      background-color: var(--accent);
    }
  }

  &__year-label {
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 1.7;
    color: var(--text-muted);
  }

  // ---------------------------------------------------------------------------
  // Closing: the lime contact band
  // ---------------------------------------------------------------------------

  &__closing {
    overflow-x: clip;
    padding-block: clamp(var(--space-9), 9vw, var(--space-10)) var(--space-9);
  }

  // Lime from window edge to window edge, glowing like the call bars. From $band-lean it starts on
  // the content edge with the brand lean and its far end runs past the window edge (the section clips it).
  &__band {
    // The band is lime: dark text, and a dark focus ring so it stays visible.
    --focus: var(--on-accent);

    position: relative;
    isolation: isolate;
    margin-inline: calc(-1 * #{$edge});
    padding: clamp(var(--space-7), 7vw, var(--space-9)) $edge;
    color: var(--on-accent);

    // The fill and the glow on their own layers, so they can lean while the text stays upright.
    &::before,
    &::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
    }

    &::before {
      background-color: var(--accent);
    }

    &::after {
      box-shadow: var(--glow-accent);
    }

    @media (width >= $band-lean) {
      margin-inline-start: 0;
      padding-inline-start: clamp(var(--space-7), 6vw, var(--space-9));

      &::before,
      &::after {
        inset-inline-end: calc(var(--space-9) * -1);
        border-radius: var(--radius-lg);
        transform: $lean;
      }
    }

    .home__link {
      color: inherit;
      text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);

      @media (hover: hover) {
        &:hover {
          text-decoration-color: currentColor;
        }
      }
    }
  }

  &__hours {
    max-inline-size: 36rem;
    font-size: var(--text-lead);
    line-height: 1.85;
    text-wrap: balance;
  }

  // Holds the status line's height from the first paint, so it appears after mount without
  // moving anything. Without JavaScript there is no status, so nothing is held.
  &__status-slot {
    margin-block-start: var(--space-2);
    font-size: 0.9375rem;
    line-height: 1.7;

    .js & {
      min-block-size: 1.7em;
    }
  }

  &__status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 500;
  }

  // On the lime band, in the band's dark text colour. Closed: a hollow ring. Open: a filled point.
  &__status-point {
    flex: none;
    inline-size: var(--point-sm);
    block-size: var(--point-sm);
    border: 1.5px solid currentColor;
    border-radius: 50%;

    .home__status--open & {
      background-color: currentColor;
    }
  }

  &__channels {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-6);
    margin-block-start: var(--space-6);
    padding: 0;
    list-style: none;

    .home__link {
      overflow-wrap: anywhere;
    }
  }
}

// -----------------------------------------------------------------------------
// Motion. One load sequence for the hero; on scroll, the plates rise, the services light up
// in turn and the years draw. All of it is optional: nothing here
// runs under prefers-reduced-motion, and without scroll-driven animation support everything
// simply shows its end state. Start states live only in the keyframes.
// -----------------------------------------------------------------------------

@media (prefers-reduced-motion: no-preference) {
  .home__kicker {
    animation: home-fade var(--duration-slow) var(--ease-out) both;
  }

  .home__title-line {
    animation: home-rise var(--duration-entrance) var(--ease-out) both;

    & + & {
      animation-delay: var(--stagger);
    }
  }

  // The bar wipes in from the window edge, its content fades in halfway through, and its glow
  // comes on last. The glow only fills backwards, so afterwards its hover transition works.
  .home__call--hero {
    animation: home-wipe var(--duration-entrance) var(--ease-out)
      calc(var(--stagger) * 3) both;

    :deep(.action__content) {
      animation: home-fade var(--duration-slow) var(--ease-out)
        calc(var(--stagger) * 3 + var(--duration-entrance) * 0.5) both;
    }

    &::after {
      animation: home-fade var(--duration-base) var(--ease-out)
        calc(var(--stagger) * 3 + var(--duration-entrance)) backwards;
    }
  }

  .home__hero-foot {
    animation: home-fade var(--duration-slow) var(--ease-out)
      calc(var(--stagger) * 8) both;
  }

  @supports (animation-timeline: view()) {
    .home__plate {
      animation: home-enter linear both;
      animation-timeline: view();
      animation-range: entry 10% cover 30%;
    }

    // Each title lights over its own fifth of the list's entry.
    .home__flow {
      view-timeline-name: --home-flow;
    }

    .home__flow-item {
      animation: home-light linear both;
      animation-timeline: --home-flow;

      @for $i from 1 through 5 {
        &:nth-child(#{$i}) {
          animation-range: entry #{($i - 1) * 20%} entry #{$i * 20%};
        }
      }
    }

    // One range for the years: the idea point, then the bar, then the launch point.
    .home__years {
      view-timeline-name: --home-years;

      &::before {
        transform-origin: right center; // the 2020 side: inline start in RTL
        animation: home-draw linear both;
        animation-timeline: --home-years;
        animation-range: entry 30% cover 45%;
      }
    }

    .home__year-node {
      animation: home-pop-first var(--ease-out) both;
      animation-timeline: --home-years;
      animation-range: entry 30% cover 45%;

      .home__year--launch & {
        animation-name: home-pop-last;
      }
    }

    // Focus can arrive before the scroll does: whatever holds focus shows its end state at once.
    .home__plate:focus-within {
      animation: none;
    }
  }
}

@keyframes home-fade {
  from {
    opacity: 0;
  }
}

@keyframes home-rise {
  from {
    opacity: 0;
    translate: 0 0.35em;
  }
}

@keyframes home-wipe {
  from {
    scale: 0 1;
  }
}

@keyframes home-enter {
  from {
    opacity: 0;
    translate: 0 1.5rem;
  }
}

@keyframes home-light {
  from {
    opacity: 0.45;
  }
}

@keyframes home-draw {
  from,
  20% {
    scale: 0 1;
  }

  80% {
    scale: 1;
  }
}

@keyframes home-pop-first {
  from {
    scale: 0;
  }

  35% {
    scale: 1;
  }
}

@keyframes home-pop-last {
  from,
  65% {
    scale: 0;
  }
}
</style>
