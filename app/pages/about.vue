<script setup lang="ts">
import { company } from '~/data/company'

const title = 'من نحن / About'
const description = 'بدأت كودل فكرةً في سنة 2020 وانطلقت في سنة 2024 من بغداد. شركة برمجيات عراقية ناشئة تقدّم برامج جاهزة وتطوّر برمجيات حسب الطلب.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <div class="about">
    <h1>من نحن</h1>
    <p class="about__lede">كودل شركة برمجيات عراقية ناشئة، مقرّها بغداد.</p>

    <section class="about__section" aria-labelledby="about-story">
      <h2 id="about-story">قصتنا</h2>
      <p>
        بدأت كودل فكرةً في سنة {{ company.founded.idea }}، هدفها أن نبني برمجيات تخدم الأعمال في العراق.
      </p>
      <p>
        احتاجت الفكرة وقتاً لتتحول إلى عمل حقيقي، وانطلقت الشركة في سنة {{ company.founded.launch }} من بغداد.
      </p>
      <p>
        اليوم نقدّم برامج جاهزة، منها <NuxtLink to="/solutions/nuqta-plus">نقطة بلس</NuxtLink> لإدارة نقاط البيع والمخازن
        و<NuxtLink to="/solutions/dalaly">دلالي</NuxtLink> لإدارة مكاتب العقارات. ونطوّر برمجيات حسب طلب العميل،
        ونصمّم المواقع والتطبيقات، ونتولى إدارة السيرفرات.
      </p>
      <p>
        نحن شركة ناشئة، ونتعامل مع كل مشروع على أنه خطوة في هذا الطريق.
      </p>
    </section>

    <section class="about__section" aria-labelledby="about-timeline">
      <h2 id="about-timeline">محطات</h2>
      <ol class="about__timeline">
        <li class="about__stop">
          <span class="about__year">{{ company.founded.idea }}</span>
          <span>بداية الفكرة</span>
        </li>
        <li class="about__stop">
          <span class="about__year">{{ company.founded.launch }}</span>
          <span>انطلاق الشركة</span>
        </li>
      </ol>
    </section>

    <section class="about__section" aria-labelledby="about-location">
      <h2 id="about-location">أين نحن</h2>
      <p>{{ company.address }}.</p>
      <p>الدوام من {{ company.hours.days }}، {{ company.hours.time }}.</p>
      <p class="about__more"><NuxtLink to="/contact">طرق التواصل</NuxtLink></p>
    </section>
  </div>
</template>

<style scoped lang="scss">
.about {
  &__lede {
    font-size: 1.125rem;
    color: var(--text-muted);
  }

  &__section {
    margin-block-start: var(--space-7);

    p {
      max-inline-size: 42rem;
    }
  }

  &__more {
    margin-block-start: var(--space-3);
    font-weight: 600;

    // Standalone link: 44px touch target (WCAG 2.5.5).
    a {
      display: inline-flex;
      align-items: center;
      min-block-size: 44px;
    }
  }

  &__timeline {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__stop {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-inline-size: 12rem;
    padding: var(--space-4) var(--space-5);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background-color: var(--surface);
  }

  &__year {
    font-family: var(--font-display);
    font-size: 2.25rem;
    font-weight: 800;
    line-height: 1.3;
    color: var(--accent-text);
  }
}
</style>
