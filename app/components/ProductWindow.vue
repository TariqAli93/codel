<script setup lang="ts">
// A real product screenshot in a desktop window frame: a title bar with the product's name, then
// the image at its real proportions (width and height reserve its space, so nothing shifts).
// `plan` draws the same window as a lime line drawing: the frame as lines only, and the screenshot
// traced to its edges by an SVG filter (no title, no fill, no shadow).
const props = withDefaults(
  defineProps<{
    src: string
    alt: string
    width: number
    height: number
    title?: string
    eager?: boolean
    plan?: boolean
  }>(),
  { title: undefined, eager: false, plan: false }
)

// One filter per drawing, so two drawings on a page never share an id. Taken only in plan mode:
// the prop is the same on the server and in the browser, so the id survives hydration.
const filterId = props.plan ? `window-plan-${useId()}` : ''
</script>

<template>
  <figure class="window" :class="{ 'window--plan': plan }">
    <div class="window__bar" aria-hidden="true">
      <span v-if="title && !plan" class="window__title">{{ title }}</span>
      <span class="window__lights"><span /><span /><span /></span>
    </div>
    <div class="window__view">
      <!-- The screenshot's edges: luminance, a 3x3 edge kernel, edge strength as alpha, then lime. -->
      <svg
        v-if="plan"
        class="window__image"
        :viewBox="`0 0 ${width} ${height}`"
        :width="width"
        :height="height"
        :role="alt ? 'img' : undefined"
        :aria-label="alt || undefined"
        :aria-hidden="alt ? undefined : 'true'"
      >
        <filter
          :id="filterId"
          x="0"
          y="0"
          width="1"
          height="1"
          color-interpolation-filters="sRGB"
        >
          <feColorMatrix type="luminanceToAlpha" result="luminance" />
          <feColorMatrix
            in="luminance"
            type="matrix"
            values="0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 0 1"
            result="grey"
          />
          <feConvolveMatrix
            in="grey"
            order="3"
            kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1"
            preserveAlpha="true"
            result="edges"
          />
          <feColorMatrix
            in="edges"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.7 0 0 0 0"
            result="strength"
          />
          <feFlood class="window__ink" result="ink" />
          <feComposite in="ink" in2="strength" operator="in" />
        </filter>
        <image :href="src" :width="width" :height="height" :filter="`url(#${filterId})`" />
      </svg>
      <img
        v-else
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

  &__lights {
    display: flex;
    gap: 0.3rem;

    span {
      inline-size: 0.5rem;
      block-size: 0.5rem;
      border-radius: 50%;
      background-color: var(--border-strong);
    }
  }

  // A parent can crop the screen to a focused view (on small screens): --window-ratio sets the
  // view's shape and --window-zoom how much wider than the frame the screenshot is drawn. The view
  // keeps the screenshot's top and inline-start edge: in these RTL apps, the menu and the headings.
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

  // The plan: the same frame as lines only, with the lights where the titled frame has them.
  &--plan {
    --plan-line: color-mix(in srgb, var(--accent) 35%, transparent);

    border-color: var(--plan-line);
    background-color: transparent;
    box-shadow: none;

    .window__bar {
      border-block-end-color: var(--plan-line);
      background-color: transparent;
    }

    .window__lights {
      margin-inline-start: auto;

      span {
        border: 1px solid var(--plan-line);
        background-color: transparent;
      }
    }
  }

  // The colour of the traced lines (CSS properties of the filter's flood): lime, held well below
  // full strength so the brightest line stays quieter than any lime you act on.
  &__ink {
    flood-color: var(--accent);
    flood-opacity: 0.6;
  }
}
</style>
