<script setup lang="ts">
import { company } from '~/data/company'
import { solutions } from '~/data/solutions'

const route = useRoute()

// A route param can be string | string[]: normalise it before the lookup.
const slug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug
const solution = solutions.find((item) => item.slug === slug)

if (!solution) {
  // statusText goes into the HTTP status line, which only carries plain ASCII.
  // app/error.vue shows the Arabic message.
  throw createError({ status: 404, statusText: 'Page Not Found', fatal: true })
}

const title = `${solution.nameAr} / ${solution.nameEn}`
const description = `${solution.nameAr} من كودل: ${solution.tagline}. ${solution.description}`

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })

// Structured data for search engines: name and price only, nothing else is known yet.
const product = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: solution.nameAr,
  alternateName: solution.nameEn,
  offers: {
    '@type': 'Offer',
    price: String(solution.priceIqd),
    priceCurrency: 'IQD'
  }
}

useHead({
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(product) }]
})

const price = new Intl.NumberFormat('en-US').format(solution.priceIqd)
const whatsappHref = `${company.phones.main.whatsapp}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن ${solution.nameAr}`)}`
</script>

<template>
  <article v-if="solution" class="solution">
    <p class="solution__back"><NuxtLink to="/solutions">كل الحلول</NuxtLink></p>
    <p class="solution__latin"><span dir="ltr">{{ solution.nameEn }}</span></p>
    <h1>{{ solution.nameAr }}</h1>
    <p class="solution__tagline">{{ solution.tagline }}</p>
    <p class="solution__lede">{{ solution.description }}</p>

    <dl class="solution__facts">
      <div class="solution__fact">
        <dt>السعر</dt>
        <dd>{{ price }} دينار عراقي</dd>
      </div>
      <div class="solution__fact">
        <dt>يعمل على</dt>
        <dd>{{ solution.platform }}</dd>
      </div>
    </dl>

    <section class="solution__section" aria-labelledby="solution-features">
      <h2 id="solution-features">ماذا يقدّم؟</h2>
      <ul class="solution__features">
        <li v-for="feature in solution.features" :key="feature">{{ feature }}</li>
      </ul>
    </section>

    <section v-if="solution.images.length" class="solution__section" aria-labelledby="solution-images">
      <h2 id="solution-images">صور من البرنامج</h2>
      <ul class="solution__gallery">
        <li v-for="(image, index) in solution.images" :key="image.src">
          <img
            :src="image.src"
            :alt="image.alt"
            :width="image.width"
            :height="image.height"
            :loading="index === 0 ? 'eager' : 'lazy'"
            decoding="async"
          >
        </li>
      </ul>
    </section>

    <section class="solution__section" aria-labelledby="solution-contact">
      <h2 id="solution-contact">للاستفسار أو الشراء</h2>
      <p>تواصل معنا وسنوضّح لك التفاصيل. الدوام {{ company.hours.days }}، {{ company.hours.time }}.</p>
      <p class="solution__actions">
        <a :href="whatsappHref" target="_blank" rel="noopener noreferrer">واتساب</a>
        <a :href="`mailto:${company.email}`">البريد الإلكتروني</a>
        <NuxtLink to="/contact">كل طرق التواصل</NuxtLink>
      </p>
    </section>
  </article>
</template>

<style scoped lang="scss">
.solution {
  &__back {
    margin-block-end: var(--space-2);
    font-size: 0.875rem;
    font-weight: 600;
  }

  // Standalone links: 44px touch target (WCAG 2.5.5).
  &__back a,
  &__actions a {
    display: inline-flex;
    align-items: center;
    min-block-size: 44px;
  }

  &__latin {
    margin-block-end: var(--space-2);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--accent-text);
  }

  &__tagline {
    font-family: var(--font-display);
    font-size: 1.375rem;
    font-weight: 600;
    line-height: 1.45;
  }

  &__lede {
    max-inline-size: 42rem;
    margin-block-start: var(--space-3);
    font-size: 1.125rem;
    color: var(--text-muted);
  }

  &__facts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin: var(--space-6) 0 0;
  }

  &__fact {
    min-inline-size: 12rem;
    padding: var(--space-4) var(--space-5);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background-color: var(--surface);

    dt {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    dd {
      margin: 0;
      font-family: var(--font-display);
      font-size: 1.375rem;
      font-weight: 700;
      line-height: 1.5;
    }
  }

  &__section {
    margin-block-start: var(--space-8);
    padding-block-start: var(--space-7);
    border-block-start: 1px solid var(--border);
  }

  &__features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
    gap: var(--space-3);
    margin: var(--space-4) 0 0;
    padding: 0;
    list-style: none;

    li {
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background-color: var(--surface);
    }
  }

  &__gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
    gap: var(--space-4);
    margin: var(--space-4) 0 0;
    padding: 0;
    list-style: none;

    // Fixed frame so nothing shifts while images load; `contain` shows the whole
    // screenshot instead of cropping parts of the program's screen.
    img {
      inline-size: 100%;
      block-size: auto;
      aspect-ratio: 16 / 10;
      object-fit: contain;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background-color: var(--surface);
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-6);
    margin-block-start: var(--space-3);
    font-weight: 600;
  }
}
</style>
