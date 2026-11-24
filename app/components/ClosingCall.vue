<script setup lang="ts">
// The closing panel of a page: a heading, a sentence, and the actions in the default slot.
// A parent can recolour it with --closing-ground and --closing-ink.
withDefaults(
  defineProps<{
    heading: string
    text?: string
  }>(),
  { text: undefined }
)

const headingId = useId()
</script>

<template>
  <section class="closing" :aria-labelledby="headingId">
    <div class="closing__copy">
      <h2 :id="headingId" class="closing__heading">{{ heading }}</h2>
      <p v-if="text" class="closing__text">{{ text }}</p>
    </div>
    <div v-if="$slots.default" class="closing__actions"><slot /></div>
  </section>
</template>

<style scoped lang="scss">
.closing {
  position:relative;isolation:isolate;overflow:hidden;
  margin-block-start:var(--section-gap);padding:clamp(28px,5vw,76px);
  border-radius:var(--radius-lg);background:var(--accent);color:var(--on-accent);
  --focus:var(--on-accent);--link-color:var(--on-accent);--link-rule:var(--on-accent);--link-rule-hover:var(--on-accent);--link-active:var(--on-accent);
  --primary:var(--on-accent);--on-primary:var(--accent);--primary-hover:var(--charcoal-700);--primary-active:var(--charcoal-800);--text:var(--on-accent);--text-muted:var(--on-accent);--surface:var(--accent);--surface-raised:var(--accent);--border-strong:var(--on-accent);--glow-accent:none;
  display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:clamp(28px,5vw,80px);align-items:center;min-height:clamp(260px,26vw,380px);
  &::after {content:'';position:absolute;inset-block:-40%;inset-inline-end:-10%;width:44%;border-inline:1px solid currentColor;transform:skewX(calc(-1 * var(--slant-angle)));opacity:.13;pointer-events:none;z-index:-1}
}
.closing__copy { min-width:0; }
.closing__heading { font-size:clamp(2.2rem,4.7vw,4.75rem);line-height:1.35;max-width:19ch;margin:0; }
.closing__text { font-size:var(--text-lead);line-height:1.8;margin-block-start:18px;max-width:36ch; }
.closing__actions { display:flex;flex-direction:column;align-items:start;justify-content:center;gap:14px;min-width:0;padding-inline:5px;:deep(.action:not(.action--text)){min-height:60px;min-width:min(100%,250px);max-width:100%;font-size:1.125rem;padding-inline:clamp(20px,3vw,36px)}:deep(.action--text){font-size:var(--text-body)} }
.closing :deep(.action--outline:hover){background:var(--on-accent);color:var(--accent)}
.closing :deep(.action--ink:hover){background:var(--charcoal-700);color:var(--accent)}
@media(max-width:800px){.closing{grid-template-columns:minmax(0,1fr);min-height:0;gap:26px}.closing__heading{max-width:none}.closing__actions{align-items:stretch;:deep(.action--text){align-self:start}}}
</style>
