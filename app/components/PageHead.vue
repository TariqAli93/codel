<script setup lang="ts">
// The top of an interior page: the h1, a lede, and any actions passed in the default slot.
// The space below it is the parent's to set.
withDefaults(
  defineProps<{
    title: string
    lede?: string
  }>(),
  { lede: undefined }
)
</script>

<template>
  <div class="page-head">
    <h1 class="page-head__title">{{ title }}</h1>
    <p v-if="lede" class="page-head__lede">{{ lede }}</p>
    <div v-if="$slots.default" class="page-head__actions"><slot /></div>
  </div>
</template>

<style scoped lang="scss">
.page-head {
  &__title:last-child {
    margin-block-end: 0;
  }

  &__lede {
    max-inline-size: var(--measure);
    font-size: var(--text-lead);
    line-height: 1.8;
    color: var(--text-muted);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4);
    margin-block-start: var(--space-6);
  }
}
</style>
