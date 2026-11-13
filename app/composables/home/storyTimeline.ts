/// <reference types="gsap" />
import { beats, maskTravel, phases, type ChapterName } from "./storyConfig";
import { leaningEdge, own, some, type TweenTarget } from "./storyParts";

// A stretch of the timeline: where it starts and how long it runs (a hand-over's phase).
export interface Span {
  at: number;
  span: number;
}

export type TimelineTools = ReturnType<typeof timelineTools>;

// The moves the cinematic stage's hand-overs (storyHandOvers) are written in, on its one scrubbed
// timeline `tl`. `slant` is the brand lean in radians, as playCinematic reads it. Made once per
// run, after the timeline.
export function timelineTools(tl: gsap.core.Timeline, slant: number) {
  // A tween only for the parts this page actually has. With `spread`, one tween per element, each a
  // share of `spread` later than the one before, in reading order. (A staggered fromTo in a scrubbed
  // timeline sets only its first element to the starting state; separate tweens set every one.)
  const play = (
    targets: TweenTarget | null | undefined,
    from: gsap.TweenVars,
    to: gsap.TweenVars,
    at: number,
    spread = 0,
  ) => {
    const list = Array.isArray(targets) ? some(...targets) : some(targets);
    if (!list.length) return;
    if (!spread || list.length === 1) {
      tl.fromTo(list, from, to, at);
      return;
    }
    const step = spread / (list.length - 1);
    list.forEach((item, index) =>
      tl.fromTo(item, { ...from }, { ...to }, at + index * step),
    );
  };

  // A hand-over's three phases on the timeline: between two chapters, or (`between`) any two
  // moments, such as two of chapter 05's scenes.
  const between = (start: number, end: number) => {
    const length = end - start;
    const phase = ([a, b]: readonly [number, number]): Span => ({
      at: start + a * length,
      span: (b - a) * length,
    });
    return {
      prepare: phase(phases.prepare),
      transform: phase(phases.transform),
      resolve: phase(phases.resolve),
    };
  };
  const handOver = (from: ChapterName, to: ChapterName) =>
    between(
      beats.chapters[from].rest + beats.chapters[from].hold,
      beats.chapters[to].rest,
    );

  // The text the stage shows (data-page-only text is shown only as a page; on the stage only screen
  // readers get it).
  const staged = "[data-reveal]:not([data-page-only])";

  // A chapter's (or a scene's) text leaves upward: its headline's words (or lines) slip out through
  // the top of their masks, everything else (a scene's number too) lifts and fades, in reading order.
  // The words fade as they go, so the dots under a letter (they hang lowest, and leave last) never
  // linger alone at the mask's edge.
  const leave = (scope: HTMLElement | null | undefined, { at, span }: Span) => {
    if (!scope) return;
    play(
      own("[data-mask-inner]", scope),
      { yPercent: 0, opacity: 1 },
      {
        yPercent: -maskTravel,
        opacity: 0,
        duration: span * 0.7,
        ease: "power2.in",
        immediateRender: false,
      },
      at,
      span * 0.3,
    );
    play(
      own(`${staged}, [data-sweep]`, scope),
      { opacity: 1, y: 0 },
      {
        opacity: 0,
        y: -24,
        duration: span * 0.6,
        ease: "power1.in",
        immediateRender: false,
      },
      at,
      span * 0.3,
    );
  };

  // A chapter's (or a scene's) text arrives the same way from below: the headline rises into its
  // masks word by word, then the rest follows. Set to its starting state now (immediateRender), so it
  // waits hidden.
  const arrive = (scope: HTMLElement | null | undefined, { at, span }: Span) => {
    if (!scope) return;
    play(
      own("[data-mask-inner]", scope),
      { yPercent: maskTravel, opacity: 1 },
      { yPercent: 0, opacity: 1, duration: span * 0.7, ease: "power3.out" },
      at,
      span * 0.3,
    );
    play(
      own(staged, scope),
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: span * 0.6, ease: "power2.out" },
      at + span * 0.12,
      span * 0.28,
    );
  };

  // The leaning edge (leaningEdge), at this stage's lean. Measured on every refresh.
  const sweep = (box: HTMLElement, share: number) =>
    leaningEdge(box, slant, share);

  return { play, between, handOver, leave, arrive, sweep };
}
