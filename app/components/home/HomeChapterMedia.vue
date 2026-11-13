<script setup lang="ts">
import type { SolutionImage } from "~/data/solutions";

// A chapter's own screens, shown when the story flows as a page (StoryChapter's media slot): the
// main screen and, when there is one, a second over its corner. On the cinematic stage the stage
// stands in for them. The page's reveals (storyPage, in app/composables/home/) find them by
// data-media.
defineProps<{
  main: SolutionImage;
  second?: SolutionImage;
}>();
</script>

<template>
  <div class="home__media">
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
}
</style>
