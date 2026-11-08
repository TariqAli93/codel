<script setup lang="ts">
// A dot pinned to the pointer and a ring that lags behind it, drawn over the page. The system cursor
// stays as it is. Only for a hovering, fine pointer, and never under reduced motion.
const pointerQuery = '(hover: hover) and (pointer: fine)'
const reducedQuery = '(prefers-reduced-motion: reduce)'
const interactive = 'a, button, input'

const follow = 0.14
const hoverScale = 1.9
const scaleFollow = 0.22
// Same values as $ring-size and $dot-size in the styles below.
const ringSize = 36
const dotSize = 6

// Stays false on the server and until mount, so the first render has no cursor to hydrate.
const enabled = ref(false)
// False until the pointer first moves and while it is outside the window.
const present = ref(false)
const ring = ref<HTMLElement | null>(null)
const dot = ref<HTMLElement | null>(null)

let x = 0
let y = 0
let ringX = 0
let ringY = 0
let scale = 1
let overInteractive = false
let frame = 0
let pointerMedia: MediaQueryList | undefined
let reducedMedia: MediaQueryList | undefined

function onPointerMove(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  x = event.clientX
  y = event.clientY
  // Entering the window the ring starts on the pointer instead of sweeping in from its last place.
  if (!present.value) {
    ringX = x
    ringY = y
    present.value = true
  }
  overInteractive = Boolean(document.elementFromPoint(x, y)?.closest(interactive))
}

function onPointerLeave() {
  overInteractive = false
  present.value = false
}

function tick() {
  ringX += (x - ringX) * follow
  ringY += (y - ringY) * follow
  scale += ((overInteractive ? hoverScale : 1) - scale) * scaleFollow
  if (ring.value) {
    ring.value.style.transform = `translate(${ringX - ringSize / 2}px, ${ringY - ringSize / 2}px) scale(${scale})`
  }
  if (dot.value) {
    dot.value.style.transform = `translate(${x - dotSize / 2}px, ${y - dotSize / 2}px)`
  }
  frame = requestAnimationFrame(tick)
}

function start() {
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.documentElement.addEventListener('pointerleave', onPointerLeave)
  frame = requestAnimationFrame(tick)
}

function stop() {
  cancelAnimationFrame(frame)
  window.removeEventListener('pointermove', onPointerMove)
  document.documentElement.removeEventListener('pointerleave', onPointerLeave)
  overInteractive = false
  present.value = false
  scale = 1
}

function syncEnabled() {
  enabled.value = Boolean(pointerMedia?.matches && !reducedMedia?.matches)
}

watch(enabled, (on) => (on ? start() : stop()))

onMounted(() => {
  pointerMedia = window.matchMedia(pointerQuery)
  reducedMedia = window.matchMedia(reducedQuery)
  pointerMedia.addEventListener('change', syncEnabled)
  reducedMedia.addEventListener('change', syncEnabled)
  syncEnabled()
})

onBeforeUnmount(() => {
  pointerMedia?.removeEventListener('change', syncEnabled)
  reducedMedia?.removeEventListener('change', syncEnabled)
  stop()
})
</script>

<template>
  <template v-if="enabled">
    <div v-show="present" ref="ring" class="dot-ring__ring" aria-hidden="true" />
    <div v-show="present" ref="dot" class="dot-ring__dot" aria-hidden="true" />
  </template>
</template>

<style scoped lang="scss">
// Same values as ringSize and dotSize in the script.
$ring-size: 36px;
$dot-size: 6px;

.dot-ring {
  &__ring,
  &__dot {
    position: fixed;
    inset-block-start: 0;
    inset-inline-start: 0;
    z-index: 40;
    // clientX counts from the left, so the inline start has to be the left on this RTL site too.
    direction: ltr;
    border-radius: 50%;
    pointer-events: none;
    will-change: transform;
  }

  &__ring {
    box-sizing: border-box;
    inline-size: $ring-size;
    block-size: $ring-size;
    border: 1.5px solid var(--cursor-color);
  }

  &__dot {
    inline-size: $dot-size;
    block-size: $dot-size;
    background-color: var(--cursor-color);
  }
}
</style>
