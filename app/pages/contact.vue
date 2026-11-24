<script setup lang="ts">
import { company } from "~/data/company";

const title = "تواصل معنا / Contact";
const description =
  "تواصل مع كودل عبر الهاتف أو واتساب أو البريد الإلكتروني. العراق، بغداد، الدورة، حي دجلة. الدوام من الأحد إلى الخميس.";

useSeoMeta({ title, description, ogTitle: title, ogDescription: description });
const form = reactive({ name: "", contact: "", type: "", message: "" });
function sendInquiry() {
  const message = [form.name, form.contact, form.type, form.message]
    .map((s) => s.trim())
    .join("\n");
  window.location.assign(
    company.phones.main.whatsapp + "?text=" + encodeURIComponent(message),
  );
}
</script>

<template>
  <div class="contact">
    <div>
      <PageHead
        title="تواصل معنا"
        lede="يسعدنا استقبال استفسارك على الهاتف أو واتساب أو البريد الإلكتروني."
      />
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

    <div>
      <form class="inquiry" @submit.prevent="sendInquiry">
        <h2>أخبرنا عن احتياجك</h2>
        <label
          >الاسم<input
            v-model="form.name"
            name="name"
            required
            maxlength="120"
            autocomplete="name" /></label
        ><label
          >رقم الهاتف أو البريد الإلكتروني<input
            v-model="form.contact"
            name="contact"
            required
            maxlength="160" /></label
        ><label
          >نوع الاستفسار<select v-model="form.type" required name="type">
            <option disabled value="">اختر نوع الاستفسار</option>
            <option>برنامج جاهز</option>
            <option>برمجيات حسب الطلب</option>
            <option>استفسار آخر</option>
          </select></label
        ><label
          >الرسالة<textarea
            v-model="form.message"
            name="message"
            rows="5"
            required
            maxlength="2000"
          ></textarea>
        </label>
        <p>يفتح الزر واتساب برسالتك، ولن تُرسل حتى تؤكد الإرسال هناك.</p>
        <button type="submit" class="workline-button">
          <span>متابعة على واتساب ↖</span>
        </button>
      </form>
      <ContactList />
    </div>
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
.inquiry {
  display: grid;
  gap: var(--space-4);
  padding: clamp(18px, 3vw, 38px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: var(--surface);
  margin-block-end: var(--space-6);
  h2 {
    font-size: var(--text-name);
  }
  label {
    display: grid;
    gap: 6px;
  }
  input,
  textarea,
  select {
    width: 100%;
    min-height: 48px;
    padding: 12px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    background: var(--bg);
    color: var(--text);
  }
  p {
    font-size: var(--text-small);
    color: var(--text-muted);
  }
  button {
    justify-self: start;
    background: var(--primary);
    color: var(--on-primary);
  }
}
</style>
