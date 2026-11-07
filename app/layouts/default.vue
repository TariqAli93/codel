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

        <nav class="layout__footer-nav" aria-label="روابط الموقع">
          <ul class="layout__footer-links">
            <li v-for="link in links" :key="link.to">
              <NuxtLink class="layout__footer-link" :to="link.to">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <address class="layout__contact">
          <dl class="layout__contact-list">
            <div class="layout__contact-row">
              <dt>{{ company.phones.main.label }}</dt>
              <dd>
                <a :href="company.phones.main.tel" dir="ltr">{{ company.phones.main.display }}</a>
                <!-- The hidden number keeps this link's name apart from other "واتساب" links. -->
                <a :href="company.phones.main.whatsapp" target="_blank" rel="noopener noreferrer">واتساب <span class="layout__hidden" dir="ltr">{{ company.phones.main.display }}</span> <span class="layout__hidden">(يفتح في نافذة جديدة)</span></a>
              </dd>
            </div>
            <div class="layout__contact-row">
              <dt>{{ company.phones.secondary.label }}</dt>
              <dd>
                <a :href="company.phones.secondary.whatsapp" target="_blank" rel="noopener noreferrer" dir="ltr">{{ company.phones.secondary.display }} <span class="layout__hidden" dir="rtl">(يفتح في نافذة جديدة)</span></a>
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
      <!-- The company name once more, in outline type as large as the window allows. -->
      <p class="layout__footer-word" aria-hidden="true">كودل</p>
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
// Footer: stacked below the first, two columns between, three from the second.
$footer-two: 48em;
$footer-three: 64em;

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

  // Sticky only while it stays one bar high: with JavaScript (the links fold into the menu) or on
  // wide screens. Without JavaScript on a small screen the links wrap into a tall header that would
  // cover whatever has focus.
  &__header {
    position: relative;
    z-index: 20;
    background-color: var(--bg);

    // Frosted where the browser can blur what scrolls under it.
    @supports (backdrop-filter: blur(1px)) {
      background-color: color-mix(in srgb, var(--bg) 80%, transparent);
      backdrop-filter: blur(14px) saturate(1.3);
    }

    .js & {
      position: sticky;
      inset-block-start: 0;
    }

    @media (width >= $nav-wide) {
      position: sticky;
      inset-block-start: 0;
    }

    // The bottom rule. Shown by default; where scroll timelines exist it fades in over the
    // first few rem of scroll, so the header sits flush with the page at the top.
    &::after {
      content: '';
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      block-size: 1px;
      background-color: var(--border);
      pointer-events: none;

      @media (prefers-reduced-motion: no-preference) {
        @supports (animation-timeline: scroll()) {
          animation: layout-rule linear both;
          animation-timeline: scroll(root);
          animation-range: 0 6rem;
        }
      }
    }
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

  // Wide enough apart that each link's point sits clearly with its own label.
  &__menu {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-6);
    margin: 0;
    padding: 0;
    list-style: none;
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

    // A point before the label, outside it so the label never moves: grey on hover, lime on
    // the current page (live now). Nudged down onto the Arabic letter bodies.
    &::before {
      content: '';
      position: absolute;
      inset-block: 0;
      inset-inline-start: calc(-1 * (var(--point-sm) + var(--space-2)));
      inline-size: var(--point-sm);
      block-size: var(--point-sm);
      margin-block: auto;
      border-radius: 50%;
      background-color: var(--border-strong);
      scale: 0;
      translate: 0 0.08em;
      transition:
        scale var(--duration-base) var(--ease-out),
        background-color var(--duration-fast) var(--ease-out);
    }

    // Hover styles only where a pointer can hover: on touch, :hover sticks after a tap.
    @media (hover: hover) {
      &:hover {
        color: var(--text);

        &::before {
          scale: 1;
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

      &::before {
        background-color: var(--accent);
        scale: 1;
      }
    }
  }

  // "تواصل معنا": the leaning button, lime with a neon glow so it is the first thing the eye finds.
  // The label inside is turned back upright. On its own page a dark point marks it current.
  &__link--cta {
    padding-inline: var(--space-5);
    border-radius: var(--radius-sm);
    background-color: var(--primary);
    color: var(--on-primary);
    font-weight: 600;
    transform: $lean;
    transition:
      background-color var(--duration-fast) var(--ease-out),
      scale var(--duration-fast) var(--ease-out);

    // The nav point is not drawn on the button.
    &::before {
      content: none;
    }

    // Neon glow on its own layer, so hover only has to raise its opacity. It leans with the button.
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      box-shadow: var(--glow-accent);
      opacity: 0.4;
      pointer-events: none;
      transition: opacity var(--duration-base) var(--ease-out);
    }

    .layout__link-label {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      transform: $upright;
    }

    @media (hover: hover) {
      &:hover {
        background-color: var(--primary-hover);
        color: var(--on-primary);

        &::after {
          opacity: 0.8;
        }
      }
    }

    &:active {
      background-color: var(--primary-active);
      scale: 0.96;
    }

    &[aria-current='page'] {
      color: var(--on-primary);

      .layout__link-label::before {
        content: '';
        flex: none;
        inline-size: var(--point-sm);
        block-size: var(--point-sm);
        border-radius: 50%;
        background-color: currentColor;
        translate: 0 0.08em;
      }
    }

    &:focus-visible {
      outline-offset: 3px;
    }
  }

  // Small screens, with JavaScript: the links fold into a panel under the header.
  // Without JavaScript (no .js class) they stay a wrapping list and the button stays hidden.
  @media (width < $nav-wide) {
    // An outlined leaning button; icon and label inside are turned back upright.
    .js &__menu-button {
      display: inline-flex;
      align-items: center;
      min-block-size: $touch-target;
      padding-inline: var(--space-4) var(--space-5);
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
        border-color: var(--text);
      }

      @media (hover: hover) {
        &:hover {
          border-color: var(--text);
        }
      }

      &:active {
        background-color: var(--surface-raised);
        scale: 0.97;
      }
    }

    &__menu-button-inner {
      display: inline-flex;
      align-items: center;
      gap: var(--space-3);
      transform: $upright;
    }

    // Two bars, full and 65%, that cross into an X while the menu is open (transform only).
    // Both bars span the icon; the short one is scaled down and shifted 17.5% to the right,
    // the inline start in RTL, so the two share that edge.
    &__menu-icon {
      position: relative;
      inline-size: 1.125rem;
      block-size: 0.75rem;

      &::before,
      &::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        block-size: var(--stroke);
        border-radius: var(--radius-pill);
        background-color: currentColor;
        transition: transform var(--duration-base) var(--ease-out);
      }

      &::before {
        inset-block-start: 0;
        transform: translate(0, 0) rotate(0deg);
      }

      &::after {
        inset-block-end: 0;
        transform: translate(17.5%, 0) rotate(0deg) scaleX(0.65);
      }
    }

    [aria-expanded='true'] &__menu-icon {
      &::before {
        transform: translate(0, 5px) rotate(45deg);
      }

      &::after {
        transform: translate(0, -5px) rotate(-45deg) scaleX(1);
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

    // The panel scrolls, so it clips what spills out of it: this padding keeps the CTA's glow
    // inside it (the glow fades out within about 2.5rem).
    .js &__menu-item--cta {
      margin-block-start: var(--space-4);
      padding-inline: var(--space-5);
      padding-block-end: var(--space-2);
    }

    // In the panel the point stands in the row before the label, so every label starts on one line.
    .js &__link {
      gap: var(--space-3);
      inline-size: 100%;
      min-block-size: 3.5rem;
      font-family: var(--font-display);
      font-size: 1.375rem;
      font-weight: 600;

      &::before {
        position: static;
        flex: none;
      }
    }

    .js &__link--cta {
      justify-content: center;
      gap: var(--space-2);
      min-block-size: var(--control-lg);
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
    overflow: hidden;
    border-block-start: 1px solid var(--border);
    font-size: 0.9375rem;
    color: var(--text-muted);
  }

  // Cut off at the bottom of the page; it rises as the footer arrives.
  &__footer-word {
    position: relative;
    margin: 0 0 -0.32em;
    padding-inline: var(--page-gutter);
    font-family: var(--font-display);
    font-size: clamp(6rem, 2rem + 24vw, 22rem);
    font-weight: 900;
    line-height: 1;
    text-align: center;
    color: transparent;
    -webkit-text-stroke: 1px var(--border-strong);
    user-select: none;

    @media (prefers-reduced-motion: no-preference) {
      @supports (animation-timeline: view()) {
        animation: layout-rise linear both;
        animation-timeline: view();
        animation-range: entry 0% entry 100%;
      }
    }
  }

  // Identity, links, contact: stacked, then identity across the top of two columns, then three.
  &__footer-inner {
    display: grid;
    gap: var(--space-7) var(--space-8);
    max-inline-size: var(--container-max);
    margin-inline: auto;
    padding: clamp(var(--space-7), 7vw, var(--space-9)) var(--page-gutter) var(--space-7);

    @media (width >= $footer-two) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (width >= $footer-three) {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.5fr);
    }
  }

  &__identity {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);

    @media (width >= $footer-two) {
      grid-column: 1 / -1;
    }

    @media (width >= $footer-three) {
      grid-column: auto;
    }
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

  // A plain list: no points and never lime; the footer only repeats the way around.
  &__footer-links {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__footer-link {
    display: inline-flex;
    align-items: center;
    min-block-size: $touch-target;
    color: var(--text-muted);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);

    @media (hover: hover) {
      &:hover {
        color: var(--text);
      }
    }

    &[aria-current='page'] {
      font-weight: 600;
      color: var(--text);
    }
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

    // Flex, so a row with two links (number and WhatsApp) keeps them apart.
    dd {
      display: flex;
      flex: 1 1 14rem;
      flex-wrap: wrap;
      align-items: center;
      gap: 0 var(--space-5);
      min-inline-size: 0;
      margin: 0;
      color: var(--text);
      overflow-wrap: anywhere;
    }

    // Standalone links: 44px touch target (WCAG 2.5.5). Hover stays in the footer's greys.
    a {
      display: inline-flex;
      align-items: center;
      min-block-size: $touch-target;
      font-weight: 500;
      color: var(--text);
      transition: text-decoration-color var(--duration-fast) var(--ease-out);

      @media (hover: hover) {
        &:hover {
          text-decoration-color: var(--text);
        }
      }
    }
  }

  // Read by screen readers only.
  &__hidden {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}

@keyframes layout-rule {
  from {
    opacity: 0;
  }
}

@keyframes layout-rise {
  from {
    opacity: 0;
    translate: 0 30%;
  }
}
</style>
