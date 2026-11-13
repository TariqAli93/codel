// What the story's motions take from one place: GSAP's types, and how they find the parts of the
// story, read its lean and wipe them. The cinematic stage (storyCinematic, storyTimeline,
// storyHandOvers) uses all of it; the page (storyPage) only some.

export type Gsap = typeof import("gsap").gsap;
export type ScrollTriggerApi =
  typeof import("gsap/ScrollTrigger").ScrollTrigger;
export type TweenTarget = HTMLElement | HTMLElement[];

// The parts that are there: a part this page does not have is null (or missing from a list).
export const some = (...items: (HTMLElement | null | undefined)[]) =>
  items.filter((item): item is HTMLElement => item instanceof HTMLElement);

// What moves with a part of the story: the elements `selector` finds in `scope`, the scope too if
// it matches. A chapter leaves out its scenes (chapter 05's services and its call, which come and
// go on their own beats), and nothing ever takes what is in the rail, which only shows progress.
export function own(selector: string, scope: HTMLElement): HTMLElement[] {
  const inScene = scope.closest("[data-scene]") !== null;
  return [
    ...(scope.matches(selector) ? [scope] : []),
    ...Array.from(scope.querySelectorAll<HTMLElement>(selector)),
  ].filter(
    (element) =>
      !element.closest("[data-rail]") &&
      (inScene || !element.closest("[data-scene]")),
  );
}

// The brand lean in radians, read from the story's stylesheet (--slant-angle), so every wipe leans
// with the buttons and the slab; 10deg if it cannot be read.
export function readSlant(story: HTMLElement): number {
  return (
    ((parseFloat(getComputedStyle(story).getPropertyValue("--slant-angle")) ||
      10) *
      Math.PI) /
    180
  );
}

// A leaning edge crossing a box from its reading start (the right edge; the site is right to left
// only) to its end, as a clip-path: share 0 shows none of the box, 1 all of it. `slant` is the
// brand lean in radians; the box is measured each time, so call it on every refresh.
export function leaningEdge(box: HTMLElement, slant: number, share: number) {
  const lean =
    (Math.tan(slant) * box.offsetHeight * 100) / Math.max(box.offsetWidth, 1);
  const top = (100 + lean) * (1 - share);
  return `polygon(${top}% 0%, 100% 0%, 100% 100%, ${top - lean}% 100%)`;
}
