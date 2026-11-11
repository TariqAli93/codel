<script setup lang="ts">
import ZirconTorrent from '../effects/ZirconTorrent.vue'
</script>

<template>
  <section class="hero" dir="rtl" aria-labelledby="hero-heading">
    <!-- Track parent keeps CTA interactions intact while the light follows the cursor. -->
    <ZirconTorrent
      class="hero__effect"
      :track-parent="true"
      :scale="230"
      :zoom="64"
      :speed="58"
      :hover="20"
      :hover-speed="50"
      :glow="90"
      :floor="78"
      :placement="{ x: -18, y: 0, angle: 0, tilt: 0 }"
      :direction="{ flow: 'down', ripple: 'toward', streaks: 'toward' }"
      :advanced="{ horizon: 75, sparkles: 8, specks: 4, grain: 12 }"
    />
    <div class="hero__shade" aria-hidden="true" />
    <div class="hero__content">
      <p class="hero__eyebrow">CODEL / كودل</p>
      <h1 id="hero-heading">نحوّل الأفكار إلى<br><span>منتجات رقمية.</span></h1>
      <p class="hero__description">برمجيات مصممة لتحل مشكلات حقيقية، وتجارب مبنية لتبقى بسيطة وسريعة.</p>
      <div class="hero__actions">
        <a class="hero__primary" href="#work">اكتشف أعمالنا <span aria-hidden="true">↗</span></a>
        <a class="hero__secondary" href="#about">تعرّف علينا</a>
      </div>
    </div>
    <span class="hero__side-note" aria-hidden="true">DESIGN × ENGINEERING</span>
    <span class="hero__bottom-note" aria-hidden="true">DIGITAL PRODUCTS — 2026</span>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  min-height: min(900px, 100svh);
  min-height: max(720px, 100svh);
  display: grid;
  align-items: center;
  overflow: hidden;
  color: #f5f8fb;
  background: #000;
}
.hero__effect { position: absolute; z-index: -2; inset: 0; width: 100%; height: 100%; }
.hero__shade {
  pointer-events: none;
  position: absolute; z-index: -1; inset: 0;
  background: linear-gradient(270deg, rgba(0,0,0,.96) 0%, rgba(0,0,0,.85) 31%, rgba(0,0,0,.22) 65%, rgba(0,0,0,.08) 100%);
}
.hero__content {
  width: min(1140px, calc(100% - 72px));
  margin-inline: auto;
  padding-block: 150px;
  position: relative;
}
.hero__eyebrow {
  margin: 0 0 28px;
  color: #80bde2;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .16em;
}
h1 {
  margin: 0;
  max-width: 750px;
  font-size: clamp(3.3rem, 5.2vw, 6.6rem);
  font-weight: 750;
  letter-spacing: -.065em;
  line-height: 1.14;
}
h1 span { color: #98cdea; }
.hero__description {
  max-width: 500px;
  margin: 32px 0 40px;
  font-size: clamp(1rem, 1.5vw, 1.18rem);
  line-height: 1.9;
  color: #b1bcc6;
}
.hero__actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.hero__actions a {
  padding: 15px 26px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  transition: background 180ms ease, transform 180ms ease;
}
.hero__actions a:hover { transform: translateY(-2px); }
.hero__primary { color: #001625; background: #a0d5f2; }
.hero__primary:hover { background: #c3e8fa; }
.hero__secondary { color: #f5f8fb; border: 1px solid #4b5661; }
.hero__secondary:hover { background: #151f27; }
.hero__side-note {
  position: absolute; left: 33px; bottom: 70px;
  font-size: 11px; letter-spacing: .12em;
  writing-mode: vertical-rl; color: #8894a0;
}
.hero__bottom-note {
  position: absolute; right: 36px; bottom: 25px;
  font-size: 10px; letter-spacing: .18em; color: #707d86;
}
@media (max-width: 760px) {
  .hero { min-height: 760px; align-items: start; }
  .hero__effect { opacity: .64; }
  .hero__shade { background: linear-gradient(to bottom, rgba(0,0,0,.85), rgba(0,0,0,.55) 55%, rgba(0,0,0,.28)); }
  .hero__content { width: min(100% - 40px, 600px); padding-block: 130px 100px; }
  h1 { font-size: clamp(2.8rem, 10vw, 4.3rem); }
  .hero__side-note { display: none; }
  .hero__bottom-note { right: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .hero__actions a { transition: none; }
  .hero__actions a:hover { transform: none; }
}
</style>
