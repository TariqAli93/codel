<script setup lang="ts">
import type { Solution } from '~/data/solutions'
const props = defineProps<{ solution: Solution; number: number; total: number }>()
const active = ref(0)
const shot = computed(() => props.solution.images[active.value])
const gallery = ref<HTMLDialogElement | null>(null)
const opener = ref<HTMLButtonElement | null>(null)
const label = (alt: string) => alt.split(':')[0] ?? alt
const count = (n: number) => String(n).padStart(2, '0')
function step(delta: number) {
  const total = props.solution.images.length
  if (total) active.value = (active.value + delta + total) % total
}
function openGallery() { gallery.value?.showModal() }
function closeGallery() { gallery.value?.close() }
function onClose() { opener.value?.focus() }
function onGalleryKey(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); step(event.key === 'ArrowLeft' ? 1 : -1) }
}
</script>
<template>
  <article class="app-panel" :class="{ 'app-panel--sand': solution.look === 'sand' }" :data-theme="solution.look === 'sand' ? 'light' : undefined" :aria-labelledby="`app-${solution.slug}`">
    <header class="app-panel__head"><div class="app-panel__title"><bdi class="app-panel__count" aria-hidden="true">{{ count(number) }} / {{ count(total) }}</bdi><div><p>برنامج {{ solution.platform }} · <bdi>{{ solution.nameEn }}</bdi></p><h3 :id="`app-${solution.slug}`">{{ solution.nameAr }}</h3></div></div><p class="app-panel__tagline">{{ solution.tagline }}</p></header>
    <div class="app-panel__screen" v-if="shot">
      <figure><figcaption><span>{{ label(shot.alt) }}</span><span class="app-panel__tools"><bdi>{{ count(active + 1) }} / {{ count(solution.images.length) }}</bdi><button ref="opener" type="button" class="workline-button workline-button--icon" :aria-label="`تكبير واجهة ${solution.nameAr}`" @click="openGallery"><span aria-hidden="true">⤢</span></button></span></figcaption>
        <Transition name="screen" mode="out-in"><img :key="shot.src" :src="shot.src" :alt="shot.alt" :width="shot.width" :height="shot.height" loading="lazy" decoding="async"></Transition>
      </figure>
      <p class="app-panel__hint">استكشف الواجهات</p>
      <div class="app-panel__controls" role="group" :aria-label="`واجهات ${solution.nameAr}`"><button v-for="(item,i) in solution.images" :key="item.src" type="button" class="workline-button" :aria-pressed="active === i" @click="active = i"><span>{{ label(item.alt) }}</span></button></div>
    </div>
    <div class="app-panel__aside"><p>{{ solution.description }}</p><section><h4>ماذا يمكنك أن تدير؟</h4><ul><li v-for="feature in solution.features.slice(0,4)" :key="feature">{{ feature }}</li></ul></section><div class="app-panel__price"><small>سعر البرنامج</small><ProductPrice :amount="solution.priceIqd" /><ActionLink look="outline" size="lg" :to="`/solutions/${solution.slug}`" label="تفاصيل البرنامج ↖" /></div></div>
    <dialog ref="gallery" class="app-gallery" :aria-labelledby="`gallery-${solution.slug}`" @close="onClose" @keydown="onGalleryKey"><div class="app-gallery__bar"><h2 :id="`gallery-${solution.slug}`">{{ solution.nameAr }} — {{ shot ? label(shot.alt) : '' }}</h2><button type="button" autofocus class="workline-button" @click="closeGallery"><span>إغلاق ×</span></button></div><img v-if="shot" :src="shot.src" :alt="shot.alt" :width="shot.width" :height="shot.height"><div class="app-gallery__bar"><button type="button" class="workline-button" @click="step(-1)"><span>السابق →</span></button><bdi aria-live="polite">{{ count(active + 1) }} / {{ count(solution.images.length) }}</bdi><button type="button" class="workline-button" @click="step(1)"><span>التالي ←</span></button></div></dialog>
  </article>
</template>
<style scoped lang="scss">
.app-panel{display:grid;grid-template-columns:minmax(0,1.95fr) minmax(0,.85fr);grid-template-areas:'head head' 'screen aside';gap:clamp(20px,3vw,44px);padding:clamp(18px,2.7vw,38px);background:var(--nuqta-ground);border:1px solid color-mix(in srgb,var(--nuqta-accent) 28%,var(--border));border-radius:var(--radius-lg);color:var(--text);min-width:0;&--sand{background:var(--dalaly-ground);color:var(--dalaly-ink);border-color:var(--border);grid-template-columns:minmax(0,.85fr) minmax(0,1.95fr);grid-template-areas:'head head' 'aside screen'}}
.app-panel__head{grid-area:head;display:flex;align-items:center;justify-content:space-between;gap:16px;border-block-end:1px solid color-mix(in srgb,currentColor 20%,transparent);padding-block-end:clamp(14px,2vw,26px);h3{font-size:clamp(2.2rem,4vw,3.875rem);margin:5px 0 0}p{margin:0}}
.app-panel__title{display:flex;gap:clamp(12px,2vw,28px);align-items:start;p{font-size:var(--text-small);color:var(--text-muted)}}
.app-panel__count{font-size:12px;padding-block-start:8px;opacity:.75}
.app-panel__tagline{font-weight:600;text-align:end;max-width:25ch;font-size:var(--text-lead)}
.app-panel__screen{grid-area:screen;min-width:0;figure{margin:0;border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden;background:var(--charcoal-900);color:var(--charcoal-50)}figcaption{display:flex;justify-content:space-between;gap:8px;align-items:center;min-height:56px;padding:8px 12px;font-size:var(--text-caption)}img{width:100%;height:auto;aspect-ratio:16/9;object-fit:contain}}
.app-panel__tools,.app-panel__controls{display:flex;align-items:center;gap:10px}.app-panel__tools{flex-shrink:0}.app-panel__controls{flex-wrap:wrap;padding-inline:4px}.app-panel__hint{font-size:var(--text-caption);margin:16px 4px 8px}
.app-panel__tools .workline-button{color:var(--charcoal-50);border-color:var(--charcoal-400);background:transparent}
.app-panel__aside{grid-area:aside;display:flex;flex-direction:column;gap:20px;min-width:0;p{margin:0}section,.app-panel__price{border-block-start:1px solid color-mix(in srgb,currentColor 20%,transparent);padding-block-start:16px}h4{font-size:var(--text-body);margin-block-end:12px}ul{padding-inline-start:18px;display:grid;gap:8px;font-size:var(--text-small)}}
.app-panel__price{margin-block-start:auto;display:grid;gap:12px;small{color:var(--text-muted)}:deep(.action){justify-self:stretch;margin-inline:4px}}
.app-gallery{position:fixed;inset:0;margin:auto;width:min(1120px,calc(100% - 32px));max-height:calc(100dvh - 32px);padding:clamp(12px,2vw,24px);background:var(--charcoal-800);color:var(--charcoal-50);border:1px solid var(--charcoal-400);border-radius:var(--radius-lg);overflow:auto;img{width:100%;height:auto;max-height:65dvh;object-fit:contain;margin-block:16px} &::backdrop{background:rgba(11,14,12,.91)}}
.app-gallery__bar{display:flex;justify-content:space-between;align-items:center;gap:12px;h2{font-size:var(--text-card);margin:0}button{color:var(--charcoal-50);border-color:var(--charcoal-400)}}
.screen-enter-active,.screen-leave-active{transition:opacity var(--duration-fast) var(--ease-out)}.screen-enter-from,.screen-leave-to{opacity:0}
@media(max-width:850px){.app-panel,.app-panel--sand{grid-template-columns:minmax(0,1fr);grid-template-areas:'head' 'screen' 'aside'}.app-panel__head{flex-wrap:wrap}.app-panel__tagline{text-align:start}.app-panel__tools{gap:6px}}
@media(max-width:420px){.app-panel__count{display:none}.app-panel__screen figcaption{font-size:11px}.app-gallery__bar{flex-wrap:wrap}}
</style>
