<script setup lang="ts">
import { company, services } from "~/data/company";
import { solutions, type Solution, type SolutionImage } from "~/data/solutions";
import type { StageShots } from "~/components/StoryStage.vue";

// The story's stage runs to the window edges, so this page draws its own full-width sections instead
// of the layout's centred column.
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

// ---------------------------------------------------------------------------
// The story: five chapters, from Codel to its two ready-made programs and back to Codel.
// 01 Codel · 02 Nuqta Plus at the point of sale · 03 the same program's figures and reports
// 04 Dalaly · 05 software made to measure, and the call.
// The chapters are written about these two products, so they are picked by slug; every product
// (these and any added later) is listed on /solutions.
// ---------------------------------------------------------------------------

const nuqta = solutions.find((solution) => solution.slug === "nuqta-plus");
const dalaly = solutions.find((solution) => solution.slug === "dalaly");

// A product's screenshot by file name, so each screen keeps its part if the list is reordered.
const screen = (
  solution: Solution | undefined,
  file: string,
): SolutionImage | undefined =>
  solution?.images.find((image) => image.src.endsWith(`/${file}`));

// The cinematic stage's screens (StoryStage), by the part each plays.
const shots: StageShots = {
  operations: screen(nuqta, "pos.webp"),
  insights: screen(nuqta, "dashboard.webp"),
  report: screen(nuqta, "sales-report.webp"),
  listing: screen(dalaly, "properties.webp"),
  detail: screen(dalaly, "property.webp"),
};

// As a page, each chapter shows its own screens; the opening's picture is the point of sale, so
// chapter 02 shows the stock screen.
const stock = screen(nuqta, "inventory.webp");

// The opening's screen is the page's largest paint: ask for it early, at high priority.
const heroPreload: SolutionImage[] = shots.operations ? [shots.operations] : [];
useHead({
  link: heroPreload.map((shot) => ({
    rel: "preload" as const,
    as: "image" as const,
    href: shot.src,
    fetchpriority: "high" as const,
  })),
});

// The parts of the story that are drafts of the owner's offer (see CLAUDE.md, Home page).
const insightsHeadline = "من نقطة البيع، إلى أرقام يومك.";
const customHeadline = "لم تجد برنامجك؟ نبرمجه لك.";
</script>

<template>
  <div class="home">
    <HomeStory :shots="shots">
      <!-- 01 Codel: the offer, and the window that the story keeps. -->
      <StoryChapter name="intro" labelledby="home-title">
        <h1 id="home-title" class="home__title">
          <span class="home__title-line" data-mask
            ><span class="home__title-words" data-mask-inner
              >من شغلك،</span
            ></span
          >
          <span class="home__title-line" data-mask
            ><span class="home__title-words" data-mask-inner
              >إلى برنامج</span
            ></span
          >
          <span class="home__title-line home__title-line--mark" data-mask
            ><span class="home__title-words" data-mask-inner>يشتغل.</span></span
          >
        </h1>
        <p class="home__lede home__lede--intro" data-reveal>
          اشترِ برنامجاً جاهزاً بسعر معلن وابدأ العمل اليوم،
          <span class="home__keep">أو اطلب</span> موقعاً أو تطبيقاً أو نظاماً
          على مقاس عملك.
        </p>
        <div class="home__hero-actions" data-reveal>
          <ActionLink look="solid" :to="company.phones.main.whatsapp" new-tab>
            <span class="home__action-label"
              ><span
                class="home__glyph home__glyph--chat"
                aria-hidden="true"
              />راسلنا على واتساب</span
            >
          </ActionLink>
          <ActionLink look="outline" size="lg" to="/solutions">
            <span class="home__action-label"
              >تصفح حلولنا الجاهزة<span
                class="home__glyph home__glyph--arrow"
                aria-hidden="true"
            /></span>
          </ActionLink>
        </div>
      </StoryChapter>

      <!-- 02 Nuqta Plus: what it is, at its point of sale. Who it is on the reading side; what it
           costs and how to ask on the other. -->
      <StoryChapter v-if="nuqta" name="nuqta" labelledby="nuqta-title">
        <div class="home__head">
          <div class="home__head-main">
            <p class="home__kicker" data-reveal>
              <span class="home__index" dir="ltr" aria-hidden="true">02</span>
              برنامج جاهز
            </p>
            <!-- prettier-ignore -->
            <h2 id="nuqta-title" class="home__name"><SplitWords :text="nuqta.nameAr" /> <span class="home__latin" dir="ltr" data-reveal>{{ nuqta.nameEn }}</span></h2>
            <p class="home__statement" data-reveal>{{ nuqta.tagline }}</p>
            <p class="home__desc" data-reveal data-page-only>
              {{ nuqta.description }}
            </p>
            <ul role="list" class="home__features" data-reveal data-page-only>
              <li v-for="feature in nuqta.features.slice(0, 4)" :key="feature">
                {{ feature }}
              </li>
            </ul>
          </div>
          <div class="home__head-side">
            <div class="home__buy" data-reveal>
              <ProductPrice :amount="nuqta.priceIqd" />
              <LeanTag :label="`يعمل على ${nuqta.platform}`" />
            </div>
            <div class="home__actions" data-reveal>
              <WhatsAppCall
                :subject="nuqta.nameAr"
                label="اسأل عنه على واتساب"
                :hidden-suffix="nuqta.nameAr"
                :glow="false"
              />
              <ActionLink
                look="text"
                :to="`/solutions/${nuqta.slug}`"
                :label="`تفاصيل ${nuqta.nameAr}`"
              />
            </div>
          </div>
        </div>

        <template v-if="stock" #media>
          <div class="home__media">
            <ProductWindow
              v-bind="stock"
              class="home__shot"
              data-media="main"
            />
          </div>
        </template>
      </StoryChapter>

      <!-- 03 The same program, from daily operations to the day's figures. -->
      <StoryChapter v-if="nuqta" name="insights" labelledby="insights-title">
        <div class="home__head">
          <div class="home__head-main">
            <p class="home__kicker" data-reveal>
              <span class="home__index" dir="ltr" aria-hidden="true">03</span>
              {{ nuqta.nameAr }}
            </p>
            <h2 id="insights-title" class="home__headline">
              <SplitWords :text="insightsHeadline" />
            </h2>
          </div>
          <div class="home__head-side home__head-side--text">
            <p class="home__lede" data-reveal>
              مبيعات اليوم وأرباحه وفواتيره على الشاشة الرئيسية، والتقارير
              المالية وتقارير المبيعات حين تحتاجها.
            </p>
          </div>
        </div>

        <template v-if="shots.insights" #media>
          <div class="home__media">
            <ProductWindow
              v-bind="shots.insights"
              class="home__shot"
              data-media="main"
            />
            <ProductWindow
              v-if="shots.report"
              v-bind="shots.report"
              class="home__shot home__shot--second"
              data-media="second"
            />
          </div>
        </template>
      </StoryChapter>

      <!-- 04 Dalaly: another business, on its own sand ground. -->
      <StoryChapter
        v-if="dalaly"
        name="dalaly"
        ground="sand"
        labelledby="dalaly-title"
      >
        <div class="home__head">
          <div class="home__head-main">
            <p class="home__kicker" data-reveal>
              <span class="home__index" dir="ltr" aria-hidden="true">04</span>
              برنامج جاهز
            </p>
            <!-- prettier-ignore -->
            <h2 id="dalaly-title" class="home__name"><SplitWords :text="dalaly.nameAr" /> <span class="home__latin" dir="ltr" data-reveal>{{ dalaly.nameEn }}</span></h2>
            <p class="home__statement" data-reveal>{{ dalaly.tagline }}</p>
            <p class="home__desc" data-reveal data-page-only>
              {{ dalaly.description }}
            </p>
            <ul role="list" class="home__features" data-reveal data-page-only>
              <li v-for="feature in dalaly.features.slice(0, 4)" :key="feature">
                {{ feature }}
              </li>
            </ul>
          </div>
          <div class="home__head-side">
            <div class="home__buy" data-reveal>
              <ProductPrice :amount="dalaly.priceIqd" />
              <LeanTag :label="`يعمل على ${dalaly.platform}`" />
            </div>
            <div class="home__actions" data-reveal>
              <WhatsAppCall
                :subject="dalaly.nameAr"
                label="اسأل عنه على واتساب"
                :hidden-suffix="dalaly.nameAr"
                :glow="false"
              />
              <ActionLink
                look="text"
                :to="`/solutions/${dalaly.slug}`"
                :label="`تفاصيل ${dalaly.nameAr}`"
              />
            </div>
          </div>
        </div>

        <template v-if="shots.listing" #media>
          <div class="home__media">
            <ProductWindow
              v-bind="shots.listing"
              class="home__shot"
              data-media="main"
            />
            <ProductWindow
              v-if="shots.detail"
              v-bind="shots.detail"
              class="home__shot home__shot--second"
              data-media="second"
            />
          </div>
        </template>
      </StoryChapter>

      <!-- 05 Codel again: software made to measure, and how to reach us. The heading where every
           chapter's heading sits, the services where the window was, the ways to reach us under
           them. -->
      <StoryChapter
        id="contact"
        name="custom"
        ground="lime"
        labelledby="custom-title"
      >
        <div class="home__closing">
          <div class="home__head home__head--closing">
            <div class="home__head-main">
              <p class="home__kicker" data-reveal>
                <span class="home__index" dir="ltr" aria-hidden="true">05</span>
                {{ services.at(-1)?.title }}
              </p>
              <h2 id="custom-title" class="home__headline">
                <SplitWords :text="customHeadline" />
              </h2>
            </div>
            <div class="home__head-side home__head-side--text">
              <p class="home__lede" data-reveal>
                أخبرنا بما تحتاجه على واتساب أو بالبريد الإلكتروني. الدوام
                {{ company.hours.days }}، {{ company.hours.time }}.
              </p>
              <OpenStatus class="home__status" data-reveal />
            </div>
          </div>

          <div class="home__services">
            <div class="home__services-head" data-reveal>
              <h3 class="home__label">خدماتنا</h3>
              <ActionLink look="text" to="/services" label="تفاصيل الخدمات" />
            </div>
            <ul role="list" class="home__service-names" data-reveal>
              <li
                v-for="service in services"
                :key="service.title"
                class="home__service"
                data-mask
              >
                <span class="home__service-name" data-mask-inner>{{
                  service.title
                }}</span>
              </li>
            </ul>
          </div>

          <div class="home__reach" data-reveal>
            <WhatsAppCall
              look="ink"
              :subject="services.at(-1)?.title"
              :detail="company.phones.main.display"
            />
            <ul role="list" class="home__channels">
              <li>
                <!-- Kept on one line (and out of the formatter's reach): the space keeps the words
                     and the number apart. -->
                <!-- prettier-ignore -->
                <ActionLink look="text" :to="company.phones.main.tel">أو اتصل <span dir="ltr">{{ company.phones.main.display }}</span></ActionLink>
              </li>
              <li>
                <ActionLink
                  look="text"
                  :to="`mailto:${company.email}`"
                  :label="company.email"
                  dir="ltr"
                />
              </li>
              <li>
                <ActionLink look="text" to="/contact" label="كل طرق التواصل" />
              </li>
            </ul>
          </div>
        </div>
      </StoryChapter>
    </HomeStory>
  </div>
</template>

<style scoped lang="scss">
// The window size that holds the cinematic cover. Same as $cover in HomeStory.vue.
$cover: "(min-width: 64em) and (min-height: 36em)";
// A cover window short enough (laptops) that the headings close up. Same as $cover-short in
// HomeStory.vue.
$cover-short: "(min-width: 64em) and (min-height: 36em) and (max-height: 46em)";
// Story widths: from $tablet the opening is centred over its screen; from $side a chapter's headings
// split into two columns over its screens.
$tablet: 40rem;
$side: 64rem;
// The headline's line box, and where the lime starts inside its last line: under the tails of the
// line above and over this line's ل.
$title-leading: 1.15;
$mark-top: 0.12;
// The hero's glyphs, drawn as masks: the black is only the mask's shape, the colour is the
// element's own.
$glyph-chat: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 3.5a8.5 8.5 0 1 1-3.9 16l-4.6 1 1-4.6A8.5 8.5 0 0 1 12 3.5z'/%3E%3C/svg%3E");
$glyph-arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 12H5m6-6-6 6 6 6'/%3E%3C/svg%3E");
// The brand lean.
$lean: skewX(calc(var(--slant-angle) * -1));

.home {
  overflow-x: clip;

  // ---------------------------------------------------------------------------
  // A chapter's headings: three tiers. The kicker (where you are in the story), the heading (the
  // product's name or the chapter's line, the largest thing on the page after the opening's), then
  // one supporting line. From $side they split into two equal columns that end on one line: who it is
  // on the reading side, what it costs and how to ask on the other.
  // ---------------------------------------------------------------------------

  &__head {
    display: grid;
    gap: var(--space-5) var(--copy-gap);

    &--closing {
      grid-template-columns: 1fr !important;
    }

    @container story (width >= #{$side}) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: end;
    }
  }

  &__head-side {
    display: grid;
    justify-items: start;
    gap: var(--space-4);

    // Across from the heading, against the column's far edge.
    @container story (width >= #{$side}) {
      justify-items: end;
    }

    // Running text reads from one edge; only the purchase is pushed to the far edge.
    &--text {
      @container story (width >= #{$side}) {
        justify-items: stretch;

        .home__lede {
          max-inline-size: none;
        }
      }
    }
  }

  // The chapter's number and a short leaning bar (a reader's place in the story), then what the
  // chapter is about. The words stay upright.
  &__kicker {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-block-end: var(--space-3);
    font-size: var(--text-ui);
    font-weight: 600;
    line-height: 1.7;
    color: var(--accent-text);
  }

  &__index {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    font-family: var(--font-display);
    font-variant-numeric: tabular-nums;
    color: var(--text-muted);

    &::after {
      content: "";
      inline-size: var(--space-5);
      block-size: 3px;
      border-radius: var(--radius-pill);
      background-color: currentColor;
      transform: $lean;
    }
  }

  // The product's name, or the chapter's line: oversized, its words risen into view one by one.
  &__name,
  &__headline {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--text-page);
    font-weight: 800;
    line-height: 1.2;
  }

  // On the stage both sizes also follow the window's height, so the headings fit their band.
  &__name {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--space-3);

    .story--cinematic & {
      font-size: min(var(--text-page), 8.4svh);
    }
  }

  // A sentence, so a size under the names'; it may take two lines (the stage's columns are wider
  // than the page's, so there it is set larger), never three in its half of the band: the wider
  // draft headline needs about 7.3em for two lines ("لم تجد برنامجك؟" over "نبرمجه لك."), and 8em
  // leaves room. A third line would push the kicker up under the header.
  &__headline {
    font-size: var(--text-title);
    text-wrap: balance;

    .story--cinematic & {
      font-size: min(
        var(--text-page),
        6.6svh,
        (var(--win-w) - var(--copy-gap)) / 2 / 8
      );
    }
  }

  &__latin {
    font-family: var(--font-sans);
    font-size: var(--text-body);
    font-weight: 600;
    color: var(--text-muted);
  }

  // What the product is, right under its name. On the stage it is set larger, so the name's
  // second tier holds its own beside the price, but never past one line in its half of the band
  // (the longer tagline runs about 12.5em; a 13.5em line leaves room): a second line would push the
  // kicker up under the header. On a short cover the band has no room for it.
  &__statement {
    margin-block-start: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-card);
    font-weight: 600;
    line-height: 1.6;

    .story--cinematic & {
      font-size: min(
        var(--text-flow),
        (var(--win-w) - var(--copy-gap)) / 2 / 13.5
      );

      @media #{$cover-short} {
        font-size: var(--text-lead);
      }
    }
  }

  &__desc {
    max-inline-size: 34rem;
    margin-block-start: var(--space-3);
    color: var(--text-muted);
    line-height: 1.75;
  }

  &__lede {
    max-inline-size: 30rem;
    font-size: var(--text-lead);
    line-height: 1.8;
    color: var(--text-muted);
    text-wrap: pretty;
  }

  // Four of the product's features, each after a point in the product's colour; two columns where
  // the list has room for them, never more (a column is over a third of the list), so never 3 + 1.
  &__features {
    display: grid;
    grid-template-columns: repeat(
      auto-fit,
      minmax(min(max(14rem, 34%), 100%), 1fr)
    );
    gap: var(--space-1) var(--space-5);
    margin-block-start: var(--space-4);
    padding: 0;
    list-style: none;
    font-size: var(--text-small);
    font-weight: 500;

    li {
      display: flex;
      gap: var(--space-2);
      line-height: 1.7;

      &::before {
        content: "";
        flex: none;
        inline-size: var(--point-sm);
        block-size: var(--point-sm);
        margin-block-start: 0.65em;
        border-radius: 50%;
        background-color: var(--nuqta-accent);
      }
    }

    .chapter--sand & li::before {
      background-color: var(--dalaly-accent);
    }
  }

  // The price, then the call: the purchase, together.
  &__buy {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-4);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-5);
  }

  // Laptops: the cover is short, so the headings close up rather than run under the window's edge.
  @media #{$cover-short} {
    &__kicker {
      margin-block-end: var(--space-2);
    }

    &__statement {
      margin-block-start: var(--space-1);
      font-size: var(--text-lead);
    }

    &__head-side {
      gap: var(--space-3);
    }
  }

  // ---------------------------------------------------------------------------
  // 01 The opening: centred over its screen from $tablet
  // ---------------------------------------------------------------------------

  // Three lines, each kept whole and fitted to the column; the last one sits on lime. In the cover
  // the first two share a row: "من شغلك، إلى برنامج" (8.93em at weight 700) over 80% of the column.
  &__title {
    --title-measure: min(var(--content-w), 30rem);
    --title-fit: 5.5;
    --title-size: min(
      var(--text-hero),
      var(--title-measure) / var(--title-fit)
    );

    margin: 0;
    font-family: var(--font-display);
    font-size: var(--title-size);
    font-weight: 700;
    line-height: $title-leading;
    text-wrap: nowrap;

    // The shared row is centred like the line under it.
    // On a short cover it is capped lower, so the actions keep their distance from the plinth.
    @media #{$cover} {
      --title-measure: var(--content-w);
      --title-fit: 11.2;
      --title-cap: 10svh;
      --title-size: min(
        var(--text-hero),
        var(--title-measure) / var(--title-fit),
        var(--title-cap)
      );

      text-align: center;
    }

    @media #{$cover-short} {
      --title-cap: 9svh;
    }
  }

  // Each line a mask only as wide as its words (with room for the lime's leaning corners), so the
  // words leave through its top edge. The lines never wrap: the fallback font (Readex Pro) sets
  // them wider than Rubik, and a line allowed to wrap would jump as Rubik arrives.
  &__title-line {
    display: block;
    inline-size: fit-content;
    white-space: nowrap;
    clip-path: inset(-0.1em -0.45em -0.32em -0.45em);

    @container story (width >= #{$tablet}) {
      margin-inline: auto;
    }

    @media #{$cover} {
      &:not(.home__title-line--mark) {
        display: inline-block;
      }
    }
  }

  &__title-words {
    display: inline-block;
  }

  // The highlight leans on its own layer, so the words stay upright; it moves with them.
  &__title-line--mark &__title-words {
    position: relative;
    isolation: isolate;
    padding-inline: 0.18em;
    color: var(--on-accent);

    &::before {
      content: "";
      position: absolute;
      z-index: -1;
      inset: #{$mark-top}em 0 -0.02em;
      border-radius: var(--radius-md);
      background-color: var(--accent);
      transform: $lean;
    }
  }

  &__lede--intro {
    max-inline-size: 27em;
    margin-block-start: var(--space-5);

    // Centred like the headline over it, so both lines sit symmetrically.
    @container story (width >= #{$tablet}) {
      max-inline-size: 34rem;
      margin-inline: auto;
      text-align: center;
    }

    // A short cover: closer to the headline, so the actions keep their distance from the plinth.
    @media #{$cover-short} {
      margin-block-start: var(--space-4);
    }
  }

  // "أو" stays with its verb, never alone at the end of a line.
  &__keep {
    white-space: nowrap;
  }

  // Phones: both actions across the column, their leaning corners kept inside it. From a wider column
  // both on one row (centred from $tablet).
  &__hero-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-block-start: var(--space-6);

    > a {
      justify-content: center;
      max-inline-size: 22rem;
      margin-inline: calc(var(--control-lg) * tan(var(--slant-angle)) / 2);
      padding-inline: calc(var(--space-6) - var(--space-1));
    }

    @container story (width >= 30rem) {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;

      > a {
        margin-inline: 0;
      }
    }

    @container story (width >= #{$tablet}) {
      justify-content: center;
    }

    @media #{$cover-short} {
      margin-block-start: var(--space-5);
    }
  }

  &__kicker--intro {
    @container story (width >= #{$tablet}) {
      justify-content: center;
    }
  }

  // The label and its glyph, both inside the part of the button that is turned back upright.
  &__action-label {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  &__glyph {
    flex: none;
    inline-size: 1.25em;
    block-size: 1.25em;
    background-color: currentColor;

    &--chat {
      mask: $glyph-chat center / contain no-repeat;
    }

    &--arrow {
      mask: $glyph-arrow center / contain no-repeat;
    }
  }

  // ---------------------------------------------------------------------------
  // The chapters' own screens, shown when the story flows as a page: centred under the headings
  // ---------------------------------------------------------------------------

  // The main screen, and a second over its lower corner on the reading side, standing a little out
  // past its edge, set off from it by a ring of the chapter's ground.
  &__media {
    --media-ground: var(--bg);

    position: relative;
    padding-block-end: 12%;

    .chapter--sand & {
      --media-ground: var(--dalaly-ground);
    }
  }

  &__shot {
    --window-radius: var(--radius-md);
  }

  &__shot--second {
    --window-ring: 0 0 0 var(--space-2) var(--media-ground);

    position: absolute;
    inset-block-end: 0;
    inset-inline-start: -4%;
    inline-size: 42%;
  }

  // ---------------------------------------------------------------------------
  // 05 The closing call, on lime: the heading where every chapter's heading sits, the services where
  // the window was, the ways to reach us under them
  // ---------------------------------------------------------------------------

  &__closing {
    display: grid;
    row-gap: var(--space-8);

    @media #{$cover} {
      row-gap: var(--head-gap);
    }

    // A short cover: closed up, so the ways to reach us stay clear of the window's bottom edge.
    @media #{$cover-short} {
      row-gap: var(--space-3);
    }

    // On the stage it fills the frame under the header: its heading in the headings' band, on the
    // same line as every chapter's, the services centred in the room under it, the ways to reach us
    // at its foot. On a short window the middle track shrinks to the services.
    .story--cinematic & {
      // grid-template-rows: var(--head-h) 1fr auto;
      min-block-size: calc(100svh - var(--room-top));

      > .home__head {
        align-self: end;
      }

      > .home__services {
        align-self: center;
      }

      > .home__reach {
        padding-block-end: var(--cover-pad);
      }
    }
  }

  &__status {
    margin-block-start: calc(-1 * var(--space-2));
  }

  // The label and the link to the services page on one line over the names.
  &__services-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0 var(--space-5);
    padding-block-end: var(--space-2);
    border-block-end: 1px solid var(--border);
  }

  &__label {
    margin: 0;
    font-family: var(--font-sans);
    font-size: var(--text-ui);
    font-weight: 600;
    line-height: 1.7;
    color: var(--text-muted);
  }

  // The five names set large in wrapping rows, each name under a rule, each a mask its words rise
  // into. Every row's names grow to fill it, so no row leaves an empty cell and every rule runs the
  // whole row (three over two on a wide column).
  &__service-names {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    column-gap: var(--space-6);
    padding: 0;
    list-style: none;
  }

  &__service {
    flex: 1 1 min(17rem, 100%);
    padding-block: var(--space-4);
    border-block-end: 1px solid var(--border);
    clip-path: inset(0 -0.3em);
    font-family: var(--font-display);
    font-size: var(--text-flow);
    font-weight: 700;
    line-height: 1.4;

    @media #{$cover-short} {
      padding-block: var(--space-2);
      font-size: var(--text-card);
    }
  }

  &__service-name {
    display: block;
  }

  // The call and the other ways in, on one line where there is room.
  &__reach {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-6);

    @media #{$cover-short} {
      row-gap: var(--space-2);
    }
  }

  &__channels {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-5);
    padding: 0;
    list-style: none;
  }
}

// The opening's entrance: plain CSS, so it starts with the first paint and waits for nothing. The
// text arrives first and fast (the headline reads by about 450ms), then the lede and actions; the
// slab and the screen follow on the stage (StoryStage). Every keyframe runs toward the resting
// style, which is what shows without motion or JavaScript.
// The story's timeline moves the kicker and the lede with transform: their entrance only fades,
// because GSAP would fold a running CSS translate into its own transform and keep it.
@media (prefers-reduced-motion: no-preference) {
  .home__kicker--intro {
    animation: home-fade var(--duration-slow) var(--ease-out) backwards;
  }

  // Each line wiped in from the reading start, one after another; the highlight with its words.
  .home__title-words {
    animation: home-wipe var(--duration-slow) var(--ease-out) backwards;
  }

  .home__title-line:nth-child(2) .home__title-words {
    animation-delay: var(--stagger);
  }

  .home__title-line--mark .home__title-words {
    animation-delay: calc(2 * var(--stagger));
  }

  .home__lede--intro {
    animation: home-fade var(--duration-slow) var(--ease-out) 240ms backwards;
  }

  // The individual translate property: the links lean with transform.
  .home__hero-actions > * {
    animation: home-forward var(--duration-slow) var(--ease-out) 280ms backwards;

    & + * {
      animation-delay: 340ms;
    }
  }

  // Keyboard focus can get there first: what holds focus is shown at once, never half-faded. The
  // entrance is finished, not removed, so it never replays when focus moves on.
  .home__hero-actions > :focus-within {
    animation-duration: 0s;
    animation-delay: 0s;
  }
}

@keyframes home-fade {
  from {
    opacity: 0;
  }
}

// From the inline start, the right edge (the site is right to left only), past the words' ends and
// the highlight's leaning corners, so nothing is cut; with `backwards` fill nothing is left clipping
// once it ends.
@keyframes home-wipe {
  from {
    clip-path: inset(-30% -0.4em -30% calc(100% + 0.4em));
  }

  to {
    clip-path: inset(-30% -0.4em -30% -0.4em);
  }
}

// Forward is to the left (right to left): from a little to the right.
@keyframes home-forward {
  from {
    opacity: 0;
    translate: 1rem 0;
  }
}
</style>
