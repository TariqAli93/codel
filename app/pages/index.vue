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
    <section
      id="discover"
      class="workline-shell discovery"
      aria-labelledby="discovery-title"
    >
      <div class="discovery__head">
        <h2 id="discovery-title">ماذا تريد أن تطوّر في عملك؟</h2>
        <p>ابدأ بما تحتاجه، لا بما نبرمجه.</p>
      </div>
      <div class="discovery__paths">
        <NuxtLink v-for="(item, i) in routes" :key="item.to" :to="item.to">
          <span class="discovery__arrow" aria-hidden="true">↖</span
          ><small>0{{ i + 1 }}</small
          ><strong>{{ item.title }}</strong
          ><span>{{ item.text }}</span>
        </NuxtLink>
      </div>
    </section>
    <section
      class="workline-shell workline-heading"
      aria-labelledby="solutions-title"
    >
      <h2 id="solutions-title">حلول جاهزة.<br />لعملك اليومي.</h2>
      <div>
        <p>
          تعرّف على برامجنا من شاشاتها الفعلية، ومميزاتها وأسعارها قبل أن تختار.
        </p>
        <ActionLink look="text" to="/solutions" label="جميع البرامج ↖" />
      </div>
    </section>
    <div class="workline-shell workline-apps">
      <WorklineProduct
        v-for="(solution, i) in solutions"
        :key="solution.slug"
        :solution="solution"
        :number="i + 1"
        :total="solutions.length"
      />
    </div>
    <section
      class="workline-shell workline-services"
      aria-labelledby="services-title"
    >
      <div class="workline-heading workline-heading--inner">
        <h2 id="services-title">ما تحتاجه،<br />نطوّره لك.</h2>
        <div>
          <p>
            إذا لم تجد ما يناسبك في البرامج الجاهزة، اكتشف خدماتنا حسب متطلبات
            مشروعك.
          </p>
          <ActionLink look="text" to="/services" label="عرض جميع الخدمات ↖" />
        </div>
      </div>
      <details
        v-for="(service, i) in services"
        :key="service.id"
        name="home-services"
        :open="i === 0"
        class="workline-service"
      >
        <summary>
          <small>0{{ i + 1 }}</small
          ><strong>{{ service.title }}</strong
          ><span class="workline-plus" aria-hidden="true"><span>+</span></span>
        </summary>
        <div class="workline-service__body">
          <WorklineServiceIcon :id="service.id" />
          <div>
            <p>{{ service.text }}</p>
            <small>السعر حسب متطلبات المشروع</small>
          </div>
          <ActionLink
            look="text"
            :to="`/services/${service.id}`"
            label="تفاصيل الخدمة ↖"
          />
        </div>
      </details>
    </section>
    <section
      class="workline-shell workline-proof"
      aria-labelledby="proof-title"
    >
      <div class="workline-heading workline-heading--inner">
        <h2 id="proof-title">من بغداد،<br />لأعمالك.</h2>
        <p>
          كودل شركة برمجيات عراقية تجمع بين البرامج الجاهزة والتطوير حسب الطلب.
        </p>
      </div>
      <div class="workline-evidence">
        <article>
          <h3>رحلة كودل</h3>
          <div class="workline-years">
            <div>
              <bdi>{{ company.founded.idea }}</bdi
              ><span>بداية الفكرة</span>
            </div>
            <div>
              <bdi>{{ company.founded.launch }}</bdi
              ><span>انطلاق الشركة</span>
            </div>
          </div>
        </article>
        <div class="workline-facts">
          <article>
            <h3>برامج جاهزة</h3>
            <p>نقطة بلس ودلالي، بواجهات فعلية وأسعار واضحة.</p>
            <ActionLink look="text" to="/solutions" label="استعرض البرامج ↖" />
          </article>
          <article>
            <h3>عنواننا ودوامنا</h3>
            <p>
              {{ company.address }}<br />{{ company.hours.days }}،
              {{ company.hours.time }}
            </p>
            <ActionLink look="text" to="/about" label="تعرّف على كودل ↖" />
          </article>
        </div>
      </div>
    </section>
    <div class="workline-shell">
      <ClosingCall
        heading="خلّينا نبدأ من شغلك."
        text="أخبرنا ما الذي تريد تنظيمه أو تطويره."
        ><ActionLink
          look="ink"
          size="lg"
          to="/contact"
          label="ناقش مشروعك ↖" /><ActionLink
          look="text"
          :to="company.phones.main.whatsapp"
          new-tab
          label="أو راسلنا على واتساب"
      /></ClosingCall>
    </div>
  </div>
</template>

<style scoped lang="scss">
.discovery {
  padding-block: clamp(36px, 5vw, 72px);
}
.discovery__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-4);
  margin-block-end: var(--space-4);
  h2 {
    font-size: clamp(1.25rem, 2vw, 1.7rem);
    margin: 0;
  }
  p {
    color: var(--text-muted);
    font-size: var(--text-ui);
    margin: 0;
  }
}
.discovery__paths {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
  a {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 6px;
    min-height: 174px;
    padding: clamp(18px, 2.2vw, 32px);
    border-inline-end: 1px solid var(--border);
    text-decoration: none;
    transition:
      background var(--duration-base),
      color var(--duration-base);
    &:last-child {
      border: 0;
    }
    &:hover,
    &:focus-visible {
      background: var(--accent);
      color: var(--on-accent);
      small,
      span {
        color: inherit;
      }
    }
    &:focus-visible {
      outline-offset: -4px;
    }
    strong {
      font-family: var(--font-display);
      font-size: clamp(1.25rem, 2.15vw, 2rem);
      line-height: 1.45;
    }
    small,
    span {
      color: var(--text-muted);
      font-size: var(--text-small);
    }
    .discovery__arrow {
      align-self: end;
      margin-block-end: auto;
      font-size: 1.6rem;
      line-height: 1;
    }
  }
}
.workline-heading {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: clamp(24px, 5vw, 80px);
  align-items: end;
  padding-block: var(--section-gap) var(--space-6);
  h2 {
    font-size: clamp(2.125rem, 5vw, 4.375rem);
    line-height: 1.25;
    margin: 0;
  }
  p {
    color: var(--text-muted);
    font-size: var(--text-lead);
    max-width: 38rem;
  }
}
.workline-heading--inner {
  padding-block: 0 var(--space-6);
}
.workline-apps {
  display: grid;
  gap: 20px;
}
.workline-services,
.workline-proof {
  padding-block: var(--section-gap);
}
.workline-service {
  border-block-start: 1px solid var(--border);
  &:last-child {
    border-block-end: 1px solid var(--border);
  }
  summary {
    list-style: none;
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) 44px;
    align-items: center;
    gap: 16px;
    min-height: 88px;
    padding: 22px 12px;
    cursor: pointer;
    transition:
      background var(--duration-base),
      color var(--duration-base);
    &::-webkit-details-marker {
      display: none;
    }
    &:hover {
      background: var(--surface);
    }
    strong {
      font-family: var(--font-display);
      font-size: clamp(1.25rem, 2.8vw, 2.5rem);
      line-height: 1.4;
    }
    small {
      color: var(--text-muted);
    }
  }
  &[open] summary {
    color: var(--accent);
    .workline-plus {
      background: var(--accent);
      color: var(--on-accent);
    }
    .workline-plus > span {
      transform: skewX(var(--slant-angle)) rotate(45deg);
    }
  }
}
.workline-plus {
  display: grid;
  place-items: center;
  inline-size: 42px;
  block-size: 42px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 1.7rem;
  transform: skewX(calc(-1 * var(--slant-angle)));
  span {
    transform: skewX(var(--slant-angle));
    transition: transform var(--duration-base);
  }
}
.workline-service__body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-5);
  padding: 4px 72px 28px;
  > div {
    flex: 1;
    min-width: 0;
  }
  small {
    color: var(--text-muted);
  }
}
.workline-proof {
  border-block-start: 1px solid var(--border);
}
.workline-evidence {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: var(--space-7);
  border-block: 1px solid var(--border);
  > article {
    padding-block: var(--space-6);
  }
  h3 {
    font-size: var(--text-card);
  }
}
.workline-years {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-block: var(--space-6);
  > div {
    display: grid;
    gap: 6px;
    border-block-start: 1px solid var(--border-strong);
    padding-block-start: 20px;
    position: relative;
    &:before {
      content: "";
      position: absolute;
      inset-block-start: -5px;
      inset-inline-start: 0;
      width: 9px;
      height: 9px;
      background: var(--accent);
      border-radius: 50%;
    }
  }
  bdi {
    font: 600 clamp(2.375rem, 5vw, 4.375rem)/1.2 var(--font-display);
    font-variant-numeric: tabular-nums;
  }
  span {
    color: var(--text-muted);
  }
}
.workline-facts {
  border-inline-start: 1px solid var(--border);
  padding-inline-start: var(--space-7);
  article {
    padding-block: var(--space-5);
    & + article {
      border-block-start: 1px solid var(--border);
    }
  }
}
.workline :deep(.closing) {
  margin-block-start: 0;
  margin-block-end: var(--section-gap);
}
@media (max-width: 850px) {
  .workline-heading,
  .workline-evidence {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }
  .workline-facts {
    border-inline-start: 0;
    border-block-start: 1px solid var(--border);
    padding: 0;
  }
  .discovery__paths {
    grid-template-columns: 1fr;
    a {
      min-height: 118px;
      border-inline-end: 0;
      border-block-end: 1px solid var(--border);
      position: relative;
      padding-inline-end: 58px;
      .discovery__arrow {
        position: absolute;
        inset-inline-end: 18px;
        inset-block-start: 18px;
      }
    }
  }
  .discovery__head {
    display: block;
  }
  .workline-service__body {
    padding-inline: 16px;
    flex-wrap: wrap;
  }
  .workline-service summary {
    grid-template-columns: 28px minmax(0, 1fr) 40px;
    gap: 8px;
    padding-inline: 4px;
  }
}
</style>
