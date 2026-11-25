<script setup lang="ts">
import { shallowRef } from "vue";
import { VueLenis } from "lenis/vue";
import { company } from "~/data/company";

type Gsap = typeof import("gsap").gsap;
type ScrollTriggerPlugin = typeof import("gsap/ScrollTrigger").ScrollTrigger;

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

// Exact pages use aria-current="page"; solution details keep their section link current.
const inSection = (to: string) => to !== "/" && path.value.startsWith(`${to}/`);

// V8.4 uses native scrolling; no wheel interception.

// Small-screen menu. Same breakpoint as $nav-wide in the styles below.
const wideQuery = "(min-width: 60em)";
const menuOpen = ref(false);
const header = ref<HTMLElement | null>(null);
const menuButton = ref<HTMLButtonElement | null>(null);
const scrolled = ref(false);
const smoothScroll = shallowRef(false);
const lenisOptions = {
  autoRaf: false,
  smoothWheel: true,
  syncTouch: false,
  anchors: false,
  lerp: 0.1,
};
// Read the instance exposed by the conditional root component; useLenis warns before that root exists.
const lenisRoot = shallowRef<InstanceType<typeof VueLenis> | null>(null);
const lenis = computed(() => lenisRoot.value?.lenis);

let gsap: Gsap | undefined;
let ScrollTrigger: ScrollTriggerPlugin | undefined;
let motionContext: ReturnType<Gsap["matchMedia"]> | undefined;
let loadMotionPromise: Promise<void> | undefined;
let motionMedia: MediaQueryList | undefined;
let smoothScrollMedia: MediaQueryList | undefined;
let clientReady = false;
let cleanupLenisSync = () => {};

function syncLenisWithScrollTrigger() {
  cleanupLenisSync();
  cleanupLenisSync = () => {};

  const instance = lenis.value;
  if (!instance || !gsap || !ScrollTrigger) return;

  const updateScrollTrigger = () => ScrollTrigger?.update();
  const updateLenis = (time: number) => instance.raf(time * 1000);
  instance.on("scroll", updateScrollTrigger);
  gsap.ticker.add(updateLenis);
  gsap.ticker.lagSmoothing(0);

  cleanupLenisSync = () => {
    instance.off("scroll", updateScrollTrigger);
    gsap?.ticker.remove(updateLenis);
    gsap?.ticker.lagSmoothing(500, 33);
  };
}

function rebuildScrollMotion() {
  if (!clientReady || !gsap || !ScrollTrigger || !motionMedia?.matches) return;

  const page = document.querySelector<HTMLElement>(".layout");
  if (!page) return;

  motionContext?.revert();
  motionContext = gsap.matchMedia();
  motionContext.add("(prefers-reduced-motion: no-preference)", () => {
    const hero = page.querySelector<HTMLElement>(".cover-hero");
    const heroField = hero?.querySelector<HTMLElement>(
      '[data-scroll-depth="hero-field"]',
    );
    const heroStill = hero?.querySelector<HTMLElement>(
      '[data-scroll-depth="hero-still"]',
    );
    const heroCopy = hero?.querySelector<HTMLElement>(
      '[data-scroll-depth="hero-copy"]',
    );

    if (hero && heroField) {
      gsap?.to(heroField, {
        yPercent: 7,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }

    if (hero && heroStill) {
      gsap?.to(heroStill, {
        yPercent: 3,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }

    if (hero && heroCopy) {
      gsap?.to(heroCopy, {
        yPercent: -4,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }

    gsap?.utils
      .toArray<HTMLElement>('[data-scroll-depth="program-preview"]')
      .forEach((preview) => {
        const chapter = preview.closest<HTMLElement>(".story-chapter");
        if (!chapter) return;

        gsap?.to(preview, {
          yPercent: 1.5,
          ease: "none",
          scrollTrigger: {
            trigger: chapter,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      });

    const serviceWall = page.querySelector<HTMLElement>(".service-wall");
    const serviceTabs = serviceWall
      ? Array.from(serviceWall.querySelectorAll<HTMLElement>(".service-tab"))
      : [];

    if (serviceWall && serviceTabs.length) {
      gsap?.fromTo(
        serviceTabs,
        { y: 12, opacity: 0.9 },
        {
          y: 0,
          opacity: 1,
          duration: 0.42,
          stagger: 0.045,
          ease: "power2.out",
          scrollTrigger: {
            trigger: serviceWall,
            start: "top 82%",
            once: true,
          },
        },
      );
    }

    const serviceArt = serviceWall?.querySelector<HTMLElement>(
      '[data-scroll-depth="service-art"]',
    );
    if (serviceWall && serviceArt) {
      gsap?.to(serviceArt, {
        yPercent: 2,
        ease: "none",
        scrollTrigger: {
          trigger: serviceWall,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }

    const contactBand = page.querySelector<HTMLElement>(
      '[data-scroll-depth="contact-band"]',
    );
    if (contactBand) {
      gsap?.to(contactBand, {
        yPercent: -2,
        ease: "none",
        scrollTrigger: {
          trigger: contactBand.closest(".contact-poster") ?? contactBand,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }

    const footerBrand = page.querySelector<HTMLElement>(
      '[data-scroll-depth="footer-brand"]',
    );
    if (footerBrand) {
      gsap?.fromTo(
        footerBrand,
        { yPercent: 2, opacity: 0.94 },
        {
          yPercent: -1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: footerBrand,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    }
  });

  ScrollTrigger.refresh();
}

function updateMotionPreference() {
  if (!motionMedia?.matches) {
    smoothScroll.value = false;
    cleanupLenisSync();
    cleanupLenisSync = () => {};
    motionContext?.revert();
    motionContext = undefined;
    return;
  }

  if (gsap && ScrollTrigger) {
    smoothScroll.value = smoothScrollMedia?.matches ?? false;
    syncLenisWithScrollTrigger();
    rebuildScrollMotion();
    return;
  }

  smoothScroll.value = false;
  void loadScrollMotion();
}

function updateSmoothScrollPreference() {
  smoothScroll.value = Boolean(
    motionMedia?.matches && smoothScrollMedia?.matches && gsap,
  );
}

function loadScrollMotion() {
  if (loadMotionPromise) return loadMotionPromise;

  loadMotionPromise = (async () => {
    try {
      const [gsapModule, scrollTriggerModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap = gsapModule.gsap;
      ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      if (!clientReady || !motionMedia?.matches) return;
      updateSmoothScrollPreference();
      syncLenisWithScrollTrigger();
      rebuildScrollMotion();
    } catch (error) {
      console.error(
        "[Codel] Scroll motion could not load; native scrolling remains enabled.",
        error,
      );
    }
  })();

  return loadMotionPromise;
}

watch(lenis, syncLenisWithScrollTrigger, { immediate: true });

function updateScrollState() {
  scrolled.value = window.scrollY >= 24;
}

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
    event.relatedTarget === null ||
    (event.relatedTarget instanceof Node &&
      !header.value?.contains(event.relatedTarget))
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
  async () => {
    closeMenu();
    await nextTick();
    rebuildScrollMotion();
  },
);

// After a page change, keyboard and screen-reader users carry on from the new page's content.
const main = ref<HTMLElement | null>(null);
watch(
  () => route.path,
  () => nextTick(() => main.value?.focus({ preventScroll: true })),
);

let wideMedia: MediaQueryList | undefined;

onMounted(() => {
  clientReady = true;
  wideMedia = window.matchMedia(wideQuery);
  motionMedia = window.matchMedia("(prefers-reduced-motion: no-preference)");
  smoothScrollMedia = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  );
  wideMedia.addEventListener("change", onWideChange);
  motionMedia.addEventListener("change", updateMotionPreference);
  smoothScrollMedia.addEventListener("change", updateSmoothScrollPreference);
  updateMotionPreference();
  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
});

onBeforeUnmount(() => {
  clientReady = false;
  wideMedia?.removeEventListener("change", onWideChange);
  motionMedia?.removeEventListener("change", updateMotionPreference);
  smoothScrollMedia?.removeEventListener(
    "change",
    updateSmoothScrollPreference,
  );
  window.removeEventListener("scroll", updateScrollState);
  stopListening();
  cleanupLenisSync();
  motionContext?.revert();
});
</script>

<template>
  <VueLenis
    v-if="smoothScroll"
    ref="lenisRoot"
    root
    :options="lenisOptions"
  />
  <div class="layout">
    <a class="layout__skip" href="#main">تخطَّ إلى المحتوى</a>

    <header
      ref="header"
      class="layout__header"
      :class="{ 'layout__header--scrolled': scrolled }"
      @focusout="onFocusOut"
    >
      <div class="layout__bar">
        <NuxtLink class="layout__brand" to="/" aria-label="Codel - كودل">
          <img
            class="layout__logo"
            src="/brand/codel-full-white.svg"
            alt="Codel"
            width="156"
            height="27"
          />
        </NuxtLink>

        <nav class="layout__nav" aria-label="القائمة الرئيسية">
          <button
            ref="menuButton"
            class="layout__menu-button"
            type="button"
            aria-label="القائمة"
            aria-controls="site-menu"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
          >
            <span class="layout__menu-icon" aria-hidden="true" />
          </button>

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
                :aria-current="path === link.to ? 'page' : undefined"
                @click="closeMenu(link.to === path)"
              />
              <NuxtLink
                v-else
                class="layout__link"
                :class="{ 'layout__link--section': inSection(link.to) }"
                :to="link.to"
                :aria-current="
                  path === link.to
                    ? 'page'
                    : inSection(link.to)
                      ? 'true'
                      : undefined
                "
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
      <div class="layout__footer-frame">
        <div class="layout__footer-directory">
          <div class="layout__footer-group layout__footer-intro">
            <p class="layout__footer-statement">
              برمجيات لأصحاب الأعمال في العراق.
            </p>
            <p>
              {{ company.address }}<br />{{ company.hours.days }}،
              {{ company.hours.time }}
            </p>
          </div>
          <nav class="layout__footer-group" aria-label="روابط الموقع">
            <h2 class="layout__footer-heading">استكشف كودل</h2>
            <ul role="list" class="layout__footer-links">
              <li v-for="link in links" :key="link.to">
                <NuxtLink class="layout__footer-link" :to="link.to">{{
                  link.label
                }}</NuxtLink>
              </li>
            </ul>
          </nav>
          <div class="layout__footer-group">
            <h2 class="layout__footer-heading">تواصل معنا</h2>
            <address class="layout__contact"><ContactList compact /></address>
          </div>
        </div>
        <div class="layout__footer-brand" data-scroll-depth="footer-brand">
          <NuxtLink
            class="layout__footer-brand-link"
            to="/"
            aria-label="كودل — العودة للرئيسية"
            ><FooterParticles
          /></NuxtLink>
        </div>
        <div class="layout__footer-bottom">
          <span>كودل — بغداد، العراق</span>
          <nav aria-label="روابط قانونية">
            <NuxtLink to="/privacy">الخصوصية</NuxtLink
            ><NuxtLink to="/terms">الشروط</NuxtLink>
          </nav>
        </div>
      </div>
    </footer>

    <DotRingCursor />
  </div>
</template>

<style scoped lang="scss">
// Below this width the links fold behind the menu button. Same value as wideQuery in the script.
$nav-wide: 60em;
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
  }

  // Full-width editorial rail: brand at inline-start, navigation and contact action opposite.
  &__bar {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2) clamp(var(--space-5), 3vw, var(--space-7));
    inline-size: min(
      calc(100% - var(--page-gutter) - var(--page-gutter)),
      var(--container-max)
    );
    max-inline-size: var(--container-max);
    min-block-size: var(--header-height);
    margin-inline: auto;
    padding-inline: clamp(var(--space-3), 1.5vw, var(--space-5));
    border: 1px solid transparent;
    border-radius: var(--radius-lg);
    background-color: transparent;
    transition:
      background-color var(--duration-base) var(--ease-out),
      border-color var(--duration-base) var(--ease-out),
      border-radius var(--duration-base) var(--ease-out),
      backdrop-filter var(--duration-base) var(--ease-out);
  }

  &__header--scrolled &__bar {
    border-color: var(--border);
    border-radius: var(--radius-md);
    background-color: var(--surface-raised);

    @supports (backdrop-filter: blur(1px)) or
      (-webkit-backdrop-filter: blur(1px)) {
      background-color: color-mix(in srgb, var(--bg) 84%, transparent);
      -webkit-backdrop-filter: blur(16px) saturate(130%);
      backdrop-filter: blur(16px) saturate(130%);
    }
  }

  &__brand {
    display: flex;
    align-items: center;
    min-block-size: var(--touch-target);
    flex: 0 0 auto;
  }

  &__logo {
    block-size: clamp(24px, 1.75vw, 32px);
    inline-size: auto;
  }

  &__nav {
    display: flex;
    align-items: center;
    margin-inline-start: auto;
    min-inline-size: 0;
  }

  &__menu-button {
    display: none;
  }

  &__menu {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 clamp(var(--space-3), 1.5vw, var(--space-5));
    margin: 0;
    padding: 0;
    list-style: none;
    transition: gap var(--duration-base) var(--ease-out);
  }

  &__header--scrolled &__menu {
    gap: 0 clamp(var(--space-2), 1.1vw, var(--space-4));
  }

  &__menu-item--cta {
    margin-inline-start: var(--space-2);
    padding-inline-start: clamp(var(--space-3), 1.5vw, var(--space-5));
    border-inline-start: 1px solid var(--border);
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
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);

    // Hover styles only where a pointer can hover: on touch, :hover sticks after a tap.
    @media (hover: hover) {
      &:hover {
        color: var(--accent-text);
      }
    }

    &:focus-visible {
      outline-offset: 4px;
      border-radius: var(--radius-sm);
    }

    // Current page or section: a persistent marker and weight change, not colour alone.
    &[aria-current="page"],
    &--section {
      font-weight: 600;

      .layout__link-label::after {
        inline-size: 1.125rem;
        transform: scaleX(1);
      }
    }

    @media (hover: hover) {
      &:hover .layout__link-label::after {
        transform: scaleX(1);
      }
    }

    &:focus-visible .layout__link-label::after {
      transform: scaleX(1);
    }
  }

  &__link-label {
    position: relative;

    &::after {
      content: "";
      position: absolute;
      inset-inline-start: 0;
      inset-block-end: calc(var(--space-2) * -1);
      inline-size: 100%;
      block-size: 2px;
      background-color: var(--accent-text);
      transform: scaleX(0);
      transform-origin: 100% 50%;
      transition: transform var(--duration-base) var(--ease-out);
    }
  }

  // Small screens, with JavaScript: a square toggle opens a divided navigation sheet.
  // Without JavaScript the links remain visible as a wrapping list.
  @media (width < $nav-wide) {
    .js &__bar {
      flex-wrap: nowrap;
      column-gap: var(--space-4);
      min-block-size: 72px;
    }

    .js &__menu-button {
      display: inline-grid;
      place-items: center;
      flex: 0 0 auto;
      inline-size: var(--control-md);
      block-size: var(--control-md);
      padding: 0;
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-sm);
      background-color: transparent;
      color: var(--text);
      cursor: pointer;
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
        border-radius: var(--radius-sm);
        background-color: currentColor;
        transition: transform var(--duration-base) var(--ease-out);
      }

      &::before {
        inset-block-start: 0;
        transform: translate(0, 0) rotate(0deg);
      }

      &::after {
        inset-block-end: 0;
        transform: scaleX(0.65);
      }
    }

    [aria-expanded="true"] &__menu-icon {
      &::before {
        transform: translateY(5px) rotate(45deg);
      }

      &::after {
        transform: translateY(-5px) rotate(-45deg) scaleX(1);
      }
    }

    .js &__menu {
      position: absolute;
      inset-block-start: 100%;
      inset-inline: 0;
      box-sizing: border-box;
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: stretch;
      gap: 0;
      max-block-size: calc(100dvh - var(--header-height) - var(--space-5));
      overflow-y: auto;
      overscroll-behavior: contain;
      padding: var(--space-2) var(--page-gutter) var(--space-5);
      border-block: 1px solid var(--border);
      background-color: var(--surface);
      visibility: hidden;
      opacity: 0;
      transform: translateY(calc(var(--space-1) * -1));
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
      border-block-end: 1px solid var(--border);
    }

    .js &__menu-item--cta {
      margin-block-start: var(--space-4);
      margin-inline-start: 0;
      padding-block-start: var(--space-4);
      padding-inline-start: 0;
      border-block-start: 1px solid var(--border);
      border-inline-start: 0;
      border-block-end: 0;
    }

    .js &__menu-item--cta &__cta {
      inline-size: 100%;
      min-block-size: var(--control-lg);
      font-size: var(--text-body);
    }

    .js &__link {
      inline-size: 100%;
      min-block-size: 56px;
      font-family: var(--font-display);
      font-size: var(--text-card);
      font-weight: 600;
      line-height: 1.5;

      .layout__link-label::after {
        inset-block-end: calc(var(--space-2) * -1);
      }
    }
  }

  @media (width >= $nav-wide) {
    &__menu {
      flex-wrap: nowrap;
    }

    &__cta {
      min-block-size: var(--control-md);
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
  // Footer: one useful invitation, then practical navigation and contact information.
  // ---------------------------------------------------------------------------

  &__footer {
    overflow: clip;
    border-block-start: 1px solid var(--border);
    background-color: var(--bg);
    color: var(--text);
  }

  &__footer-frame {
    max-inline-size: var(--container-max);
    margin-inline: auto;
    padding-inline: var(--page-gutter);
  }

  &__footer-invite {
    display: grid;
    gap: var(--space-6) var(--space-8);
    padding-block: clamp(var(--space-8), 8vw, var(--space-10));
    border-block-end: 1px solid var(--border);

    @media (width >= $footer-three) {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: end;
    }
  }

  &__footer-message {
    min-inline-size: 0;
  }

  &__footer-title {
    max-inline-size: 17ch;
    margin: 0 0 var(--space-4);
    font-family: var(--font-display);
    font-size: clamp(2.625rem, 5.2vw, 5rem);
    font-weight: 800;
    line-height: 1.25;
    text-wrap: balance;
  }

  &__footer-lede {
    max-inline-size: var(--measure);
    margin: 0;
    color: var(--text-muted);
    font-size: var(--text-lead);
    line-height: 1.75;
  }

  &__footer-action-wrap {
    justify-self: start;
    align-self: end;
  }

  &__footer-directory {
    display: grid;
    gap: var(--space-7) var(--space-8);
    padding-block: var(--space-8);

    @media (width >= $footer-two) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (width >= $footer-three) {
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.2fr) minmax(0, 1fr);
    }
  }

  &__footer-group {
    min-inline-size: 0;
  }

  &__footer-heading {
    margin-block-end: var(--space-4);
    font-family: var(--font-sans);
    font-size: var(--text-small);
    font-weight: 700;
    line-height: 1.6;
    color: var(--text);
  }

  &__footer-links {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__footer-link {
    display: inline-flex;
    align-items: center;
    min-block-size: var(--touch-target);
    color: var(--text-muted);
    font-size: var(--text-ui);
    line-height: 1.7;
    text-decoration: underline;
    text-decoration-color: transparent;
    transition:
      color var(--duration-fast) var(--ease-out),
      text-decoration-color var(--duration-fast) var(--ease-out);

    @media (hover: hover) {
      &:hover {
        color: var(--text);
        text-decoration-color: var(--accent-text);
      }
    }

    &[aria-current="page"] {
      color: var(--text);
      font-weight: 700;
      text-decoration-color: var(--accent-text);
    }
  }

  &__contact {
    font-style: normal;

    // Reuse the source-of-truth ContactList, but make its compact rows fit this column.
    :deep(.contact-list__row) {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-1);
      padding: 0;

      &::after {
        content: none;
      }

      dt {
        color: var(--text-muted);
        font-size: var(--text-small);
      }

      dd {
        display: flex;
        flex-wrap: wrap;
        gap: 0 var(--space-4);
        min-inline-size: 0;
        margin: 0;
        font-size: var(--text-ui);
        line-height: 1.7;
      }

      a {
        min-block-size: var(--touch-target);
        color: var(--text);
      }
    }
  }

  &__footer-facts {
    display: grid;
    gap: var(--space-5);
    margin: 0;

    dt {
      margin-block-end: var(--space-1);
      color: var(--text-muted);
      font-size: var(--text-small);
    }

    dd {
      margin: 0;
      color: var(--text);
      font-size: var(--text-ui);
      line-height: 1.75;
      overflow-wrap: anywhere;
    }
  }

  &__footer-brand {
    padding-block: var(--space-7) var(--space-5);
    border-block-start: 1px solid var(--border);
  }

  &__footer-brand-link {
    display: block;
    border-radius: var(--radius-sm);
  }
}

/* Editorial footer, with a reserved full-width brand signature. */

.layout__footer-directory {
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr) minmax(0, 1fr);
  gap: clamp(24px, 5vw, 80px);
  padding-block: clamp(40px, 6vw, 80px);
}
.layout__footer-intro {
  p {
    font-size: var(--text-body);
    color: var(--text-muted);
    max-width: 34ch;
    margin-block-start: 14px;
  }
  .layout__footer-statement {
    font-family: var(--font-display);
    color: var(--text);
    font-size: clamp(1.55rem, 2.4vw, 2.2rem);
    line-height: 1.4;
    margin: 0;
    font-weight: 700;
    max-width: 22ch;
  }
}
.layout__footer-heading {
  font-size: clamp(1.125rem, 1.25vw, 1.4rem);
  margin-block-end: 16px;
}
.layout__footer-links {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 20px;
}
.layout__footer-link {
  font-size: clamp(1rem, 1.06vw, 1.125rem);
  min-block-size: 44px;
}
.layout__contact :deep(.contact-list__row) {
  dt {
    font-size: var(--text-small);
  }
  dd {
    font-size: clamp(1rem, 1.06vw, 1.125rem);
    overflow-wrap: anywhere;
  }
}
.layout__footer-brand {
  padding-block: clamp(24px, 4vw, 48px);
  border-block-start: 1px solid var(--border);
}
.layout__footer-brand-link {
  display: block;
  inline-size: 100%;
  aspect-ratio: 672/117;
}
.layout__footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  border-block-start: 1px solid var(--border);
  padding-block: 16px;
  color: var(--text-muted);
  font-size: var(--text-small);
  nav {
    display: flex;
    gap: var(--space-4);
    a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
    }
  }
}
@media (width < 60em) {
  .layout__footer-directory {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .layout__footer-intro {
    grid-column: 1/-1;
  }
}
@media (max-width: 580px) {
  .layout__footer-directory {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .layout__footer-intro {
    grid-column: auto;
  }
  .layout__footer-brand {
    padding-block: 24px;
  }
}
</style>
