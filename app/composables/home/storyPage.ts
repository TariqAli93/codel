import { maskTravel } from "./storyConfig";
import {
  leaningEdge,
  own,
  readSlant,
  type Gsap,
  type ScrollTriggerApi,
} from "./storyParts";

// The page (motion allowed, no cinematic stage): each chapter shows itself once, as it arrives.

export function playPage(
  story: HTMLElement,
  gsap: Gsap,
  ScrollTrigger: ScrollTriggerApi,
) {
  const all = (selector: string, scope: Element = story) =>
    gsap.utils.toArray<HTMLElement>(selector, scope);
  const ease = "power2.out";

  // The brand lean, for the screens' and the numbers' wipe: the leaning edge (leaningEdge) across
  // the box, from none of it (`closed`) to all of it (`open`).
  const slant = readSlant(story);
  const closed = (box: HTMLElement) => leaningEdge(box, slant, 0);
  const open = (box: HTMLElement) => leaningEdge(box, slant, 1);

  for (const chapter of all("[data-chapter]")) {
    // The opening has its own CSS entrance.
    if (chapter.dataset.chapter === "intro") continue;

    // Chapter 05's scenes are not the chapter's own: each shows itself (below).
    const masks = own("[data-mask-inner]", chapter);
    const items = own("[data-reveal]", chapter);
    const text = gsap.timeline({
      scrollTrigger: { trigger: chapter, start: "top 78%", once: true },
    });
    if (masks.length) {
      text.from(
        masks,
        {
          yPercent: maskTravel,
          duration: 0.48,
          stagger: 0.06,
          ease: "power3.out",
        },
        0,
      );
    }
    if (items.length)
      text.from(
        items,
        { opacity: 0, y: 16, duration: 0.48, stagger: 0.06, ease },
        0.1,
      );

    // The main screen is wiped in from the reading start behind a leaning edge; the second one
    // then rises over its corner.
    const main = chapter.querySelector<HTMLElement>('[data-media="main"]');
    const second = chapter.querySelector<HTMLElement>('[data-media="second"]');
    if (!main) continue;
    const screens = gsap.timeline({
      scrollTrigger: { trigger: main, start: "top 85%", once: true },
    });
    screens.fromTo(
      main,
      { clipPath: () => closed(main), y: 32 },
      {
        clipPath: () => open(main),
        y: 0,
        duration: 0.8,
        ease: "expo.inOut",
        clearProps: "clipPath",
      },
    );
    if (second)
      screens.from(
        second,
        { opacity: 0, yPercent: 12, duration: 0.48, ease },
        "-=0.2",
      );
  }

  // Chapter 05's services (then the overview's link to the services page, and the ways to reach us)
  // are entries of their own, each shown once as it scrolls in: its number wiped in along the lean,
  // then its name risen through its mask, then what it is and how to ask. What only the stage shows
  // (data-stage-only: the overview's names) is left out.
  for (const scene of all("[data-scene]:not([data-stage-only])")) {
    const numeral = scene.querySelector<HTMLElement>("[data-sweep]");
    const masks = own("[data-mask-inner]", scene);
    const items = own("[data-reveal]", scene).filter(
      (element) => !element.closest("[data-stage-only]"),
    );
    const entry = gsap.timeline({
      scrollTrigger: { trigger: scene, start: "top 85%", once: true },
    });
    let at = 0;
    if (numeral) {
      entry.fromTo(
        numeral,
        { clipPath: () => closed(numeral) },
        {
          clipPath: () => open(numeral),
          duration: 0.6,
          ease: "expo.inOut",
          clearProps: "clipPath",
        },
        at,
      );
      at += 0.2;
    }
    if (masks.length) {
      entry.from(
        masks,
        { yPercent: maskTravel, duration: 0.48, ease: "power3.out" },
        at,
      );
    }
    if (items.length)
      entry.from(
        items,
        { opacity: 0, y: 16, duration: 0.48, stagger: 0.06, ease },
        at + 0.1,
      );
  }

  // Keyboard focus can reach an element before its reveal has run: whatever holds focus jumps to
  // its end state at once.
  const onFocus = (event: FocusEvent) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    for (const trigger of ScrollTrigger.getAll()) {
      const element = trigger.trigger;
      if (element && element.contains(target)) trigger.animation?.progress(1);
    }
  };
  story.addEventListener("focusin", onFocus);

  return () => story.removeEventListener("focusin", onFocus);
}
