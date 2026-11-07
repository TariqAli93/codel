<script setup lang="ts">
import { company, services } from '~/data/company'
import { solutions } from '~/data/solutions'

const title = 'الرئيسية / Home'
const description = 'كودل شركة برمجيات عراقية في بغداد: برمجة وتصميم المواقع وتطبيقات الهواتف، برامج جاهزة مثل نقطة بلس ودلالي، إدارة السيرفرات، وخدمات برمجية حسب الطلب.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })

// Structured data for search engines: only the facts in app/data/company.ts.
const organization = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: company.name,
  telephone: company.phones.main.tel.replace('tel:', ''),
  email: company.email,
  address: {
    '@type': 'PostalAddress',
    addressCountry: company.addressParts.countryCode,
    addressLocality: company.addressParts.city,
    streetAddress: company.addressParts.district
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: company.openingHours.days,
      opens: company.openingHours.opens,
      closes: company.openingHours.closes
    }
  ]
}

useHead({
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(organization) }]
})
</script>

<template>
  <div class="home">
    <section class="home__hero">
      <p class="home__eyebrow"><span dir="ltr">Codel</span> - كودل</p>
      <h1 class="home__title">نبني البرمجيات التي يحتاجها عملك</h1>
      <p class="home__lede">
        كودل شركة برمجيات عراقية في بغداد. نقدّم برامج جاهزة للاستخدام، ونطوّر برمجيات حسب طلبك.
      </p>
      <p class="home__actions">
        <NuxtLink to="/services">تعرّف على خدماتنا</NuxtLink>
        <NuxtLink to="/contact">تواصل معنا</NuxtLink>
      </p>
    </section>

    <section class="home__section" aria-labelledby="home-services">
      <h2 id="home-services">خدماتنا</h2>
      <ul class="home__list">
        <li v-for="service in services" :key="service.title" class="home__item">
          {{ service.title }}
        </li>
      </ul>
      <p class="home__more"><NuxtLink to="/services">تفاصيل الخدمات</NuxtLink></p>
    </section>

    <section class="home__section" aria-labelledby="home-solutions">
      <h2 id="home-solutions">حلولنا الجاهزة</h2>
      <ul class="home__list">
        <li v-for="solution in solutions" :key="solution.slug" class="home__item home__item--product">
          <span class="home__product-name">{{ solution.nameAr }}</span>
          <span class="home__product-text">{{ solution.tagline }}</span>
          <NuxtLink class="home__product-link" :to="`/solutions/${solution.slug}`">التفاصيل والسعر</NuxtLink>
        </li>
      </ul>
      <p class="home__more"><NuxtLink to="/solutions">كل الحلول</NuxtLink></p>
    </section>

    <section class="home__section" aria-labelledby="home-contact">
      <h2 id="home-contact">لديك مشروع أو فكرة؟</h2>
      <p>راسلنا على واتساب أو البريد الإلكتروني، ونردّ عليك. الدوام {{ company.hours.days }}، {{ company.hours.time }}.</p>
      <p class="home__actions">
        <a :href="company.phones.main.whatsapp" target="_blank" rel="noopener noreferrer">واتساب</a>
        <a :href="`mailto:${company.email}`">البريد الإلكتروني</a>
        <NuxtLink to="/contact">كل طرق التواصل</NuxtLink>
      </p>
    </section>
  </div>
</template>

<style scoped lang="scss">
.home {
  &__hero {
    padding-block-end: var(--space-8);
  }

  &__eyebrow {
    margin-block-end: var(--space-3);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--accent-text);
  }

  &__title {
    max-inline-size: 18ch;
    margin-block-end: var(--space-5);
    font-size: clamp(2.25rem, 7vw, 4rem);
    line-height: 1.2;
    font-weight: 800;
  }

  &__lede {
    max-inline-size: 36rem;
    font-size: 1.125rem;
    line-height: 1.8;
    color: var(--text-muted);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-6);
    margin-block-start: var(--space-4);
    font-weight: 600;
  }

  // Standalone links get a 44px touch target (WCAG 2.5.5).
  &__actions a,
  &__more a,
  &__product-link {
    display: inline-flex;
    align-items: center;
    min-block-size: 44px;
  }

  &__section {
    padding-block: var(--space-8);
    border-block-start: 1px solid var(--border);
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
    gap: var(--space-4);
    margin: 0 0 var(--space-5);
    padding: 0;
    list-style: none;
  }

  &__item {
    padding: var(--space-5);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background-color: var(--surface);
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.5;

    &--product {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
  }

  &__product-name {
    font-size: 1.375rem;
  }

  &__product-text {
    font-family: var(--font-sans);
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.75;
    color: var(--text-muted);
  }

  &__product-link {
    align-self: flex-start;
    font-family: var(--font-sans);
    font-size: 1rem;
  }
}
</style>
