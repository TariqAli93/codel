<script setup lang="ts">
import type { NuxtError } from '#app'

// Nuxt renders this file for a 404 (an unknown address, or an unknown product slug) and for any other error.
const props = defineProps<{ error: NuxtError }>()

// `status` is the current field. An error revived from the server payload may carry only the
// older `statusCode`, so fall back to it.
const status = computed(() => props.error.status ?? props.error.statusCode ?? 500)
const notFound = computed(() => status.value === 404)

const heading = computed(() => (notFound.value ? 'الصفحة غير موجودة' : 'حدث خطأ'))
const text = computed(() =>
  notFound.value
    ? 'لم نجد الصفحة التي تبحث عنها. ربما تغيّر رابطها أو كُتب بشكل خاطئ.'
    : 'حدث خطأ أثناء فتح هذه الصفحة. حاول مرة أخرى بعد قليل.'
)

useSeoMeta({
  title: () => (notFound.value ? 'الصفحة غير موجودة / Page Not Found' : 'حدث خطأ / Error'),
  description: () => text.value,
  robots: 'noindex'
})
</script>

<template>
  <NuxtLayout>
    <section class="error">
      <p class="error__code">خطأ {{ status }}</p>
      <PageHead :title="heading" :lede="text">
        <ActionLink to="/" label="العودة إلى الصفحة الرئيسية" />
        <ActionLink look="text" to="/contact" label="تواصل معنا" />
      </PageHead>
    </section>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.error {
  max-inline-size: var(--measure);

  &__code {
    margin-block-end: var(--space-3);
    font-size: var(--text-small);
    font-weight: 600;
    color: var(--text-muted);
  }
}
</style>
