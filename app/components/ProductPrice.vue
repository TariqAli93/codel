<script setup lang="ts">
// A product's price: Western digits, then the currency in Arabic. Rubik has tabular figures
// (Readex Pro does not), so the number is always set in the display font.
const props = withDefaults(
  defineProps<{
    amount: number
    // 'figure' stands alone at its own size; 'inline' takes the size of the sentence around it.
    size?: 'figure' | 'inline'
  }>(),
  { size: 'figure' }
)

const formatted = computed(() => new Intl.NumberFormat('en-US').format(props.amount))
</script>

<template>
  <!-- Kept on one line (and out of the formatter's reach): the space keeps number and currency
       apart when read aloud. -->
  <!-- prettier-ignore -->
  <span class="price" :class="`price--${size}`"><span class="price__amount" dir="ltr">{{ formatted }}</span> <span class="price__unit">دينار عراقي</span></span>
</template>

<style scoped lang="scss">
.price {
  &__amount {
    font-family: var(--font-display);
    font-variant-numeric: tabular-nums;
  }

  &--figure {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--space-2);
  }

  &--figure &__amount {
    font-size: var(--text-figure);
    font-weight: 800;
    line-height: 1;
  }

  &--figure &__unit {
    font-size: var(--text-body);
    font-weight: 500;
    color: var(--text-muted);
  }
}
</style>
