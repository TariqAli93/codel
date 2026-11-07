<script setup lang="ts">
import { solutions } from '~/data/solutions'

const title = 'حلولنا / Solutions'
const description = 'برامج كودل الجاهزة: نقطة بلس لإدارة نقاط البيع والمخازن، ودلالي لإدارة مكاتب العقارات.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })

const price = (value: number) => new Intl.NumberFormat('en-US').format(value)
</script>

<template>
  <div class="solutions">
    <h1>حلولنا</h1>
    <p class="solutions__lede">برامج جاهزة للاستخدام. وإن احتجت حلاً غير موجود، نبرمجه لك حسب طلبك.</p>

    <ul class="solutions__list">
      <li v-for="solution in solutions" :key="solution.slug" class="solutions__item">
        <p class="solutions__latin"><span dir="ltr">{{ solution.nameEn }}</span></p>
        <h2 class="solutions__title">{{ solution.nameAr }}</h2>
        <p class="solutions__text">{{ solution.tagline }}</p>
        <p class="solutions__price">{{ price(solution.priceIqd) }} دينار عراقي</p>
        <NuxtLink class="solutions__link" :to="`/solutions/${solution.slug}`">التفاصيل</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.solutions {
  &__lede {
    margin-block-end: var(--space-7);
    font-size: 1.125rem;
    color: var(--text-muted);
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
    gap: var(--space-5);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-5);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background-color: var(--surface);
  }

  &__latin {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--accent-text);
  }

  &__title {
    margin: 0;
    font-size: 1.75rem;
    line-height: 1.4;
  }

  &__text {
    margin: 0;
    color: var(--text-muted);
  }

  &__price {
    margin: var(--space-2) 0 0;
    font-weight: 600;
  }

  // Standalone link: 44px touch target (WCAG 2.5.5).
  &__link {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    min-block-size: 44px;
    margin-block-start: auto;
    font-weight: 600;
  }
}
</style>
