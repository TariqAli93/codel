<script setup lang="ts">
import type { Solution, SolutionImage } from "~/data/solutions";

const props = withDefaults(
  defineProps<{
    solution: Solution;
    number?: number;
    total?: number;
    level?: 2 | 3;
    layout?: "showcase" | "condition";
  }>(),
  { level: 3, layout: "showcase" },
);
const active = ref(0);
const direction = ref(1);
const shot = computed(() => props.solution.images[active.value]);
const positionLabel = computed(() =>
  props.number !== undefined && props.total !== undefined
    ? `${String(props.number).padStart(2, "0")} / ${String(props.total).padStart(2, "0")}`
    : "",
);
const gallery = ref<HTMLDialogElement | null>(null);
const opener = ref<HTMLButtonElement | null>(null);
const galleryOpen = ref(false);
const failedSrc = ref("");
const hasInteracted = ref(false);
const retryKey = ref(0);
const stageImage = ref<HTMLImageElement | null>(null);
const thumbnailFailures = reactive(new Set<string>());
onMounted(() => {
  const image = stageImage.value;
  if (image?.complete && image.naturalWidth === 0 && shot.value)
    failedSrc.value = shot.value.src;
});
function onImageError(event: Event) {
  const image = event.currentTarget as HTMLImageElement;
  const current = shot.value;
  if (current && image.getAttribute("src") === current.src)
    failedSrc.value = current.src;
}
function retryImage() {
  failedSrc.value = "";
  retryKey.value++;
}
const names: Record<string, string> = {
  pos: "نقطة البيع",
  dashboard: "لوحة التحكم",
  inventory: "المخزون",
  "sales-report": "التقارير",
  properties: "العروض العقارية",
  property: "تفاصيل العقار",
};
function label(item: SolutionImage) {
  const key =
    item.src
      .split("/")
      .pop()
      ?.replace(/\.webp$/, "") ?? "";
  return names[key] ?? item.alt.split(":")[0] ?? item.alt;
}
function select(index: number, motionDirection?: number) {
  if (index === active.value || !props.solution.images[index]) return;
  direction.value = motionDirection ?? (index > active.value ? 1 : -1);
  failedSrc.value = "";
  hasInteracted.value = true;
  active.value = index;
}
function step(delta: number) {
  const length = props.solution.images.length;
  if (length) select((active.value + delta + length) % length, delta);
}
function openGallery() {
  if (gallery.value && !gallery.value.open) {
    galleryOpen.value = true;
    gallery.value.showModal();
  }
}
function closeGallery() {
  gallery.value?.close();
}
function onClose() {
  galleryOpen.value = false;
  opener.value?.focus();
}
function onGalleryKey(event: KeyboardEvent) {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    step(event.key === "ArrowLeft" ? 1 : -1);
  }
}
</script>

<template>
  <article
    class="app-panel"
    :class="{
      'app-panel--sand': solution.look === 'sand',
      'app-panel--condition': layout === 'condition',
    }"
    :data-theme="solution.look === 'sand' ? 'light' : undefined"
    :aria-labelledby="`app-${solution.slug}`"
  >
    <header class="app-panel__head">
      <div>
        <p class="app-panel__platform">
          <span><bdi>{{ solution.nameEn }}</bdi> · {{ solution.platform }}</span>
          <bdi v-if="positionLabel" class="app-panel__index" dir="ltr">{{
            positionLabel
          }}</bdi>
        </p>
        <component
          :is="level === 2 ? 'h2' : 'h3'"
          :id="`app-${solution.slug}`"
          >{{ solution.nameAr }}</component
        >
      </div>
      <p class="app-panel__tagline">{{ solution.tagline }}</p>
    </header>

    <div v-if="shot" class="app-panel__screen">
      <figure>
        <div
          class="app-panel__stage"
          :class="{ 'app-panel__stage--back': direction < 0 }"
        >
          <img
            v-if="failedSrc !== shot.src"
            ref="stageImage"
            :key="`${shot.src}-${retryKey}`"
            :class="{ 'app-panel__image--selected': hasInteracted }"
            :src="shot.src"
            :alt="shot.alt"
            :width="shot.width"
            :height="shot.height"
            loading="eager"
            decoding="sync"
            @error="onImageError"
          />
          <div v-else class="app-panel__fallback">
            <p role="status">تعذّر تحميل صورة واجهة {{ solution.nameAr }}.</p>
            <button type="button" class="workline-button" @click="retryImage">
              <span>إعادة المحاولة</span>
            </button>
            <a :href="shot.src" target="_blank" rel="noopener noreferrer"
              >فتح الصورة الأصلية</a
            >
          </div>
        </div>
        <figcaption class="app-panel__caption">
          <span aria-live="polite">{{ label(shot) }}</span>
          <button
            ref="opener"
            type="button"
            class="workline-button app-panel__enlarge"
            :aria-label="`تكبير واجهة ${solution.nameAr}`"
            @click="openGallery"
          >
            <span
              >تكبير
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                aria-hidden="true"
              >
                <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" /></svg
            ></span>
          </button>
        </figcaption>
      </figure>
      <div
        class="app-panel__controls"
        role="group"
        :aria-label="`واجهات ${solution.nameAr}`"
      >
        <button
          v-for="(item, i) in solution.images"
          :key="item.src"
          type="button"
          class="app-panel__thumb"
          :aria-pressed="active === i"
          @click="select(i)"
        >
          <span class="app-panel__thumb-frame">
            <span class="app-panel__thumb-image"
              ><img
                v-if="!thumbnailFailures.has(item.src)"
                :src="item.src"
                alt=""
                :width="item.width"
                :height="item.height"
                loading="lazy"
                decoding="async"
                @error="thumbnailFailures.add(item.src)"
              /><span v-else aria-hidden="true">—</span></span
            >
          </span>
          <span class="app-panel__thumb-label">{{ label(item) }}</span>
        </button>
      </div>
    </div>

    <div class="app-panel__aside">
      <p>{{ solution.description }}</p>
      <div class="app-panel__benefits">
        <component :is="level === 2 ? 'h3' : 'h4'"
          >ماذا يمكنك أن تدير؟</component
        >
        <ul>
          <li v-for="feature in solution.features.slice(0, 4)" :key="feature">
            {{ feature }}
          </li>
        </ul>
      </div>
      <div class="app-panel__purchase">
        <div>
          <small>سعر البرنامج</small
          ><ProductPrice :amount="solution.priceIqd" />
        </div>
        <ActionLink
          look="solid"
          :glow="false"
          size="lg"
          :to="`/solutions/${solution.slug}`"
          label="استكشف البرنامج ↖"
          :hidden-suffix="solution.nameAr"
        />
      </div>
    </div>

    <dialog
      ref="gallery"
      class="app-gallery"
      :aria-labelledby="`gallery-${solution.slug}`"
      @close="onClose"
      @keydown="onGalleryKey"
    >
      <div class="app-gallery__bar">
        <h2 :id="`gallery-${solution.slug}`">
          {{ solution.nameAr }} — {{ shot ? label(shot) : "" }}
        </h2>
        <button
          autofocus
          type="button"
          class="workline-button"
          @click="closeGallery"
        >
          <span>إغلاق ×</span>
        </button>
      </div>
      <img
        v-if="galleryOpen && shot && failedSrc !== shot.src"
        :src="shot.src"
        :alt="shot.alt"
        :width="shot.width"
        :height="shot.height"
        @error="onImageError"
      />
      <div v-else-if="galleryOpen && shot">
        <p role="status">تعذّر تحميل الصورة.</p>
        <button type="button" class="workline-button" @click="retryImage">
          <span>إعادة المحاولة</span>
        </button>
      </div>
      <div class="app-gallery__bar">
        <button type="button" class="workline-button" @click="step(-1)">
          <span>السابق →</span></button
        ><bdi aria-live="polite"
          >{{ active + 1 }} / {{ solution.images.length }}</bdi
        ><button type="button" class="workline-button" @click="step(1)">
          <span>التالي ←</span>
        </button>
      </div>
    </dialog>
  </article>
</template>

<style scoped lang="scss">
.app-panel {
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(0, 1fr);
  grid-template-areas: "head head" "screen aside";
  align-items: start;
  gap: clamp(20px, 2.5vw, 36px);
  padding: clamp(20px, 2.6vw, 40px);
  background: var(--nuqta-ground);
  border: 1px solid color-mix(in srgb, var(--nuqta-accent) 28%, var(--border));
  border-radius: var(--radius-lg);
  min-width: 0;
  color: var(--text);
  &--sand {
    background: var(--dalaly-ground);
    color: var(--dalaly-ink);
    border-color: var(--border);
    grid-template-columns: minmax(0, 1fr) minmax(0, 2.2fr);
    grid-template-areas: "head head" "aside screen";
  }
  &--condition {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "head" "screen" "aside";
    gap: clamp(16px, 2vw, 24px);
  }
}
.app-panel__head {
  grid-area: head;
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
  padding-block-end: 4px;
  h2,
  h3 {
    font-size: clamp(2.2rem, 4vw, 4rem);
    line-height: 1.25;
    margin: 0;
  }
}
.app-panel__platform {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--text-small);
  color: var(--text-muted);
  margin-block-end: 5px;
}
.app-panel__index {
  flex: none;
  font: 600 var(--text-caption) / 1.4 var(--font-sans);
}
.app-panel__tagline {
  max-width: 28ch;
  font-size: var(--text-lead);
  font-weight: 500;
  text-align: end;
}
.app-panel__screen {
  grid-area: screen;
  min-width: 0;
  figure {
    margin: 0;
  }
}
.app-panel__caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding-block: 8px;
  color: var(--text-muted);
  font-size: var(--text-ui);
}
.app-panel__enlarge {
  min-height: 44px;
  flex: none;
  padding-inline: 12px;
  > span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
}
.app-panel__stage {
  aspect-ratio: 16/9;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--charcoal-900);
  box-shadow: 0 0 0 1px color-mix(in srgb, currentColor 13%, transparent);
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
.app-panel__controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(96px, 100%), 1fr));
  gap: clamp(10px, 1.2vw, 18px);
  padding-inline: 4px;
}
.app-panel__thumb {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 0 0 8px;
  min-width: 0;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  text-align: start;
  cursor: pointer;
  border-block-end: 2px solid color-mix(in srgb, currentColor 23%, transparent);
  color: var(--text-muted);
  transition:
    border-color 0.22s var(--ease-out),
    color 0.22s var(--ease-out);
}
.app-panel__thumb-frame {
  display: block;
  position: relative;
  isolation: isolate;
  padding: 4px 6px;
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    transform: skewX(calc(var(--slant-angle) * -1));
    border-radius: var(--radius-sm);
    border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
    transition:
      background-color var(--duration-base),
      border-color var(--duration-base);
  }
}
.app-panel__thumb-image {
  display: grid;
  place-items: center;
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: 3px;
  background: var(--charcoal-900);
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
.app-panel__thumb-label {
  display: block;
  font-size: var(--text-ui);
  line-height: 1.55;
  overflow-wrap: anywhere;
}
.app-panel__thumb[aria-pressed="true"] {
  color: var(--text);
  border-color: var(--primary);
  font-weight: 600;
  .app-panel__thumb-frame::before {
    background: var(--primary);
    border-color: var(--primary);
  }
}
@media (hover: hover) {
  .app-panel__thumb:hover {
    color: var(--text);
    border-color: var(--primary);
    .app-panel__thumb-frame::before {
      border-color: var(--primary);
    }
  }
}
.app-panel--sand .app-panel__thumb[aria-pressed="true"] {
  color: var(--dalaly-ink);
}

.app-panel__fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  text-align: center;
  color: var(--charcoal-50);
  a {
    color: inherit;
  }
  button {
    color: inherit;
    border-color: var(--charcoal-400);
    &:hover {
      color: var(--on-accent);
      background: var(--accent);
    }
  }
}
.app-panel__image--selected {
  animation: screen-settle 0.32s var(--ease-out) both;
}
.app-panel__stage--back .app-panel__image--selected {
  animation-name: screen-settle-back;
}
@keyframes screen-settle {
  from {
    transform: translateX(7px) scale(0.994);
  }
  to {
    transform: none;
  }
}
@keyframes screen-settle-back {
  from {
    transform: translateX(-7px) scale(0.994);
  }
  to {
    transform: none;
  }
}
.app-panel__aside {
  grid-area: aside;
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 1.6vw, 24px);
  min-width: 0;
  align-self: start;
  line-height: 1.75;
  font-size: clamp(1.0625rem, 1.12vw, 1.2rem);
  p {
    margin: 0;
  }
}
.app-panel__benefits {
  padding-block-start: 4px;
  h3,
  h4 {
    font-size: var(--text-sub);
    margin-block-end: 12px;
  }
  ul {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 12px;
    font-size: clamp(1rem, 1.05vw, 1.0625rem);
  }
  li {
    position: relative;
    padding-inline-start: 18px;
    &::before {
      content: "";
      position: absolute;
      inset-inline-start: 1px;
      inset-block-start: 0.75em;
      width: 6px;
      height: 6px;
      background: currentColor;
      transform: skewX(calc(var(--slant-angle) * -1));
    }
  }
}
.app-panel--condition {
  .app-panel__head {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
  .app-panel__tagline {
    max-width: 40ch;
    text-align: start;
  }
  .app-panel__benefits ul {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 clamp(14px, 2vw, 24px);
    border-block-start: 1px solid
      color-mix(in srgb, currentColor 20%, transparent);
  }
  .app-panel__benefits li {
    min-width: 0;
    padding-block: 12px;
    border-block-end: 1px solid
      color-mix(in srgb, currentColor 20%, transparent);
    &:nth-child(even) {
      border-inline-start: 1px solid
        color-mix(in srgb, currentColor 20%, transparent);
      padding-inline-start: 18px;
    }
  }
  .app-panel__purchase {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px 20px;
  }
}
.app-panel__purchase {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  margin-block-start: 0;
  padding-block-start: 20px;
  border-block-start: 1px solid
    color-mix(in srgb, currentColor 20%, transparent);
  > div {
    display: grid;
    gap: 8px;
  }
  small {
    font-size: var(--text-small);
    color: var(--text-muted);
  }
  :deep(.price__amount) {
    font-size: clamp(2.5rem, 3.15vw, 3rem);
  }
  :deep(.action) {
    min-height: 58px;
    padding-inline: 18px;
    margin-inline: 5px;
    font-size: 1.05rem;
    justify-content: center;
  }
}
.app-gallery {
  position: fixed;
  inset: 0;
  margin: auto;
  width: min(1120px, calc(100% - 32px));
  max-height: calc(100dvh - 32px);
  padding: clamp(12px, 2vw, 24px);
  background: var(--charcoal-800);
  color: var(--charcoal-50);
  border: 1px solid var(--charcoal-400);
  border-radius: var(--radius-lg);
  overflow: auto;
  img {
    width: 100%;
    height: auto;
    max-height: 65dvh;
    object-fit: contain;
    margin-block: 16px;
  }
  &::backdrop {
    background: rgba(11, 14, 12, 0.91);
  }
}
.app-gallery__bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  h2 {
    font-size: var(--text-card);
    margin: 0;
  }
  button {
    color: var(--charcoal-50);
    border-color: var(--charcoal-400);
    &:hover {
      background: var(--charcoal-700);
      color: var(--charcoal-50);
    }
  }
}
@media (max-width: 900px) {
  .app-panel,
  .app-panel--sand {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "head" "screen" "aside";
  }
  .app-panel__head {
    align-items: start;
    flex-direction: column;
    gap: 6px;
  }
  .app-panel__tagline {
    text-align: start;
    max-width: none;
  }
  .app-panel__aside {
    gap: 16px;
  }
}
@media (max-width: 440px) {
  .app-panel {
    padding: 16px;
  }
  .app-panel__caption {
    gap: 6px;
    font-size: var(--text-small);
  }
  .app-panel__controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .app-panel__thumb-label {
    font-size: var(--text-small);
  }
  .app-panel__purchase {
    align-items: stretch;
    flex-direction: column;
    :deep(.action) {
      align-self: stretch;
    }
  }
  .app-gallery__bar {
    flex-wrap: wrap;
  }
}
@media (prefers-reduced-motion: reduce) {
  .app-panel__image--selected {
    animation: none;
  }
}

/* The real UI pixels are never sheared. Only the selection shell has the brand lean. */
.app-panel__thumb-image img {
  transform: none;
}
.app-panel__thumb:focus-visible {
  outline-offset: 4px;
}
@media (min-width: 901px) {
  .app-panel__controls {
    max-inline-size: 640px;
  }
  .app-panel__aside {
    padding-block-start: 4px;
  }
  .app-panel__purchase :deep(.action) {
    align-self: stretch;
  }
}
@media (max-width: 440px) {
  .app-panel__fallback {
    gap: 6px;
    padding: 8px;
    font-size: var(--text-small);
  }
}
</style>
