<script setup lang="ts">
import FoldedField from "./effects/FoldedField.vue";
import { obsidianCutFragment } from "./effects/obsidianCutShader";
</script>
<template>
  <section class="cover-hero" aria-labelledby="hero-title">
    <div class="material-still" aria-hidden="true" />
    <FoldedField :fragment="obsidianCutFragment" :settle-after="1.5" scroll-motion :max-resolution="1280" />
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
      <div class="cover-bottom">
        <a class="link" href="#discover"
          >اكتشف ما يناسب شغلك <span aria-hidden="true">↓</span></a
        ><span class="material-index" dir="ltr">CODEL / IRAQ</span>
      </div>
    </div>
  </section>
</template>
<style scoped lang="scss">
/* V9.8 — Obsidian Cut, original ray-marched material. */
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
  background-image: url(/images/hero/obsidian-cut-desktop.svg);
  background-position: center;
  background-size: cover;
}
:deep(.material-canvas) {
  opacity: 0;
  transition: opacity .32s ease;
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
  background: linear-gradient(270deg, #101411 4%, #101411f2 24%, #10141100 62%);
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
    background-image: url(/images/hero/obsidian-cut-mobile.svg);
  }
  .cover-hero {
    min-height: calc(100svh - var(--header-height));
  }
  .cover-inner {
    padding-block: clamp(160px, 31svh, 250px) 12px;
  }
  .cover-main {
    align-items: end;
    padding-block: 10px 24px;
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
      #101411 3%,
      #101411f7 31%,
      #10141180 53%,
      transparent 77%
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
  .material-copy h1 span { animation: obsidian-type-in .75s cubic-bezier(.2,.75,.2,1) both; }
  .material-copy h1 span:nth-child(2) { animation-delay: .10s; }
  .material-copy p { animation: obsidian-copy-in .6s .15s cubic-bezier(.2,.75,.2,1) both; }
  .cover-actions { animation: obsidian-copy-in .6s .23s cubic-bezier(.2,.75,.2,1) both; }
  .cover-hero:focus-within .material-copy h1 span,
  .cover-hero:focus-within .material-copy p,
  .cover-hero:focus-within .cover-actions { animation: none; }
  @keyframes obsidian-type-in { from { clip-path: inset(0 0 100% 0); transform: translateY(12px); } to { clip-path: inset(0); transform: none; } }
  @keyframes obsidian-copy-in { from { transform: translateY(9px); } to { transform: none; } }
}
</style>
