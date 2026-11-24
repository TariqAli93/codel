<script lang="ts">
// One plate of the opening's stack (HomeLayers) and what stands on it, drawn as an isometric line
// drawing. Everything below is worked out once, when the module loads, from one projection, so the
// server renders the finished drawing and no screen coordinate is typed by hand.

// What a plate carries, by the layer it stands for.
export type PlateKind = "custom" | "web" | "mobile" | "desktop" | "servers";

// The plate's own grid: 16 by 16 units, its origin at the rear corner (the top vertex on screen),
// +x toward the right vertex, +y toward the left vertex, +z up.
type Point = readonly [x: number, y: number, z: number];
// A box by its rear bottom corner and its size.
type Box = readonly [
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
];

// One drawn shape. `look` is its classes (the fills and strokes are in the styles below).
type Shape =
  | { tag: "polygon"; look: string; points: string }
  | { tag: "polyline"; look: string; points: string }
  | { tag: "circle"; look: string; cx: number; cy: number; r: number }
  | { tag: "path"; look: string; d: string };

// A run of shapes painted together. One with a `look` is a group that moves as one (the lime part
// that floats over its slot).
interface Part {
  look?: string;
  shapes: Shape[];
}

// Something standing on the plate, with what the painter's order needs: the height it rests at and
// the depth of its front corner.
interface Piece {
  rests: number;
  front: number;
  shapes: Shape[];
}

// The projection, in the drawing's units (the viewBox): a grid unit runs 9.625 across and 5.557
// down, a unit of height 11.114 up.
const ACROSS = 9.625;
const DOWN = 5.557;
const UP = 11.114;
const WIDTH = 308;
const HEIGHT = 194;
const GRID = 16;
const THICKNESS = 1.5;
// From one plate's top face to the next one's, in the drawing's units (HomeLayers stacks them).
const PITCH = 127;
// How far a riser runs on behind the plate above, so the join stays hidden when either layer lifts.
const TUCK = 14;

const round = (value: number) => Math.round(value * 100) / 100;
const screenX = (x: number, y: number) => WIDTH / 2 + ACROSS * (x - y);
const screenY = (x: number, y: number, z: number) => DOWN * (x + y) - UP * z;
const trace = (...corners: Point[]) =>
  corners
    .map(([x, y, z]) => `${round(screenX(x, y))},${round(screenY(x, y, z))}`)
    .join(" ");

const cls = (...names: string[]) =>
  names.map((name) => `plate__${name}`).join(" ");

const polygon = (look: string, ...corners: Point[]): Shape => ({
  tag: "polygon",
  look,
  points: trace(...corners),
});
const stroke = (look: string, ...corners: Point[]): Shape => ({
  tag: "polyline",
  look,
  points: trace(...corners),
});
// A dot keeps its size on screen: only its place is projected.
const dot = (look: string, [x, y, z]: Point, r: number): Shape => ({
  tag: "circle",
  look,
  cx: round(screenX(x, y)),
  cy: round(screenY(x, y, z)),
  r,
});
// A rectangle lying flat at height z, from (x1, y1) to (x2, y2).
const flat = (
  look: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  z: number,
): Shape => polygon(look, [x1, y1, z], [x2, y1, z], [x2, y2, z], [x1, y2, z]);
// A line along x, from x1 to x2 at depth y and height z.
const along = (
  look: string,
  x1: number,
  x2: number,
  y: number,
  z: number,
): Shape => stroke(look, [x1, y, z], [x2, y, z]);

// A box shows three faces: its y-max face (screen left), its x-max face (screen right), its top.
type Material = "graphite" | "slab" | "lime";
const solid = (
  [x, y, z, w, d, h]: Box,
  material: Material,
  marks: Shape[] = [],
): Piece => ({
  rests: z,
  front: x + w + y + d,
  shapes: [
    polygon(
      cls("face", `face--${material}-left`),
      [x, y + d, z + h],
      [x + w, y + d, z + h],
      [x + w, y + d, z],
      [x, y + d, z],
    ),
    polygon(
      cls("face", `face--${material}-right`),
      [x + w, y, z + h],
      [x + w, y + d, z + h],
      [x + w, y + d, z],
      [x + w, y, z],
    ),
    polygon(
      cls("face", `face--${material}-top`),
      [x, y, z + h],
      [x + w, y, z + h],
      [x + w, y + d, z + h],
      [x, y + d, z + h],
    ),
    // What is drawn on it (its top is at z + h).
    ...marks,
  ],
});

// A standing cylinder: a circle on the grid is an ellipse on screen.
const cylinder = (
  x: number,
  y: number,
  radius: number,
  h: number,
  bands: number,
): Piece => {
  const rx = round(ACROSS * radius * Math.SQRT2);
  const ry = round(DOWN * radius * Math.SQRT2);
  const left = round(screenX(x, y) - rx);
  const right = round(left + 2 * rx);
  const foot = round(screenY(x, y, 0));
  const head = round(screenY(x, y, h));
  // The front half of its outline, at a height on screen.
  const frontHalf = (at: number) =>
    `M${left},${at}A${rx},${ry} 0 0 0 ${right},${at}`;
  return {
    rests: 0,
    front: x + y + radius * Math.SQRT2,
    shapes: [
      {
        tag: "path",
        look: cls("face", "face--graphite-right"),
        d: `${frontHalf(foot)}V${head}A${rx},${ry} 0 0 1 ${left},${head}Z`,
      },
      ...Array.from({ length: bands }, (_, index): Shape => ({
        tag: "path",
        look: cls("band", "detail"),
        d: frontHalf(round(screenY(x, y, (h * (index + 1)) / (bands + 1)))),
      })),
      {
        tag: "path",
        look: cls("face", "face--graphite-top"),
        d: `M${left},${head}A${rx},${ry} 0 1 0 ${right},${head}A${rx},${ry} 0 1 0 ${left},${head}Z`,
      },
    ],
  };
};

// The painter's order: what rests on the plate first, by ascending x + y of its front corner; what
// floats over it after.
const paint = (pieces: Piece[]): Shape[] =>
  [...pieces]
    .sort((a, b) => a.rests - b.rests || a.front - b.front)
    .flatMap((piece) => piece.shapes);

// A riser, drawn with the lower of the two plates it joins so it moves with it: from the middle of
// one of that plate's front edges straight up to the underside of the plate above and a little
// further, behind that plate's side. A dot at its foot, and one pulse resting halfway up. The dot
// at its top end belongs to the plate above (`join`, below), so it stays on the join when either
// layer moves.
const riser = (foot: Point): Shape[] => {
  const x = round(screenX(foot[0], foot[1]));
  const from = screenY(...foot);
  const underside = from - (PITCH - THICKNESS * UP);
  return [
    {
      tag: "polyline",
      look: cls("riser"),
      points: `${x},${round(from)} ${x},${round(underside - TUCK)}`,
    },
    {
      tag: "circle",
      look: cls("foot", "detail"),
      cx: x,
      cy: round(from),
      r: 2,
    },
    {
      tag: "circle",
      look: cls("pulse"),
      cx: x,
      cy: round((from + underside) / 2),
      r: 3,
    },
  ];
};
const frontLeft: Point = [GRID / 2, GRID, 0];
const frontRight: Point = [GRID, GRID / 2, 0];
// Where the riser from the plate below meets this plate: under the same edge, on its underside.
const join = ([x, y]: Point): Shape =>
  dot(cls("join", "detail"), [x, y, -THICKNESS], 2);

// The plate: its two sides, its top, the line set in from its edge, then its four edges (the rear
// two catch more light than the front two).
const corners: Point[] = [
  [0, 0, 0],
  [GRID, 0, 0],
  [GRID, GRID, 0],
  [0, GRID, 0],
];
const plate: Shape[] = [
  polygon(
    cls("side", "side--left"),
    [0, GRID, 0],
    [GRID, GRID, 0],
    [GRID, GRID, -THICKNESS],
    [0, GRID, -THICKNESS],
  ),
  polygon(
    cls("side", "side--right"),
    [GRID, 0, 0],
    [GRID, GRID, 0],
    [GRID, GRID, -THICKNESS],
    [GRID, 0, -THICKNESS],
  ),
  polygon(cls("top"), ...corners),
  flat(cls("inset", "detail"), 1, 1, GRID - 1, GRID - 1, 0),
  stroke(
    cls("edge", "edge--front"),
    [0, GRID, 0],
    [GRID, GRID, 0],
    [GRID, 0, 0],
  ),
  stroke(cls("edge", "edge--rear"), [0, GRID, 0], [0, 0, 0], [GRID, 0, 0]),
];
// The right vertex, where the layer's leader starts.
const vertex = dot(cls("vertex"), [GRID, 0, 0], 3);

// Small marks on a slab's top: a window's three dots, a line of text, a lime line.
const dots = (xs: number[], y: number, z: number) =>
  xs.map((x) => dot(cls("dot", "detail"), [x, y, z], 1.1));
const text = (x1: number, x2: number, y: number, z: number) =>
  along(cls("rule", "detail"), x1, x2, y, z);
const lime = (x1: number, x2: number, y: number, z: number) =>
  along(cls("rule", "rule--lime"), x1, x2, y, z);
// Three lights on a server's x-max face. An unlit one is detail; a lit one is the layer's lime.
const leds = ([x, y, , w]: Box, lit: boolean) =>
  [0.5, 1, 1.5].map((step) =>
    dot(
      lit ? cls("led", "led--lit") : cls("led", "detail"),
      [x + w, y + step, 0.7],
      1.1,
    ),
  );
const server = (box: Box, lit: boolean) =>
  solid(box, "graphite", leds(box, lit));

// A whole drawing, in painting order: the plate (with the join of the riser from below), what
// stands on it, the lime part that floats over it, its own riser, and over everything the vertex
// its leader starts from.
interface Layer {
  standing: Shape[];
  floating?: Shape[];
  // The foot of this plate's riser, and the edge the riser from the plate below arrives under.
  riser?: Point;
  joins?: Point;
}
const whole = ({ standing, floating, riser: foot, joins }: Layer): Part[] => [
  { shapes: joins ? [...plate, join(joins)] : plate },
  { shapes: standing },
  ...(floating ? [{ look: cls("lime"), shapes: floating }] : []),
  ...(foot ? [{ shapes: riser(foot) }] : []),
  { shapes: [vertex] },
];

// Each plate with what stands on it. Every layer keeps one lime component. The risers alternate
// sides down the stack: under the front left edge, then the front right.
const drawings: Record<PlateKind, Part[]> = {
  // Two graphite blocks and a lime cube floating over the slot it fits.
  custom: whole({
    standing: [
      flat(cls("slot"), 9, 9, 13, 13, 0),
      ...paint([
        solid([3, 10, 0, 3, 3, 3], "graphite"),
        solid([10, 3, 0, 3, 3, 4], "graphite"),
      ]),
    ],
    floating: solid([9, 9, 3, 4, 4, 4], "lime").shapes,
    joins: frontLeft,
  }),
  // A browser window lying flat, with a lime tile floating over its slot.
  web: whole({
    standing: paint([
      solid([5, 5, 0, 9, 9, 0.5], "slab", [
        ...dots([5.75, 6.75, 7.75], 5.75, 0.5),
        flat(cls("panel", "detail"), 6, 7, 10, 13, 0.5),
        flat(cls("panel", "detail"), 11, 7, 13, 9.5, 0.5),
        flat(cls("slot"), 10.5, 10.5, 13, 13, 0.5),
      ]),
    ]),
    floating: solid([10.5, 10.5, 1.25, 2.5, 2.5, 0.5], "lime").shapes,
    riser: frontLeft,
    joins: frontRight,
  }),
  // Two phones lying flat.
  mobile: whole({
    standing: paint([
      solid([4, 9, 0, 3, 5, 0.5], "slab", [
        text(4.75, 6.25, 10.5, 0.5),
        text(4.75, 6.25, 12, 0.5),
      ]),
      solid([9, 6, 0, 4, 7, 0.5], "slab", [
        lime(10, 12.5, 7.5, 0.5),
        text(10, 12, 9, 0.5),
        text(10, 12.5, 10.5, 0.5),
      ]),
    ]),
    riser: frontRight,
    joins: frontLeft,
  }),
  // A program's window lying flat.
  desktop: whole({
    standing: paint([
      solid([4, 7, 0, 10, 7, 0.5], "slab", [
        ...dots([4.75, 5.75, 6.75], 7.5, 0.5),
        along(cls("rule", "rule--hair", "detail"), 4, 14, 8, 0.5),
        flat(cls("panel", "detail"), 5, 9, 8, 13, 0.5),
        lime(9, 13, 9.5, 0.5),
        text(9, 12, 11, 0.5),
        text(9, 13, 12.5, 0.5),
      ]),
    ]),
    riser: frontLeft,
    joins: frontRight,
  }),
  // A store and three servers; only the front one's lights are on.
  servers: whole({
    standing: paint([
      cylinder(3.5, 11.5, 1.5, 2.5, 2),
      server([7, 11, 0, 6, 2, 2], true),
      server([7, 8, 0, 6, 2, 2], false),
      server([7, 5, 0, 6, 2, 2], false),
    ]),
    riser: frontRight,
  }),
};

// What HomeLayers needs to stack the plates and draw around them, in the same units.
export const plateArt = {
  width: WIDTH,
  height: HEIGHT,
  pitch: PITCH,
  // The top face (as a polygon's points, and corner by corner), and how tall it is on screen.
  face: trace(...corners),
  corners: corners.map(
    ([x, y, z]) => [round(screenX(x, y)), round(screenY(x, y, z))] as const,
  ),
  faceHeight: round(screenY(GRID, GRID, 0)),
  // Where the left and right vertices sit, down from the top one.
  vertex: round(screenY(GRID, 0, 0)),
  // The plate's side, on screen.
  thickness: round(THICKNESS * UP),
} as const;
</script>

<script setup lang="ts">
// Scenery (aria-hidden): the layer's tag in HomeLayers says what it is. Nothing here takes the
// pointer: the drawing moves, so HomeLayers keeps the plates' targets on a layer that does not.
defineProps<{
  kind: PlateKind;
  selected: boolean;
}>();
</script>

<template>
  <svg
    class="plate"
    :class="[`plate--${kind}`, { 'plate--selected': selected }]"
    :viewBox="`0 0 ${plateArt.width} ${plateArt.height}`"
    aria-hidden="true"
    focusable="false"
  >
    <g v-for="(part, index) in drawings[kind]" :key="index" :class="part.look">
      <template v-for="(shape, at) in part.shapes" :key="at">
        <polygon
          v-if="shape.tag === 'polygon'"
          class="plate__shape"
          :class="shape.look"
          :points="shape.points"
        />
        <polyline
          v-else-if="shape.tag === 'polyline'"
          class="plate__shape"
          :class="shape.look"
          :points="shape.points"
        />
        <circle
          v-else-if="shape.tag === 'circle'"
          class="plate__shape"
          :class="shape.look"
          :cx="shape.cx"
          :cy="shape.cy"
          :r="shape.r"
        />
        <path v-else class="plate__shape" :class="shape.look" :d="shape.d" />
      </template>
    </g>
  </svg>
</template>

<style scoped lang="scss">
// $tablet, under which the drawing drops its detail.
@use "~/assets/scss/story" as *;

// Three stroke weights, in screen pixels whatever size the drawing is shown at.
$hair: 0.75px;
$line: 1px;
$accent: 1.5px;
// For the motion, in the drawing's own units (the script's constants; keep them in step): a unit of
// height on screen, and half a riser's run from its foot to the join (PITCH less the plate's side).
$up: 11.114;
$half-run: 55.16;
// A pulse's trip round its riser; and when, after the first paint, the automatic trips start (the
// last riser has been drawn by then), one riser a step after another from the lowest up. The last
// one is back at rest 4.45s after the first paint.
$trip: 2.6s;
$trip-first: 1.4s;
$trip-step: 0.15s;
// A lime part's round into its slot and back.
$settle: 4s;

// Flat fills and strokes only: no gradient, blur or shadow inside the drawing.
.plate {
  overflow: visible;
  // The drawing lets the pointer through to whatever is under its box.
  pointer-events: none;
  // The layers that are not selected step back a little. Their tags and text never dim.
  opacity: 0.88;
  transition: opacity var(--duration-fast) var(--ease-out);

  &--selected {
    opacity: 1;
  }

  &__shape {
    fill: none;
    stroke: none;
    stroke-width: $line;
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }

  // The plate. Its top stands clear of the ground (a step lighter than the raised surface), and
  // lets a little of the layer under it through.
  &__top {
    fill: color-mix(
      in srgb,
      color-mix(in srgb, var(--border) 45%, var(--surface-raised)) 92%,
      transparent
    );
  }

  &__side {
    stroke: color-mix(in srgb, var(--border-strong) 60%, var(--border));

    &--right {
      fill: color-mix(in srgb, var(--surface-raised) 50%, var(--surface));
    }

    &--left {
      fill: var(--surface);
    }
  }

  &__inset {
    stroke: color-mix(in srgb, var(--border-strong) 40%, var(--border));
    stroke-width: $hair;
  }

  &__edge {
    transition: stroke var(--duration-fast) var(--ease-out);

    &--rear {
      stroke: color-mix(in srgb, var(--text) 70%, var(--border-strong));
    }

    &--front {
      stroke: var(--border-strong);
    }
  }

  &__vertex {
    fill: var(--text);
    transition: fill var(--duration-fast) var(--ease-out);
  }

  // The selected layer: its top face's four edges, and the point its leader starts from.
  &--selected &__edge {
    stroke: var(--accent);
    stroke-width: $accent;
  }

  &--selected &__vertex {
    fill: var(--accent);
  }

  // What stands on the plate: graphite blocks, flat slabs (a window, a phone) and the lime parts,
  // each lit from the top.
  &__face {
    stroke: var(--border-strong);

    &--graphite-top {
      fill: color-mix(in srgb, var(--border-strong) 20%, var(--border));
    }

    &--graphite-right {
      fill: var(--border);
    }

    &--graphite-left {
      fill: color-mix(in srgb, var(--border) 50%, var(--surface-raised));
    }

    &--slab-top {
      fill: color-mix(in srgb, var(--border) 50%, var(--surface-raised));
    }

    &--slab-right {
      fill: var(--surface-raised);
    }

    &--slab-left {
      fill: var(--surface);
    }

    &--lime-top,
    &--lime-right,
    &--lime-left {
      stroke: var(--accent);
    }

    &--lime-top {
      fill: var(--accent);
    }

    &--lime-right {
      fill: var(--accent-subtle);
    }

    &--lime-left {
      fill: color-mix(in srgb, var(--accent-subtle) 55%, var(--bg));
    }
  }

  // Where a lime part fits.
  &__slot {
    stroke: color-mix(in srgb, var(--accent) 60%, transparent);
    stroke-width: $hair;
    stroke-dasharray: 2 3;
  }

  &__panel {
    fill: var(--surface);
    stroke: var(--border-strong);
    stroke-width: $hair;
  }

  &__dot {
    fill: var(--text-muted);
  }

  &__rule {
    stroke: var(--border-strong);

    &--hair {
      stroke-width: $hair;
    }

    &--lime {
      stroke: var(--accent);
      stroke-width: $accent;
    }
  }

  &__band {
    stroke: var(--border-strong);
    stroke-width: $hair;
  }

  &__led {
    fill: var(--border-strong);

    &--lit {
      fill: var(--accent);
    }
  }

  &__riser {
    stroke: var(--border-strong);
  }

  &__foot,
  &__join {
    fill: var(--text);
  }

  &__pulse {
    fill: var(--accent);
  }

  // A narrow story draws the stack small: only the plates, what stands on them, the lime parts and
  // the risers stay.
  @container story (width < #{$tablet}) {
    &__detail {
      display: none;
    }
  }
}

// ---------------------------------------------------------------------------
// Motion, for visitors who have not asked for less. Lengths here are the drawing's own units (a
// pixel in an SVG is one of its units). Three kinds, kept apart:
// - the entrance: --enter is when this plate's layer starts to arrive (HomeLayers);
// - one automatic trip of each pulse round its riser, after the entrance and long over within five
//   seconds of the first paint. Plain CSS, played once;
// - the idle loops (the animations named *-idle-*): the pulses going round, the lime parts settling
//   into their slots. They do not exist until the visitor is first with the art: HomeIntro then
//   sets .hero--loops on the hero, which adds them, and from there plays them and lets each run
//   out the round it is in.
// Every trip and every loop starts and ends on the resting picture, so whenever nothing is moving
// the drawing is exactly its still self: no animation is in effect.
// (On one element a later animation wins a property while both are in effect: the loop comes
// first in each list, the entrance and the trip after it, which are kept as they are when the
// list grows.)
// ---------------------------------------------------------------------------

// A pulse's round: up from the midpoint to the join, where it fades out, then in again at the foot
// and up to the midpoint. No opacity at either end: there the pulse keeps whatever it has.
@mixin pulse-round {
  0%,
  100% {
    transform: translateY(0);
  }

  40% {
    opacity: 1;
  }

  50% {
    transform: translateY(#{-$half-run * 1px});
    opacity: 0;
  }

  50.01% {
    transform: translateY(#{$half-run * 1px});
    opacity: 0;
  }

  60% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .plate {
    // The riser grows from its foot up to the plate above once its own plate is nearly in place
    // (a scale, so its stroke keeps its weight), and its dots appear along it: the foot first, the
    // pulse as the line passes it, the join as the line arrives.
    &__riser {
      transform-box: fill-box;
      transform-origin: 50% 100%;
      animation: plate-grow 400ms var(--ease-out)
        calc(var(--enter, 0ms) + 300ms) backwards;
    }

    &__foot {
      animation: plate-appear 200ms var(--ease-out)
        calc(var(--enter, 0ms) + 300ms) backwards;
    }

    // In the plate above this riser, which starts 120ms after the riser's own.
    &__join {
      animation: plate-appear 200ms var(--ease-out)
        calc(var(--enter, 0ms) + 580ms) backwards;
    }

    // The pulse: its entrance, and its one automatic trip.
    &__pulse {
      animation:
        plate-appear 200ms var(--ease-out) calc(var(--enter, 0ms) + 500ms)
          backwards,
        plate-trip $trip linear var(--trip-wait, #{$trip-first});
    }

    &--desktop {
      --pulse-wait: 0.65s;
      --trip-wait: #{$trip-first + $trip-step};
    }

    &--mobile {
      --pulse-wait: 1.3s;
      --trip-wait: #{$trip-first + 2 * $trip-step};
    }

    &--web {
      --pulse-wait: 1.95s;
      --trip-wait: #{$trip-first + 3 * $trip-step};
    }

    &--custom {
      --lime-drop: #{3 * $up * 1px};
    }

    &--web {
      --lime-drop: #{0.75 * $up * 1px};
      --lime-wait: #{$settle * 0.5};
    }

    // The cube completes the entrance: it comes down once every plate is in, and stays floating
    // over its slot.
    &--custom &__lime {
      animation: plate-land 520ms var(--ease-out) 1340ms backwards;
    }
  }

  // The loops. The pulses go round, the four risers 0.65s apart from the lowest up; the lime parts
  // settle into their slots, hold and lift back, the cube on the first plate and half a round out
  // of step the tile on the second.
  .hero--loops {
    .plate__pulse {
      animation:
        plate-idle-pulse $trip linear var(--pulse-wait, 0s) infinite,
        plate-appear 200ms var(--ease-out) calc(var(--enter, 0ms) + 500ms)
          backwards,
        plate-trip $trip linear var(--trip-wait, #{$trip-first});
    }

    .plate__lime {
      animation: plate-idle-settle $settle ease-in-out var(--lime-wait, 0s)
        infinite;
    }

    .plate--custom .plate__lime {
      animation:
        plate-idle-settle $settle ease-in-out infinite,
        plate-land 520ms var(--ease-out) 1340ms backwards;
    }
  }

  @keyframes plate-grow {
    from {
      transform: scaleY(0);
    }
  }

  @keyframes plate-appear {
    from {
      opacity: 0;
    }
  }

  // The individual translate property, so the settling (a transform) can run beside it.
  @keyframes plate-land {
    from {
      opacity: 0;
      translate: 0 -28px;
    }
  }

  @keyframes plate-trip {
    @include pulse-round;
  }

  @keyframes plate-idle-pulse {
    @include pulse-round;
  }

  @keyframes plate-idle-settle {
    0%,
    95%,
    100% {
      transform: translateY(0);
    }

    35%,
    60% {
      transform: translateY(var(--lime-drop, 0px));
    }
  }
}
</style>
