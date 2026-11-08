<script setup lang="ts">
import { company } from '~/data/company'

const title = 'من نحن / About'
const description = 'بدأت كودل فكرةً في سنة 2020 وانطلقت في سنة 2024 من بغداد. شركة برمجيات عراقية ناشئة تقدّم برامج جاهزة وتطوّر برمجيات حسب الطلب.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <div class="about">
    <PageHead title="من نحن" lede="كودل شركة برمجيات عراقية ناشئة، مقرّها بغداد." />

    <section class="about__section" aria-labelledby="about-story">
      <h2 id="about-story" class="about__heading">قصتنا</h2>
      <div class="about__prose">
        <p class="about__first">
          بدأت كودل فكرةً في سنة {{ company.founded.idea }}، هدفها أن نبني برمجيات تخدم الأعمال في العراق.
        </p>
        <p>
          احتاجت الفكرة وقتاً لتتحول إلى عمل حقيقي، وانطلقت الشركة في سنة {{ company.founded.launch }} من بغداد.
        </p>
        <p>
          اليوم نقدّم برامج جاهزة، منها <NuxtLink to="/solutions/nuqta-plus">نقطة بلس</NuxtLink> لإدارة نقاط البيع والمخازن
          و<NuxtLink to="/solutions/dalaly">دلالي</NuxtLink> لإدارة مكاتب العقارات. ونطوّر برمجيات حسب طلب العميل،
          ونصمّم المواقع والتطبيقات، ونتولى إدارة السيرفرات.
        </p>
        <p>
          نحن شركة ناشئة، ونتعامل مع كل مشروع على أنه خطوة في هذا الطريق.
        </p>
      </div>
    </section>

    <section class="about__section" aria-labelledby="about-timeline">
      <h2 id="about-timeline" class="about__heading">محطات</h2>
      <div class="about__prose">
        <FoundingYears />
      </div>
    </section>

    <section class="about__section" aria-labelledby="about-location">
      <h2 id="about-location" class="about__heading">أين نحن</h2>
      <div class="about__prose">
        <p>{{ company.address }}.</p>
        <p>الدوام من {{ company.hours.days }}، {{ company.hours.time }}.</p>
        <p><ActionLink look="text" to="/contact" label="طرق التواصل" /></p>
      </div>
    </section>

    <ClosingCall heading="لديك مشروع أو فكرة؟" text="أخبرنا بما تحتاجه على واتساب أو بالبريد الإلكتروني.">
      <WhatsAppCall :glow="false" />
    </ClosingCall>
  </div>
</template>

<style scoped lang="scss">
$wide: 64em;

.about {
  &__section {
    display: grid;
    row-gap: var(--head-gap);
    margin-block-start: var(--section-gap);

    @media (width >= $wide) {
      grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
      align-items: start;
      column-gap: var(--space-8);
    }
  }

  &__heading {
    margin: 0;
  }

  &__prose {
    max-inline-size: var(--measure);
    color: var(--text-muted);
  }

  &__first {
    font-family: var(--font-display);
    font-size: var(--text-flow);
    font-weight: 700;
    line-height: 1.5;
    color: var(--text);

    & + p {
      margin-block-start: var(--space-5);
    }
  }
}
</style>
