<script setup lang="ts">
import { company, services } from "~/data/company";
import { solutions } from "~/data/solutions";

// The story's stage runs to the window edges, so this page draws its own full-width sections instead
// of the layout's centred column.
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

// The opening is set in its own face (--font-hero, main.scss) and its headline is the page's largest
// paint: ask for the font early, on this page only.
useHead({
  script: [
    { type: "application/ld+json", innerHTML: JSON.stringify(organization) },
  ],
  link: [
    {
      rel: "preload",
      as: "font",
      type: "font/woff2",
      href: "/fonts/NotoSansArabic-Variable.woff2",
      crossorigin: "anonymous",
    },
  ],
});

const routes = [
  {
    title: "أدير متجراً أو شركة",
    text: "المبيعات والمخزون والحسابات",
    to: "/solutions/nuqta-plus",
  },
  {
    title: "أدير مكتباً عقارياً",
    text: "العروض والطلبات والعملاء",
    to: "/solutions/dalaly",
  },
  {
    title: "أحتاج برمجيات خاصة",
    text: "موقع، تطبيق أو نظام حسب الطلب",
    to: "/services",
  },
];

const labels = [
  "المواقع الإلكترونية",
  "تطبيقات الهواتف",
  "أنظمة الحسابات والمخازن",
  "إدارة السيرفرات",
  "برمجيات خاصة",
];
const words = ["مواقع.", "تطبيقات.", "حسابات.", "سيرفرات.", "حسب الطلب."];
// Keep noscript's HTML as one raw-content binding: browsers parse noscript children differently
// when scripting is enabled, so Vue must not hydrate those children as element nodes.
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
const serviceFallbackMarkup = computed(
  () =>
    `<ul>${services
      .map(
        (item) =>
          `<li><a href="/services/${escapeHtml(encodeURIComponent(item.id))}">${escapeHtml(item.title)}</a></li>`,
      )
      .join("")}</ul>`,
);
const activeService = ref(0);
const service = computed(() => services[activeService.value]);
const tablist = ref<HTMLElement | null>(null);
function serviceKey(e: KeyboardEvent, i: number) {
  let next = i;
  if (e.key === "ArrowDown") next = (i + 1) % services.length;
  else if (e.key === "ArrowUp")
    next = (i - 1 + services.length) % services.length;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = services.length - 1;
  else return;
  e.preventDefault();
  activeService.value = next;
  tablist.value?.querySelectorAll("button")[next]?.focus();
}
</script>
<template>
  <div class="visual-character">
    <FoldedFieldHero />
    <section id="discover" class="discovery workline-shell">
      <h2 class="discovery-title">اختار اللي يناسب شغلك</h2>
      <div class="choices">
        <NuxtLink v-for="item in routes" :key="item.to" :to="item.to"
          ><div>
            <strong>{{ item.title }}.</strong><small>{{ item.text }}</small>
          </div>
          <span class="arrow" aria-hidden="true">↖</span></NuxtLink
        >
      </div>
    </section>
    <section class="home-solutions" aria-labelledby="solutions-title">
      <div class="workline-shell section-intro">
        <h2 id="solutions-title">برامج جاهزة.<br />لشغلك اليومي.</h2>
        <div>
          <p>مرّ على تفاصيل الشغل اليومي وشوف شلون كل برنامج يساعدك.</p>
          <ActionLink look="text" to="/solutions" label="كل البرامج ↖" />
        </div>
      </div>
      <div class="workline-shell home-solutions__stack">
        <HomeStackingCard
          v-for="solution in solutions"
          :key="solution.slug"
          :solution="solution"
        />
      </div>
    </section>
    <section
      class="services workline-shell"
      id="services"
      aria-labelledby="services-title"
    >
      <div class="section-intro">
        <h2 id="services-title">مو كل شغل<br />إله برنامج جاهز.</h2>
        <div>
          <p>نطوّر لك الحل اللي يناسب تفاصيل مشروعك.</p>
          <ActionLink look="text" to="/services" label="جميع الخدمات ↖" />
        </div>
      </div>
      <div v-if="service" class="service-wall">
        <div
          ref="tablist"
          class="service-choices"
          role="tablist"
          aria-label="الخدمات"
          aria-orientation="vertical"
        >
          <button
            v-for="(item, i) in services"
            :key="item.id"
            :id="'service-tab-' + i"
            type="button"
            class="service-tab"
            role="tab"
            :aria-selected="i === activeService"
            aria-controls="service-stage"
            :tabindex="i === activeService ? 0 : -1"
            @click="activeService = i"
            @keydown="serviceKey($event, i)"
          >
            {{ labels[i] || item.title
            }}<span class="arrow" aria-hidden="true">↖</span>
          </button>
        </div>
        <article
          id="service-stage"
          role="tabpanel"
          :aria-labelledby="'service-tab-' + activeService"
          class="service-stage"
          tabindex="0"
        >
          <div
            :key="service.id"
            class="service-graphic"
            data-scroll-depth="service-art"
            :data-variant="activeService"
            aria-hidden="true"
          >
            <span class="service-word">{{ words[activeService] }}</span>
          </div>
          <div class="service-detail">
            <h3>{{ service.title }}</h3>
            <p>{{ service.text }}</p>
            <div class="service-detail-foot">
              <small>السعر حسب متطلبات المشروع</small
              ><ActionLink
                look="text"
                :to="'/services/' + service.id"
                label="تفاصيل الخدمة ↖"
              />
            </div>
          </div>
        </article>
      </div>
      <noscript v-html="serviceFallbackMarkup"></noscript>
    </section>
    <section class="proof workline-shell">
      <div class="proof-layout">
        <div class="proof-title">
          <h2>قبل لا<br />تبدي.</h2>
          <p>الاختيار والسعر والتواصل. كلّها واضحة.</p>
        </div>
        <div>
          <div class="proof-ledger">
            <div class="ledger-row">
              <h3>أي برنامج يناسبني؟</h3>
              <div>
                <p>للمتاجر والشركات: نقطة بلس.<br />لمكاتب العقارات: دلالي.</p>
                <ActionLink
                  look="text"
                  to="/solutions"
                  label="قارن البرامج ↖"
                />
              </div>
            </div>
            <div class="ledger-row">
              <h3>شكد يكلف؟</h3>
              <div class="ledger-products">
                <NuxtLink
                  v-for="solution in solutions"
                  :key="solution.slug"
                  :to="'/solutions/' + solution.slug"
                  ><span>{{ solution.nameAr }}</span
                  ><ProductPrice :amount="solution.priceIqd" size="inline"
                /></NuxtLink>
                <p>الخدمات حسب متطلبات المشروع.</p>
              </div>
            </div>
            <div class="ledger-row">
              <h3>شلون أتواصل؟</h3>
              <div>
                <p>
                  {{ company.address }}<br />{{ company.hours.days }}،
                  {{ company.hours.time }}
                </p>
                <ActionLink
                  look="text"
                  :to="company.phones.main.whatsapp"
                  new-tab
                  label="واتساب ↖"
                />
              </div>
            </div>
          </div>
          <div class="proof-history">
            <span>رحلة كودل</span
            ><span
              ><bdi>{{ company.founded.idea }}</bdi> بداية الفكرة</span
            ><span
              ><bdi>{{ company.founded.launch }}</bdi> انطلاق الشركة</span
            >
          </div>
        </div>
      </div>
    </section>
    <section class="contact-poster" data-theme="light">
      <div class="workline-shell" data-scroll-depth="contact-band">
        <h2>خلّينا<br />نرتّبها.</h2>
        <div class="contact-actions">
          <p>احچيلنا عن شغلك. نناقش وياك البرنامج أو الحل المناسب.</p>
          <ActionLink
            look="ink"
            to="/contact"
            label="ناقش مشروعك ↖"
          /><ActionLink
            look="text"
            :to="company.phones.main.whatsapp"
            new-tab
            label="راسلنا على واتساب ↖"
          />
        </div>
      </div>
    </section>
  </div>
</template>
<style scoped lang="scss">
/* Directional discovery, not cards. */
.discovery {
  padding-block: clamp(34px, 4.5vw, 72px) var(--section-gap);
}
.discovery-title {
  font: 500 15px/1.6 var(--font-sans);
  color: var(--text-muted);
  margin-bottom: 20px;
}
.choices {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-block: 1px solid var(--border);
}
.choices a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 22px clamp(10px, 2vw, 28px);
  min-height: 100px;
  border-inline-end: 1px solid var(--border);
  transition:
    background 0.3s var(--ease-out),
    color 0.3s var(--ease-out);
}
.choices a:first-child {
  padding-inline-start: 0;
}
.choices a:last-child {
  border-inline-end: 0;
}
.choices a strong {
  display: block;
  font-family: var(--font-hero);
  font-size: clamp(21px, 2vw, 30px);
  line-height: 1.5;
}
.choices a small {
  color: var(--text-muted);
  font-size: 14px;
}
.choices a .arrow {
  font-size: 25px;
  color: var(--accent);
}
.choices a:hover {
  background: var(--surface);
  color: var(--accent);
}
.section-intro {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 0.5fr);
  align-items: end;
  gap: 24px;
  padding-bottom: clamp(24px, 4vw, 56px);
}
.section-intro h2 {
  font-size: clamp(44px, 6.3vw, 100px);
  line-height: 1.25;
}
.section-intro p {
  max-width: 30ch;
  font-size: clamp(17px, 1.4vw, 21px);
  color: var(--text-muted);
  margin-bottom: 12px;
}
.section-intro :deep(.action--text) {
  font-size: 16px;
}
.services {
  padding-block: var(--section-gap);
}
.service-wall {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
  gap: clamp(24px, 5vw, 86px);
  align-items: stretch;
  border-block: 1px solid var(--border);
}
.service-choices {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.service-tab {
  appearance: none;
  border: 0;
  border-bottom: 1px solid var(--border);
  background: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: start;
  color: var(--charcoal-50);
  min-height: 76px;
  padding: 18px 0;
  font-family: var(--font-hero);
  font-size: clamp(21px, 2vw, 34px);
  font-weight: 650;
  line-height: 1.5;
  flex: 1;
}
.service-tab:last-child {
  border-bottom: 0;
}
.service-tab .arrow {
  font-size: 28px;
  color: var(--text-muted);
}
.service-tab[aria-selected="true"] {
  color: var(--accent);
}
.service-tab[aria-selected="true"] .arrow {
  color: var(--accent);
  transform: translate(-4px, -3px);
}
.service-tab:hover {
  color: var(--accent);
}
.service-stage {
  min-width: 0;
  display: grid;
  grid-template-rows: minmax(190px, 1fr) auto;
  gap: 22px;
  padding: 24px 0;
  position: relative;
  overflow: hidden;
}
.service-graphic {
  min-height: clamp(190px, 24vw, 360px);
  display: grid;
  place-items: center;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--surface-raised);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
.service-graphic:before {
  content: "";
  position: absolute;
  inset: -10% 2% -10% auto;
  width: 12%;
  background: var(--accent);
  transform: skewX(-10deg);
  z-index: -1;
}
.service-word {
  font-family: var(--font-hero);
  font-size: clamp(62px, 9.8vw, 160px);
  font-weight: 850;
  line-height: 1.25;
  text-align: center;
  color: var(--charcoal-50);
  position: relative;
  z-index: 1;
  overflow-wrap: anywhere;
  animation: service-word 0.5s var(--ease-out) both;
  text-shadow: 0 3px 20px #10141140;
}
.service-graphic[data-variant="1"]:before {
  width: 43%;
  right: 0;
}
.service-graphic[data-variant="2"]:before {
  width: 100%;
  right: 50%;
}
.service-graphic[data-variant="3"]:before {
  width: 3%;
  right: 3%;
  box-shadow:
    -18px 0 0 var(--accent),
    -36px 0 0 var(--accent);
}
.service-graphic[data-variant="4"]:before {
  width: 12%;
  right: 2%;
}
.service-graphic[data-variant="4"] .service-word {
  font-size: clamp(48px, 6.8vw, 110px);
}
.service-graphic[data-variant="1"] .service-word,
.service-graphic[data-variant="2"] .service-word {
  color: var(--on-accent);
  text-shadow: none;
}
.service-graphic[data-variant="1"],
.service-graphic[data-variant="2"] {
  background: var(--accent);
}
.service-graphic[data-variant="1"]:before,
.service-graphic[data-variant="2"]:before {
  background: var(--charcoal-50);
}
@keyframes service-word {
  from {
    clip-path: inset(100% 0 0 0);
    translate: 0 12px;
  }
  to {
    clip-path: inset(-10%);
    translate: none;
  }
}
.service-detail {
  display: grid;
  gap: 14px;
}
.service-detail h3 {
  font-size: clamp(24px, 2.4vw, 38px);
}
.service-detail p {
  color: var(--text-muted);
  max-width: 52ch;
  font-size: clamp(17px, 1.4vw, 20px);
}
.service-detail-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}
.service-detail-foot small {
  font-size: 14px;
  color: var(--text-muted);
}
/* Evidence: practical editorial ledger. */
.proof {
  padding-block: 0 var(--section-gap);
}
.proof-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr);
  gap: clamp(32px, 5vw, 84px);
  align-items: start;
}
.proof-title h2 {
  font-size: clamp(40px, 5.6vw, 88px);
  line-height: 1.3;
}
.proof-title p {
  font-size: 18px;
  color: var(--text-muted);
  max-width: 29ch;
  margin-top: 16px;
}
.proof-ledger {
  border-top: 1px solid var(--border);
}
.ledger-row {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: 18px;
  padding: 25px 0;
  border-bottom: 1px solid var(--border);
  align-items: start;
}
.ledger-row h3 {
  font-size: clamp(20px, 2vw, 30px);
}
.ledger-row p,
.ledger-row a {
  font-size: 16px;
}
.ledger-row p {
  color: var(--text-muted);
}
.ledger-products {
  display: grid;
  gap: 8px;
}
.ledger-products a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  min-height: 44px;
  border-bottom: 1px solid var(--border);
}
.ledger-products a:last-child {
  border-bottom: 0;
}
.ledger-products bdi {
  font-family: var(--font-sans);
  font-weight: 700;
  color: var(--charcoal-50);
}
.ledger-products small {
  font-size: 12px;
  color: var(--text-muted);
}
.proof-history {
  margin-top: 22px;
  display: flex;
  gap: 16px 26px;
  flex-wrap: wrap;
  color: var(--text-muted);
  font-size: 14px;
}
.proof-history bdi {
  color: var(--charcoal-50);
  font-weight: 700;
  font-size: 18px;
}
/* Graphic interruption, not a contained banner. */
.contact-poster {
  background: var(--accent);
  color: var(--on-accent);
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding-block: clamp(54px, 8vw, 130px);
}
.contact-poster:before {
  content: "";
  position: absolute;
  inset: -25% auto -25% -28px;
  width: clamp(48px, 7vw, 112px);
  transform: skewX(-10deg);
  background: var(--on-accent);
  z-index: -1;
}
.contact-poster .workline-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  align-items: end;
  gap: clamp(24px, 5vw, 80px);
}
.contact-poster h2 {
  font-size: clamp(58px, 8.8vw, 145px);
  font-weight: 850;
  line-height: 1.22;
  max-width: 12ch;
}
.contact-poster p {
  font-size: clamp(18px, 1.8vw, 26px);
  max-width: 29ch;
  margin-bottom: 24px;
}
.contact-poster .contact-actions {
  padding-inline-end: clamp(18px, 4vw, 90px);
  display: flex;
  align-items: start;
  flex-direction: column;
  gap: 18px;
}
.contact-poster :deep(.action--ink) {
  min-height: 76px;
  font-size: clamp(18px, 2vw, 30px);
  width: min(100%, 340px);
}
.contact-poster :deep(.action--text) {
  font-size: 17px;
}

.visual-character h2,
.visual-character h3 {
  font-family: var(--font-hero);
}
.arrow {
  display: inline-block;
  transition: transform 0.3s var(--ease-out);
}
.choices a {
  text-decoration: none;
}
.choices a:hover .arrow {
  transform: translate(-3px, -3px);
}
.contact-poster {
  --text: var(--charcoal-950);
  --text-muted: var(--charcoal-950);
  --link-color: var(--charcoal-950);
  --link-rule: var(--charcoal-950);
  --link-rule-hover: var(--charcoal-950);
  --link-active: var(--charcoal-950);
  --focus: var(--charcoal-950);
}
.contact-poster :deep(.action--ink) {
  color: var(--accent);
  background: var(--charcoal-950);
}
.contact-poster h2 {
  color: var(--charcoal-950);
}
@media (max-width: 900px) {
  .section-intro,
  .service-wall,
  .proof-layout,
  .contact-poster .workline-shell {
    grid-template-columns: minmax(0, 1fr);
  }
  .section-intro {
    gap: 18px;
  }
  .service-wall {
    gap: 0;
  }
  .service-stage {
    min-height: 0;
  }
  .service-tab {
    min-height: 60px;
  }
  .proof-layout {
    gap: 24px;
  }
  .contact-poster .contact-actions {
    padding-inline-end: 20px;
  }
  .contact-poster h2 {
    font-size: clamp(48px, 11vw, 100px);
  }
}
@media (max-width: 600px) {
  .choices {
    grid-template-columns: 1fr;
  }
  .choices a {
    padding: 14px 4px;
    min-height: 80px;
    border-inline-end: 0;
    border-block-end: 1px solid var(--border);
  }
  .choices a:last-child {
    border-block-end: 0;
  }
  .section-intro h2 {
    font-size: clamp(35px, 10vw, 58px);
  }
  .ledger-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .service-word {
    font-size: clamp(45px, 12vw, 75px);
  }
  .contact-poster::before {
    width: 34px;
    left: -18px;
  }
  .contact-poster .contact-actions {
    padding-inline-end: 16px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .service-word {
    animation: none;
  }
}
</style>
