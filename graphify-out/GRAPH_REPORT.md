# Graph Report - .  (2026-11-07)

## Corpus Check
- Corpus is ~12,773 words - fits in a single context window. You may not need a graph.

## Summary
- 172 nodes · 233 edges · 27 communities (26 shown, 1 thin omitted)
- Extraction: 90% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.87)
- Token cost: 295,064 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Content Policy & Data Sources|Content Policy & Data Sources]]
- [[_COMMUNITY_Layout Shell & Menu Rules|Layout Shell & Menu Rules]]
- [[_COMMUNITY_Pages & Accessibility Conventions|Pages & Accessibility Conventions]]
- [[_COMMUNITY_package.json Manifest|package.json Manifest]]
- [[_COMMUNITY_Brand, Theme & Nuxt Config|Brand, Theme & Nuxt Config]]
- [[_COMMUNITY_SEO, Placeholders & Owner Backlog|SEO, Placeholders & Owner Backlog]]
- [[_COMMUNITY_Logo Family & Share Image|Logo Family & Share Image]]
- [[_COMMUNITY_default.vue Menu Functions (AST)|default.vue Menu Functions (AST)]]
- [[_COMMUNITY_Self-hosted Fonts & Licenses|Self-hosted Fonts & Licenses]]
- [[_COMMUNITY_error.vue (AST)|error.vue (AST)]]
- [[_COMMUNITY_Claude Flow Session File|Claude Flow Session File]]
- [[_COMMUNITY_company.ts (AST)|company.ts (AST)]]
- [[_COMMUNITY_solutions.ts (AST)|solutions.ts (AST)]]
- [[_COMMUNITY_tsconfig.json (AST)|tsconfig.json (AST)]]

## God Nodes (most connected - your core abstractions)
1. `Home page (الرئيسية)` - 10 edges
2. `solutions array (ready-made products)` - 9 edges
3. `Solution detail page (/solutions/[slug])` - 9 edges
4. `44px standalone-link touch target` - 9 edges
5. `Codel 'co' monogram glyph` - 9 edges
6. `company facts object` - 8 edges
7. `Default layout (skip link, header, main, footer)` - 8 edges
8. `Contact page (تواصل معنا)` - 8 edges
9. `دليل التسليم (owner handover guide)` - 8 edges
10. `Main navigation links array` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Favicon (adaptive Codel symbol)` --semantically_similar_to--> `Logo variant-to-ground rule`  [INFERRED] [semantically similar]
  public/favicon.svg → CLAUDE.md
- `Default layout (skip link, header, main, footer)` --implements--> `Logo usage rules (white/ink/lime variants)`  [INFERRED]
  app/layouts/default.vue → CLAUDE.md
- `theme-color meta #101411` --conceptually_related_to--> `Semantic design tokens (CSS custom properties)`  [INFERRED]
  nuxt.config.ts → CLAUDE.md
- `Claude Flow session state (owned hooks: route, post-edit)` --conceptually_related_to--> `CLAUDE.md assistant conventions`  [AMBIGUOUS]
  .claude-flow/mods/session.json → CLAUDE.md
- `Default layout (skip link, header, main, footer)` --implements--> `Skip link (تخطَّ إلى المحتوى)`  [EXTRACTED]
  app/layouts/default.vue → CLAUDE.md

## Hyperedges (group relationships)
- **Pages that read the solutions data file** — solutions_solutions, solutions_index_listing_page, slug_solution_detail_page, index_home_page, faq_faq_page [EXTRACTED 1.00]
- **Placeholder noindex pages kept out of navigation and sitemap** — blog_blog_page, careers_careers_page, privacy_privacy_page, terms_terms_page, claude_placeholder_pages [EXTRACTED 1.00]
- **Small-screen menu dismissal flow** — default_mobile_menu, default_close_menu, default_on_keydown, default_on_pointer_down, default_on_focus_out, default_on_wide_change, default_stop_listening [EXTRACTED 1.00]
- **Logo variants for dark grounds (white and lime)** — codel_full_white_logo, codel_full_lime_logo, codel_symbol_white_logo, codel_symbol_lime_logo [EXTRACTED 1.00]
- **Logo variants for light grounds (charcoal ink)** — codel_full_ink_logo, codel_symbol_ink_logo, favicon_adaptive_symbol [INFERRED 0.85]
- **Social share image: white logo on --bg, served as og:image** — codel_full_white_logo, main_scss_bg_token, og_png, default_layout_share_tags [EXTRACTED 1.00]

## Communities (27 total, 1 thin omitted)

### Community 0 - "Content Policy & Data Sources"
Cohesion: 0.13
Nodes (22): CLAUDE.md assistant conventions, Codel - كودل (Iraqi software startup, Baghdad), Content policy: never invent facts, Product image convention (public/solutions/<slug>), JSON-LD with real facts only, Single source of truth (two data files), company facts object, addressParts / openingHours (JSON-LD shapes) (+14 more)

### Community 1 - "Layout Shell & Menu Rules"
Cohesion: 0.13
Nodes (21): App root (NuxtRouteAnnouncer + NuxtLayout + NuxtPage), Error page and 404 convention (status/statusText), No-JS fallback via html.js class, No-library rule, Not-yet-allowed constructs (components, composables, utilities, forms), Small-screen menu behaviour spec (below 60em), closeMenu(), Default layout (skip link, header, main, footer) (+13 more)

### Community 2 - "Pages & Accessibility Conventions"
Cohesion: 0.20
Nodes (21): About page (من نحن), WCAG 2.1 AA accessibility conventions, CSS-only optional motion, fullWidth page meta convention, Western-digit IQD price format (Intl en-US), Skip link (تخطَّ إلى المحتوى), 44px standalone-link touch target, Contact page (تواصل معنا) (+13 more)

### Community 3 - "package.json Manifest"
Cohesion: 0.11
Nodes (17): dependencies, nuxt, vue, vue-router, devDependencies, sass, engines, node (+9 more)

### Community 4 - "Brand, Theme & Nuxt Config"
Cohesion: 0.13
Nodes (15): Bilingual page titles (Arabic / English), Brand lean (--slant-angle 10deg), Codel design system (tokens.json), Dark-first charcoal and lime theme, Semantic design tokens (CSS custom properties), Logo usage rules (white/ink/lime variants), Share image og.png (1200x630), Arabic-first RTL document (+7 more)

### Community 5 - "SEO, Placeholders & Owner Backlog"
Cohesion: 0.19
Nodes (14): Blog placeholder page (المدونة), Careers placeholder page (الوظائف), Unreviewed draft content, Placeholder pages policy (noindex, unlinked, no sitemap), SEO and sharing (siteUrl-gated canonical and og:url), Service interface, services array (five services), company.siteUrl (empty until domain known) (+6 more)

### Community 6 - "Logo Family & Share Image"
Cohesion: 0.31
Nodes (14): Brand lean (--slant-angle 10deg), Logo variant-to-ground rule, Codel full logo (ink), Codel full logo (lime), Codel full logo (white), Codel Latin wordmark letterforms (d, e, l), Codel 'co' monogram glyph, Codel symbol (ink) (+6 more)

### Community 7 - "default.vue Menu Functions (AST)"
Cohesion: 0.29
Nodes (7): closeMenu(), fullWidth, menuOpen, onFocusOut(), onKeydown(), onPointerDown(), onWideChange()

### Community 8 - "Self-hosted Fonts & Licenses"
Cohesion: 0.70
Nodes (5): Self-hosted fonts (Rubik, Readex Pro), Font preloads (Rubik + Readex Pro woff2), Readex Pro font (reserved name RevReading Lexend), Rubik font (Rubik Project Authors), SIL Open Font License 1.1

### Community 9 - "error.vue (AST)"
Cohesion: 0.50
Nodes (3): heading, notFound, text

### Community 10 - "Claude Flow Session File"
Cohesion: 0.50
Nodes (3): owned, startedAt, statusLine

### Community 11 - "company.ts (AST)"
Cohesion: 0.50
Nodes (3): company, Service, services

### Community 12 - "solutions.ts (AST)"
Cohesion: 0.50
Nodes (3): Solution, SolutionImage, solutions

## Ambiguous Edges - Review These
- `Claude Flow session state (owned hooks: route, post-edit)` → `CLAUDE.md assistant conventions`  [AMBIGUOUS]
  .claude-flow/mods/session.json · relation: conceptually_related_to

## Knowledge Gaps
- **47 isolated node(s):** `name`, `type`, `private`, `node`, `build` (+42 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Claude Flow session state (owned hooks: route, post-edit)` and `CLAUDE.md assistant conventions`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `دليل التسليم (owner handover guide)` connect `Content Policy & Data Sources` to `Layout Shell & Menu Rules`, `SEO, Placeholders & Owner Backlog`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `Default layout (skip link, header, main, footer)` connect `Layout Shell & Menu Rules` to `Pages & Accessibility Conventions`, `Brand, Theme & Nuxt Config`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `company facts object` connect `Content Policy & Data Sources` to `Pages & Accessibility Conventions`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **What connects `name`, `type`, `private` to the rest of the system?**
  _49 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Content Policy & Data Sources` be split into smaller, more focused modules?**
  _Cohesion score 0.1341991341991342 - nodes in this community are weakly interconnected._
- **Should `Layout Shell & Menu Rules` be split into smaller, more focused modules?**
  _Cohesion score 0.12857142857142856 - nodes in this community are weakly interconnected._