<script lang="ts">
import type { SolutionImage } from "~/data/solutions";

// The screens the stage plays, by the part each plays in the story. All are real screenshots from
// app/data/solutions.ts; the page picks them.
export interface StageShots {
  // Nuqta Plus's point of sale: the opening, then chapter 02.
  operations?: SolutionImage;
  // Nuqta Plus's home screen, inside the same menus as the point of sale: chapter 03.
  insights?: SolutionImage;
  // Nuqta Plus's sales report, over the home screen's corner in chapter 03.
  report?: SolutionImage;
  // Dalaly's list of properties for sale: chapter 04.
  listing?: SolutionImage;
  // One property in Dalaly, over the list's corner in chapter 04.
  detail?: SolutionImage;
}
</script>

<script setup lang="ts">
// The story's stage: one window that stays on screen from the first chapter to the last, the planes
// that change the world around it (Codel's lime slab, Dalaly's sand, Codel's lime again) and the
// screens it shows. The story's motion (app/composables/home/) moves all of it; this file only lays
// it out.
//
// As a page (phones, tablets, short windows, reduced motion, and until the motion has loaded) the
// stage is the opening's picture: the lime slab and the point of sale, nothing else (the parts
// marked stage__later are not even loaded). On the cinematic stage it fills the window behind every
// chapter.
//
// Scenery only (aria-hidden): each chapter's own text says what its screens show.
defineProps<{
  shots: StageShots;
}>();
</script>

<template>
  <div class="stage" aria-hidden="true">
    <!-- Codel's charcoal and lime, then Nuqta Plus. -->
    <div class="stage__world stage__world--nuqta">
      <div class="stage__slab" data-stage="slab" />
      <div class="stage__camera stage__camera--tilt" data-stage="camera">
        <div class="stage__light stage__later" data-stage="light" />
        <ProductWindow
          v-if="shots.operations"
          v-bind="shots.operations"
          alt=""
          eager
          class="stage__shot stage__shot--first"
          data-stage="operations"
        />
        <ProductWindow
          v-if="shots.insights"
          v-bind="shots.insights"
          alt=""
          class="stage__shot stage__later"
          data-stage="insights"
        />
        <ProductWindow
          v-if="shots.report"
          v-bind="shots.report"
          alt=""
          class="stage__support stage__later"
          data-stage="report"
        />
      </div>
    </div>

    <!-- Dalaly's sand: a world of its own, swept in over the first along the brand's lean. -->
    <div
      class="stage__world stage__world--dalaly stage__later"
      data-stage="dalaly"
      data-theme="light"
    >
      <div class="stage__camera" data-stage="camera">
        <ProductWindow
          v-if="shots.listing"
          v-bind="shots.listing"
          alt=""
          class="stage__shot"
          data-stage="listing"
        />
        <ProductWindow
          v-if="shots.detail"
          v-bind="shots.detail"
          alt=""
          class="stage__support"
          data-stage="detail"
        />
        <!-- The window's screen turning lime, before the lime takes the whole stage. -->
        <div class="stage__lime-screen" data-stage="lime-screen" />
      </div>
    </div>

    <!-- Codel's lime: it fills the window, then the whole stage, for the closing call. The symbol
         sits where the window was, on the lime, for the moment between the two. -->
    <div class="stage__lime stage__later" data-stage="lime" />
    <div class="stage__world stage__world--mark stage__later">
      <div class="stage__camera stage__camera--mark">
        <img
          class="stage__mark"
          data-stage="mark"
          src="/brand/codel-symbol-ink.svg"
          alt=""
          width="303"
          height="117"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// $lean, $cover and $tablet (from which the opening's screen shows whole).
@use "~/assets/scss/story" as *;

// ---------------------------------------------------------------------------
// As a page: under the opening's text, the lime slab and one screen running off the end edge
// ---------------------------------------------------------------------------

.stage {
  position: relative;
  isolation: isolate;
  padding-block: var(--space-6) var(--space-7);
}

// Everything after the opening waits for the cinematic stage (HomeStory's .story--cinematic). Written
// to outrank every layout rule below, so nothing of it ever shows (or loads) on the page.
.stage .stage__later {
  display: none;
}

.stage__world {
  position: relative;
  // The ground under a support window's ring.
  --stage-ground: var(--bg);
}

// On phones the window runs from the content edge on the reading side out past the end edge, a crop
// of the point of sale's menu, search and first cards. From $tablet the whole screen, centred in the
// column (on a wide but short window, never taller than it can show).
.stage__camera {
  position: relative;
  isolation: isolate;
  display: grid;
  inline-size: calc(1.15 * (100cqi - var(--edge)));
  margin-inline-start: var(--edge);

  @container story (width >= #{$tablet}) {
    inline-size: min(var(--content-w), 56rem);
    margin-inline: auto;
  }
}

.stage__shot {
  --window-radius: var(--radius-md);

  grid-area: 1 / 1;
}

.stage__shot--first {
  @container story (width < #{$tablet}) {
    --window-ratio: 2;
    --window-zoom: 1.5;
  }
}

// Flat lime with the brand lean behind the screen: on phones from a third of the way along it out
// past the end edge; from $tablet a band centred behind it. The fill is its own layer, so the entrance
// can wipe the fill while the scroll clips the slab.
.stage__slab {
  position: absolute;
  z-index: -1;
  inset-block: calc(-1 * var(--space-6)) calc(-1 * var(--space-7));
  inset-inline: 38% calc(-1 * var(--space-10));
  transform: $lean;

  @container story (width >= #{$tablet}) {
    inset-block: 30% calc(-1 * var(--space-7));
    inset-inline: 18%;
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: var(--accent);
  }
}

// ---------------------------------------------------------------------------
// The cover (page and cinematic stage alike): the stage fills the window behind the text
// ---------------------------------------------------------------------------

// The window is centred under the headings' band, its top on the same line in every chapter
// (--win-top, HomeStory), as wide as the room allows (--win-w); on a short window it runs off the
// bottom edge. In the opening it is set down so only its top shows under the offer (--peek), tilted
// back and a little smaller, on a lime band; the story raises and straightens it. The pose is
// written as plain numbers so the stage's motion (tilt and drop in storyCinematic) reads them and
// starts from exactly this pose.
@media #{$cover} {
  // The stage is exactly the window's height and clips what it holds, so the opening's lowered
  // window never spills onto the next chapter on the page. Clipped, not hidden: `clip` makes no
  // scroll container, so nothing can ever scroll it out of place.
  .stage {
    overflow: clip;
    padding: 0;
  }

  .stage__world {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    align-items: start;
    justify-items: center;
    padding-block-start: var(--win-top);
  }

  // Every camera turns and scales about the window's centre, so the two worlds' windows stay on top
  // of each other through any move.
  .stage__camera {
    grid-area: 1 / 1;
    inline-size: var(--win-w);
    margin: 0;
    transform-origin: 50% 50%;
  }

  .stage__camera--tilt {
    --tilt-depth: 1600;
    --tilt-x: 24;
    --tilt-scale: 0.92;
    // Down from its place until only --peek (in window heights) of it shows above the bottom edge.
    --tilt-drop: calc((100 - var(--peek)) * 1svh - var(--win-top));

    transform: perspective(calc(var(--tilt-depth) * 1px))
      translate(0, var(--tilt-drop)) rotateX(calc(var(--tilt-x) * 1deg))
      scale(var(--tilt-scale));
  }

  // A leaning plinth the opening's window rises from: a little wider than the window, so its leaning
  // sides show on both sides of it, from just above its top down to the bottom edge.
  .stage__slab {
    position: relative;
    z-index: auto;
    inset: auto;
    grid-area: 1 / 1;
    align-self: stretch;
    inline-size: calc(1.04 * var(--win-w));
    margin-block-start: calc((98.5 - var(--peek)) * 1svh - var(--win-top));
  }
}

// ---------------------------------------------------------------------------
// The cinematic stage only
// ---------------------------------------------------------------------------

.story--cinematic .stage {
  overflow: clip;

  // Everything held back on the page comes in (these outrank `.stage .stage__later`).
  .stage__later {
    display: block;
  }

  .stage__world.stage__later {
    display: grid;
  }

  // Dalaly's world: its paper ground, and its windows on the light theme's tokens.
  .stage__world--dalaly {
    --stage-ground: var(--dalaly-ground);

    background-color: var(--dalaly-ground);
  }

  .stage__lime {
    position: absolute;
    inset: 0;
    background-color: var(--accent);
  }

  // Exactly the window's box and corners (the camera is as big as its main window).
  .stage__lime-screen {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-md);
    background-color: var(--accent);
  }

  // A pool of Nuqta Plus's violet behind its window: the stage's only light.
  .stage__light {
    position: absolute;
    z-index: -1;
    inset: -35% -25%;
    background: radial-gradient(
      closest-side,
      color-mix(in srgb, var(--nuqta-accent) 30%, transparent),
      transparent
    );
  }

  // A second screen over the main one's lower corner on the reading side, standing a little out
  // past its edge, set off from it by a ring of the world's ground.
  .stage__support {
    --window-radius: var(--radius-md);
    --window-ring: 0 0 0 var(--space-2) var(--stage-ground);

    position: absolute;
    inset-block-start: 46%;
    inset-inline-start: -6%;
    inline-size: 40%;
  }

  // The same box as the windows (they are 16:9), so the symbol sits at the window's centre.
  .stage__camera--mark {
    aspect-ratio: 16 / 9;
    place-items: center;
  }

  .stage__mark {
    inline-size: 22%;
    block-size: auto;
  }
}

// ---------------------------------------------------------------------------
// The opening's entrance: plain CSS, so it starts with the first paint and waits for nothing. The
// slab is wiped in from the reading start, then the screen arrives. Every keyframe runs toward the
// resting style, which is what shows without motion or JavaScript.
// ---------------------------------------------------------------------------

@media (prefers-reduced-motion: no-preference) {
  .stage__slab::before {
    animation: stage-slab var(--duration-slow) var(--ease-out) 240ms backwards;
  }

  .stage__shot--first {
    animation: stage-arrive var(--duration-entrance) var(--ease-out) 380ms
      backwards;
  }
}

// From the inline start (the right edge; the site is right to left only), in the slab's own leaning
// coordinates, so the wipe's edge leans with it.
@keyframes stage-slab {
  from {
    clip-path: inset(0 0 0 100%);
  }

  to {
    clip-path: inset(0);
  }
}

@keyframes stage-arrive {
  from {
    opacity: 0;
    translate: 0 1.5rem;
  }
}
</style>
