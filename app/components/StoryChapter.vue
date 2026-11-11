<script setup lang="ts">
// One chapter of the home page's story: its text, and (shown when the story flows as a page) its
// own screens. HomeStory lays the chapters out. As a page (phones, tablets, short windows, reduced
// motion, and until the motion has loaded) the chapters follow one another, each on its own ground.
// On the cinematic stage they share one window-sized frame over the stage and the story's timeline
// shows one at a time; the stage then stands in for their screens.
withDefaults(
  defineProps<{
    // Read by HomeStory's timeline (data-chapter).
    name: 'intro' | 'nuqta' | 'insights' | 'dalaly' | 'custom'
    // The id of the chapter's heading.
    labelledby: string
    // The chapter's ground: Codel's charcoal, Dalaly's sand (the light theme's tokens, scoped here),
    // or Codel's lime (the closing call).
    ground?: 'charcoal' | 'sand' | 'lime'
  }>(),
  { ground: 'charcoal' }
)
</script>

<template>
  <section
    class="chapter"
    :class="[`chapter--${name}`, `chapter--${ground}`]"
    :data-chapter="name"
    :data-theme="ground === 'sand' ? 'light' : undefined"
    :aria-labelledby="labelledby"
  >
    <div class="chapter__copy">
      <slot />
    </div>
    <div v-if="$slots.media" class="chapter__media">
      <slot name="media" />
    </div>
  </section>
</template>

<style scoped lang="scss">
// The window size that holds the cinematic cover. Same as $cover in HomeStory.vue and StoryStage.vue
// and coverQuery in HomeStory's script.
$cover: "(min-width: 64em) and (min-height: 36em)";
// From here a chapter's text and screens sit side by side (on the story's own width).
$side: 64rem;

.chapter {
  position: relative;
  padding-block-start: var(--section-gap);
  padding-inline: var(--edge);

  @container story (width >= #{$side}) {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    align-items: center;
    column-gap: var(--copy-gap);
  }

  // Dalaly's own paper ground and dark ink, from the window edge to the window edge.
  &--sand {
    margin-block-start: var(--section-gap);
    padding-block-end: var(--section-gap);
    background-color: var(--dalaly-ground);
    color: var(--dalaly-ink);
  }

  // Codel's lime: dark text and links, and a dark focus ring so it stays visible.
  &--lime {
    --text: var(--on-accent);
    --text-muted: color-mix(in srgb, var(--on-accent) 78%, var(--accent));
    --accent-text: var(--on-accent);
    --border: color-mix(in srgb, var(--on-accent) 22%, var(--accent));
    --focus: var(--on-accent);
    --link-color: var(--on-accent);
    --link-rule: color-mix(in srgb, var(--on-accent) 60%, transparent);
    --link-rule-hover: var(--on-accent);
    --link-active: var(--on-accent);

    margin-block-start: var(--section-gap);
    padding-block: clamp(var(--space-8), 8vw, var(--space-10));
    background-color: var(--accent);
    color: var(--on-accent);

    @container story (width >= #{$side}) {
      display: block;
    }
  }

  // The opening's screen is the stage itself (HomeStory places them together).
  &--intro {
    padding-block-start: var(--space-4);

    @container story (width >= #{$side}) {
      display: block;
    }
  }

  &__media {
    margin-block-start: var(--space-7);

    @container story (width >= #{$side}) {
      margin-block-start: 0;
    }
  }
}

// The cover: the opening fills the window, its text centred in the room under the header, on the
// reading side. The same in the flowing page and on the cinematic stage, so the stage can take over
// from the page without a single pixel moving.
@media #{$cover} {
  .chapter--intro {
    display: grid;
    align-content: center;
    min-block-size: 100svh;
    padding-block: var(--room-top) var(--cover-pad);

    .chapter__copy {
      inline-size: var(--copy-w-intro);
    }
  }
}

// The cinematic stage: every chapter takes the same frame over the stage, one after another in
// time. Only the chapter on show takes pointer input (data-active, set by the timeline); the rest
// stay in the reading and tab order, and focus brings their chapter on show.
.story--cinematic .chapter {
  grid-area: 1 / 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-content: center;
  block-size: 100svh;
  min-block-size: 0;
  margin: 0;
  padding-block: var(--room-top) var(--cover-pad);
  padding-inline: var(--edge);
  background-color: transparent;
  pointer-events: none;

  .chapter__copy {
    inline-size: var(--copy-w);
  }

  .chapter__media {
    display: none;
  }
}

.story--cinematic .chapter--intro .chapter__copy {
  inline-size: var(--copy-w-intro);
}

.story--cinematic .chapter--custom .chapter__copy {
  inline-size: auto;
}

.story--cinematic .chapter[data-active] .chapter__copy {
  pointer-events: auto;
}
</style>
