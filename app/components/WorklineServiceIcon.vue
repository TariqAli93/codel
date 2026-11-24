<script setup lang="ts">
defineProps<{ id: string }>()
</script>
<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="service-icon">
    <g v-if="id === 'service-1'"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M7 7h1M10 7h1"/></g>
    <g v-else-if="id === 'service-2'"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M10 18h4"/></g>
    <g v-else-if="id === 'service-3'"><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8M12 16v5M7 8h4M7 12h10"/></g>
    <g v-else-if="id === 'service-4'"><rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h1M7 17.5h1M12 6.5h5M12 17.5h5"/></g>
    <path v-else d="m8 6-6 6 6 6M16 6l6 6-6 6M14 3l-4 18"/>
  </svg>
</template>
<style scoped lang="scss">.service-icon{width:52px;height:52px;padding:11px;flex:none;border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--accent)}</style>
