<script setup lang="ts">
import { company, services } from "~/data/company";
import { solutions } from "~/data/solutions";

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

// The hero shows one real screen of each of the first two products: the last listed screen of the
// first product behind, the first screen of the second in front.
const [heroBack, heroFront] = solutions;
const heroBackShot = heroBack?.images[heroBack.images.length - 1];
const heroFrontShot = heroFront?.images[0];

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
// server render and hydration never see it. The hero's entrance is plain CSS and needs none of it:
// its content is on screen within half a second whatever the network does.
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
  const words = (target: Element) => {
    const split = SplitText.create(target, { type: "words", mask: "words" });
    splits.push(split);
    return split.words;
  };
  const all = (selector: string, scope: Element = root) =>
    gsap.utils.toArray<HTMLElement>(selector, scope);
  const ease = "expo.out";

  const context = gsap.context(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      // The hero's screens drift apart at different speeds as the page scrolls away from them.
      for (const layer of all(".home__layer")) {
        const depth = Number(layer.dataset.depth ?? 1);
        gsap.to(layer, {
          yPercent: -18 * depth,
          ease: "none",
          scrollTrigger: { trigger: ".home__hero", start: "top top", end: "bottom top", scrub: true },
        });
      }

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

      // Products: the main screen opens from the bottom like a shutter, the second screen slides
      // in over it, then the text follows. While the product passes, the screens drift apart.
      for (const product of all(".home__product")) {
        const main = product.querySelector(".home__shot--main");
        const second = product.querySelector(".home__shot--second");
        const show = gsap.timeline({ scrollTrigger: { trigger: product, start: "top 75%", once: true } });
        if (main) show.from(main, { clipPath: "inset(100% 0% 0% 0%)", y: 40, duration: 1.1, ease: "expo.inOut" });
        if (second) show.from(second, { opacity: 0, x: -60, y: 30, duration: 1, ease }, 0.45);
        show.from(all(".home__product-body > *", product), {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease,
          stagger: 0.06,
        }, 0.2);
        if (second) {
          gsap.fromTo(second, { yPercent: 10 }, {
            yPercent: -10,
            ease: "none",
            scrollTrigger: { trigger: product, start: "top bottom", end: "bottom top", scrub: true },
          });
        }
      }

      // Services: the tiles rise in reading order, a row at a time.
      ScrollTrigger.batch(all(".home__tile"), {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.from(batch, { opacity: 0, y: 40, duration: 0.9, ease, stagger: 0.1 }),
      });

      // Company: the city's name drifts behind the quote; the years draw their bar.
      gsap.fromTo(".home__backdrop", { xPercent: -6 }, {
        xPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: ".home__company", start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.timeline({ scrollTrigger: { trigger: ".home__years", start: "top 85%", once: true } })
        .from(".home__year--idea .home__year-node", { scale: 0, duration: 0.4, ease: "back.out(2)" })
        .from(".home__years-bar", { scaleX: 0, transformOrigin: "right center", duration: 0.8, ease: "power2.inOut" })
        .from(".home__year--launch .home__year-node", { scale: 0, duration: 0.4, ease: "back.out(2)" });

      // Contact: the lime band sweeps in from the reading start, then its contents follow.
      const band = root.querySelector(".home__band");
      if (band) {
        gsap.timeline({ scrollTrigger: { trigger: band, start: "top 80%", once: true } })
          .fromTo(band, { clipPath: "inset(-20% -20% -20% 100%)" }, {
            clipPath: "inset(-20% -20% -20% -20%)",
            duration: 1.1,
            ease: "expo.inOut",
            clearProps: "clipPath",
          })
          .from(all(".home__band-content > *", band), {
            opacity: 0,
            y: 20,
            duration: 0.7,
            ease,
            stagger: 0.06,
          }, 0.5);
      }
    });

    // Pointer: the hero's screens lean toward the pointer by depth; product screens tilt.
    media.add("(prefers-reduced-motion: no-preference) and (hover: hover)", () => {
      const detach: Array<() => void> = [];
      const stage = root.querySelector<HTMLElement>(".home__stage");
      const hero = root.querySelector<HTMLElement>(".home__hero");
      if (stage && hero) {
        const layers = all(".home__layer", stage).map((layer) => ({
          depth: Number(layer.dataset.depth ?? 1),
          x: gsap.quickTo(layer, "x", { duration: 0.8, ease: "power3.out" }),
          y: gsap.quickTo(layer, "y", { duration: 0.8, ease: "power3.out" }),
        }));
        const move = (event: PointerEvent) => {
          const box = hero.getBoundingClientRect();
          const dx = (event.clientX - box.left) / box.width - 0.5;
          const dy = (event.clientY - box.top) / box.height - 0.5;
          for (const layer of layers) {
            layer.x(dx * 26 * layer.depth);
            layer.y(dy * 18 * layer.depth);
          }
        };
        hero.addEventListener("pointermove", move);
        detach.push(() => hero.removeEventListener("pointermove", move));
      }
      for (const visual of all(".home__product-visual")) {
        gsap.set(visual, { transformPerspective: 1400 });
        const tiltX = gsap.quickTo(visual, "rotationX", { duration: 0.7, ease: "power3.out" });
        const tiltY = gsap.quickTo(visual, "rotationY", { duration: 0.7, ease: "power3.out" });
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
    });
  }, root);

  // Keyboard focus can reach an element before its reveal has run or finished: whatever holds
  // focus jumps to its end state at once, so nothing is ever focused half-faded.
  const onFocus = (event: FocusEvent) => {
    const target = event.target as HTMLElement | null;
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
  };
}
</script>

<template>
  <div ref="page" class="home">
    <section class="home__hero" aria-labelledby="home-title">
      <div class="home__hero-text">
        <p class="home__kicker">
          <span class="home__kicker-bar" aria-hidden="true" />
          شركة برمجيات عراقية في {{ company.addressParts.city }}
        </p>
        <h1 id="home-title" class="home__title">
          <span class="home__title-line">برامج جاهزة،</span>
          <span class="home__title-line">وبرمجيات <span class="home__title-mark">على مقاسك.</span></span>
        </h1>
        <p class="home__lede">
          نبيع برامج جاهزة بأسعار معلنة، ونصمّم ونبرمج المواقع والتطبيقات والأنظمة حسب طلبك.
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
      </div>

      <!-- Real screens of the products, layered; decorative here, described in the products below. -->
      <div class="home__stage" aria-hidden="true">
        <div v-if="heroBack && heroBackShot" class="home__layer home__layer--back" data-depth="0.6">
          <ProductWindow v-bind="heroBackShot" alt="" :title="heroBack.nameAr" eager />
          <p class="home__tag home__tag--back">
            {{ heroBack.nameAr }} <span dir="ltr">{{ price(heroBack.priceIqd) }}</span> دينار
          </p>
        </div>
        <div v-if="heroFront && heroFrontShot" class="home__layer home__layer--front" data-depth="1">
          <ProductWindow v-bind="heroFrontShot" alt="" :title="heroFront.nameAr" eager />
          <p class="home__tag home__tag--front">
            {{ heroFront.nameAr }} <span dir="ltr">{{ price(heroFront.priceIqd) }}</span> دينار
          </p>
        </div>
        <div class="home__layer home__layer--code" data-depth="1.5">
          <div class="home__code">
            <div class="home__code-bar"><span class="home__code-file" dir="ltr">checkout.ts</span></div>
            <pre class="home__code-body" dir="ltr"><code><span class="home__code-k">export async function</span> <span class="home__code-f">checkout</span>(cart) {
  <span class="home__code-k">const</span> invoice = <span class="home__code-k">await</span> invoices.<span class="home__code-f">create</span>(cart)
  <span class="home__code-k">await</span> stock.<span class="home__code-f">move</span>(cart.items)
  <span class="home__code-k">return</span> <span class="home__code-f">print</span>(invoice)
}</code></pre>
          </div>
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

      <article
        v-for="solution in solutions"
        :key="solution.slug"
        class="home__product"
        :class="`home__product--${productLook[solution.slug] ?? 'violet'}`"
        :data-theme="productLook[solution.slug] === 'sand' ? 'light' : undefined"
        :aria-labelledby="`product-${solution.slug}`"
      >
        <div class="home__product-body">
          <p class="home__chip">
            <span class="home__chip-text">يعمل على {{ solution.platform }}</span>
          </p>
          <h3 :id="`product-${solution.slug}`" class="home__name">
            {{ solution.nameAr }}
            <span class="home__latin" dir="ltr">{{ solution.nameEn }}</span>
          </h3>
          <p class="home__tagline">{{ solution.tagline }}</p>
          <p class="home__desc">{{ solution.description }}</p>
          <ul role="list" class="home__features">
            <li v-for="feature in solution.features.slice(0, 4)" :key="feature">{{ feature }}</li>
          </ul>
          <p class="home__price">
            <span class="home__price-figure">{{ price(solution.priceIqd) }}</span>
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
            <NuxtLink class="home__link" to="/services">تفاصيل الخدمات</NuxtLink>
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
            <div v-else-if="serviceArt[index] === 'mobile'" class="home__mini-phone">
              <span class="home__mini-notch" />
              <span v-for="row in 5" :key="row" class="home__mini-row" />
              <span class="home__mini-fab" />
            </div>
            <div v-else-if="serviceArt[index] === 'ledger'" class="home__mini-ledger" dir="ltr">
              <span v-for="row in 4" :key="row" class="home__mini-entry"><span /><span /></span>
              <span class="home__mini-total"><span /><span /></span>
            </div>
            <pre v-else-if="serviceArt[index] === 'server'" class="home__mini-terminal" dir="ltr"><span class="home__mini-ok">$</span> deploy --production
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
      <p class="home__backdrop" aria-hidden="true">{{ company.addressParts.city }}</p>
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

$medium: 48em;
$wide: 64em;
// From here the contact band starts on the content edge with the brand lean.
$band-lean: 80em;

.home {
  container-type: inline-size;
  overflow-x: clip;

  // ---------------------------------------------------------------------------
  // Shared pieces
  // ---------------------------------------------------------------------------

  &__section {
    padding-inline: $edge;
    padding-block-start: clamp(var(--space-9), 9vw, var(--space-10));
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
  // Hero: the offer on one side, real screens of the products on the other
  // ---------------------------------------------------------------------------

  &__hero {
    position: relative;
    isolation: isolate;
    display: grid;
    gap: var(--space-8);
    align-items: center;
    padding: clamp(var(--space-7), 6vw, var(--space-9)) $edge clamp(var(--space-8), 7vw, var(--space-10));

    // An engineering grid behind the screens, fading out toward the text.
    &::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
      background-image:
        linear-gradient(color-mix(in srgb, var(--border) 70%, transparent) 1px, transparent 1px),
        linear-gradient(90deg, color-mix(in srgb, var(--border) 70%, transparent) 1px, transparent 1px);
      background-size: 56px 56px;
      mask-image: radial-gradient(ellipse 60% 70% at 25% 50%, black, transparent 75%);
      pointer-events: none;
    }

    @media (width >= $wide) {
      grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
      gap: clamp(var(--space-6), 4vw, var(--space-9));
      min-block-size: min(calc(100svh - var(--header-height)), 54rem);
    }
  }

  &__hero-text {
    position: relative;
    z-index: 2;
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
    background-color: var(--accent);
    transform: $lean;
  }

  &__title {
    margin: 0;
    font-size: clamp(2.25rem, 1.3rem + 3.4vw, 4.25rem);
    line-height: 1.25;
    font-weight: 800;
  }

  &__title-line {
    display: block;
    text-wrap: balance;
  }

  // The half that answers "made for you", set off by a leaning lime underline.
  &__title-mark {
    position: relative;
    z-index: 0;
    white-space: nowrap;

    &::after {
      content: "";
      position: absolute;
      inset-inline: 0.05em;
      inset-block-end: 0.02em;
      z-index: -1;
      block-size: 0.18em;
      border-radius: var(--radius-pill);
      background-color: var(--accent);
      opacity: 0.85;
      transform: $lean;
    }
  }

  &__lede {
    max-inline-size: 30rem;
    margin-block-start: var(--space-5);
    font-size: var(--text-lead);
    line-height: 1.85;
    color: var(--text-muted);
  }

  &__hero-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4);
    margin-block-start: var(--space-7);
  }

  // The screens: positioned on a fixed-ratio stage, so the composition holds at every width.
  &__stage {
    position: relative;
    aspect-ratio: 1.12;
    margin-inline-end: calc(-0.35 * #{$edge});

    @media (width >= $wide) {
      margin-inline-end: calc(-1 * #{$edge} + var(--space-4));
    }
  }

  &__layer {
    position: absolute;

    &--back {
      inset-block-start: 0;
      inset-inline-end: 0;
      inline-size: 88%;
    }

    &--front {
      z-index: 1;
      inset-block-end: 9%;
      inset-inline-start: 0;
      inline-size: 66%;
    }

    &--code {
      z-index: 2;
      inset-block-end: 0;
      inset-inline-end: 2%;
      inline-size: 54%;

      // On small phones the code would cover the screens; the screens carry the hero there.
      @media (width < 30em) {
        display: none;
      }
    }
  }

  // A price tag on each screen: real facts, leaning like every tag.
  &__tag {
    position: absolute;
    z-index: 3;
    display: inline-flex;
    gap: 0.3em;
    margin: 0;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-sm);
    font-size: clamp(0.6875rem, 0.6rem + 0.3vw, 0.875rem);
    font-weight: 700;
    line-height: 1.7;
    white-space: nowrap;
    transform: $lean;

    &--back {
      inset-block-start: -0.9rem;
      inset-inline-end: 14%;
      background-color: var(--nuqta-accent);
      color: var(--white);
    }

    &--front {
      inset-block-end: -0.9rem;
      inset-inline-start: 10%;
      background-color: var(--dalaly-ground);
      color: var(--dalaly-ink);
    }
  }

  // The code window: a few lines of the kind of code behind a checkout.
  &__code {
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
    border-radius: var(--radius-lg);
    background-color: var(--bg);
    box-shadow: 0 1.5rem 3rem -1rem color-mix(in srgb, black 60%, transparent);
  }

  &__code-bar {
    display: flex;
    align-items: center;
    block-size: 1.75rem;
    padding-inline: var(--space-3);
    border-block-end: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
    background-color: var(--surface);
  }

  &__code-file {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
  }

  &__code-body {
    margin: 0;
    padding: var(--space-3) var(--space-4);
    overflow: hidden;
    font-family: var(--font-mono);
    font-size: clamp(0.4375rem, 0.25rem + 0.55vw, 0.75rem);
    line-height: 1.75;
    text-align: left;
    white-space: pre;
    color: var(--text);
  }

  &__code-k {
    color: var(--nuqta-accent);
  }

  &__code-f {
    color: var(--accent);
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
        radial-gradient(ellipse 70% 80% at 15% 50%, color-mix(in srgb, var(--nuqta-accent) 26%, transparent), transparent 70%),
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
      margin-inline-end: calc(-1 * clamp(var(--space-6), 5vw, var(--space-9)) - var(--space-6));
    }

    .home__product--sand & {
      @media (width >= $wide) {
        margin-inline: calc(-1 * clamp(var(--space-6), 5vw, var(--space-9)) - var(--space-6)) 0;
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
        linear-gradient(135deg, color-mix(in srgb, var(--accent) 10%, transparent), transparent 55%),
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
    background-image: radial-gradient(circle, var(--border) 1px, transparent 1.4px);
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

// The hero's entrance: plain CSS, so it starts with the first paint. The text arrives first and
// fast; the screens settle in behind it.
@media (prefers-reduced-motion: no-preference) {
  .home__hero-text > * {
    animation: home-rise 0.7s var(--ease-out) both;

    @for $i from 2 through 5 {
      &:nth-child(#{$i}) {
        animation-delay: #{($i - 1) * 0.07}s;
      }
    }
  }

  .home__title-mark::after {
    animation: home-draw 0.8s var(--ease-out) 0.45s both;
  }

  .home__layer {
    animation: home-settle 1.1s var(--ease-out) both;

    &--back {
      animation-delay: 0.1s;
    }

    &--front {
      animation-delay: 0.25s;
    }

    &--code {
      animation-delay: 0.4s;
    }
  }
}

@keyframes home-rise {
  from {
    opacity: 0;
    translate: 0 1rem;
  }
}

@keyframes home-settle {
  from {
    opacity: 0;
    scale: 0.96;
    translate: 0 2rem;
  }
}

@keyframes home-draw {
  from {
    scale: 0 1;
  }
}
</style>
