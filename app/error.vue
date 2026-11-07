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
      <h1>{{ heading }}</h1>
      <p class="error__text">{{ text }}</p>
      <p class="error__actions">
        <NuxtLink to="/">العودة إلى الصفحة الرئيسية</NuxtLink>
      </p>
    </section>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.error {
  max-inline-size: 40rem;
  padding-block: var(--space-7);

  &__code {
    margin-block-end: var(--space-3);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--accent-text);
  }

  &__text {
    font-size: 1.125rem;
    color: var(--text-muted);
  }

  &__actions {
    margin-block-start: var(--space-4);
    font-weight: 600;

    // Standalone link: 44px touch target (WCAG 2.5.5).
    a {
      display: inline-flex;
      align-items: center;
      min-block-size: 44px;
    }
  }
}
</style>
