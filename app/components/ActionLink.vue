<script setup lang="ts">
// One link for actions. Both looks lean with the brand slant and keep their content upright:
// 'solid' is the lime button with the lime glow, for the page's main call,
// 'ink' is the dark call button for a lime ground (the contact band),
// 'outline' is an outlined button with a small lime point at its start.
const props = withDefaults(
  defineProps<{
    to: string
    look?: 'solid' | 'ink' | 'outline'
    newTab?: boolean
    label: string
    // Shown after the label, left to right (the phone number); the outline look does not show it.
    detail?: string
    // Read by screen readers only, after the label (e.g. the product a shared label is about).
    hiddenSuffix?: string
  }>(),
  { look: 'outline', newTab: false, detail: undefined, hiddenSuffix: undefined }
)

const showDetail = computed(() => props.look !== 'outline' && Boolean(props.detail))

const hiddenText = computed(() =>
  [props.hiddenSuffix, props.newTab ? '(يفتح في نافذة جديدة)' : undefined].filter(Boolean).join(' ')
)
</script>

<template>
  <NuxtLink
    class="action"
    :class="`action--${look}`"
    :to="to"
    :external="to.startsWith('#')"
    :target="newTab ? '_blank' : undefined"
    :rel="newTab ? 'noopener noreferrer' : undefined"
  >
    <!-- Kept on one line: the spaces keep the parts apart in the link's accessible name. -->
    <span class="action__content"><span class="action__label">{{ label }}</span> <span v-if="showDetail" class="action__divider" aria-hidden="true" /> <span v-if="showDetail" class="action__detail" dir="ltr">{{ detail }}</span> <span v-if="hiddenText" class="action__hidden">{{ hiddenText }}</span></span>
  </NuxtLink>
</template>

<style scoped lang="scss">
// The brand lean, and the counter-slant that turns a label back upright.
$lean: skewX(calc(var(--slant-angle) * -1));
$upright: skewX(var(--slant-angle));

.action {
  position: relative;
  text-decoration: none;
  transform: $lean;

  &__content {
    transform: $upright;
  }

  // The main call: a leaning lime button with a lime glow.
  &--solid {
    display: inline-flex;
    align-items: center;
    min-block-size: var(--control-lg);
    padding-inline: var(--space-6);
    border-radius: var(--radius-sm);
    background-color: var(--primary);
    color: var(--on-primary);
    transition: background-color var(--duration-fast) var(--ease-out);

    // The glow on its own layer, so hover only changes its opacity. It leans with the button.
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      box-shadow: var(--glow-accent);
      opacity: 0.4;
      pointer-events: none;
      transition: opacity var(--duration-base) var(--ease-out);
    }

    // The content steps forward on hover (forward is to the left in RTL).
    @media (hover: hover) {
      &:hover {
        background-color: var(--primary-hover);

        &::after {
          opacity: 0.8;
        }

        .action__content {
          translate: calc(var(--space-2) * -1) 0;
        }
      }
    }

    &:active {
      background-color: var(--primary-active);
    }
  }

  &--solid &__content {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-3);
    padding-block: var(--space-2);
    transition: translate var(--duration-base) var(--ease-out);

    // Narrow phones: the number under the label, no divider.
    @media (width < 26em) {
      flex-direction: column;
      align-items: flex-start;
      gap: 0;
    }
  }

  &--solid &__label {
    font-family: var(--font-display);
    font-size: 1.0625rem;
    font-weight: 700;
    line-height: 1.4;
  }

  // Leans inside the upright content, so it shares the button's slant.
  &__divider {
    inline-size: var(--stroke);
    block-size: 1.375rem;
    border-radius: var(--radius-pill);
    background-color: currentColor;
    opacity: 0.35;
    transform: $lean;

    @media (width < 26em) {
      display: none;
    }
  }

  &__detail {
    font-size: 1.0625rem;
    font-weight: 500;
  }

  // The call on a lime ground: dark with lime text, leaning like the lime button.
  &--ink {
    display: inline-flex;
    align-items: center;
    min-block-size: var(--control-lg);
    padding-inline: var(--space-6);
    border-radius: var(--radius-sm);
    background-color: var(--on-accent);
    color: var(--accent);
    font-weight: 600;
    transition:
      background-color var(--duration-fast) var(--ease-out),
      scale var(--duration-fast) var(--ease-out);

    @media (hover: hover) {
      &:hover {
        background-color: var(--surface-raised);
      }
    }

    &:active {
      scale: 0.96;
    }
  }

  &--ink &__content {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-3);
    padding-block: var(--space-2);
  }

  // A secondary action: a leaning outlined button with the lime point at the start of its
  // upright content.
  &--outline {
    display: inline-flex;
    align-items: center;
    min-block-size: var(--control-md);
    padding-inline: var(--space-4) var(--space-5);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.5;
    color: var(--text);
    transition:
      border-color var(--duration-fast) var(--ease-out),
      scale var(--duration-fast) var(--ease-out);

    @media (hover: hover) {
      &:hover {
        border-color: var(--text);

        .action__content::before {
          scale: 1.5;
        }
      }
    }

    &:active {
      scale: 0.97;
    }
  }

  &--outline &__content {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);

    // Nudged down to sit on the Arabic letter bodies rather than the line's centre.
    &::before {
      content: '';
      flex: none;
      inline-size: var(--point-sm);
      block-size: var(--point-sm);
      border-radius: 50%;
      background-color: var(--accent);
      translate: 0 0.08em;
      transition: scale var(--duration-base) var(--ease-out);
    }
  }

  &__hidden {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
