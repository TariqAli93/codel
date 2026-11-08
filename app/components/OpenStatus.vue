<script setup lang="ts">
import { company } from '~/data/company'

// Open or closed right now, on Baghdad time. Worked out in the browser after mount only, so the
// server-rendered page never carries a time; until then (and without JavaScript) nothing is shown.
const openNow = ref<boolean | null>(null)

onMounted(() => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Baghdad',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date())
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? ''
  // Both sides are zero-padded HH:MM, so they compare as strings.
  const time = `${part('hour')}:${part('minute')}`
  const { days, opens, closes } = company.openingHours
  openNow.value = days.includes(part('weekday')) && time >= opens && time < closes
})
</script>

<template>
  <div class="status">
    <p v-if="openNow !== null" class="status__line" :class="{ 'status__line--open': openNow }">
      <span class="status__point" aria-hidden="true" />
      {{ openNow ? 'في الدوام الآن' : 'خارج ساعات الدوام الآن' }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.status {
  font-size: var(--text-small);
  line-height: 1.7;

  // Holds the line's height from the first paint, so it appears after mount without moving
  // anything. Without JavaScript there is no status, so nothing is held.
  .js & {
    min-block-size: 1.7em;
  }

  &__line {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 500;
  }

  // Closed: a hollow ring. Open: a filled point.
  &__point {
    flex: none;
    inline-size: var(--point-sm);
    block-size: var(--point-sm);
    border: 1.5px solid currentColor;
    border-radius: 50%;

    // Only the open state takes the point's colour: closed is never lime.
    .status__line--open & {
      border-color: var(--status-point, currentColor);
      background-color: var(--status-point, currentColor);
    }
  }
}
</style>
