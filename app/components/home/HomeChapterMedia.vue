<script setup lang="ts">
import type { SolutionImage } from "~/data/solutions";

// A chapter's own screens, shown when the story flows as a page (StoryChapter's media slot): the
// main screen and, when there is one, a second over its corner. On the cinematic stage the stage
// stands in for them. The page's reveals (storyPage, in app/composables/home/) find them by
// data-media. `focus` names the detail of the main screen that a narrow story shows (see below).
const props = defineProps<{
  main: SolutionImage;
  second?: SolutionImage;
  focus?: "stock" | "insights" | "listing";
}>();

const mediaClass = computed(() =>
  props.focus ? `home__media--${props.focus}` : undefined,
);
</script>

<template>
  <div class="home__media" :class="mediaClass">
    <ProductWindow v-bind="main" class="home__shot" data-media="main" />
    <ProductWindow
      v-if="second"
      v-bind="second"
      class="home__shot home__shot--second"
      data-media="second"
    />
  </div>
</template>

<style scoped lang="scss">
// ---------------------------------------------------------------------------
// The chapters' own screens, shown when the story flows as a page: centred under the headings
// ---------------------------------------------------------------------------

// A narrow story's reading window: the main screen drawn at 2/3 of its real size, in a 3:2 view
// pinned on a detail (ProductWindow's --window-* properties). $w and $h are the screenshot at that
// scale; $x and $y how far the view sits from its inline-start edge and its top, at the same scale.
@mixin reading-view($w, $h, $x, $y) {
  --window-ratio: 3 / 2;
  --window-image-size: max(100%, #{$w});
  --window-shift-inline: clamp(0px, #{$x}, #{$w} - 100%);
  --window-shift-block: clamp(0px, #{$y}, #{$h} - 100% * 2 / 3);
}

// The main screen, and a second over its lower corner on the reading side, standing a little out
// past its edge, set off from it by a ring of the chapter's ground.
.home {
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

  // Below 48em the whole screen would be too small to read: the main screen shows the detail its
  // chapter's text names. The second screen and wider stories are unchanged.
  @container story (width < 48em) {
    // The inventory screen's header and first rows (names, codes, prices).
    &__media--stock &__shot:not(&__shot--second) {
      @include reading-view(1066.67px, 600px, 0px, 28px);
    }

    // The day's sales and profit cards beside the greeting, the program's menu left out.
    &__media--insights &__shot:not(&__shot--second) {
      @include reading-view(1066.67px, 600px, 144px, 56px);
    }

    // Dalaly's menu and the newest offers.
    &__media--listing &__shot:not(&__shot--second) {
      @include reading-view(910.67px, 512px, 0px, 0px);
    }
  }
}
</style>
