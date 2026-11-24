<script setup lang="ts">
import type { Solution, SolutionImage } from '~/data/solutions'

const props = withDefaults(defineProps<{ solution: Solution; number?: number; total?: number; level?: 2 | 3 }>(), { level: 3 })
const active = ref(0)
const direction = ref(1)
const shot = computed(() => props.solution.images[active.value])
const gallery = ref<HTMLDialogElement | null>(null)
const opener = ref<HTMLButtonElement | null>(null)
const galleryOpen = ref(false)
const names: Record<string,string> = { pos:'نقطة البيع', dashboard:'لوحة التحكم', inventory:'المخزون', 'sales-report':'التقارير', properties:'العروض العقارية', property:'تفاصيل العقار' }
function label(item: SolutionImage) {
  const key = item.src.split('/').pop()?.replace(/\.webp$/, '') ?? ''
  return names[key] ?? item.alt.split(':')[0] ?? item.alt
}
function select(index:number, motionDirection?:number) {
  if(index===active.value) return
  direction.value = motionDirection ?? (index>active.value ? 1 : -1)
  active.value=index
}
function step(delta:number) {
  const length=props.solution.images.length
  if(length) select((active.value+delta+length)%length, delta)
}
function openGallery() { if(gallery.value && !gallery.value.open){galleryOpen.value=true;gallery.value.showModal()} }
function closeGallery() { gallery.value?.close() }
function onClose() { galleryOpen.value=false;opener.value?.focus() }
function onGalleryKey(event:KeyboardEvent) {
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();step(event.key==='ArrowLeft'?1:-1)}
}
</script>

<template>
  <article class="app-panel" :class="{ 'app-panel--sand': solution.look === 'sand' }" :data-theme="solution.look === 'sand' ? 'light' : undefined" :aria-labelledby="`app-${solution.slug}`">
    <header class="app-panel__head">
      <div><p class="app-panel__platform"><bdi>{{ solution.nameEn }}</bdi> · {{ solution.platform }}</p><component :is="level===2?'h2':'h3'" :id="`app-${solution.slug}`">{{ solution.nameAr }}</component></div>
      <p class="app-panel__tagline">{{ solution.tagline }}</p>
    </header>

    <div v-if="shot" class="app-panel__screen">
      <figure>
        <figcaption><span aria-live="polite">{{ label(shot) }}</span><button ref="opener" type="button" class="workline-button app-panel__enlarge" :aria-label="`تكبير واجهة ${solution.nameAr}`" @click="openGallery"><span>تكبير <span aria-hidden="true">⤢</span></span></button></figcaption>
        <div class="app-panel__stage" :class="{ 'app-panel__stage--back': direction<0 }">
          <Transition name="screen" mode="out-in">
            <img :key="shot.src" :src="shot.src" :alt="shot.alt" :width="shot.width" :height="shot.height" loading="lazy" decoding="async">
          </Transition>
        </div>
      </figure>
      <div class="app-panel__controls" role="group" :aria-label="`واجهات ${solution.nameAr}`">
        <button v-for="(item,i) in solution.images" :key="item.src" type="button" class="workline-button" :aria-pressed="active===i" @click="select(i)"><span>{{ label(item) }}</span></button>
      </div>
    </div>

    <div class="app-panel__aside">
      <p>{{ solution.description }}</p>
      <div class="app-panel__benefits"><component :is="level===2?'h3':'h4'">ماذا يمكنك أن تدير؟</component><ul><li v-for="feature in solution.features.slice(0,4)" :key="feature">{{ feature }}</li></ul></div>
    </div>

    <div class="app-panel__purchase">
      <div><small>سعر البرنامج</small><ProductPrice :amount="solution.priceIqd" /></div>
      <ActionLink look="solid" :glow="false" size="lg" :to="`/solutions/${solution.slug}`" label="استكشف البرنامج ↖" :hidden-suffix="solution.nameAr" />
    </div>

    <dialog ref="gallery" class="app-gallery" :aria-labelledby="`gallery-${solution.slug}`" @close="onClose" @keydown="onGalleryKey">
      <div class="app-gallery__bar"><h2 :id="`gallery-${solution.slug}`">{{ solution.nameAr }} — {{ shot ? label(shot) : '' }}</h2><button autofocus type="button" class="workline-button" @click="closeGallery"><span>إغلاق ×</span></button></div>
      <img v-if="galleryOpen && shot" :src="shot.src" :alt="shot.alt" :width="shot.width" :height="shot.height">
      <div class="app-gallery__bar"><button type="button" class="workline-button" @click="step(-1)"><span>السابق →</span></button><bdi aria-live="polite">{{ active+1 }} / {{ solution.images.length }}</bdi><button type="button" class="workline-button" @click="step(1)"><span>التالي ←</span></button></div>
    </dialog>
  </article>
</template>

<style scoped lang="scss">
.app-panel { display:grid;grid-template-columns:minmax(0,2.75fr) minmax(0,1fr);grid-template-areas:'head head' 'screen aside' 'purchase purchase';gap:clamp(20px,2.5vw,36px);padding:clamp(20px,2.6vw,40px);background:var(--nuqta-ground);border:1px solid color-mix(in srgb,var(--nuqta-accent) 28%,var(--border));border-radius:var(--radius-lg);min-width:0;color:var(--text);
  &--sand{background:var(--dalaly-ground);color:var(--dalaly-ink);border-color:var(--border);grid-template-columns:minmax(0,1fr) minmax(0,2.75fr);grid-template-areas:'head head' 'aside screen' 'purchase purchase'}
}
.app-panel__head { grid-area:head;display:flex;justify-content:space-between;align-items:end;gap:20px;border-block-end:1px solid color-mix(in srgb,currentColor 20%,transparent);padding-block-end:20px;h2,h3{font-size:clamp(2.2rem,4vw,4rem);line-height:1.25;margin:0} }
.app-panel__platform { font-size:var(--text-small);color:var(--text-muted);margin-block-end:5px; }
.app-panel__tagline { max-width:28ch;font-size:var(--text-lead);font-weight:500;text-align:end; }
.app-panel__screen { grid-area:screen;min-width:0;figure{border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden;background:var(--charcoal-900);color:var(--charcoal-50);margin:0}figcaption{display:flex;justify-content:space-between;gap:8px;align-items:center;min-height:56px;padding:6px 16px;font-size:var(--text-small)} }
.app-panel__enlarge { color:var(--charcoal-50);border-color:var(--charcoal-400);background:transparent;min-height:44px;flex:none;&:hover{background:var(--charcoal-700);color:var(--charcoal-50)} }
.app-panel__stage { aspect-ratio:16/9;position:relative;overflow:hidden;img{display:block;width:100%;height:100%;object-fit:contain} }
.app-panel__controls { display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding-inline:4px;margin-block-start:16px;button{min-height:44px;font-size:var(--text-small);padding-inline:16px} }
.app-panel__aside { grid-area:aside;display:flex;flex-direction:column;gap:24px;min-width:0;line-height:1.85;font-size:var(--text-body);p{margin:0} }
.app-panel__benefits { border-block-start:1px solid color-mix(in srgb,currentColor 20%,transparent);padding-block-start:20px;h3,h4{font-size:var(--text-sub);margin-block-end:12px}ul{padding-inline-start:20px;display:grid;gap:10px} }
.app-panel__purchase { grid-area:purchase;display:flex;align-items:center;justify-content:space-between;gap:16px 28px;flex-wrap:wrap;padding-block-start:24px;border-block-start:1px solid color-mix(in srgb,currentColor 20%,transparent);>div{display:grid;gap:8px}small{font-size:var(--text-small);color:var(--text-muted)}:deep(.price__amount){font-size:clamp(2rem,3.5vw,3.2rem)}:deep(.action){min-height:56px;padding-inline:clamp(20px,3vw,40px);margin-inline:5px;font-size:1.05rem} }
.app-gallery { position:fixed;inset:0;margin:auto;width:min(1120px,calc(100% - 32px));max-height:calc(100dvh - 32px);padding:clamp(12px,2vw,24px);background:var(--charcoal-800);color:var(--charcoal-50);border:1px solid var(--charcoal-400);border-radius:var(--radius-lg);overflow:auto;img{width:100%;height:auto;max-height:65dvh;object-fit:contain;margin-block:16px}&::backdrop{background:rgba(11,14,12,.91)} }
.app-gallery__bar { display:flex;justify-content:space-between;align-items:center;gap:12px;h2{font-size:var(--text-card);margin:0}button{color:var(--charcoal-50);border-color:var(--charcoal-400);&:hover{background:var(--charcoal-700);color:var(--charcoal-50)}} }
.screen-enter-active { transition:clip-path .38s var(--ease-out),opacity .25s var(--ease-out); }
.screen-leave-active { transition:opacity .12s var(--ease-out); }
.screen-enter-from { clip-path:inset(0 0 0 100%);opacity:.6; }
.app-panel__stage--back .screen-enter-from { clip-path:inset(0 100% 0 0); }
.screen-enter-to { clip-path:inset(0);opacity:1; }
.screen-leave-to { opacity:0; }
@media(max-width:900px){.app-panel,.app-panel--sand{grid-template-columns:minmax(0,1fr);grid-template-areas:'head' 'screen' 'aside' 'purchase'}.app-panel__head{align-items:start;flex-direction:column;gap:6px}.app-panel__tagline{text-align:start;max-width:none}.app-panel__aside{gap:16px}}
@media(max-width:440px){.app-panel{padding:16px}.app-panel__screen figcaption{padding:6px 10px}.app-panel__controls{gap:8px;button{padding-inline:12px}}.app-panel__purchase{align-items:stretch;flex-direction:column;:deep(.action){align-self:stretch}}.app-gallery__bar{flex-wrap:wrap}}
@media(prefers-reduced-motion:reduce){.screen-enter-from,.screen-leave-to{clip-path:none;opacity:1}}
</style>
