<script setup lang="ts">
// Placeholder until the owner provides the content. Kept out of search results and out of the navigation.
const title = 'المدونة / Blog'
const description = 'مدونة كودل، شركة البرمجيات العراقية في بغداد. الصفحة قيد الإعداد.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description, robots: 'noindex' })
</script>

<template>
  <PageHead title="المدونة" lede="هذه الصفحة قيد الإعداد.">
    <ActionLink look="text" to="/" label="العودة إلى الصفحة الرئيسية" />
  </PageHead>
</template>
