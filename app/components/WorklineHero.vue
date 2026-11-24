<script setup lang="ts">
const failed = ref(false);
const artwork = ref<HTMLImageElement | null>(null);
const hero = ref<HTMLElement | null>(null);
let motion: MediaQueryList | undefined;
let frame = 0;
let targetX = 0;
let targetY = 0;
function updateArtwork() {
  frame = 0;
  hero.value?.style.setProperty('--art-x', `${targetX}px`);
  hero.value?.style.setProperty('--art-y', `${targetY}px`);
}
function onHeroMove(event: PointerEvent) {
  if (!motion?.matches || event.pointerType !== 'mouse' || !hero.value) return;
  const bounds = hero.value.getBoundingClientRect();
  targetX = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - .5) * 18;
  targetY = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - .5) * 12;
  if (!frame) frame = requestAnimationFrame(updateArtwork);
}
function resetArtwork() {
  targetX = targetY = 0;
  if (frame) cancelAnimationFrame(frame);
  updateArtwork();
}
onBeforeUnmount(() => { resetArtwork(); motion?.removeEventListener('change', resetArtwork); });
onMounted(() => {
  motion = window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  motion.addEventListener('change', resetArtwork);
  if (artwork.value?.complete && !artwork.value.naturalWidth)
    failed.value = true;
});
</script>
<template>
  <section ref="hero" class="v4-hero v83-hero" aria-labelledby="v83-title" @pointermove="onHeroMove" @pointerleave="resetArtwork" @pointercancel="resetArtwork">
    <div class="v83-background" aria-hidden="true">
      <img
        v-if="!failed"
        ref="artwork"
        class="v83-stock"
        src="https://images.unsplash.com/vector-1761384690980-b218fa986838?auto=format&amp;fit=max&amp;w=1920&amp;q=85"
        width="1920"
        height="1440"
        alt=""
        fetchpriority="high"
        decoding="async"
        @error="failed = true"
      />
    </div>
    <div class="workline-shell v83-content">
      <div class="v9-hero-copy">
        <p class="v4-caption">برمجيات لأصحاب الأعمال في العراق</p>
        <h1 id="v83-title">
          <span class="v4-line"><span>وقتك لأعمالك.</span></span
          ><span class="v4-line"><span>والباقي علينا.</span></span>
        </h1>
        <div class="v4-hero-intro">
          <p>
            برامج جاهزة تنظم عملك، وبرمجيات خاصة تُبنى على احتياجاتك. اختر ما
            يناسب أعمالك وابدأ من هناك.
          </p>
          <div class="actions">
            <ActionLink
              look="solid"
              :glow="false"
              to="/contact"
              label="ناقش مشروعك ↖"
            /><ActionLink
              look="text"
              size="lg"
              to="/solutions"
              label="تصفّح البرامج ↖"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="workline-shell v83-bottom">
      <a href="#discover" class="v83-scroll"
        ><span>اكتشف ما يناسب أعمالك</span><span aria-hidden="true">↓</span></a
      ><a
        class="v83-credit"
        href="https://unsplash.com/illustrations/isometric-business-people-interacting-with-technology-and-data-lyKf9UWWrdg"
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        >VectorElements / Unsplash ↗</a
      >
    </div>
  </section>
</template>
<style scoped lang="scss">
.v83-hero { min-height:calc(100vh - var(--header-height) - 1px);min-height:calc(100svh - var(--header-height) - 1px);display:grid;grid-template-rows:1fr auto;position:relative;isolation:isolate;overflow:hidden;background:var(--bg);border-block-end:1px solid var(--border); }
.v83-background { position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none; }
.v83-stock { position:absolute;inset-block:0;inset-inline-end:0;width:62%;height:100%;max-width:none;object-fit:contain;object-position:left center;filter:brightness(.98) saturate(.94);mask-image:linear-gradient(to right,#000 0%,#000 72%,transparent 100%);translate:var(--art-x,0px) var(--art-y,0px);transition:translate .45s var(--ease-out);animation:art-in .9s var(--ease-out) both; }
.v83-background::after { content:'';position:absolute;inset:0;background:linear-gradient(to left,var(--bg) 0%,var(--bg) 40%,rgba(16,20,17,.85) 46%,rgba(16,20,17,.25) 58%,transparent 71%),linear-gradient(0deg,var(--bg),transparent 17%,transparent 88%,rgba(16,20,17,.12)); }
.v83-content { display:grid;align-content:center;position:relative;padding-block:clamp(54px,9vh,112px) clamp(36px,6vh,76px);min-width:0; }
.v9-hero-copy { width:min(49%,780px); }
.v4-caption { color:var(--text-muted);font-size:clamp(.95rem,1.1vw,1.125rem);margin-block-end:20px; }
.v83-hero h1 { font-family:var(--font-hero);font-size:clamp(3rem,5.8vw,6.9rem);font-weight:700;line-height:1.27;letter-spacing:normal;margin-block-end:24px; }
.v4-line { display:block;overflow:hidden;padding-block:4px 12px; >span{display:block;animation:word-in .9s var(--ease-out) both} &:nth-child(2)>span{color:var(--accent);animation-delay:.1s} }
.v4-hero-intro { max-width:36rem; p{font-size:clamp(1.125rem,1.5vw,1.375rem);line-height:1.85;color:var(--text);max-width:35rem} }
.actions { display:flex;align-items:center;flex-wrap:wrap;gap:clamp(16px,2vw,28px);margin-block-start:30px;padding-inline:4px; :deep(.action--solid){min-height:58px;padding-inline:clamp(20px,2vw,32px);font-size:1.125rem} :deep(.action--text){font-size:1.05rem} }
.v83-bottom { position:relative;display:flex;align-items:center;justify-content:space-between;gap:12px;padding-block:12px 22px;flex-wrap:wrap; }
.v83-scroll { display:inline-flex;min-height:44px;align-items:center;gap:12px;text-decoration:none;color:var(--text);font-size:var(--text-body);span:last-child{color:var(--accent);font-size:1.5rem;transition:translate .22s var(--ease-out)} &:hover span:last-child{translate:0 4px} }
.v83-credit { color:var(--text-muted);font-size:var(--text-small);text-decoration-thickness:1px; }
@keyframes word-in { from{opacity:.4;transform:translateY(100%)}to{opacity:1;transform:none} }
@keyframes art-in { from{opacity:0;transform:scale(1.025)}to{opacity:1;transform:scale(1)} }
@media(prefers-reduced-motion:no-preference) {
  .v4-caption { animation:copy-in .55s var(--ease-out) both; }
  .v4-hero-intro { animation:copy-in .65s .15s var(--ease-out) both; }
  @keyframes copy-in { from{transform:translateY(8px)}to{transform:none} }
}
@media(max-width:900px){ .v9-hero-copy{width:min(100%,650px)}.v83-stock{width:100%;object-fit:cover;object-position:30% 50%;mask-image:none}.v83-background::after{background:linear-gradient(270deg,rgba(16,20,17,.98),rgba(16,20,17,.82) 48%,rgba(16,20,17,.32)),linear-gradient(0deg,var(--bg),transparent 45%)} .v83-hero h1{font-size:clamp(2.8rem,9vw,5.5rem)}}
@media(max-width:560px){.v83-content{align-content:end;padding-block:clamp(64px,14vh,120px) 36px}.v83-stock{object-position:34% 30%;filter:brightness(.8) saturate(.9)}.v83-background::after{background:linear-gradient(0deg,var(--bg) 8%,rgba(16,20,17,.94) 42%,rgba(16,20,17,.58) 72%,rgba(16,20,17,.2)),linear-gradient(270deg,rgba(16,20,17,.78),transparent)}.v83-hero h1{font-size:clamp(2.3rem,10.4vw,3.8rem);margin-block-end:14px}.v4-caption{margin-block-end:12px}.v4-hero-intro p{font-size:1rem}.actions{gap:12px 18px;margin-block-start:20px;:deep(.action--solid){min-height:52px;font-size:1rem}}.v83-credit{font-size:.7rem}}
@media(prefers-reduced-motion:reduce){.v83-stock,.v4-line>span{animation:none;transform:none;translate:none}}
</style>
