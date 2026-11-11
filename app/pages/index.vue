<script setup lang="ts">
import { company, services } from "~/data/company";
import {
  solutions,
  type Solution,
  type SolutionImage,
} from "~/data/solutions";
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
        <p class="home__kicker home__kicker--intro" data-reveal>
          <span class="home__index" dir="ltr" aria-hidden="true">01</span>
          شركة برمجيات عراقية في {{ company.addressParts.city }}
        </p>
        <!-- Kept on one line (and out of the formatter's reach): the spaces keep the lines apart
             when read aloud. Each line is a mask its words leave through. -->
        <!-- prettier-ignore -->
        <h1 id="home-title" class="home__title"><span class="home__title-line" data-mask><span class="home__title-words" data-mask-inner>من شغلك،</span></span> <span class="home__title-line" data-mask><span class="home__title-words" data-mask-inner>إلى برنامج</span></span> <span class="home__title-line home__title-line--mark" data-mask><span class="home__title-words" data-mask-inner>يشتغل.</span></span></h1>
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

      <!-- 02 Nuqta Plus: what it is, at its point of sale. -->
      <StoryChapter v-if="nuqta" name="nuqta" labelledby="nuqta-title">
        <p class="home__kicker" data-reveal>
          <span class="home__index" dir="ltr" aria-hidden="true">02</span>
          برنامج جاهز
        </p>
        <!-- prettier-ignore -->
        <h2 id="nuqta-title" class="home__name"><SplitWords :text="nuqta.nameAr" /> <span class="home__latin" dir="ltr" data-reveal>{{ nuqta.nameEn }}</span></h2>
        <p class="home__statement" data-reveal>{{ nuqta.tagline }}</p>
        <p class="home__desc" data-reveal>{{ nuqta.description }}</p>
        <ul role="list" class="home__features" data-reveal>
          <li v-for="feature in nuqta.features.slice(0, 4)" :key="feature">
            {{ feature }}
          </li>
        </ul>
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
        <p class="home__kicker" data-reveal>
          <span class="home__index" dir="ltr" aria-hidden="true">03</span>
          {{ nuqta.nameAr }}
        </p>
        <h2 id="insights-title" class="home__headline">
          <SplitWords :text="insightsHeadline" />
        </h2>
        <p class="home__lede" data-reveal>
          مبيعات اليوم وأرباحه وفواتيره على الشاشة الرئيسية، والتقارير المالية
          وتقارير المبيعات حين تحتاجها.
        </p>

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
        <p class="home__kicker" data-reveal>
          <span class="home__index" dir="ltr" aria-hidden="true">04</span>
          برنامج جاهز
        </p>
        <!-- prettier-ignore -->
        <h2 id="dalaly-title" class="home__name"><SplitWords :text="dalaly.nameAr" /> <span class="home__latin" dir="ltr" data-reveal>{{ dalaly.nameEn }}</span></h2>
        <p class="home__statement" data-reveal>{{ dalaly.tagline }}</p>
        <p class="home__desc" data-reveal>{{ dalaly.description }}</p>
        <ul role="list" class="home__features" data-reveal>
          <li v-for="feature in dalaly.features.slice(0, 4)" :key="feature">
            {{ feature }}
          </li>
        </ul>
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

      <!-- 05 Codel again: software made to measure, and how to reach us. -->
      <StoryChapter
        id="contact"
        name="custom"
        ground="lime"
        labelledby="custom-title"
      >
        <div class="home__closing">
          <div class="home__call">
            <p class="home__kicker" data-reveal>
              <span class="home__index" dir="ltr" aria-hidden="true">05</span>
              {{ services.at(-1)?.title }}
            </p>
            <h2 id="custom-title" class="home__headline">
              <SplitWords :text="customHeadline" />
            </h2>
            <p class="home__lede" data-reveal>
              أخبرنا بما تحتاجه على واتساب أو بالبريد الإلكتروني. الدوام
              {{ company.hours.days }}، {{ company.hours.time }}.
            </p>
            <OpenStatus class="home__status" data-reveal />
            <div class="home__reach" data-reveal>
              <WhatsAppCall
                look="ink"
                :subject="services.at(-1)?.title"
                :detail="company.phones.main.display"
              />
            </div>
            <ul role="list" class="home__channels" data-reveal>
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

          <div class="home__services">
            <h3 class="home__label" data-reveal>خدماتنا</h3>
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
            <ActionLink
              class="home__more"
              look="text"
              to="/services"
              label="تفاصيل الخدمات"
              data-reveal
            />
          </div>
        </div>
      </StoryChapter>
    </HomeStory>
  </div>
</template>

<style scoped lang="scss">
// The window size that holds the cinematic cover. Same as $cover in HomeStory.vue.
$cover: "(min-width: 64em) and (min-height: 36em)";
// A cover window short enough (laptops) that the chapters' text closes up.
$cover-short: "(min-width: 64em) and (min-height: 36em) and (max-height: 46em)";
// Story width from which the closing's call and services sit side by side.
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
  // Shared by every chapter
  // ---------------------------------------------------------------------------

  // The chapter's number, a short leaning bar, then what the chapter is about. The number and the
  // bar are a reader's place in the story; the words stay upright.
  &__kicker {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-block-end: var(--space-4);
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

  // A product's name, the chapter's headline: oversized, its words risen into view one by one.
  &__name,
  &__headline {
    margin: 0 0 var(--space-3);
    font-family: var(--font-display);
    font-size: var(--text-page);
    font-weight: 800;
    line-height: 1.2;

    @media #{$cover} {
      font-size: min(var(--text-page), 9svh);
    }
  }

  &__name {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--space-3);
  }

  &__latin {
    font-family: var(--font-sans);
    font-size: var(--text-body);
    font-weight: 600;
    color: var(--text-muted);
  }

  &__statement {
    font-family: var(--font-display);
    font-size: var(--text-card);
    font-weight: 600;
    line-height: 1.6;
  }

  &__desc {
    max-inline-size: 30rem;
    margin-block-start: var(--space-2);
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

  // Four of the product's features, each after a point in the product's colour; two columns only
  // where the list has room for them (never beside the stage's window).
  &__features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
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

  &__buy {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-4);
    margin-block-start: var(--space-5);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-5);
    margin-block-start: var(--space-5);
  }

  // Laptops: the cover is short, so the text closes up rather than run under the window's edge.
  @media #{$cover-short} {
    &__kicker {
      margin-block-end: var(--space-2);
    }

    &__statement {
      font-size: var(--text-lead);
    }

    &__desc {
      font-size: var(--text-ui);
      line-height: 1.7;
    }

    &__features {
      margin-block-start: var(--space-3);
    }

    &__buy,
    &__actions {
      margin-block-start: var(--space-4);
    }
  }

  // ---------------------------------------------------------------------------
  // 01 The opening
  // ---------------------------------------------------------------------------

  // Three lines, each kept whole and fitted to the text column; the last one sits on lime.
  // --title-measure is the column, --title-fit the longest line ("من شغلك،", 4.566em at weight
  // 700) over the 83% of the column it may take.
  &__title {
    --title-measure: min(100cqi - 2 * var(--edge), 30rem);
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
    text-align: start;
    text-wrap: nowrap;

    @media #{$cover} {
      --title-measure: var(--copy-w-intro);
      --title-size: min(
        var(--text-hero),
        var(--title-measure) / var(--title-fit),
        10.5svh
      );
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
  }

  // "أو" stays with its verb, never alone at the end of a line.
  &__keep {
    white-space: nowrap;
  }

  // Phones: both actions across the column, their leaning corners kept inside it. From a wider column
  // both on one row.
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
  // The chapters' own screens, shown when the story flows as a page
  // ---------------------------------------------------------------------------

  // The main screen, and a second over its lower corner on the reading side, set off from it by a
  // ring of the chapter's ground.
  &__media {
    --media-ground: var(--bg);

    position: relative;
    padding-block-end: 14%;

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
    inset-inline-start: -3%;
    inline-size: 48%;
  }

  // ---------------------------------------------------------------------------
  // 05 The closing call, on lime
  // ---------------------------------------------------------------------------

  // The call on the reading side; the services beside it, set large, the way the opening's
  // headline is set.
  &__closing {
    display: grid;
    gap: var(--space-8);

    @container story (width >= #{$side}) {
      grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
      align-items: center;
      column-gap: var(--space-9);
    }
  }

  &__status {
    margin-block-start: var(--space-2);
  }

  &__reach {
    margin-block-start: var(--space-5);
  }

  &__channels {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-5);
    margin-block-start: var(--space-3);
    padding: 0;
    list-style: none;
  }

  &__label {
    margin-block-end: var(--space-3);
    font-family: var(--font-sans);
    font-size: var(--text-ui);
    font-weight: 600;
    line-height: 1.7;
    color: var(--text-muted);
  }

  &__service-names {
    padding: 0;
    list-style: none;
  }

  // Each name is a mask its words rise into.
  &__service {
    padding-block: var(--space-3);
    border-block-start: 1px solid var(--border);
    clip-path: inset(0 -0.3em);
    font-family: var(--font-display);
    font-size: var(--text-flow);
    font-weight: 700;
    line-height: 1.45;

    @media #{$cover-short} {
      padding-block: var(--space-2);
      font-size: var(--text-card);
    }
  }

  &__service-name {
    display: block;
  }

  &__more {
    margin-block-start: var(--space-3);
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
    animation: home-forward var(--duration-slow) var(--ease-out) 280ms
      backwards;

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
