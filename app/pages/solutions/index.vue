<script setup lang="ts">
import { solutions } from "~/data/solutions";

const title = "حلولنا / Solutions";
const description =
  "برامج كودل الجاهزة: نقطة بلس لإدارة نقاط البيع والمخازن، ودلالي لإدارة مكاتب العقارات.";

useSeoMeta({ title, description, ogTitle: title, ogDescription: description });
</script>

<template>
  <div class="solutions">
    <PageHead title="حلولنا" lede="برامج جاهزة للاستخدام، بأسعار معلنة." />

    <section class="condition-grid" aria-labelledby="condition-grid-title">
      <h2 id="condition-grid-title">اختر البرنامج حسب شغلك</h2>
      <div class="condition-grid__cards">
        <WorklineProduct
          v-for="(solution, i) in solutions"
          :key="solution.slug"
          :solution="solution"
          :number="i + 1"
          :total="solutions.length"
          :level="3"
          layout="condition"
        />
      </div>
    </section>

    <ClosingCall heading="تحتاج حلاً غير موجود هنا؟" text="نبرمجه لك حسب طلبك.">
      <WhatsAppCall look="outline" />
      <ActionLink look="text" to="/services" label="خدماتنا" />
    </ClosingCall>
  </div>
</template>

<style scoped lang="scss">
.condition-grid {
  margin-block-start: var(--head-gap);
}
.condition-grid h2 {
  margin-block-end: clamp(20px, 3vw, 36px);
  font-family: var(--font-hero);
  font-size: clamp(2rem, 4.5vw, 4rem);
  line-height: 1.35;
}
.condition-grid__cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: clamp(16px, 2.4vw, 32px);
}
@media (max-width: 980px) {
  .condition-grid__cards {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
