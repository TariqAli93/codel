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

// The hero shows one real screen of each of the first two products: the first product's second
// screenshot (its home screen) behind, the second product's first screenshot in front.
const [heroBack, heroFront] = solutions;
const heroBackShot = heroBack?.images[1] ?? heroBack?.images[0];
const heroFrontShot = heroFront?.images[0];

// The hero's screens are the page's largest paint. Each is drawn twice (finished and as a plan,
// one request per file), and the plan copy comes first in the page, so ask for both files early
// and at high priority instead of letting the plan's request set the pace.
const heroShots = [heroBackShot, heroFrontShot].filter(
  (shot): shot is SolutionImage => shot !== undefined,
);
useHead({
  link: heroShots.map((shot) => ({
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
// server render and hydration never see it. The hero's entrance is plain CSS and needs none of it:
// its content is on screen within half a second whatever the network does.
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

  const hero = root.querySelector<HTMLElement>(".home__hero");
  const heroText = root.querySelector<HTMLElement>(".home__hero-text");
  const shortcuts = root.querySelector<HTMLElement>(".home__shortcuts");
  const stage = root.querySelector<HTMLElement>(".home__stage");
  const shipped = root.querySelector<HTMLElement>(".home__shipped");
  // The two pieces that read the seam's live values (see @property in the styles).
  const seamParts = all(".home__shipped, .home__shipped-view");

  // The brand lean, read from the stylesheet so the wipes below lean with everything else.
  const slant =
    (parseFloat(getComputedStyle(root).getPropertyValue("--slant-angle")) ||
      10) *
    (Math.PI / 180);

  // The seam's entrance sweep is plain CSS. Scroll and pointer take the seam over only once it
  // has finished (or after 1.6s at most), so the two never pull at it together.
  const sweepDone = () => {
    const running = (shipped?.getAnimations() ?? []).map((animation) =>
      animation.finished.catch(() => undefined),
    );
    if (!running.length) return Promise.resolve();
    return Promise.race([
      Promise.all(running),
      new Promise((resolve) => setTimeout(resolve, 1600)),
    ]);
  };

  const context = gsap.context(() => {
    const media = gsap.matchMedia();

    // Hero: as the page scrolls on, the seam sweeps on past the window edge (every product is
    // finished by the time "حلولنا الجاهزة" arrives), and the text and the two screens drift apart
    // by depth. Both copies of a screen always move together. Half the drift on phones.
    media.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        tablet: "(min-width: 46rem)",
        split: "(min-width: 60rem)",
      },
      (self) => {
        const conditions: gsap.Conditions = self.conditions ?? {};
        const { motion, tablet, split } = conditions;
        if (!motion || !hero || !heroText || !stage) return;
        const depth = tablet ? 1 : 0.5;
        const drift = () => ({
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        });
        // The text sinks at most into the free space under it (above the shortcuts in two
        // columns, above the stage in one), so it never runs into either.
        const below = split && shortcuts ? shortcuts : stage;
        const room = () =>
          below.offsetTop - (heroText.offsetTop + heroText.offsetHeight) - 8;
        gsap.to(heroText, {
          y: () => Math.max(0, Math.min(56 * depth, room())),
          ease: "none",
          scrollTrigger: drift(),
        });
        gsap.to(all(".home__layer--back", stage), {
          yPercent: -10 * depth,
          ease: "none",
          scrollTrigger: drift(),
        });
        gsap.to(all(".home__layer--front", stage), {
          yPercent: -24 * depth,
          ease: "none",
          scrollTrigger: drift(),
        });

        // In two columns the seam leaves as the hero scrolls away; in one column the stage sits
        // below the text, so the seam waits until the stage itself is in view.
        const build = split
          ? { trigger: hero, start: "top top", end: "bottom 60%" }
          : { trigger: stage, start: "center 55%", end: "bottom top" };
        let live = true;
        void sweepDone().then(() => {
          if (!live || !seamParts.length) return;
          self.add(() => {
            gsap.fromTo(
              seamParts,
              { "--seam-scroll": 0 },
              {
                "--seam-scroll": 1,
                ease: "none",
                scrollTrigger: { ...build, scrub: 0.6 },
              },
            );
          });
        });
        return () => {
          live = false;
        };
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

      // Products: the main screen is wiped in from the reading start behind a leaning edge, like
      // the hero's seam; the second screen slides in over it, then the text follows. While the
      // product passes, the screens drift apart.
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

    // Pointer: the hero's screens follow the pointer a little, by depth (both copies of a screen
    // together), and over the stage the seam leans toward it; product screens tilt.
    media.add(
      "(prefers-reduced-motion: no-preference) and (hover: hover)",
      () => {
        const detach: Array<() => void> = [];
        if (stage && hero) {
          const follow = (selector: string, rangeX: number, rangeY: number) => {
            const targets = all(selector, stage);
            const motion = { duration: 0.8, ease: "power3.out" };
            return {
              rangeX,
              rangeY,
              x: gsap.quickTo(targets, "x", motion),
              y: gsap.quickTo(targets, "y", motion),
            };
          };
          const layers = [
            follow(".home__layer--back", 8, 5),
            follow(".home__layer--front", 16, 10),
          ];

          // The seam's lean toward the pointer, eased through a plain value into --seam-drift.
          const seam = { drift: 0 };
          const toDrift = gsap.quickTo(seam, "drift", {
            duration: 1,
            ease: "power3.out",
            onUpdate: () => {
              for (const part of seamParts)
                part.style.setProperty("--seam-drift", seam.drift.toFixed(4));
            },
          });

          // Measured on entry and on resize, never on every move. Tops are kept relative to the
          // page, so they stay right while the page scrolls under a still pointer.
          let heroBox = { left: 0, top: 0, width: 1, height: 1 };
          let stageBox = { left: 0, top: 0, right: 0, bottom: 0, width: 1 };
          let rest = 0.6;
          let seamFree = false;
          void sweepDone().then(() => {
            seamFree = true;
          });
          const measure = () => {
            const h = hero.getBoundingClientRect();
            const s = stage.getBoundingClientRect();
            heroBox = {
              left: h.left,
              top: h.top + window.scrollY,
              width: Math.max(h.width, 1),
              height: Math.max(h.height, 1),
            };
            stageBox = {
              left: s.left,
              top: s.top + window.scrollY,
              right: s.right,
              bottom: s.bottom + window.scrollY,
              width: Math.max(s.width, 1),
            };
            rest =
              parseFloat(
                getComputedStyle(stage).getPropertyValue("--seam-rest"),
              ) || rest;
          };
          const move = (event: PointerEvent) => {
            if (event.pointerType === "touch") return;
            const x = event.clientX;
            const y = event.clientY + window.scrollY;
            const dx = (x - heroBox.left) / heroBox.width - 0.5;
            const dy = (y - heroBox.top) / heroBox.height - 0.5;
            for (const layer of layers) {
              layer.x(dx * 2 * layer.rangeX);
              layer.y(dy * 2 * layer.rangeY);
            }
            const over =
              x >= stageBox.left &&
              x <= stageBox.right &&
              y >= stageBox.top &&
              y <= stageBox.bottom;
            if (!seamFree) return;
            // The pointer's share of the stage from its start edge: the right edge (RTL only).
            const share = (stageBox.right - x) / stageBox.width;
            toDrift(
              over ? gsap.utils.clamp(-0.06, 0.06, 0.4 * (share - rest)) : 0,
            );
          };
          const leave = () => {
            for (const layer of layers) {
              layer.x(0);
              layer.y(0);
            }
            toDrift(0);
          };
          measure();
          hero.addEventListener("pointerenter", measure);
          hero.addEventListener("pointermove", move);
          hero.addEventListener("pointerleave", leave);
          window.addEventListener("resize", measure);
          detach.push(() => {
            hero.removeEventListener("pointerenter", measure);
            hero.removeEventListener("pointermove", move);
            hero.removeEventListener("pointerleave", leave);
            window.removeEventListener("resize", measure);
            for (const part of seamParts)
              part.style.removeProperty("--seam-drift");
          });
        }
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
  // Scrubbed motion (the hero's seam and drift, the parallax) follows the scroll position and has
  // no end state to jump to, so it is left alone.
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
      <div class="home__hero-text">
        <p class="home__kicker">
          <span class="home__kicker-bar" aria-hidden="true" />
          شركة برمجيات عراقية في {{ company.addressParts.city }}
        </p>
        <!-- The lines kept on one line: the spaces keep the words apart when read aloud. -->
        <h1 id="home-title" class="home__title">
          <span class="home__title-line">برامج جاهزة،</span>
          <span class="home__title-line"
            >وبرمجيات <span class="home__title-mark">على مقاسك.</span></span
          >
        </h1>
        <p class="home__lede">
          نبيع برامج جاهزة بأسعار معلنة، ونصمّم ونبرمج المواقع والتطبيقات
          والأنظمة حسب طلبك.
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

      <!-- Real screens of the products; decorative here, described in the products below. A
           leaning seam cuts them: finished on the start side, drawn as a plan past it. -->
      <div class="home__stage" aria-hidden="true">
        <div class="home__plan">
          <div
            v-if="heroBack && heroBackShot"
            class="home__layer home__layer--back"
            :class="`home__layer--${productLook[heroBack.slug] ?? 'violet'}`"
            data-depth="0.5"
          >
            <ProductWindow v-bind="heroBackShot" alt="" plan />
          </div>
          <div
            v-if="heroFront && heroFrontShot"
            class="home__layer home__layer--front"
            :class="`home__layer--${productLook[heroFront.slug] ?? 'violet'}`"
            data-depth="1"
          >
            <ProductWindow v-bind="heroFrontShot" alt="" plan />
          </div>
        </div>
        <div class="home__shipped">
          <div class="home__shipped-view">
            <div
              v-if="heroBack && heroBackShot"
              class="home__layer home__layer--back"
              :class="`home__layer--${productLook[heroBack.slug] ?? 'violet'}`"
              data-depth="0.5"
            >
              <ProductWindow
                v-bind="heroBackShot"
                alt=""
                :title="heroBack.nameAr"
                eager
              />
              <p class="home__tag">
                <span class="home__tag-text"
                  ><span dir="ltr">{{ price(heroBack.priceIqd) }}</span>
                  دينار</span
                >
              </p>
            </div>
            <div
              v-if="heroFront && heroFrontShot"
              class="home__layer home__layer--front"
              :class="`home__layer--${productLook[heroFront.slug] ?? 'violet'}`"
              data-depth="1"
            >
              <ProductWindow
                v-bind="heroFrontShot"
                alt=""
                :title="heroFront.nameAr"
                eager
              />
              <p class="home__tag">
                <span class="home__tag-text"
                  ><span dir="ltr">{{ price(heroFront.priceIqd) }}</span>
                  دينار</span
                >
              </p>
            </div>
          </div>
        </div>
      </div>

      <ul role="list" class="home__shortcuts" aria-label="برامجنا الجاهزة">
        <li v-for="solution in solutions" :key="solution.slug">
          <NuxtLink
            class="home__shortcut"
            :class="`home__shortcut--${productLook[solution.slug] ?? 'violet'}`"
            :to="`/solutions/${solution.slug}`"
          >
            <!-- Kept on one line: the space keeps name and tagline apart when read aloud. -->
            <span class="home__shortcut-name">{{ solution.nameAr }}</span>
            <span class="home__shortcut-tagline">{{ solution.tagline }}</span>
          </NuxtLink>
        </li>
      </ul>
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
// tips the layout; named, because the stage is a container too): one column on phones (text,
// stage, shortcuts); from $hero-tablet a wider stage that runs off the end edge; from $hero-split
// two columns, the stage running the hero's full height to the window edge; from $hero-wide the
// text column is wide enough for the shortcuts side by side; from $hero-max the screens stop
// growing and the extra width stays empty.
$hero-tablet: 46rem;
$hero-split: 60rem;
$hero-wide: 80rem;
$hero-max: 110rem;

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
  // Hero: the offer, and the products' screens cut by the leaning seam
  // ---------------------------------------------------------------------------

  // --hero-col is the text column (a cqi length on the page's width): the headline is sized to it.
  &__hero {
    --hero-col: calc(100cqi - 2 * #{$edge});
    --hero-gap: var(--space-6);

    position: relative;
    isolation: isolate;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    row-gap: var(--hero-gap);
    padding-block: clamp(var(--space-5), 5vw, var(--space-8)) var(--space-6);
    padding-inline: $edge;
    border-block-end: 1px solid var(--border);

    @container home (width >= #{$hero-tablet}) {
      --hero-col: min(100cqi - 2 * #{$edge}, 34rem);
      --hero-gap: var(--space-7);
    }

    // Two columns: the text on the start side, the stage the hero's full height beside it, running
    // to the window edge; the shortcuts at the foot of the text column.
    @container home (width >= #{$hero-split}) {
      --hero-col: clamp(22rem, 42cqi, 34rem);
      --hero-gap: clamp(var(--space-6), 4cqi, var(--space-8));

      grid-template-columns: var(--hero-col) minmax(0, 1fr);
      grid-template-rows: minmax(0, 1fr) auto;
      grid-template-areas:
        "text stage"
        "short stage";
      column-gap: var(--hero-gap);
      row-gap: 0;
      min-block-size: min(calc(100svh - var(--header-height)), 60rem);
      padding-block: 0;
      padding-inline: $edge 0;
    }
  }

  &__hero-text {
    position: relative;
    z-index: 2;
    max-inline-size: var(--hero-col);

    @container home (width >= #{$hero-split}) {
      grid-area: text;
      align-self: start;
      padding-block-start: clamp(var(--space-7), 5cqi, var(--space-9));
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

  // A decorative bar, so it leans. Quiet: the seam is the hero's lime line.
  &__kicker-bar {
    flex: none;
    inline-size: var(--space-6);
    block-size: 4px;
    border-radius: var(--radius-pill);
    background-color: var(--border-strong);
    transform: $lean;
  }

  // Three lines, each a step further in so their start edges lean like the seam (the letters
  // stay upright): "برامج جاهزة،", then "وبرمجيات" quieter, then "على مقاسك." measured.
  &__title {
    --title-step: calc(tan(var(--slant-angle)) * 1.3em);

    margin: 0;
    font-size: min(var(--text-hero), var(--hero-col) / 6.2);
    line-height: 1.3;
    font-weight: 800;
  }

  &__title-line {
    --write-lean: calc(tan(var(--slant-angle)) * 1.95em);

    display: block;
    inline-size: fit-content;

    & + & {
      // This line also holds the third (the mark), so its reveal edge spans two lines.
      --write-lean: calc(tan(var(--slant-angle)) * 3.9em);

      padding-inline-start: var(--title-step);
      font-weight: 600;
      color: var(--text-muted);
    }
  }

  // The half that answers "made for you", measured by a dimension line: a lime bar under the
  // words with a leaning tick at each end, clear of the letters' tails.
  &__title-mark {
    --write-lean: calc(tan(var(--slant-angle)) * 1.95em);
    --measure-stroke: max(var(--stroke), 0.035em);
    --measure-y: 0.01em;

    position: relative;
    display: block;
    inline-size: fit-content;
    margin-inline-start: var(--title-step);
    font-weight: 800;
    color: var(--text);
    white-space: nowrap;

    &::before,
    &::after {
      content: "";
      position: absolute;
      inset-inline: 0;
    }

    &::before {
      inset-block-end: var(--measure-y);
      block-size: var(--measure-stroke);
      background-color: var(--accent);
      // Drawn from the inline start, which is the right edge (the site is RTL only).
      transform-origin: right center;
    }

    // Two ticks: a box with only its inline borders, leaning, centred on the bar.
    &::after {
      inset-block-end: calc(
        var(--measure-y) + var(--measure-stroke) / 2 - 0.15em
      );
      block-size: 0.3em;
      border-inline: var(--measure-stroke) solid var(--accent);
      transform: $lean;
    }
  }

  &__lede {
    max-inline-size: 30rem;
    margin-block-start: var(--space-5);
    font-size: var(--text-lead);
    line-height: 1.9;
    color: var(--text-muted);
  }

  &__hero-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4);
    margin-block-start: var(--space-6);
  }

  // Straight to a product: its name and what it does, after a point in the product's colour.
  &__shortcuts {
    position: relative;
    z-index: 2;
    display: grid;
    gap: var(--space-2) var(--space-6);
    max-inline-size: 34rem;
    margin: 0;
    padding: var(--space-4) 0 0;
    border-block-start: 1px solid var(--border);
    list-style: none;

    @media (width >= $medium) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    // At the foot of the text column; one product a row until the column is wide enough for two.
    @container home (width >= #{$hero-split}) {
      grid-area: short;
      align-self: end;
      grid-template-columns: minmax(0, 1fr);
      margin-block: var(--space-6);
    }

    @container home (width >= #{$hero-wide}) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__shortcut {
    --shortcut-colour: var(--nuqta-accent);

    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    column-gap: var(--space-3);
    min-block-size: 44px;
    padding-block: var(--space-2);
    text-decoration: none;
    color: var(--text);

    &--sand {
      --shortcut-colour: var(--dalaly-accent);
    }

    &::before {
      content: "";
      grid-row: 1 / 3;
      inline-size: var(--point-md);
      block-size: var(--point-md);
      border-radius: 50%;
      background-color: var(--shortcut-colour);
    }

    // Forward is to the left in RTL.
    &::after {
      content: "←" / "";
      grid-column: 3;
      grid-row: 1 / 3;
      color: var(--text-muted);
      transition:
        translate var(--duration-base) var(--ease-out),
        color var(--duration-fast) var(--ease-out);
    }

    @media (hover: hover) {
      &:hover::after {
        color: var(--text);
        translate: -0.3rem 0;
      }

      &:hover .home__shortcut-name {
        text-decoration: underline;
        text-decoration-color: var(--shortcut-colour);
        text-underline-offset: 0.3em;
      }
    }
  }

  &__shortcut-name {
    font-weight: 700;
    line-height: 1.5;
  }

  &__shortcut-tagline {
    grid-column: 2;
    font-size: var(--text-small);
    line-height: 1.6;
    color: var(--text-muted);
  }

  // The stage: the plan (the screens as lime line drawings on an engineering grid) under the
  // shipped side (the same screens, finished), which a leaning seam cuts. --seam-rest is the
  // shipped share at rest, from the stage's start edge; scroll (--seam-scroll, 0 to 1) carries the
  // seam past the window edge and the pointer leans it a little (--seam-drift). Both are written by
  // GSAP on the shipped box and its view; without it the seam simply rests. All sizes come from
  // the stage, so nothing shifts.
  &__stage {
    --seam-rest: 0.64;
    --grid-major: color-mix(in srgb, var(--border) 80%, transparent);
    --grid-minor: color-mix(in srgb, var(--border) 35%, transparent);

    position: relative;
    z-index: 1;
    overflow: clip;
    container: stage / inline-size;
    justify-self: stretch;
    aspect-ratio: 1.05;
    margin-inline: calc(-1 * #{$edge});

    @container home (width >= #{$hero-tablet}) {
      --seam-rest: 0.6;

      aspect-ratio: 1.5;
      margin-inline: 0 calc(-1 * #{$edge});
    }

    // The full height of the hero, from half-way across the gap to the window edge.
    @container home (width >= #{$hero-split}) {
      grid-area: stage;
      align-self: stretch;
      aspect-ratio: auto;
      margin-inline: calc(-0.5 * var(--hero-gap)) 0;
    }
  }

  &__plan {
    position: absolute;
    inset: 0;

    // The drawing board, fading out at the top and toward the next section.
    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(var(--grid-major) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid-major) 1px, transparent 1px),
        linear-gradient(var(--grid-minor) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid-minor) 1px, transparent 1px);
      background-size:
        56px 56px,
        56px 56px,
        14px 14px,
        14px 14px;
      mask-image: linear-gradient(
        transparent,
        black 14%,
        black 62%,
        transparent
      );
    }

    // The front drawing is a sheet over the back one: its ground hides the lines behind it.
    .home__layer--front .window {
      background-color: color-mix(in srgb, var(--bg) 88%, transparent);
    }
  }

  // The finished side: a box from the seam to well past the stage's start edge (so its leaning
  // start edge never uncovers the plan next to the text), leaning like the buttons. Its view leans
  // back and moves back by exactly as much, so the screens inside stay still while the cut moves.
  &__shipped,
  &__shipped-view {
    --shipped: calc(
      var(--seam-rest) + (1.15 - var(--seam-rest)) * var(--seam-scroll, 0) +
        var(--seam-drift, 0) * (1 - var(--seam-scroll, 0))
    );
  }

  &__shipped {
    --overshoot: 60cqi;

    position: absolute;
    z-index: 1;
    inset-block: 0;
    inset-inline-start: calc(-1 * var(--overshoot));
    overflow: hidden;
    inline-size: calc(100cqi + var(--overshoot));
    clip-path: inset(0);
    transform: $lean;
    // Physical x (the site is RTL only): the box's left edge is the seam, (1 - shipped) of the
    // stage from its left edge, so a larger share moves it toward the window edge.
    translate: calc((1 - var(--shipped)) * 100cqi) 0;

    // The seam: lime, leaning with the box, its ends fading out. Not a control.
    &::after {
      content: "";
      position: absolute;
      inset-block: 0;
      inset-inline-end: 0;
      inline-size: var(--stroke);
      background-color: var(--accent);
      mask-image: linear-gradient(
        transparent 3%,
        black 18%,
        black 85%,
        transparent
      );

      @container home (width >= #{$hero-split}) {
        inline-size: calc(var(--stroke) * 1.5);
      }
    }
  }

  // Exactly over the stage box, on the page's own ground.
  &__shipped-view {
    position: absolute;
    inset-block: 0;
    inset-inline-end: 0;
    inline-size: 100cqi;
    background-color: var(--bg);
    transform: $upright;
    translate: calc((var(--shipped) - 1) * 100cqi) 0;
  }

  // One screen of each product, placed the same in the plan and on the shipped side so the cut
  // lines up. Phones: the back screen bleeds off the end edge, the front screen over its lower
  // corner, both cropped to their menus and headings. From $hero-tablet both show whole.
  &__layer {
    position: absolute;

    &--violet {
      --layer-colour: var(--nuqta-accent);
    }

    &--sand {
      --layer-colour: var(--dalaly-accent);
    }

    &--back {
      --window-ratio: 1.3;
      --window-zoom: 1.55;

      inset-block-start: 8%;
      inset-inline-end: -6%;
      inline-size: 92%;

      @container home (width >= #{$hero-tablet}) {
        --window-ratio: auto;
        --window-zoom: 1;

        inset-block-start: 7%;
        inset-inline-end: -2%;
        inline-size: 74%;
      }

      @container home (width >= #{$hero-split}) {
        inset-block-start: 6%;
        inset-inline-end: -22%;
        inline-size: 112%;
      }

      @container home (width >= #{$hero-max}) {
        inline-size: min(112%, 60rem);
      }
    }

    &--front {
      --window-ratio: 1.35;
      --window-zoom: 1.9;

      z-index: 1;
      inset-block-end: 7%;
      inset-inline-start: 4%;
      inline-size: 66%;

      @container home (width >= #{$hero-tablet}) {
        --window-ratio: auto;
        --window-zoom: 1;

        inset-block-end: 6%;
        inset-inline-start: 12%;
        inline-size: 54%;
      }

      @container home (width >= #{$hero-split}) {
        inset-block: 50% auto;
        inset-inline-start: 2%;
        inline-size: 72%;
      }

      @container home (width >= #{$hero-max}) {
        inline-size: min(72%, 40rem);
      }
    }
  }

  // On the shipped side: a ring in the product's colour, shown while its shortcut is pointed at.
  &__shipped-view &__layer::before {
    content: "";
    position: absolute;
    inset: -5px;
    z-index: 1;
    border: 1px solid var(--layer-colour);
    border-radius: calc(var(--radius-lg) + 5px);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--duration-base) var(--ease-out);
  }

  // A price tag at each screen's start-side corner, on the shipped side only: real facts, leaning
  // like every tag, its text upright, after a point in the product's colour.
  &__tag {
    position: absolute;
    z-index: 2;
    inset-inline-start: calc(-1 * var(--space-2));
    margin: 0;
    padding: 0.2rem var(--space-3);
    border-radius: var(--radius-sm);
    background-color: var(--surface-raised);
    font-size: clamp(0.6875rem, 0.62rem + 0.25vw, 0.8125rem);
    font-weight: 700;
    line-height: 1.7;
    white-space: nowrap;
    color: var(--text);
    box-shadow: 0 0.5rem 1rem -0.25rem
      color-mix(in srgb, black 45%, transparent);
    transform: $lean;
    transition: translate var(--duration-base) var(--ease-out);

    // Hung off the frame like a tab, clear of the window's title.
    .home__layer--back & {
      inset-block-end: calc(100% - 0.35rem);
    }

    .home__layer--front & {
      inset-block-start: calc(100% - 0.35rem);
    }
  }

  &__tag-text {
    display: flex;
    align-items: center;
    gap: 0.3em;
    transform: $upright;

    &::before {
      content: "";
      flex: none;
      inline-size: var(--point-sm);
      block-size: var(--point-sm);
      margin-inline-end: 0.2em;
      border-radius: 50%;
      background-color: var(--layer-colour);
    }
  }

  // A shortcut pointed at or focused lights its screen: the ring shows and the tag lifts.
  &__hero:has(.home__shortcut--violet:focus-visible)
    &__shipped-view
    &__layer--violet,
  &__hero:has(.home__shortcut--sand:focus-visible)
    &__shipped-view
    &__layer--sand {
    &::before {
      opacity: 1;
    }

    .home__tag {
      translate: 0 -4px;
    }
  }

  @media (hover: hover) {
    &__hero:has(.home__shortcut--violet:hover) &__shipped-view &__layer--violet,
    &__hero:has(.home__shortcut--sand:hover) &__shipped-view &__layer--sand {
      &::before {
        opacity: 1;
      }

      .home__tag {
        translate: 0 -4px;
      }
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

// The seam's live values: plain numbers that do not inherit. GSAP writes them on the shipped box
// and its view, which compute their own share from them, so a frame restyles those two only.
@property --seam-scroll {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

@property --seam-drift {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

@property --shipped {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

// The hero's entrance: plain CSS, so it starts with the first paint and needs no JavaScript. The
// text arrives first and fast (on screen within half a second); the plan is drawn, then the seam
// sweeps in from the start edge to its rest, finishing the screens as it passes. Every keyframe
// runs toward the resting style, which is what shows without motion or JavaScript.
@media (prefers-reduced-motion: no-preference) {
  .home__kicker {
    animation: home-rise var(--duration-slow) var(--ease-out) backwards;
  }

  // Each line is written in from its start, behind an edge that leans like the seam.
  .home__title-line {
    animation: home-write var(--duration-slow) var(--ease-out) 60ms backwards;

    & + .home__title-line {
      animation-delay: 140ms;
    }
  }

  .home__title-mark {
    animation: home-write var(--duration-slow) var(--ease-out) 220ms backwards;

    &::before {
      animation: home-measure var(--duration-slow) var(--ease-out) 560ms
        backwards;
    }

    &::after {
      animation: home-fade var(--duration-base) var(--ease-out) 880ms backwards;
    }
  }

  .home__lede {
    animation: home-rise var(--duration-slow) var(--ease-out) 200ms backwards;
  }

  .home__hero-actions > * {
    animation: home-forward var(--duration-slow) var(--ease-out) 280ms backwards;

    & + * {
      animation-delay: 360ms;
    }
  }

  .home__shortcuts {
    animation: home-rise var(--duration-slow) var(--ease-out) 440ms backwards;
  }

  // Both copies of a screen settle together, so the cut always lines up. The window settles, not
  // its layer: GSAP moves the layer, and would freeze a running CSS move into its own transform.
  .home__layer > .window {
    animation: home-settle var(--duration-entrance) var(--ease-out) 120ms
      backwards;
  }

  .home__layer--front > .window {
    animation-delay: 200ms;
  }

  // The traced drawings move with scroll and pointer: on their own layers they are traced once,
  // not again on every frame.
  .home__plan .home__layer {
    will-change: transform;
  }

  // The plan is drawn top to bottom, like a plotter.
  .home__plan {
    animation: home-plot var(--duration-slow) var(--ease-in-out) 240ms backwards;
  }

  // The seam sweeps in from the start edge: the box and its view move in mirror image, with the
  // same timing, so the screens stay still while the cut passes over them.
  .home__shipped {
    animation: home-ship var(--duration-entrance) var(--ease-in-out) 700ms
      backwards;

    &::after {
      animation: home-fade var(--duration-base) var(--ease-out) 700ms backwards;
    }
  }

  .home__shipped-view {
    animation: home-ship-view var(--duration-entrance) var(--ease-in-out) 700ms
      backwards;
  }

  // The prices arrive as the seam passes them.
  .home__tag {
    animation: home-tag var(--duration-base) var(--ease-out) 1000ms backwards;

    .home__layer--front & {
      animation-delay: 1180ms;
    }
  }

  // Keyboard focus can get there first: what holds focus is shown at once, never half-faded.
  .home__hero-text > :focus-within,
  .home__hero-actions > :focus-within,
  .home__shortcuts:focus-within {
    animation: none;
  }
}

@keyframes home-rise {
  from {
    opacity: 0;
    translate: 0 0.5rem;
  }
}

// Forward is to the left (RTL): from a little to the right.
@keyframes home-forward {
  from {
    opacity: 0;
    translate: 1.5rem 0;
  }
}

@keyframes home-fade {
  from {
    opacity: 0;
  }
}

// A leaning edge travels from the right (the inline start, RTL only) to past the left; the same
// four points throughout, reaching a quarter beyond the line box so no marks are cut. With
// `backwards` fill nothing is left clipping once it ends.
@keyframes home-write {
  from {
    clip-path: polygon(
      calc(100% + 1em + var(--write-lean)) -25%,
      calc(100% + 3em) -25%,
      calc(100% + 3em) 125%,
      calc(100% + 1em) 125%
    );
  }

  to {
    clip-path: polygon(
      -0.5em -25%,
      calc(100% + 3em) -25%,
      calc(100% + 3em) 125%,
      calc(-0.5em - var(--write-lean)) 125%
    );
  }
}

@keyframes home-measure {
  from {
    scale: 0 1;
  }
}

@keyframes home-settle {
  from {
    opacity: 0;
    translate: 0 1.5rem;
    scale: 0.97;
  }
}

@keyframes home-plot {
  from {
    clip-path: inset(0 0 100% 0);
  }

  to {
    clip-path: inset(0);
  }
}

// From past the start edge (nothing shipped) to the resting share.
@keyframes home-ship {
  from {
    translate: 115cqi 0;
  }
}

@keyframes home-ship-view {
  from {
    translate: -115cqi 0;
  }
}

@keyframes home-tag {
  from {
    opacity: 0;
    translate: 0 0.4rem;
  }
}
</style>
