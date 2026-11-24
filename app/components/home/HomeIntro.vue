<script setup lang="ts">
import IsoFloor from "~/components/effects/IsoFloor.vue";
import { motionQuery } from "~/composables/home/storyConfig";
import type { PillarIcon } from "./HomePillars.vue";

// 01 Codel: the offer on the reading side, and beside it a system drawn as five layers on a floor
// grid (HomeLayers on IsoFloor), with three pillars under the offer. One root: the chapter.
//
// All of the text below is a draft of the owner's brief, not yet reviewed (see CLAUDE.md, Home
// page), kept here like the other chapters' draft lines and passed down as props.
const title = { first: "نبني برمجياتك", second: "طبقة فوق طبقة" };
const lede =
  "من الخوادم إلى الواجهة، نطوّر كل طبقة في نظامك ونربطها معاً لتعمل بأتمتة ذكية وحماية مستمرة.";
const primary = { label: "ابدأ مشروعك", to: "/contact" };
const secondary = { label: "استعرض الحلول", to: "/solutions" };
const offer = "حلول جاهزة · تطوير حسب الطلب";

// The stack's layers, top to bottom.
const layers: { name: string; note: string }[] = [
  { name: "تطوير البرمجيات", note: "أنظمة مخصصة لطريقة عملك" },
  { name: "تطبيقات الويب", note: "مواقع وأنظمة على المتصفح" },
  { name: "تطبيقات الموبايل", note: "تطبيقات على هواتف عملائك" },
  { name: "تطبيقات سطح المكتب", note: "للحسابات والمخازن والكاشير" },
  { name: "إدارة الخوادم", note: "إعداد السيرفرات ومتابعتها" },
];

const pillars: { word: string; line: string; icon: PillarIcon }[] = [
  { word: "أتمتة", line: "مهام متكررة تُنجز تلقائياً", icon: "automation" },
  { word: "ذكاء", line: "بيانات تتحول إلى قرارات", icon: "intelligence" },
  { word: "أمان", line: "حماية ومراقبة مستمرة", icon: "security" },
];

// ---------------------------------------------------------------------------
// Motion, in three kinds that are kept apart.
// 1. The entrance, and 2. one automatic pass after it (each pulse once round its riser, the scan
//    plane once up the stack): plain CSS from the first paint, finite, over within five seconds of
//    it (WCAG 2.2.2), and nothing here has a hand in either.
// 3. The idle loops (the plates breathing, the pulses, the scan, the lime parts settling, the
//    pillars taking turns, the floor's swell): only while the hero is "live", which is only once
//    the visitor is with the art. A mouse or a pen moving over the art, focus moving into it, or a
//    layer being chosen makes it live, and it stays so for a moment after the last of those; then
//    every loop runs out the round it is in and stops where it began.
// So whenever nothing is moving the hero is exactly its still picture (the one reduced motion
// shows), but for which layer is chosen. None of the third kind under reduced motion: the styles
// are all under no-preference, and this never goes live or leans the stack.
// ---------------------------------------------------------------------------

// How long after the first paint the automatic pass is over (its last move ends at 4.45s, in the
// styles): the loops never start before it. And how long the hero stays live after the visitor's
// last move with the art.
const passMs = 4600;
const keepMs = 1500;

// Read during setup: whether this mount is the page's hydration, when the entrance started with
// the first paint, or a client-side navigation, when it starts with the mount.
const hydrating = import.meta.client && useNuxtApp().isHydrating === true;

const root = ref<HTMLElement | null>(null);
const art = ref<HTMLElement | null>(null);
const stack = ref<{ setTilt: (amount: number) => void } | null>(null);
// Also the class hero--live on the root, and passed to the pillars and the floor.
const live = ref(false);
// The class hero--loops on the root: the styles add the loops under it. Set the first time the
// hero goes live and kept, so until then no loop exists at all.
const looping = ref(false);

let motion: MediaQueryList | undefined;
let mountedAt = 0;
// When live ends, on the page's clock. One timer re-checks it, so a move only writes a number and
// the state flips only when it changes.
let liveUntil = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let frame = 0;
let pointerX = 0;

// The loops are CSS animations (the ones the styles name *-idle-*; scoped styles add a suffix).
// They start as the class adds them, and are found then: one that has run out is no longer
// listed, but it is still there to play again.
let loops: CSSAnimation[] = [];

function findLoops() {
  loops = (root.value?.getAnimations({ subtree: true }) ?? []).filter(
    (animation): animation is CSSAnimation =>
      animation instanceof CSSAnimation &&
      animation.animationName.includes("-idle-"),
  );
}

function playLoops() {
  for (const loop of loops) {
    loop.effect?.updateTiming({ iterations: Infinity });
    if (loop.playState !== "running") loop.play();
  }
}

// Each loop finishes the round it is in, so it stops on the resting pose it started from. One
// still waiting for its turn never starts.
function endLoops() {
  for (const loop of loops) {
    if (loop.playState !== "running") continue;
    const round = loop.effect?.getComputedTiming().currentIteration;
    if (typeof round === "number")
      loop.effect?.updateTiming({ iterations: Math.floor(round) + 1 });
    else loop.cancel();
  }
}

function setLive(on: boolean) {
  if (live.value === on) return;
  live.value = on;
  if (!on) {
    endLoops();
  } else if (looping.value) {
    playLoops();
  } else {
    // The first time: the class adds the loops, running. Once they are in the document they are
    // found, and ended at once should live already be over.
    looping.value = true;
    void nextTick(() => {
      findLoops();
      if (!live.value) endLoops();
    });
  }
}

// When the automatic pass is over: counted from the first paint on hydration (from the mount where
// the browser does not report it), from the mount on a client-side navigation.
function passOver() {
  const painted = hydrating
    ? performance.getEntriesByName("first-contentful-paint")[0]?.startTime
    : undefined;
  return (painted ?? mountedAt) + passMs;
}

function checkLive() {
  timer = undefined;
  const now = performance.now();
  if (liveUntil <= now) {
    setLive(false);
    return;
  }
  // Not before the automatic pass is over: until then, look again when it is, or when the
  // visitor's last move has lapsed.
  const over = passOver();
  if (now >= over) setLive(true);
  const next = now >= over ? liveUntil : Math.min(over, liveUntil);
  timer = setTimeout(checkLive, Math.max(0, next - now));
}

function keepLive() {
  if (!motion?.matches) return;
  liveUntil = performance.now() + keepMs;
  if (timer === undefined) checkLive();
}

function stopMotion() {
  if (timer !== undefined) clearTimeout(timer);
  timer = undefined;
  liveUntil = 0;
  setLive(false);
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  stack.value?.setTilt(0);
}

// The stack leans after a mouse (never a touch or a pen): once a frame at most, from where the
// pointer is across the art, -1 at its left edge to 1 at its right.
function lean() {
  frame = 0;
  const box = art.value?.getBoundingClientRect();
  if (!box || !box.width) return;
  const across = ((pointerX - box.left) / box.width) * 2 - 1;
  stack.value?.setTilt(Math.max(-1, Math.min(1, across)));
}

// Over the art only: a visitor following the text with the pointer does not set the scenery
// moving.
function onPointerMove(event: PointerEvent) {
  if (event.pointerType === "touch" || !motion?.matches) return;
  keepLive();
  if (event.pointerType !== "mouse") return;
  pointerX = event.clientX;
  if (!frame) frame = requestAnimationFrame(lean);
}

function onPointerLeave() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  stack.value?.setTilt(0);
}

// Reduced motion switched on takes the animations away with the styles: the loops are forgotten,
// and added afresh should it be switched off again.
function onMotionChange(event: MediaQueryListEvent) {
  if (event.matches) return;
  stopMotion();
  loops = [];
  looping.value = false;
}

onMounted(() => {
  mountedAt = performance.now();
  motion = window.matchMedia(motionQuery);
  motion.addEventListener("change", onMotionChange);
});

onBeforeUnmount(() => {
  motion?.removeEventListener("change", onMotionChange);
  stopMotion();
  loops = [];
});
</script>

<template>
  <StoryChapter name="intro" labelledby="home-title">
    <div
      ref="root"
      class="hero"
      :class="{ 'hero--live': live, 'hero--loops': looping }"
    >
      <div class="hero__copy">
        <!-- Kept on one line (and out of the formatter's reach): the space keeps the two lines
             apart in the heading's text. -->
        <!-- prettier-ignore -->
        <h1 id="home-title" class="hero__title"><span class="hero__title-line hero__title-line--light" data-mask><span class="hero__title-words" data-mask-inner>{{ title.first }}</span></span> <span class="hero__title-line hero__title-line--strong" data-mask><span class="hero__title-words" data-mask-inner>{{ title.second }}</span></span></h1>
        <span class="hero__rule" aria-hidden="true" data-reveal />
        <!-- The story's timeline tweens the paragraph; what fades in is the text in it. -->
        <p class="hero__lede" data-reveal>
          <span class="hero__lede-text">{{ lede }}</span>
        </p>
        <div class="hero__actions" data-reveal>
          <ActionLink look="solid" :to="primary.to">
            <span class="hero__call"
              >{{ primary.label }}<span class="hero__glyph" aria-hidden="true"
            /></span>
          </ActionLink>
          <ActionLink class="hero__more" look="text" :to="secondary.to">
            <span class="hero__more-label"
              >{{ secondary.label
              }}<span class="hero__ring" aria-hidden="true"
                ><span class="hero__glyph hero__glyph--small" /></span
            ></span>
          </ActionLink>
        </div>
        <p class="hero__offer" data-reveal>
          <span class="hero__offer-line"
            ><span class="hero__check" aria-hidden="true" />{{ offer }}</span
          >
        </p>
      </div>

      <div
        ref="art"
        class="hero__art"
        @pointermove="onPointerMove"
        @pointerleave="onPointerLeave"
        @focusin="keepLive"
      >
        <div class="hero__stack">
          <!-- The floor is the opening's own scenery: the story's timeline fades it out with the
               chapter (data-stage="glow"). -->
          <IsoFloor class="hero__floor" data-stage="glow" :live="live" />
          <HomeLayers ref="stack" :layers="layers" @change="keepLive" />
        </div>
      </div>

      <HomePillars
        class="hero__pillars"
        :items="pillars"
        :live="live"
        data-reveal
      />
    </div>
  </StoryChapter>
</template>

<style scoped lang="scss">
// $cover, $cover-room, $side and $lean.
@use "~/assets/scss/story" as *;

// From this story width the whole stack shows, centred with its tags (under it the stack is small
// and run off the end edge). The pillars sit side by side from the same width (HomePillars).
$across: 30rem;

// The headline's second line (the wider one) is about this many ems wide at weight 800, with a
// little slack: the size that fits it to a measure is the measure over this.
$title-fit: 7.2;
// The stack's proportions (HomeLayers): its height over its width, and how far its tags' leaders
// reach, in stack widths.
$stack-ratio: 2.28;
$leader: 0.175;
// The widest a tag gets.
$tag-max: 14.75rem;
// The hero's glyphs, drawn as masks: the black is only the mask's shape, the colour is the
// element's own.
$glyph-arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 12H5m6-6-6 6 6 6'/%3E%3C/svg%3E");
$glyph-check: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='11'/%3E%3Cpath d='m7.6 12.4 3 3 5.8-6.2'/%3E%3C/svg%3E");

// ---------------------------------------------------------------------------
// The layout. Three ways, from one set of elements in reading order (the offer, the stack, the
// pillars):
// - a narrow story (under $across): one column, the stack small and run off the end edge so its
//   tags have the rest of the row;
// - from $across: one column, the whole stack centred with its tags;
// - from $side, and in the cover: the offer and the pillars on the reading side, the stack beside
//   them. In the cover the whole of it fits one window.
// The lengths the parts share are set here, on the block.
// ---------------------------------------------------------------------------

// From $side, and in the cover where the story is at least $cover-room wide (a cover window with
// a classic scrollbar is a little under $side wide; a window whose text alone is enlarged matches
// the cover's query, which is in the browser's own ems, but is not that wide in rems, and flows in
// one column). Outside the cover the page simply flows: the stack is
// sized by the column's width alone and everything starts at the top. In the cover ($fits-window)
// the stack is also no taller than the room between the header and the window's bottom edge, the
// type follows the window's height, and the offer and the pillars sit together (the two rows share
// what the stack's height adds), centred beside the stack.
@mixin beside($fits-window: false) {
  --hero-gap: clamp(var(--space-5), 2.5cqi, var(--space-7));
  --copy-col: calc(var(--content-w) * 0.5);
  --art-track: calc(var(--content-w) - var(--copy-col) - var(--hero-gap));
  // How far the stack may run past the column toward the window's edge.
  --art-bleed: clamp(0px, var(--edge) - var(--page-gutter), var(--space-8));
  --tag-max: #{$tag-max};
  --leader: calc(var(--stack-w) * #{$leader});
  --art-w: calc(var(--stack-w) * #{1 + $leader} + var(--tag-max));

  @if $fits-window {
    --art-room: calc(100svh - var(--room-top) - var(--cover-pad));
    --stack-w: min(
      19.25rem,
      var(--art-room) / #{$stack-ratio},
      (var(--art-track) + var(--art-bleed) - var(--tag-max)) / #{1 + $leader}
    );
    --title-size: min(
      var(--text-hero),
      var(--copy-col) / #{$title-fit},
      9.4svh
    );
    --lede-size: min(
      clamp(1rem, 0.9464rem + 0.2679vw, 1.25rem),
      max(1rem, 2.9svh)
    );
  } @else {
    --stack-w: min(
      19.25rem,
      (var(--art-track) + var(--art-bleed) - var(--tag-max)) / #{1 + $leader}
    );
    --title-size: min(var(--text-hero), var(--copy-col) / #{$title-fit});
  }

  grid-template-columns: var(--copy-col) minmax(0, 1fr);
  grid-template-rows: auto auto;
  grid-template-areas:
    "copy art"
    "pillars art";
  gap: var(--rhythm-l) var(--hero-gap);
  align-items: start;

  .hero__copy {
    grid-area: copy;

    @if $fits-window {
      align-self: end;
    }
  }

  .hero__pillars {
    grid-area: pillars;
  }

  // The stack at the end side of its box, its tags reaching back toward the text; the box runs
  // past the column only by what the track lacks.
  .hero__art {
    grid-area: art;
    justify-self: end;
    inline-size: var(--art-w);
    margin-inline-end: min(0px, var(--art-track) - var(--art-w));

    @if $fits-window {
      align-self: center;
    }
  }

  .hero__stack {
    margin-inline-end: 0;
  }
}

.hero {
  // The steps between the offer's parts: rule to lede and actions to offer (s), lede to actions
  // (m), offer to pillars (l). They follow the window's height, so the cover closes up on a laptop.
  --rhythm-s: clamp(var(--space-3), 2.4svh, var(--space-5));
  --rhythm-m: clamp(var(--space-4), 3.6svh, var(--space-6));
  --rhythm-l: clamp(var(--space-5), 4.6svh, var(--space-7));
  --title-size: min(
    var(--text-hero),
    var(--content-w) / #{$title-fit},
    max(2.5rem, 11svh)
  );
  --lede-size: clamp(1rem, 0.9464rem + 0.2679vw, 1.25rem);
  // A narrow story: 28% of the stack is off the end edge, and a tag has what is left of the row.
  --stack-w: clamp(9.75rem, 48cqi, 13rem);
  --stack-h: calc(var(--stack-w) * #{$stack-ratio});
  --leader: calc(var(--stack-w) * 0.06);
  --tag-max: min(
    #{$tag-max},
    var(--content-w) + var(--edge) - 0.78 * var(--stack-w)
  );
  // Whether the stack's tags and its plates' faces take the pointer (HomeLayers).
  --hero-hit: auto;

  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: var(--space-7);
  // Its parts are layered among themselves only (the text over the stack and its floor), never
  // over another chapter's on the stage.
  isolation: isolate;
  font-family: var(--font-hero);

  @container story (width >= #{$across}) {
    --stack-w: min(15rem, (var(--content-w) - #{$tag-max}) / #{1 + $leader});
    --leader: calc(var(--stack-w) * #{$leader});
    --tag-max: #{$tag-max};
    --art-w: calc(var(--stack-w) * #{1 + $leader} + var(--tag-max));
  }

  @container story (width >= #{$side}) {
    @include beside;
  }

  @media #{$cover} {
    @container story (width >= #{$cover-room}) {
      @include beside($fits-window: true);
    }
  }
}

// On the cinematic stage the chapters share one frame: while another chapter is on show, nothing
// of the opening takes the pointer (StoryChapter switches the rest off; these set it themselves).
.story--cinematic .chapter:not([data-active]) .hero {
  --hero-hit: none;
}

// ---------------------------------------------------------------------------
// The offer
// ---------------------------------------------------------------------------

.hero {
  // Over the stack and its floor, whatever reaches this far.
  &__copy,
  &__pillars {
    position: relative;
    z-index: 1;
    min-inline-size: 0;
  }

  // Two lines, each kept whole: the first light, the second heavy and fitted to the measure.
  &__title {
    margin: 0;
    font-family: inherit;
    font-size: var(--title-size);
    line-height: 1.25;
  }

  // Each line a mask a little larger than its line box (the letters' tails and marks run past it),
  // so the words leave through its top edge. The lines never wrap: the fallback font sets them
  // wider, and a line allowed to wrap would jump as the hero's font arrives.
  &__title-line {
    display: block;
    inline-size: fit-content;
    white-space: nowrap;
    clip-path: inset(-0.3em -0.25em -0.3em -0.25em);

    &--light {
      font-weight: 300;
    }

    &--strong {
      font-weight: 800;
    }
  }

  &__title-words {
    display: inline-block;
  }

  // A short leaning lime bar under the headline, at the reading start. The lean is on its own
  // layer: the story's timeline moves the element.
  &__rule {
    display: block;
    inline-size: calc(var(--space-7) + var(--space-2));
    block-size: 3px;
    margin-block-start: var(--space-2);

    &::before {
      content: "";
      display: block;
      block-size: 100%;
      border-radius: var(--radius-pill);
      background-color: var(--accent);
      transform: $lean;
    }
  }

  &__lede {
    max-inline-size: 21em;
    margin-block-start: var(--rhythm-s);
    font-size: var(--lede-size);
    line-height: 1.8;
    color: var(--text-muted);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-5);
    margin-block-start: var(--rhythm-m);
    font-size: var(--text-body);

    // The buttons set their own family (ActionLink): here they are set like the rest of the hero.
    :deep(.action) {
      font-family: inherit;
    }
  }

  // The main call's label and its arrow, both inside the part of the button that is turned back
  // upright.
  &__call {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
  }

  // Forward is to the left (the site is right to left only).
  &__glyph {
    flex: none;
    inline-size: 1.25em;
    block-size: 1.25em;
    background-color: currentColor;
    mask: $glyph-arrow center / contain no-repeat;

    &--small {
      inline-size: 1rem;
      block-size: 1rem;
    }
  }

  // The second call: a step lighter than the main one, its words (the link's underline is under
  // them only), then the arrow in a ring. The ring is not a button, so it does not lean.
  &__actions &__more {
    font-weight: 500;
  }

  // A flex box, not an inline one: an underline does not carry into an inline box.
  &__more-label {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  &__ring {
    display: grid;
    flex: none;
    place-items: center;
    inline-size: 2rem;
    block-size: 2rem;
    border: 1px solid var(--border-strong);
    border-radius: 50%;
    color: var(--text);
    transition: background-color var(--duration-fast) var(--ease-out);
  }

  @media (hover: hover) {
    &__more:hover &__ring {
      background-color: var(--surface-raised);
    }
  }

  // What the company offers, after a ringed check.
  &__offer {
    margin-block-start: var(--rhythm-s);
    font-size: var(--text-small);
    line-height: 1.7;
    color: var(--text-muted);
  }

  &__offer-line {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  &__check {
    flex: none;
    inline-size: 1.125rem;
    block-size: 1.125rem;
    background-color: var(--accent-text);
    mask: $glyph-check center / contain no-repeat;
  }
}

// ---------------------------------------------------------------------------
// The stack and its floor
// ---------------------------------------------------------------------------

.hero {
  // The stack at the end side of its box. On a narrow story it is pushed on past the window's end
  // edge (the page clips it), so 28% of it is out of sight and the tags get the room.
  &__art {
    display: grid;
    justify-items: end;
    min-inline-size: 0;

    @container story (width >= #{$across}) {
      justify-self: center;
      inline-size: var(--art-w);
    }
  }

  &__stack {
    position: relative;
    isolation: isolate;
    inline-size: var(--stack-w);
    margin-inline-end: calc(-1 * (var(--edge) + 0.28 * var(--stack-w)));

    @container story (width >= #{$across}) {
      margin-inline-end: 0;
    }
  }

  // The floor, behind the layers: 4.2 stack widths across and centred on the stack, from just
  // over half way down it to a little under its foot, where its own fade ends (IsoFloor). In the
  // floor's own terms the stack's foot is then at 50% across and 0.2605 of its width down.
  // In the cover it reaches at least the window's bottom edge. On the stage that edge cuts it; as a
  // page whatever is left of it fades out in the room above the next chapter, never at a hard line.
  &__floor {
    position: absolute;
    z-index: -1;
    inset-inline: calc(var(--stack-w) * -1.6);
    inset-block: 52% calc(var(--stack-h) * -0.12);
    overflow: hidden;
    pointer-events: none;

    @media #{$cover} {
      @container story (width >= #{$cover-room}) {
        inset-block-end: calc(
          -1 *
            max(
              var(--stack-h) * 0.12,
              var(--cover-pad) + (var(--art-room) - var(--stack-h)) / 2
            )
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// The entrance: plain CSS, so it starts with the first paint and waits for nothing. The text comes
// first and fast (the headline reads by about 450ms), then the lede, the calls, the offer and the
// pillars (HomePillars); the stack builds itself beside them from its foundation up (HomeLayers),
// over a floor that fades in (IsoFloor). All of it is over within two seconds. Every keyframe runs toward the
// resting style, which is what shows without motion.
// The story's timeline tweens the headline's words, the rule, the lede, the calls' row, the offer
// and the pillars (transform and opacity). None of those may carry an animation of its own on
// opacity or on a transform: GSAP takes whatever such an animation shows at the moment it first
// renders for the element's own value, and puts it back when the scroll returns (a visitor who
// scrolled during the entrance came back to a half-faded opening). So every entrance here is on
// something inside the tweened element: a pseudo-element, a child, the text's own span. Only the
// headline's wipe is on a tweened element, and it is a clip-path, which the timeline never sets.
// ---------------------------------------------------------------------------

@media (prefers-reduced-motion: no-preference) {
  // Each line wiped in from the reading start, the second a step after the first.
  .hero__title-words {
    animation: hero-wipe var(--duration-slow) var(--ease-out) backwards;
  }

  .hero__title-line--strong .hero__title-words {
    animation-delay: var(--stagger);
  }

  .hero__rule::before {
    animation: hero-draw var(--duration-slow) var(--ease-out) 200ms backwards;
  }

  .hero__lede-text {
    animation: hero-fade-lede var(--duration-slow) var(--ease-out) 240ms
      backwards;
  }

  // The individual translate property: the main call leans with transform.
  .hero__actions > * {
    animation: hero-forward var(--duration-slow) var(--ease-out) 280ms backwards;

    & + * {
      animation-delay: 340ms;
    }
  }

  // Keyboard focus can get there first: what holds focus is shown at once, never half-faded. The
  // entrance is finished, not removed, so it never replays when focus moves on.
  .hero__actions > :focus-within {
    animation-duration: 0s;
    animation-delay: 0s;
  }

  .hero__offer-line {
    animation: hero-fade var(--duration-slow) var(--ease-out) 400ms backwards;
  }

  @keyframes hero-fade {
    from {
      opacity: 0;
    }
  }

  // The lede's own fade starts a hair above nothing. On a phone it is the largest text on screen,
  // and a browser does not count text at opacity 0 as painted: from 0 it would be reported as
  // painted only when the fade ends, from 0.01 with the first paint. It looks the same.
  @keyframes hero-fade-lede {
    from {
      opacity: 0.01;
    }
  }

  // From the inline start, the right edge (the site is right to left only), past the words' ends
  // and the letters' tails and marks, so nothing is cut; with backwards fill nothing is left
  // clipping once it ends.
  @keyframes hero-wipe {
    from {
      clip-path: inset(-40% -0.3em -40% calc(100% + 0.3em));
    }

    to {
      clip-path: inset(-40% -0.3em -40% -0.3em);
    }
  }

  // In the bar's own leaning coordinates, so the wipe's edge leans with it.
  @keyframes hero-draw {
    from {
      clip-path: inset(0 0 0 100%);
    }

    to {
      clip-path: inset(0);
    }
  }

  // Forward is to the left (right to left): from a little to the right.
  @keyframes hero-forward {
    from {
      opacity: 0;
      translate: 1rem 0;
    }
  }
}

// Without JavaScript on a phone the layers are a plain list (HomeLayers): no stack, no floor.
html:not(.js) .hero {
  @container story (width < 30rem) {
    .hero__art {
      justify-items: stretch;
    }

    .hero__stack {
      inline-size: 100%;
      margin-inline-end: 0;
    }

    .hero__floor {
      display: none;
    }
  }
}
</style>
