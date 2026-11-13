// The home page's story (HomeStory): its structure and timing, as typed constants. Its motion
// (useStoryMotion and the story modules beside it) reads them.

// ---------------------------------------------------------------------------
// Story structure
// ---------------------------------------------------------------------------

// The chapters in reading order, as StoryChapter's data-chapter names them.
export const chapterNames = [
  "intro",
  "nuqta",
  "insights",
  "dalaly",
  "custom",
] as const;
export type ChapterName = (typeof chapterNames)[number];

export const isChapterName = (
  value: string | undefined,
): value is ChapterName => chapterNames.some((name) => name === value);

// ---------------------------------------------------------------------------
// Responsive and accessibility rules
// ---------------------------------------------------------------------------

// The window size that holds the cover. Keep in step with $cover in app/assets/scss/_story.scss,
// which the story's styles (HomeStory, StoryStage, StoryChapter and components/home/) read it from.
export const coverQuery = "(min-width: 64em) and (min-height: 36em)";
// All motion, scroll and entrance alike, is for visitors who have not asked for less.
export const motionQuery = "(prefers-reduced-motion: no-preference)";

// ---------------------------------------------------------------------------
// Motion timeline configuration (in window heights of scroll)
// ---------------------------------------------------------------------------

export interface Beat {
  // Where the chapter is fully on show, and for how long it stays so before the next hand-over.
  rest: number;
  hold: number;
}

export const beats = {
  // The scroll the stage holds for. Keep --story-length (in HomeStory.vue's styles) at length + 1.
  // It assumes the five services in company.ts: chapter 05's tour (below) ends here.
  length: 9.35,
  // Seconds the stage takes to catch up with the scroll: smooth, never sluggish.
  scrub: 0.5,
  // Each hand-over runs from one chapter's rest plus hold to the next one's rest: one window
  // height each. The opening starts handing over at once, as a page's first screen would scroll.
  // Chapter 05's own text stays for the whole tour of its services.
  chapters: {
    intro: { rest: 0, hold: 0 },
    nuqta: { rest: 1, hold: 0.5 },
    insights: { rest: 2.5, hold: 0.5 },
    dalaly: { rest: 4, hold: 0.5 },
    custom: { rest: 5.5, hold: 3.85 },
  },
} as const satisfies {
  length: number;
  scrub: number;
  chapters: Record<ChapterName, Beat>;
};

// Chapter 05's tour: its services one at a time (data-scene, in reading order), then the overview
// of them all with the call. Service k (from 0) rests at first + k * step and holds for
// step - handOver; the overview rests a step after the last one and holds for overviewHold. Each
// scene's hand-over is handOver long. With five services: 5.75, 6.35, 6.95, 7.55, 8.15, then the
// overview at 8.75 until 9.35.
export const tour = {
  first: 5.75,
  step: 0.6,
  handOver: 0.25,
  overviewHold: 0.6,
} as const satisfies {
  first: number;
  step: number;
  handOver: number;
  overviewHold: number;
};

// The three phases of every hand-over, as shares of it. Preparation clears what is leaving (the
// text first), transformation moves the stage into its next state, resolution brings the next
// chapter's text in and settles the camera. They overlap a little, so the stage is never empty and
// only one thing leads at a time.
export const phases = {
  prepare: [0, 0.4],
  transform: [0.2, 0.8],
  resolve: [0.6, 1],
} as const satisfies Record<string, readonly [number, number]>;

// Where the camera looks inside a screen and how close it goes: the point of sale's product cards
// (daily work), then the home screen's row of today's figures. Anchored on the menu side, so the
// program's own menu stays in view.
export const focus = {
  operations: { origin: "100% 62%", scale: 1.14 },
  insights: { origin: "100% 10%", scale: 1.16 },
  // Dalaly's list of offers, from the top of the menu side: the active "عروض البيع" item and the
  // first rows of offers (what its tagline is about).
  listing: { origin: "100% 18%", scale: 1.1 },
} as const satisfies Record<string, { origin: string; scale: number }>;

// How far a headline's word or line travels through its mask (a share of its own height): far
// enough that no dot or tail of a letter is left showing at the mask's edge.
export const maskTravel = 150;
