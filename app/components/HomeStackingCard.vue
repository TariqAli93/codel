<script setup lang="ts">
import type { Solution } from "~/data/solutions";

const props = defineProps<{ solution: Solution }>();

const scenes: Record<
  string,
  { label: string; title: string; description: string }
> = {
  "nuqta-plus/pos": {
    label: "نقطة البيع",
    title: "من البيع، تبدأ الحكاية.",
    description:
      "شوف المنتجات وأسعارها، أضفها إلى السلة، وتابع فاتورة البيع من نقطة واحدة.",
  },
  "nuqta-plus/dashboard": {
    label: "لوحة التحكم",
    title: "شوف يومك بوضوح.",
    description:
      "راجع مبيعات اليوم والأرباح والفواتير، وتعرّف على أداء شغلك من لوحة التحكم.",
  },
  "nuqta-plus/inventory": {
    label: "المخزون",
    title: "اعرف شنو عندك.",
    description: "تابع كميات البضائع وأسعارها والحد الأدنى للمخزون.",
  },
  "nuqta-plus/sales-report": {
    label: "التقارير",
    title: "الأرقام تحچي.",
    description: "راجع إجمالي المبيعات والخصومات والفواتير في تقرير المبيعات.",
  },
  "dalaly/properties": {
    label: "العروض العقارية",
    title: "كل عروضك، بمكان واحد.",
    description:
      "راجع العقارات المعروضة للبيع حسب النوع والموقع والمساحة والسعر والحالة.",
  },
  "dalaly/dashboard": {
    label: "لوحة التحكم",
    title: "تابع الطلبات والمهام.",
    description:
      "شوف المتابعات والعمليات السريعة ومطابقة العروض لطلبات الزبائن.",
  },
  "dalaly/property": {
    label: "تفاصيل العقار",
    title: "التفاصيل تصنع الفرق.",
    description:
      "اطّلع على سعر العقار وموقعه ومساحته وبيانات المالك والصور في صفحة واحدة.",
  },
};

const steps = computed(() =>
  props.solution.images.map((image) => {
    const file =
      image.src
        .split("/")
        .pop()
        ?.replace(/\.webp$/, "") ?? "";
    const fallbackLabel = image.alt.split(":")[0]?.trim() || image.alt;
    return {
      ...image,
      ...(scenes[`${props.solution.slug}/${file}`] ?? {
        label: fallbackLabel,
        title: fallbackLabel,
        description: props.solution.description,
      }),
    };
  }),
);
const active = ref(0);
const shot = computed(() => steps.value[active.value]);
const gallery = ref<HTMLDialogElement | null>(null);
const opener = ref<HTMLButtonElement | null>(null);
const galleryOpen = ref(false);
const failedSrc = ref("");
const retryKey = ref(0);
const hasInteracted = ref(false);
const stageImage = ref<HTMLImageElement | null>(null);
const thumbnailFailures = reactive(new Set<string>());
const stepCounter = computed(
  () =>
    `${String(active.value + 1).padStart(2, "0")} / ${String(steps.value.length).padStart(2, "0")}`,
);

onMounted(() => {
  const image = stageImage.value;
  if (image?.complete && image.naturalWidth === 0 && shot.value)
    failedSrc.value = shot.value.src;
});

function select(index: number) {
  if (index === active.value || !steps.value[index]) return;
  active.value = index;
  failedSrc.value = "";
  hasInteracted.value = true;
}

function step(delta: number) {
  const length = steps.value.length;
  if (length) select((active.value + delta + length) % length);
}

function onImageError(event: Event) {
  const image = event.currentTarget;
  const current = shot.value;
  if (
    image instanceof HTMLImageElement &&
    current &&
    image.getAttribute("src") === current.src
  )
    failedSrc.value = current.src;
}

function retryImage() {
  failedSrc.value = "";
  retryKey.value++;
}

function openGallery() {
  if (!gallery.value || gallery.value.open) return;
  galleryOpen.value = true;
  gallery.value.showModal();
}

function closeGallery() {
  gallery.value?.close();
}

function onGalleryClose() {
  galleryOpen.value = false;
  opener.value?.focus();
}

function onGalleryKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    step(event.key === "ArrowLeft" ? 1 : -1);
  }
}
</script>

<template>
  <article
    :id="`story-${solution.slug}`"
    class="story-chapter stack-card"
    :class="{ 'stack-card--sand': solution.look === 'sand' }"
    :data-theme="solution.look === 'sand' ? 'light' : undefined"
    :data-home-product-card="solution.slug"
    :aria-labelledby="`stack-title-${solution.slug}`"
  >
    <div class="stack-card__surface" data-home-product-surface>
      <header class="stack-card__head">
        <div>
          <h3 :id="`stack-title-${solution.slug}`">{{ solution.nameAr }}</h3>
          <p class="stack-card__tagline">{{ solution.tagline }}</p>
        </div>
        <p class="stack-card__meta">
          <bdi dir="ltr">{{ solution.nameEn }}</bdi>
          <span>{{ solution.platform }}</span>
        </p>
      </header>

      <div class="stack-card__details">
        <p class="stack-card__counter" dir="ltr">{{ stepCounter }}</p>
        <h4 aria-live="polite">{{ shot?.title }}</h4>
        <p class="stack-card__description">{{ shot?.description }}</p>

        <div class="stack-card__features">
          <h5>أبرز ما يديره البرنامج</h5>
          <ul>
            <li
              v-for="feature in solution.features.slice(0, 4)"
              :key="feature"
            >
              {{ feature }}
            </li>
          </ul>
        </div>

        <div class="stack-card__purchase">
          <ProductPrice :amount="solution.priceIqd" />
          <ActionLink
            look="solid"
            :glow="false"
            :to="`/solutions/${solution.slug}`"
            label="تفاصيل البرنامج ↖"
            :hidden-suffix="solution.nameAr"
          />
        </div>
      </div>

      <div
        v-if="shot"
        class="stack-card__media"
        data-scroll-depth="program-preview"
      >
        <div class="stack-card__screen-head">
          <span aria-live="polite">{{ shot.label }}</span>
          <button
            ref="opener"
            type="button"
            class="stack-card__enlarge"
            :aria-label="`تكبير واجهة ${solution.nameAr}`"
            @click="openGallery"
          >
            <span>تكبير</span>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              aria-hidden="true"
            >
              <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" />
            </svg>
          </button>
        </div>

        <figure class="stack-card__screen">
          <img
            v-if="failedSrc !== shot.src"
            ref="stageImage"
            :key="`${shot.src}-${retryKey}`"
            :class="{ 'stack-card__image--selected': hasInteracted }"
            :src="shot.src"
            :alt="shot.alt"
            :width="shot.width"
            :height="shot.height"
            loading="eager"
            decoding="async"
            @error="onImageError"
          />
          <div v-else class="stack-card__fallback">
            <p role="status">تعذّر تحميل صورة واجهة {{ solution.nameAr }}.</p>
            <button type="button" class="workline-button" @click="retryImage">
              <span>إعادة المحاولة</span>
            </button>
          </div>
        </figure>

        <div
          class="stack-card__scenes"
          role="group"
          :aria-label="`مشاهد ${solution.nameAr}`"
        >
          <button
            v-for="(item, index) in steps"
            :key="item.src"
            type="button"
            :aria-current="index === active ? 'step' : undefined"
            @click="select(index)"
          >
            <span class="stack-card__scene-number" dir="ltr">{{
              String(index + 1).padStart(2, "0")
            }}</span>
            <span>{{ item.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <dialog
      ref="gallery"
      class="stack-card__gallery"
      :aria-labelledby="`gallery-title-${solution.slug}`"
      @close="onGalleryClose"
      @keydown="onGalleryKeydown"
    >
      <header>
        <h2 :id="`gallery-title-${solution.slug}`">
          {{ solution.nameAr }} — {{ shot?.label }}
        </h2>
        <button
          autofocus
          type="button"
          class="workline-button"
          @click="closeGallery"
        >
          <span>إغلاق ×</span>
        </button>
      </header>
      <img
        v-if="galleryOpen && shot && failedSrc !== shot.src"
        :src="shot.src"
        :alt="shot.alt"
        :width="shot.width"
        :height="shot.height"
        @error="onImageError"
      />
      <div v-else-if="galleryOpen && shot" class="stack-card__gallery-error">
        <p role="status">تعذّر تحميل الصورة.</p>
        <button type="button" class="workline-button" @click="retryImage">
          <span>إعادة المحاولة</span>
        </button>
      </div>
      <footer>
        <button type="button" class="workline-button" @click="step(-1)">
          <span>السابق →</span>
        </button>
        <bdi aria-live="polite">{{ active + 1 }} / {{ steps.length }}</bdi>
        <button type="button" class="workline-button" @click="step(1)">
          <span>التالي ←</span>
        </button>
      </footer>
    </dialog>
  </article>
</template>

<style scoped lang="scss">
.stack-card {
  --stack-muted: color-mix(in srgb, currentColor 66%, transparent);
  --stack-line: color-mix(in srgb, currentColor 20%, transparent);
  --stack-active: var(--accent);
  position: sticky;
  inset-block-start: calc(var(--header-height) + var(--space-4));
  min-width: 0;
  padding-block-end: clamp(24px, 4vh, 56px);
  scroll-margin-block-start: calc(var(--header-height) + var(--space-4));
}

.stack-card--sand {
  --stack-active: var(--dalaly-ink);
}

.stack-card__surface {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  grid-template-areas: "head head" "details media";
  align-items: center;
  gap: clamp(24px, 3.2vw, 48px);
  min-height: min(78svh, 760px);
  padding: clamp(20px, 3.2vw, 48px);
  color: var(--text);
  background: var(--nuqta-ground);
  border: 1px solid
    color-mix(in srgb, var(--nuqta-accent) 28%, var(--border));
  border-radius: var(--radius-lg);
  transform-origin: center top;
}

.stack-card--sand .stack-card__surface {
  color: var(--dalaly-ink);
  background: var(--dalaly-ground);
  border-color: color-mix(in srgb, var(--dalaly-ink) 22%, transparent);
}

.stack-card__head {
  grid-area: head;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  padding-block-end: clamp(16px, 2.4vw, 32px);
  border-block-end: 1px solid var(--stack-line);
  h3 {
    font-family: var(--font-hero);
    font-size: clamp(2.75rem, 5.2vw, 5rem);
    line-height: 1.2;
  }
}

.stack-card__tagline {
  margin-block-start: 4px;
  color: var(--stack-muted);
  font-size: var(--text-lead);
}

.stack-card__meta {
  display: grid;
  justify-items: end;
  gap: 5px;
  flex: none;
  color: var(--stack-muted);
  font-size: var(--text-small);
}

.stack-card__details {
  grid-area: details;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: clamp(12px, 1.6vw, 22px);
  min-width: 0;
  h4 {
    max-width: 16ch;
    font-family: var(--font-hero);
    font-size: clamp(2rem, 3.4vw, 3.5rem);
    line-height: 1.35;
  }
}

.stack-card__counter {
  color: var(--stack-muted);
  font: 600 var(--text-small) / 1.4 var(--font-sans);
}

.stack-card__description {
  max-width: 42ch;
  color: var(--stack-muted);
  font-size: var(--text-body);
  line-height: 1.8;
}

.stack-card__features {
  width: 100%;
  h5 {
    margin-block-end: 8px;
    font-size: var(--text-ui);
  }
  ul {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 18px;
    list-style: none;
    padding: 0;
  }
  li {
    position: relative;
    padding-inline-start: 16px;
    color: var(--stack-muted);
    font-size: var(--text-small);
    line-height: 1.65;
    overflow-wrap: anywhere;
    &::before {
      content: "";
      position: absolute;
      inset-inline-start: 1px;
      inset-block-start: 0.7em;
      width: 6px;
      height: 6px;
      background: var(--stack-active);
      transform: skewX(calc(var(--slant-angle) * -1));
    }
  }
}

.stack-card__purchase {
  display: flex;
  align-items: end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px 20px;
  width: 100%;
  margin-block-start: auto;
  padding-block-start: 18px;
  border-block-start: 1px solid var(--stack-line);
  :deep(.price__amount) {
    font-size: clamp(2.15rem, 3.4vw, 3rem);
  }
  :deep(.action) {
    min-height: 52px;
  }
}

.stack-card__media {
  grid-area: media;
  min-width: 0;
}

.stack-card__screen-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  padding-block-end: 8px;
  color: var(--stack-muted);
  font-size: var(--text-ui);
}

.stack-card__enlarge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: 44px;
  min-height: 44px;
  padding-inline: 8px;
  border: 0;
  background: transparent;
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.stack-card__screen {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  margin: 0;
  background: var(--bg);
  border: 1px solid var(--stack-line);
  border-radius: var(--radius-md);
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.stack-card__image--selected {
  animation: stack-screen-settle 0.32s var(--ease-out) both;
}

@keyframes stack-screen-settle {
  from {
    transform: translateX(7px) scale(0.994);
  }
  to {
    transform: none;
  }
}

.stack-card__fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 12px;
  padding: 16px;
  color: var(--text);
  text-align: center;
}

.stack-card__scenes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(120px, 100%), 1fr));
  gap: 8px 12px;
  margin-block-start: 14px;
  button {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    min-height: 44px;
    padding: 8px 4px;
    border: 0;
    border-block-end: 1px solid var(--stack-line);
    background: transparent;
    color: var(--stack-muted);
    text-align: start;
    transition:
      color var(--duration-base) var(--ease-out),
      border-color var(--duration-base) var(--ease-out);
  }
  button[aria-current="step"] {
    border-color: var(--stack-active);
    color: var(--text);
    font-weight: 600;
  }
}

.stack-card__scene-number {
  flex: none;
  font: 600 var(--text-caption) / 1.4 var(--font-sans);
}

.stack-card__gallery {
  position: fixed;
  inset: 0;
  width: min(1120px, calc(100% - 32px));
  max-height: calc(100dvh - 32px);
  margin: auto;
  padding: clamp(12px, 2vw, 24px);
  overflow: auto;
  border: 1px solid var(--charcoal-400);
  border-radius: var(--radius-lg);
  background: var(--charcoal-800);
  color: var(--charcoal-50);
  img {
    display: block;
    width: 100%;
    max-height: 65dvh;
    margin-block: 16px;
    object-fit: contain;
  }
  &::backdrop {
    background: color-mix(in srgb, var(--bg) 90%, transparent);
  }
  header,
  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  h2 {
    margin: 0;
    font-size: var(--text-card);
  }
  button {
    color: var(--charcoal-50);
    border-color: var(--charcoal-400);
  }
}

.stack-card__gallery-error {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding-block: 24px;
}

@media (max-width: 900px) {
  .stack-card {
    position: relative;
    inset-block-start: auto;
  }
  .stack-card__surface {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "head" "details" "media";
    gap: 24px;
    min-height: 0;
  }
  .stack-card__head {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
  .stack-card__meta {
    display: flex;
    align-items: center;
    justify-items: start;
    flex-wrap: wrap;
    gap: 8px 14px;
  }
  .stack-card__details {
    gap: 14px;
  }
}

@media (max-width: 600px) {
  .stack-card__features ul {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 440px) {
  .stack-card__surface {
    padding: 16px;
  }
  .stack-card__head h3 {
    font-size: clamp(2.4rem, 12vw, 3.4rem);
  }
  .stack-card__purchase {
    align-items: stretch;
    flex-direction: column;
    :deep(.action) {
      align-self: stretch;
      justify-content: center;
    }
  }
  .stack-card__gallery header,
  .stack-card__gallery footer {
    justify-content: center;
  }
}

@media (max-height: 560px), (prefers-reduced-motion: reduce) {
  .stack-card {
    position: relative;
    inset-block-start: auto;
  }
  .stack-card__surface {
    min-height: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stack-card__image--selected {
    animation: none;
  }
}
</style>
