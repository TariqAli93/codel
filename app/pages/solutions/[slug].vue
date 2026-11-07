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

// Each product's page takes its colours from the product's own interface (as on the home page).
const productLook: Record<string, 'violet' | 'sand'> = { 'nuqta-plus': 'violet', dalaly: 'sand' }
const look = productLook[solution.slug] ?? 'violet'

// The screenshot viewer: one screen at a time, chosen from the thumbnails. A screenshot's short
// label is its alt text up to the colon ("شاشة نقطة البيع في نقطة بلس: …").
const images = solution.images
const label = (alt: string) => alt.split(':')[0]?.trim() ?? alt
const active = ref(0)
const activeImage = computed(() => images[active.value] ?? images[0])
</script>

<template>
  <article v-if="solution" class="product" :class="`product--${look}`">
    <p class="product__back"><NuxtLink to="/solutions">كل الحلول</NuxtLink></p>

    <header class="product__hero" :data-theme="look === 'sand' ? 'light' : undefined">
      <div class="product__intro">
        <p class="product__chip"><span class="product__chip-text">يعمل على {{ solution.platform }}</span></p>
        <h1 class="product__name">
          {{ solution.nameAr }}
          <span class="product__latin" dir="ltr">{{ solution.nameEn }}</span>
        </h1>
        <p class="product__tagline">{{ solution.tagline }}</p>
        <p class="product__lede">{{ solution.description }}</p>

        <div class="product__buy">
          <p class="product__price">
            <span class="product__price-figure">{{ price }}</span>
            <span class="product__price-unit">دينار عراقي</span>
          </p>
          <div class="product__actions">
            <ActionLink look="solid" :to="whatsappHref" new-tab label="اسأل عنه على واتساب" />
            <a class="product__link" :href="company.phones.main.tel">أو اتصل <span dir="ltr">{{ company.phones.main.display }}</span></a>
          </div>
        </div>
      </div>

      <!-- The first two screens, layered; decorative here, every screen is described in the viewer below. -->
      <div v-if="images.length" class="product__visual" aria-hidden="true">
        <ProductWindow v-if="images[0]" v-bind="images[0]" alt="" :title="solution.nameAr" eager class="product__shot product__shot--main" />
        <ProductWindow v-if="images[1]" v-bind="images[1]" alt="" :title="solution.nameAr" eager class="product__shot product__shot--second" />
      </div>
    </header>

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
      <figure class="product__viewer">
        <div class="product__viewer-bar" aria-hidden="true">
          <span class="product__viewer-title">{{ label(activeImage.alt) }}</span>
          <span class="product__viewer-lights"><span /><span /><span /></span>
        </div>
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
        <figcaption class="product__caption">
          <!-- The image's own alt text already says this to screen readers. -->
          <span aria-hidden="true">{{ activeImage.alt }}</span>
          <a class="product__full" :href="activeImage.src" target="_blank" rel="noopener noreferrer">الصورة بحجمها الكامل<span class="product__hidden"> (يفتح في نافذة جديدة)</span></a>
        </figcaption>
      </figure>

      <div v-if="images.length > 1" class="product__thumbs" role="group" aria-label="اختر شاشة">
        <button
          v-for="(image, index) in images"
          :key="image.src"
          type="button"
          class="product__thumb"
          :class="{ 'product__thumb--active': index === active }"
          :aria-pressed="index === active"
          @click="active = index"
        >
          <img :src="image.src" alt="" :width="image.width" :height="image.height" loading="lazy" decoding="async">
          <span class="product__thumb-label">{{ label(image.alt) }}</span>
        </button>
      </div>
    </section>

    <section class="product__cta" :data-theme="look === 'sand' ? 'light' : undefined" aria-labelledby="contact-title">
      <div>
        <h2 id="contact-title" class="product__heading">للاستفسار أو الشراء</h2>
        <p class="product__cta-text">
          تواصل معنا وسنوضّح لك التفاصيل. الدوام {{ company.hours.days }}، {{ company.hours.time }}.
        </p>
      </div>
      <div class="product__cta-side">
        <p class="product__price product__price--small">
          <span class="product__price-figure">{{ price }}</span>
          <span class="product__price-unit">دينار عراقي</span>
        </p>
        <div class="product__actions">
          <ActionLink look="solid" :to="whatsappHref" new-tab label="اسأل عنه على واتساب" />
          <a class="product__link" :href="`mailto:${company.email}`" dir="ltr">{{ company.email }}</a>
          <NuxtLink class="product__link" to="/contact">كل طرق التواصل</NuxtLink>
        </div>
      </div>
    </section>
  </article>
</template>

<style scoped lang="scss">
// The brand lean, and the counter-slant that turns a label back upright.
$lean: skewX(calc(var(--slant-angle) * -1));
$upright: skewX(var(--slant-angle));

$medium: 48em;
$wide: 64em;
$panel-pad: clamp(var(--space-5), 5vw, var(--space-9));

.product {
  // Product colours: Nuqta Plus violet on dark, Dalaly sand and ink (with the light theme scoped).
  --product-accent: var(--nuqta-accent);

  &--sand {
    --product-accent: var(--dalaly-accent);
  }

  &__back {
    margin-block-end: var(--space-4);
    font-size: 0.875rem;
    font-weight: 600;

    a {
      display: inline-flex;
      align-items: center;
      min-block-size: 44px;
    }
  }

  &__heading {
    margin: 0;
    font-size: var(--text-title);
    line-height: 1.25;
    font-weight: 800;
  }

  // Standalone links: 44px touch target. The gap stands in for the space a flex box drops
  // between text and a dir="ltr" span.
  &__link {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    min-block-size: 44px;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  // ---------------------------------------------------------------------------
  // Hero panel: the offer beside two real screens, in the product's colours
  // ---------------------------------------------------------------------------

  &__hero {
    position: relative;
    overflow: hidden;
    display: grid;
    gap: var(--space-7);
    padding: $panel-pad;
    border-radius: var(--radius-xl);
    color: var(--text);

    @media (width >= $wide) {
      grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
      align-items: center;
      column-gap: var(--space-8);
    }

    .product--violet & {
      border: 1px solid var(--border);
      background:
        radial-gradient(ellipse 70% 90% at 10% 55%, color-mix(in srgb, var(--nuqta-accent) 28%, transparent), transparent 70%),
        var(--surface);
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

  // A tag, so it leans; its text stands upright.
  &__chip {
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    font-size: var(--text-small);
    font-weight: 500;
    line-height: 1.6;
    color: var(--text-muted);
    transform: $lean;
  }

  &__chip-text {
    display: block;
    transform: $upright;
  }

  &__name {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--space-3);
    margin: var(--space-5) 0 0;
    font-size: clamp(2.5rem, 1.6rem + 3.4vw, 4.25rem);
    line-height: 1.2;
    font-weight: 800;
  }

  &__latin {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  &__tagline {
    margin-block-start: var(--space-3);
    font-family: var(--font-display);
    font-size: var(--text-lead);
    font-weight: 600;
    line-height: 1.6;
  }

  &__lede {
    max-inline-size: 34rem;
    margin-block-start: var(--space-4);
    line-height: 1.9;
    color: var(--text-muted);
  }

  // Price and the actions that go with it, set off by a line in the product's colour.
  &__buy {
    align-self: stretch;
    margin-block-start: var(--space-7);
    padding-block-start: var(--space-5);
    border-block-start: 2px solid color-mix(in srgb, var(--product-accent) 55%, transparent);
  }

  &__price {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--space-2);
    margin: 0;
  }

  &__price-figure {
    font-family: var(--font-display);
    font-size: var(--text-figure);
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    // Western digits only, never Arabic text.
    letter-spacing: -0.02em;
  }

  &__price-unit {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-muted);
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
      margin-inline-end: calc(-1 * #{$panel-pad} - var(--space-6));
    }
  }

  &__shot {
    transition: translate var(--duration-base) var(--ease-out);

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

  @media (hover: hover) {
    &__visual:hover &__shot--second {
      translate: 0 -0.5rem;
    }
  }

  // ---------------------------------------------------------------------------
  // Features: an editorial list, the heading held beside it on wide screens
  // ---------------------------------------------------------------------------

  &__features {
    display: grid;
    gap: var(--space-6);
    margin-block-start: clamp(var(--space-9), 9vw, var(--space-10));

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

    @media (width >= $medium) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: var(--space-7);
    }
  }

  &__feature {
    display: flex;
    gap: var(--space-3);
    padding-block: var(--space-4);
    border-block-end: 1px solid var(--border);
    font-size: 1.0625rem;
    font-weight: 500;
    line-height: 1.7;

    // A point in the product's colour, on the first line's letter bodies.
    &::before {
      content: '';
      flex: none;
      inline-size: var(--point-md);
      block-size: var(--point-md);
      margin-block-start: 0.55em;
      border-radius: 50%;
      background-color: var(--product-accent);
    }
  }

  // ---------------------------------------------------------------------------
  // Gallery: one screen at a time in a window, thumbnails to choose
  // ---------------------------------------------------------------------------

  &__gallery {
    margin-block-start: clamp(var(--space-9), 9vw, var(--space-10));
  }

  &__gallery-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-2) var(--space-6);
    margin-block-end: var(--space-6);
  }

  &__gallery-note {
    color: var(--text-muted);
  }

  &__viewer {
    overflow: hidden;
    margin: 0;
    border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
    border-radius: var(--radius-lg);
    background-color: var(--surface-raised);
    box-shadow: 0 2rem 4rem -1.5rem color-mix(in srgb, black 60%, transparent);
  }

  &__viewer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    block-size: 2.25rem;
    padding-inline: var(--space-4);
    border-block-end: 1px solid var(--border);
    background-color: var(--surface);
  }

  &__viewer-title {
    overflow: hidden;
    font-size: var(--text-small);
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--text-muted);
  }

  &__viewer-lights {
    display: flex;
    gap: 0.35rem;

    span {
      inline-size: 0.6rem;
      block-size: 0.6rem;
      border-radius: 50%;
      background-color: var(--border-strong);
    }
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
      scale: 1.015;
      visibility: hidden;
      transition:
        opacity var(--duration-slow) var(--ease-out),
        scale var(--duration-slow) var(--ease-out),
        visibility 0s linear var(--duration-slow);
    }

    .js &--active {
      opacity: 1;
      scale: 1;
      visibility: visible;
      transition:
        opacity var(--duration-slow) var(--ease-out),
        scale var(--duration-slow) var(--ease-out);
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
    font-size: 0.9375rem;
    line-height: 1.7;
    color: var(--text-muted);
  }

  &__full {
    display: inline-flex;
    align-items: center;
    min-block-size: 44px;
    font-weight: 600;
    white-space: nowrap;
  }

  &__hidden {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  // Thumbnails appear only with JavaScript (they need it to work).
  &__thumbs {
    display: none;

    .js & {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(9rem, 100%), 1fr));
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
      color var(--duration-fast) var(--ease-out),
      translate var(--duration-base) var(--ease-out);

    img {
      display: block;
      inline-size: 100%;
      block-size: auto;
      border-radius: var(--radius-sm);
      opacity: 0.7;
      transition: opacity var(--duration-base) var(--ease-out);
    }

    @media (hover: hover) {
      &:hover {
        translate: 0 -2px;
        color: var(--text);

        img {
          opacity: 1;
        }
      }
    }

    &--active {
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
  // Closing: the purchase band, in the product's colours
  // ---------------------------------------------------------------------------

  &__cta {
    display: grid;
    gap: var(--space-6);
    margin-block-start: clamp(var(--space-9), 9vw, var(--space-10));
    padding: $panel-pad;
    border-radius: var(--radius-xl);
    color: var(--text);

    @media (width >= $wide) {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: end;
      column-gap: var(--space-8);
    }

    .product--violet & {
      background:
        linear-gradient(120deg, color-mix(in srgb, var(--nuqta-accent) 32%, transparent), transparent 70%),
        var(--surface);
      border: 1px solid var(--border);
    }

    .product--sand & {
      background-color: var(--dalaly-ground);
      color: var(--dalaly-ink);
    }
  }

  &__cta-text {
    max-inline-size: 32rem;
    margin-block-start: var(--space-3);
    line-height: 1.9;
    color: var(--text-muted);
  }
}

// Entrance: plain CSS, so it starts with the first paint: the offer, then the screens. Fill
// backwards only, so hover can move the screens once they have arrived.
@media (prefers-reduced-motion: no-preference) {
  .product__intro > * {
    animation: product-rise 0.7s var(--ease-out) backwards;

    @for $i from 2 through 6 {
      &:nth-child(#{$i}) {
        animation-delay: #{($i - 1) * 0.06}s;
      }
    }
  }

  .product__shot--main {
    animation: product-settle 1.1s var(--ease-out) 0.15s backwards;
  }

  .product__shot--second {
    animation: product-settle 1.1s var(--ease-out) 0.35s backwards;
  }
}

// On scroll, where the browser links animation to it: the features, the viewer and the purchase band
// rise in as they arrive. Whatever holds keyboard focus shows at once.
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .product__feature-list,
    .product__viewer,
    .product__cta {
      animation: product-reveal linear backwards;
      animation-timeline: view();
      animation-range: entry 0% entry 55%;

      &:focus-within {
        animation: none;
      }
    }
  }
}

@keyframes product-reveal {
  from {
    opacity: 0;
    translate: 0 2.5rem;
  }
}

@keyframes product-rise {
  from {
    opacity: 0;
    translate: 0 1rem;
  }
}

@keyframes product-settle {
  from {
    opacity: 0;
    translate: 0 2rem;
  }
}
</style>
