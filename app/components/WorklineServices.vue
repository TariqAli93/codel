<script setup lang="ts">
import { services } from '~/data/company'

const activeId = ref(services[0]?.id ?? '')
const active = computed(() => services.find(service => service.id === activeId.value))
const selector = ref<HTMLElement | null>(null)
const instance = useId()
const panelId = `${instance}-service-panel`
const controlId = (id: string) => `${instance}-${id}`

function select(id: string) {
  if (services.some(service => service.id === id)) activeId.value = id
}
function onKey(event: KeyboardEvent, index: number) {
  if (!services.length) return
  let next = index
  if (event.key === 'ArrowDown') next = (index + 1) % services.length
  else if (event.key === 'ArrowUp') next = (index - 1 + services.length) % services.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = services.length - 1
  else return
  const service = services[next]
  if (!service) return
  event.preventDefault()
  select(service.id)
  selector.value?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus()
}
</script>

<template>
  <section class="workline-shell service-exhibit" aria-labelledby="services-title">
    <header class="service-exhibit__head">
      <div><h2 id="services-title">ما تحتاجه، نطوّره لك.</h2><p>عندما لا يكفي البرنامج الجاهز، اختر الخدمة المناسبة لمشروعك.</p></div>
      <ActionLink look="text" to="/services" label="جميع الخدمات ↖" />
    </header>
    <div v-if="active" class="service-exhibit__grid">
      <div ref="selector" class="service-exhibit__index" role="tablist" aria-label="الخدمات البرمجية" aria-orientation="vertical">
        <button v-for="(service,i) in services" :id="controlId(service.id)" :key="service.id" class="service-exhibit__option" type="button" role="tab" :aria-selected="activeId === service.id" :aria-controls="panelId" :tabindex="activeId === service.id ? 0 : -1" @click="select(service.id)" @keydown="onKey($event,i)">
          <span class="service-exhibit__icon"><WorklineServiceIcon :id="service.id" /></span>
          <span class="service-exhibit__label">{{ service.title }}</span>
          <span class="service-exhibit__arrow" aria-hidden="true">↖</span>
        </button>
      </div>
      <article :id="panelId" class="service-exhibit__panel" role="tabpanel" :aria-labelledby="controlId(active.id)" tabindex="0">
        <div class="service-exhibit__scene" aria-hidden="true"><WorklineServiceScene :key="active.id" :id="active.id" /></div>
        <div :key="active.id" class="service-exhibit__copy">
          <h3>{{ active.title }}</h3>
          <p>{{ active.text }}</p>
          <div class="service-exhibit__action"><span>السعر حسب متطلبات المشروع</span><ActionLink look="outline" :to="`/services/${active.id}`" label="تفاصيل الخدمة ↖" /></div>
        </div>
      </article>
    </div>
    <noscript><ul><li v-for="service in services" :key="service.id"><NuxtLink :to="`/services/${service.id}`">{{ service.title }}</NuxtLink></li></ul></noscript>
  </section>
</template>

<style scoped lang="scss">
.service-exhibit {
  padding-block:0 var(--section-gap);
  &__head{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-block-end:clamp(24px,3vw,44px);h2{font-size:clamp(2rem,4.5vw,4.25rem);line-height:1.3;margin-block-end:12px}p{color:var(--text-muted);font-size:var(--text-lead);max-width:48ch}}
  &__grid{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:clamp(24px,4vw,64px);align-items:stretch}
  &__index{border-block-end:1px solid var(--border);display:flex;flex-direction:column;min-width:0}
  &__option{appearance:none;display:grid;grid-template-columns:48px minmax(0,1fr) 28px;align-items:center;gap:clamp(12px,1.5vw,22px);text-align:start;background:transparent;border:0;border-block-start:1px solid var(--border);padding:clamp(18px,2vw,28px) 10px;min-height:84px;flex:1;color:var(--text);cursor:pointer;transition:color var(--duration-base),background-color var(--duration-base);&:focus-visible{outline-offset:-3px}&[aria-selected="true"]{background:var(--surface);color:var(--accent);.service-exhibit__arrow{color:var(--accent);translate:-3px -3px}.service-exhibit__icon::before{border-color:var(--accent)}}}
  &__label{font-family:var(--font-display);font-weight:600;font-size:clamp(1.1rem,1.6vw,1.5rem);line-height:1.5;min-width:0}
  &__icon{position:relative;display:grid;place-items:center;width:44px;height:44px;&::before{content:"";position:absolute;inset:0;border:1px solid var(--border);border-radius:var(--radius-sm);transform:skewX(calc(-1 * var(--slant-angle)));transition:border-color var(--duration-base)}:deep(.service-icon){width:32px;height:32px;padding:4px;border:0;color:inherit}}
  &__arrow{color:var(--text-muted);font-size:1.5rem;transition:translate var(--duration-base) var(--ease-out)}
  &__panel{min-width:0;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface);padding:clamp(18px,2.7vw,40px);display:grid;grid-template-rows:minmax(0,1fr) auto;gap:20px}
  &__scene{display:grid;place-items:center;min-height:180px;overflow:hidden}
  &__copy{h3{font-size:clamp(1.4rem,2.35vw,2.35rem);line-height:1.4;margin-block-end:10px}p{font-size:var(--text-lead);line-height:1.8;color:var(--text-muted);max-width:48ch}}
  &__action{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px 20px;border-block-start:1px solid var(--border);margin-block-start:22px;padding-block-start:18px;span{font-size:var(--text-ui);color:var(--text-muted)}:deep(.action){margin-inline:4px}}
}
@media(hover:hover){.service-exhibit__option:hover{background:var(--surface);color:var(--accent)}}
@media(prefers-reduced-motion:no-preference){.service-exhibit__copy{animation:service-copy-in .32s var(--ease-out) both}@keyframes service-copy-in{from{transform:translateY(5px)}to{transform:none}}}
@media(max-width:900px){.service-exhibit__grid{grid-template-columns:1fr;gap:20px}.service-exhibit__head{align-items:start;flex-direction:column;gap:8px}.service-exhibit__option{min-height:64px;padding:10px 6px}.service-exhibit__scene{min-height:140px}.service-exhibit__panel{grid-template-rows:auto auto}}
@media(max-width:420px){.service-exhibit__option{grid-template-columns:38px minmax(0,1fr) 22px;gap:10px}.service-exhibit__icon{width:36px;height:36px}.service-exhibit__action{align-items:start;flex-direction:column}.service-exhibit__scene{min-height:100px}}
</style>
