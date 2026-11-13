<script setup lang="ts">
import type { Service } from "~/data/company";

// One service in chapter 05's tour: its number, its name, what it is, how to ask. HomeServices lists
// them and gives each its place in the tour (data-scene, which the story's motion in
// app/composables/home/ reads). On the stage the scenes take turns in one place; as a page each is
// an entry under a rule.
defineProps<{
  service: Service;
  // The service's number, by its place in the list: "01".
  number: string;
}>();
</script>

<template>
  <li class="home__scene">
    <span
      class="home__numeral"
      dir="ltr"
      aria-hidden="true"
      data-sweep
      >{{ number }}</span
    >
    <div class="home__scene-body">
      <h3 class="home__scene-title">
        <span class="home__scene-mask" data-mask
          ><span class="home__scene-words" data-mask-inner>{{
            service.title
          }}</span></span
        >
      </h3>
      <p class="home__scene-text" data-reveal>{{ service.text }}</p>
      <div class="home__scene-actions" data-reveal>
        <WhatsAppCall
          look="text"
          :subject="service.title"
          label="استفسر عن هذه الخدمة"
          :hidden-suffix="service.title"
        />
        <ActionLink
          v-if="service.related"
          look="text"
          :to="service.related"
          label="حلولنا الجاهزة"
        />
      </div>
    </div>
  </li>
</template>

<style scoped lang="scss">
@use "~/assets/scss/story" as *;

.home {
  &__scene {
    padding-block: var(--space-6);
    border-block-start: 1px solid var(--border);

    @container story (width >= #{$tablet}) {
      display: grid;
      grid-template-columns: 5rem minmax(0, 1fr);
      column-gap: var(--copy-gap);
      align-items: start;
      padding-block: var(--space-7);
    }

    // On the stage the scenes take turns in one place, the number beside the rest.
    .story--cinematic & {
      grid-area: 1 / 1;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      column-gap: var(--copy-gap);
      align-items: center;
      padding: 0;
      border: 0;
    }
  }

  // The number: large, and quieter than the name (half the ink, half the lime). Only as wide as its
  // digits, so it sits at the reading start and its wipe crosses the digits only.
  &__numeral {
    display: block;
    inline-size: fit-content;
    margin-block-end: var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-title);
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: color-mix(in srgb, var(--on-accent) 50%, var(--accent));

    .story--cinematic & {
      margin: 0;
      font-size: min(var(--text-hero), 16svh);

      @media #{$cover-short} {
        font-size: min(var(--text-hero), 13svh);
      }
    }
  }

  &__scene-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--text-flow);
    font-weight: 700;
    line-height: 1.4;

    // On the stage the scene holds the room under the heading on its own, so its name is set at a
    // section heading's size (capped by the window's height on a short cover).
    .story--cinematic & {
      font-size: var(--text-title);

      @media #{$cover-short} {
        font-size: min(var(--text-title), 5svh);
      }
    }
  }

  // One mask around the whole name, so it rises as one, opened like SplitWords' masks so no mark or
  // dot is cut.
  &__scene-mask {
    display: inline-block;
    clip-path: inset(-0.12em -0.3em -0.3em -0.3em);
  }

  &__scene-words {
    display: inline-block;
  }

  &__scene-text {
    max-inline-size: 34rem;
    margin-block-start: var(--space-3);
    font-size: var(--text-body);
    line-height: 1.8;
    color: var(--text-muted);

    @container story (width >= #{$tablet}) {
      font-size: var(--text-lead);
    }

    .story--cinematic & {
      max-inline-size: 34rem;
      font-size: var(--text-lead);

      @media #{$cover-short} {
        font-size: var(--text-body);
      }
    }
  }

  &__scene-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-5);
    margin-block-start: var(--space-3);
  }
}
</style>
