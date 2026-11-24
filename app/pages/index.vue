<script setup lang="ts">
import { company } from "~/data/company";
import { solutions } from "~/data/solutions";
import { services } from "~/data/company";

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

    <section class="workline-shell workline-services" aria-labelledby="services-title">
      <div class="services-intro">
        <h2 id="services-title">ما تحتاجه،<br>نطوّره لك.</h2>
        <p>إذا لم تجد ما يناسبك في البرامج الجاهزة، نطوّر برمجيات وفق متطلبات مشروعك.</p>
        <ActionLink look="text" to="/services" label="عرض جميع الخدمات ↖" />
      </div>
      <div class="service-index">
        <details v-for="(service,i) in services" :key="service.id" name="home-services" :open="i===0" class="workline-service">
          <summary>
            <WorklineServiceIcon :id="service.id" />
            <strong>{{ service.title }}</strong>
            <span class="workline-plus" aria-hidden="true"><span>+</span></span>
          </summary>
          <div class="workline-service__body">
            <p>{{ service.text }}</p>
            <div class="service-meta"><small>السعر حسب متطلبات المشروع</small><ActionLink look="text" :to="`/services/${service.id}`" label="تفاصيل الخدمة ↖" /></div>
          </div>
        </details>
      </div>
    </section>

    <section class="workline-shell workline-proof" aria-labelledby="proof-title">
      <header class="proof-heading"><h2 id="proof-title">اعرف ما تختار، قبل أن تبدأ.</h2><p>معلومات واضحة تساعدك على اتخاذ القرار المناسب لأعمالك.</p></header>
      <div class="proof-evidence">
        <article>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8m-4-5v5"/></svg>
          <h3>شاهد البرنامج قبل الشراء</h3><p>واجهات فعلية من نقطة بلس ودلالي، مع تفاصيل وظائف كل برنامج.</p><ActionLink look="text" to="/solutions" label="استعرض البرامج ↖" />
        </article>
        <article>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z M8 8h8M8 12h8M8 16h5"/></svg>
          <h3>أسعار واضحة</h3><p>سعر كل برنامج جاهز معلن، أما الخدمات الخاصة فتُسعّر حسب احتياجك.</p><ActionLink look="text" to="/services" label="تعرّف على الخدمات ↖" />
        </article>
        <article>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
          <h3>شركة برمجيات عراقية</h3><p>{{ company.address }}<br>{{ company.hours.days }}، {{ company.hours.time }}</p><ActionLink look="text" to="/about" label="تعرّف على كودل ↖" />
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

.workline-showcase { padding-block:clamp(56px,7vw,100px) var(--section-gap); }
.workline-heading { display:flex;justify-content:space-between;align-items:end;gap:24px;margin-block-end:clamp(24px,4vw,48px);h2{font-size:clamp(2rem,4.8vw,4.25rem);line-height:1.28;margin-block-end:16px}p{color:var(--text-muted);font-size:var(--text-lead);max-width:42rem} }
.workline-apps { max-inline-size:min(100%,1600px);padding-inline:clamp(16px,2.5vw,40px);display:grid;gap:clamp(18px,2vw,28px); }

.workline-services { display:grid;grid-template-columns:minmax(0,.68fr) minmax(0,1.32fr);gap:clamp(32px,5vw,88px);padding-block:0 var(--section-gap); }
.services-intro { align-self:start;h2{font-size:clamp(2.2rem,4.5vw,4.25rem);line-height:1.25}p{font-size:var(--text-lead);color:var(--text-muted);max-width:32ch;margin-block:20px} }
.service-index { min-width:0;border-block-end:1px solid var(--border); }
.workline-service { border-block-start:1px solid var(--border);summary{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:clamp(10px,1.4vw,20px);min-height:88px;padding:18px 8px;align-items:center;list-style:none;cursor:pointer;transition:color .22s var(--ease-out),background-color .22s var(--ease-out);&::-webkit-details-marker{display:none}&:hover{background:var(--surface)}strong{font-family:var(--font-display);font-size:clamp(1.15rem,1.75vw,1.7rem);line-height:1.5}:deep(.service-icon){width:44px;height:44px;padding:9px;border-color:var(--border);color:var(--text-muted);transition:color .22s,border-color .22s}} &[open] summary{color:var(--accent);:deep(.service-icon){color:var(--accent);border-color:var(--accent)}.workline-plus{background:var(--accent);color:var(--on-accent)}.workline-plus>span{transform:skewX(var(--slant-angle)) rotate(45deg)}} }
.workline-plus { display:grid;place-items:center;width:40px;height:40px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);font-size:1.5rem;transform:skewX(calc(-1 * var(--slant-angle)));span{transform:skewX(var(--slant-angle));transition:transform .22s var(--ease-out)} }
.workline-service__body { padding:0 20px 24px;padding-inline-start:calc(52px + clamp(10px,1.4vw,20px));font-size:var(--text-body);p{max-width:50ch;line-height:1.9} }
.service-meta { display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 20px;margin-block-start:16px;small{font-size:var(--text-small);color:var(--text-muted)} }
@supports (interpolate-size: allow-keywords) and selector(details::details-content) {
  .workline-service { interpolate-size:allow-keywords; &::details-content { block-size:0;overflow:clip;transition:block-size .35s var(--ease-out),content-visibility .35s allow-discrete; } &[open]::details-content { block-size:auto; } }
}

.workline-proof { padding-block:var(--section-gap);border-block-start:1px solid var(--border); }
.proof-heading { max-width:50rem;margin-block-end:36px;h2{font-size:clamp(2rem,3.8vw,3.5rem);line-height:1.3}p{color:var(--text-muted);font-size:var(--text-lead)} }
.proof-evidence { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-block:1px solid var(--border);article{display:flex;flex-direction:column;align-items:start;gap:12px;padding:clamp(20px,2.4vw,36px);border-inline-end:1px solid var(--border);min-width:0;&:first-child{padding-inline-start:0}&:last-child{border:0;padding-inline-end:0}svg{width:32px;height:32px;color:var(--accent)}h3{font-size:clamp(1.2rem,1.8vw,1.55rem);margin:0}p{color:var(--text-muted);font-size:var(--text-body);line-height:1.8} :deep(.action){margin-block-start:auto}} }
.proof-history { display:flex;align-items:center;flex-wrap:wrap;gap:16px clamp(24px,4vw,64px);padding-block:20px;border-block-end:1px solid var(--border);color:var(--text-muted);font-size:var(--text-small);>div{display:flex;align-items:baseline;gap:12px}bdi{font-family:var(--font-display);font-weight:700;font-size:1.4rem;color:var(--text);font-variant-numeric:tabular-nums} }
.workline-end { padding-block-end:var(--section-gap); }
.workline-end :deep(.closing){margin-block-start:0}
@media(max-width:900px){.workline-services{grid-template-columns:1fr;gap:24px}.services-intro h2 br{display:none}.services-intro p{max-width:44ch}.workline-heading{align-items:start;flex-direction:column;gap:8px}}
@media(max-width:720px){.discovery__head{display:block}.discovery__head p{margin-block-start:8px}.discovery__paths,.proof-evidence{grid-template-columns:1fr}.discovery__paths a{min-height:96px;padding:16px 4px;border-inline-end:0;border-block-end:1px solid var(--border);&:last-child{border-block-end:0}}.proof-evidence article{padding:24px 0;border-inline-end:0;border-block-end:1px solid var(--border)}.proof-history{gap:12px 24px}.workline-service__body{padding-inline:12px}.workline-service summary{grid-template-columns:36px minmax(0,1fr) 36px;gap:10px;padding-inline:2px;:deep(.service-icon){width:36px;height:36px;padding:7px}}.workline-plus{width:34px;height:38px}}
</style>
