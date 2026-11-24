<script setup lang="ts">
import { services } from '~/data/company'
definePageMeta({ key: route => route.path })
const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
const service = services.find(s => s.id === id)
if (!service) throw createError({ status:404, statusText:'Page Not Found', fatal:true })
const title = service.title + ' / Services'
useSeoMeta({ title, description:service.text, ogTitle:title, ogDescription:service.text })
</script>
<template><article v-if="service"><ActionLink look="text" to="/services" label="→ العودة إلى الخدمات" /><PageHead :title="service.title" :lede="service.text" /><section class="service-detail"><div><WorklineServiceIcon :id="service.id" /><h2>ناقش احتياجاتك</h2><p>{{ service.text }}</p><p>تُحدد تفاصيل المشروع والمخرجات بعد مناقشة احتياجاتك.</p><ActionLink v-if="service.related" look="text" :to="service.related" label="حلولنا الجاهزة" /></div><aside><h2>السعر حسب متطلبات المشروع</h2><WhatsAppCall :subject="service.title" label="اطلب عرض سعر" /></aside></section><ClosingCall heading="نبدأ من احتياجك." text="أخبرنا عن مشروعك وما تريد تطويره."><ActionLink look="ink" to="/contact" label="ناقش مشروعك ↖" /></ClosingCall></article></template>
<style scoped lang="scss">.service-detail{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:var(--space-6);padding-block:var(--space-6);aside{padding:var(--space-5);border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface);h2{font-size:var(--text-card)}}}@media(max-width:800px){.service-detail{grid-template-columns:1fr}}</style>
