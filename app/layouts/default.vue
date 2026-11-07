<script setup lang="ts">
import { company } from '~/data/company'

const links = [
  { to: '/', label: 'الرئيسية' },
  { to: '/services', label: 'خدماتنا' },
  { to: '/solutions', label: 'حلولنا' },
  { to: '/about', label: 'من نحن' },
  { to: '/faq', label: 'الأسئلة الشائعة' },
  { to: '/contact', label: 'تواصل معنا' }
]

// Site-wide share tags. Each page sets its own title, description, og:title and og:description.
// canonical and og:url need the real domain, so they only appear once company.siteUrl is filled in.
const route = useRoute()
const ogImage = '/brand/og.png'
const pageUrl = computed(() => (company.siteUrl ? `${company.siteUrl}${route.path}` : undefined))

useSeoMeta({
  ogType: 'website',
  ogLocale: 'ar_IQ',
  ogSiteName: company.name,
  ogImage: company.siteUrl ? `${company.siteUrl}${ogImage}` : ogImage,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'شعار Codel باللون الأبيض على خلفية داكنة',
  ogUrl: pageUrl
})

useHead(() => ({
  link: pageUrl.value ? [{ rel: 'canonical', href: pageUrl.value }] : []
}))
</script>

<template>
  <div class="layout">
    <a class="layout__skip" href="#main">تخطَّ إلى المحتوى</a>

    <header class="layout__header">
      <NuxtLink class="layout__brand" to="/" aria-label="Codel - كودل">
        <img
          class="layout__logo"
          src="/brand/codel-full-white.svg"
          alt="Codel"
          width="126"
          height="22"
        >
      </NuxtLink>

      <nav aria-label="القائمة الرئيسية">
        <ul class="layout__nav">
          <li v-for="link in links" :key="link.to">
            <NuxtLink class="layout__nav-link" :to="link.to">
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </header>

    <main id="main" class="layout__main" tabindex="-1">
      <slot />
    </main>

    <footer class="layout__footer">
      <p class="layout__footer-name"><span dir="ltr">Codel</span> - كودل</p>
      <address class="layout__contact">
        <ul class="layout__contact-list">
          <li>
            {{ company.phones.main.label }}:
            <a :href="company.phones.main.tel" dir="ltr">{{ company.phones.main.display }}</a>
          </li>
          <li>
            {{ company.phones.secondary.label }}:
            <a :href="company.phones.secondary.whatsapp" target="_blank" rel="noopener noreferrer" dir="ltr">{{ company.phones.secondary.display }}</a>
          </li>
          <li>
            البريد الإلكتروني:
            <a :href="`mailto:${company.email}`" dir="ltr">{{ company.email }}</a>
          </li>
          <li>{{ company.address }}</li>
          <li>ساعات الدوام: {{ company.hours.days }}، {{ company.hours.time }}</li>
        </ul>
      </address>
    </footer>
  </div>
</template>

<style scoped lang="scss">
// Minimum height of a touch target (WCAG 2.5.5).
$touch-target: 44px;

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  // Hidden until it receives keyboard focus; then shown at the top start corner.
  &__skip {
    position: absolute;
    inset-block-start: var(--space-2);
    inset-inline-start: var(--space-2);
    z-index: 10;
    display: inline-flex;
    align-items: center;
    min-block-size: $touch-target;
    padding-inline: var(--space-4);
    border-radius: var(--radius-sm);
    background-color: var(--primary);
    color: var(--on-primary);
    font-weight: 600;
    text-decoration: none;

    &:not(:focus) {
      inline-size: 1px;
      block-size: 1px;
      min-block-size: 0;
      padding: 0;
      overflow: hidden;
      white-space: nowrap;
      clip-path: inset(50%);
    }
  }

  &__header,
  &__footer {
    padding-inline: clamp(var(--space-4), 5vw, var(--space-6));
    border-color: var(--border);
    border-style: solid;
    border-width: 0;
  }

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-1) var(--space-6);
    min-block-size: var(--header-height);
    padding-block: var(--space-2);
    border-block-end-width: 1px;
  }

  &__brand {
    display: flex;
    align-items: center;
    min-block-size: $touch-target;
  }

  &__logo {
    block-size: 1.375rem;
    inline-size: auto;
  }

  &__nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-5);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__nav-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-block-size: $touch-target;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.4;
    color: var(--text-muted);
    text-decoration: none;

    &:hover {
      color: var(--text);
    }

    &:focus-visible {
      outline-offset: 4px;
      border-radius: var(--radius-sm);
    }

    &[aria-current='page'] {
      font-weight: 600;
      color: var(--text);

      &::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-end: var(--space-1);
        block-size: 3px;
        border-radius: var(--radius-pill);
        background-color: var(--accent-text);
        transform: skewX(calc(var(--slant-angle) * -1));
      }
    }
  }

  &__main {
    flex: 1;
    inline-size: 100%;
    max-inline-size: var(--container-max);
    margin-inline: auto;
    padding-block: var(--space-8);
    padding-inline: clamp(var(--space-4), 5vw, var(--space-6));

    // Focus lands here from the skip link; the container itself needs no ring.
    &:focus {
      outline: none;
    }
  }

  &__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4) var(--space-6);
    padding-block: var(--space-6);
    border-block-start-width: 1px;
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  &__footer-name {
    font-family: var(--font-display);
    font-weight: 700;
    color: var(--text);
  }

  &__contact {
    font-style: normal;
  }

  &__contact-list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;

    a {
      display: inline-flex;
      align-items: center;
      min-block-size: $touch-target;
    }
  }
}
</style>
