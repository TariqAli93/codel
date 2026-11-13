<script setup lang="ts">
import { company } from "~/data/company";
import ZirconTorrent from "~/components/effects/ZirconTorrent.vue";

// 01 Codel: the offer, and the window that the story keeps. Three roots, in HomeStory's slot as the
// page's first three: the opening's light and its shade (the stage's glow, which the timeline fades
// out on the way to chapter 02), then the chapter itself.
</script>

<template>
  <ZirconTorrent
    class="hero__effect"
    data-stage="glow"
    :track-parent="true"
    :scale="230"
    :zoom="64"
    :speed="58"
    :hover="20"
    :hover-speed="50"
    :glow="90"
    :floor="78"
    :placement="{ x: -18, y: 0, angle: 0, tilt: 0 }"
    :direction="{ flow: 'down', ripple: 'toward', streaks: 'toward' }"
    :advanced="{ horizon: 75, sparkles: 8, specks: 4, grain: 12 }"
  />
  <div class="hero__shade" data-stage="glow" aria-hidden="true" />
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
</template>

<style scoped lang="scss">
@use "~/assets/scss/story" as *;

// The headline's line box, and where the lime starts inside its last line: under the tails of the
// line above and over this line's ل.
$title-leading: 1.15;
$mark-top: 0.12;
// The hero's glyphs, drawn as masks: the black is only the mask's shape, the colour is the
// element's own.
$glyph-chat: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 3.5a8.5 8.5 0 1 1-3.9 16l-4.6 1 1-4.6A8.5 8.5 0 0 1 12 3.5z'/%3E%3C/svg%3E");
$glyph-arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 12H5m6-6-6 6 6 6'/%3E%3C/svg%3E");

// The opening's light and its shade. Written under the page's .home, as they always were: the extra
// class outranks ZirconTorrent's own root rule (its position: relative), whatever order the
// stylesheets load in.
.home {
  .hero__effect {
    position: absolute;
    z-index: -2;
    inset: 0;
    width: 100%;
    height: 100%;
    // Blurred, so no sharp strand of the light crosses a letter.
    // Dimmed, so it stays behind the text; a filter, because the stage's timeline owns `opacity`.
    filter: blur(5px) opacity(0.75);
  }
  .hero__shade {
    pointer-events: none;
    position: absolute;
    z-index: -1;
    inset: 0;
    background: linear-gradient(
      270deg,
      color-mix(in srgb, var(--bg) 96%, transparent) 0%,
      color-mix(in srgb, var(--bg) 85%, transparent) 31%,
      color-mix(in srgb, var(--bg) 22%, transparent) 65%,
      color-mix(in srgb, var(--bg) 8%, transparent) 100%
    );

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        360deg,
        color-mix(in srgb, var(--bg) 96%, transparent) 0%,
        color-mix(in srgb, var(--bg) 85%, transparent) 31%,
        color-mix(in srgb, var(--bg) 22%, transparent) 65%,
        color-mix(in srgb, var(--bg) 8%, transparent) 100%
      );
      z-index: -1;
      width: 100%;
      height: 100%;
    }

    // A pool of the ground behind the opening's text, so the headline and lede keep their contrast.
    &::after {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(
        ellipse 38% 30% at 50% 46%,
        color-mix(in srgb, var(--bg) 72%, transparent) 0%,
        color-mix(in srgb, var(--bg) 55%, transparent) 55%,
        transparent 100%
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 01 The opening: centred over its screen from $tablet
// ---------------------------------------------------------------------------

.home {
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

  &__lede {
    @include lede;
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
}

// The opening's entrance: plain CSS, so it starts with the first paint and waits for nothing. The
// text arrives first and fast (the headline reads by about 450ms), then the lede and actions; the
// slab and the screen follow on the stage (StoryStage). Every keyframe runs toward the resting
// style, which is what shows without motion or JavaScript.
// The story's timeline moves the lede with transform: its entrance only fades, because GSAP would
// fold a running CSS translate into its own transform and keep it.
@media (prefers-reduced-motion: no-preference) {
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
