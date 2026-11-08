<script setup lang="ts">
import { company } from '~/data/company'

// The WhatsApp call, always in a new tab. With a subject it pre-fills a question about it.
const props = withDefaults(
  defineProps<{
    subject?: string
    look?: 'solid' | 'ink' | 'outline' | 'text'
    size?: 'md' | 'lg'
    label?: string
    detail?: string
    hiddenSuffix?: string
    glow?: boolean
  }>(),
  {
    subject: undefined,
    look: 'solid',
    size: undefined,
    label: 'راسلنا على واتساب',
    detail: undefined,
    hiddenSuffix: undefined,
    glow: true
  }
)

const href = computed(() => {
  const base = company.phones.main.whatsapp
  if (!props.subject) return base
  return `${base}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن ${props.subject}`)}`
})
</script>

<template>
  <ActionLink
    :to="href"
    new-tab
    :look="look"
    :size="size"
    :label="label"
    :detail="detail"
    :hidden-suffix="hiddenSuffix"
    :glow="glow"
  />
</template>
