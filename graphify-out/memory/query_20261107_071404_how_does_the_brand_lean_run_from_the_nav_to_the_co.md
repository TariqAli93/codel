---
type: "query"
date: "2026-11-07T07:14:04.550574+00:00"
question: "How does the brand lean run from the nav to the contact band?"
contributor: "graphify"
source_nodes: ["Brand lean (--slant-angle 10deg)", "Main navigation links array", "Hero lime WhatsApp call bar", "Lime contact band", "Codel Latin wordmark letterforms (d, e, l)"]
---

# Q: How does the brand lean run from the nav to the contact band?

## Answer

The graph holds two unconnected lean nodes. UI side (CLAUDE.md, Brand community): implemented by the nav links, the hero call bar and the lime contact band (EXTRACTED). Logo side (Logo community, INFERRED 0.85): the logo strokes lean about 10 degrees. Source check: the slanted strokes in codel-full-white.svg measure 10.05, 10.05, 10.16 and 10.20 degrees, leaning the same way as skewX(-10deg), so --slant-angle matches the logo's own angle; the missing edge between the two nodes is real. The code applies the lean in 14 places across two files: default.vue (nav indicator bar L329/342/359, header button L371, menu button L423, menu icon bars L472/478) and index.vue (call bar L331, its divider L376, price tag L525, service markers L604, timeline bar L639, contact band slab L716, contact button L753). The graph records only 3 of these. No interior page uses skewX, so the prices on /solutions and product pages stay upright.

## Source Nodes

- Brand lean (--slant-angle 10deg)
- Main navigation links array
- Hero lime WhatsApp call bar
- Lime contact band
- Codel Latin wordmark letterforms (d, e, l)