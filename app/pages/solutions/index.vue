<script setup lang="ts">
import { solutions } from '~/data/solutions'

const title = 'حلولنا / Solutions'
const description = 'برامج كودل الجاهزة: نقطة بلس لإدارة نقاط البيع والمخازن، ودلالي لإدارة مكاتب العقارات.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <div class="solutions">
    <PageHead title="حلولنا" lede="برامج جاهزة للاستخدام، بأسعار معلنة." />

    <div class="solutions__list">
      <article
        v-for="(solution, index) in solutions"
        :key="solution.slug"
        class="solutions__item"
        :aria-labelledby="`solution-${solution.slug}`"
      >
        <ProductWindow v-if="solution.images[0]" v-bind="solution.images[0]" :eager="index === 0" class="solutions__shot" />
        <LeanTag class="solutions__tag" :label="`يعمل على ${solution.platform}`" />
        <h2 :id="`solution-${solution.slug}`" class="solutions__name">
          {{ solution.nameAr }}
          <span class="solutions__latin" dir="ltr">{{ solution.nameEn }}</span>
        </h2>
        <p class="solutions__tagline">{{ solution.tagline }}</p>
        <ProductPrice class="solutions__price" :amount="solution.priceIqd" />
        <div class="solutions__actions">
          <ActionLink :to="`/solutions/${solution.slug}`" :label="`تفاصيل ${solution.nameAr}`" />
          <WhatsAppCall look="text" :subject="solution.nameAr" label="اسأل عنه على واتساب" :hidden-suffix="solution.nameAr" />
        </div>
      </article>
    </div>

    <ClosingCall heading="تحتاج حلاً غير موجود هنا؟" text="نبرمجه لك حسب طلبك.">
      <WhatsAppCall look="outline" />
      <ActionLink look="text" to="/services" label="خدماتنا" />
    </ClosingCall>
  </div>
</template>

<style scoped lang="scss">
$wide: 64em;

.solutions {
  &__list {
    display: grid;
    gap: var(--space-7);
    margin-block-start: var(--head-gap);

    @media (width >= $wide) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__shot {
    --window-radius: var(--radius-md);

    align-self: stretch;
  }

  &__name {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--space-3);
    margin: var(--space-5) 0 0;
    font-size: var(--text-name);
    font-weight: 700;
    line-height: 1.3;
  }

  &__latin {
    font-size: var(--text-body);
    font-weight: 600;
    color: var(--text-muted);
  }

  &__tagline {
    margin-block-start: var(--space-2);
    line-height: 1.7;
    color: var(--text-muted);
  }

  &__tag {
    margin-block-start: var(--space-5);
  }

  &__price {
    margin-block-start: var(--space-4);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-5);
    margin-block-start: var(--space-5);
  }
}
</style>
