<script setup lang="ts">
import type { Solution } from '~/data/solutions'
const props=defineProps<{ solution: Solution }>()
const scenes:Record<string, {label:string;title:string;description:string}>={
  'nuqta-plus/pos':{label:'نقطة البيع',title:'من البيع، تبدأ الحكاية.',description:'شوف المنتجات وأسعارها، أضفها إلى السلة، وتابع فاتورة البيع من نقطة واحدة.'},
  'nuqta-plus/dashboard':{label:'لوحة التحكم',title:'شوف يومك بوضوح.',description:'راجع مبيعات اليوم والأرباح والفواتير، وتعرّف على أداء شغلك من لوحة التحكم.'},
  'nuqta-plus/inventory':{label:'المخزون',title:'اعرف شنو عندك.',description:'تابع كميات البضائع وأسعارها والحد الأدنى للمخزون.'},
  'nuqta-plus/sales-report':{label:'التقارير',title:'الأرقام تحچي.',description:'راجع إجمالي المبيعات والخصومات والفواتير في تقرير المبيعات.'},
  'dalaly/properties':{label:'العروض العقارية',title:'كل عروضك، بمكان واحد.',description:'راجع العقارات المعروضة للبيع حسب النوع والموقع والمساحة والسعر والحالة.'},
  'dalaly/dashboard':{label:'لوحة التحكم',title:'تابع الطلبات والمهام.',description:'شوف المتابعات والعمليات السريعة ومطابقة العروض لطلبات الزبائن.'},
  'dalaly/property':{label:'تفاصيل العقار',title:'التفاصيل تصنع الفرق.',description:'اطّلع على سعر العقار وموقعه ومساحته وبيانات المالك والصور في صفحة واحدة.'}
}
const steps=computed(()=>props.solution.images.map(image=>{
  const key=props.solution.slug+'/'+(image.src.split('/').pop()?.replace(/\.webp$/,'')??'')
  return {...image,...(scenes[key]??{label:image.alt,title:image.alt,description:props.solution.description})}
}))
const active=ref(0)
const shot=computed(()=>steps.value[active.value])
const stage=ref<HTMLElement|null>(null)
const layout=ref<HTMLElement|null>(null)
const gallery=ref<HTMLDialogElement|null>(null)
const opener=ref<HTMLButtonElement|null>(null)
const galleryIndex=ref(0)
const galleryOpen=ref(false)
const galleryShot=computed(()=>steps.value[galleryIndex.value])
const failed=ref('')
const retry=ref(0)
const stageImage=ref<HTMLImageElement|null>(null)
const enhanced=ref(false)
let frame=0
let resizeObserver:ResizeObserver|undefined
function elements(){return Array.from(layout.value?.querySelectorAll<HTMLElement>('[data-story-step]')??[])}
function sync(){
 frame=0
 if(!stage.value||!enhanced.value||getComputedStyle(stage.value).display==='none')return
 const mobile=matchMedia('(max-width:900px)').matches
 const bottom=stage.value.getBoundingClientRect().bottom
 const threshold=mobile?Math.min(innerHeight-45,Math.max(220,bottom+Math.max(60,(innerHeight-bottom)*.46))):innerHeight*.58
 let next=0
 elements().forEach((el,i)=>{if(el.getBoundingClientRect().top<=threshold)next=i})
 if(next!==active.value){active.value=next;failed.value=''}
}
function queue(){if(!frame)frame=requestAnimationFrame(sync)}
function jump(i:number){
 const el=elements()[i]
 if(!el||!stage.value)return
 const mobile=matchMedia('(max-width:900px)').matches
 const top=parseFloat(getComputedStyle(stage.value).top)||0
 const bottom=top+stage.value.getBoundingClientRect().height
 const threshold=mobile?Math.min(innerHeight-45,Math.max(220,bottom+Math.max(60,(innerHeight-bottom)*.46))):innerHeight*.58
 window.scrollTo({top:Math.max(0,window.scrollY+el.getBoundingClientRect().top-threshold+12),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})
}
function imageError(e:Event){const image=e.currentTarget as HTMLImageElement;const current=shot.value;if(current&&image.getAttribute('src')===current.src)failed.value=current.src}
function retryImage(){failed.value='';retry.value++}
function open(){if(!gallery.value||gallery.value.open)return;galleryIndex.value=active.value;galleryOpen.value=true;gallery.value.showModal()}
function onGalleryClose(){galleryOpen.value=false;opener.value?.focus()}
function shift(delta:number){if(steps.value.length)galleryIndex.value=(galleryIndex.value+delta+steps.value.length)%steps.value.length}
function keys(e:KeyboardEvent){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();shift(e.key==='ArrowLeft'?1:-1)}}
onMounted(()=>{
 enhanced.value=true
 if(stageImage.value?.complete&&!stageImage.value.naturalWidth&&shot.value)failed.value=shot.value.src
 window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue,{passive:true})
 if(layout.value){resizeObserver=new ResizeObserver(queue);resizeObserver.observe(layout.value)}
 queue()
})
onBeforeUnmount(()=>{window.removeEventListener('scroll',queue);window.removeEventListener('resize',queue);resizeObserver?.disconnect();if(frame)cancelAnimationFrame(frame)})
</script>
<template>
 <section class="story-chapter" :class="{dalaly:solution.look==='sand',enhanced}" :data-theme="solution.look==='sand'?'light':undefined" :id="'story-'+solution.slug" :aria-labelledby="'story-title-'+solution.slug">
  <div class="workline-shell story-heading"><div><p class="story-tag">{{ solution.tagline }}</p><h3 :id="'story-title-'+solution.slug">{{ solution.nameAr }}<span class="story-en" dir="ltr">{{ solution.nameEn }}</span></h3></div><div class="story-buy"><ProductPrice :amount="solution.priceIqd"/><ActionLink look="solid" :to="'/solutions/'+solution.slug" label="تفاصيل البرنامج ↖"/></div></div>
  <div ref="layout" class="workline-shell story-layout">
   <div ref="stage" class="story-stage" v-if="shot">
    <div class="story-screen-head"><span>{{ shot.label }}</span><button ref="opener" type="button" class="story-enlarge" :aria-label="'تكبير واجهة '+solution.nameAr" @click="open">تكبير ⤢</button></div>
    <figure class="screen"><img v-if="failed!==shot.src" ref="stageImage" :key="shot.src+retry" :src="shot.src" :alt="shot.alt" :width="shot.width" :height="shot.height" loading="eager" decoding="async" class="scene-change" @error="imageError"><div v-else class="story-image-error"><p role="status">تعذّر تحميل الصورة.</p><button type="button" class="workline-button" @click="retryImage"><span>إعادة المحاولة</span></button></div></figure>
    <div class="story-jumps" role="group" :aria-label="'مشاهد '+solution.nameAr"><button v-for="(step,i) in steps" :key="step.src" type="button" :aria-current="i===active?'step':undefined" @click="jump(i)"><span>{{ step.label }}</span></button></div>
   </div>
   <div class="story-steps"><article v-for="(step,i) in steps" :key="step.src" class="story-step" :class="{'is-current':i===active}" data-story-step><div class="story-step-inner"><span class="story-count" dir="ltr">{{ String(i+1).padStart(2,'0') }} / {{ String(steps.length).padStart(2,'0') }}</span><h4>{{ step.title }}</h4><p>{{ step.description }}</p><figure class="story-inline"><img :src="step.src" :alt="step.alt" :width="step.width" :height="step.height" loading="lazy" decoding="async"></figure></div></article></div>
  </div>
  <div class="workline-shell story-end"><p>{{ solution.description }}</p><ActionLink look="text" :to="'/solutions/'+solution.slug" :label="'كل مميزات '+solution.nameAr+' ↖'"/></div>
  <dialog ref="gallery" class="story-dialog" :aria-label="'واجهات '+solution.nameAr" @close="onGalleryClose" @keydown="keys"><header><h2>{{ galleryShot?.label }}</h2><button autofocus type="button" class="workline-button" @click="gallery?.close()"><span>إغلاق ×</span></button></header><img v-if="galleryOpen && galleryShot" :src="galleryShot.src" :alt="galleryShot.alt" :width="galleryShot.width" :height="galleryShot.height" loading="lazy"><footer><button type="button" class="workline-button" @click="shift(-1)"><span>السابق →</span></button><bdi aria-live="polite">{{ galleryIndex+1 }} / {{ steps.length }}</bdi><button type="button" class="workline-button" @click="shift(1)"><span>التالي ←</span></button></footer></dialog>
 </section>
</template>
<style scoped lang="scss">
/* Native sticky product stories — only the display stays in place, not the page scroll. */
.story-chapter{background:var(--nuqta-ground);color:var(--charcoal-50);--chapter-muted:#c2c3cf;--chapter-line:#ffffff25;--story-active:var(--accent);padding-block:clamp(40px,6vw,96px);scroll-margin-top:80px}
.story-chapter.dalaly{background:var(--dalaly-ground);color:var(--dalaly-ink);--chapter-muted:#526064;--chapter-line:#26323630;--story-active:var(--charcoal-950)}
.story-heading{display:flex;align-items:end;justify-content:space-between;gap:24px;padding-bottom:clamp(24px,4vw,52px)}
.story-heading h3{font-size:clamp(60px,9vw,145px);line-height:1.25;display:flex;flex-wrap:wrap;align-items:baseline;gap:12px 20px}.story-tag{color:var(--chapter-muted);font-size:clamp(16px,1.6vw,24px)}.story-en{font:500 15px/1.5 var(--font-sans);color:var(--chapter-muted)}
.story-buy{display:flex;align-items:center;gap:clamp(16px,2.5vw,32px);flex-wrap:wrap}.story-layout{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(0,1fr);gap:clamp(28px,4vw,64px);align-items:start;position:relative}.story-chapter.dalaly .story-layout{grid-template-columns:minmax(0,1fr) minmax(0,1.8fr)}.story-chapter.dalaly .story-stage{grid-column:2;grid-row:1}.story-chapter.dalaly .story-steps{grid-column:1;grid-row:1}
.story-stage{position:sticky;top:calc(var(--header-height) + 24px);min-width:0;align-self:start;padding-block:12px 20px;background:var(--nuqta-ground);z-index:2}.story-chapter.dalaly .story-stage{background:var(--dalaly-ground)}.story-stage .screen{border-radius:6px;box-shadow:none;outline:1px solid var(--chapter-line);outline-offset:-1px}.story-screen-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-bottom:12px;color:var(--chapter-muted);font-size:16px}.story-enlarge{min-height:44px;background:none;border:0;color:inherit;text-decoration:underline;text-underline-offset:4px;padding-inline:8px}.story-jumps{display:flex;flex-wrap:wrap;gap:8px 12px;padding-top:14px}.story-jumps button{position:relative;isolation:isolate;flex:1;min-width:fit-content;min-height:44px;appearance:none;border:0;background:none;padding:8px 10px;font-size:14px;color:var(--chapter-muted)}.story-jumps button:before{content:'';position:absolute;inset:0;border-bottom:2px solid var(--chapter-line);transform:skewX(-10deg);z-index:-1;transition:border-color .25s var(--ease-out),background .25s var(--ease-out)}.story-jumps button[aria-current=step]{color:inherit;font-weight:700}.story-jumps button[aria-current=step]:before{border-color:var(--story-active);background:color-mix(in srgb,var(--story-active) 8%,transparent)}
.story-steps{min-width:0}.story-step{min-height:clamp(315px,62vh,650px);display:flex;align-items:center;border-block-start:1px solid var(--chapter-line);scroll-margin-top:calc(var(--header-height) + 24px)}.story-step:last-child{border-block-end:1px solid var(--chapter-line)}.story-step-inner{padding-block:28px;display:grid;gap:16px}.story-count{font:600 14px/1.4 var(--font-sans);color:var(--chapter-muted)}.story-step h4{font-size:clamp(32px,3.4vw,58px);line-height:1.34;max-width:16ch}.story-step p{font-size:clamp(17px,1.45vw,22px);line-height:1.8;color:var(--chapter-muted);max-width:31ch}.story-step.is-current .story-count{color:var(--story-active)}.story-step.is-current h4{color:inherit}.story-inline{display:none}.story-end{display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap;padding-top:clamp(26px,4vw,54px)}.story-end p{max-width:65ch;color:var(--chapter-muted);font-size:clamp(17px,1.25vw,20px)}
@media(min-width:901px) and (max-height:760px){.story-stage{top:calc(var(--header-height) + 10px)}.story-stage .screen{max-height:calc(100svh - 240px);width:auto;margin-inline:auto}.story-stage .screen img{width:100%;height:100%}}
@media(max-width:900px){.story-layout,.story-chapter.dalaly .story-layout{grid-template-columns:minmax(0,1fr);gap:0}.story-chapter.dalaly .story-stage,.story-chapter.dalaly .story-steps{grid-column:auto;grid-row:auto}.story-heading{align-items:start;flex-direction:column;gap:18px}.story-heading h3{font-size:clamp(60px,12vw,110px)}.story-stage{top:var(--header-height);padding-block:8px 12px}.story-stage .screen{width:min(100%,calc((100svh - 290px)*1.777));margin-inline:auto}.story-step{min-height:clamp(260px,50vh,460px);scroll-margin-top:calc(72px + min(56vw,100svh - 290px) + 150px)}.story-step h4{max-width:25ch;font-size:clamp(28px,5vw,44px)}.story-step p{max-width:48ch}.story-jumps{gap:5px}.story-jumps button{font-size:13px;min-height:40px;padding:4px 7px}.story-screen-head{padding-bottom:5px;font-size:14px}.story-enlarge{min-height:40px}}
@media(max-width:440px){.story-buy{gap:14px;justify-content:space-between;width:100%}.story-buy :deep(.action){font-size:14px;padding-inline:13px;min-height:48px}.story-jumps button{font-size:12px;flex:1 1 40%;min-height:36px}.story-jumps{padding-top:5px}.story-stage .screen{width:100%;max-height:31svh}.story-step{min-height:260px;scroll-margin-top:calc(72px + min(56vw,31svh) + 130px)}.story-screen-head{padding-bottom:2px}}
@media(max-height:560px){.story-layout,.story-chapter.dalaly .story-layout{display:block}.story-stage{display:none}.story-step{min-height:auto;scroll-margin-top:90px}.story-inline{display:block;margin-top:8px}.story-inline img{width:100%;height:auto;border-radius:5px}.story-step-inner{width:100%}.story-step p{max-width:60ch}}
@media(prefers-reduced-motion:reduce){.story-stage{position:static;display:none}.story-layout,.story-chapter.dalaly .story-layout{display:block}.story-step{min-height:auto}.story-inline{display:block;margin-top:8px}.story-inline img{width:100%;height:auto;border-radius:5px}.story-step-inner{width:100%}.story-step p{max-width:60ch}}


.story-chapter{--text-muted:var(--chapter-muted)}.story-chapter.dalaly{--text:var(--dalaly-ink);--text-muted:var(--chapter-muted)}.story-stage .screen{aspect-ratio:16/9;overflow:hidden;background:var(--charcoal-950);margin:0}.story-stage .screen img{width:100%;height:100%;object-fit:contain;display:block}.story-stage .screen img.scene-change{animation:scene-in .3s var(--ease-out) both}@keyframes scene-in{from{transform:translateX(5px)}to{transform:none}}.story-stage .screen{position:relative}.story-image-error{position:absolute;inset:0;display:grid;place-content:center;gap:12px;text-align:center;padding:12px;color:var(--charcoal-50)}.story-dialog{margin:auto;width:min(1120px,calc(100% - 32px));max-height:calc(100dvh - 32px);padding:20px;background:var(--charcoal-800);color:var(--charcoal-50);border:1px solid var(--charcoal-400);border-radius:var(--radius-md);overflow:auto}.story-dialog::backdrop{background:#0b0e0ce8}.story-dialog img{width:100%;max-height:65dvh;object-fit:contain;margin-block:16px}.story-dialog header,.story-dialog footer{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}.story-buy :deep(.price__amount){font-size:clamp(38px,4.2vw,68px)}.story-stage .story-jumps button{min-height:44px}.story-enlarge{min-height:44px}.story-inline img{display:block}.story-chapter.dalaly .story-jumps button:focus-visible{outline-color:var(--charcoal-950)}@media(prefers-reduced-motion:reduce){.story-stage .screen img.scene-change{animation:none}}

.story-chapter:not(.enhanced) .story-stage{display:none}.story-chapter:not(.enhanced) .story-layout{display:block}.story-chapter:not(.enhanced) .story-step{min-height:auto}.story-chapter:not(.enhanced) .story-inline{display:block}
.story-heading h3,.story-step h4{font-family:var(--font-hero)}
.story-step-inner{min-width:0;width:100%}
.story-chapter:not(.enhanced) .story-inline img{width:100%;height:auto}
.story-dialog{--text:var(--charcoal-50);--text-muted:var(--charcoal-300);--border-strong:var(--charcoal-400);--focus:var(--accent)}
.story-image-error .workline-button{color:var(--charcoal-50);border-color:var(--charcoal-400)}
@media(max-width:900px) and (max-height:720px){.story-stage .screen{max-height:30svh;width:100%}}
</style>
