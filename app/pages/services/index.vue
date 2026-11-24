<script setup lang="ts">
import { services } from '~/data/company'

const title = 'خدماتنا / Services'
const description = 'خدمات كودل: برمجة وتصميم المواقع وتطبيقات الهواتف، برامج الحسابات والمخازن والكاشيرات، إدارة السيرفرات، وخدمات برمجية حسب الطلب.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <div class="services">
    <PageHead title="خدماتنا" lede="خمس خدمات برمجية، من الموقع والتطبيق إلى البرامج الجاهزة والسيرفرات.">
      <WhatsAppCall />
    </PageHead>

    <ul role="list" class="services__list">
      <!-- Permanent service IDs preserve these public links when the list is reordered. -->
      <li v-for="service in services" :id="service.id" :key="service.id" class="services__item">
        <h2 class="services__title">{{ service.title }}</h2>
        <p class="services__text">{{ service.text }}</p>
        <div class="services__actions">
          <small>السعر حسب متطلبات المشروع</small>
          <ActionLink :to="`/services/${service.id}`" label="تفاصيل الخدمة ↖" />
          <ActionLink v-if="service.related" look="text" :to="service.related" label="حلولنا الجاهزة" />
        </div>
      </li>
    </ul>

    <ClosingCall heading="لديك مشروع أو فكرة؟" text="أخبرنا بما تحتاجه على واتساب أو بالبريد الإلكتروني.">
      <WhatsAppCall :glow="false" />
    </ClosingCall>
  </div>
</template>

<style scoped lang="scss">.services__list{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:var(--space-5);padding:0;list-style:none;margin-block-start:var(--head-gap)}.services__item{display:flex;flex-direction:column;gap:var(--space-4);padding:clamp(18px,3vw,38px);border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface);transition:border-color var(--duration-base),background var(--duration-base);&:hover{border-color:var(--border-strong);background:var(--surface-raised)}}.services__title{font-size:var(--text-name);margin:0}.services__text{color:var(--text-muted)}.services__actions{margin-block-start:auto;display:flex;flex-direction:column;align-items:start;gap:var(--space-3);small{color:var(--text-muted)}}</style>
