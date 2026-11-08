<script setup lang="ts">
import { company } from '~/data/company'

const title = 'تواصل معنا / Contact'
const description = 'تواصل مع كودل عبر الهاتف أو واتساب أو البريد الإلكتروني. العراق، بغداد، الدورة، حي دجلة. الدوام من الأحد إلى الخميس.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <div class="contact">
    <div>
      <PageHead title="تواصل معنا" lede="يسعدنا استقبال استفسارك على الهاتف أو واتساب أو البريد الإلكتروني." />
      <OpenStatus class="contact__status" />
      <div class="contact__call">
        <WhatsAppCall :detail="company.phones.main.display" />
      </div>
      <div class="contact__links">
        <!-- Kept on one line (and out of the formatter's reach): the space keeps the words and the
             number apart. -->
        <!-- prettier-ignore -->
        <ActionLink look="text" :to="company.phones.main.tel">أو اتصل <span dir="ltr">{{ company.phones.main.display }}</span></ActionLink>
        <ActionLink look="text" to="/faq" label="الأسئلة الشائعة" />
      </div>
    </div>

    <ContactList />
  </div>
</template>

<style scoped lang="scss">
$wide: 64em;

.contact {
  display: grid;
  row-gap: var(--head-gap);

  @media (width >= $wide) {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    align-items: start;
    column-gap: var(--space-8);
  }

  &__status {
    --status-point: var(--accent);

    margin-block-start: var(--space-5);
  }

  &__call {
    margin-block-start: var(--space-5);
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--space-5);
    margin-block-start: var(--space-3);
  }
}
</style>
