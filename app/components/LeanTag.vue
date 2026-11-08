<script setup lang="ts">
// A small category label that leans like a button, with its text turned back upright.
// Not interactive: use ActionLink for anything you can press.
defineProps<{
  label: string
}>()
</script>

<template>
  <span class="tag"><span class="tag__label">{{ label }}</span></span>
</template>

<style scoped lang="scss">
.tag {
  display: inline-flex;
  align-items: center;
  inline-size: fit-content;
  block-size: 1.75rem;
  padding-inline: var(--space-3);
  border-radius: var(--radius-pill);
  box-shadow: inset 0 0 0 1px var(--border-strong);
  font-size: var(--text-small);
  font-weight: 600;
  line-height: 1.7;
  white-space: nowrap;
  color: var(--text-muted);
  transform: skewX(calc(var(--slant-angle) * -1));

  &__label {
    transform: skewX(var(--slant-angle));
  }
}
</style>
