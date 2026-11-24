<script setup lang="ts">
import { solutions } from '~/data/solutions'

const title = 'حلولنا / Solutions'
const description = 'برامج كودل الجاهزة: نقطة بلس لإدارة نقاط البيع والمخازن، ودلالي لإدارة مكاتب العقارات.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <div class="solutions">
    <PageHead title="حلولنا" lede="برامج جاهزة للاستخدام، بأسعار معلنة." />

    <div class="workline-list"><WorklineProduct v-for="(solution,i) in solutions" :key="solution.slug" :solution="solution" :number="i+1" :total="solutions.length" /></div>

    <ClosingCall heading="تحتاج حلاً غير موجود هنا؟" text="نبرمجه لك حسب طلبك.">
      <WhatsAppCall look="outline" />
      <ActionLink look="text" to="/services" label="خدماتنا" />
    </ClosingCall>
  </div>
</template>

<style scoped lang="scss">.workline-list{display:grid;gap:20px;margin-block-start:var(--head-gap)}</style>
