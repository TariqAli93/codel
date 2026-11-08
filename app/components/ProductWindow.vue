<script setup lang="ts">
// A real product screenshot in a desktop window frame: a title bar with the product's name, then
// the image at its real proportions (width and height reserve its space, so nothing shifts).
withDefaults(
  defineProps<{
    src: string
    alt: string
    width: number
    height: number
    title?: string
    eager?: boolean
  }>(),
  { title: undefined, eager: false }
)
</script>

<template>
  <figure class="window">
    <div class="window__bar" aria-hidden="true">
      <span v-if="title" class="window__title">{{ title }}</span>
      <span class="window__lights"><span /><span /><span /></span>
    </div>
    <div class="window__view">
      <img
        class="window__image"
        :src="src"
        :alt="alt"
        :width="width"
        :height="height"
        :loading="eager ? 'eager' : 'lazy'"
        :fetchpriority="eager ? 'high' : undefined"
        decoding="async"
      />
    </div>
  </figure>
</template>

<style scoped lang="scss">
.window {
  overflow: hidden;
  margin: 0;
  border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
  border-radius: var(--radius-lg);
  background-color: var(--surface-raised);
  box-shadow:
    var(--window-ring, 0 0 0 0 transparent),
    0 1.5rem 3rem -1rem color-mix(in srgb, black 55%, transparent),
    0 0.25rem 0.75rem color-mix(in srgb, black 25%, transparent);

  &__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    block-size: 1.75rem;
    padding-inline: var(--space-3);
    border-block-end: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
    background-color: var(--surface);
  }

  // Tall enough for the dots under ي (a line height of 1 cut them off), and still inside the bar.
  &__title {
    overflow: hidden;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.7;
    white-space: nowrap;
    color: var(--text-muted);
  }

  // A parent can tune the frame with four custom properties. --window-ring is a shadow drawn before
  // the frame's own (a ring of the page's ground, to set one window off another). --window-lights:
  // none hides the lights (the home hero, whose apps run on Windows). --window-ratio and
  // --window-zoom crop the screen to a focused view: the view's shape, and how much wider than the
  // frame the screenshot is drawn. The view keeps the screenshot's top and inline-start edge: in
  // these RTL apps, the menu and the headings.
  &__lights {
    display: var(--window-lights, flex);
    gap: 0.3rem;

    span {
      inline-size: 0.5rem;
      block-size: 0.5rem;
      border-radius: 50%;
      background-color: var(--border-strong);
    }
  }

  &__view {
    overflow: hidden;
    aspect-ratio: var(--window-ratio, auto);
  }

  &__image {
    display: block;
    inline-size: calc(100% * var(--window-zoom, 1));
    max-inline-size: none;
    block-size: auto;
  }
}
</style>
