<script setup lang="ts">
// The closing panel of a page: a heading, a sentence, and the actions in the default slot.
// A parent can recolour it with --closing-ground and --closing-ink.
withDefaults(
  defineProps<{
    heading: string
    text?: string
  }>(),
  { text: undefined }
)

const headingId = useId()
</script>

<template>
  <section class="closing" :aria-labelledby="headingId">
    <div class="closing__copy">
      <h2 :id="headingId" class="closing__heading">{{ heading }}</h2>
      <p v-if="text" class="closing__text">{{ text }}</p>
    </div>
    <div v-if="$slots.default" class="closing__actions"><slot /></div>
  </section>
</template>

<style scoped lang="scss">
$closing-split: 64em;

.closing {
  margin-block-start: var(--section-gap);
  padding: var(--panel-pad);
  border-radius: var(--radius-lg);
  background-color: var(--closing-ground, var(--accent));
  color: var(--closing-ink, var(--on-accent));

  @media (width >= $closing-split) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
    column-gap: var(--space-8);
  }

  --focus: var(--on-accent);
  --link-color: var(--on-accent);
  --link-rule: var(--on-accent);
  --link-rule-hover: var(--on-accent);
  --primary: var(--on-accent);
  --on-primary: var(--accent);
  --primary-hover: var(--charcoal-700);
  --primary-active: var(--charcoal-800);
  --text: var(--on-accent);
  --text-muted: var(--on-accent);
  --surface: var(--accent);
  --surface-raised: var(--accent);
  --link-active: var(--on-accent);
  --border-strong: var(--on-accent);
  --glow-accent: none;
  &__heading {
    font-size: clamp(2.375rem,5.7vw,5.25rem);
    line-height: 1.25;
    margin: 0;
  }

  &__text {
    max-inline-size: 32rem;
    margin-block-start: var(--space-3);
    line-height: 1.75;
    color: inherit;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4);
    margin-block-start: var(--space-6);

    @media (width >= $closing-split) {
      margin-block-start: 0;
    }
  }
}
.closing :deep(.action--outline:hover){background:var(--on-accent);color:var(--accent)}.closing :deep(.action--ink:hover){background:var(--charcoal-700);color:var(--accent)}
</style>
