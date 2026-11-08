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

const price = (value: number) => new Intl.NumberFormat("en-US").format(value);

// The same prefilled question as on /solutions/<slug>.
const whatsappAsk = (nameAr: string) =>
  `${company.phones.main.whatsapp}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن ${nameAr}`)}`;

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

// Each product's showcase takes its colours from the product's own interface.
const productLook: Record<string, "violet" | "sand"> = {
  "nuqta-plus": "violet",
  dalaly: "sand",
};

// One small drawing per service, in the order of `services` in app/data/company.ts.
const serviceArt = ["web", "mobile", "ledger", "server", "custom"] as const;

// Open or closed right now, on Baghdad time. Worked out in the browser after mount only, so the
// server-rendered page never carries a time; until then (and without JavaScript) nothing is shown.
const openNow = ref<boolean | null>(null);

const page = ref<HTMLElement | null>(null);
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

  startMotion();
});

onBeforeUnmount(() => {
  unmounted = true;
  stopMotion?.();
});

// Scroll and pointer motion (GSAP), fetched while the page hydrates and set up after mount, so the
// server render and hydration never see it. The hero's entrance is plain CSS and waits on none of
// it: its text is on screen within half a second whatever the network does.
const loadMotion = () =>
  Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    import("gsap/SplitText"),
  ]);
const motionModules = import.meta.client ? loadMotion() : undefined;

async function startMotion() {
  const [{ gsap }, { ScrollTrigger }, { SplitText }] = await (motionModules ??
    loadMotion());
  await document.fonts.ready;
  const root = page.value;
  if (unmounted || !root) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const splits: Array<{ revert: () => void }> = [];
  const words = (target: Element) => {
    const split = SplitText.create(target, { type: "words", mask: "words" });
    splits.push(split);
    return split.words;
  };
  const all = (selector: string, scope: Element = root) =>
    gsap.utils.toArray<HTMLElement>(selector, scope);
  const ease = "expo.out";

  // The brand lean, read from the stylesheet so the wipes below lean with everything else.
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
      // Section headings rise word by word as they arrive; leads and links follow.
      for (const heading of all(".home__heading")) {
        gsap.from(words(heading), {
          yPercent: 110,
          duration: 0.9,
          ease,
          stagger: 0.05,
          scrollTrigger: { trigger: heading, start: "top 88%", once: true },
        });
      }
      for (const item of all("[data-reveal]")) {
        gsap.from(item, {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease,
          scrollTrigger: { trigger: item, start: "top 90%", once: true },
        });
      }

      // Products: the main screen is wiped in from the reading start behind a leaning edge; the
      // second screen slides in over it, then the text follows. While the product passes, the
      // screens drift apart.
      for (const product of all(".home__product")) {
        const main = product.querySelector<HTMLElement>(".home__shot--main");
        const second = product.querySelector(".home__shot--second");
        const show = gsap.timeline({
          scrollTrigger: { trigger: product, start: "top 75%", once: true },
        });
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
              duration: 1.1,
              ease: "expo.inOut",
              clearProps: "clipPath",
            },
          );
        }
        if (second)
          show.from(
            second,
            { opacity: 0, x: -60, y: 30, duration: 1, ease },
            0.45,
          );
        show.from(
          all(".home__product-body > *", product),
          {
            opacity: 0,
            y: 24,
            duration: 0.8,
            ease,
            stagger: 0.06,
          },
          0.2,
        );
        if (second) {
          gsap.fromTo(
            second,
            { yPercent: 10 },
            {
              yPercent: -10,
              ease: "none",
              scrollTrigger: {
                trigger: product,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }
      }

      // Services: the tiles rise in reading order, a row at a time.
      ScrollTrigger.batch(all(".home__tile"), {
        start: "top 88%",
        once: true,
        // A tile that already holds focus (keyboard got there first) is left as it is.
        onEnter: (batch) =>
          gsap.from(
            batch.filter((tile) => !tile.contains(document.activeElement)),
            {
              opacity: 0,
              y: 40,
              duration: 0.9,
              ease,
              stagger: 0.1,
            },
          ),
      });

      // Company: the city's name drifts behind the quote; the years draw their bar.
      gsap.fromTo(
        ".home__backdrop",
        { xPercent: -6 },
        {
          xPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: ".home__company",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".home__years",
            start: "top 85%",
            once: true,
          },
        })
        .from(".home__year--idea .home__year-node", {
          scale: 0,
          duration: 0.4,
          ease: "back.out(2)",
        })
        .from(".home__years-bar", {
          scaleX: 0,
          transformOrigin: "right center",
          duration: 0.8,
          ease: "power2.inOut",
        })
        .from(".home__year--launch .home__year-node", {
          scale: 0,
          duration: 0.4,
          ease: "back.out(2)",
        });

      // Contact: the lime band sweeps in from the reading start, then its contents follow.
      const band = root.querySelector(".home__band");
      if (band) {
        gsap
          .timeline({
            scrollTrigger: { trigger: band, start: "top 80%", once: true },
          })
          .fromTo(
            band,
            { clipPath: "inset(-20% -20% -20% 100%)" },
            {
              clipPath: "inset(-20% -20% -20% -20%)",
              duration: 1.1,
              ease: "expo.inOut",
              clearProps: "clipPath",
            },
          )
          .from(
            all(".home__band-content > *", band),
            {
              opacity: 0,
              y: 20,
              duration: 0.7,
              ease,
              stagger: 0.06,
            },
            0.5,
          );
      }
    });

    // Pointer: product screens tilt toward it.
    media.add(
      "(prefers-reduced-motion: no-preference) and (hover: hover)",
      () => {
        const detach: Array<() => void> = [];
        for (const visual of all(".home__product-visual")) {
          gsap.set(visual, { transformPerspective: 1400 });
          const tiltX = gsap.quickTo(visual, "rotationX", {
            duration: 0.7,
            ease: "power3.out",
          });
          const tiltY = gsap.quickTo(visual, "rotationY", {
            duration: 0.7,
            ease: "power3.out",
          });
          const move = (event: PointerEvent) => {
            const box = visual.getBoundingClientRect();
            tiltX(((event.clientY - box.top) / box.height - 0.5) * -5);
            tiltY(((event.clientX - box.left) / box.width - 0.5) * 7);
          };
          const leave = () => {
            tiltX(0);
            tiltY(0);
          };
          visual.addEventListener("pointermove", move);
          visual.addEventListener("pointerleave", leave);
          detach.push(() => {
            visual.removeEventListener("pointermove", move);
            visual.removeEventListener("pointerleave", leave);
          });
        }
        return () => detach.forEach((off) => off());
      },
    );
  }, root);

  // Keyboard focus can reach an element before its reveal has run or finished: whatever holds
  // focus jumps to its end state at once, so nothing is ever focused half-faded.
  // Scrubbed motion (the hero's depth, the parallax) follows the scroll position and has no end
  // state to jump to, so it is left alone.
  const onFocus = (event: FocusEvent) => {
    const target = event.target as HTMLElement | null;
    for (const trigger of ScrollTrigger.getAll()) {
      if (trigger.vars.scrub) continue;
      const element = trigger.trigger;
      if (element && target && element.contains(target))
        trigger.animation?.progress(1);
    }
    // Reveals started by a batch callback have no trigger animation: finish those on the way up.
    for (let node = target; node && node !== root; node = node.parentElement) {
      for (const tween of gsap.getTweensOf(node)) {
        if (!tween.scrollTrigger?.vars.scrub) tween.progress(1);
      }
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
          <NuxtLink
            class="home__shortcut"
            :class="`home__shortcut--${productLook[solution.slug] ?? 'violet'}`"
            :to="`/solutions/${solution.slug}`"
          ><span class="home__shortcut-name">{{ solution.nameAr }}</span> <span class="home__shortcut-price"><span dir="ltr">{{ price(solution.priceIqd) }}</span> دينار عراقي</span> <span class="home__shortcut-tagline">{{ solution.tagline }}</span></NuxtLink>
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
            :class="`home__screen--${productLook[heroMain.slug] ?? 'violet'}`"
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
            :class="`home__screen--${productLook[heroSecond.slug] ?? 'violet'}`"
          />
        </div>
      </div>
    </section>

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

      <div class="home__ready--solutions">
        <article
          v-for="solution in solutions"
          :key="solution.slug"
          class="home__product"
          :class="`home__product--${productLook[solution.slug] ?? 'violet'}`"
          :data-theme="
            productLook[solution.slug] === 'sand' ? 'light' : undefined
          "
          :aria-labelledby="`product-${solution.slug}`"
        >
          <div class="home__product-body">
            <p class="home__chip">
              <span class="home__chip-text"
                >يعمل على {{ solution.platform }}</span
              >
            </p>
            <h3 :id="`product-${solution.slug}`" class="home__name">
              {{ solution.nameAr }}
              <span class="home__latin" dir="ltr">{{ solution.nameEn }}</span>
            </h3>
            <p class="home__tagline">{{ solution.tagline }}</p>
            <p class="home__desc">{{ solution.description }}</p>
            <ul role="list" class="home__features">
              <li
                v-for="feature in solution.features.slice(0, 4)"
                :key="feature"
              >
                {{ feature }}
              </li>
            </ul>
            <p class="home__price">
              <span class="home__price-figure">{{
                price(solution.priceIqd)
              }}</span>
              <span class="home__price-unit">دينار عراقي</span>
            </p>
            <div class="home__actions">
              <ActionLink
                look="solid"
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

          <div v-if="solution.images.length" class="home__product-visual">
            <ProductWindow
              v-if="solution.images[0]"
              v-bind="solution.images[0]"
              :title="solution.nameAr"
              class="home__shot home__shot--main"
            />
            <ProductWindow
              v-if="solution.images[1]"
              v-bind="solution.images[1]"
              :title="solution.nameAr"
              class="home__shot home__shot--second"
            />
          </div>
        </article>
      </div>
    </section>

    <section
      id="services"
      class="home__section home__services"
      aria-labelledby="services-title"
    >
      <div class="home__head home__head--split">
        <h2 id="services-title" class="home__heading">خدماتنا</h2>
        <div class="home__head-aside" data-reveal>
          <p class="home__intro">
            من تصميم الواجهة وبرمجتها إلى إدارة السيرفر الذي يشغّلها.
          </p>
          <p class="home__more">
            <NuxtLink class="home__link" to="/services"
              >تفاصيل الخدمات</NuxtLink
            >
          </p>
        </div>
      </div>

      <ul role="list" class="home__bento">
        <li
          v-for="(service, index) in services"
          :key="service.title"
          class="home__tile"
          :class="`home__tile--${serviceArt[index] ?? 'plain'}`"
        >
          <div class="home__tile-art" aria-hidden="true">
            <div v-if="serviceArt[index] === 'web'" class="home__mini-browser">
              <span class="home__mini-url" />
              <span class="home__mini-hero" />
              <span class="home__mini-line" />
              <span class="home__mini-line home__mini-line--short" />
              <span class="home__mini-cards"><span /><span /><span /></span>
            </div>
            <div
              v-else-if="serviceArt[index] === 'mobile'"
              class="home__mini-phone"
            >
              <span class="home__mini-notch" />
              <span v-for="row in 5" :key="row" class="home__mini-row" />
              <span class="home__mini-fab" />
            </div>
            <div
              v-else-if="serviceArt[index] === 'ledger'"
              class="home__mini-ledger"
              dir="ltr"
            >
              <span v-for="row in 4" :key="row" class="home__mini-entry"
                ><span /><span
              /></span>
              <span class="home__mini-total"><span /><span /></span>
            </div>
            <pre
              v-else-if="serviceArt[index] === 'server'"
              class="home__mini-terminal"
              dir="ltr"
            ><span class="home__mini-ok">$</span> deploy --production
<span class="home__mini-ok">✓</span> build      12.4s
<span class="home__mini-ok">✓</span> migrate     0.8s
<span class="home__mini-live">●</span> online</pre>
            <div v-else class="home__mini-sketch">
              <span class="home__mini-idea" />
              <span class="home__mini-arrow" />
              <span class="home__mini-built" />
            </div>
          </div>
          <h3 class="home__tile-title">{{ service.title }}</h3>
          <p class="home__tile-text">{{ service.text }}</p>
          <p v-if="serviceArt[index] === 'custom'" class="home__tile-more">
            <ActionLink to="/contact" label="حدّثنا عن فكرتك" />
          </p>
        </li>
      </ul>
    </section>

    <section
      id="company"
      class="home__section home__company"
      aria-labelledby="company-title"
    >
      <p class="home__backdrop" aria-hidden="true">
        {{ company.addressParts.city }}
      </p>
      <div class="home__company-lead">
        <h2 id="company-title" class="home__heading">
          شركة ناشئة من {{ company.addressParts.city }}
        </h2>
        <blockquote class="home__quote" data-reveal>
          <p>هدفنا أن نبني برمجيات تخدم الأعمال في العراق.</p>
        </blockquote>
        <p class="home__more" data-reveal>
          <NuxtLink class="home__link" to="/about">قصتنا</NuxtLink>
        </p>
      </div>

      <div class="home__company-facts" data-reveal>
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
        <dl class="home__facts">
          <div class="home__fact">
            <dt>المقر</dt>
            <dd>{{ company.address }}</dd>
          </div>
          <div class="home__fact">
            <dt>الدوام</dt>
            <dd>{{ company.hours.days }}، {{ company.hours.time }}</dd>
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
              <a
                class="home__link"
                :href="`mailto:${company.email}`"
                dir="ltr"
                >{{ company.email }}</a
              >
            </li>
            <li>
              <NuxtLink class="home__link" to="/contact"
                >كل طرق التواصل</NuxtLink
              >
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
    padding-block-start: clamp(var(--space-9), 9vw, var(--space-10));
  }
  .home__ready--solutions {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    align-items: end;
    column-gap: var(--space-6);
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
      grid-template-columns: repeat(1, minmax(0, 1fr));
      align-items: end;
      column-gap: var(--space-6);
    }
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
    font-size: 1rem;
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
    min-block-size: 44px;
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
    font-size: 1.0625rem;
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

  // Windows apps: no window lights.
  &__screen {
    --window-lights: none;
  }

  // ---------------------------------------------------------------------------
  // Products: a showcase each, coloured like the product itself
  // ---------------------------------------------------------------------------

  &__product {
    position: relative;
    overflow: hidden;
    display: grid;
    gap: var(--space-7);
    margin-block-end: var(--space-7);
    padding: clamp(var(--space-6), 5vw, var(--space-9));
    border-radius: var(--radius-xl);
    color: var(--text);

    @media (width >= $wide) {
      grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
      align-items: center;
      column-gap: clamp(var(--space-6), 4vw, var(--space-9));
    }

    // Nuqta Plus: dark, with its own violet light behind the screens.
    &--violet {
      border: 1px solid var(--border);
      background:
        radial-gradient(
          ellipse 70% 80% at 15% 50%,
          color-mix(in srgb, var(--nuqta-accent) 26%, transparent),
          transparent 70%
        ),
        var(--surface);
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
    font-size: var(--text-name);
    line-height: 1.25;
    font-weight: 800;
  }

  &__latin {
    font-size: 1rem;
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

  &__desc {
    max-inline-size: 32rem;
    margin-block-start: var(--space-3);
    line-height: 1.85;
    color: var(--text-muted);
  }

  // Four of the product's features, each after a point in the product's colour.
  &__features {
    display: grid;
    gap: var(--space-2) var(--space-5);
    margin-block-start: var(--space-5);
    padding: 0;
    list-style: none;
    font-size: 0.9375rem;
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

  // The main screen runs out past the panel's edge (the panel clips it); the second screen sits
  // over its lower corner.
  &__product-visual {
    position: relative;
    padding-block-end: 12%;

    @media (width >= $wide) {
      margin-inline-end: calc(
        -1 * clamp(var(--space-6), 5vw, var(--space-9)) - var(--space-6)
      );
    }

    .home__product--sand & {
      @media (width >= $wide) {
        margin-inline: calc(
            -1 * clamp(var(--space-6), 5vw, var(--space-9)) - var(--space-6)
          )
          0;
      }
    }
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
  // Services: a mosaic of tiles, each with a small drawing of the work
  // ---------------------------------------------------------------------------

  &__bento {
    display: grid;
    gap: var(--space-4);
    padding: 0;
    list-style: none;

    @media (width >= $medium) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (width >= $wide) {
      grid-template-columns: repeat(6, minmax(0, 1fr));
    }
  }

  &__tile {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: var(--space-6);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    background-color: var(--surface);
    transition:
      border-color var(--duration-base) var(--ease-out),
      translate var(--duration-base) var(--ease-out);

    @media (hover: hover) {
      &:hover {
        border-color: var(--border-strong);
        translate: 0 -4px;
      }
    }

    &--custom {
      background:
        linear-gradient(
          135deg,
          color-mix(in srgb, var(--accent) 10%, transparent),
          transparent 55%
        ),
        var(--surface);
    }

    @media (width >= $medium) {
      &--web,
      &--custom {
        grid-column: 1 / -1;
      }

      &--mobile {
        grid-row: span 2;
      }
    }

    @media (width >= $wide) {
      &--web {
        grid-column: span 4;
      }

      &--mobile,
      &--ledger,
      &--server {
        grid-column: span 2;
      }

      &--custom {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        grid-template-rows: auto auto 1fr;
        column-gap: var(--space-8);
        align-items: start;

        .home__tile-art {
          grid-column: 2;
          grid-row: 1 / -1;
          margin: 0;
        }
      }
    }
  }

  &__tile-art {
    display: grid;
    place-items: center;
    block-size: 10rem;
    margin-block-end: var(--space-6);
    border-radius: var(--radius-lg);
    background-color: var(--bg);
    background-image: radial-gradient(
      circle,
      var(--border) 1px,
      transparent 1.4px
    );
    background-size: 16px 16px;

    .home__tile--mobile & {
      @media (width >= $medium) {
        flex: 1;
        block-size: auto;
        min-block-size: 16rem;
      }
    }
  }

  &__tile-title {
    margin: 0;
    font-size: clamp(1.25rem, 1.1rem + 0.6vw, 1.625rem);
    line-height: 1.4;
    font-weight: 700;
  }

  &__tile-text {
    max-inline-size: 34rem;
    margin-block-start: var(--space-2);
    line-height: 1.8;
    color: var(--text-muted);
  }

  &__tile-more {
    margin-block-start: var(--space-5);
  }

  // The small drawings: quiet outlines with one lime detail each.
  &__mini-browser {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    inline-size: min(78%, 22rem);
    padding: 0.6rem;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    background-color: var(--surface);
  }

  &__mini-url {
    block-size: 0.5rem;
    inline-size: 45%;
    border-radius: var(--radius-pill);
    background-color: var(--border);
  }

  &__mini-hero {
    block-size: 1.6rem;
    border-radius: var(--radius-sm);
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--accent) 70%, transparent),
      color-mix(in srgb, var(--accent) 15%, transparent)
    );
  }

  &__mini-line {
    block-size: 0.4rem;
    inline-size: 80%;
    border-radius: var(--radius-pill);
    background-color: var(--border-strong);

    &--short {
      inline-size: 55%;
    }
  }

  &__mini-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;

    span {
      block-size: 1.5rem;
      border-radius: var(--radius-sm);
      background-color: var(--surface-raised);
    }
  }

  &__mini-phone {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    inline-size: 7.5rem;
    padding: 1.4rem 0.6rem 2.4rem;
    border: 2px solid var(--border-strong);
    border-radius: 1.4rem;
    background-color: var(--surface);
  }

  &__mini-notch {
    position: absolute;
    inset-block-start: 0.45rem;
    inset-inline: 35%;
    block-size: 0.3rem;
    border-radius: var(--radius-pill);
    background-color: var(--border-strong);
  }

  &__mini-row {
    block-size: 1.2rem;
    border-radius: var(--radius-sm);
    background-color: var(--surface-raised);
  }

  &__mini-fab {
    position: absolute;
    inset-block-end: 0.55rem;
    inset-inline-start: 0.6rem;
    inline-size: 1.4rem;
    block-size: 1.4rem;
    border-radius: 50%;
    background-color: var(--accent);
  }

  &__mini-ledger {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    inline-size: min(80%, 14rem);
  }

  &__mini-entry,
  &__mini-total {
    display: flex;
    justify-content: space-between;
    gap: 1rem;

    span {
      block-size: 0.45rem;
      border-radius: var(--radius-pill);
      background-color: var(--border-strong);

      &:first-child {
        inline-size: 55%;
      }

      &:last-child {
        inline-size: 22%;
      }
    }
  }

  &__mini-total {
    margin-block-start: 0.3rem;
    padding-block-start: 0.5rem;
    border-block-start: 1px dashed var(--border-strong);

    span:last-child {
      block-size: 0.6rem;
      background-color: var(--accent);
    }
  }

  &__mini-terminal {
    margin: 0;
    padding: 0.8rem 1rem;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    background-color: var(--surface);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    line-height: 1.7;
    text-align: left;
    color: var(--text-muted);
  }

  &__mini-ok {
    color: var(--accent);
  }

  &__mini-live {
    color: var(--accent);
    text-shadow: 0 0 8px var(--accent);
  }

  &__mini-sketch {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  &__mini-idea {
    inline-size: 3.5rem;
    block-size: 3.5rem;
    border: 2px dashed var(--border-strong);
    border-radius: 50%;
  }

  // A decorative bar, so it leans.
  &__mini-arrow {
    inline-size: 3rem;
    block-size: 4px;
    border-radius: var(--radius-pill);
    background-color: var(--border-strong);
    transform: $lean;
  }

  &__mini-built {
    position: relative;
    inline-size: 5rem;
    block-size: 3.5rem;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    background-color: var(--surface-raised);

    &::after {
      content: "";
      position: absolute;
      inset-block-start: -0.4rem;
      inset-inline-end: -0.4rem;
      inline-size: 0.8rem;
      block-size: 0.8rem;
      border-radius: 50%;
      background-color: var(--accent);
      box-shadow: var(--glow-accent);
    }
  }

  // ---------------------------------------------------------------------------
  // Company: an editorial spread — the goal as a pull quote, the facts beside it
  // ---------------------------------------------------------------------------

  &__company {
    position: relative;
    isolation: isolate;
    display: grid;
    gap: var(--space-8);
    margin-block-start: clamp(var(--space-9), 9vw, var(--space-10));
    padding-block: clamp(var(--space-8), 8vw, var(--space-10));
    border-block: 1px solid var(--border);
    background-color: var(--surface);

    @media (width >= $wide) {
      grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
      align-items: end;
      column-gap: var(--space-9);
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
    -webkit-text-stroke: 1px var(--border-strong);
    opacity: 0.6;
    translate: 50% -50%; // RTL: inline start is the right edge
    pointer-events: none;
    user-select: none;
  }

  // The goal, set as a pull quote after a leaning lime bar.
  &__quote {
    position: relative;
    margin: var(--space-6) 0 0;
    padding-inline-start: var(--space-6);
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 1.2rem + 2.2vw, 3.25rem);
    font-weight: 700;
    line-height: 1.5;
    text-wrap: balance;

    &::before {
      content: "";
      position: absolute;
      inset-block: 0.3em;
      inset-inline-start: 0;
      inline-size: 5px;
      border-radius: var(--radius-pill);
      background-color: var(--accent);
      transform: $lean;
    }
  }

  // Idea, then launch: figure, node and label rows shared through subgrid, so the bar
  // (the third item, across the first two columns) lines up with both nodes.
  &__years {
    display: grid;
    grid-template-columns: auto minmax(var(--space-7), 1fr) auto;
    grid-template-rows: auto auto auto;
    row-gap: var(--space-3);
    padding: 0;
    list-style: none;
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
    }
  }

  // ---------------------------------------------------------------------------
  // Closing: the lime contact band
  // ---------------------------------------------------------------------------

  &__closing {
    padding-block-end: var(--space-9);
  }

  // Lime from window edge to window edge, glowing, with a quiet pattern of dark points toward the
  // window edge. From $band-lean it starts on the content edge with the brand lean and its far end
  // runs past the window edge (the page clips it).
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

  &__band-pattern {
    position: absolute;
    inset: 0;
    z-index: -1;
    background-image: radial-gradient(
      circle,
      color-mix(in srgb, var(--on-accent) 22%, transparent) 1.4px,
      transparent 1.8px
    );
    background-size: 20px 20px;
    mask-image: linear-gradient(to right, black, transparent 55%);
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
