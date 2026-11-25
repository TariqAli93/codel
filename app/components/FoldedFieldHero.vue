<script setup lang="ts">
import FoldedField from "./effects/FoldedField.vue";
import {
  infiniteWeaveVertex,
  infiniteWeaveFragment,
} from "./effects/infiniteWeaveShader";
</script>
<template>
  <section class="cover-hero" aria-labelledby="hero-title">
    <div class="material-still" aria-hidden="true" />
    <FoldedField
      :fragment="infiniteWeaveFragment"
      :vertex="infiniteWeaveVertex"
      :max-resolution="1440"
      :max-dpr="5"
      :particle-count="52000 / 2"
      :idle-fps="60"
      ambient
      points
    />
    <div class="workline-shell cover-inner">
      <div class="cover-main">
        <div class="material-copy">
          <h1 id="hero-title"><span>شغلك يصير</span><span>أوضح.</span></h1>
          <p>برامج جاهزة لإدارة أعمالك، وبرمجيات خاصة تنبني على احتياجاتك.</p>
          <div class="cover-actions">
            <ActionLink
              look="solid"
              to="#solutions-title"
              label="شوف البرامج ↓"
            /><ActionLink look="text" to="/contact" label="ناقش مشروعك ↖" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<style scoped lang="scss">
/* V9.8.1 — Infinite Weave, a periodic particle surface. */
.cover-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: calc(100svh - var(--header-height));
  background: #101411;
  color: var(--text);
  display: grid;
  align-items: stretch;
  border-bottom: 1px solid var(--border);
}
.material-still,
:deep(.material-canvas) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -2;
}
.material-still {
  background-image: url(/images/hero/infinite-weave-desktop.svg);
  background-position: center;
  background-size: 100% 100%;
}
:deep(.material-canvas) {
  opacity: 0;
  transition: opacity 0.15s ease;
}
:deep(.material-canvas.ready) {
  opacity: 1;
}
.cover-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(
    270deg,
    #101411 0%,
    #101411 34%,
    #101411e6 40%,
    #10141100 58%
  );
}
.cover-inner {
  display: grid;
  grid-template-rows: 1fr auto;
  position: relative;
  padding-block: clamp(36px, 5vh, 64px) 26px;
  min-width: 0;
}
.cover-main {
  display: flex;
  align-items: center;
  min-width: 0;
  padding-block: 24px;
}
.material-copy {
  width: min(57%, 850px);
  display: grid;
  gap: clamp(14px, 2.4vh, 25px);
}
.material-copy h1 {
  font-size: clamp(64px, 7.3vw, 125px);
  font-weight: 800;
  line-height: 1.28;
  letter-spacing: normal;
}
.material-copy h1 span {
  display: block;
}
.material-copy h1 span:last-child {
  color: var(--accent);
}
.material-copy p {
  max-width: 31ch;
  color: var(--text);
  font-size: clamp(18px, 1.55vw, 25px);
  line-height: 1.8;
}
.cover-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px 25px;
  padding-inline: 5px;
}
.cover-actions :deep(.action--solid) {
  min-height: 60px;
  font-size: 18px;
  margin-inline: 0;
}
.cover-actions :deep(.action--text) {
  font-size: 17px;
}
.cover-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border-top: 1px solid #ffffff30;
  padding-block: 14px;
  color: var(--text);
  font-size: 15px;
}
.cover-bottom .link {
  border: 0;
}
.cover-bottom .material-index {
  font-family: var(--font-sans);
  color: var(--text-muted);
  font-size: 13px;
}
@media (min-width: 901px) and (max-height: 680px) {
  .material-copy h1 {
    font-size: clamp(54px, 6vw, 88px);
  }
  .cover-inner {
    padding-block: 20px 10px;
  }
  .material-copy {
    gap: 12px;
  }
}
@media (max-width: 900px) {
  .cover-hero {
    min-height: calc(100svh - var(--header-height));
  }
  .material-copy {
    width: min(75%, 650px);
  }
  .material-copy h1 {
    font-size: clamp(58px, 9vw, 100px);
  }
  .cover-hero::after {
    background: linear-gradient(
      270deg,
      #101411 2%,
      #101411de 35%,
      #10141100 90%
    );
  }
}
@media (max-width: 560px) {
  .material-still {
    background-image: url(/images/hero/infinite-weave-mobile.svg);
  }
  .cover-hero {
    min-height: calc(100svh - var(--header-height));
  }
  .cover-inner {
    padding-block: clamp(190px, 35svh, 320px) 12px;
  }
  .cover-main {
    align-items: center;
    padding-block: 16px 34px;
  }
  .material-copy {
    width: 100%;
    gap: 14px;
  }
  .material-copy h1 {
    font-size: clamp(45px, 12.2vw, 66px);
  }
  .material-copy p {
    font-size: 17px;
  }
  .cover-actions {
    gap: 12px 18px;
  }
  .cover-actions :deep(.action--solid) {
    min-height: 52px;
    font-size: 16px;
    padding-inline: 18px;
  }
  .cover-actions :deep(.action--text) {
    font-size: 15px;
  }
  .cover-hero::after {
    background: linear-gradient(
      0deg,
      #101411 0%,
      #101411 41%,
      #10141100 61%,
      transparent 100%
    );
  }
  .cover-bottom .material-index {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  :deep(.material-canvas) {
    display: none;
  }
}

.material-copy h1 {
  font-family: var(--font-hero);
}
.cover-bottom .link {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  min-height: 44px;
  text-decoration: none;
}
.cover-bottom .link:hover {
  text-decoration: underline;
}
/* A single entrance sequence. Text never follows the pointer or scrolls out independently. */
@media (prefers-reduced-motion: no-preference) {
  .material-copy h1 span {
    animation: loom-type-in 0.75s cubic-bezier(0.2, 0.75, 0.2, 1) both;
  }
  .material-copy h1 span:nth-child(2) {
    animation-delay: 0.12s;
  }
  .material-copy p {
    animation: loom-copy-in 0.6s 0.35s cubic-bezier(0.2, 0.75, 0.2, 1) both;
  }
  .cover-actions {
    animation: loom-copy-in 0.6s 0.25s cubic-bezier(0.2, 0.75, 0.2, 1) both;
  }
  .cover-hero:focus-within .material-copy h1 span,
  .cover-hero:focus-within .material-copy p,
  .cover-hero:focus-within .cover-actions {
    animation: none;
  }
  @keyframes loom-type-in {
    from {
      transform: translateY(12px);
    }
    to {
      transform: none;
    }
  }
  @keyframes loom-copy-in {
    from {
      transform: translateY(9px);
    }
    to {
      transform: none;
    }
  }
}
/* Match the portrait sculpture placement for tall tablet viewports. */
@media (min-width: 561px) and (max-aspect-ratio: 4/5) {
  .cover-inner {
    padding-block-start: 35svh;
  }
  .material-copy {
    width: 100%;
  }
  .cover-hero::after {
    background: linear-gradient(0deg, #101411 0%, #101411 40%, #10141100 63%);
  }
  .material-still {
    background-image: url(/images/hero/infinite-weave-mobile.svg);
  }
}
.material-controls {
  display: flex;
  align-items: center;
  gap: clamp(12px, 2vw, 24px);
}
.motion-control {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 44px;
  color: var(--text-muted);
  font-size: 14px;
  border: 0;
  background: transparent;
  padding: 0 4px;
  cursor: pointer;
  white-space: nowrap;
}
.motion-control:hover,
.motion-control:focus-visible {
  color: var(--text);
}
.motion-control:focus-visible {
  outline-offset: 4px;
}
@media (max-width: 560px) {
  .cover-bottom {
    flex-wrap: wrap;
    gap: 0 12px;
  }
  .motion-control {
    font-size: 13px;
  }
  .cover-inner {
    padding-block-start: clamp(155px, 32svh, 290px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .motion-control {
    display: none;
  }
}
</style>
