<script setup lang="ts">
import { plateArt, type PlateKind } from "./HomeLayerPlate.vue";

// The opening's picture: a system drawn as five plates, one above the other, each with its tag on
// the reading side. One layer is always selected (the first to begin with): a mouse or a pen moving
// over a tag or a plate, keyboard focus on a tag, and a click or tap on either choose it, and it
// stays chosen. The selected tag opens to show its note.
//
// The parent sizes it: the block is as wide as its box, and reads --leader (the line from a plate to
// its tag), --tag-max (the widest a tag gets) and, for its motion, --stack-w (that width as a
// length) from it. Its motion is CSS (see the styles): the entrance and one automatic pass run by
// themselves and end; the idle loops are added by the parent's .hero--loops, and the parent plays
// them and lets them run out.
const props = defineProps<{
  layers: { name: string; note: string }[];
}>();

const emit = defineEmits<{
  // Another layer was chosen.
  change: [index: number];
}>();

// What stands on each plate, top to bottom. The drawing is made for these five.
const kinds: readonly PlateKind[] = [
  "custom",
  "web",
  "mobile",
  "desktop",
  "servers",
];

// A layer's number in Arabic-Indic digits: ٠١, ٠٢ and on.
const digits = "٠١٢٣٤٥٦٧٨٩";
const numeral = (index: number) =>
  String(index + 1)
    .padStart(2, "0")
    .replace(/\d/g, (digit) => digits[Number(digit)] ?? digit);

const plates = computed(() =>
  props.layers.map((layer, index) => ({
    ...layer,
    kind: kinds[index],
    numeral: numeral(index),
  })),
);

const selected = ref(0);

function select(index: number) {
  if (index === selected.value) return;
  selected.value = index;
  emit("change", index);
}

// The stack leans a little after the pointer: the parent passes where the pointer is across it,
// from -1 to 1, and each layer shifts sideways by its place in the stack, the top one one way and
// the last one the other (the middle one stays where it is).
//
// The shift is written as the layer's own translate, on the layers that move and on nothing else,
// so a pointer move restyles those four elements only. A custom property would cost more, every
// frame: on the stack's root it restyles everything drawn under it (some 220 elements), and even
// one registered as not inheriting, written on each layer, restyles six elements a layer in
// Chromium (both measured). The styles' translate is the same value at rest (no shift, and the
// selected layer's lift, --lift, which this keeps), and it comes back when the shift is taken
// away. No frame of it goes through Vue.
const bodies: HTMLElement[] = [];

function keepBody(element: unknown, index: number) {
  if (element instanceof HTMLElement) bodies[index] = element;
}

// How far a layer shifts at full tilt, in px, for each place it is from the middle of the stack.
const tiltReach = 2;
// The last amount written, and the least change worth writing: under a tenth of a pixel on the
// layers that shift most.
let tilt = 0;
const tiltStep = 0.02;

function setTilt(amount: number) {
  // Back to rest (0) is always written; anything else only once it has moved far enough.
  if (amount === tilt) return;
  if (amount !== 0 && Math.abs(amount - tilt) < tiltStep) return;
  tilt = amount;
  const middle = (bodies.length - 1) / 2;
  bodies.forEach((body, index) => {
    const places = middle - index;
    if (!places) return;
    if (amount) {
      const shift = (amount * places * tiltReach).toFixed(2);
      body.style.translate = `${shift}px var(--lift, 0px)`;
    } else body.style.removeProperty("translate");
  });
}

defineExpose({ setTilt });

// A mouse or a pen chooses by moving over a tag or a plate; a touch chooses by its tap (the
// click). Only a real move counts, never the pointer merely finding itself over something: the
// layers move (the chosen one lifts, all of them breathe and lean), and a layer that moved under a
// resting pointer must not take the choice.
function onMove(event: PointerEvent, index: number) {
  if (event.pointerType !== "touch") select(index);
}

// Where the pointer chooses a plate: each plate's top face where it rests, in the stack's own
// units. A layer of its own that never moves, over the plates that do. The last plate first, so
// where two faces overlap on screen the upper plate's, drawn later, takes the pointer.
const faces = kinds
  .map((_, index) => ({
    index,
    points: plateArt.corners
      .map(([x, y]) => `${x},${y + index * plateArt.pitch}`)
      .join(" "),
  }))
  .reverse();

// What is drawn behind the plates, in the stack's own units: a guide down each side through the
// plates' left and right vertices, and an orbit around the third plate with one node on it.
const { width, height, pitch, vertex, thickness } = plateArt;
const last = (kinds.length - 1) * pitch;
const orbit = {
  cx: width / 2,
  cy: 2 * pitch + vertex + thickness / 2,
  rx: 190.6,
  ry: 110,
};
const nodeAngle = (160 * Math.PI) / 180;
const decor = {
  viewBox: `0 0 ${width} ${last + height}`,
  guides: [0, width],
  guideFrom: vertex,
  guideTo: last + vertex,
  orbit,
  node: {
    cx: Math.round((orbit.cx + orbit.rx * Math.cos(nodeAngle)) * 100) / 100,
    cy: Math.round((orbit.cy - orbit.ry * Math.sin(nodeAngle)) * 100) / 100,
  },
};
const scanBox = `0 0 ${width} ${plateArt.faceHeight}`;
</script>

<template>
  <div class="layers">
    <!-- Behind every plate. An element of its own, with the list's items, for the story's timeline. -->
    <div class="layers__decor" aria-hidden="true" data-reveal>
      <svg class="layers__decor-art" :viewBox="decor.viewBox" focusable="false">
        <line
          v-for="x in decor.guides"
          :key="x"
          class="layers__guide"
          :x1="x"
          :y1="decor.guideFrom"
          :x2="x"
          :y2="decor.guideTo"
        />
        <ellipse
          class="layers__orbit"
          :cx="decor.orbit.cx"
          :cy="decor.orbit.cy"
          :rx="decor.orbit.rx"
          :ry="decor.orbit.ry"
        />
        <circle
          class="layers__node-ring"
          :cx="decor.node.cx"
          :cy="decor.node.cy"
          r="6.5"
        />
        <circle
          class="layers__node"
          :cx="decor.node.cx"
          :cy="decor.node.cy"
          r="3"
        />
      </svg>
    </div>

    <ol class="layers__list" role="list">
      <li
        v-for="(layer, index) in plates"
        :key="layer.name"
        class="layers__item"
        :class="{ 'layers__item--selected': index === selected }"
        data-reveal
      >
        <!-- The story's timeline moves the item itself; anything else that moves a layer moves this. -->
        <div
          :ref="(element) => keepBody(element, index)"
          class="layers__body"
        >
          <HomeLayerPlate
            v-if="layer.kind"
            class="layers__plate"
            :kind="layer.kind"
            :selected="index === selected"
          />
          <span class="layers__callout">
            <span class="layers__leader" aria-hidden="true" />
            <!-- Kept on one line (and out of the formatter's reach): the spaces keep the name and
                 the note apart in the button's accessible name. -->
            <!-- prettier-ignore -->
            <button class="layers__tag" type="button" :aria-current="index === selected ? 'true' : undefined" @pointermove="onMove($event, index)" @focus="select(index)" @click="select(index)"><span class="layers__tag-body"><span class="layers__numeral" aria-hidden="true">{{ layer.numeral }}</span> <span class="layers__name">{{ layer.name }}</span> <span class="layers__note">{{ layer.note }}</span></span></button>
          </span>
        </div>
      </li>
    </ol>

    <!-- The scan plane, between the third plate and the fourth. Not a layer, so not in the list. -->
    <div class="layers__scan" aria-hidden="true" data-reveal>
      <svg class="layers__scan-art" :viewBox="scanBox" focusable="false">
        <polygon class="layers__scan-plane" :points="plateArt.face" />
      </svg>
    </div>

    <!-- Where the pointer chooses a plate. Scenery to assistive technology: the tags make the same
         choice. -->
    <svg
      class="layers__hits"
      :viewBox="decor.viewBox"
      aria-hidden="true"
      focusable="false"
    >
      <polygon
        v-for="face in faces"
        :key="face.index"
        class="layers__hit"
        :points="face.points"
        @pointermove="onMove($event, face.index)"
        @click="select(face.index)"
      />
    </svg>
  </div>
</template>

<style scoped lang="scss">
@use "sass:list";
@use "sass:math";
// $lean, and $tablet, under which the stack is drawn small.
@use "~/assets/scss/story" as *;

// The stack in its drawing's units (plateArt in HomeLayerPlate; keep them in step): five plates,
// each one pitch under the one before.
$plate-w: 308;
$plate-h: 194;
$pitch: 127;
$count: 5;
$stack-h: ($count - 1) * $pitch + $plate-h;
// Where a plate's left and right vertices sit, and how tall its top face is.
$vertex: 88.91;
$face-h: 177.82;
// Turns a tag's content back upright.
$upright: skewX(var(--slant-angle));
// The tag's two lines.
$leading: 1.5;
$note-size: 0.8125rem;

.layers {
  // A tag's own lengths, and the room they leave its name and its note inside the widest tag
  // (--tag-max, less the paddings, the selected tag's border, the number's column and the gap).
  --tag-pad-start: var(--space-4);
  --tag-pad-end: var(--space-5);
  --tag-numeral: 1.3125rem;
  --tag-gap: var(--space-3);
  --tag-room: calc(
    var(--tag-max, 14.75rem) - var(--tag-pad-start) - var(--tag-pad-end) - 3px -
      var(--tag-numeral) - var(--tag-gap)
  );

  position: relative;
  inline-size: 100%;
  aspect-ratio: #{$plate-w} / #{$stack-h};

  // -------------------------------------------------------------------------
  // Behind the plates
  // -------------------------------------------------------------------------

  &__decor {
    position: absolute;
    inset: 0;
    pointer-events: none;

    // The small stack goes without it.
    @container story (width < #{$tablet}) {
      display: none;
    }
  }

  &__decor-art {
    inline-size: 100%;
    block-size: 100%;
    overflow: visible;
    fill: none;
  }

  &__guide,
  &__orbit {
    stroke: color-mix(in srgb, var(--border-strong) 45%, transparent);
    stroke-width: 0.75px;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }

  &__guide {
    stroke-dasharray: 2 4;
  }

  &__orbit {
    stroke-dasharray: 1 5;
  }

  &__node-ring {
    stroke: var(--accent);
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
  }

  &__node {
    fill: var(--accent);
  }

  // -------------------------------------------------------------------------
  // The plates
  // -------------------------------------------------------------------------

  // The list makes no stacking context of its own, so the scan plane can sit between two of its
  // items. Its box and its items' let the pointer through: only a plate's top face and a tag take it.
  &__list {
    position: absolute;
    inset: 0;
    margin: 0;
    padding: 0;
    list-style: none;
    pointer-events: none;
  }

  // Each plate overlaps the one under it. The story's timeline moves the items (transform and
  // opacity) when the chapter leaves, so nothing else may transform them.
  &__item {
    position: absolute;
    inset-inline: 0;
    block-size: math.percentage(math.div($plate-h, $stack-h));
    pointer-events: none;

    @for $place from 1 through $count {
      &:nth-child(#{$place}) {
        inset-block-start: math.percentage(
          math.div(($place - 1) * $pitch, $stack-h)
        );
        z-index: $count + 1 - $place;
      }
    }
  }

  &__body {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__plate {
    position: absolute;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
  }

  // Halfway between the third plate and the fourth: over the fourth item (the same z-index, later
  // in the document) and under the third.
  &__scan {
    position: absolute;
    z-index: $count + 1 - 4;
    inset-inline: 0;
    inset-block-start: math.percentage(math.div(2.5 * $pitch, $stack-h));
    block-size: math.percentage(math.div($face-h, $stack-h));
    pointer-events: none;
  }

  &__scan-art {
    inline-size: 100%;
    block-size: 100%;
    overflow: visible;
  }

  // A hair line: only the selected layer carries the heavy lime outline.
  &__scan-plane {
    fill: color-mix(in srgb, var(--accent) 10%, transparent);
    stroke: var(--accent);
    stroke-width: 0.75px;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }

  // Where the pointer chooses a plate: the plates' top faces where they rest, unpainted, over
  // everything in the stack's box and never moving. Only the faces take the pointer, and on the
  // cinematic stage the opening switches them off while another chapter is on show (--hero-hit).
  &__hits {
    position: absolute;
    z-index: $count + 1;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
    overflow: visible;
    pointer-events: none;
  }

  &__hit {
    fill: transparent;
    pointer-events: var(--hero-hit, auto);
    cursor: pointer;
  }

  // -------------------------------------------------------------------------
  // The tags
  // -------------------------------------------------------------------------

  // From the plate's right vertex toward the reading side: the leader, then the tag, both centred
  // on the vertex's line (the box has no height, so the tag grows evenly above and below it).
  &__callout {
    position: absolute;
    inset-block-start: math.percentage(math.div($vertex, $plate-h));
    inset-inline-end: 100%;
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    inline-size: max-content;
    block-size: 0;
  }

  &__leader {
    flex: none;
    inline-size: var(--leader, 3rem);
    block-size: 1px;
    background-color: var(--border-strong);
    transition: background-color var(--duration-fast) var(--ease-out);
  }

  // A leaning pill; its content is turned back upright. Closed it is one line, the name; open (the
  // selected one) the note shows under the name. It changes size at once (layout is never
  // animated); only its colours and the note's opacity ease.
  &__tag {
    position: relative;
    flex: none;
    display: grid;
    align-content: center;
    max-inline-size: var(--tag-max, 14.75rem);
    min-block-size: var(--control-sm);
    padding-block: var(--space-1);
    padding-inline: var(--tag-pad-start) var(--tag-pad-end);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg);
    background-color: var(--surface-raised);
    font-size: var(--text-small);
    line-height: $leading;
    text-align: start;
    color: var(--text);
    cursor: pointer;
    // On the cinematic stage the opening switches it off while another chapter is on show.
    pointer-events: var(--hero-hit, auto);
    transform: $lean;
    transition:
      background-color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);

    // The closed pill is a small control: its target reaches the full touch size (the box it is
    // set out from is inside the pill's 1px borders).
    &::before {
      content: "";
      position: absolute;
      inset-inline: 0;
      inset-block: calc((var(--control-sm) - var(--touch-target)) / 2 - 1px);
    }

    @media (hover: hover) {
      &:hover {
        background-color: color-mix(
          in srgb,
          var(--border) 60%,
          var(--surface-raised)
        );
      }
    }

    &:active {
      background-color: var(--surface);
    }
  }

  // The number at the reading start in a column of its own, the name beside it, the note under the
  // name only.
  &__tag-body {
    position: relative;
    display: grid;
    grid-template-columns: var(--tag-numeral) minmax(0, auto);
    column-gap: var(--tag-gap);
    align-items: baseline;
    transform: $upright;
  }

  &__numeral {
    grid-area: 1 / 1;
    font-size: $note-size;
    font-weight: 500;
    color: var(--text-muted);
    transition: color var(--duration-fast) var(--ease-out);
  }

  &__name {
    grid-area: 1 / 2;
    font-weight: 500;
    white-space: nowrap;
  }

  // The note, under the name: one line wherever the widest tag has room for it. It fades in as its
  // tag opens.
  &__note {
    grid-area: 2 / 2;
    inline-size: max-content;
    max-inline-size: var(--tag-room);
    font-size: $note-size;
    font-weight: 400;
    text-wrap: pretty;
    color: var(--text-muted);
    transition: opacity var(--duration-base) var(--ease-out);
  }

  // A closed tag's note is clipped away, never removed: it is still part of the button's name.
  // Only with JavaScript: without it nothing could open a tag, so every note shows.
  .js &__item:not(.layers__item--selected) &__note {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    opacity: 0;
  }

  // The selected layer: its tag open and ringed in lime, its leader lime.
  &__item--selected &__tag {
    padding-block: var(--space-2);
    border-width: 1.5px;
    border-color: var(--accent);
  }

  &__item--selected &__name {
    font-weight: 700;
  }

  &__item--selected &__numeral {
    color: var(--accent-text);
  }

  &__item--selected &__leader {
    block-size: 1.5px;
    background-color: var(--accent);
  }

  // The small stack: a tag has less room, so it closes up, enough for every note to keep to one
  // line from 22.5rem of story width. Should a name still not fit, it wraps rather than run out
  // of its tag.
  @container story (width < #{$tablet}) {
    --tag-pad-start: var(--space-3);
    --tag-pad-end: var(--space-3);
    --tag-numeral: 1.25rem;
    --tag-gap: var(--space-2);

    &__name {
      max-inline-size: var(--tag-room);
      white-space: normal;
    }
  }

  // The narrowest phones: closer still and a size smaller, so the longest name keeps to one line.
  @container story (width < 22.5rem) {
    --tag-pad-start: var(--space-2);
    --tag-pad-end: var(--space-2);
    --tag-gap: var(--space-1);

    &__tag {
      font-size: $note-size;
    }

    &__numeral,
    &__note {
      font-size: var(--text-caption);
    }
  }
}

// Without JavaScript every tag is open. On the lowest covers the stack is small enough for two
// open tags to touch, so each closes up a little.
html:not(.js) .layers__tag {
  @media #{$cover-low} {
    padding-block: var(--space-1);
  }
}

// And on a phone five open tags do not fit beside a small stack at all: the drawing goes and the
// layers are a plain list.
html:not(.js) .layers {
  @container story (width < 30rem) {
    aspect-ratio: auto;

    .layers__scan,
    .layers__hits,
    .layers__plate,
    .layers__leader {
      display: none;
    }

    .layers__list {
      position: static;
      display: grid;
      row-gap: var(--space-3);
    }

    .layers__item,
    .layers__body,
    .layers__callout {
      position: static;
      block-size: auto;
    }

    .layers__callout {
      inline-size: auto;
      flex-direction: row;
    }

    .layers__tag {
      max-inline-size: 100%;
    }

    .layers__name,
    .layers__note {
      inline-size: auto;
      max-inline-size: none;
    }
  }
}

// ---------------------------------------------------------------------------
// Motion, for visitors who have not asked for less. Four kinds, kept apart:
// - the entrance, plain CSS from the first paint, each keyframe running toward the resting style;
// - one automatic pass of the scan plane, after the entrance and long over within five seconds of
//   the first paint. Plain CSS, played once;
// - what follows a choice or the pointer: the selected layer lifts, the stack leans after a mouse;
// - the idle loops (the animations named *-idle-*): the plates breathing, the scan plane's cycle.
//   They do not exist until the visitor is first with the art: HomeIntro then sets .hero--loops on
//   the hero, which adds them, and from there plays them and lets each run out the round it is in.
// The pass and every loop start and end on the resting picture, so whenever nothing is moving the
// stack is exactly its still self (but for the layer that is chosen): no animation is in effect.
// (On one element a later animation wins a property while both are in effect: the loop comes
// first in each list, the entrance and the pass after it, which are kept as they are when the
// list grows.)
// The story's timeline tweens the items, the decor and the scan plane's box (transform and
// opacity) when the chapter leaves. None of those carries an animation of its own on opacity or on
// a transform (GSAP would take a half-run entrance for the element's own value and put it back):
// whatever fades or moves is an element inside them. The box's own animation is its z-index only.
// ---------------------------------------------------------------------------

// The stack arrives from its foundation up: the last plate first, each plate above it a step later.
$enter-first: 300ms;
$enter-step: 120ms;
// How long each plate takes to breathe, top to bottom: never two in step.
$breaths: 3.8s, 4.4s, 4.1s, 4.8s, 4.3s;
// The scan plane's run: it fades out where it rests, runs up through the stack at one speed, and
// fades back in where it rests. From under the last plate to just beneath the first plate's
// underside, where it fades out, so it never crosses what stands on that plate; both in pitches
// down from the stack's top (it rests at 2.5).
$scan-leave: 0.15s;
$scan-run: 2.4s;
$scan-return: 0.2s;
$scan-rest: 2.5;
$scan-from: 4.4;
$scan-to: 0.2;
// The idle loop is the run and then a rest, this long in all. The automatic pass is the run alone,
// once, starting when the plane's own entrance is over: it is back at rest 4.25s after the first
// paint.
$scan-cycle: 6s;
$scan-pass: $scan-leave + $scan-run + $scan-return;
$scan-pass-wait: 1.5s;

// A moment of the scan's run, as a keyframe of an animation that long.
@function scan-at($time, $length) {
  @return math.percentage(math.div($time, $length));
}

// How far from its rest the plane is at a height, in its own heights (what translateY takes).
@function scan-shift($pitches) {
  @return math.percentage(math.div(($pitches - $scan-rest) * $pitch, $face-h));
}

// The plane: out where it rests, in under the last plate, up at one speed, out under the first
// plate, and in again where it rests (then resting, in an animation longer than the run).
@mixin scan-run($length) {
  0%,
  #{scan-at($scan-leave + $scan-run + $scan-return, $length)},
  100% {
    transform: translateY(0);
    opacity: 1;
  }

  #{scan-at($scan-leave, $length)} {
    transform: translateY(0);
    opacity: 0;
  }

  #{scan-at($scan-leave + 0.001s, $length)} {
    transform: translateY(scan-shift($scan-from));
    opacity: 0;
  }

  #{scan-at($scan-leave + 0.2s, $length)},
  #{scan-at($scan-leave + $scan-run - 0.3s, $length)} {
    opacity: 1;
  }

  #{scan-at($scan-leave + $scan-run, $length)} {
    transform: translateY(scan-shift($scan-to));
    opacity: 0;
  }

  #{scan-at($scan-leave + $scan-run + 0.001s, $length)} {
    transform: translateY(0);
    opacity: 0;
  }
}

// Its place among the plates, stepped at the moment it passes each one's top face: in front of
// every plate under it, behind every plate over it (an item's z-index counts up from the last
// plate; the plane comes after the items in the document, so an equal z-index puts it in front).
// A plate the run stops short of is never passed.
@mixin scan-depth($length) {
  0%,
  #{scan-at($scan-leave + $scan-run + 0.001s, $length)},
  100% {
    z-index: $count + 1 - 4;
  }

  #{scan-at($scan-leave + 0.001s, $length)} {
    z-index: 0;
  }

  @for $place from $count through 1 {
    $passed: math.div($scan-from - ($place - 1), $scan-from - $scan-to);

    @if $passed < 1 {
      #{scan-at($scan-leave + $passed * $scan-run, $length)} {
        z-index: $count + 1 - $place;
      }
    }
  }
}

@media (prefers-reduced-motion: no-preference) {
  .layers__item {
    @for $place from 1 through $count {
      &:nth-child(#{$place}) {
        --enter: #{$enter-first + ($count - $place) * $enter-step};
        --breath: #{list.nth($breaths, $place)};
      }
    }

    // The selected layer stands a little proud of the stack (--stack-w is the parent's).
    &--selected {
      --lift: calc(var(--stack-w) * -0.04);
    }
  }

  // The layer itself: where the selection puts it (translate; while a mouse is over the art the
  // script writes the same translate with the lean's sideways shift in it, see setTilt) and its
  // entrance (toward that same translate, so it lands wherever it should be). What holds keyboard
  // focus is shown at once, never part-way in.
  .layers__body {
    translate: 0px var(--lift, 0px);
    transition: translate var(--duration-base) var(--ease-out);
    animation: layers-rise 560ms var(--ease-out) var(--enter, 0ms) backwards;

    &:focus-within {
      animation-duration: 0s;
      animation-delay: 0s;
    }
  }

  // Its breathing (a transform, beside the translate).
  .hero--loops .layers__body {
    animation:
      layers-idle-breathe var(--breath, 6s) ease-in-out infinite,
      layers-rise 560ms var(--ease-out) var(--enter, 0ms) backwards;

    &:focus-within {
      animation-duration: var(--breath, 6s), 0s;
      animation-delay: 0s;
    }
  }

  // The tag follows its plate out: from a little nearer the plate (the site is right to left only).
  .layers__callout {
    animation: layers-call 400ms var(--ease-out) calc(var(--enter, 0ms) + 420ms)
      backwards;

    &:focus-within {
      animation-duration: 0s;
      animation-delay: 0s;
    }
  }

  .layers__decor-art {
    animation: layers-fade var(--duration-slow) var(--ease-out) 900ms backwards;
  }

  // While the plane runs, its box changes its place among the plates; the plane inside it fades in
  // and does the moving. Once: the automatic pass, straight after its entrance.
  .layers__scan {
    animation: layers-pass-depth $scan-pass step-end $scan-pass-wait;
  }

  .layers__scan-art {
    animation:
      layers-fade 300ms var(--ease-out) 1200ms backwards,
      layers-pass $scan-pass linear $scan-pass-wait;
  }

  // And round and round: the loop.
  .hero--loops .layers__scan {
    animation:
      layers-idle-depth $scan-cycle step-end infinite,
      layers-pass-depth $scan-pass step-end $scan-pass-wait;
  }

  .hero--loops .layers__scan-art {
    animation:
      layers-idle-scan $scan-cycle linear infinite,
      layers-fade 300ms var(--ease-out) 1200ms backwards,
      layers-pass $scan-pass linear $scan-pass-wait;
  }

  @keyframes layers-fade {
    from {
      opacity: 0;
    }
  }

  @keyframes layers-rise {
    from {
      opacity: 0;
      translate: 0 28px;
    }
  }

  @keyframes layers-call {
    from {
      opacity: 0;
      translate: -8px 0;
    }
  }

  // Under 4px either way at the stack's full size.
  @keyframes layers-idle-breathe {
    0%,
    100% {
      transform: translateY(0);
    }

    25% {
      transform: translateY(calc(var(--stack-w, 0px) * -0.012));
    }

    75% {
      transform: translateY(calc(var(--stack-w, 0px) * 0.012));
    }
  }

  @keyframes layers-pass {
    @include scan-run($scan-pass);
  }

  @keyframes layers-idle-scan {
    @include scan-run($scan-cycle);
  }

  @keyframes layers-pass-depth {
    @include scan-depth($scan-pass);
  }

  @keyframes layers-idle-depth {
    @include scan-depth($scan-cycle);
  }
}
</style>
