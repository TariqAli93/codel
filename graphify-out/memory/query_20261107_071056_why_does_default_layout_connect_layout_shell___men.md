---
type: "query"
date: "2026-11-07T07:10:56.061093+00:00"
question: "Why does Default layout connect Layout Shell & Menu Rules to Pages & Accessibility Conventions and Brand, Theme & Nuxt Config?"
contributor: "graphify"
source_nodes: ["Default layout (skip link, header, main, footer)", "Skip link", "44px standalone-link touch target", "Logo usage rules (white/ink/lime variants)", "Brand lean (--slant-angle 10deg)"]
---

# Q: Why does Default layout connect Layout Shell & Menu Rules to Pages & Accessibility Conventions and Brand, Theme & Nuxt Config?

## Answer

The default layout is the only file rendered on every route (app.vue and error.vue both wrap content in NuxtLayout), so three kinds of rule meet in it. Its own behaviour (menu listeners: stopListening, onWideChange, onFocusOut) keeps it in Layout Shell. Two EXTRACTED implements edges tie it to Pages & Accessibility: the skip link (default.vue L113) and the 44px touch target (L214), which every page also implements. One INFERRED 0.85 edge ties it to Brand: logo usage rules, via the white full logo in the dark header (L118). It is one of two bridges; the other is the brand lean (--slant-angle), which links the nav links, hero call bar and contact band to Brand. Gap: share tags, nav links, fullWidth, js-flag and footer nodes come from default.vue but have no edge to the layout hub, so its 8 edges understate its reach.

## Source Nodes

- Default layout (skip link, header, main, footer)
- Skip link
- 44px standalone-link touch target
- Logo usage rules (white/ink/lime variants)
- Brand lean (--slant-angle 10deg)