<script setup lang="ts">
const failed = ref(false);
const artwork = ref<HTMLImageElement | null>(null);
onMounted(() => {
  if (artwork.value?.complete && !artwork.value.naturalWidth)
    failed.value = true;
});
</script>
<template>
  <section class="v4-hero v83-hero" aria-labelledby="v83-title">
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
              look="outline"
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
.v83-content {
  display: grid;
}
.v83-hero h1 {
  font-family: var(--font-hero);
  font-weight: 700;
}
.v4-caption {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  &:before {
    content: "";
    width: 32px;
    height: 2px;
    background: var(--accent);
    transform: skewX(calc(-1 * var(--slant-angle)));
  }
}
.v4-line {
  display: block;
  overflow: hidden;
  > span {
    display: block;
    animation: workline-rise 0.95s var(--ease-out) both;
  }
  &:nth-child(2) > span {
    color: var(--accent);
    animation-delay: 100ms;
  }
}
.actions {
  display: flex;
}
.v83-scroll {
  text-decoration: none;
}
@keyframes workline-rise {
  from {
    opacity: 0.4;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.v4-hero.v83-hero {
  min-height: calc(100vh - var(--header-height) - 1px);
  min-height: calc(100svh - var(--header-height) - 1px);
  padding: 0;
  gap: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  isolation: isolate;
  position: relative;
  overflow: hidden;
  border-block-end: 1px solid var(--border);
  background: var(--bg);
}
.v83-background {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
  background: var(--bg);
}
.v83-background .v83-fallback,
.v83-background .v83-stock {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  object-position: 50% 50%;
  border: 0;
  border-radius: 0;
  background: transparent;
  transform: none;
  transition: none;
  display: block;
}
.v83-background .v83-stock {
  z-index: 1;
  filter: brightness(0.83) saturate(0.82);
  animation: v83-bg-in 0.9s var(--ease-out) both;
}
.v83-background .v83-stock.failed {
  visibility: hidden;
}
.v83-background:after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  background:
    linear-gradient(
      270deg,
      var(--bg) 0%,
      rgba(16, 20, 17, 0.98) 25%,
      rgba(16, 20, 17, 0.86) 43%,
      rgba(16, 20, 17, 0.37) 65%,
      rgba(16, 20, 17, 0.05) 100%
    ),
    linear-gradient(
      0deg,
      var(--bg) 0%,
      rgba(16, 20, 17, 0.06) 24%,
      transparent 76%,
      rgba(16, 20, 17, 0.3) 100%
    );
}
.v4-hero.v83-hero .v83-content {
  position: relative;
  z-index: 1;
  grid-template-columns: minmax(0, 1fr);
  align-content: center;
  align-items: center;
  gap: 0;
  min-width: 0;
  padding-block: clamp(46px, 8vh, 100px) clamp(32px, 6vh, 76px);
}
.v83-content .v9-hero-copy {
  width: min(100%, 730px);
}
.v83-hero h1 {
  font-size: clamp(48px, 7.4vw, 114px);
  line-height: 1.22;
  letter-spacing: normal;
  margin-block: 0 22px;
}
.v83-hero .v4-caption {
  color: var(--text);
  margin-block-end: 22px;
}
.v83-hero .v4-line {
  padding-block: 3px 10px;
}
.v83-hero .v4-hero-intro {
  max-width: 38rem;
}
.v83-hero .v4-hero-intro p {
  color: var(--text);
  max-width: 34rem;
  font-size: clamp(16px, 1.55vw, 22px);
  line-height: 1.85;
}
.v83-hero .actions {
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 26px;
}
.v83-hero .actions :deep(.action) {
  min-height: 52px;
}
.v83-bottom {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-block: 14px 24px;
}
.v83-scroll {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 14px;
  background: transparent;
  border: 0;
  color: var(--text);
  padding: 0 5px;
  text-align: start;
  font-size: 13px;
  max-width: 100%;
  transform: skewX(-10deg);
}
.v83-scroll > span {
  display: inline-block;
  transform: skewX(10deg);
}
.v83-scroll > span:last-child {
  font-size: 20px;
  line-height: 1;
  color: var(--accent);
  transition: translate 0.25s var(--ease-out);
}
.v83-scroll:hover > span:last-child {
  translate: 0 5px;
}
.v83-credit {
  font-size: 11px;
  color: var(--text);
  text-underline-offset: 3px;
  text-decoration: underline;
  opacity: 0.75;
  text-align: end;
}
.v83-credit:hover {
  opacity: 1;
}
.v83-discovery {
  padding-block: clamp(36px, 5vw, 72px);
  background: var(--bg);
  scroll-margin-block-start: 12px;
}
.v83-art-plane {
  animation: v83-assemble 0.95s var(--ease-out) both;
}
.v83-art-middle {
  animation-delay: 0.1s;
}
.v83-art-top {
  animation-delay: 0.2s;
}
.v83-signal {
  animation: v83-signal-in 1.6s var(--ease-out) both;
}
@keyframes v83-assemble {
  from {
    opacity: 0;
    translate: 0 26px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}
@keyframes v83-signal-in {
  from {
    opacity: 0;
    stroke-dashoffset: 55;
  }
  to {
    opacity: 1;
    stroke-dashoffset: 0;
  }
}
@keyframes v83-bg-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@media (max-width: 850px) {
  .v4-hero.v83-hero .v83-content {
    padding-block: clamp(36px, 7vh, 70px) 40px;
  }
  .v83-content .v9-hero-copy {
    width: min(100%, 670px);
  }
  .v83-hero h1 {
    font-size: clamp(45px, 10vw, 88px);
  }
  .v83-background:after {
    background:
      linear-gradient(
        270deg,
        rgba(16, 20, 17, 0.96),
        rgba(16, 20, 17, 0.72) 58%,
        rgba(16, 20, 17, 0.43)
      ),
      linear-gradient(0deg, var(--bg), transparent 40%, rgba(16, 20, 17, 0.28));
  }
  .v83-background .v83-stock,
  .v83-background .v83-fallback {
    object-position: 30% 50%;
  }
  .v83-hero .actions {
    gap: 14px;
  }
}
@media (max-width: 560px) {
  .v83-hero h1 {
    font-size: clamp(37px, 10.7vw, 61px);
    margin-block-end: 16px;
  }
  .v83-hero .v4-caption {
    margin-block-end: 14px;
  }
  .v83-hero .v4-hero-intro p {
    font-size: 16px;
    margin-bottom: 18px;
  }
  .v83-hero .actions {
    margin-top: 16px;
    gap: 12px;
    padding-inline: 4px;
  }
  .v83-hero .actions :deep(.action) {
    min-height: 48px;
  }
  .v83-background:after {
    background:
      linear-gradient(270deg, rgba(16, 20, 17, 0.88), rgba(16, 20, 17, 0.75)),
      linear-gradient(0deg, var(--bg), transparent 33%, rgba(16, 20, 17, 0.18));
  }
  .v83-bottom {
    flex-wrap: wrap;
    padding-block: 8px 18px;
    gap: 6px;
  }
  .v83-credit {
    font-size: 10px;
  }
  .v83-scroll {
    font-size: 12px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .v83-background *,
  .v83-art-plane,
  .v83-signal {
    animation: none !important;
    transition: none !important;
  }
}
</style>
