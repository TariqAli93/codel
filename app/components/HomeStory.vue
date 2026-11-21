<script setup lang="ts">
import type { StageShots } from "~/components/StoryStage.vue";
import { beats } from "~/composables/home/storyConfig";
import { useStoryMotion } from "~/composables/home/useStoryMotion";

// The home page's story: five chapters (StoryChapter, in the default slot) over one stage
// (StoryStage). This file lays them out together; useStoryMotion (app/composables/home/) moves
// them.
//
// Two ways to show it, from one set of elements:
// - As a page (phones, tablets, short windows, reduced motion, and until GSAP has loaded): the
//   chapters follow one another, each with its own picture (the opening's is its stack of layers,
//   the others' their real screens); the stage is not shown. Complete without any script.
// - As a cinematic stage (a desktop-sized window, motion allowed, GSAP loaded): the story is
//   --story-length windows tall and its viewport sticks to the window while you scroll through it.
//   Every chapter's text shares one frame, and one scrubbed timeline hands the stage and the text
//   from chapter to chapter. CSS position: sticky holds it (no pin, so nothing is moved in the DOM
//   and nothing jumps on the way in or out).
// The opening is laid out identically both ways, so switching to the stage after load moves nothing.
defineProps<{
  shots: StageShots;
}>();

const root = ref<HTMLElement | null>(null);
const storyLength = beats.length + 1;
useStoryMotion(root);
</script>

<template>
  <div ref="root" class="story">
    <div class="story__viewport">
      <StoryStage class="story__stage" :shots="shots" />
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
// $cover (the same as coverQuery in app/composables/home/storyConfig.ts).
@use "~/assets/scss/story" as *;

// The story's layout lengths, shared by the stage and the chapters (both read them).
// --edge runs from the window edge to the content column, the same column as the header bar's, and
// --content-w is that column (100cqi is the story's own width: the window without its scrollbar).
.story {
  // The actual tour's duration plus the viewport, shared with the timeline configuration.
  --story-length: v-bind(storyLength);
  --edge: max(
    var(--page-gutter),
    calc((100cqi - var(--container-max)) / 2 + var(--page-gutter))
  );
  --content-w: calc(100cqi - 2 * var(--edge));
  --copy-gap: clamp(var(--space-7), 5cqi, var(--space-9));

  container: story / inline-size;

  // The cover: the story slides up behind the header and its first screen fills the window. Every
  // chapter keeps one frame: its heading in a band of fixed height under the header (--head-h, the
  // heading sits on the band's bottom line), then the window, centred, starting at the same line
  // in every chapter (--win-top). The window is as wide as the room under that line allows, never
  // narrower than 56rem nor wider than the column; on a short window it runs off the bottom edge.
  // In the opening it waits out of sight, tilted back under the window's bottom edge: --peek is how
  // much of it shows above that edge, in window heights (a plain number, which storyCinematic reads
  // too), and negative sets its top that far below the edge.
  @media #{$cover} {
    --header-room: calc(var(--header-height) + var(--space-3));
    --cover-pad: clamp(var(--space-4), 3svh, var(--space-6));
    --room-top: calc(var(--header-room) + var(--cover-pad));
    --head-h: clamp(9rem, 22svh, 13rem);
    --head-gap: clamp(var(--space-5), 3.5svh, var(--space-7));
    --win-top: calc(var(--room-top) + var(--head-h) + var(--head-gap));
    --win-w: min(
      var(--content-w),
      max(56rem, (100svh - var(--win-top) - var(--cover-pad)) * 16 / 9)
    );
    --peek: -6;

    margin-block-start: calc(-1 * var(--header-room));
  }
}

.story__viewport {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

// As a page: the chapters in order, and no stage. The opening's picture is its own stack of layers
// (HomeIntro) and every other chapter brings its screens, so the stage's window has nothing to show
// until the timeline raises it.
.story:not(.story--cinematic) {
  .story__stage {
    display: none;
  }

  // The mirror of data-page-only: what only the stage needs, a recap the page does without (its
  // entries already are the overview) and the tour's rail. Without JavaScript the story is never
  // cinematic, so these stay hidden.
  :deep([data-stage-only]) {
    display: none;
  }
}

// The cinematic stage: as tall as the story's scroll, its viewport held to the window throughout.
.story--cinematic {
  block-size: calc(var(--story-length) * 100svh);

  // Detail the stage leaves to the page and the product pages (a product's description and
  // features): still read by screen readers, not shown.
  :deep([data-page-only]) {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  // Chapter 05's scenes share one cell: only the one on show takes pointer input (data-active, set
  // by the timeline).
  :deep([data-scene]:not([data-active])) {
    pointer-events: none;
  }

  // Clipped, not hidden: `clip` makes no scroll container, so focusing a link near the bottom edge
  // can never scroll the stage out of place.
  .story__viewport {
    position: sticky;
    inset-block-start: 0;
    block-size: 100svh;
    overflow: clip;
  }

  .story__stage {
    grid-area: 1 / 1;
  }
}
</style>
