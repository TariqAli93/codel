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
      <li v-for="service in services" :key="service.title" class="services__item">
        <h2 class="services__title">{{ service.title }}</h2>
        <p class="services__text">{{ service.text }}</p>
        <div class="services__actions">
          <WhatsAppCall look="text" :subject="service.title" label="استفسر عن هذه الخدمة" :hidden-suffix="service.title" />
          <ActionLink v-if="service.related" look="text" :to="service.related" label="حلولنا الجاهزة" />
        </div>
      </li>
    </ul>

    <ClosingCall heading="لديك مشروع أو فكرة؟" text="أخبرنا بما تحتاجه على واتساب أو بالبريد الإلكتروني.">
      <WhatsAppCall :glow="false" />
    </ClosingCall>
  </div>
</template>

<style scoped lang="scss">
$wide: 64em;

.services {
  &__list {
    margin-block-start: var(--head-gap);
    padding: 0;
    list-style: none;
  }

  &__item {
    display: grid;
    gap: var(--space-3);
    padding-block: var(--space-6);
    border-block-start: 1px solid var(--border);

    @media (width >= $wide) {
      grid-template-columns: minmax(0, 5fr) minmax(0, 6fr) auto;
      column-gap: var(--space-7);
      align-items: baseline;
    }
  }

  &__title {
    margin: 0;
    font-size: var(--text-flow);
    font-weight: 700;
    line-height: 1.5;
  }

  &__text {
    line-height: 1.75;
    color: var(--text-muted);
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
