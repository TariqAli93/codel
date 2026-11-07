<script setup lang="ts">
import { services } from '~/data/company'

const title = 'خدماتنا / Services'
const description = 'خدمات كودل: برمجة وتصميم المواقع وتطبيقات الهواتف، برامج الحسابات والمخازن والكاشيرات، إدارة السيرفرات، وخدمات برمجية حسب الطلب.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <div class="services">
    <h1>خدماتنا</h1>
    <p class="services__lede">خمس خدمات برمجية، من الموقع والتطبيق إلى البرامج الجاهزة والسيرفرات.</p>

    <ul class="services__list">
      <li v-for="service in services" :key="service.title" class="services__item">
        <h2 class="services__title">{{ service.title }}</h2>
        <p class="services__text">{{ service.text }}</p>
        <NuxtLink class="services__link" to="/contact">استفسر عن هذه الخدمة</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.services {
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
    gap: var(--space-3);
    padding: var(--space-5);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background-color: var(--surface);
  }

  &__title {
    margin: 0;
    font-size: 1.375rem;
    line-height: 1.45;
    font-weight: 600;
  }

  &__text {
    margin: 0;
    color: var(--text-muted);
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
