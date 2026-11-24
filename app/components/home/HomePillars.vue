<script lang="ts">
// The drawing a pillar is marked with.
export type PillarIcon = "automation" | "intelligence" | "security";

// Each icon as strokes on a 24-unit grid: two arrows chasing each other round, three linked nodes,
// a shield with a check.
const icons: Record<PillarIcon, string[]> = {
  automation: [
    "M4.5 9.3A8 8 0 0 1 19.5 9.3",
    "M19.5 4.3v5h-5",
    "M19.5 14.7A8 8 0 0 1 4.5 14.7",
    "M4.5 19.7v-5h5",
  ],
  intelligence: [
    "M6 4.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 1 0 0-4.4z",
    "M18 4.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 1 0 0-4.4z",
    "M12 15.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 1 0 0-4.4z",
    "M8.2 7h7.6",
    "M7.05 8.93l3.9 7.14",
    "M16.95 8.93l-3.9 7.14",
  ],
  security: [
    "M12 3 5 5.8v5.4c0 4.4 2.9 7.9 7 9.3 4.1-1.4 7-4.9 7-9.3V5.8z",
    "M9 11.8l2.2 2.2 3.8-4.2",
  ],
};
</script>

<script setup lang="ts">
// The opening's three pillars, as one card: a word and the line that explains it, each under its
// icon. A lime bar marks the active one: the first whenever nothing is moving, and, while the
// visitor is with the hero's art, the next one every few seconds.
const props = defineProps<{
  items: { word: string; line: string; icon: PillarIcon }[];
  // The hero's idle loops are running (HomeIntro). Never true under reduced motion.
  live?: boolean;
}>();

// Which pillar the bar rests on, by its place (data-active on the card; the styles place the bar
// for the first three).
const active = ref(0);

// One timer, only while live. When live ends the mark goes back to the first pillar: the card at
// rest is always the same picture.
const stepMs = 4000;
let timer: ReturnType<typeof setInterval> | undefined;

function stop() {
  if (timer === undefined) return;
  clearInterval(timer);
  timer = undefined;
}

watch(
  () => props.live,
  (live) => {
    stop();
    const count = Math.min(props.items.length, 3);
    if (!live) active.value = 0;
    if (!live || count < 2) return;
    timer = setInterval(() => {
      active.value = (active.value + 1) % count;
    }, stepMs);
  },
);

onBeforeUnmount(stop);
</script>

<template>
  <!-- The root is what the story's timeline tweens (the parent marks it); the card inside it is
       what is drawn, and what fades in. -->
  <div class="pillars" :data-active="active">
    <dl class="pillars__card">
      <div
        v-for="(item, index) in items"
        :key="item.word"
        class="pillars__item"
        :class="{ 'pillars__item--active': index === active }"
      >
        <dt class="pillars__head">
          <span class="pillars__tile" aria-hidden="true">
            <svg class="pillars__icon" viewBox="0 0 24 24" focusable="false">
              <path
                v-for="stroke in icons[item.icon]"
                :key="stroke"
                :d="stroke"
              />
            </svg>
          </span>
          <span class="pillars__word">{{ item.word }}</span>
        </dt>
        <dd class="pillars__line">{{ item.line }}</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped lang="scss">
// $lean, and the short covers, where the card closes up.
@use "~/assets/scss/story" as *;

// From this story width the pillars sit side by side.
$across: 30rem;
$tile: 2.5rem;

// An upright card (something you read). Under $across its pillars are three rows, each with its icon
// at the reading start; from $across three columns, each with its icon on top.
.pillars {
  // The active pillar's place: the bar's position follows it.
  --pillar: 0;
  // A pillar's side padding: the bar and the hairlines are set in by it too.
  --pillar-pad: var(--space-5);

  &[data-active="1"] {
    --pillar: 1;
  }

  &[data-active="2"] {
    --pillar: 2;
  }

  &__card {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-auto-rows: 1fr;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background-color: var(--surface-raised);

    @container story (width >= #{$across}) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    // The active pillar's mark, side by side: one leaning lime bar across the card's top border, as
    // wide as a pillar's text. It sits over the first pillar and is moved to the active one with
    // translate (a column is the bar and its two paddings wide; forward is to the left, the site
    // is right to left only), so moving it never touches layout and its lean stays on transform.
    @container story (width >= #{$across}) {
      &::before {
        content: "";
        position: absolute;
        z-index: 1;
        inset-block-start: -2px;
        inset-inline-start: var(--pillar-pad);
        inline-size: calc(100% / 3 - 2 * var(--pillar-pad));
        block-size: 3px;
        border-radius: var(--radius-pill);
        background-color: var(--accent);
        translate: calc(var(--pillar) * -1 * (100% + 2 * var(--pillar-pad))) 0;
        transform: $lean;
      }
    }
  }

  &__item {
    position: relative;
    min-inline-size: 0;
    padding: var(--space-4) var(--pillar-pad);
    // As rows: room for the icon at the reading start.
    padding-inline-start: calc(var(--pillar-pad) + #{$tile} + var(--space-4));

    @container story (width >= #{$across}) {
      padding-inline-start: var(--pillar-pad);
    }

    // As rows, every pillar has its own mark and only the active one's shows (a row's height is
    // not a length the one bar could be moved by): a leaning bar as tall as the row, inside the
    // card at the row's reading start (set in from the edge, so its leaning ends and the card's
    // round corners stay clear of each other), where it cannot be taken for a rule between rows.
    @container story (width < #{$across}) {
      &::after {
        content: "";
        position: absolute;
        z-index: 1;
        inset-block: var(--space-2);
        inset-inline-start: var(--space-3);
        inline-size: 3px;
        border-radius: var(--radius-pill);
        background-color: var(--accent);
        opacity: 0;
        transform: $lean;
      }

      &--active::after {
        opacity: 1;
      }
    }

    // A hairline between one pillar and the next, set in from the card's edges.
    & + &::before {
      content: "";
      position: absolute;
      inset-block-start: 0;
      inset-inline: var(--pillar-pad);
      block-size: 1px;
      background-color: var(--border);

      @container story (width >= #{$across}) {
        inset-block: var(--space-4);
        inset-inline: 0 auto;
        inline-size: 1px;
        block-size: auto;
      }
    }
  }

  &__head {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  &__tile {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: var(--pillar-pad);
    display: grid;
    flex: none;
    place-items: center;
    inline-size: $tile;
    block-size: $tile;
    margin-block-start: calc(#{$tile} / -2);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background-color: var(--bg);
    color: var(--text);

    @container story (width >= #{$across}) {
      position: static;
      margin-block-start: 0;
    }
  }

  &__item--active &__tile {
    color: var(--accent-text);
  }

  &__icon {
    inline-size: 1.25rem;
    block-size: 1.25rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &__word {
    font-size: var(--text-sub);
    font-weight: 700;
    line-height: 1.5;
  }

  &__line {
    margin-block-start: var(--space-1);
    font-size: 0.8125rem;
    line-height: 1.7;
    color: var(--text-muted);
  }

  // A short cover (where the hero fits one window: HomeIntro, with the same two conditions):
  // closer padding, and the icon and the word share a row, the line under them.
  @media #{$cover-short} {
    @container story (width >= #{$cover-room}) {
      --pillar-pad: var(--space-4);

      &__head {
        flex-direction: row;
        align-items: center;
        gap: var(--space-3);
      }
    }
  }

  // The lowest covers have no room for the lines: still read by screen readers, not shown.
  @media #{$cover-low} {
    @container story (width >= #{$cover-room}) {
      &__line {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
    }
  }
}

// Motion, for visitors who have not asked for less: the card fades in (the card, not the root: the
// story's timeline tweens the root, which must carry no fade of its own) and the three pillars
// rise a little into it one after another; the active pillar's mark and icon ease from one pillar
// to the next.
@media (prefers-reduced-motion: no-preference) {
  .pillars {
    &__card {
      animation: pillars-in var(--duration-slow) var(--ease-out) 460ms backwards;

      &::before {
        transition: translate var(--duration-base) var(--ease-out);
      }
    }

    &__item {
      animation: pillars-rise var(--duration-slow) var(--ease-out) 460ms
        backwards;

      &:nth-child(2) {
        animation-delay: calc(460ms + var(--stagger));
      }

      &:nth-child(3) {
        animation-delay: calc(460ms + 2 * var(--stagger));
      }

      &::after {
        transition: opacity var(--duration-base) var(--ease-out);
      }
    }

    &__tile {
      transition: color var(--duration-base) var(--ease-out);
    }
  }

  @keyframes pillars-in {
    from {
      opacity: 0;
    }
  }

  @keyframes pillars-rise {
    from {
      opacity: 0;
      translate: 0 8px;
    }
  }
}
</style>
