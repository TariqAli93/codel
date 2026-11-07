<script setup lang="ts">
import { company } from '~/data/company'

interface NavLink {
  to: string
  label: string
  // Drawn as the leaning button at the end of the bar.
  cta?: boolean
}

const links: NavLink[] = [
  { to: '/', label: 'الرئيسية' },
  { to: '/services', label: 'خدماتنا' },
  { to: '/solutions', label: 'حلولنا' },
  { to: '/about', label: 'من نحن' },
  { to: '/faq', label: 'الأسئلة الشائعة' },
  { to: '/contact', label: 'تواصل معنا', cta: true }
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

// Marks <html class="js"> before the first paint. Without JavaScript the class is missing and the
// small-screen header keeps the links as a plain list instead of a menu button that could not open.
useHead({
  script: [{ key: 'js-flag', innerHTML: "document.documentElement.classList.add('js')" }]
})

// A page that draws its own full-width sections sets definePageMeta({ fullWidth: true }) (the home page).
const fullWidth = computed(() => route.meta.fullWidth === true)

// /solutions/<slug> keeps "حلولنا" marked: the link's section is current, not only its exact page.
const inSection = (to: string) => to !== '/' && route.path.startsWith(`${to}/`)

// Small-screen menu. Same breakpoint as $nav-wide in the styles below.
const wideQuery = '(min-width: 60em)'
const menuOpen = ref(false)
const header = ref<HTMLElement | null>(null)
const menuButton = ref<HTMLButtonElement | null>(null)

function closeMenu(restoreFocus = false) {
  if (!menuOpen.value) return
  menuOpen.value = false
  if (restoreFocus) menuButton.value?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu(true)
}

// A press or a focus move outside the header closes the menu.
function onPointerDown(event: PointerEvent) {
  if (event.target instanceof Node && !header.value?.contains(event.target)) closeMenu()
}

function onFocusOut(event: FocusEvent) {
  if (event.relatedTarget instanceof Node && !header.value?.contains(event.relatedTarget)) closeMenu()
}

function onWideChange(event: MediaQueryListEvent) {
  if (event.matches) closeMenu()
}

function stopListening() {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', onPointerDown)
}

watch(menuOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('pointerdown', onPointerDown)
  } else {
    stopListening()
  }
})

watch(() => route.fullPath, () => closeMenu())

let wideMedia: MediaQueryList | undefined

onMounted(() => {
  wideMedia = window.matchMedia(wideQuery)
  wideMedia.addEventListener('change', onWideChange)
})

onBeforeUnmount(() => {
  wideMedia?.removeEventListener('change', onWideChange)
  stopListening()
})
</script>

<template>
  <div class="layout">
    <a class="layout__skip" href="#main">تخطَّ إلى المحتوى</a>

    <header ref="header" class="layout__header" @focusout="onFocusOut">
      <div class="layout__bar">
        <NuxtLink class="layout__brand" to="/" aria-label="Codel - كودل">
          <img
            class="layout__logo"
            src="/brand/codel-full-white.svg"
            alt="Codel"
            width="126"
            height="22"
          >
        </NuxtLink>

        <nav class="layout__nav" aria-label="القائمة الرئيسية">
          <button
            ref="menuButton"
            class="layout__menu-button"
            type="button"
            aria-controls="site-menu"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
          >
            <span class="layout__menu-button-inner">
              <span class="layout__menu-icon" aria-hidden="true" />
              القائمة
            </span>
          </button>

          <ul id="site-menu" class="layout__menu" :class="{ 'layout__menu--open': menuOpen }">
            <li
              v-for="link in links"
              :key="link.to"
              class="layout__menu-item"
              :class="{ 'layout__menu-item--cta': link.cta }"
            >
              <NuxtLink
                class="layout__link"
                :class="{ 'layout__link--cta': link.cta, 'layout__link--section': inSection(link.to) }"
                :to="link.to"
                @click="closeMenu()"
              >
                <span class="layout__link-label">{{ link.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>

    <main id="main" class="layout__main" :class="{ 'layout__main--full': fullWidth }" tabindex="-1">
      <slot />
    </main>

    <footer class="layout__footer">
      <div class="layout__footer-inner">
        <div class="layout__identity">
          <img
            class="layout__footer-logo"
            src="/brand/codel-full-white.svg"
            alt=""
            width="160"
            height="28"
            loading="lazy"
          >
          <p class="layout__footer-name"><span dir="ltr">Codel</span> - كودل</p>
          <p class="layout__footer-about">شركة برمجيات عراقية في {{ company.addressParts.city }}.</p>
        </div>

        <address class="layout__contact">
          <dl class="layout__contact-list">
            <div class="layout__contact-row">
              <dt>{{ company.phones.main.label }}</dt>
              <dd><a :href="company.phones.main.tel" dir="ltr">{{ company.phones.main.display }}</a></dd>
            </div>
            <div class="layout__contact-row">
              <dt>{{ company.phones.secondary.label }}</dt>
              <dd>
                <a :href="company.phones.secondary.whatsapp" target="_blank" rel="noopener noreferrer" dir="ltr">{{ company.phones.secondary.display }}</a>
              </dd>
            </div>
            <div class="layout__contact-row">
              <dt>البريد الإلكتروني</dt>
              <dd><a :href="`mailto:${company.email}`" dir="ltr">{{ company.email }}</a></dd>
            </div>
            <div class="layout__contact-row">
              <dt>العنوان</dt>
              <dd>{{ company.address }}</dd>
            </div>
            <div class="layout__contact-row">
              <dt>ساعات الدوام</dt>
              <dd>{{ company.hours.days }}، {{ company.hours.time }}</dd>
            </div>
          </dl>
        </address>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
// Minimum height of a touch target (WCAG 2.5.5).
$touch-target: 44px;
// Below this width the links fold behind the menu button. Same value as wideQuery in the script.
$nav-wide: 60em;
// The brand lean, and the counter-slant that turns a label back upright.
$lean: skewX(calc(var(--slant-angle) * -1));
$upright: skewX(var(--slant-angle));

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  // Hidden until it receives keyboard focus; then shown at the top start corner.
  &__skip {
    position: absolute;
    inset-block-start: var(--space-2);
    inset-inline-start: var(--space-2);
    z-index: 30;
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

  // ---------------------------------------------------------------------------
  // Header
  // ---------------------------------------------------------------------------

  &__header {
    position: sticky;
    inset-block-start: 0;
    z-index: 20;
    border-block-end: 1px solid var(--border);
    background-color: var(--bg);
  }

  // Same width and gutters as the page content, so logo and links line up with it.
  &__bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0 var(--space-6);
    max-inline-size: var(--container-max);
    min-block-size: var(--header-height);
    margin-inline: auto;
    padding-inline: var(--page-gutter);
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

  &__menu-button {
    display: none;
  }

  &__menu {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-5);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__menu-item--cta {
    margin-inline-start: var(--space-2);
  }

  &__link {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-block-size: $touch-target;
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 1.4;
    color: var(--text-muted);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);

    // Leaning bar under the link: grows from the start on hover, stays full and lime on the current page.
    &::after {
      content: '';
      position: absolute;
      inset-inline: 0;
      inset-block-end: var(--space-1);
      block-size: 3px;
      border-radius: var(--radius-pill);
      background-color: var(--border-strong);
      transform: $lean scaleX(0);
      transform-origin: right center; // inline start in RTL
      transition:
        transform var(--duration-base) var(--ease-out),
        background-color var(--duration-fast) var(--ease-out);
    }

    // Hover styles only where a pointer can hover: on touch, :hover sticks after a tap.
    @media (hover: hover) {
      &:hover {
        color: var(--text);

        &::after {
          transform: $lean scaleX(1);
        }
      }
    }

    &:focus-visible {
      outline-offset: 4px;
      border-radius: var(--radius-sm);
    }

    &[aria-current='page'],
    &--section {
      font-weight: 600;
      color: var(--text);

      &::after {
        background-color: var(--accent-text);
        transform: $lean scaleX(1);
      }
    }
  }

  // "تواصل معنا": an outlined leaning button; the label inside is turned back upright.
  &__link--cta {
    padding-inline: var(--space-5);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-weight: 600;
    transform: $lean;
    transition:
      border-color var(--duration-fast) var(--ease-out),
      background-color var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out),
      scale var(--duration-fast) var(--ease-out);

    &::after {
      content: none;
    }

    .layout__link-label {
      transform: $upright;
    }

    @media (hover: hover) {
      &:hover {
        border-color: var(--accent);
        color: var(--text);
      }
    }

    &:active {
      background-color: var(--surface-raised);
      scale: 0.96;
    }

    &[aria-current='page'] {
      border-color: var(--accent);
      background-color: var(--accent);
      color: var(--on-accent);
    }

    &:focus-visible {
      outline-offset: 3px;
    }
  }

  // Small screens, with JavaScript: the links fold into a panel under the header.
  // Without JavaScript (no .js class) they stay a wrapping list and the button stays hidden.
  @media (width < $nav-wide) {
    .js &__menu-button {
      display: inline-flex;
      align-items: center;
      min-block-size: $touch-target;
      padding-inline: var(--space-4);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-sm);
      background-color: transparent;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transform: $lean;
      transition:
        border-color var(--duration-fast) var(--ease-out),
        background-color var(--duration-fast) var(--ease-out),
        scale var(--duration-fast) var(--ease-out);

      &[aria-expanded='true'] {
        border-color: var(--accent);
      }

      @media (hover: hover) {
        &:hover {
          border-color: var(--accent);
        }
      }

      &:active {
        background-color: var(--surface-raised);
        scale: 0.96;
      }
    }

    &__menu-button-inner {
      display: inline-flex;
      align-items: center;
      gap: var(--space-3);
      transform: $upright;
    }

    // Two leaning bars of different length that cross into an X while the menu is open.
    &__menu-icon {
      position: relative;
      inline-size: 1.125rem;
      block-size: 0.75rem;

      &::before,
      &::after {
        content: '';
        position: absolute;
        inset-inline-start: 0;
        block-size: 2px;
        border-radius: var(--radius-pill);
        background-color: currentColor;
        transition: transform var(--duration-base) var(--ease-out), inline-size var(--duration-base) var(--ease-out);
      }

      &::before {
        inset-block-start: 0;
        inline-size: 100%;
        transform: $lean;
      }

      &::after {
        inset-block-end: 0;
        inline-size: 65%;
        transform: $lean;
      }
    }

    [aria-expanded='true'] &__menu-icon {
      &::before {
        transform: translateY(5px) rotate(45deg);
      }

      &::after {
        inline-size: 100%;
        transform: translateY(-5px) rotate(-45deg);
      }
    }

    .js &__menu {
      position: absolute;
      inset-block-start: 100%;
      inset-inline: 0;
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: stretch;
      max-block-size: calc(100dvh - var(--header-height));
      overflow-y: auto;
      overscroll-behavior: contain;
      padding: var(--space-3) var(--page-gutter) var(--space-6);
      border-block-end: 1px solid var(--border);
      background-color: var(--bg);
      box-shadow: var(--shadow-md);
      visibility: hidden;
      opacity: 0;
      transform: translateY(calc(var(--space-2) * -1));
      transition:
        opacity var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out),
        visibility 0s linear var(--duration-base);
    }

    .js &__menu--open {
      visibility: visible;
      opacity: 1;
      transform: none;
      transition-delay: 0s;
    }

    .js &__menu-item {
      opacity: 0;
      transform: translateY(calc(var(--space-1) * -1));
      transition:
        opacity var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);

      @for $i from 1 through 8 {
        &:nth-child(#{$i}) {
          transition-delay: calc(var(--stagger) * 0.4 * #{$i - 1});
        }
      }
    }

    .js &__menu--open &__menu-item {
      opacity: 1;
      transform: none;
    }

    .js &__menu-item--cta {
      margin-block-start: var(--space-4);
      margin-inline-start: 0;
    }

    .js &__link {
      inline-size: 100%;
      min-block-size: 3.5rem;
      padding-inline-start: var(--space-5);
      font-family: var(--font-display);
      font-size: 1.375rem;
      font-weight: 600;

      // In the panel the indicator is a short upright-height bar at the start of the row.
      &::after {
        inset-inline: 0 auto;
        inset-block: 0;
        inline-size: 0.375rem;
        block-size: 1.375rem;
        margin-block: auto;
      }
    }

    .js &__link--cta {
      justify-content: center;
      min-block-size: var(--control-lg);
      padding-inline-start: var(--space-5);
      font-family: var(--font-sans);
      font-size: 1rem;
    }
  }

  // ---------------------------------------------------------------------------
  // Main
  // ---------------------------------------------------------------------------

  &__main {
    flex: 1;
    inline-size: 100%;
    max-inline-size: var(--container-max);
    margin-inline: auto;
    padding-block: var(--space-8);
    padding-inline: var(--page-gutter);

    // The page draws its own widths and spacing.
    &--full {
      max-inline-size: none;
      padding: 0;
    }

    // Focus lands here from the skip link; the container itself needs no ring.
    &:focus {
      outline: none;
    }
  }

  // ---------------------------------------------------------------------------
  // Footer
  // ---------------------------------------------------------------------------

  &__footer {
    border-block-start: 1px solid var(--border);
    font-size: 0.9375rem;
    color: var(--text-muted);
  }

  &__footer-inner {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(20rem, 100%), 1fr));
    gap: var(--space-7) var(--space-8);
    max-inline-size: var(--container-max);
    margin-inline: auto;
    padding: clamp(var(--space-7), 7vw, var(--space-9)) var(--page-gutter) var(--space-7);
  }

  &__identity {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  &__footer-logo {
    block-size: 1.75rem;
    inline-size: auto;
    margin-block-end: var(--space-3);
  }

  &__footer-name {
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.5;
    color: var(--text);
  }

  &__footer-about {
    margin: 0;
  }

  &__contact {
    font-style: normal;
  }

  &__contact-list {
    margin: 0;
  }

  &__contact-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-5);
    min-block-size: $touch-target;

    dt {
      flex: 0 0 8.5rem;
    }

    dd {
      flex: 1 1 14rem;
      min-inline-size: 0;
      margin: 0;
      color: var(--text);
      overflow-wrap: anywhere;
    }

    // Standalone links: 44px touch target (WCAG 2.5.5).
    a {
      display: inline-flex;
      align-items: center;
      min-block-size: $touch-target;
      font-weight: 500;
      color: var(--text);
      text-decoration-color: var(--border-strong);
      transition: text-decoration-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out);

      @media (hover: hover) {
        &:hover {
          color: var(--accent-text);
          text-decoration-color: currentColor;
        }
      }
    }
  }
}
</style>
