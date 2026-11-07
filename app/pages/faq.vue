<script setup lang="ts">
import { company } from '~/data/company'
import { solutions } from '~/data/solutions'

const title = 'الأسئلة الشائعة / FAQ'
const description = 'أسئلة شائعة عن كودل: ما نقدّمه، البرامج الجاهزة وأسعارها، ساعات الدوام، ومكان الشركة.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })

const price = (value: number) => new Intl.NumberFormat('en-US').format(value)
</script>

<template>
  <div class="faq">
    <h1>الأسئلة الشائعة</h1>

    <div class="faq__list">
      <details class="faq__item">
        <summary class="faq__question">ما الذي تقدّمه كودل؟</summary>
        <p class="faq__answer">
          نقدّم خمس خدمات برمجية، تجدها مفصّلة في صفحة <NuxtLink to="/services">خدماتنا</NuxtLink>.
        </p>
      </details>

      <details class="faq__item">
        <summary class="faq__question">هل تقدّمون برامج جاهزة أم تطويراً حسب الطلب؟</summary>
        <p class="faq__answer">
          الاثنين معاً. لدينا برامج جاهزة، ونبرمج حلولاً حسب طلب العميل عندما لا يكفيه البرنامج الجاهز.
        </p>
      </details>

      <details class="faq__item">
        <summary class="faq__question">ما البرامج الجاهزة المتوفرة؟</summary>
        <ul class="faq__answer faq__prices">
          <li v-for="solution in solutions" :key="solution.slug">
            <NuxtLink :to="`/solutions/${solution.slug}`">{{ solution.nameAr }}</NuxtLink>: {{ solution.tagline }}
          </li>
        </ul>
      </details>

      <details class="faq__item">
        <summary class="faq__question">كم سعر البرامج الجاهزة؟</summary>
        <ul class="faq__answer faq__prices">
          <li v-for="solution in solutions" :key="solution.slug">
            {{ solution.nameAr }}: {{ price(solution.priceIqd) }} دينار عراقي
          </li>
        </ul>
      </details>

      <details class="faq__item">
        <summary class="faq__question">على أي نظام تعمل البرامج الجاهزة؟</summary>
        <ul class="faq__answer faq__prices">
          <li v-for="solution in solutions" :key="solution.slug">
            {{ solution.nameAr }}: {{ solution.platform }}
          </li>
        </ul>
      </details>

      <details class="faq__item">
        <summary class="faq__question">ما ساعات الدوام؟</summary>
        <p class="faq__answer">{{ company.hours.days }}، {{ company.hours.time }}.</p>
      </details>

      <details class="faq__item">
        <summary class="faq__question">أين مقرّ كودل؟</summary>
        <p class="faq__answer">{{ company.address }}.</p>
      </details>

      <details class="faq__item">
        <summary class="faq__question">كيف أتواصل معكم؟</summary>
        <p class="faq__answer">
          عبر الهاتف أو واتساب أو البريد الإلكتروني. الأرقام والبريد في صفحة <NuxtLink to="/contact">تواصل معنا</NuxtLink>.
        </p>
      </details>
    </div>
  </div>
</template>

<style scoped lang="scss">
.faq {
  &__list {
    max-inline-size: 44rem;
    margin-block-start: var(--space-6);
    border-block-start: 1px solid var(--border);
  }

  &__item {
    border-block-end: 1px solid var(--border);
  }

  &__question {
    padding-block: var(--space-4);
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.5;
    cursor: pointer;
  }

  &__answer {
    padding-block-end: var(--space-4);
    color: var(--text-muted);
  }

  &__prices {
    margin: 0;
    padding-inline-start: var(--space-6);
  }
}
</style>
