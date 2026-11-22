<script setup lang="ts">
interface Particle {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
}

const root = ref<HTMLElement | null>(null);
const wordmark = ref<HTMLImageElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const active = ref(false);

const motionQuery =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)";

let media: MediaQueryList | undefined;
let observer: ResizeObserver | undefined;
let context: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let pointer: { x: number; y: number } | null = null;
let frame: number | undefined;
let width = 0;
let height = 0;
let influence = 0;
let scatter = 0;
let dotRadius = 0;

function cancelFrame() {
  if (frame !== undefined) cancelAnimationFrame(frame);
  frame = undefined;
}

function reset() {
  active.value = false;
  pointer = null;
  cancelFrame();
}

// Read pixels from the REAL brand asset. No retyped or approximate wordmark.
function makeParticles(): boolean {
  const host = root.value;
  const image = wordmark.value;
  const layer = canvas.value;
  if (!host || !image?.complete || !image.naturalWidth || !layer) return false;

  const bounds = host.getBoundingClientRect();
  const nextWidth = Math.round(bounds.width);
  const nextHeight = Math.round(bounds.height);
  if (nextWidth < 1 || nextHeight < 1) return false;

  const mask = document.createElement("canvas");
  mask.width = nextWidth;
  mask.height = nextHeight;
  const maskContext = mask.getContext("2d", { willReadFrequently: true });
  const drawContext = layer.getContext("2d");
  if (!maskContext || !drawContext) return false;

  let pixels: Uint8ClampedArray;
  try {
    maskContext.drawImage(image, 0, 0, nextWidth, nextHeight);
    pixels = maskContext.getImageData(0, 0, nextWidth, nextHeight).data;
  } catch {
    // If the image cannot be sampled, leave the original SVG untouched.
    return false;
  }

  // Density scales with logo size; cap device pixels at 2x for a light canvas.
  const step = Math.max(3, Math.ceil(Math.sqrt((nextWidth * nextHeight) / 6000)));
  const nextParticles: Particle[] = [];
  for (let y = Math.floor(step / 2); y < nextHeight; y += step) {
    for (let x = Math.floor(step / 2); x < nextWidth; x += step) {
      const alpha = pixels[(y * nextWidth + x) * 4 + 3];
      if (alpha !== undefined && alpha > 130) {
        nextParticles.push({ homeX: x, homeY: y, x, y });
      }
    }
  }
  if (nextParticles.length < 20) return false;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  layer.width = Math.round(nextWidth * dpr);
  layer.height = Math.round(nextHeight * dpr);
  drawContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawContext.fillStyle = window.getComputedStyle(host).color;

  context = drawContext;
  particles = nextParticles;
  width = nextWidth;
  height = nextHeight;
  dotRadius = Math.max(1, step * 0.29);
  influence = Math.max(28, Math.min(105, nextWidth * 0.085));
  scatter = Math.max(9, Math.min(29, nextWidth * 0.025));
  return true;
}

function draw() {
  frame = undefined;
  const ctx = context;
  if (!active.value || !ctx) return;

  ctx.clearRect(0, 0, width, height);
  let largestStep = 0;

  for (const particle of particles) {
    let targetX = particle.homeX;
    let targetY = particle.homeY;

    if (pointer) {
      const dx = particle.homeX - pointer.x;
      const dy = particle.homeY - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0 && distance < influence) {
        const falloff = 1 - distance / influence;
        const push = scatter * falloff * falloff;
        targetX += (dx / distance) * push;
        targetY += (dy / distance) * push;
      }
    }

    const moveX = (targetX - particle.x) * 0.22;
    const moveY = (targetY - particle.y) * 0.22;
    particle.x += moveX;
    particle.y += moveY;
    largestStep = Math.max(largestStep, Math.abs(moveX), Math.abs(moveY));

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stop requesting frames when settled; a new pointer move wakes it up.
  if (largestStep > 0.075) frame = requestAnimationFrame(draw);
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerType !== "mouse" || !media?.matches) return;
  if (!active.value && !makeParticles()) return;

  const bounds = root.value?.getBoundingClientRect();
  if (!bounds) return;
  pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  active.value = true;
  if (frame === undefined) frame = requestAnimationFrame(draw);
}

function onMediaChange() {
  if (!media?.matches) reset();
}

onMounted(() => {
  media = window.matchMedia(motionQuery);
  media.addEventListener("change", onMediaChange);
  if (root.value) {
    observer = new ResizeObserver(() => {
      if (!active.value) return;
      reset();
    });
    observer.observe(root.value);
  }
});

onBeforeUnmount(() => {
  reset();
  media?.removeEventListener("change", onMediaChange);
  observer?.disconnect();
});
</script>

<template>
  <span
    ref="root"
    class="footer-particles"
    :class="{ 'footer-particles--active': active }"
    @pointerenter="onPointerMove"
    @pointermove="onPointerMove"
    @pointerleave="reset"
    @pointercancel="reset"
  >
    <img
      ref="wordmark"
      class="footer-particles__image"
      src="/brand/codel-full-lime.svg"
      alt=""
      width="672"
      height="117"
      loading="lazy"
    />
    <canvas ref="canvas" class="footer-particles__canvas" aria-hidden="true" />
  </span>
</template>

<style scoped lang="scss">
.footer-particles {
  position: relative;
  display: block;
  inline-size: 100%;
  color: var(--accent);

  &__image {
    display: block;
    inline-size: 100%;
    block-size: auto;
  }

  &__canvas {
    position: absolute;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
    opacity: 0;
    pointer-events: none;
  }

  @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none) {
    &__image,
    &__canvas {
      transition: opacity var(--duration-fast) var(--ease-out);
    }

    &--active &__image {
      opacity: 0;
    }

    &--active &__canvas {
      opacity: 1;
    }
  }
}
</style>
