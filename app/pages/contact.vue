<script setup lang="ts">
import { company } from '~/data/company'

const title = 'تواصل معنا / Contact'
const description = 'تواصل مع كودل عبر الهاتف أو واتساب أو البريد الإلكتروني. العراق، بغداد، الدورة، حي دجلة. الدوام من الأحد إلى الخميس.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <div class="contact">
    <h1>تواصل معنا</h1>
    <p class="contact__lede">يسعدنا استقبال استفسارك على الهاتف أو واتساب أو البريد الإلكتروني.</p>

    <dl class="contact__list">
      <div class="contact__row">
        <dt>{{ company.phones.main.label }}</dt>
        <dd class="contact__values">
          <a :href="company.phones.main.tel" dir="ltr">{{ company.phones.main.display }}</a>
          <a :href="company.phones.main.whatsapp" target="_blank" rel="noopener noreferrer">راسلنا على واتساب</a>
        </dd>
      </div>
      <div class="contact__row">
        <dt>{{ company.phones.secondary.label }}</dt>
        <dd class="contact__values">
          <a :href="company.phones.secondary.whatsapp" target="_blank" rel="noopener noreferrer" dir="ltr">{{ company.phones.secondary.display }}</a>
        </dd>
      </div>
      <div class="contact__row">
        <dt>البريد الإلكتروني</dt>
        <dd class="contact__values">
          <a :href="`mailto:${company.email}`" dir="ltr">{{ company.email }}</a>
        </dd>
      </div>
      <div class="contact__row">
        <dt>العنوان</dt>
        <dd class="contact__values">{{ company.address }}</dd>
      </div>
      <div class="contact__row">
        <dt>ساعات الدوام</dt>
        <dd class="contact__values">{{ company.hours.days }}، {{ company.hours.time }}</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped lang="scss">
.contact {
  &__lede {
    margin-block-end: var(--space-7);
    font-size: 1.125rem;
    color: var(--text-muted);
  }

  &__list {
    max-inline-size: 40rem;
    margin: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background-color: var(--surface);
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-5);
    padding: var(--space-4) var(--space-5);

    & + & {
      border-block-start: 1px solid var(--border);
    }

    dt {
      flex: 1 1 8rem;
      color: var(--text-muted);
    }

    dd {
      flex: 2 1 12rem;
      min-inline-size: 0;
      margin: 0;
      overflow-wrap: anywhere;
    }
  }

  &__values {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-5);
    font-weight: 500;

    // 44px touch target (WCAG 2.5.5).
    a {
      display: inline-flex;
      align-items: center;
      min-block-size: 44px;
    }
  }
}
</style>
