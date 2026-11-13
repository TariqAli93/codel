<script setup lang="ts">
// One chapter of the home page's story: its text, and (shown when the story flows as a page) its
// own screens. HomeStory lays the chapters out. As a page (phones, tablets, short windows, reduced
// motion, and until the motion has loaded) the chapters follow one another, each on its own ground.
// On the cinematic stage they share one window-sized frame over the stage and the story's timeline
// shows one at a time; the stage then stands in for their screens.
withDefaults(
  defineProps<{
    // Read by the story's motion in app/composables/home/ (data-chapter).
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
// $cover, the window size that holds the cinematic cover.
@use "~/assets/scss/story" as *;

// As a page, every chapter is one column: its text (laid out by the page), then its screens centred
// under it, no wider than the stage's window.
.chapter {
  position: relative;
  padding-block-start: var(--section-gap);
  padding-inline: var(--edge);

  // Dalaly's own paper ground and dark ink, from the window edge to the window edge.
  &--sand {
    // The light theme's lime text is under 4.5:1 on the sand at the kicker's size; the ink is not.
    --accent-text: var(--dalaly-ink);

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
  }

  // Dalaly's sand meets the closing's lime directly, with no strip of charcoal between them.
  &--sand + &--lime {
    margin-block-start: 0;
  }

  // The opening's screen is the stage itself (HomeStory places them together).
  &--intro {
    padding-block-start: var(--space-4);
  }

  // The text and the screens share one centred column, so their edges line up.
  &__copy,
  &__media {
    max-inline-size: 56rem;
    margin-inline: auto;
  }

  &__media {
    margin-block-start: var(--space-7);
  }

  &--intro &__copy {
    max-inline-size: none;
  }
}

// The cover: the opening fills the window, its text centred in the room between the header and the
// top of its screen (which shows its top --peek, StoryStage). The same in the flowing page and on
// the cinematic stage, so the stage can take over from the page without a single pixel moving.
@media #{$cover} {
  .chapter--intro {
    display: grid;
    align-content: center;
    justify-items: center;
    min-block-size: 100svh;
    padding-block: var(--room-top) calc(var(--peek) * 1svh + var(--head-gap));

    .chapter__copy {
      inline-size: min(100%, 60rem);
    }
  }
}

// The cinematic stage: every chapter takes the same frame over the stage, one after another in
// time. Its headings sit in the band under the header (--head-h) as wide as the window and on the
// band's bottom line, right over the window; a heading ever taller than the band grows upward, into
// the room under the header, never over the window. The closing call fills the frame. Only the
// chapter on show takes pointer input (data-active, set by the timeline); the rest stay in the
// reading and tab order, and focus brings their chapter on show.
.story--cinematic .chapter {
  grid-area: 1 / 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: var(--head-h);
  align-content: start;
  block-size: 100svh;
  min-block-size: 0;
  margin: 0;
  padding-block: var(--room-top) 0;
  padding-inline: var(--edge);
  background-color: transparent;
  pointer-events: none;

  .chapter__copy {
    align-self: end;
    inline-size: min(100%, var(--win-w));
    max-inline-size: none;
    margin-inline: auto;
  }

  .chapter__media {
    display: none;
  }
}

.story--cinematic .chapter--intro {
  grid-template-rows: none;
  align-content: center;
  padding-block-end: calc(var(--peek) * 1svh + var(--head-gap));

  .chapter__copy {
    align-self: auto;
    inline-size: min(100%, 60rem);
  }
}

.story--cinematic .chapter--custom {
  grid-template-rows: none;

  .chapter__copy {
    align-self: start;
  }
}

.story--cinematic .chapter[data-active] .chapter__copy {
  pointer-events: auto;
}
</style>
