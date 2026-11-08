<script setup lang="ts">
import { company } from '~/data/company'

// Every way to reach the company, from company.ts. Default: ruled rows (/contact).
// Compact: tighter rows with no rules (the footer).
withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  { compact: false }
)

const { main, secondary } = company.phones
</script>

<template>
  <dl class="contact-list" :class="{ 'contact-list--compact': compact }">
    <div class="contact-list__row">
      <dt>{{ main.label }}</dt>
      <dd>
        <a :href="main.tel" dir="ltr">{{ main.display }}</a>
        <!-- The hidden number keeps this link's name apart from other "واتساب" links. -->
        <!-- prettier-ignore -->
        <a :href="main.whatsapp" target="_blank" rel="noopener noreferrer">واتساب <span class="contact-list__hidden" dir="ltr">{{ main.display }}</span> <span class="contact-list__hidden">(يفتح في نافذة جديدة)</span></a>
      </dd>
    </div>
    <div class="contact-list__row">
      <dt>{{ secondary.label }}</dt>
      <dd>
        <!-- prettier-ignore -->
        <a :href="secondary.whatsapp" target="_blank" rel="noopener noreferrer" dir="ltr">{{ secondary.display }} <span class="contact-list__hidden" dir="rtl">(يفتح في نافذة جديدة)</span></a>
      </dd>
    </div>
    <div class="contact-list__row">
      <dt>البريد الإلكتروني</dt>
      <dd><a :href="`mailto:${company.email}`" dir="ltr">{{ company.email }}</a></dd>
    </div>
    <div class="contact-list__row">
      <dt>العنوان</dt>
      <dd>{{ company.address }}</dd>
    </div>
    <div class="contact-list__row">
      <dt>ساعات الدوام</dt>
      <dd>{{ company.hours.days }}، {{ company.hours.time }}</dd>
    </div>
  </dl>
</template>

<style scoped lang="scss">
.contact-list {
  margin: 0;

  &__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-5);
    padding-block: var(--space-4);
    border-block-end: 1px solid var(--border);

    &:first-child {
      border-block-start: 1px solid var(--border);
    }

    dt {
      flex: 0 0 8.5rem;
      color: var(--text-muted);
    }

    // Flex, so a row with two links (number and WhatsApp) keeps them apart.
    dd {
      display: flex;
      flex: 1 1 14rem;
      flex-wrap: wrap;
      align-items: center;
      gap: 0 var(--space-5);
      min-block-size: var(--touch-target);
      min-inline-size: 0;
      margin: 0;
      font-weight: 500;
      color: var(--text);
      overflow-wrap: anywhere;
      text-wrap: balance;
    }

    a {
      display: inline-flex;
      align-items: center;
      min-block-size: var(--touch-target);
      font-weight: 500;
      color: var(--text);
      transition: text-decoration-color var(--duration-fast) var(--ease-out);
    }
  }

  &--compact &__row {
    min-block-size: var(--touch-target);
    padding-block: 0;
    border-block: 0;

    dd {
      min-block-size: 0;
      font-weight: 400;
    }

    // Hover stays in the footer's greys.
    @media (hover: hover) {
      a:hover {
        text-decoration-color: var(--text);
      }
    }
  }

  // Read by screen readers only.
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
