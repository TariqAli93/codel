<script setup lang="ts">
import { company, services } from "~/data/company";
import { solutions } from "~/data/solutions";

// The call bar and the marquee run off the edge of the window, so this page draws its own
// full-width sections instead of the layout's centred column.
definePageMeta({ fullWidth: true });

const title = "الرئيسية / Home";
const description =
  "كودل شركة برمجيات عراقية في بغداد: برمجة وتصميم المواقع وتطبيقات الهواتف، برامج جاهزة مثل نقطة بلس ودلالي، إدارة السيرفرات، وخدمات برمجية حسب الطلب.";

useSeoMeta({ title, description, ogTitle: title, ogDescription: description });

// Structured data for search engines: only the facts in app/data/company.ts.
const organization = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: company.name,
  telephone: company.phones.main.tel.replace("tel:", ""),
  email: company.email,
  address: {
    "@type": "PostalAddress",
    addressCountry: company.addressParts.countryCode,
    addressLocality: company.addressParts.city,
    streetAddress: company.addressParts.district,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: company.openingHours.days,
      opens: company.openingHours.opens,
      closes: company.openingHours.closes,
    },
  ],
};

useHead({
  script: [
    { type: "application/ld+json", innerHTML: JSON.stringify(organization) },
  ],
});

const price = (value: number) => new Intl.NumberFormat("en-US").format(value);

// The same prefilled question as on /solutions/<slug>.
const whatsappAsk = (nameAr: string) =>
  `${company.phones.main.whatsapp}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن ${nameAr}`)}`;

// Dot-matrix artwork per product, in public/art/. A product without one shows its text only.
const productArt: Record<string, string> = {
  "nuqta-plus": "/art/nuqta-plus.svg",
  dalaly: "/art/dalaly.svg",
};

// Open or closed right now, on Baghdad time. Worked out in the browser after mount only, so the
// server-rendered page never carries a time; until then (and without JavaScript) nothing is shown.
const openNow = ref<boolean | null>(null);

const page = ref<HTMLElement | null>(null);
// The artwork writes its letter when the load sequence starts, or after a moment without it.
const artPlay = ref(false);
let artFallback: ReturnType<typeof setTimeout> | undefined;
let stopMotion: (() => void) | undefined;
let unmounted = false;

onMounted(() => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Baghdad",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  // Both sides are zero-padded HH:MM, so they compare as strings.
  const time = `${part("hour")}:${part("minute")}`;
  const { days, opens, closes } = company.openingHours;
  openNow.value =
    days.includes(part("weekday")) && time >= opens && time < closes;

  artFallback = setTimeout(() => (artPlay.value = true), 2500);
  startMotion();
});

onBeforeUnmount(() => {
  unmounted = true;
  clearTimeout(artFallback);
  stopMotion?.();
});

// Motion (GSAP, loaded after mount so the server render and hydration never see it). Only under
// prefers-reduced-motion: no-preference; otherwise, and without JavaScript, every element simply
// shows. The hero's parts are hidden by CSS until this takes over (with a timed CSS fallback).
// Fetched while the page hydrates rather than after it, so the hero does not wait on the network.
const loadMotion = () =>
  Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText")]);
const motionModules = import.meta.client ? loadMotion() : undefined;

async function startMotion() {
  const [{ gsap }, { ScrollTrigger }, { SplitText }] = await (motionModules ?? loadMotion());
  await document.fonts.ready;
  const root = page.value;
  if (unmounted || !root) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const splits: Array<{ revert: () => void }> = [];
  let intro: { progress: (value: number) => unknown } | undefined;
  const words = (target: Element) => {
    const split = SplitText.create(target, { type: "words", mask: "words" });
    splits.push(split);
    return split.words;
  };
  const all = (selector: string) => gsap.utils.toArray<HTMLElement>(selector, root);
  const ease = "expo.out";

  const context = gsap.context(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      // Hero: the line above, the headline word by word, the call bar out of the window edge,
      // then the second actions. The artwork writes itself on its own clock (HeroArt).
      const title = root.querySelector(".home__title");
      intro = gsap.timeline({ defaults: { ease } })
        .set(all(".home__hero [data-intro]"), { opacity: 1 })
        .from(".home__kicker", { opacity: 0, x: -24, duration: 0.8 })
        .from(title ? words(title) : [], { yPercent: 110, duration: 1.1, stagger: 0.07 }, 0.1)
        .from(".home__call--hero", { scaleX: 0, transformOrigin: "left center", duration: 1.1 }, 0.55)
        .from(".home__call--hero .action__content", { opacity: 0, x: -30, duration: 0.7 }, 1.05)
        .from(".home__hero-actions > *", { opacity: 0, y: 16, duration: 0.7, stagger: 0.08 }, 1.15);
      root.classList.add("home--motion");
      artPlay.value = true;

      // The marquee runs toward the reading start and speeds up with the scroll.
      const track = root.querySelector(".home__marquee-track");
      if (track) {
        const loop = gsap.to(track, { xPercent: 100 / 3, duration: 38, ease: "none", repeat: -1 });
        ScrollTrigger.create({
          trigger: ".home__marquee",
          onUpdate: (self) => {
            const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 5);
            gsap.to(loop, { timeScale: boost, duration: 0.2, overwrite: true });
            gsap.to(loop, { timeScale: 1, duration: 1.2, delay: 0.2, overwrite: false });
          },
        });
      }

      // Section headings rise word by word as they arrive.
      for (const heading of all(".home__heading")) {
        gsap.from(words(heading), {
          yPercent: 110,
          duration: 1,
          ease,
          stagger: 0.06,
          scrollTrigger: { trigger: heading, start: "top 88%", once: true },
        });
      }
      for (const item of all("[data-reveal]")) {
        gsap.from(item, {
          opacity: 0,
          y: 28,
          duration: 0.9,
          ease,
          scrollTrigger: { trigger: item, start: "top 90%", once: true },
        });
      }

      // Products: the art opens like a shutter from the top, its drawing settles inside it, and the
      // text follows. The drawing drifts against the scroll while the product passes.
      for (const product of all(".home__product")) {
        const frame = product.querySelector(".home__product-art");
        const image = product.querySelector(".home__product-image");
        const show = gsap.timeline({ scrollTrigger: { trigger: product, start: "top 78%", once: true } });
        if (frame && image) {
          show
            .from(frame, { clipPath: "inset(0% 0% 100% 0% round 1.5rem)", duration: 1.2, ease: "expo.inOut" })
            .from(image, { scale: 1.25, duration: 1.6, ease }, 0.2);
          gsap.fromTo(image, { yPercent: 6 }, {
            yPercent: -6,
            ease: "none",
            scrollTrigger: { trigger: product, start: "top bottom", end: "bottom top", scrub: true },
          });
        }
        show.from(product.querySelectorAll(".home__product-body > *"), {
          opacity: 0,
          y: 30,
          duration: 0.9,
          ease,
          stagger: 0.08,
        }, frame ? 0.45 : 0);
      }

      // Services: each title lights up as the list passes the middle of the screen.
      gsap.fromTo(".home__stair", { opacity: 0.22, x: -36 }, {
        opacity: 1,
        x: 0,
        ease: "none",
        stagger: 0.25,
        scrollTrigger: { trigger: ".home__stairs", start: "top 80%", end: "bottom 55%", scrub: 0.6 },
      });
      gsap.from(".home__stairs-spine", {
        scaleY: 0,
        transformOrigin: "top center",
        ease: "none",
        scrollTrigger: { trigger: ".home__stairs", start: "top 80%", end: "bottom 55%", scrub: 0.6 },
      });

      // Company: the goal reads itself in, word by word; the city name drifts behind it; the
      // years draw their bar from 2020 to 2024.
      const goal = root.querySelector(".home__goal");
      if (goal) {
        gsap.fromTo(words(goal), { opacity: 0.16 }, {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: goal, start: "top 82%", end: "bottom 50%", scrub: 0.5 },
        });
      }
      gsap.fromTo(".home__backdrop", { xPercent: -8 }, {
        xPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: ".home__company", start: "top bottom", end: "bottom top", scrub: true },
      });
      const years = gsap.timeline({
        scrollTrigger: { trigger: ".home__years", start: "top 85%", end: "top 45%", scrub: 0.5 },
      });
      years
        .from(".home__year--idea .home__year-node", { scale: 0, duration: 0.2 })
        .from(".home__years-bar", { scaleX: 0, transformOrigin: "right center", duration: 0.6 })
        .from(".home__year--launch .home__year-node", { scale: 0, duration: 0.2 });

      // Contact: the lime band sweeps in from the reading start, then its contents follow.
      const band = root.querySelector(".home__band");
      if (band) {
        gsap.timeline({ scrollTrigger: { trigger: band, start: "top 80%", once: true } })
          .fromTo(band, { clipPath: "inset(-20% -20% -20% 100%)" }, {
            clipPath: "inset(-20% -20% -20% -20%)",
            duration: 1.2,
            ease: "expo.inOut",
            clearProps: "clipPath",
          })
          .from(band.querySelectorAll(".home__band-content > *"), {
            opacity: 0,
            y: 24,
            duration: 0.8,
            ease,
            stagger: 0.07,
          }, 0.55);
        gsap.fromTo(".home__band-pattern", { yPercent: -12 }, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: band, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
    });

    // Pointer: the product drawings tilt toward the pointer.
    media.add("(prefers-reduced-motion: no-preference) and (hover: hover)", () => {
      const detach: Array<() => void> = [];
      for (const frame of all(".home__product-art")) {
        gsap.set(frame, { transformPerspective: 1200 });
        const tiltX = gsap.quickTo(frame, "rotationX", { duration: 0.6, ease: "power3.out" });
        const tiltY = gsap.quickTo(frame, "rotationY", { duration: 0.6, ease: "power3.out" });
        const move = (event: PointerEvent) => {
          const box = frame.getBoundingClientRect();
          tiltX(((event.clientY - box.top) / box.height - 0.5) * -8);
          tiltY(((event.clientX - box.left) / box.width - 0.5) * 10);
        };
        const leave = () => {
          tiltX(0);
          tiltY(0);
        };
        frame.addEventListener("pointermove", move);
        frame.addEventListener("pointerleave", leave);
        detach.push(() => {
          frame.removeEventListener("pointermove", move);
          frame.removeEventListener("pointerleave", leave);
        });
      }
      return () => detach.forEach((off) => off());
    });
  }, root);

  // Keyboard focus can reach an element before its reveal has run or finished: whatever holds
  // focus jumps to its end state at once, so nothing is ever focused half-faded.
  const onFocus = (event: FocusEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest(".home__hero")) intro?.progress(1);
    for (const trigger of ScrollTrigger.getAll()) {
      const element = trigger.trigger;
      if (element && target && element.contains(target)) trigger.animation?.progress(1);
    }
  };
  root.addEventListener("focusin", onFocus);

  // Images and fonts settle the layout; measure the triggers again once the page has loaded.
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh, { once: true });

  stopMotion = () => {
    root.removeEventListener("focusin", onFocus);
    window.removeEventListener("load", refresh);
    context.revert();
    for (const split of splits) split.revert();
    root.classList.remove("home--motion");
  };
}
</script>

<template>
  <div ref="page" class="home">
    <section class="home__hero" aria-labelledby="home-title">
      <div class="home__hero-text">
        <p class="home__kicker" data-intro>
          <span class="home__kicker-bar" aria-hidden="true" />
          شركة برمجيات عراقية في {{ company.addressParts.city }}
        </p>
        <h1 id="home-title" class="home__title" data-intro>
          <span class="home__title-line">برامج جاهزة،</span>
          <span class="home__title-line">وبرمجيات على مقاسك.</span>
        </h1>
      </div>

      <HeroArt class="home__hero-art" :play="artPlay" :delay="350" />

      <ActionLink
        look="bar"
        :to="company.phones.main.whatsapp"
        new-tab
        label="راسلنا على واتساب"
        :detail="company.phones.main.display"
        class="home__call home__call--hero"
        data-intro
      />

      <div class="home__hero-actions" data-intro>
        <ActionLink to="#ready" label="حلولنا الجاهزة" />
        <a class="home__link" :href="company.phones.main.tel"
          >أو اتصل
          <span dir="ltr">{{ company.phones.main.display }}</span></a
        >
      </div>
    </section>

    <!-- The services once more as a running strip between the hero and the products. -->
    <div class="home__marquee" aria-hidden="true">
      <div class="home__marquee-track">
        <p v-for="copy in 3" :key="copy" class="home__marquee-copy">
          <span v-for="service in services" :key="service.title" class="home__marquee-item">{{
            service.title
          }}</span>
        </p>
      </div>
    </div>

    <section
      id="ready"
      class="home__section home__ready"
      aria-labelledby="ready-title"
    >
      <div class="home__head home__head--split">
        <h2 id="ready-title" class="home__heading">حلولنا الجاهزة</h2>
        <div class="home__head-aside" data-reveal>
          <p class="home__intro">
            اختر البرنامج الذي يناسب عملك، وإن لم تجده هنا نبرمجه لك.
          </p>
          <p class="home__more">
            <NuxtLink class="home__link" to="/solutions">كل الحلول</NuxtLink>
          </p>
        </div>
      </div>

      <ul role="list" class="home__products">
        <li
          v-for="solution in solutions"
          :key="solution.slug"
          class="home__product"
        >
          <div v-if="productArt[solution.slug]" class="home__product-art">
            <img
              class="home__product-image"
              :src="productArt[solution.slug]"
              alt=""
              width="640"
              height="520"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="home__product-body">
            <p class="home__chip">
              <span class="home__chip-text">يعمل على {{ solution.platform }}</span>
            </p>
            <h3 class="home__name">{{ solution.nameAr }}</h3>
            <p class="home__latin"><span dir="ltr">{{ solution.nameEn }}</span></p>
            <p class="home__tagline">{{ solution.tagline }}</p>
            <p class="home__price">
              <span class="home__price-figure">{{ price(solution.priceIqd) }}</span>
              <span class="home__price-unit">دينار عراقي</span>
            </p>
            <div class="home__actions">
              <ActionLink
                :to="whatsappAsk(solution.nameAr)"
                new-tab
                label="اسأل عنه على واتساب"
                :hidden-suffix="solution.nameAr"
              />
              <NuxtLink class="home__link" :to="`/solutions/${solution.slug}`"
                >تفاصيل {{ solution.nameAr }}</NuxtLink
              >
            </div>
          </div>
        </li>
      </ul>
    </section>

    <section
      id="services"
      class="home__section home__services"
      aria-labelledby="services-title"
    >
      <div class="home__head home__head--stacked">
        <h2 id="services-title" class="home__heading">خدماتنا</h2>
        <p class="home__intro" data-reveal>
          من تصميم الواجهة وبرمجتها إلى إدارة السيرفر الذي يشغّلها.
        </p>
        <p class="home__more" data-reveal>
          <NuxtLink class="home__link" to="/services">تفاصيل الخدمات</NuxtLink>
        </p>
      </div>

      <!-- The titles step along the brand lean, each starting on a leaning spine. -->
      <div class="home__stairs-frame">
        <span class="home__stairs-spine" aria-hidden="true" />
        <ul role="list" class="home__stairs">
          <li v-for="service in services" :key="service.title" class="home__stair">
            {{ service.title }}
          </li>
        </ul>
      </div>
    </section>

    <section
      id="company"
      class="home__section home__company"
      aria-labelledby="company-title"
    >
      <p class="home__backdrop" aria-hidden="true">{{ company.addressParts.city }}</p>
      <div class="home__company-text">
        <h2 id="company-title" class="home__heading">
          شركة ناشئة من {{ company.addressParts.city }}
        </h2>
        <p class="home__goal">هدفنا أن نبني برمجيات تخدم الأعمال في العراق.</p>
        <p class="home__more" data-reveal>
          <NuxtLink class="home__link" to="/about">قصتنا</NuxtLink>
        </p>
      </div>

      <!-- Each year kept on one line: the spaces keep figure and label apart when read aloud. -->
      <ol role="list" class="home__years">
        <li class="home__year home__year--idea">
          <span class="home__year-figure">{{ company.founded.idea }}</span>
          <span class="home__year-node" aria-hidden="true" />
          <span class="home__year-label">بداية الفكرة</span>
        </li>
        <li class="home__year home__year--launch">
          <span class="home__year-figure">{{ company.founded.launch }}</span>
          <span class="home__year-node" aria-hidden="true" />
          <span class="home__year-label">انطلاق الشركة</span>
        </li>
        <li class="home__years-bar" role="presentation" aria-hidden="true" />
      </ol>
    </section>

    <section
      id="contact"
      class="home__section home__closing"
      aria-labelledby="contact-title"
    >
      <div class="home__band">
        <span class="home__band-pattern" aria-hidden="true" />
        <div class="home__band-content">
          <h2 id="contact-title" class="home__heading">لديك مشروع أو فكرة؟</h2>
          <p class="home__hours">
            أخبرنا بما تحتاجه على واتساب أو بالبريد الإلكتروني. الدوام
            {{ company.hours.days }}، {{ company.hours.time }}.
          </p>
          <div class="home__status-slot">
            <p
              v-if="openNow !== null"
              class="home__status"
              :class="{ 'home__status--open': openNow }"
            >
              <span class="home__status-point" aria-hidden="true" />
              {{ openNow ? "في الدوام الآن" : "خارج ساعات الدوام الآن" }}
            </p>
          </div>

          <ul role="list" class="home__channels">
            <li>
              <ActionLink
                look="ink"
                :to="company.phones.main.whatsapp"
                new-tab
                label="راسلنا على واتساب"
                :detail="company.phones.main.display"
              />
            </li>
            <li>
              <a class="home__link" :href="company.phones.main.tel"
                >أو اتصل
                <span dir="ltr">{{ company.phones.main.display }}</span></a
              >
            </li>
            <li>
              <a class="home__link" :href="`mailto:${company.email}`" dir="ltr">{{
                company.email
              }}</a>
            </li>
            <li>
              <NuxtLink class="home__link" to="/contact">كل طرق التواصل</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
// The brand lean, and the counter-slant that turns a label back upright.
$lean: skewX(calc(var(--slant-angle) * -1));
$upright: skewX(var(--slant-angle));

// From the window edge to the content column: the same column as the header bar's.
// 100cqi is the width of .home, the query container below (the window without its scrollbar).
$edge: max(
  var(--page-gutter),
  calc((100cqi - var(--container-max)) / 2 + var(--page-gutter))
);

// Below this width everything stacks; from here products pair art and text.
$medium: 48em;
// From here the hero becomes a poster with the artwork on the call bar's line.
$wide: 64em;
// From here the contact band starts on the content edge with the brand lean.
$band-lean: 80em;

// The call bar's height (ActionLink's bar uses the same clamp) and where its top edge meets the
// artwork: 124 of its 520 units, just under the نقطة, so the bar covers the top of the bowl.
$bar-h: clamp(4rem, 3.2rem + 2vw, 5.25rem);
$art-top: calc(124 / 520);
// The drawing ends at 400 of 520 units; the space reserved under the bar stops there.
$art-bottom: calc(400 / 520);

.home {
  container-type: inline-size;
  overflow-x: clip;

  // ---------------------------------------------------------------------------
  // Shared pieces
  // ---------------------------------------------------------------------------

  &__section {
    padding-inline: $edge;
    padding-block-start: clamp(var(--space-9), 10vw, var(--space-10));
  }

  &__heading {
    margin: 0 0 var(--space-3);
    font-size: var(--text-title);
    line-height: 1.25;
    font-weight: 800;
  }

  &__intro {
    max-inline-size: 30rem;
    color: var(--text-muted);
    text-wrap: balance;
  }

  &__more {
    margin-block-start: var(--space-2);
  }

  // Standalone links: 44px touch target. Colour and underline come from the base link rule.
  // The gap stands in for the space a flex box drops between text and a dir="ltr" span.
  &__link {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    min-block-size: 44px;
    font-weight: 600;
    transition: text-decoration-color var(--duration-fast) var(--ease-out);
  }

  &__head {
    margin-block-end: var(--space-8);
  }

  &__head--split {
    @media (width >= $wide) {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: end;
      column-gap: var(--space-6);
    }
  }

  &__head--stacked {
    max-inline-size: 40rem;
  }

  // ---------------------------------------------------------------------------
  // Hero: the headline, then the call bar as the line the letter ن hangs from
  // ---------------------------------------------------------------------------

  // The bar sits on the artwork's line at every width: the art spans the rows around the bar, and
  // those rows are exactly the parts of the art above and below its line.
  &__hero {
    --art-w: min(100cqi - 2 * #{$edge}, 26rem);
    --art-h: calc(var(--art-w) * 520 / 640);

    position: relative;
    isolation: isolate;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows:
      auto
      calc(var(--art-h) * #{$art-top})
      minmax(#{$bar-h}, auto)
      calc(var(--art-h) * (#{$art-bottom} - #{$art-top}) - #{$bar-h})
      auto;
    padding: clamp(var(--space-6), 5vw, var(--space-8)) $edge var(--space-8);

    // A faint dot field behind the whole hero, the same grid as the artwork's, fading to the edges.
    &::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
      background-image: radial-gradient(circle, var(--border) 1.2px, transparent 1.6px);
      background-size: 24px 24px;
      mask-image: radial-gradient(ellipse 70% 60% at 30% 55%, black 10%, transparent 75%);
      opacity: 0.6;
      pointer-events: none;
    }

    // Wide: the art takes its own column and hangs from the bottom of row 3, so the headline above
    // can be as tall as it needs.
    @media (width >= $wide) {
      --art-w: calc((100cqi - 2 * #{$edge}) * 0.44);

      grid-template-columns: minmax(0, 1fr) var(--art-w);
      grid-template-rows:
        auto
        $bar-h
        calc(var(--art-h) * (#{$art-bottom} - #{$art-top}) - #{$bar-h});
      column-gap: var(--space-6);
      align-content: center;
      min-block-size: min(calc(100svh - var(--header-height)), 62rem);
      padding-block: var(--space-7);
    }
  }

  &__hero-text {
    position: relative;
    z-index: 2;
    grid-row: 1;
    grid-column: 1 / -1;
    padding-block-end: var(--space-5);

    @media (width >= $wide) {
      align-self: end;
      padding-block-end: var(--space-7);
    }
  }

  &__kicker {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-block-end: var(--space-5);
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 1.7;
    color: var(--text-muted);
  }

  // A decorative bar, so it leans.
  &__kicker-bar {
    flex: none;
    inline-size: var(--space-6);
    block-size: 4px;
    border-radius: var(--radius-pill);
    background-color: var(--border-strong);
    transform: $lean;
  }

  &__title {
    margin: 0;
    font-size: clamp(2.25rem, 1rem + 4.6vw, 5.5rem);
    line-height: 1.2;
    font-weight: 800;
  }

  &__title-line {
    display: block;
    text-wrap: balance;
  }

  &__hero-art {
    position: relative;
    z-index: 1;
    grid-row: 2 / 5;
    grid-column: 1 / -1;
    align-self: start;
    justify-self: center;
    inline-size: var(--art-w);

    @media (width >= $wide) {
      grid-row: 1 / -1;
      grid-column: 2;
      align-self: end;
      // Its empty bottom strip hangs below the grid instead of pushing it apart.
      margin-block-end: calc(var(--art-h) * (#{$art-bottom} - 1));
    }
  }

  // The lime call bar. It runs past the window's inline-end edge; the page clips it, so its
  // slanted far end never shows and nothing scrolls sideways.
  &__call {
    position: relative;
    z-index: 2; // in front of the artwork: the bowl hangs from it
    margin-inline-end: calc(-1 * #{$edge} - var(--space-7));
    transform-origin: left center; // the window edge in RTL: the bar grows out of it
    grid-row: 3;
    grid-column: 1 / -1;
    align-self: start;

    @media (width >= $wide) {
      grid-row: 2;
    }
  }

  &__hero-actions {
    position: relative;
    z-index: 2;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-6);
    grid-row: 5;
    grid-column: 1 / -1;
    margin-block-start: var(--space-6);

    @media (width >= $wide) {
      grid-row: 3;
      grid-column: 1;
      align-self: start;
    }
  }

  // ---------------------------------------------------------------------------
  // Marquee: the services, running
  // ---------------------------------------------------------------------------

  &__marquee {
    margin-block-start: var(--space-7);
    padding-block: var(--space-4);
    border-block: 1px solid var(--border);
    background-color: var(--surface);
    overflow: hidden;
  }

  // Three copies side by side; the loop moves the track a third of its width, so the second copy
  // lands exactly where the first began.
  &__marquee-track {
    display: flex;
    inline-size: max-content;
  }

  &__marquee-copy {
    display: flex;
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.25rem, 1rem + 1.2vw, 2rem);
    font-weight: 700;
    line-height: 1.6;
    white-space: nowrap;
  }

  // Each title followed by a lime نقطة.
  &__marquee-item {
    display: inline-flex;
    align-items: center;

    &::after {
      content: "";
      inline-size: var(--point-md);
      block-size: var(--point-md);
      margin-inline: var(--space-6);
      border-radius: 50%;
      background-color: var(--accent);
    }
  }

  // ---------------------------------------------------------------------------
  // Ready-made products: art and text, the second one mirrored
  // ---------------------------------------------------------------------------

  &__products {
    display: grid;
    gap: clamp(var(--space-8), 8vw, var(--space-10));
    padding: 0;
    list-style: none;
  }

  &__product {
    display: grid;
    gap: var(--space-6);
    align-items: center;

    @media (width >= $medium) {
      grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
      column-gap: clamp(var(--space-6), 5vw, var(--space-9));

      &:nth-child(even) {
        grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);

        .home__product-art {
          order: 1;
        }
      }
    }
  }

  // The drawing on a raised panel with the same dot grid; it tilts toward the pointer.
  &__product-art {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    background-color: var(--surface);
    background-image: radial-gradient(
      ellipse at 50% 40%,
      color-mix(in srgb, var(--accent) 7%, transparent),
      transparent 65%
    );
  }

  &__product-image {
    display: block;
    inline-size: 100%;
    block-size: auto;
  }

  &__product-body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  // A tag, so it leans; its text stands upright.
  &__chip {
    margin-block-end: var(--space-5);
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
    margin: 0;
    font-size: var(--text-name);
    line-height: 1.25;
    font-weight: 800;
  }

  &__latin {
    margin-block-start: var(--space-1);
    font-family: var(--font-display);
    font-weight: 600;
    color: var(--text-muted);
  }

  &__tagline {
    margin-block-start: var(--space-4);
    font-size: var(--text-lead);
    line-height: 1.7;
  }

  &__price {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--space-2);
    margin-block-start: var(--space-6);
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
    margin-block-start: var(--space-6);
  }

  // ---------------------------------------------------------------------------
  // Services: the titles step along the brand lean
  // ---------------------------------------------------------------------------

  // Each row starts tan(10deg) of a row's pitch further along, so the starts form a leaning line;
  // the spine is drawn on that line with the same lean.
  &__stairs-frame {
    --pitch: calc(var(--text-flow) * 1.35 + var(--space-5));
    --step: calc(var(--pitch) * 0.1763);

    position: relative;
    padding-inline-start: calc(var(--space-6) + var(--space-2));
  }

  &__stairs-spine {
    position: absolute;
    inset-block: 0;
    inset-inline-start: var(--space-2);
    inline-size: var(--stroke);
    border-radius: var(--radius-pill);
    background-color: var(--border-strong);
    transform-origin: top center;

    // A decorative bar, so it leans, once the rows step along it.
    @media (width >= $medium) {
      transform: $lean;
    }
  }

  &__stairs {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding: 0;
    list-style: none;
  }

  &__stair {
    position: relative;
    font-family: var(--font-display);
    font-size: var(--text-flow);
    font-weight: 700;
    line-height: 1.35;
    text-wrap: balance;
    transition: color var(--duration-fast) var(--ease-out);

    @media (width >= $medium) {
      @for $i from 2 through 8 {
        &:nth-child(#{$i}) {
          margin-inline-start: calc(var(--step) * #{$i - 1});
        }
      }
    }

    // Its point on the spine.
    &::before {
      content: "";
      position: absolute;
      inset-block-start: calc(0.675em - var(--point-md) / 2);
      inset-inline-start: calc(-1 * (var(--space-6) + var(--point-md) / 2));
      inline-size: var(--point-md);
      block-size: var(--point-md);
      border-radius: 50%;
      background-color: var(--border-strong);
      transition:
        background-color var(--duration-fast) var(--ease-out),
        scale var(--duration-base) var(--ease-out);
    }

    @media (hover: hover) {
      &:hover::before {
        background-color: var(--accent);
        scale: 1.5;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Company: the goal, the city behind it, and the years
  // ---------------------------------------------------------------------------

  &__company {
    position: relative;
    isolation: isolate;
    padding-block-end: var(--space-6);

    @media (width >= $wide) {
      display: grid;
      grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
      align-items: end;
      column-gap: var(--space-8);
    }
  }

  // The city's name in outline, far larger than anything else, drifting slowly behind.
  &__backdrop {
    position: absolute;
    z-index: -1;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(8rem, 4rem + 22vw, 24rem);
    font-weight: 900;
    line-height: 1;
    white-space: nowrap;
    color: transparent;
    -webkit-text-stroke: 1px var(--border);
    translate: 50% -50%; // RTL: inline start is the right edge
    pointer-events: none;
    user-select: none;
  }

  &__goal {
    max-inline-size: 18em;
    margin-block-start: var(--space-7);
    font-family: var(--font-display);
    font-size: var(--text-flow);
    font-weight: 700;
    line-height: 1.6;
    text-wrap: balance;
  }

  // Idea, then launch: figure, node and label rows shared through subgrid, so the bar
  // (the third item, across the first two columns) lines up with both nodes.
  &__years {
    display: grid;
    grid-template-columns: auto minmax(var(--space-7), 1fr) auto;
    grid-template-rows: auto auto auto;
    row-gap: var(--space-3);
    max-inline-size: 28rem;
    margin-block-start: var(--space-8);
    padding: 0;
    list-style: none;

    @media (width >= $wide) {
      max-inline-size: none;
      margin-block-start: 0;
    }
  }

  // A decorative bar, so it leans: from the 2020 node to the 2024 node, with air at both ends.
  &__years-bar {
    grid-column: 1 / 3;
    grid-row: 2;
    align-self: center;
    block-size: 6px;
    margin-inline: calc(var(--point-md) + var(--space-2)) var(--space-2);
    border-radius: var(--radius-pill);
    background-color: var(--border-strong);
    transform: $lean;
  }

  &__year {
    display: grid;
    grid-row: 1 / -1;
    grid-template-rows: subgrid;
    justify-items: start;

    &--idea {
      grid-column: 1;
    }

    &--launch {
      grid-column: 3;
    }
  }

  &__year-figure {
    font-family: var(--font-display);
    font-size: var(--text-figure);
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    color: var(--text-muted);

    .home__year--launch & {
      color: var(--text);
    }
  }

  // Grey for the idea; lime for the launch, because the company is live now.
  &__year-node {
    position: relative;
    z-index: 1;
    align-self: center;
    inline-size: var(--point-md);
    block-size: var(--point-md);
    border-radius: 50%;
    background-color: var(--border-strong);

    .home__year--launch & {
      background-color: var(--accent);
      box-shadow: var(--glow-accent);
    }
  }

  &__year-label {
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 1.7;
    color: var(--text-muted);
  }

  // ---------------------------------------------------------------------------
  // Closing: the lime contact band
  // ---------------------------------------------------------------------------

  &__closing {
    padding-block-end: var(--space-9);
  }

  // Lime from window edge to window edge, glowing like the call bar, with a dark dot pattern
  // drifting across it. From $band-lean it starts on the content edge with the brand lean and its
  // far end runs past the window edge (the page clips it).
  &__band {
    // The band is lime: dark text, and a dark focus ring so it stays visible.
    --focus: var(--on-accent);

    position: relative;
    isolation: isolate;
    margin-inline: calc(-1 * #{$edge});
    padding: clamp(var(--space-7), 7vw, var(--space-9)) $edge;
    color: var(--on-accent);

    // The fill and the glow on their own layers, so they can lean while the text stays upright.
    &::before,
    &::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -2;
    }

    &::before {
      background-color: var(--accent);
    }

    &::after {
      box-shadow: var(--glow-accent);
    }

    @media (width >= $band-lean) {
      margin-inline-start: 0;
      padding-inline-start: clamp(var(--space-7), 6vw, var(--space-9));

      &::before,
      &::after {
        inset-inline-end: calc(var(--space-9) * -1);
        border-radius: var(--radius-lg);
        transform: $lean;
      }
    }

    .home__link {
      color: inherit;
      text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);

      @media (hover: hover) {
        &:hover {
          text-decoration-color: currentColor;
        }
      }
    }
  }

  // Dark points on the lime, strongest toward the window edge, fading toward the text.
  &__band-pattern {
    position: absolute;
    inset: -15% 0;
    z-index: -1;
    background-image: radial-gradient(
      circle,
      color-mix(in srgb, var(--on-accent) 30%, transparent) 1.6px,
      transparent 2px
    );
    background-size: 20px 20px;
    mask-image: linear-gradient(to right, black, transparent 70%);
    pointer-events: none;
  }

  &__band-content {
    position: relative;
  }

  &__hours {
    max-inline-size: 36rem;
    font-size: var(--text-lead);
    line-height: 1.85;
    text-wrap: balance;
  }

  // Holds the status line's height from the first paint, so it appears after mount without
  // moving anything. Without JavaScript there is no status, so nothing is held.
  &__status-slot {
    margin-block-start: var(--space-2);
    font-size: 0.9375rem;
    line-height: 1.7;

    .js & {
      min-block-size: 1.7em;
    }
  }

  &__status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 500;
  }

  // On the lime band, in the band's dark text colour. Closed: a hollow ring. Open: a filled point.
  &__status-point {
    flex: none;
    inline-size: var(--point-sm);
    block-size: var(--point-sm);
    border: 1.5px solid currentColor;
    border-radius: 50%;

    .home__status--open & {
      background-color: currentColor;
    }
  }

  &__channels {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-6);
    margin-block-start: var(--space-6);
    padding: 0;
    list-style: none;

    .home__link {
      overflow-wrap: anywhere;
    }
  }
}

// Until GSAP takes over (it adds .home--motion), the hero's parts wait hidden; if it never
// arrives, they fade in on their own after a moment. Reduced motion and no JavaScript skip all this.
@media (prefers-reduced-motion: no-preference) {
  .js .home__hero [data-intro] {
    animation: home-late-reveal var(--duration-slow) var(--ease-out) 2.5s both;
  }

  .home--motion .home__hero [data-intro] {
    animation: none;
  }
}

@keyframes home-late-reveal {
  from {
    opacity: 0;
  }
}
</style>
