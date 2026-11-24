<script setup lang="ts">
import { company } from "~/data/company";
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
</script>

<template>
  <div class="workline">
    <WorklineHero />
    <section id="discover" class="workline-shell discovery" aria-labelledby="discovery-title">
      <div class="discovery__head">
        <h2 id="discovery-title">ماذا تريد أن تطوّر في عملك؟</h2>
        <p>اختر ما يناسب طبيعة عملك.</p>
      </div>
      <div class="discovery__paths">
        <NuxtLink v-for="item in routes" :key="item.to" :to="item.to">
          <span class="discovery__copy"><strong>{{ item.title }}</strong><span>{{ item.text }}</span></span>
          <span class="discovery__arrow" aria-hidden="true">↖</span>
        </NuxtLink>
      </div>
    </section>

    <section class="workline-showcase" aria-labelledby="solutions-title">
      <div class="workline-shell workline-heading">
        <div><h2 id="solutions-title">حلول جاهزة لعملك اليومي.</h2><p>شاهد البرامج من واجهاتها الفعلية، وتعرّف على مميزاتها وأسعارها قبل أن تختار.</p></div>
        <ActionLink look="text" to="/solutions" label="جميع البرامج ↖" />
      </div>
      <div class="workline-shell workline-apps">
        <WorklineProduct v-for="(solution,i) in solutions" :key="solution.slug" :solution="solution" :number="i+1" :total="solutions.length" />
      </div>
    </section>

    <WorklineServices />

    <section class="workline-shell workline-proof" aria-labelledby="proof-title">
      <header class="proof-heading"><h2 id="proof-title">قبل أن تبدأ، كل شيء واضح.</h2></header>
      <div class="proof-evidence">
        <article class="proof-evidence__lead">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8m-4-5v5"/></svg>
          <h3>أي برنامج يناسب عملك؟</h3><div class="proof-product-links"><NuxtLink v-for="solution in solutions" :key="solution.slug" :to="`/solutions/${solution.slug}`"><strong>{{ solution.nameAr }}</strong><span>{{ solution.tagline }}</span><span class="proof-product-arrow" aria-hidden="true">↖</span></NuxtLink></div>
        </article>
        <article>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z M8 8h8M8 12h8M8 16h5"/></svg>
          <h3>كم تكلّف البرمجيات؟</h3><dl class="proof-prices"><div v-for="solution in solutions" :key="solution.slug"><dt>{{ solution.nameAr }}</dt><dd><ProductPrice :amount="solution.priceIqd" size="inline" /></dd></div></dl><p>الخدمات الخاصة تُسعّر حسب متطلبات المشروع.</p>
        </article>
        <article>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
          <h3>كيف تتواصل معنا؟</h3><p>{{ company.address }}<br>{{ company.hours.days }}، {{ company.hours.time }}</p><ActionLink look="text" :to="company.phones.main.whatsapp" new-tab label="راسلنا على واتساب ↖" /><a class="proof-phone" :href="company.phones.main.tel" dir="ltr">{{ company.phones.main.display }}</a>
        </article>
      </div>
      <div class="proof-history"><span>رحلة كودل</span><div><bdi>{{ company.founded.idea }}</bdi><span>بداية الفكرة</span></div><div><bdi>{{ company.founded.launch }}</bdi><span>انطلاق الشركة</span></div></div>
    </section>

    <div class="workline-shell workline-end">
      <ClosingCall heading="شنو تحتاج حتى يصير شغلك أسهل؟" text="احچيلنا عن احتياجك، ونناقش الحل المناسب لأعمالك.">
        <ActionLink look="ink" size="lg" to="/contact" label="ناقش مشروعك ↖" />
        <ActionLink look="text" :to="company.phones.main.whatsapp" new-tab label="أو راسلنا على واتساب" />
      </ClosingCall>
    </div>
  </div>
</template>

<style scoped lang="scss">
.discovery { padding-block:clamp(32px,5vw,72px); }
.discovery__head { display:flex;justify-content:space-between;align-items:baseline;gap:16px; margin-block-end:24px; h2{font-size:clamp(1.3rem,2vw,1.8rem);margin:0} p{font-size:var(--text-body);color:var(--text-muted)} }
.discovery__paths { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-block:1px solid var(--border); }
.discovery__paths a { display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:128px;padding:clamp(16px,2.2vw,32px);border-inline-end:1px solid var(--border);text-decoration:none;transition:background-color .22s var(--ease-out),color .22s var(--ease-out); &:last-child{border-inline-end:0} &:hover,&:focus-visible{background:var(--surface);color:var(--accent)} &:focus-visible{outline-offset:-3px} }
.discovery__copy { display:grid;gap:5px;min-width:0;strong{font-family:var(--font-display);font-size:clamp(1.15rem,1.7vw,1.6rem);line-height:1.5} >span{font-size:var(--text-body);color:var(--text-muted)} }
.discovery__arrow { font-size:1.65rem;flex:none;color:var(--accent);transition:translate .22s var(--ease-out); }
.discovery__paths a:hover .discovery__arrow { translate:-3px -3px; }

.workline-showcase { padding-block:clamp(36px,4.4vw,72px) var(--section-gap); }
.workline-heading { display:flex;justify-content:space-between;align-items:end;gap:24px;margin-block-end:clamp(24px,4vw,48px);h2{font-size:clamp(2rem,4.8vw,4.25rem);line-height:1.28;margin-block-end:16px}p{color:var(--text-muted);font-size:var(--text-lead);max-width:42rem} }
.workline-apps { max-inline-size:1760px;padding-inline:var(--page-gutter);display:grid;gap:clamp(18px,2vw,28px); }

.workline-proof { padding-block:var(--section-gap);border-block-start:1px solid var(--border); }
.proof-heading { max-width:50rem;margin-block-end:36px;h2{font-size:clamp(2rem,3.8vw,3.5rem);line-height:1.3}p{color:var(--text-muted);font-size:var(--text-lead)} }
.proof-evidence { display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr) minmax(0,1fr);border-block:1px solid var(--border);article{display:flex;flex-direction:column;align-items:start;gap:14px;padding:clamp(24px,3vw,44px);min-width:0;svg{width:32px;height:32px;color:var(--accent)}h3{font-size:clamp(1.3rem,2vw,1.85rem);margin:0}p{color:var(--text-muted);font-size:var(--text-body);line-height:1.85} :deep(.action){margin-block-start:0}}article+article{border-inline-start:1px solid var(--border)}.proof-evidence__lead{padding-inline-start:0;h3{font-size:clamp(1.75rem,3vw,3rem);max-width:18ch}p{font-size:var(--text-lead);max-width:40ch}svg{width:42px;height:42px}} }
.proof-product-links{width:100%;margin-block-start:10px;display:grid;gap:0;a{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:3px 14px;padding-block:18px;border-block-start:1px solid var(--border);text-decoration:none;strong{font-size:var(--text-sub)}span:not(.proof-product-arrow){font-size:var(--text-ui);color:var(--text-muted);grid-row:2;grid-column:1}.proof-product-arrow{grid-column:2;grid-row:1/3;font-size:1.5rem;color:var(--accent);transition:translate .22s var(--ease-out)}&:hover .proof-product-arrow{translate:-3px -3px}}}

 .proof-history { display:flex;align-items:center;flex-wrap:wrap;gap:16px clamp(24px,4vw,64px);padding-block:20px;border-block-end:1px solid var(--border);color:var(--text-muted);font-size:var(--text-small);>div{display:flex;align-items:baseline;gap:12px}bdi{font-family:var(--font-display);font-weight:700;font-size:1.4rem;color:var(--text);font-variant-numeric:tabular-nums} }
.workline-end { padding-block-end:var(--section-gap); }
.workline-end :deep(.closing){margin-block-start:0}
.proof-evidence article :deep(.action){font-size:var(--text-body)}
.proof-heading h2,.workline-heading h2,.services-intro h2{color:var(--text)}
@media(max-width:900px){.workline-heading{align-items:start;flex-direction:column;gap:8px}}
@media(max-width:720px){.discovery__head{display:block}.discovery__head p{margin-block-start:8px}.discovery__paths,.proof-evidence{grid-template-columns:1fr}.discovery__paths a{min-height:96px;padding:16px 4px;border-inline-end:0;border-block-end:1px solid var(--border);&:last-child{border-block-end:0}}.proof-evidence article,.proof-evidence .proof-evidence__lead{padding:24px 0;border-inline:0;border-block-end:1px solid var(--border)}.proof-evidence article:last-child{border-block-end:0}.proof-history{gap:12px 24px}}

.proof-prices{width:100%;margin:0;display:grid;gap:8px}
.proof-prices>div{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:4px 16px;padding-block:10px;border-block-end:1px solid var(--border)}
.proof-prices dt{color:var(--text-muted);font-size:var(--text-ui)}
.proof-prices dd{margin:0;font-weight:600}
.proof-phone{display:inline-flex;align-items:center;min-block-size:44px;font-size:var(--text-body);text-decoration-color:var(--border-strong)}
@media(min-width:721px) and (max-width:1050px){.proof-evidence{grid-template-columns:1fr 1fr}.proof-evidence__lead{grid-column:1/-1}.proof-evidence article:nth-child(2){border-inline-start:0}.proof-evidence article+article{border-block-start:1px solid var(--border)}}
</style>
