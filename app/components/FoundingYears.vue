<script setup lang="ts">
import { company } from '~/data/company'
</script>

<template>
  <ol role="list" class="years">
    <!-- Idea, then launch. Each year is kept on one line (and out of the formatter's reach): the
         spaces keep figure and label apart when read aloud. -->
    <!-- prettier-ignore -->
    <li class="years__item years__item--idea"><span class="years__figure">{{ company.founded.idea }}</span> <span class="years__node" aria-hidden="true" /> <span class="years__label">بداية الفكرة</span></li>
    <!-- prettier-ignore -->
    <li class="years__item years__item--launch"><span class="years__figure">{{ company.founded.launch }}</span> <span class="years__node" aria-hidden="true" /> <span class="years__label">انطلاق الشركة</span></li>
    <li class="years__bar" role="presentation" aria-hidden="true" />
  </ol>
</template>

<style scoped lang="scss">
// Figure, node and label rows shared through subgrid, so the bar (the third item, across the
// first two columns) lines up with both nodes.
.years {
  display: grid;
  grid-template-columns: auto minmax(var(--space-7), 1fr) auto;
  grid-template-rows: auto auto auto;
  row-gap: var(--space-3);
  padding: 0;
  list-style: none;

  // A decorative bar, so it leans: from the 2020 node to the 2024 node, with air at both ends.
  &__bar {
    grid-column: 1 / 3;
    grid-row: 2;
    align-self: center;
    block-size: 6px;
    margin-inline: calc(var(--point-md) + var(--space-2)) var(--space-2);
    border-radius: var(--radius-pill);
    background-color: var(--border-strong);
    transform: skewX(calc(var(--slant-angle) * -1));
  }

  &__item {
    display: grid;
    grid-row: 1 / -1;
    grid-template-rows: subgrid;
    justify-items: start;

    &--idea {
      grid-column: 1;
    }

    &--launch {
      grid-column: 3;
    }
  }

  &__figure {
    font-family: var(--font-display);
    font-size: var(--text-figure);
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    color: var(--text-muted);

    .years__item--launch & {
      color: var(--text);
    }
  }

  // Grey for the idea; lime for the launch, because the company is live now.
  &__node {
    position: relative;
    z-index: 1;
    align-self: center;
    inline-size: var(--point-md);
    block-size: var(--point-md);
    border-radius: 50%;
    background-color: var(--border-strong);

    .years__item--launch & {
      background-color: var(--accent);
    }
  }

  &__label {
    font-size: var(--text-ui);
    font-weight: 500;
    line-height: 1.7;
    color: var(--text-muted);
  }
}
</style>
