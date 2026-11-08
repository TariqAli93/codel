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

const closingText = `تواصل معنا وسنوضّح لك التفاصيل. الدوام ${company.hours.days}، ${company.hours.time}.`

// The screenshot viewer: one screen at a time, chosen from the thumbnails. A screenshot's short
// label is its alt text up to the colon ("شاشة نقطة البيع في نقطة بلس: …").
const images = solution.images

// The first screen is the page's largest paint on wide screens: ask for it early, at high priority.
const firstImage = images[0]
if (firstImage) {
  useHead({
    link: [{ rel: 'preload', as: 'image', href: firstImage.src, fetchpriority: 'high' }]
  })
}

const label = (alt: string) => alt.split(':')[0]?.trim() ?? alt
const active = ref(0)
const activeImage = computed(() => images[active.value] ?? images[0])
</script>

<template>
  <article v-if="solution" class="product" :class="`product--${solution.look}`">
    <p class="product__back"><ActionLink look="text" to="/solutions" label="كل الحلول" /></p>

    <div class="product__hero" :data-theme="solution.look === 'sand' ? 'light' : undefined">
      <div class="product__intro">
        <LeanTag :label="`يعمل على ${solution.platform}`" />
        <h1 class="product__name">{{ solution.nameAr }}</h1>
        <p class="product__latin" dir="ltr">{{ solution.nameEn }}</p>
        <p class="product__tagline">{{ solution.tagline }}</p>
        <p class="product__lede">{{ solution.description }}</p>

        <div class="product__buy">
          <ProductPrice :amount="solution.priceIqd" />
          <div class="product__actions">
            <WhatsAppCall :subject="solution.nameAr" label="اسأل عنه على واتساب" />
            <!-- Kept on one line (and out of the formatter's reach): the space keeps the words and
                 the number apart. -->
            <!-- prettier-ignore -->
            <ActionLink look="text" :to="company.phones.main.tel">أو اتصل <span dir="ltr">{{ company.phones.main.display }}</span></ActionLink>
          </div>
        </div>
      </div>

      <!-- The first two screens, layered; decorative here, every screen is described in the viewer below. -->
      <div v-if="images.length" class="product__visual" aria-hidden="true">
        <ProductWindow v-if="images[0]" v-bind="images[0]" alt="" eager class="product__shot product__shot--main" />
        <ProductWindow v-if="images[1]" v-bind="images[1]" alt="" eager class="product__shot product__shot--second" />
      </div>
    </div>

    <section class="product__features" aria-labelledby="features-title">
      <h2 id="features-title" class="product__heading">ماذا يقدّم؟</h2>
      <ul role="list" class="product__feature-list">
        <li v-for="feature in solution.features" :key="feature" class="product__feature">{{ feature }}</li>
      </ul>
    </section>

    <section v-if="images.length && activeImage" class="product__gallery" aria-labelledby="gallery-title">
      <div class="product__gallery-head">
        <h2 id="gallery-title" class="product__heading">صور من البرنامج</h2>
        <p class="product__gallery-note">صور حقيقية من البرنامج، ببيانات تجريبية.</p>
      </div>

      <!-- Without JavaScript every screen shows, one under another; with it, one at a time. -->
      <div class="product__viewer">
        <div class="product__screens">
          <img
            v-for="(image, index) in images"
            :key="image.src"
            class="product__screen"
            :class="{ 'product__screen--active': index === active }"
            :src="image.src"
            :alt="image.alt"
            :width="image.width"
            :height="image.height"
            :loading="index === 0 ? 'eager' : 'lazy'"
            decoding="async"
          >
        </div>
        <div class="product__caption">
          <!-- The image's own alt text already says this to screen readers. -->
          <span aria-hidden="true">{{ activeImage.alt }}</span>
          <ActionLink look="text" :to="activeImage.src" new-tab label="الصورة بحجمها الكامل" />
        </div>
      </div>

      <div v-if="images.length > 1" class="product__thumbs" role="group" aria-label="اختر شاشة">
        <button
          v-for="(image, index) in images"
          :key="image.src"
          type="button"
          class="product__thumb"
          :class="{ 'product__thumb--active': index === active }"
          :aria-current="index === active ? 'true' : undefined"
          @click="active = index"
        >
          <img :src="image.src" alt="" :width="image.width" :height="image.height" loading="lazy" decoding="async">
          <span class="product__thumb-label">{{ label(image.alt) }}</span>
        </button>
      </div>
    </section>

    <ClosingCall
      class="product__closing"
      heading="للاستفسار أو الشراء"
      :text="closingText"
      :data-theme="solution.look === 'sand' ? 'light' : undefined"
    >
      <div class="product__closing-side">
        <ProductPrice :amount="solution.priceIqd" />
        <WhatsAppCall :subject="solution.nameAr" label="اسأل عنه على واتساب" :glow="false" />
        <div class="product__closing-links">
          <ActionLink look="text" to="/contact" label="كل طرق التواصل" />
          <ActionLink look="text" to="/services" label="خدمات برمجية حسب الطلب" />
        </div>
      </div>
    </ClosingCall>
  </article>
</template>

<style scoped lang="scss">
$medium: 48em;
$wide: 64em;

.product {
  // Product colours: Nuqta Plus violet on dark, Dalaly sand and ink (with the light theme scoped).
  --product-accent: var(--nuqta-accent);

  &--sand {
    --product-accent: var(--dalaly-accent);
  }

  &__back {
    margin-block-end: var(--space-4);
    font-size: var(--text-small);
  }

  &__heading {
    margin: 0;
  }

  // ---------------------------------------------------------------------------
  // Hero panel: the offer beside two real screens, in the product's colours
  // ---------------------------------------------------------------------------

  &__hero {
    position: relative;
    overflow: hidden;
    display: grid;
    gap: var(--space-7);
    padding: var(--panel-pad);
    border-radius: var(--radius-xl);
    color: var(--text);

    @media (width >= $wide) {
      grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
      align-items: center;
      column-gap: var(--space-8);
    }

    .product--violet & {
      border: 1px solid var(--border);
      background-color: var(--nuqta-ground);
    }

    .product--sand & {
      background-color: var(--dalaly-ground);
      color: var(--dalaly-ink);
    }
  }

  &__intro {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__name {
    margin: var(--space-5) 0 0;
  }

  &__latin {
    margin-block-start: var(--space-1);
    font-size: var(--text-body);
    font-weight: 600;
    color: var(--text-muted);
  }

  &__tagline {
    margin-block-start: var(--space-3);
    font-family: var(--font-display);
    font-size: var(--text-lead);
    font-weight: 600;
    line-height: 1.7;
  }

  &__lede {
    max-inline-size: var(--measure);
    margin-block-start: var(--space-4);
    line-height: 1.75;
    color: var(--text-muted);
  }

  // Price and the actions that go with it.
  &__buy {
    align-self: stretch;
    margin-block-start: var(--space-7);
    padding-block-start: var(--space-5);
    border-block-start: 1px solid var(--border);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-5);
    margin-block-start: var(--space-5);
  }

  // The main screen runs out past the panel edge (the panel clips it); the second sits over its
  // lower corner. Phones get a focused crop of each so the screens stay legible.
  &__visual {
    position: relative;
    padding-block-end: 14%;

    @media (width >= $wide) {
      margin-inline-end: calc(-1 * var(--panel-pad) - var(--space-6));
    }
  }

  &__shot {
    --window-radius: var(--radius-md);

    &--main {
      --window-ratio: 1.3;
      --window-zoom: 1.5;

      @media (width >= $medium) {
        --window-ratio: auto;
        --window-zoom: 1;
      }
    }

    &--second {
      --window-ratio: 1.2;
      --window-zoom: 1.7;

      position: absolute;
      inset-block-end: 0;
      inset-inline-start: -3%;
      inline-size: 55%;

      @media (width >= $medium) {
        --window-ratio: auto;
        --window-zoom: 1;

        inline-size: 50%;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Features: an editorial list, the heading held beside it on wide screens
  // ---------------------------------------------------------------------------

  &__features {
    display: grid;
    gap: var(--head-gap);
    margin-block-start: var(--section-gap);

    @media (width >= $wide) {
      grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
      align-items: start;
      column-gap: var(--space-8);

      .product__heading {
        position: sticky;
        inset-block-start: calc(var(--header-height) + var(--space-6));
      }
    }
  }

  &__feature-list {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
    border-block-start: 1px solid var(--border);

    @media (width >= $wide) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: var(--space-7);
    }
  }

  &__feature {
    padding-block: var(--space-4);
    border-block-end: 1px solid var(--border);
    font-size: var(--text-body);
    font-weight: 500;
    line-height: 1.7;
  }

  // ---------------------------------------------------------------------------
  // Gallery: one screen at a time in a plain frame, thumbnails to choose
  // ---------------------------------------------------------------------------

  &__gallery {
    margin-block-start: var(--section-gap);
  }

  &__gallery-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-2) var(--space-6);
    margin-block-end: var(--head-gap);
  }

  &__gallery-note {
    color: var(--text-muted);
  }

  // Its ground shows until the screenshot has loaded.
  &__viewer {
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background-color: var(--surface-raised);
  }

  // Without JavaScript the screens stack; with it they share one cell and cross-fade.
  &__screens {
    display: grid;
    gap: var(--space-2);

    .js & {
      gap: 0;
    }
  }

  &__screen {
    display: block;
    inline-size: 100%;
    block-size: auto;

    .js & {
      grid-area: 1 / 1;
      opacity: 0;
      visibility: hidden;
      transition:
        opacity var(--duration-base) var(--ease-out),
        visibility 0s linear var(--duration-base);
    }

    .js &--active {
      opacity: 1;
      visibility: visible;
      transition: opacity var(--duration-base) var(--ease-out);
    }
  }

  &__caption {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2) var(--space-5);
    padding: var(--space-3) var(--space-4);
    border-block-start: 1px solid var(--border);
    background-color: var(--surface);
    font-size: var(--text-ui);
    line-height: 1.7;
    color: var(--text-muted);
  }

  // Thumbnails appear only with JavaScript (they need it to work).
  &__thumbs {
    display: none;

    .js & {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(7.5rem, 100%), 1fr));
      gap: var(--space-3);
      margin-block-start: var(--space-4);
    }
  }

  &__thumb {
    display: grid;
    gap: var(--space-2);
    padding: var(--space-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background-color: var(--surface);
    font: inherit;
    text-align: start;
    color: var(--text-muted);
    cursor: pointer;
    transition:
      border-color var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out);

    img {
      display: block;
      inline-size: 100%;
      block-size: auto;
      border-radius: calc(var(--radius-md) - var(--space-2) - 1px);
      opacity: 0.7;
      transition: opacity var(--duration-base) var(--ease-out);
    }

    @media (hover: hover) {
      &:hover {
        color: var(--text);

        img {
          opacity: 1;
        }
      }
    }

    // The heavier border takes its width from the padding, so the thumbnail never moves.
    &--active {
      padding: calc(var(--space-2) - 2px);
      border-width: 3px;
      border-color: var(--product-accent);
      color: var(--text);

      img {
        opacity: 1;
      }
    }
  }

  &__thumb-label {
    font-size: var(--text-small);
    font-weight: 600;
    line-height: 1.5;
  }

  // ---------------------------------------------------------------------------
  // Closing: the purchase panel, in the product's colours
  // ---------------------------------------------------------------------------

  &__closing {
    --closing-ground: var(--nuqta-ground);

    .product--sand & {
      --closing-ground: var(--dalaly-ground);
      --closing-ink: var(--dalaly-ink);
    }
  }

  &__closing-side {
    display: grid;
    justify-items: start;
    gap: var(--space-4);
  }

  &__closing-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-5);
    max-inline-size: 28rem;
  }
}
</style>
