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
// in front of it (wide screens only, so it loads lazily and phones never fetch it).
const [heroMain, heroSecond] = solutions;
const heroMainShot = heroMain?.images[0];
const heroSecondShot = heroSecond?.images[0];

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
    // second screen rises over the main one, a little faster. The text never moves after its
    // entrance; phones get no scroll motion.
    media.add(
      "(prefers-reduced-motion: no-preference) and (min-width: 40rem)",
      () => {
        if (!hero) return;
        // The tiers follow the page's own width (a container query, the window without its
        // scrollbar), so just past this query the screens can still be stacked as on phones.
        const stacked = () =>
          hero.offsetWidth <
          40 * parseFloat(getComputedStyle(document.documentElement).fontSize);
        const depth = (selector: string, shift: number) => {
          const layer = hero.querySelector(selector);
          if (!layer) return;
          gsap.to(layer, {
            yPercent: () => (stacked() ? 0 : shift),
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        };
        depth(".home__layer--main", -4);
        depth(".home__layer--second", -8);
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
      <p class="home__kicker">
        شركة برمجيات عراقية في {{ company.addressParts.city }}
      </p>
      <!-- Kept on one line (and out of the formatter's reach): the spaces keep the words apart
           when read aloud. -->
      <!-- prettier-ignore -->
      <h1 id="home-title" class="home__title"><span class="home__title-line">برامج جاهزة،</span> <span class="home__title-line"><span class="home__title-part">وبرمجيات</span> <span class="home__title-part">على مقاسك<span class="home__title-stop" aria-hidden="true">.</span></span></span></h1>
      <p class="home__lede">
        نبيع برامج جاهزة بأسعار معلنة، ونصمّم ونبرمج المواقع والتطبيقات والأنظمة
        حسب طلبك.
      </p>
      <div class="home__hero-actions">
        <ActionLink
          look="solid"
          :to="company.phones.main.whatsapp"
          new-tab
          label="راسلنا على واتساب"
        />
        <ActionLink to="#ready" label="تصفح حلولنا الجاهزة" />
      </div>

      <ul role="list" class="home__shortcuts" aria-label="برامجنا الجاهزة">
        <li v-for="solution in solutions" :key="solution.slug">
          <!-- Kept on one line (and out of the formatter's reach): the spaces keep name, price
               and tagline apart when read aloud. -->
          <!-- prettier-ignore -->
          <NuxtLink class="home__shortcut" :class="`home__shortcut--${solution.look}`" :to="`/solutions/${solution.slug}`"><span class="home__shortcut-name">{{ solution.nameAr }}</span> <ProductPrice class="home__shortcut-price" :amount="solution.priceIqd" size="inline" /> <span class="home__shortcut-tagline">{{ solution.tagline }}</span></NuxtLink>
        </li>
      </ul>

      <!-- Real screens of the products; decorative here, described in the products below. Each
           layer is placed (and moved by scroll); the window inside it arrives and lifts. -->
      <div class="home__showcase" aria-hidden="true">
        <div
          v-if="heroMain && heroMainShot"
          class="home__layer home__layer--main"
        >
          <ProductWindow
            v-bind="heroMainShot"
            alt=""
            :title="heroMain.nameAr"
            eager
            class="home__screen"
            :class="`home__screen--${heroMain.look}`"
          />
        </div>
        <div
          v-if="heroSecond && heroSecondShot"
          class="home__layer home__layer--second"
        >
          <ProductWindow
            v-bind="heroSecondShot"
            alt=""
            :title="heroSecond.nameAr"
            class="home__screen"
            :class="`home__screen--${heroSecond.look}`"
          />
        </div>
      </div>
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
            <ActionLink
              look="text"
              to="/services"
              label="تفاصيل الخدمات"
            />
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
// tips the layout): one column on phones (the headline on three lines, one cropped screen between
// the actions and the shortcuts); from $hero-tablet the headline on two lines, the shortcuts side
// by side and both screens under them; from $hero-cover the cover: the headline across the
// measure, the offer in a column under it and the screens beside it. The cover starts where its
// main screen no longer needs its 47.5rem floor (1.2 times the room beside the column reaches it
// at about 71.4rem), so the screen is always the larger part. The script's scroll motion repeats
// $hero-tablet.
$hero-tablet: 40rem;
$hero-cover: 72rem;
// pos.webp, the main screen (1600 by 900, app/data/solutions.ts), in shares of its size: its
// shape (height over width), where its first row of cards starts (y = 215 of 900), and the middle
// of the gutter between its third and fourth columns of cards from the menu (x = 884 to 893, so
// 0.4447 of its width from the start edge).
$main-shape: 0.5625;
$main-cards: 0.2389;
$main-gutter: 0.4447;

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
  // Hero: a cover. The offer, and real screens of the products off the end edge
  // ---------------------------------------------------------------------------

  // --hero-measure is the content column (a cqi length on the page's width): the headline fits it.
  // --main-w and --main-h are the main screen's frame from $hero-tablet: its inline size, and its
  // height (the title bar plus the screenshot at its shape). The hero cuts it at 80% of that height.
  // From $hero-cover: --hero-cover is the offer's column, --hero-gap the gap after it, and
  // --hero-rest the room from the screens' start edge to the window edge. On very wide windows the
  // main screen grows past its 75rem cap so that both screens still run off the end edge.
  &__hero {
    --hero-measure: calc(100cqi - 2 * #{$edge});
    // The longest of the three lines on phones, "برامج جاهزة،", in em at weight 700, plus 2%.
    --title-fit: 5.7;

    position: relative;
    overflow: clip;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "kicker"
      "title"
      "lede"
      "actions"
      "show"
      "short";
    padding-block: var(--space-6) var(--space-7);
    padding-inline: $edge;
    border-block-end: 1px solid var(--border);

    @container home (width >= #{$hero-tablet}) {
      // The longer of the two lines, "وبرمجيات على مقاسك.", in em at weight 700, plus 2%.
      --title-fit: 9.78;
      --hero-gap: var(--space-6);
      --main-w: calc(1.12 * (100cqi - #{$edge}));
      --main-h: calc(var(--main-w) * #{$main-shape} + 1.75rem);

      grid-template-areas:
        "kicker"
        "title"
        "lede"
        "actions"
        "short"
        "show";
      padding-block: clamp(var(--space-7), 5cqi, var(--space-9)) 0;

      // Short windows (laptops): less room above the headline.
      @media (height < 50rem) {
        padding-block-start: var(--space-6);
      }
    }

    // The cover: the headline across the measure; under it the offer's column on the start side
    // and the screens beside it from the same line, running off the end edge. The last row takes
    // whatever the screens need beyond the column.
    @container home (width >= #{$hero-cover}) {
      --hero-cover: clamp(27rem, 0.4 * var(--hero-measure), 30rem);
      --hero-gap: clamp(var(--space-6), 4cqi, var(--space-7));
      --hero-rest: calc(
        100cqi - #{$edge} - var(--hero-cover) - var(--hero-gap)
      );
      --main-w: max(
        clamp(47.5rem, 1.2 * var(--hero-rest), 75rem),
        (var(--hero-rest) + var(--space-6)) / #{0.5 + $main-gutter}
      );

      grid-template-columns: var(--hero-cover) minmax(0, 1fr);
      grid-template-rows: repeat(5, auto) 1fr;
      grid-template-areas:
        "kicker kicker"
        "title title"
        "lede show"
        "actions show"
        "short show"
        ". show";
      column-gap: var(--hero-gap);
      padding-inline: $edge 0;
    }
  }

  &__kicker {
    grid-area: kicker;
    margin-block-end: var(--space-3);
    font-size: var(--text-body);
    font-weight: 500;
    line-height: 1.7;
    color: var(--text-muted);
  }

  // Each line kept whole, the last word's full stop the one lime mark. Three lines on phones
  // ("وبرمجيات" and "على مقاسك." apart), two from $hero-tablet. In the cover the deck line sits
  // --space-7 under it (--space-6 on short windows).
  &__title {
    grid-area: title;
    margin: 0;
    font-family: var(--font-display);
    font-size: min(var(--text-hero), var(--hero-measure) / var(--title-fit));
    font-weight: 700;
    line-height: 1.25;
    text-align: start;
    text-wrap: wrap;
    color: var(--text);

    @container home (width >= #{$hero-tablet}) {
      line-height: 1.2;
    }

    @container home (width >= #{$hero-cover}) {
      margin-block-end: var(--space-7);

      @media (height < 50rem) {
        margin-block-end: var(--space-6);
      }
    }
  }

  // Each line and part only as wide as its words, so the entrance's wipe crosses the words alone.
  // The lines never wrap: the fallback font (Readex Pro) sets the long line 8% wider than Rubik,
  // so a line allowed to wrap would jump from three lines to two as Rubik arrives.
  &__title-line {
    display: block;
    inline-size: fit-content;
    white-space: nowrap;
  }

  &__title-part {
    display: block;
    inline-size: fit-content;

    @container home (width >= #{$hero-tablet}) {
      display: inline-block;
    }
  }

  // A box of its own, so the entrance can grow it from its point.
  &__title-stop {
    display: inline-block;
    color: var(--accent-text);
  }

  &__lede {
    grid-area: lede;
    max-inline-size: 27em;
    margin-block-start: var(--space-5);
    font-size: var(--text-lead);
    font-weight: 400;
    line-height: 1.8;
    color: var(--text-muted);

    @container home (width >= #{$hero-tablet}) {
      max-inline-size: 32rem;
    }

    // The deck line: the lede's top is the screens' top.
    @container home (width >= #{$hero-cover}) {
      max-inline-size: 27em;
      margin-block-start: 0;
    }
  }

  // Phones: the call across the column (its leaning corners kept inside it, and no wider than
  // 22rem on large phones), the other action under it at its own width. From $hero-tablet both on
  // one row.
  &__hero-actions {
    grid-area: actions;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
    margin-block-start: var(--space-6);

    > :first-child {
      align-self: stretch;
      justify-content: center;
      max-inline-size: 22rem;
      margin-inline: calc(var(--control-lg) * tan(var(--slant-angle)) / 2);
    }

    // Its leaning corner on the same start line as the call's.
    > :last-child {
      margin-inline-start: calc(
        var(--control-md) * tan(var(--slant-angle)) / 2
      );
    }

    @container home (width >= #{$hero-tablet}) {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;

      > :first-child {
        align-self: auto;
        margin-inline: 0;
      }

      > :last-child {
        margin-inline-start: 0;
      }
    }
  }

  // Straight to a product: a point in its colour, its name and price, what it does under them.
  // Stacked on phones; side by side from $hero-tablet; stacked again in the cover's column.
  &__shortcuts {
    grid-area: short;
    display: grid;
    gap: var(--space-4);
    margin: var(--space-6) 0 0;
    padding: 0;
    list-style: none;

    @container home (width >= #{$hero-tablet}) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: var(--hero-gap);
      margin-block-start: var(--space-7);
    }

    @container home (width >= #{$hero-cover}) {
      grid-template-columns: minmax(0, 1fr);
      align-self: start;
      margin-block: var(--space-7);
    }
  }

  &__shortcut {
    --shortcut-colour: var(--nuqta-accent);

    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: baseline;
    column-gap: var(--space-3);
    min-block-size: var(--touch-target);
    text-decoration: none;
    color: var(--text);

    // Side by side, the price right after the name, so it never reads as the next product's.
    @container home (#{$hero-tablet} <= width < #{$hero-cover}) {
      grid-template-columns: auto auto minmax(0, 1fr);
    }

    &--sand {
      --shortcut-colour: var(--dalaly-accent);
    }

    &::before {
      content: "";
      grid-row: 1;
      align-self: center;
      inline-size: var(--point-sm);
      block-size: var(--point-sm);
      border-radius: 50%;
      background-color: var(--shortcut-colour);
    }

    @media (hover: hover) {
      &:hover .home__shortcut-name {
        text-decoration-color: var(--accent);
      }
    }
  }

  // The site's plain-link underline, on the name only.
  &__shortcut-name {
    grid-column: 2;
    font-family: var(--font-display);
    font-size: var(--text-body);
    font-weight: 600;
    line-height: 1.5;
    text-decoration: underline;
    text-decoration-color: var(--border-strong);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.3em;
    transition: text-decoration-color var(--duration-fast) var(--ease-out);
  }

  &__shortcut-price {
    grid-column: 3;
    font-size: var(--text-small);
    font-weight: 500;
    line-height: 1.5;
    white-space: nowrap;
    color: var(--text);
  }

  &__shortcut-tagline {
    grid-column: 2 / -1;
    font-size: var(--text-small);
    line-height: 1.6;
    color: var(--text-muted);
  }

  // The screens: on phones one, cropped to its menu, search and first cards, its whole frame in
  // view. From $hero-tablet the main screen whole and large, the hero cutting it at 80% of its
  // height, and the second in front of it over its end half, cropped to its top and start corner
  // and set off from it by a ring of the page's ground. Both run off the end edge, never toward
  // the text.
  &__showcase {
    grid-area: show;
    position: relative;
    margin-block-start: var(--space-7);

    @container home (width >= #{$hero-tablet}) {
      block-size: calc(0.8 * var(--main-h));
    }

    @container home (width >= #{$hero-cover}) {
      align-self: start;
      margin-block-start: 0;
    }
  }

  // Each layer places a screen (and from $hero-tablet the scroll moves it); the window inside it
  // arrives and lifts (see the end of this file).
  &__layer--main {
    --window-ratio: 1.25;
    --window-zoom: 2;

    inline-size: calc(1.2 * var(--hero-measure));

    @container home (width >= #{$hero-tablet}) {
      --window-ratio: auto;
      --window-zoom: 1;

      inline-size: var(--main-w);
    }
  }

  // Its top edge on the main screen's first row of cards: past the frame's border and title bar,
  // then $main-cards of the screenshot's height. Its ring's outer edge in the gutter after the
  // main screen's third column of cards, so the menu and three whole columns stay in view. Set off
  // from the main screen by a ring of the page's ground (ProductWindow's --window-ring).
  &__layer--second {
    --window-ratio: 1.5;
    --window-zoom: 1.5;
    --window-ring: 0 0 0 var(--space-2) var(--bg);

    position: absolute;
    display: none;

    @container home (width >= #{$hero-tablet}) {
      inset-block-start: calc(
        1px + 1.75rem + (var(--main-w) - 2px) * #{$main-shape} * #{$main-cards}
      );
      inset-inline-start: calc(
        #{$main-gutter} * var(--main-w) + var(--space-2)
      );
      display: block;
      inline-size: calc(0.5 * var(--main-w));
    }
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
// text arrives first and fast (the headline reads by about 450ms), then the screens. Every
// keyframe runs toward the resting style, which is what shows without motion or JavaScript.
@media (prefers-reduced-motion: no-preference) {
  .home__kicker {
    animation: home-rise var(--duration-slow) var(--ease-out) backwards;
  }

  // The headline is wiped in from the reading start: the first line, then each part of the second.
  .home__title-line:first-child,
  .home__title-part {
    animation: home-wipe var(--duration-slow) var(--ease-out) backwards;
  }

  .home__title-part {
    animation-delay: var(--stagger);

    & + .home__title-part {
      animation-delay: calc(2 * var(--stagger));
    }
  }

  // Grown from the point itself, which sits just above the baseline.
  .home__title-stop {
    transform-origin: 50% 75%;
    animation: home-grow var(--duration-base) var(--ease-out) 480ms backwards;
  }

  .home__lede {
    animation: home-rise var(--duration-slow) var(--ease-out) 160ms backwards;
  }

  // The individual translate property: the links lean with transform.
  .home__hero-actions > * {
    animation: home-forward var(--duration-slow) var(--ease-out) 240ms backwards;

    & + * {
      animation-delay: 320ms;
    }
  }

  .home__shortcuts {
    animation: home-fade var(--duration-slow) var(--ease-out) 400ms backwards;
  }

  // On the windows, never on the layers the scroll moves. The main screen fades in over the page's
  // ground; the second is revealed whole from the reading start, so the main screen never shows
  // through it. A shortcut pointed at or focused lifts its product's window.
  .home__screen {
    animation: home-arrive var(--duration-entrance) var(--ease-out) 120ms
      backwards;
    transition: translate var(--duration-base) var(--ease-out);
  }

  .home__layer--second .home__screen {
    animation: home-reveal var(--duration-entrance) var(--ease-out) 280ms
      backwards;
  }

  .home__hero:has(.home__shortcut--violet:focus-visible) .home__screen--violet,
  .home__hero:has(.home__shortcut--sand:focus-visible) .home__screen--sand {
    translate: 0 -4px;
  }

  @media (hover: hover) {
    .home__hero:has(.home__shortcut--violet:hover) .home__screen--violet,
    .home__hero:has(.home__shortcut--sand:hover) .home__screen--sand {
      translate: 0 -4px;
    }
  }

  // Keyboard focus can get there first: what holds focus is shown at once, never half-faded. The
  // entrance is finished, not removed, so it never replays when focus moves on.
  .home__hero-actions > :focus-within,
  .home__shortcuts:focus-within {
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

@keyframes home-grow {
  from {
    scale: 0;
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

@keyframes home-arrive {
  from {
    opacity: 0;
    translate: 0 1.5rem;
  }
}

// Revealed from the inline start (the right edge, RTL only) while it rises, opaque throughout. The
// other three sides are clipped wide of the frame, so its ring and shadow are never cut.
@keyframes home-reveal {
  from {
    clip-path: inset(-1rem -3rem -4rem 100%);
    translate: 0 1.5rem;
  }

  to {
    clip-path: inset(-1rem -3rem -4rem -3rem);
  }
}
</style>
