<script setup lang="ts">
import type { Solution } from "~/data/solutions";

// A chapter's headings, in three tiers: the kicker (where you are in the story), the heading (the
// product's name or the chapter's line), then what supports it. A product chapter (`product`) shows
// the product's name, what it is and, as a page, its description and four features; across from them
// what it costs and how to ask. Any other chapter shows its line (`headline`), and across from it
// the supporting line (the `lede` slot) and whatever the default slot adds.
interface ChapterHead {
  // The chapter's number, "02".
  index: string;
  // What the chapter is about, written after its number.
  kicker: string;
  // The id of the chapter's h2 (the chapter's labelledby).
  titleId: string;
}

interface ProductHead extends ChapterHead {
  product: Solution;
  headline?: never;
}

interface LineHead extends ChapterHead {
  headline: string;
  product?: never;
}

defineProps<ProductHead | LineHead>();

defineSlots<{
  // A line chapter's supporting line. A slot, not a string: its text keeps the spaces Vue gives
  // static text, and it can hold the company's facts.
  lede?: () => unknown;
  // More across from the line, under the supporting line (chapter 05: whether we are open now).
  default?: () => unknown;
}>();
</script>

<template>
  <div class="home__head">
    <div class="home__head-main">
      <p class="home__kicker" data-reveal>
        <span class="home__index" dir="ltr" aria-hidden="true">{{ index }}</span>
        {{ kicker }}
      </p>
      <template v-if="product">
        <!-- prettier-ignore -->
        <h2 :id="titleId" class="home__name"><SplitWords :text="product.nameAr" /> <span class="home__latin" dir="ltr" data-reveal>{{ product.nameEn }}</span></h2>
        <p class="home__statement" data-reveal>{{ product.tagline }}</p>
        <p class="home__desc" data-reveal data-page-only>
          {{ product.description }}
        </p>
        <ul role="list" class="home__features" data-reveal data-page-only>
          <li v-for="feature in product.features.slice(0, 4)" :key="feature">
            {{ feature }}
          </li>
        </ul>
      </template>
      <h2 v-else-if="headline" :id="titleId" class="home__headline">
        <SplitWords :text="headline" />
      </h2>
    </div>
    <div v-if="product" class="home__head-side">
      <div class="home__buy" data-reveal>
        <ProductPrice :amount="product.priceIqd" />
        <LeanTag :label="`يعمل على ${product.platform}`" />
      </div>
      <div class="home__actions" data-reveal>
        <WhatsAppCall
          :subject="product.nameAr"
          label="اسأل عنه على واتساب"
          :hidden-suffix="product.nameAr"
          :glow="false"
        />
        <ActionLink
          look="text"
          :to="`/solutions/${product.slug}`"
          :label="`تفاصيل ${product.nameAr}`"
        />
      </div>
    </div>
    <div v-else class="home__head-side home__head-side--text">
      <p class="home__lede" data-reveal><slot name="lede" /></p>
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "~/assets/scss/story" as *;

// ---------------------------------------------------------------------------
// A chapter's headings: three tiers. The kicker (where you are in the story), the heading (the
// product's name or the chapter's line, the largest thing on the page after the opening's), then
// one supporting line. From $side they split into two equal columns that end on one line: who it is
// on the reading side, what it costs and how to ask on the other.
// ---------------------------------------------------------------------------

.home {
  &__head {
    display: grid;
    gap: var(--space-5) var(--copy-gap);

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
    @include lede;
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
}
</style>
