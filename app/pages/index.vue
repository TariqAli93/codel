<script setup lang="ts">
import { company, services } from "~/data/company";
import { solutions, type SolutionImage } from "~/data/solutions";

// The hero's screens and the contact band run to the window edge, so this page draws its own
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

// The hero's cover: the first product's first screen, large, and the second product's first screen
// in front of it (from $hero-tablet, 40rem, up: it loads lazily, so phones never fetch it).
const [heroMain, heroSecond] = solutions;
const heroMainShot = heroMain?.images[0];
const heroSecondShot = heroSecond?.images[0];

// One chip for each of those two screens, so a product added later never lands on the stage
// without a place. Every product is linked from the section under the hero.
const heroChips = solutions.slice(0, 2);

// The main screen is the page's largest paint: ask for it early, at high priority.
const heroPreload: SolutionImage[] = heroMainShot ? [heroMainShot] : [];
useHead({
  link: heroPreload.map((shot) => ({
    rel: "preload" as const,
    as: "image" as const,
    href: shot.src,
    fetchpriority: "high" as const,
  })),
});

const page = ref<HTMLElement | null>(null);
let stopMotion: (() => void) | undefined;
let unmounted = false;

onMounted(startMotion);

onBeforeUnmount(() => {
  unmounted = true;
  stopMotion?.();
});

// Scroll motion (GSAP), fetched while the page hydrates and set up after mount, so the server render
// and hydration never see it. The hero's entrance is plain CSS and waits on none of it: its text is
// on screen within half a second whatever the network does.
const loadMotion = () =>
  Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
const motionModules = import.meta.client ? loadMotion() : undefined;

async function startMotion() {
  const [{ gsap }, { ScrollTrigger }] = await (motionModules ?? loadMotion());
  await document.fonts.ready;
  const root = page.value;
  if (unmounted || !root) return;
  gsap.registerPlugin(ScrollTrigger);

  const all = (selector: string) =>
    gsap.utils.toArray<HTMLElement>(selector, root);
  const ease = "power2.out";
  // The one reveal. A function, not a shared object, because GSAP writes to the vars it is given.
  const reveal = () => ({ opacity: 0, y: 12, duration: 0.22, ease });

  // The brand lean, read from the stylesheet so the wipe below leans with everything else.
  const slant =
    (parseFloat(getComputedStyle(root).getPropertyValue("--slant-angle")) ||
      10) *
    (Math.PI / 180);

  const hero = root.querySelector<HTMLElement>(".home__hero");

  const context = gsap.context(() => {
    const media = gsap.matchMedia();

    // Hero, from the tablet tier up ($hero-tablet, 40rem, in the styles): as it scrolls away the
    // second screen rises over the main one, a little faster, and each chip a little more than the
    // screen behind it. The text and the slab never move after their entrance; phones get no scroll
    // motion.
    media.add(
      "(prefers-reduced-motion: no-preference) and (min-width: 40rem)",
      () => {
        if (!hero) return;
        // The tiers follow the page's own width (a container query, the window without its
        // scrollbar), so just past this query the hero can still be in the phone tier, below
        // $hero-tablet, where nothing moves.
        const inPhoneTier = () =>
          hero.offsetWidth <
          40 * parseFloat(getComputedStyle(document.documentElement).fontSize);
        // A function, not a shared object, because GSAP writes to the vars it is given.
        const scrub = () => ({
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        });
        // How much further a chip travels than the screen behind it, in pixels.
        const chipLead = 5;
        // Moves a layer, then the <li> of its chip. Its <a> has the CSS entrance, on purpose: a CSS
        // entrance on an element GSAP transforms gets baked in when hydration is fast.
        const depth = (place: "main" | "second", shift: number) => {
          const layer = hero.querySelector<HTMLElement>(
            `.home__layer--${place}`,
          );
          if (!layer) return;
          gsap.to(layer, {
            yPercent: () => (inPhoneTier() ? 0 : shift),
            ease: "none",
            scrollTrigger: scrub(),
          });
          const chip = hero.querySelector(`.home__chip-spot--${place}`);
          if (!chip) return;
          gsap.to(chip, {
            y: () =>
              inPhoneTier() ? 0 : (layer.offsetHeight * shift) / 100 - chipLead,
            ease: "none",
            scrollTrigger: scrub(),
          });
        };
        depth("main", -4);
        depth("second", -8);
      },
    );

    media.add("(prefers-reduced-motion: no-preference)", () => {
      // Section headings, leads and links: the one reveal as they arrive, once.
      for (const item of all("[data-reveal]")) {
        gsap.from(item, {
          ...reveal(),
          scrollTrigger: { trigger: item, start: "top 90%", once: true },
        });
      }

      // Products, the page's one signature: the main screen is wiped in from the reading start
      // behind a leaning edge, then the second screen fades in. The text takes the one reveal as the
      // wipe starts, so reading never waits on the screens.
      for (const product of all(".home__product")) {
        const body = product.querySelector(".home__product-body");
        const main = product.querySelector<HTMLElement>(".home__shot--main");
        const second = product.querySelector(".home__shot--second");
        const show = gsap.timeline({
          scrollTrigger: { trigger: product, start: "top 75%", once: true },
        });
        if (body) show.from(body, reveal(), 0);
        if (main) {
          // The edge's lean as a share of the screen's width; the right edge is the reading start.
          const lean =
            (Math.tan(slant) * main.offsetHeight * 100) /
            Math.max(main.offsetWidth, 1);
          show.fromTo(
            main,
            {
              clipPath: `polygon(${100 + lean}% 0%, ${100 + lean}% 0%, ${100 + lean}% 100%, 100% 100%)`,
              y: 40,
            },
            {
              clipPath: `polygon(0% 0%, ${100 + lean}% 0%, ${100 + lean}% 100%, ${-lean}% 100%)`,
              y: 0,
              duration: 0.48,
              ease: "expo.inOut",
              clearProps: "clipPath",
            },
            0,
          );
        }
        if (second) show.from(second, { opacity: 0, duration: 0.22, ease });
      }

      // Company: the bar between the two years draws from the idea to the launch.
      gsap.from(".years__bar", {
        scaleX: 0,
        transformOrigin: "right center",
        duration: 0.22,
        ease,
        scrollTrigger: { trigger: ".years", start: "top 85%", once: true },
      });
    });
  }, root);

  // Keyboard focus can reach an element before its reveal has run or finished: whatever holds
  // focus jumps to its end state at once, so nothing is ever focused half-faded.
  // Scrubbed motion (the hero's depth) follows the scroll position and has no end state to jump
  // to, so it is left alone.
  const onFocus = (event: FocusEvent) => {
    const target = event.target as HTMLElement | null;
    for (const trigger of ScrollTrigger.getAll()) {
      if (trigger.vars.scrub) continue;
      const element = trigger.trigger;
      if (element && target && element.contains(target))
        trigger.animation?.progress(1);
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
  };
}
</script>

<template>
  <div ref="page" class="home">
    <section class="home__hero" aria-labelledby="home-title">
      <div class="home__offer">
        <p class="home__kicker">
          شركة برمجيات عراقية في {{ company.addressParts.city }}
        </p>
        <!-- Kept on one line (and out of the formatter's reach): the spaces keep the words apart
             when read aloud. -->
        <!-- prettier-ignore -->
        <h1 id="home-title" class="home__title"><span class="home__title-line">من شغلك،</span> <span class="home__title-line">إلى برنامج</span> <span class="home__title-line home__title-line--mark">يشتغل.</span></h1>
        <p class="home__lede">
          اشترِ برنامجاً جاهزاً بسعر معلن وابدأ العمل اليوم،
          <span class="home__lede-keep">أو اطلب</span> موقعاً أو تطبيقاً أو
          نظاماً على مقاس عملك.
        </p>
        <div class="home__hero-actions">
          <ActionLink look="solid" :to="company.phones.main.whatsapp" new-tab>
            <span class="home__action-label"
              ><span
                class="home__glyph home__glyph--chat"
                aria-hidden="true"
              />راسلنا على واتساب</span
            >
          </ActionLink>
          <ActionLink look="outline" size="lg" to="#ready">
            <span class="home__action-label"
              >تصفح حلولنا الجاهزة<span
                class="home__glyph home__glyph--arrow"
                aria-hidden="true"
            /></span>
          </ActionLink>
        </div>
        <ul role="list" class="home__proof">
          <li>أسعار معلنة</li>
          <li>مقرنا في {{ company.addressParts.city }}</li>
          <li>تواصل مباشر على واتساب</li>
        </ul>
      </div>

      <!-- The stage: the lime slab and real screens of the products on it (decorative here,
           described in the products below). Each layer is placed and moved by scroll, the window
           inside it arrives and lifts. -->
      <div class="home__showcase home__band">
        <div
          v-if="heroMain && heroMainShot"
          class="home__layer home__layer--main"
          aria-hidden="true"
        >
          <ProductWindow
            v-bind="heroMainShot"
            alt=""
            eager
            class="home__screen"
            :class="`home__screen--${heroMain.look}`"
          />
        </div>
        <div
          v-if="heroSecond && heroSecondShot"
          class="home__layer home__layer--second"
          aria-hidden="true"
        >
          <ProductWindow
            v-bind="heroSecondShot"
            alt=""
            class="home__screen"
            :class="`home__screen--${heroSecond.look}`"
          />
        </div>
      </div>

      <!-- A chip for each screen, last in the hero so the tab order is the buttons, then the chips,
           at every width. From $hero-tablet the list shares the stage's grid area and its chips
           float on the screens; each chip's <li> is moved by scroll, its link arrives. -->
      <ul role="list" class="home__chips" aria-label="برامجنا الجاهزة">
        <li
          v-for="(solution, index) in heroChips"
          :key="solution.slug"
          class="home__chip-spot"
          :class="`home__chip-spot--${index === 0 ? 'main' : 'second'}`"
        >
          <!-- Kept on one line (and out of the formatter's reach): the spaces keep name, price
               and tagline apart when read aloud. -->
          <!-- prettier-ignore -->
          <NuxtLink class="home__chip" :class="`home__chip--${solution.look}`" :to="`/solutions/${solution.slug}`"><span class="home__chip-name">{{ solution.nameAr }}</span> <ProductPrice class="home__chip-price" :amount="solution.priceIqd" size="inline" /> <span class="home__chip-tagline">{{ solution.tagline }}</span></NuxtLink>
        </li>
      </ul>
    </section>

    <section id="ready" class="home__section" aria-labelledby="ready-title">
      <div class="home__head">
        <h2 id="ready-title" data-reveal>حلولنا الجاهزة</h2>
        <div data-reveal>
          <p class="home__intro">
            اختر البرنامج الذي يناسب عملك، وإن لم تجده هنا نبرمجه لك.
          </p>
          <p class="home__more">
            <ActionLink look="text" to="/solutions" label="كل الحلول" />
          </p>
        </div>
      </div>

      <article
        v-for="solution in solutions"
        :key="solution.slug"
        class="home__product"
        :class="`home__product--${solution.look}`"
        :data-theme="solution.look === 'sand' ? 'light' : undefined"
        :aria-labelledby="`product-${solution.slug}`"
      >
        <div class="home__product-body">
          <LeanTag :label="`يعمل على ${solution.platform}`" />
          <h3 :id="`product-${solution.slug}`" class="home__name">
            {{ solution.nameAr }}
            <span class="home__latin" dir="ltr">{{ solution.nameEn }}</span>
          </h3>
          <p class="home__tagline">{{ solution.tagline }}</p>
          <p class="home__desc">{{ solution.description }}</p>
          <ul role="list" class="home__features">
            <li v-for="feature in solution.features.slice(0, 4)" :key="feature">
              {{ feature }}
            </li>
          </ul>
          <ProductPrice
            class="home__product-price"
            :amount="solution.priceIqd"
          />
          <div class="home__actions">
            <WhatsAppCall
              :subject="solution.nameAr"
              label="اسأل عنه على واتساب"
              :hidden-suffix="solution.nameAr"
              :glow="false"
            />
            <ActionLink
              look="text"
              :to="`/solutions/${solution.slug}`"
              :label="`تفاصيل ${solution.nameAr}`"
            />
          </div>
        </div>

        <div v-if="solution.images.length" class="home__product-visual">
          <ProductWindow
            v-if="solution.images[0]"
            v-bind="solution.images[0]"
            class="home__shot home__shot--main"
          />
          <ProductWindow
            v-if="solution.images[1]"
            v-bind="solution.images[1]"
            class="home__shot home__shot--second"
          />
        </div>
      </article>
    </section>

    <section
      id="services"
      class="home__section home__services"
      aria-labelledby="services-title"
    >
      <div>
        <h2 id="services-title" data-reveal>خدماتنا</h2>
        <div data-reveal>
          <p class="home__intro">
            من تصميم الواجهة وبرمجتها إلى إدارة السيرفر الذي يشغّلها.
          </p>
          <p class="home__more">
            <ActionLink look="text" to="/services" label="تفاصيل الخدمات" />
          </p>
        </div>
      </div>

      <div>
        <ul role="list" class="home__service-names">
          <li v-for="service in services" :key="service.title">
            {{ service.title }}
          </li>
        </ul>
        <WhatsAppCall
          class="home__services-call"
          look="outline"
          label="حدّثنا عن فكرتك"
          :subject="services.at(-1)?.title"
        />
      </div>
    </section>

    <section
      id="company"
      class="home__section home__company"
      aria-labelledby="company-title"
    >
      <div>
        <h2 id="company-title" data-reveal>
          شركة ناشئة من {{ company.addressParts.city }}
        </h2>
        <p class="home__statement" data-reveal>
          هدفنا أن نبني برمجيات تخدم الأعمال في العراق.
        </p>
        <p class="home__more" data-reveal>
          <ActionLink look="text" to="/about" label="قصتنا" />
        </p>
      </div>

      <div data-reveal>
        <FoundingYears />
        <dl class="home__facts">
          <div class="home__fact">
            <dt>المقر</dt>
            <dd>{{ company.address }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section
      id="contact"
      class="home__section home__closing"
      aria-labelledby="contact-title"
    >
      <div class="home__band">
        <h2 id="contact-title" data-reveal>لديك مشروع أو فكرة؟</h2>
        <p class="home__hours">
          أخبرنا بما تحتاجه على واتساب أو بالبريد الإلكتروني. الدوام
          {{ company.hours.days }}، {{ company.hours.time }}.
        </p>
        <OpenStatus class="home__band-status" />

        <ul role="list" class="home__channels">
          <li>
            <WhatsAppCall look="ink" :detail="company.phones.main.display" />
          </li>
          <li>
            <!-- Kept on one line (and out of the formatter's reach): the space keeps the words and
                 the number apart. -->
            <!-- prettier-ignore -->
            <ActionLink look="text" :to="company.phones.main.tel">أو اتصل <span dir="ltr">{{ company.phones.main.display }}</span></ActionLink>
          </li>
          <li>
            <ActionLink
              look="text"
              :to="`mailto:${company.email}`"
              :label="company.email"
              dir="ltr"
            />
          </li>
          <li>
            <ActionLink look="text" to="/contact" label="كل طرق التواصل" />
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
// The brand lean.
$lean: skewX(calc(var(--slant-angle) * -1));

// From the window edge to the content column: the same column as the header bar's.
// 100cqi is the width of .home, the query container below (the window without its scrollbar).
$edge: max(
  var(--page-gutter),
  calc((100cqi - var(--container-max)) / 2 + var(--page-gutter))
);

$medium: 48em;
$wide: 64em;
// From here the contact band starts on the content edge with the brand lean.
$band-lean: 80em;
// The hero's tiers, measured on the page's own width (the `home` container, so a scrollbar never
// tips the layout). Under $hero-cover the headline's last word lands on the slab, and the slab
// carries the real program under it: on phones one column (kicker, headline, one cropped screen on
// the slab, the two actions, the lede, the proof, the two prices as one list); from $hero-tablet a
// two-column lockup over the slab, both screens on it and the chips floating on them; from
// $hero-landscape the actions move up beside the headline, above the fold. From $hero-cover the
// cover: the offer in a column and the stage beside it, filling the window from behind the header.
// The cover's main screen holds its 47.5rem floor until about 76rem, where 1.2 times the room
// beside the column passes it. The script's scroll motion repeats $hero-tablet.
$hero-tablet: 40rem;
$hero-landscape: 64rem;
$hero-cover: 72rem;
// The headline's line box, and where the lime starts inside its last line: under the hamza and
// the tails of the line above (their lowest point is 0.3em under that baseline) and over this
// line's ل (0.756em above its own).
$title-leading: 1.15;
$mark-top: 0.12;
// pos.webp, the main screen (1600 by 900, app/data/solutions.ts), in shares of its size: its
// shape (height over width), how much of its height the hero shows, where its first row of cards
// starts (y = 215 of 900), and the middle of the gutter between its third and fourth columns of
// cards from the menu (x = 884 to 893, so 0.4447 of its width from the start edge).
$main-shape: 0.5625;
$main-show: 0.84;
$main-cards: 0.2389;
$main-gutter: 0.4447;
// The main screen's view on phones: width over height, its menu, search and first cards.
$phone-crop: 2;
// The hero's glyphs, drawn as masks: the black is only the mask's shape, the colour is the
// element's own.
$glyph-check: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 12.5l5.5 5.5L20 7'/%3E%3C/svg%3E");
$glyph-chat: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 3.5a8.5 8.5 0 1 1-3.9 16l-4.6 1 1-4.6A8.5 8.5 0 0 1 12 3.5z'/%3E%3C/svg%3E");
$glyph-arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 12H5m6-6-6 6 6 6'/%3E%3C/svg%3E");

.home {
  container: home / inline-size;
  overflow-x: clip;

  // ---------------------------------------------------------------------------
  // Shared pieces
  // ---------------------------------------------------------------------------

  &__section {
    padding-inline: $edge;
    padding-block-start: var(--section-gap);
  }

  &__intro {
    max-inline-size: 30rem;
    color: var(--text-muted);
    text-wrap: balance;
  }

  &__more {
    margin-block-start: var(--space-2);
  }

  &__head {
    margin-block-end: var(--head-gap);
  }

  // ---------------------------------------------------------------------------
  // Hero: the offer and a leaning lime slab with the products' real screens
  // ---------------------------------------------------------------------------

  // --hero-room is the content column (a cqi length on the page's width) and --hero-measure the
  // offer's column inside it: the headline (--title-size, --title-line its line box) fits the
  // measure. --stage-top and --stage-end are the slab's reach above and below the main screen and
  // --main-w the main screen's inline size. Under $hero-cover the stage is pulled up behind the
  // headline's last line: --word-room runs from the slab's top edge to the bottom of that line.
  // From $hero-tablet: --stage-over is the slab's reach past the screens, --main-h the main screen's
  // frame (its two borders plus the screenshot in view), --second-at and --second-top where the
  // second screen starts along it and down it, --chip-w a chip's width, and --stage-room the room
  // from the stage's start edge to the window edge, which keeps the second chip on screen.
  // From $hero-cover: --header-room is what the header takes, --hero-pad the padding above and below
  // the room under it, --hero-gap the gap after the offer and --hero-rest the room beside it. On
  // very wide windows the main screen grows past its 75rem cap so that both screens still run off
  // the end edge.
  &__hero {
    --hero-room: calc(100cqi - 2 * #{$edge});
    --hero-measure: min(var(--hero-room), 30rem);
    // The longest of the three lines, "من شغلك،", in em at weight 700 (4.566; "إلى برنامج" is
    // 4.112 and "يشتغل." 3.165, or 3.525 with its padding), over the 83% of the measure it takes.
    --title-fit: 5.5;
    --title-size: min(var(--text-hero), var(--hero-measure) / var(--title-fit));
    --title-line: calc(#{$title-leading} * var(--title-size));
    --word-room: calc(#{$title-leading - $mark-top} * var(--title-size));
    --stage-top: calc(var(--word-room) + var(--space-2));
    --stage-end: var(--space-5);
    --main-w: calc(1.2 * var(--hero-room));

    position: relative;
    overflow: clip;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "kicker"
      "title"
      "stage"
      "actions"
      "lede"
      "proof"
      "chips";
    padding-block: var(--space-4) var(--space-7);
    padding-inline: $edge;

    // The lockup over the slab: kicker and headline on the reading side, the lede beside them.
    @container home (width >= #{$hero-tablet}) {
      --stage-over: clamp(var(--space-8), 6.6cqi, var(--space-9));
      --stage-top: calc(var(--word-room) + var(--space-3));
      --stage-end: var(--stage-over);
      --stage-room: calc(100cqi - #{$edge});
      --main-w: calc(1.12 * (100cqi - #{$edge}));
      --main-h: min(
        (var(--main-w) - 2px) * #{$main-shape * $main-show} + 2px,
        26rem
      );
      --second-at: calc(#{$main-gutter} * var(--main-w) + var(--space-2));
      --second-top: calc(
        1px + (var(--main-w) - 2px) * #{$main-shape * $main-cards}
      );
      --chip-w: 18.5rem;

      grid-template-columns: max-content minmax(0, 1fr);
      grid-template-areas:
        "kicker lede"
        "title lede"
        "stage stage"
        "actions actions"
        "proof proof";
      column-gap: clamp(var(--space-6), 6cqi, var(--space-8));
      padding-block: clamp(var(--space-7), 5cqi, var(--space-9)) var(--space-8);

      // Short windows (laptops): less room above the headline.
      @media (height < 50rem) {
        padding-block-start: var(--space-6);
      }

      // A phone on its side: the headline takes the page size, so the word on the slab is still
      // in the first window.
      @media (height < 30em) {
        --title-size: var(--text-page);

        padding-block-start: var(--space-4);
      }
    }

    // Landscape tablets: the actions move up under the lede, so they sit above the fold.
    @container home (width >= #{$hero-landscape}) {
      grid-template-rows: auto minmax(0, 1fr) auto;
      grid-template-areas:
        "kicker ."
        "title lede"
        "title actions"
        "stage stage"
        "proof proof";
    }

    // The cover: the offer's column on the start side and the stage beside it, running off the end
    // edge, the two centred against each other in the room under the header. The hero slides up
    // behind the header and fills the window (min, so a short or zoomed window grows, never clips).
    // The headline and the screens shrink with the window's height; dvh only from here, because on
    // phones it would lay the page out again as the address bar collapses.
    @container home (width >= #{$hero-cover}) {
      --header-room: calc(var(--header-height) + var(--space-3));
      --hero-pad: var(--space-5);
      --hero-gap: var(--space-8);
      --hero-rest: calc(
        100cqi - #{$edge} - var(--hero-measure) - var(--hero-gap)
      );
      --title-size: min(
        var(--text-hero),
        var(--hero-measure) / var(--title-fit),
        11.2dvh
      );
      --stage-over: clamp(var(--space-8), 10.6dvh, var(--space-9));
      --stage-top: var(--stage-over);
      --stage-room: var(--hero-rest);
      --main-w: max(
        clamp(47.5rem, 1.2 * var(--hero-rest), 75rem),
        (var(--hero-rest) + var(--space-6)) / #{0.5 + $main-gutter}
      );
      --main-h: max(
        20rem,
        min(
          (var(--main-w) - 2px) * #{$main-shape * $main-show} + 2px,
          100dvh - var(--header-room) - 2 * var(--hero-pad) - 2 *
            var(--stage-over)
        )
      );

      grid-template-columns: var(--hero-measure) minmax(0, 1fr);
      grid-template-rows: none;
      grid-template-areas: "offer stage";
      align-items: center;
      column-gap: var(--hero-gap);
      min-block-size: 100dvh;
      margin-block-start: calc(-1 * var(--header-room));
      padding-block: calc(var(--header-room) + var(--hero-pad)) var(--hero-pad);
      padding-inline: $edge 0;
    }
  }

  // Under the cover the offer's parts are placed on the hero's own grid, around the stage. The
  // markup keeps them together, so the reading and tab order never change.
  &__offer {
    display: contents;

    @container home (width >= #{$hero-cover}) {
      grid-area: offer;
      display: block;

      // Short windows (laptops): the gaps close up so the offer still fits under the header.
      @media (height < 46rem) {
        .home__kicker {
          margin-block-end: var(--space-2);
        }

        .home__lede {
          margin-block-start: var(--space-4);
        }

        .home__hero-actions {
          margin-block-start: var(--space-5);
        }

        .home__proof {
          margin-block-start: var(--space-4);
        }
      }
    }
  }

  // After a small leaning bar: the bar is decoration, the words stay upright.
  &__kicker {
    grid-area: kicker;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-block-end: var(--space-2);
    font-size: var(--text-body);
    font-weight: 600;
    line-height: 1.7;
    color: var(--accent-text);

    @container home (width >= #{$hero-tablet}) {
      margin-block-end: var(--space-4);
    }

    &::before {
      content: "";
      flex: none;
      inline-size: var(--space-2);
      block-size: var(--space-4);
      background-color: var(--accent);
      transform: $lean;
    }
  }

  // Three lines, each kept whole; the last one sits on lime. It paints over the stage, which is
  // pulled up behind it under the cover.
  &__title {
    grid-area: title;
    position: relative;
    z-index: 1;
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--title-size);
    font-weight: 700;
    line-height: $title-leading;
    text-align: start;
    color: var(--text);

    // Its bottom stays on the slab if the lede beside it ever runs taller.
    @container home (width >= #{$hero-tablet}) {
      align-self: end;
    }
  }

  // Each line only as wide as its words, so the entrance's wipe crosses the words alone. The lines
  // never wrap: the fallback font (Readex Pro) sets them wider than Rubik, so a line allowed to wrap
  // would jump as Rubik arrives.
  &__title-line {
    display: block;
    inline-size: fit-content;
    white-space: nowrap;
  }

  // Under the cover this line is the slab's first line and the slab is its ground. In the cover the
  // highlight leans on its own layer, so the text stays upright; a stacking context of its own keeps
  // the fill behind the words. Its top edge is at $mark-top; its bottom edge clears the dots under ي
  // by the same margin.
  &__title-line--mark {
    position: relative;
    isolation: isolate;
    padding-inline: 0.18em;
    color: var(--on-accent);

    @container home (width >= #{$hero-cover}) {
      &::before {
        content: "";
        position: absolute;
        z-index: -1;
        inset: #{$mark-top}em 0 -0.02em;
        border-radius: var(--radius-md);
        background-color: var(--accent);
        transform: $lean;
      }
    }
  }

  // On phones under the actions. From $hero-tablet beside the headline, ending on the bottom of its
  // second line, so always above the slab's top edge; from $hero-landscape over the actions.
  &__lede {
    grid-area: lede;
    max-inline-size: 27em;
    margin-block-start: var(--space-5);
    font-size: var(--text-lead);
    font-weight: 400;
    line-height: 1.8;
    color: var(--text-muted);
    text-wrap: balance;

    @container home (width >= #{$hero-tablet}) {
      align-self: end;
      max-inline-size: 32rem;
      margin-block: 0 var(--title-line);
    }

    @container home (width >= #{$hero-landscape}) {
      margin-block-end: var(--space-4);
    }

    @container home (width >= #{$hero-cover}) {
      max-inline-size: none;
      margin-block: var(--space-5) 0;
    }
  }

  // "أو" stays with its verb, never alone at the end of a line.
  &__lede-keep {
    white-space: nowrap;
  }

  // Phones: right under the slab, both actions across the column, their leaning corners kept inside
  // it and no wider than 22rem on large phones. From $hero-tablet both on one row, the same height;
  // from $hero-landscape beside the headline, ending on the bottom of its second line.
  &__hero-actions {
    grid-area: actions;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-block-start: var(--space-4);

    // A little under the buttons' own padding, so the two fit one row of the 30rem column.
    > a {
      justify-content: center;
      max-inline-size: 22rem;
      margin-inline: calc(var(--control-lg) * tan(var(--slant-angle)) / 2);
      padding-inline: calc(var(--space-6) - var(--space-1));
    }

    @container home (width >= #{$hero-tablet}) {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      margin-block-start: var(--space-6);

      > a {
        margin-inline: 0;
      }
    }

    @container home (width >= #{$hero-landscape}) {
      margin-block: 0 var(--title-line);
    }

    @container home (width >= #{$hero-cover}) {
      margin-block: var(--space-6) 0;
    }
  }

  // The label and its glyph, both inside the part of the button that is turned back upright.
  &__action-label {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  &__glyph {
    flex: none;
    inline-size: 1.25em;
    block-size: 1.25em;
    background-color: currentColor;

    &--chat {
      mask: $glyph-chat center / contain no-repeat;
    }

    &--arrow {
      mask: $glyph-arrow center / contain no-repeat;
    }
  }

  // Three short facts, each after a lime check; on one line in the cover, wrapped on narrow widths.
  &__proof {
    grid-area: proof;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    margin: var(--space-5) 0 0;
    padding: 0;
    list-style: none;
    font-size: var(--text-small);
    line-height: 1.7;
    color: var(--text-muted);

    li {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      white-space: nowrap;

      &::before {
        content: "";
        flex: none;
        inline-size: 1em;
        block-size: 1em;
        background-color: var(--accent-text);
        mask: $glyph-check center / contain no-repeat;
      }
    }
  }

  // The stage: the screens on the slab. The block padding is the slab's reach above and below the
  // main screen. Under the cover it is pulled up behind the headline's last line, so that line is
  // the slab's first and the screens start just under it.
  &__showcase {
    grid-area: stage;
    position: relative;
    isolation: isolate;
    margin-block-start: calc(-1 * var(--word-room));
    padding-block: var(--stage-top) var(--stage-end);

    @container home (width >= #{$hero-cover}) {
      margin-block-start: 0;
    }

    // Flat lime with the brand lean, square, no glow, its far end a --space-10 past the content's
    // edge and the window's. Under the cover it turns about its top edge, so its height never moves
    // the top corner, which stays a --space-3 off the window's edge; it leans away from there and
    // the main screen overhangs it lower down. In the cover it starts well inside the main screen
    // and turns about its middle.
    &::before {
      content: "";
      position: absolute;
      z-index: -1;
      inset-block: 0;
      inset-inline: calc(var(--space-3) - #{$edge})
        calc(-1 * (#{$edge} + var(--space-10)));
      background-color: var(--accent);
      transform: $lean;
      transform-origin: 50% 0;

      @container home (width >= #{$hero-cover}) {
        inset-inline-start: clamp(var(--space-6), 9cqi, var(--space-10));
        transform-origin: 50% 50%;
      }
    }
  }

  &__screen {
    --window-radius: var(--radius-md);
  }

  // Each layer places a screen (and from $hero-tablet the scroll moves it); the window inside it
  // arrives and lifts (see the end of this file). The main screen runs off the end edge: on phones
  // cropped to its menu, search and first cards, from $hero-tablet whole, its frame cut to --main-h
  // so its bottom corners show on the slab.
  &__layer--main {
    --window-ratio: #{$phone-crop};
    --window-zoom: 1.5;

    inline-size: var(--main-w);

    @container home (width >= #{$hero-tablet}) {
      --window-ratio: auto;
      --window-zoom: 1;

      .home__screen {
        block-size: var(--main-h);
      }
    }
  }

  // Its top edge on the main screen's first row of cards: past the frame's border, then $main-cards
  // of the screenshot's height. Its ring's outer edge in the gutter after the main screen's third
  // column of cards, so the menu and three whole columns stay in view. Set off from the main screen
  // by a ring of the page's ground (ProductWindow's --window-ring). Its frame runs from there down
  // to the main screen's bottom edge, half as wide as the main screen; the ring and shadow are cut
  // at that edge, so the two screens end on one line over the slab.
  &__layer--second {
    --window-zoom: 1.5;
    --window-ring: 0 0 0 var(--space-2) var(--bg);

    position: absolute;
    display: none;
    clip-path: inset(calc(-1 * var(--space-7)) calc(-1 * var(--space-7)) 0);

    @container home (width >= #{$hero-tablet}) {
      inset-block-start: calc(var(--stage-top) + var(--second-top));
      inset-inline-start: var(--second-at);
      display: block;
      inline-size: calc(0.5 * var(--main-w));

      .home__screen {
        block-size: calc(var(--main-h) - var(--second-top));
      }
    }
  }

  // On phones one joined list of the two prices, in flow. From $hero-tablet the list is the stage's
  // own box, in the same grid area, and its items are placed against it, floating on the screens.
  &__chips {
    grid-area: chips;
    margin: var(--space-5) 0 0;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background-color: var(--surface);
    list-style: none;

    @container home (width >= #{$hero-tablet}) {
      grid-area: stage;
      position: relative;
      margin-block-start: calc(-1 * var(--word-room));
      border: 0;
      border-radius: 0;
      background-color: transparent;
    }

    @container home (width >= #{$hero-cover}) {
      align-self: center;
      block-size: calc(var(--main-h) + 2 * var(--stage-over));
      margin-block-start: 0;
    }
  }

  &__chip-spot {
    @container home (width < #{$hero-tablet}) {
      & + & {
        border-block-start: 1px solid var(--border);
      }
    }

    @container home (width >= #{$hero-tablet}) {
      position: absolute;
      inline-size: var(--chip-w);
    }

    // Across the main screen's top edge, most of it above. Under the cover it floats in the free
    // lime beside the word, on the content column's far edge; in the cover past the screen's start
    // edge.
    &--main {
      @container home (width >= #{$hero-tablet}) {
        inset-block-end: calc(100% - var(--stage-top) - var(--space-3));
        inset-inline-end: 0;
      }

      @container home (width >= #{$hero-cover}) {
        inset-inline: calc(-1 * var(--space-5)) auto;
      }
    }

    // Across the second screen's bottom edge, most of it below, past that screen's start edge, but
    // never so far along that it leaves the window.
    &--second {
      @container home (width >= #{$hero-tablet}) {
        inset-block-start: calc(
          var(--stage-top) + var(--main-h) - var(--space-5)
        );
        inset-inline-start: min(
          var(--second-at) - var(--space-5),
          var(--stage-room) - var(--chip-w) - var(--space-4)
        );
      }
    }
  }

  // A point in the product's colour, its name and price; what it does under them. On phones a row
  // of the list; from $hero-tablet a card of its own.
  &__chip {
    --chip-colour: var(--nuqta-accent);

    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: baseline;
    column-gap: var(--space-2);
    min-block-size: var(--touch-target);
    padding: var(--space-3) var(--space-4);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    text-decoration: none;
    color: var(--text);
    transition: border-color var(--duration-fast) var(--ease-out);

    @container home (width >= #{$hero-tablet}) {
      padding-block: var(--space-2);
      border-color: var(--border);
      background-color: var(--surface);
      box-shadow: var(--shadow-md);
    }

    &--sand {
      --chip-colour: var(--dalaly-accent);
    }

    &::before {
      content: "";
      grid-row: 1;
      align-self: center;
      inline-size: var(--point-sm);
      block-size: var(--point-sm);
      border-radius: 50%;
      background-color: var(--chip-colour);
    }

    @media (hover: hover) {
      &:hover {
        border-color: var(--accent);
      }
    }

    // A card sits half on the slab, where the lime ring alone would vanish: a halo of the page's
    // ground under the global ring keeps it visible over the slab and the page alike.
    &:focus-visible {
      border-color: var(--accent);

      @container home (width >= #{$hero-tablet}) {
        box-shadow:
          0 0 0 var(--space-2) var(--bg),
          var(--shadow-md);
      }
    }
  }

  &__chip-name {
    grid-row: 1;
    grid-column: 2;
    font-family: var(--font-display);
    font-size: var(--text-body);
    font-weight: 600;
    line-height: 1.5;
  }

  &__chip-price {
    grid-row: 1;
    grid-column: 3;
    font-size: var(--text-ui);
    font-weight: 600;
    line-height: 1.5;
    white-space: nowrap;
    color: var(--accent-text);
  }

  &__chip-tagline {
    grid-column: 1 / -1;
    font-size: var(--text-small);
    line-height: 1.7;
    color: var(--text-muted);
  }

  // ---------------------------------------------------------------------------
  // Products: a showcase each, coloured like the product itself
  // ---------------------------------------------------------------------------

  &__product {
    position: relative;
    overflow: hidden;
    display: grid;
    gap: var(--space-7);
    padding: var(--panel-pad);
    border-radius: var(--radius-xl);
    color: var(--text);

    & + & {
      margin-block-start: var(--space-7);
    }

    @media (width >= $wide) {
      grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
      align-items: center;
      column-gap: clamp(var(--space-6), 4vw, var(--space-9));
    }

    // Nuqta Plus: a flat ground tinted with its own violet.
    &--violet {
      border: 1px solid var(--border);
      background-color: var(--nuqta-ground);
    }

    // Dalaly: its own warm paper ground and dark ink (the light theme's tokens, scoped here).
    &--sand {
      background-color: var(--dalaly-ground);
      color: var(--dalaly-ink);

      @media (width >= $wide) {
        grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);

        .home__product-visual {
          order: -1;
        }
      }
    }
  }

  &__product-body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__name {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--space-3);
    margin: var(--space-5) 0 0;
  }

  &__latin {
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

  &__desc {
    max-inline-size: 32rem;
    margin-block-start: var(--space-3);
    line-height: 1.75;
    color: var(--text-muted);
  }

  // Four of the product's features, each after a point in the product's colour.
  &__features {
    display: grid;
    gap: var(--space-2) var(--space-5);
    margin-block-start: var(--space-5);
    padding: 0;
    list-style: none;
    font-size: var(--text-small);
    font-weight: 500;

    @media (width >= $medium) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    li {
      display: flex;
      gap: var(--space-2);
      line-height: 1.7;

      &::before {
        content: "";
        flex: none;
        inline-size: var(--point-sm);
        block-size: var(--point-sm);
        margin-block-start: 0.65em;
        border-radius: 50%;
        background-color: var(--nuqta-accent);
      }
    }

    .home__product--sand & li::before {
      background-color: var(--dalaly-accent);
    }
  }

  &__product-price {
    margin-block-start: var(--space-6);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-5);
    margin-block-start: var(--space-6);
  }

  // The main screen runs out past the panel's edge (the panel clips it); the second screen sits
  // over its lower corner.
  &__product-visual {
    position: relative;
    padding-block-end: 12%;

    @media (width >= $wide) {
      margin-inline-end: calc(-1 * var(--panel-pad) - var(--space-6));
    }

    .home__product--sand & {
      @media (width >= $wide) {
        margin-inline: calc(-1 * var(--panel-pad) - var(--space-6)) 0;
      }
    }
  }

  &__shot {
    --window-radius: var(--radius-md);
  }

  &__shot--second {
    position: absolute;
    inset-block-end: 0;
    inset-inline-start: -4%;
    inline-size: 52%;

    .home__product--sand & {
      inset-inline: auto -4%;
    }
  }

  // ---------------------------------------------------------------------------
  // Services: type-led, the heading and a link beside the names of the services
  // ---------------------------------------------------------------------------

  &__services {
    display: grid;
    row-gap: var(--head-gap);

    @media (width >= $wide) {
      grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
      column-gap: var(--space-8);
    }
  }

  &__service-names {
    padding: 0;
    list-style: none;

    li {
      padding-block: var(--space-5);
      border-block-start: 1px solid var(--border);
      font-family: var(--font-display);
      font-size: var(--text-flow);
      font-weight: 700;
      line-height: 1.5;
    }
  }

  &__services-call {
    margin-block-start: var(--space-6);
  }

  // ---------------------------------------------------------------------------
  // Company: the goal as a statement; the years and the address beside it
  // ---------------------------------------------------------------------------

  &__company {
    display: grid;
    gap: var(--space-8);
    margin-block-start: var(--section-gap);
    padding-block: var(--section-gap);
    border-block: 1px solid var(--border);
    background-color: var(--surface);

    @media (width >= $wide) {
      grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
      align-items: end;
      column-gap: var(--space-9);
    }
  }

  &__statement {
    max-inline-size: var(--measure);
    margin-block-start: var(--space-6);
    font-family: var(--font-display);
    font-size: var(--text-flow);
    font-weight: 700;
    line-height: 1.5;
    text-wrap: balance;
  }

  &__facts {
    display: grid;
    gap: var(--space-4);
    margin: var(--space-7) 0 0;
    padding-block-start: var(--space-6);
    border-block-start: 1px solid var(--border);
  }

  &__fact {
    display: grid;
    grid-template-columns: 5rem minmax(0, 1fr);
    gap: var(--space-4);
    line-height: 1.7;

    dt {
      color: var(--text-muted);
    }

    dd {
      margin: 0;
      font-weight: 600;
      text-wrap: balance;
    }
  }

  // ---------------------------------------------------------------------------
  // Closing: the lime contact band
  // ---------------------------------------------------------------------------

  &__closing {
    padding-block-end: var(--section-gap);
  }

  // Lime from window edge to window edge, glowing. From $band-lean it starts on the content edge
  // with the brand lean and its far end runs past the window edge (the page clips it).
  &__band {
    // The band is lime: dark text and links, and a dark focus ring so it stays visible.
    --focus: var(--on-accent);
    --link-color: var(--on-accent);
    --link-rule: color-mix(in srgb, var(--on-accent) 60%, transparent);
    --link-rule-hover: var(--on-accent);
    --link-active: var(--on-accent);

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
  }

  &__hours {
    max-inline-size: 36rem;
    font-size: var(--text-lead);
    line-height: 1.8;
    text-wrap: balance;
  }

  &__band-status {
    margin-block-start: var(--space-2);
  }

  &__channels {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-6);
    margin-block-start: var(--space-6);
    padding: 0;
    list-style: none;
  }
}

// The hero's entrance: plain CSS, so it starts with the first paint and waits for nothing. The
// text arrives first and fast (the headline reads by about 450ms), then the lede and actions, then
// the slab, the screens and the chips; under the cover the slab comes earlier, ahead of the word
// that sits on it. Every keyframe runs toward the resting style, which is what shows without motion
// or JavaScript.
@media (prefers-reduced-motion: no-preference) {
  .home__kicker {
    animation: home-rise var(--duration-slow) var(--ease-out) backwards;
  }

  // The headline is wiped in from the reading start: the first line, the second, then the
  // highlighted line. In the cover that line is one unit, its fill and its words together; under
  // the cover it is dark text on the slab, so it follows the slab's own wipe across.
  .home__title-line {
    animation: home-wipe var(--duration-slow) var(--ease-out) backwards;

    &:nth-child(2) {
      animation-delay: var(--stagger);
    }

    &--mark {
      animation-name: home-wipe-mark;
      animation-delay: calc(2 * var(--stagger));
    }
  }

  .home__lede {
    animation: home-rise var(--duration-slow) var(--ease-out) 240ms backwards;
  }

  // The individual translate property: the links lean with transform.
  .home__hero-actions > * {
    animation: home-forward var(--duration-slow) var(--ease-out) 280ms backwards;

    & + * {
      animation-delay: 340ms;
    }
  }

  .home__proof {
    animation: home-fade var(--duration-slow) var(--ease-out) 400ms backwards;
  }

  // The fill alone is clipped, so the slab's lean is untouched and the wipe's edge leans with it.
  // Under the cover it starts with the second line, a beat ahead of the word that sits on it.
  .home__showcase::before {
    animation: home-slab var(--duration-slow) var(--ease-out) 320ms backwards;

    @container home (width < #{$hero-cover}) {
      animation-delay: var(--stagger);
    }
  }

  // On the windows, never on the layers the scroll moves. The main screen fades in on the slab;
  // the second is revealed whole from the reading start, so the main screen never shows through
  // it. A chip pointed at or focused lifts its product's window.
  .home__screen {
    animation: home-arrive var(--duration-entrance) var(--ease-out) 400ms
      backwards;
    transition: translate var(--duration-base) var(--ease-out);
  }

  .home__layer--second .home__screen {
    animation: home-reveal var(--duration-entrance) var(--ease-out) 520ms
      backwards;
  }

  // On the links, never on the <li>s the scroll moves. On phones the list is one panel and arrives
  // as one.
  .home__chip {
    @container home (width >= #{$hero-tablet}) {
      animation: home-rise var(--duration-slow) var(--ease-out) 640ms backwards;
    }
  }

  .home__chip-spot--second .home__chip {
    @container home (width >= #{$hero-tablet}) {
      animation-delay: 720ms;
    }
  }

  .home__chips {
    @container home (width < #{$hero-tablet}) {
      animation: home-rise var(--duration-slow) var(--ease-out) 640ms backwards;
    }
  }

  .home__hero:has(.home__chip--violet:focus-visible) .home__screen--violet,
  .home__hero:has(.home__chip--sand:focus-visible) .home__screen--sand {
    translate: 0 -4px;
  }

  @media (hover: hover) {
    .home__hero:has(.home__chip--violet:hover) .home__screen--violet,
    .home__hero:has(.home__chip--sand:hover) .home__screen--sand {
      translate: 0 -4px;
    }
  }

  // Keyboard focus can get there first: what holds focus is shown at once, never half-faded. The
  // entrance is finished, not removed, so it never replays when focus moves on.
  .home__hero-actions > :focus-within,
  .home__chips:focus-within,
  .home__chip:focus-within {
    animation-duration: 0s;
    animation-delay: 0s;
  }
}

@keyframes home-rise {
  from {
    opacity: 0;
    translate: 0 0.5rem;
  }
}

// From the inline start, the right edge (the site is RTL only), past the words' ends so no mark is
// cut; with `backwards` fill nothing is left clipping once it ends.
@keyframes home-wipe {
  from {
    clip-path: inset(-30% -0.1em -30% 100%);
  }

  to {
    clip-path: inset(-30% -0.1em -30% -0.1em);
  }
}

// The same wipe for the highlighted line, wider on both sides so the leaning corners are not cut.
@keyframes home-wipe-mark {
  from {
    clip-path: inset(-30% -0.3em -30% calc(100% + 0.3em));
  }

  to {
    clip-path: inset(-30% -0.3em -30% -0.3em);
  }
}

// Forward is to the left (RTL): from a little to the right.
@keyframes home-forward {
  from {
    opacity: 0;
    translate: 1rem 0;
  }
}

@keyframes home-fade {
  from {
    opacity: 0;
  }
}

// From the inline start, in the slab's own leaning coordinates.
@keyframes home-slab {
  from {
    clip-path: inset(0 0 0 100%);
  }

  to {
    clip-path: inset(0);
  }
}

@keyframes home-arrive {
  from {
    opacity: 0;
    translate: 0 1.5rem;
  }
}

// Revealed from the inline start (the right edge, RTL only) while it rises, opaque throughout. It
// starts zero wide, so nothing shows before the reveal; by the end the sides are wide of the frame,
// so the clip never cuts its ring or shadow.
@keyframes home-reveal {
  from {
    clip-path: inset(-1rem 0 -4rem 100%);
    translate: 0 1.5rem;
  }

  to {
    clip-path: inset(-1rem -3rem -4rem -3rem);
  }
}
</style>
