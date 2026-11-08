<script setup lang="ts">
import { company, services } from '~/data/company'
import { solutions } from '~/data/solutions'

const title = 'الأسئلة الشائعة / FAQ'
const description = 'أسئلة شائعة عن كودل: ما نقدّمه، البرامج الجاهزة وأسعارها، ساعات الدوام، ومكان الشركة.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <div class="faq">
    <div class="faq__columns">
      <div class="faq__head">
        <PageHead title="الأسئلة الشائعة" lede="إجابات عن خدماتنا وبرامجنا وأسعارها ودوامنا." />
      </div>

      <div class="faq__list">
        <details class="faq__item">
          <summary class="faq__question">
            ما الذي تقدّمه كودل؟
            <span class="faq__marker" aria-hidden="true" />
          </summary>
          <div class="faq__answer">
            <ul class="faq__rows">
              <li v-for="service in services" :key="service.title">{{ service.title }}</li>
            </ul>
            <p class="faq__after">
              نقدّم خمس خدمات برمجية، تجدها مفصّلة في صفحة <NuxtLink to="/services">خدماتنا</NuxtLink>.
            </p>
          </div>
        </details>

        <details class="faq__item">
          <summary class="faq__question">
            هل تقدّمون برامج جاهزة أم تطويراً حسب الطلب؟
            <span class="faq__marker" aria-hidden="true" />
          </summary>
          <p class="faq__answer">
            الاثنين معاً. لدينا برامج جاهزة، ونبرمج حلولاً حسب طلب العميل عندما لا يكفيه البرنامج الجاهز.
          </p>
        </details>

        <details class="faq__item">
          <summary class="faq__question">
            ما البرامج الجاهزة المتوفرة؟
            <span class="faq__marker" aria-hidden="true" />
          </summary>
          <ul class="faq__answer faq__rows">
            <li v-for="solution in solutions" :key="solution.slug">
              <ActionLink look="text" :to="`/solutions/${solution.slug}`" :label="solution.nameAr" />: {{ solution.tagline }}
            </li>
          </ul>
        </details>

        <details class="faq__item">
          <summary class="faq__question">
            كم سعر البرامج الجاهزة؟
            <span class="faq__marker" aria-hidden="true" />
          </summary>
          <ul class="faq__answer faq__rows">
            <li v-for="solution in solutions" :key="solution.slug">
              {{ solution.nameAr }}: <ProductPrice :amount="solution.priceIqd" size="inline" />
            </li>
          </ul>
        </details>

        <details class="faq__item">
          <summary class="faq__question">
            على أي نظام تعمل البرامج الجاهزة؟
            <span class="faq__marker" aria-hidden="true" />
          </summary>
          <ul class="faq__answer faq__rows">
            <li v-for="solution in solutions" :key="solution.slug">
              {{ solution.nameAr }}: {{ solution.platform }}
            </li>
          </ul>
        </details>

        <details class="faq__item">
          <summary class="faq__question">
            ما ساعات الدوام؟
            <span class="faq__marker" aria-hidden="true" />
          </summary>
          <p class="faq__answer">{{ company.hours.days }}، {{ company.hours.time }}.</p>
        </details>

        <details class="faq__item">
          <summary class="faq__question">
            أين مقرّ كودل؟
            <span class="faq__marker" aria-hidden="true" />
          </summary>
          <p class="faq__answer">{{ company.address }}.</p>
        </details>

        <details class="faq__item">
          <summary class="faq__question">
            كيف أتواصل معكم؟
            <span class="faq__marker" aria-hidden="true" />
          </summary>
          <div class="faq__answer">
            <p>عبر الهاتف أو واتساب أو البريد الإلكتروني.</p>
            <ul role="list" class="faq__links">
              <li><ActionLink look="text" :to="company.phones.main.tel" :label="company.phones.main.display" dir="ltr" /></li>
              <li><WhatsAppCall look="text" label="واتساب" /></li>
              <li><ActionLink look="text" :to="`mailto:${company.email}`" :label="company.email" dir="ltr" /></li>
            </ul>
            <p class="faq__after">
              الأرقام والبريد في صفحة <NuxtLink to="/contact">تواصل معنا</NuxtLink>.
            </p>
          </div>
        </details>
      </div>
    </div>

    <ClosingCall heading="لم تجد إجابتك؟" text="اسألنا مباشرة على واتساب.">
      <WhatsAppCall :glow="false" />
    </ClosingCall>
  </div>
</template>

<style scoped lang="scss">
$wide: 64em;

.faq {
  &__columns {
    display: grid;
    row-gap: var(--head-gap);

    @media (width >= $wide) {
      grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
      align-items: start;
      column-gap: var(--space-8);
    }
  }

  &__head {
    @media (width >= $wide) {
      position: sticky;
      inset-block-start: calc(var(--header-height) + var(--space-6));
    }
  }

  &__list {
    max-inline-size: var(--measure);
    border-block-start: 1px solid var(--border);
  }

  &__item {
    border-block-end: 1px solid var(--border);
  }

  &__question {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    min-block-size: var(--touch-target);
    padding-block: var(--space-4);
    font-family: var(--font-display);
    font-size: var(--text-card);
    font-weight: 600;
    line-height: 1.5;
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-out);

    &::-webkit-details-marker {
      display: none;
    }

    @media (hover: hover) {
      &:hover {
        color: var(--accent-text);
      }
    }
  }

  // Two bars that make a plus and turn into an X while the answer is open.
  &__marker {
    position: relative;
    flex: none;
    inline-size: 1.125rem;
    block-size: 1.125rem;
    transition: transform var(--duration-base) var(--ease-out);

    &::before,
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      margin: auto;
      border-radius: var(--radius-pill);
      background-color: currentColor;
    }

    &::before {
      block-size: var(--stroke);
    }

    &::after {
      inline-size: var(--stroke);
    }

    .faq__item[open] & {
      transform: rotate(45deg);
    }
  }

  &__answer {
    padding-block: var(--space-2) var(--space-4);
    color: var(--text-muted);
  }

  &__rows {
    margin: 0;
    padding-inline-start: var(--space-6);
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-5);
    padding: 0;
    list-style: none;
  }

  &__after {
    margin-block-start: var(--space-2);
  }
}

// Where the browser can animate to a height of auto, the answer opens and closes smoothly.
@supports selector(::details-content) {
  @media (prefers-reduced-motion: no-preference) {
    .faq__list {
      interpolate-size: allow-keywords;
    }

    .faq__item::details-content {
      block-size: 0;
      overflow-y: clip;
      transition:
        block-size var(--duration-base) var(--ease-out),
        content-visibility var(--duration-base) allow-discrete;
    }

    .faq__item[open]::details-content {
      block-size: auto;
    }
  }
}
</style>
