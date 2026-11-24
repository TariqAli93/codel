<script setup lang="ts">
const failed = ref(false)
</script>
<template>
  <section class="v4-hero v83-hero" aria-labelledby="v83-title">
    <div class="v83-background" aria-hidden="true">
      <svg class="v83-fallback" viewBox="0 0 1440 850" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id="v83-grid" width="70" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(-10)"><path d="M70 0H0V70" fill="none" stroke="var(--border-strong)" stroke-opacity=".22"/></pattern><linearGradient id="v83-plane" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--surface-raised)"/><stop offset="1" stop-color="var(--bg)"/></linearGradient></defs><rect width="1440" height="850" fill="var(--bg)"/><rect width="1440" height="850" fill="url(#v83-grid)"/><g transform="translate(30 38)" stroke-linejoin="round"><path d="M-110 645 350 390 790 630 330 885Z" fill="var(--surface)" stroke="var(--border)" stroke-width="2"/><path d="M-110 685 350 430 790 670 M-30 734 430 479 M55 782 515 527 M140 831 600 576 M225 880 685 625 M70 545 510 785 M175 485 615 725 M280 425 720 665" fill="none" stroke="var(--border-strong)" stroke-opacity=".32"/><g class="v83-art-plane"><path d="M70 470 390 292 695 457 375 638Z" fill="url(#v83-plane)" stroke="var(--border-strong)" stroke-width="1.6"/><path d="M70 470v24l305 166 320-179v-24M375 638v22" fill="none" stroke="var(--border-strong)" stroke-width="1.6"/><path d="M136 459 391 318 631 448 376 590Z" fill="none" stroke="var(--accent)" stroke-opacity=".55" stroke-width="1.6"/></g><g class="v83-art-plane v83-art-middle"><path d="M70 351 390 173 695 338 375 519Z" fill="url(#v83-plane)" stroke="var(--border-strong)" stroke-width="1.6"/><path d="M70 351v24l305 166 320-179v-24M375 519v22" fill="none" stroke="var(--border-strong)" stroke-width="1.6"/><path d="M165 350 288 282 392 338 269 407Z M322 437 462 359 567 416 427 495Z" fill="var(--surface-raised)" stroke="var(--border-strong)"/><path d="M195 350 266 311 M211 361 282 322 M350 438 449 383 M368 448 467 393" stroke="var(--accent)" stroke-opacity=".7" stroke-width="2"/></g><g class="v83-art-plane v83-art-top"><path d="M70 232 390 54 695 219 375 400Z" fill="url(#v83-plane)" stroke="var(--border-strong)" stroke-width="1.8"/><path d="M70 232v24l305 166 320-179v-24M375 400v22" fill="none" stroke="var(--border-strong)" stroke-width="1.5"/><path d="M130 233 389 89 632 221 374 365Z" fill="none" stroke="var(--accent)" stroke-opacity=".7" stroke-width="1.6"/><path d="M260 207 389 136 514 204 385 276Z" fill="var(--accent)" fill-opacity=".14" stroke="var(--accent)" stroke-width="2"/><path d="M323 207 389 170 452 204 386 241Z" fill="var(--accent)" fill-opacity=".75" stroke="var(--accent)"/><path d="M389 136v-36M514 204l48-27M385 276v38" fill="none" stroke="var(--accent)" stroke-width="1.5"/></g><path class="v83-signal" d="M70 256v238l305 166 320-179V219L390 54" fill="none" stroke="var(--accent)" stroke-opacity=".7" stroke-width="2" stroke-dasharray="14 14"/><g fill="var(--accent)"><circle cx="70" cy="256" r="3.5"/><circle cx="375" cy="660" r="3.5"/><circle cx="695" cy="481" r="3.5"/></g></g></svg>
      <img v-if="!failed" class="v83-stock" src="https://images.unsplash.com/vector-1761384690980-b218fa986838?auto=format&amp;fit=max&amp;w=1920&amp;q=85" width="1920" height="1440" alt="" fetchpriority="high" decoding="async" @error="failed = true">
    </div>
    <div class="workline-shell v83-content"><div class="v9-hero-copy">
      <p class="v4-caption">برمجيات لأصحاب الأعمال في العراق</p>
      <h1 id="v83-title"><span class="v4-line"><span>وقتك لأعمالك.</span></span><span class="v4-line"><span>والباقي علينا.</span></span></h1>
      <div class="v4-hero-intro"><p>برامج جاهزة تنظم عملك، وبرمجيات خاصة تُبنى على احتياجاتك. اختر ما يناسب أعمالك وابدأ من هناك.</p><div class="actions"><ActionLink look="solid" :glow="false" to="/contact" label="ناقش مشروعك ↖" /><ActionLink look="outline" size="lg" to="/solutions" label="تصفّح البرامج ↖" /></div></div>
    </div></div>
    <div class="workline-shell v83-bottom"><a href="#discover" class="v83-scroll"><span>اكتشف ما يناسب أعمالك</span><span aria-hidden="true">↓</span></a><a class="v83-credit" href="https://unsplash.com/illustrations/isometric-business-people-interacting-with-technology-and-data-lyKf9UWWrdg" target="_blank" rel="noopener noreferrer" dir="ltr">VectorElements / Unsplash ↗</a></div>
  </section>
</template>
<style scoped lang="scss">
.v83-content{display:grid}
.v83-hero h1{font-family:var(--font-hero);font-weight:700}
.v4-caption{display:flex;align-items:center;gap:12px;font-size:14px;&:before{content:'';width:32px;height:2px;background:var(--accent);transform:skewX(calc(-1 * var(--slant-angle)))}}
.v4-line{display:block;overflow:hidden;>span{display:block;animation:workline-rise .95s var(--ease-out) both} &:nth-child(2)>span{color:var(--accent);animation-delay:100ms}}
.actions{display:flex}
.v83-scroll{text-decoration:none}
@keyframes workline-rise{from{opacity:.4;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
.v4-hero.v83-hero{min-height:calc(100vh - var(--header-height));min-height:calc(100svh - var(--header-height));padding:0;gap:0;display:grid;grid-template-rows:minmax(0,1fr) auto;isolation:isolate;position:relative;overflow:hidden;border-block-end:1px solid var(--border);background:var(--bg)}
.v83-background{position:absolute;inset:0;z-index:-1;pointer-events:none;overflow:hidden;background:var(--bg)}
.v83-background .v83-fallback,.v83-background .v83-stock{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;object-position:50% 50%;border:0;border-radius:0;background:transparent;transform:none;transition:none;display:block}
.v83-background .v83-stock{z-index:1;filter:brightness(.83) saturate(.82);animation:v83-bg-in .9s var(--ease-out) both}
.v83-background .v83-stock.failed{visibility:hidden}
.v83-background:after{content:'';position:absolute;inset:0;z-index:2;background:linear-gradient(270deg,var(--bg) 0%,rgba(16,20,17,.98) 25%,rgba(16,20,17,.86) 43%,rgba(16,20,17,.37) 65%,rgba(16,20,17,.05) 100%),linear-gradient(0deg,var(--bg) 0%,rgba(16,20,17,.06) 24%,transparent 76%,rgba(16,20,17,.30) 100%)}
.v4-hero.v83-hero .v83-content{position:relative;z-index:1;grid-template-columns:minmax(0,1fr);align-content:center;align-items:center;gap:0;min-width:0;padding-block:clamp(46px,8vh,100px) clamp(32px,6vh,76px)}
.v83-content .v9-hero-copy{width:min(100%,730px)}
.v83-hero h1{font-size:clamp(48px,7.4vw,114px);line-height:1.22;letter-spacing:normal;margin-block:0 22px}
.v83-hero .v4-caption{color:var(--text);margin-block-end:22px}
.v83-hero .v4-line{padding-block:3px 10px}
.v83-hero .v4-hero-intro{max-width:38rem}
.v83-hero .v4-hero-intro p{color:var(--text);max-width:34rem;font-size:clamp(16px,1.55vw,22px);line-height:1.85}
.v83-hero .actions{gap:18px;flex-wrap:wrap;margin-top:26px}
.v83-hero .actions :deep(.action){min-height:52px}
.v83-bottom{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:16px;padding-block:14px 24px}
.v83-scroll{display:inline-flex;min-height:44px;align-items:center;gap:14px;background:transparent;border:0;color:var(--text);padding:0 5px;text-align:start;font-size:13px;max-width:100%;transform:skewX(-10deg)}
.v83-scroll>span{display:inline-block;transform:skewX(10deg)}
.v83-scroll>span:last-child{font-size:20px;line-height:1;color:var(--accent);transition:translate .25s var(--ease-out)}
.v83-scroll:hover>span:last-child{translate:0 5px}
.v83-credit{font-size:11px;color:var(--text);text-underline-offset:3px;text-decoration:underline;opacity:.75;text-align:end}
.v83-credit:hover{opacity:1}
.v83-discovery{padding-block:clamp(36px,5vw,72px);background:var(--bg);scroll-margin-block-start:12px}
.v83-art-plane{animation:v83-assemble .95s var(--ease-out) both}.v83-art-middle{animation-delay:.1s}.v83-art-top{animation-delay:.2s}.v83-signal{animation:v83-signal-in 1.6s var(--ease-out) both}
@keyframes v83-assemble{from{opacity:0;translate:0 26px}to{opacity:1;translate:0 0}}@keyframes v83-signal-in{from{opacity:0;stroke-dashoffset:55}to{opacity:1;stroke-dashoffset:0}}@keyframes v83-bg-in{from{opacity:0}to{opacity:1}}
@media(max-width:850px){.v4-hero.v83-hero .v83-content{padding-block:clamp(36px,7vh,70px) 40px}.v83-content .v9-hero-copy{width:min(100%,670px)}.v83-hero h1{font-size:clamp(45px,10vw,88px)}.v83-background:after{background:linear-gradient(270deg,rgba(16,20,17,.96),rgba(16,20,17,.72) 58%,rgba(16,20,17,.43)),linear-gradient(0deg,var(--bg),transparent 40%,rgba(16,20,17,.28))}.v83-background .v83-stock,.v83-background .v83-fallback{object-position:30% 50%}.v83-hero .actions{gap:14px}}
@media(max-width:560px){.v83-hero h1{font-size:clamp(37px,10.7vw,61px);margin-block-end:16px}.v83-hero .v4-caption{margin-block-end:14px}.v83-hero .v4-hero-intro p{font-size:16px;margin-bottom:18px}.v83-hero .actions{margin-top:16px;gap:12px;padding-inline:4px}.v83-hero .actions :deep(.action){min-height:48px}.v83-background:after{background:linear-gradient(270deg,rgba(16,20,17,.88),rgba(16,20,17,.75)),linear-gradient(0deg,var(--bg),transparent 33%,rgba(16,20,17,.18))}.v83-bottom{flex-wrap:wrap;padding-block:8px 18px;gap:6px}.v83-credit{font-size:10px}.v83-scroll{font-size:12px}}
@media(prefers-reduced-motion:reduce){.v83-background *, .v83-art-plane,.v83-signal{animation:none!important;transition:none!important}}
</style>
