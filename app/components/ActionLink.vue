<script setup lang="ts">
// One link for actions. Three looks are buttons, leaning pills with their content turned back
// upright: 'solid' is the lime button with the lime glow, for the page's main call; 'ink' is the
// dark call button for a lime ground; 'outline' is the outlined button for a secondary action.
// 'text' is a plain underlined link with no lean. Its colours read --link-color, --link-rule,
// --link-rule-hover and --link-active, so a lime ground can set its own.
const props = withDefaults(
  defineProps<{
    to: string
    look?: 'solid' | 'ink' | 'outline' | 'text'
    // Buttons only. Without it solid and ink are lg, outline is md.
    size?: 'md' | 'lg'
    newTab?: boolean
    // The default slot replaces it when the label needs markup.
    label?: string
    // Shown after the label, left to right (the phone number).
    detail?: string
    // Read by screen readers only, after the label (e.g. the product a shared label is about).
    hiddenSuffix?: string
    // The solid look's lime glow.
    glow?: boolean
  }>(),
  {
    look: 'outline',
    size: undefined,
    newTab: false,
    label: undefined,
    detail: undefined,
    hiddenSuffix: undefined,
    glow: true
  }
)

const classes = computed(() => [
  `action--${props.look}`,
  props.look === 'text' ? undefined : `action--${props.size ?? (props.look === 'outline' ? 'md' : 'lg')}`,
  { 'action--glow': props.look === 'solid' && props.glow }
])

const hiddenText = computed(() =>
  [props.hiddenSuffix, props.newTab ? '(يفتح في نافذة جديدة)' : undefined].filter(Boolean).join(' ')
)
</script>

<template>
  <NuxtLink
    class="action"
    :class="classes"
    :to="to"
    :external="to.startsWith('#')"
    :no-prefetch="to.startsWith('#')"
    :target="newTab ? '_blank' : undefined"
    :rel="newTab ? 'noopener noreferrer' : undefined"
  >
    <!-- Kept on one line (and out of the formatter's reach): the spaces keep the parts apart in
         the link's accessible name. -->
    <!-- prettier-ignore -->
    <span class="action__content"><span class="action__label"><slot>{{ label }}</slot></span> <span v-if="detail" class="action__detail" dir="ltr">{{ detail }}</span> <span v-if="hiddenText" class="action__hidden">{{ hiddenText }}</span></span>
  </NuxtLink>
</template>

<style scoped lang="scss">
// The brand lean, and the counter-slant that turns a label back upright.
$lean: skewX(calc(var(--slant-angle) * -1));
$upright: skewX(var(--slant-angle));

.action {
  position: relative;
  display: inline-flex;
  align-items: center;

  &__content {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    min-inline-size: 0;
  }

  // ---------------------------------------------------------------------------
  // Buttons
  // ---------------------------------------------------------------------------

  &--solid,
  &--ink,
  &--outline {
    justify-content: center;
    border-radius: var(--radius-pill);
    font-family: var(--font-sans);
    font-weight: 600;
    line-height: 1.4;
    text-decoration: none;
    transform: $lean;
    transition: background-color var(--duration-fast) var(--ease-out);

    .action__content {
      justify-content: center;
      gap: 0 var(--space-3);
      padding-block: var(--space-2);
      transform: $upright;
    }
  }

  &--md {
    min-block-size: var(--control-md);
    padding-inline: var(--space-5);
    font-size: var(--text-ui);
  }

  &--lg {
    min-block-size: var(--control-lg);
    padding-inline: var(--space-6);
    font-size: var(--text-body);
  }

  &--solid {
    background-color: var(--primary);
    color: var(--on-primary);

    // Hover styles only where a pointer can hover: on touch, :hover sticks after a tap.
    @media (hover: hover) {
      &:hover {
        background-color: var(--primary-hover);
      }
    }

    &:active {
      background-color: var(--primary-active);
    }

    // On its own page (the header button on /contact) it goes quiet: there is nowhere to go. A real
    // border, like the outline look: forced-colours mode would remove a shadow ring.
    &[aria-current='page'] {
      border: 1.5px solid var(--border-strong);
      background-color: transparent;
      color: var(--text);
    }
  }

  // The glow on its own layer, so hover only changes its opacity. It leans with the button.
  &--glow {
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

    @media (hover: hover) {
      &:hover::after {
        opacity: 0.8;
      }
    }

    &[aria-current='page']::after {
      content: none;
    }
  }

  &--ink {
    background-color: var(--on-accent);
    color: var(--accent);

    @media (hover: hover) {
      &:hover {
        background-color: var(--surface-raised);
      }
    }

    &:active {
      background-color: var(--surface);
    }
  }

  &--outline {
    border: 1.5px solid var(--border-strong);
    color: var(--text);

    @media (hover: hover) {
      &:hover {
        background-color: var(--surface-raised);
      }
    }

    &:active {
      background-color: var(--surface);
    }
  }

  &__detail {
    font-weight: 500;
  }

  // ---------------------------------------------------------------------------
  // Text link
  // ---------------------------------------------------------------------------

  &--text {
    gap: 0.3em;
    min-block-size: var(--touch-target);
    font-weight: 600;
    overflow-wrap: anywhere;
    color: var(--link-color, var(--text));
    text-decoration-color: var(--link-rule, var(--border-strong));
    transition:
      color var(--duration-fast) var(--ease-out),
      text-decoration-color var(--duration-fast) var(--ease-out);

    .action__content {
      gap: 0.3em;
    }

    @media (hover: hover) {
      &:hover {
        text-decoration-color: var(--link-rule-hover, var(--accent-text));
      }
    }

    &:active {
      color: var(--link-active, var(--text-muted));
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
