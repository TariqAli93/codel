<script setup lang="ts">
import type Lenis from "lenis";
import { VueLenis } from "lenis/vue";
import { company } from "~/data/company";

interface NavLink {
  to: string;
  label: string;
  // Drawn as the leaning button at the end of the bar.
  cta?: boolean;
  // Listed in the footer only: in the header the logo goes home.
  footerOnly?: boolean;
}

const links: NavLink[] = [
  { to: "/", label: "الرئيسية", footerOnly: true },
  { to: "/solutions", label: "حلولنا" },
  { to: "/services", label: "خدماتنا" },
  { to: "/about", label: "من نحن" },
  { to: "/faq", label: "الأسئلة الشائعة" },
  { to: "/contact", label: "تواصل معنا", cta: true },
];

const headerLinks = links.filter((link) => !link.footerOnly);

// Site-wide share tags. Each page sets its own title, description, og:title and og:description.
// canonical and og:url need the real domain, so they only appear once company.siteUrl is filled in.
const route = useRoute();
const ogImage = "/brand/og.png";
const pageUrl = computed(() =>
  company.siteUrl ? `${company.siteUrl}${route.path}` : undefined,
);

useSeoMeta({
  ogType: "website",
  ogLocale: "ar_IQ",
  ogSiteName: company.name,
  ogImage: company.siteUrl ? `${company.siteUrl}${ogImage}` : ogImage,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: "شعار Codel باللون الأبيض على خلفية داكنة",
  ogUrl: pageUrl,
});

useHead(() => ({
  link: pageUrl.value ? [{ rel: "canonical", href: pageUrl.value }] : [],
}));

// Marks <html class="js"> before the first paint. Without JavaScript the class is missing and the
// small-screen header keeps the links as a plain list instead of a menu button that could not open.
useHead({
  script: [
    {
      key: "js-flag",
      innerHTML: "document.documentElement.classList.add('js')",
    },
  ],
});

// A page that draws its own full-width sections sets definePageMeta({ fullWidth: true }) (the home page).
const fullWidth = computed(() => route.meta.fullWidth === true);

// The path without a trailing slash: static hosts can redirect to one.
const path = computed(() => route.path.replace(/\/+$/, "") || "/");

// /solutions/<slug> keeps "حلولنا" marked: the link's section is current, not only its exact page.
const inSection = (to: string) => to !== "/" && path.value.startsWith(`${to}/`);

// Smooth wheel scrolling on every page (Lenis). Like the cursor it is mounted after hydration and
// only for a hovering, fine pointer without reduced motion: touch screens, reduced motion and visits
// without JavaScript keep the browser's own scrolling. Pass it options only as a constant:
// <VueLenis> rebuilds Lenis whenever it gets a new options object.
const smoothQuery =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const smoothScroll = ref(false);
const smooth = ref<{ lenis?: Lenis } | null>(null);
let smoothMedia: MediaQueryList | undefined;

function syncSmoothScroll() {
  smoothScroll.value = Boolean(smoothMedia?.matches);
}

// While a wheel glide runs Lenis ignores native scrolling and would pull the page back to it. A key,
// a focus move, a press and a new page each end the glide first, so their own scroll stands.
// stop() then start() is Lenis's public way to drop a glide (its reset() is private).
function endGlide() {
  const lenis = smooth.value?.lenis;
  if (!lenis?.isSmooth) return;
  lenis.stop();
  lenis.start();
}

// The router's scroll to the top or to the saved position (back and forward) waits for this hook.
const nuxtApp = useNuxtApp();
let stopGlideHook: (() => void) | undefined;

// Small-screen menu. Same breakpoint as $nav-wide in the styles below.
const wideQuery = "(min-width: 60em)";
const menuOpen = ref(false);
const header = ref<HTMLElement | null>(null);
const menuButton = ref<HTMLButtonElement | null>(null);

function closeMenu(restoreFocus = false) {
  if (!menuOpen.value) return;
  menuOpen.value = false;
  if (restoreFocus) menuButton.value?.focus();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") closeMenu(true);
}

// A press or a focus move outside the header closes the menu.
function onPointerDown(event: PointerEvent) {
  if (event.target instanceof Node && !header.value?.contains(event.target))
    closeMenu();
}

function onFocusOut(event: FocusEvent) {
  if (
    event.relatedTarget instanceof Node &&
    !header.value?.contains(event.relatedTarget)
  )
    closeMenu();
}

function onWideChange(event: MediaQueryListEvent) {
  if (event.matches) closeMenu();
}

function stopListening() {
  document.removeEventListener("keydown", onKeydown);
  document.removeEventListener("pointerdown", onPointerDown);
}

watch(menuOpen, (open) => {
  if (open) {
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("pointerdown", onPointerDown);
  } else {
    stopListening();
  }
});

watch(
  () => route.fullPath,
  () => closeMenu(),
);

// After a page change, keyboard and screen-reader users carry on from the new page's content.
const main = ref<HTMLElement | null>(null);
watch(
  () => route.path,
  () => nextTick(() => main.value?.focus({ preventScroll: true })),
);

let wideMedia: MediaQueryList | undefined;

onMounted(() => {
  wideMedia = window.matchMedia(wideQuery);
  wideMedia.addEventListener("change", onWideChange);
  smoothMedia = window.matchMedia(smoothQuery);
  smoothMedia.addEventListener("change", syncSmoothScroll);
  syncSmoothScroll();
  document.addEventListener("keydown", endGlide, true);
  document.addEventListener("focusin", endGlide, true);
  document.addEventListener("pointerdown", endGlide, true);
  stopGlideHook = nuxtApp.hook("page:loading:end", endGlide);
});

onBeforeUnmount(() => {
  wideMedia?.removeEventListener("change", onWideChange);
  smoothMedia?.removeEventListener("change", syncSmoothScroll);
  document.removeEventListener("keydown", endGlide, true);
  document.removeEventListener("focusin", endGlide, true);
  document.removeEventListener("pointerdown", endGlide, true);
  stopGlideHook?.();
  stopListening();
});
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
          />
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

          <!-- While open the menu scrolls on its own, so Lenis leaves its wheel alone. -->
          <ul
            id="site-menu"
            role="list"
            class="layout__menu"
            :class="{ 'layout__menu--open': menuOpen }"
            :data-lenis-prevent="menuOpen ? '' : undefined"
          >
            <li
              v-for="link in headerLinks"
              :key="link.to"
              class="layout__menu-item"
              :class="{ 'layout__menu-item--cta': link.cta }"
            >
              <ActionLink
                v-if="link.cta"
                class="layout__cta"
                look="solid"
                size="md"
                :to="link.to"
                :label="link.label"
                @click="closeMenu(link.to === path)"
              />
              <NuxtLink
                v-else
                class="layout__link"
                :class="{ 'layout__link--section': inSection(link.to) }"
                :to="link.to"
                v-bind="inSection(link.to) ? { 'aria-current': 'true' } : {}"
                @click="closeMenu(link.to === path)"
              >
                <span class="layout__link-label">{{ link.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>

    <main
      id="main"
      ref="main"
      class="layout__main"
      :class="{ 'layout__main--full': fullWidth }"
      tabindex="-1"
    >
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
          />
          <p class="layout__footer-about">
            كودل شركة برمجيات عراقية في {{ company.addressParts.city }}.
          </p>
        </div>

        <nav class="layout__footer-nav" aria-label="روابط الموقع">
          <ul role="list" class="layout__footer-links">
            <li v-for="link in links" :key="link.to">
              <NuxtLink class="layout__footer-link" :to="link.to">{{
                link.label
              }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <address class="layout__contact">
          <ContactList compact />
        </address>
      </div>
    </footer>

    <DotRingCursor />
    <VueLenis v-if="smoothScroll" ref="smooth" root />
  </div>
</template>

<style scoped lang="scss">
// Below this width the links fold behind the menu button. Same value as wideQuery in the script.
$nav-wide: 60em;
// The brand lean, and the counter-slant that turns a label back upright.
$lean: skewX(calc(var(--slant-angle) * -1));
$upright: skewX(var(--slant-angle));
// Footer: stacked below the first, two columns between, three from the second.
$footer-two: 48em;
$footer-three: 64em;
// Glassmorphism: frost that also dims what passes under it, a dark tint and a light film on top.
// Together they keep white text readable when the glass is over the lime band or a sand panel.
$glass-filter: blur(20px) saturate(1.6) brightness(0.65);

@mixin glass {
  border: 1px solid color-mix(in srgb, var(--text) 22%, transparent);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--text) 10%, transparent),
      color-mix(in srgb, var(--text) 4%, transparent)
    ),
    color-mix(in srgb, var(--bg) 50%, transparent);
  // box-shadow:
  //   inset 0 1px 0 color-mix(in srgb, var(--text) 25%, transparent),
  //   var(--shadow-md);
  // Safari before 18 reads only the prefixed property; the default targets would strip it.
  /* autoprefixer: ignore next */
  -webkit-backdrop-filter: $glass-filter;
  backdrop-filter: $glass-filter;
}

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
    min-block-size: var(--touch-target);
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
  // cover whatever has focus. A short window (a phone on its side) cannot spare the height at all.
  &__header {
    position: relative;
    z-index: 20;
    background-color: transparent;
    padding-block-start: var(--space-3);

    .js & {
      position: sticky;
      inset-block-start: 0;
    }

    @media (width >= $nav-wide) {
      position: sticky;
      inset-block-start: 0;
    }

    @media (height < 30em) {
      position: relative;

      .js & {
        position: relative;
      }
    }

    // The bottom rule.
    &::after {
      content: "";
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      block-size: 1px;
      background-color: transparent;
      pointer-events: none;
    }
  }

  // Same width and gutters as the page content, so logo and links line up with it. The glass is on a
  // pseudo-element: a backdrop-filter on the bar itself would leave the menu panel inside it with
  // nothing to blur.
  &__bar {
    position: relative;
    z-index: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0 var(--space-6);
    max-inline-size: var(--container-max);
    min-block-size: var(--header-height);
    margin-inline: auto;
    padding-inline: var(--page-gutter);

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      @include glass;
    }
  }

  &__brand {
    display: flex;
    align-items: center;
    min-block-size: var(--touch-target);
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
    gap: 0 var(--space-6);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__link {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-block-size: var(--touch-target);
    font-size: var(--text-ui);
    font-weight: 500;
    line-height: 1.4;
    color: var(--text);
    text-decoration: underline;
    text-decoration-color: transparent;
    transition: text-decoration-color var(--duration-fast) var(--ease-out);

    // Hover styles only where a pointer can hover: on touch, :hover sticks after a tap.
    @media (hover: hover) {
      &:hover {
        text-decoration-color: var(--accent-text);
      }
    }

    &:focus-visible {
      outline-offset: 4px;
      border-radius: var(--radius-sm);
    }

    // Current page or section: heavier, with the lime bar under the words so it is never colour
    // alone. On the label, so the bar fits the words in the header and in the panel.
    &[aria-current="page"],
    &--section {
      font-weight: 600;
      text-decoration-line: none;

      .layout__link-label::after {
        content: "";
        position: absolute;
        inset-inline: 0;
        inset-block-end: calc(var(--space-2) * -1);
        block-size: 3px;
        border-radius: var(--radius-pill);
        background-color: var(--accent-text);
        transform: $lean;
      }
    }
  }

  &__link-label {
    position: relative;
  }

  // Small screens, with JavaScript: the links fold into a panel under the header.
  // Without JavaScript (no .js class) they stay a wrapping list and the button stays hidden.
  @media (width < $nav-wide) {
    // Styled as the outline button; icon and label inside are turned back upright.
    .js &__menu-button {
      display: inline-flex;
      align-items: center;
      min-block-size: var(--control-md);
      padding-inline: var(--space-4);
      border: 1.5px solid color-mix(in srgb, var(--text) 45%, transparent);
      border-radius: var(--radius-pill);
      background-color: transparent;
      font-size: var(--text-ui);
      font-weight: 600;
      cursor: pointer;
      transform: $lean;
      transition: background-color var(--duration-fast) var(--ease-out);

      @media (hover: hover) {
        &:hover {
          background-color: var(--surface-raised);
        }
      }

      &:active {
        background-color: var(--surface);
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
        content: "";
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

    [aria-expanded="true"] &__menu-icon {
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
      margin-block-start: var(--space-2);
      max-block-size: calc(100dvh - var(--header-height) - var(--space-5));
      overflow-y: auto;
      overscroll-behavior: contain;
      padding: var(--space-3) var(--page-gutter) var(--space-6);
      @include glass;
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

    // The panel scrolls, so it clips what spills out of it: this padding keeps the CTA's glow
    // inside it (the glow fades out within about 2.5rem).
    .js &__menu-item--cta {
      margin-block-start: var(--space-4);
      padding-inline: var(--space-5);
      padding-block-end: var(--space-2);
    }

    .js &__menu-item--cta &__cta {
      inline-size: 100%;
      min-block-size: var(--control-lg);
      font-size: var(--text-body);
    }

    .js &__link {
      inline-size: 100%;
      min-block-size: var(--control-lg);
      font-family: var(--font-display);
      font-size: var(--text-card);
      font-weight: 600;
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
    padding-block: var(--space-8) var(--section-gap);
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
    font-size: var(--text-ui);
    color: var(--text-muted);
  }

  // Identity, links, contact: stacked, then identity across the top of two columns, then three.
  &__footer-inner {
    display: grid;
    gap: var(--space-7) var(--space-8);
    max-inline-size: var(--container-max);
    margin-inline: auto;
    padding: clamp(var(--space-7), 7vw, var(--space-9)) var(--page-gutter)
      var(--space-7);

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
    min-block-size: var(--touch-target);
    color: var(--text-muted);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);

    @media (hover: hover) {
      &:hover {
        color: var(--text);
      }
    }

    &[aria-current="page"] {
      font-weight: 600;
      color: var(--text);
    }
  }

  &__contact {
    font-style: normal;
  }
}
</style>
