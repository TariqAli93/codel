<script setup lang="ts">
// The home hero's artwork: the letter ن drawn in dots on a faint dot field. The bowl is written the
// way a hand writes it, from the right tip round to the left tip, then its lime نقطة drops in: the
// dot that turns a shape into a letter, as نقطة بلس turns a shop's day into records. Dots swell and
// turn lime near the pointer and the نقطة leans toward it.
// The same drawing ships as public/art/noon.svg: it shows until the canvas has drawn, and stays
// when JavaScript is off. Under reduced motion the canvas draws the finished letter once, still.
// The pen waits for 'play' (the page starts it with its own load sequence), then 'delay' ms more.
const props = withDefaults(defineProps<{ play?: boolean; delay?: number }>(), { play: true, delay: 250 })

const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const live = ref(false)
const landed = ref(false)
const nuqta = ref<HTMLElement | null>(null)

// The drawing on its 640×520 board; the same numbers as public/art/noon.svg.
const BOARD = { w: 640, h: 520, step: 20 }
const NOON = { cx: 320, cy: 210, rx: 178, ry: 140, t: 70, a0: -0.12, a1: Math.PI + 0.12 }
const WRITE_MS = 1400
const REACH = 150 // board units around the pointer that react

interface Dot {
  x: number
  y: number
  fade: number // the field fades out toward the board's edges
  ink: number // 1 inside the letter, 0.55 on its edge, 0 in the field
  order: number // where the pen passes this dot, 0 at the right tip to 1 at the left tip
}

// Signed distance to the bowl (negative inside), and how far along the stroke a point sits.
const bowl = (x: number, y: number) => {
  const ux = x - NOON.cx
  const uy = ((y - NOON.cy) * NOON.rx) / NOON.ry
  let a = Math.atan2(uy, ux)
  if (a < -Math.PI / 2) a += Math.PI * 2
  const order = Math.min(1, Math.max(0, (a - NOON.a0) / (NOON.a1 - NOON.a0)))
  if (a >= NOON.a0 && a <= NOON.a1) {
    return { d: Math.abs(Math.hypot(ux, uy) - NOON.rx) - NOON.t / 2, order }
  }
  const end = (ang: number) => Math.hypot(ux - NOON.rx * Math.cos(ang), uy - NOON.rx * Math.sin(ang)) - NOON.t / 2
  return { d: Math.min(end(NOON.a0), end(NOON.a1)), order }
}

const dots: Dot[] = []
for (let y = BOARD.step / 2; y < BOARD.h; y += BOARD.step) {
  for (let x = BOARD.step / 2; x < BOARD.w; x += BOARD.step) {
    const { d, order } = bowl(x, y)
    const r = Math.hypot((x - BOARD.w / 2) / (BOARD.w / 2), (y - BOARD.h / 2) / (BOARD.h / 2))
    dots.push({ x, y, fade: Math.max(0, Math.min(1, (1 - r) / 0.55)), ink: d < -3 ? 1 : d < 4 ? 0.55 : 0, order })
  }
}

type Rgb = [number, number, number]
const rgb = (value: string, fallback: Rgb): Rgb => {
  const hex = value.trim().match(/^#([0-9a-f]{6})$/i)?.[1]
  return hex ? [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb : fallback
}
const mix = (a: Rgb, b: Rgb, t: number) => a.map((v, i) => Math.round(v + (b[i]! - v) * t)).join(',')
const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))

let cleanup: (() => void) | undefined
let stopWaiting: (() => void) | undefined

onMounted(() => {
  const el = root.value
  const cv = canvas.value
  const ctx = cv?.getContext('2d')
  if (!el || !cv || !ctx) return

  const styles = getComputedStyle(el)
  const field = rgb(styles.getPropertyValue('--border'), [45, 54, 49])
  const edge = rgb(styles.getPropertyValue('--text-muted'), [152, 163, 156])
  const ink = rgb(styles.getPropertyValue('--text'), [243, 246, 244])
  const lime = rgb(styles.getPropertyValue('--accent'), [196, 245, 39])
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches

  let scale = 1
  let start = Number.POSITIVE_INFINITY
  let frame = 0
  let inView = true
  // Pointer in board units, eased; strength fades in and out as it enters and leaves.
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, power: 0, target: 0 }

  const resize = () => {
    const width = el.clientWidth
    const ratio = Math.min(devicePixelRatio || 1, 2)
    scale = width / BOARD.w
    cv.width = Math.round(width * ratio)
    cv.height = Math.round(width * (BOARD.h / BOARD.w) * ratio)
    ctx.setTransform(ratio * scale, 0, 0, ratio * scale, 0, 0)
  }

  const draw = (now: number) => {
    const written = still ? 1 : (now - start) / WRITE_MS
    const t = now / 1000
    pointer.x += (pointer.tx - pointer.x) * 0.14
    pointer.y += (pointer.ty - pointer.y) * 0.14
    pointer.power += (pointer.target - pointer.power) * 0.08

    ctx.clearRect(0, 0, BOARD.w, BOARD.h)
    for (const dot of dots) {
      const near = pointer.power * smooth(1 - Math.hypot(dot.x - pointer.x, dot.y - pointer.y) / REACH)
      let r: number
      let color: string
      let alpha: number
      if (dot.ink > 0) {
        // The pen reaches this dot, then the dot swells from field size to ink size.
        const shown = still ? 1 : smooth((written - dot.order * 0.9) / 0.12)
        r = 1.6 + (dot.ink === 1 ? 3.8 : 2) * shown + 2.4 * near
        color = mix(dot.ink === 1 ? ink : edge, lime, near)
        alpha = Math.max(dot.fade * 0.9, shown) * (still ? 1 : 0.88 + 0.12 * Math.sin(t * 1.4 + dot.x * 0.018 - dot.y * 0.012))
      } else {
        r = 1.6 + 2.6 * near
        color = mix(field, lime, near)
        alpha = Math.max(dot.fade, near)
      }
      if (alpha <= 0.01) continue
      ctx.globalAlpha = alpha
      ctx.fillStyle = `rgb(${color})`
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    if (!landed.value && written >= 1) landed.value = true
    // The نقطة leans toward the pointer, a few pixels at most.
    if (nuqta.value && !still) {
      const dx = (pointer.x - 320) * pointer.power
      const dy = (pointer.y - 86) * pointer.power
      const len = Math.hypot(dx, dy) || 1
      const pull = Math.min(len, 160) / 160
      nuqta.value.style.translate = `${((dx / len) * pull * 14 * scale).toFixed(2)}px ${((dy / len) * pull * 14 * scale).toFixed(2)}px`
    }
  }

  const loop = (now: number) => {
    draw(now)
    frame = inView && !document.hidden ? requestAnimationFrame(loop) : 0
  }
  const wake = () => {
    if (!still && !frame && inView && !document.hidden) frame = requestAnimationFrame(loop)
  }

  const onPointer = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    const box = cv.getBoundingClientRect()
    pointer.tx = (event.clientX - box.left) / scale
    pointer.ty = (event.clientY - box.top) / scale
    const inside = pointer.tx > -REACH && pointer.tx < BOARD.w + REACH && pointer.ty > -REACH && pointer.ty < BOARD.h + REACH
    if (inside && pointer.power < 0.01) {
      pointer.x = pointer.tx
      pointer.y = pointer.ty
    }
    pointer.target = inside ? 1 : 0
  }
  const onLeave = () => {
    pointer.target = 0
  }

  resize()
  const sized = new ResizeObserver(() => {
    resize()
    if (still || !frame) draw(performance.now())
  })
  sized.observe(el)
  const seen = new IntersectionObserver(([entry]) => {
    inView = Boolean(entry?.isIntersecting)
    wake()
  })
  seen.observe(el)
  document.addEventListener('visibilitychange', wake)

  if (still) {
    draw(performance.now())
    landed.value = true
  } else {
    const begin = () => {
      start = performance.now() + props.delay
    }
    if (props.play) begin()
    else stopWaiting = watch(() => props.play, (play) => play && begin())
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    frame = requestAnimationFrame(loop)
  }
  live.value = true

  cleanup = () => {
    stopWaiting?.()
    cancelAnimationFrame(frame)
    sized.disconnect()
    seen.disconnect()
    document.removeEventListener('visibilitychange', wake)
    window.removeEventListener('pointermove', onPointer)
    document.documentElement.removeEventListener('pointerleave', onLeave)
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div
    ref="root"
    class="hero-art"
    :class="{ 'hero-art--live': live, 'hero-art--landed': landed }"
    aria-hidden="true"
  >
    <img class="hero-art__poster" src="/art/noon.svg" alt="" width="640" height="520" fetchpriority="high" />
    <canvas ref="canvas" class="hero-art__canvas" />
    <span ref="nuqta" class="hero-art__nuqta" />
  </div>
</template>

<style scoped lang="scss">
.hero-art {
  position: relative;
  aspect-ratio: 640 / 520;
  pointer-events: none;

  &__poster,
  &__canvas {
    position: absolute;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
  }

  &__canvas {
    opacity: 0;
  }

  // The canvas takes over from the poster once it has drawn.
  &--live &__poster {
    opacity: 0;
  }

  &--live &__canvas {
    opacity: 1;
  }

  // The نقطة: centred on (320, 86) of the 640×520 board, 60 units across. It waits for the pen,
  // then drops in. Its glow sits on its own layer.
  &__nuqta {
    position: absolute;
    inset-inline-start: calc(50% - 30 / 640 * 100%);
    inset-block-start: calc((86 - 30) / 520 * 100%);
    inline-size: calc(60 / 640 * 100%);
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: var(--accent);
    opacity: 0;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      box-shadow: var(--glow-accent);
    }
  }

  &--landed &__nuqta {
    opacity: 1;

    @media (prefers-reduced-motion: no-preference) {
      animation: hero-art-drop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
  }
}

@keyframes hero-art-drop {
  0% {
    opacity: 0;
    transform: translateY(-260%) scale(0.4);
  }

  45% {
    opacity: 1;
  }

  100% {
    transform: none;
  }
}
</style>
