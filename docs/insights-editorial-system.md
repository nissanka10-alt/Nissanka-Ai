# Nissanka Insights Editorial Design System v1.0

Scope: the Insights index and published article routes only. Source: **NISSANKA — Insights Section Branding & Front-End Specification**, with the implementation clarifications for the November 2026 restoration. Do not change the global font import, logo, header, footer or other sections to publish an Insight.

## Choose the governed template

- **Standard Insight / Essay / Guide:** Mount `InsightArticle.astro` inside the existing `BaseLayout`. Use the common header, five-field metadata strip, Share / Save row and a single white reading column no wider than 720px. Any existing separate subtitle sits beneath the title; the standfirst is always regular Inter. Safe AI retains its ten-question guide and contents navigation. PDPA retains its illustration, lifecycle, questions and agenda.
- **Flagship Field Notes / Special Report:** Pass the `feature` object to the same layout. It adds a dark, full-bleed image cover, not a separate typography system. A flagship may use asymmetric narrative sections and inverted editorial bands. Keep the same reading typography, metadata and utility order.
- Use `InsightReferences.astro` and `InsightAuthor.astro` for separate end matter. Preserve inline research sections and paragraph order when they are already part of the manuscript. Reuse existing advisory copy and links for the related-pathway band; use `nk-print-hide` on commercial-only material.

## Typography and visual rhythm

`src/styles/insights.css` implements the v1.0 standard: the scoped bone/white/obsidian palette, ruled separation, square corners and typography.

### Bodoni Moda display settings

| Setting | Insights reference |
| --- | --- |
| Font family | `"Bodoni Moda", Georgia, serif`, via the existing display-font token. Load the real font faces; do not rely on a browser to synthesise the requested weights. |
| Display weight | `600` (Semibold) for editorial H1 and primary display titles, the featured Insight and listing/card titles. `500` (Medium) for editorial H2. `700` (Bold) for drop caps. Preserve the existing Nissanka monogram and wordmark as a separate brand treatment. |
| Optical size | Pin the OpenType axis to `"opsz" 12` for all editorial display roles, including drop caps, and set `font-optical-sizing: none` to prevent automatic sizing from choosing a finer cut on wide screens. |
| Kerning | `font-kerning: normal`. Preserve the typeface's natural pair spacing. |
| Letter spacing | `letter-spacing: normal`. Do not tighten tracking or compress glyphs to fit a headline. |
| Line height | `1.08` for H1 and the featured index title; `1.15` for H2; `1.14` for index cards and the library statement. These ratios are unitless so leading scales with the type. |

The final optical-size choice follows the matched 62px and 32px specimens at standard (1×) screen density, comparing weights `500` and `600` at optical sizes `12`, `18` and `24`. Size `12` keeps fine strokes more visible; the role-based weights retain the distinction between primary titles and section headings.

### Responsive sizing

Use bounded `clamp()` scales with `rem` limits so display type responds to viewport width and user font settings. Control wrapping with available width, a sensible measure and balanced lines where appropriate; never compensate with tighter tracking. Let long headlines wrap at word boundaries. Keep the standard split on desktop and stack it at or below `52rem`.

- Standard H1: `clamp(2.5rem, 4.4vw, 3.85rem)`, capped at `18ch`; at or below `36rem`, use `clamp(2rem, 8.3vw, 2.5rem)`.
- Standard H2: `clamp(1.9rem, 2.8vw, 2.5rem)`. Featured index title: `clamp(2.1rem, 4vw, 3.5rem)`. Index card titles: `clamp(1.75rem, 3vw, 2.65rem)`.
- Flagship cover H1 deliberately has a larger scale: `clamp(2.75rem, 6vw, 5rem)`; at or below `36rem`, use `clamp(2.3rem, 11vw, 3rem)`. It retains the shared Bodoni weight, optical treatment and leading.
- The standard article and index headers reduce the desktop breadcrumb-to-eyebrow gap by 20% above `52rem` (`clamp(2rem, 4vw, 3.6rem)`). The stacked layout and flagship image cover keep their existing spacing.
- Use sentence case for editorial headlines, retaining proper nouns, acronyms and intentional title treatments. Where the publication record retains a different casing, set `displayTitle` once for the standard article H1 and its Insights library card. The Difficult Conversations H1 and card match; the stored title, breadcrumb, share title and SEO remain unchanged.

### Drop caps and supporting type

- Drop caps use **Bodoni Moda 700** (Bold), `4.25rem` with `0.82` leading, normal kerning and tracking, the `"opsz" 12` cut and `12px` of right padding. Apply `nk-dropcap` only to the opening container whose first child is the first genuine body paragraph, not to a standfirst, summary, TOC, quotation or subheading. CSS styles the existing letter and contains the float within its paragraph without duplicating the character.
- Select the opening treatment on the article: `openingTreatment="drop-cap"` (the standard treatment) or `openingTreatment="plain"`. Use a plain lead-in where the opening paragraph reads better without a float, as in “A leader knows what needs to be said.” Preserve its wording, paragraph element and existing emphasis. Decide by editorial judgement, not a character-count rule.
- Use Inter **400** at `1.25rem / 1.55` for standfirsts and 17–18px / 1.7 for article copy. Use Inter **700** for H3 and meaningful bold, and Space Mono for breadcrumbs, labels and metadata. Use a left rule on genuine dialogue and quotes. Never split an author's paragraphs to create visual drama.

### Reference for a later brand restoration

For a future brand restoration, use the Insights family, weight, optical cut and natural spacing as the starting point for wider Nissanka display typography. Treat the Insights size clamps, line lengths and leading as a role-based reference, not a blanket rule for every page. Revalidate the real loaded fonts, fine strokes at standard pixel density, wrapping, and legibility on representative layouts before rolling out beyond Insights. This standard applies only to Insights and does not authorise changes to the global font system or edits to non-Insights pages.

## Metadata, accessibility and print

- Breadcrumb, eyebrow, headline/standfirst, **Author / Published / Topic / Geography / Format**, then sharing. Show Updated and Read time in the supplementary row when present in the published record. Never infer new values. Metadata wraps to three columns on tablet and two on phones.
- In Insights bylines, link Gishan Nissanka to his professional profile at `/profile/`, including in Field Notes. Byline presentation does not change the author entity in structured data.
- Keep one H1, existing heading/fragment IDs, readable focus states, alt text, descriptive link text and semantic lists/tables. TOC links must still jump to the original question headings. Keep an explicit featured record and newest-first chronological library. Do not change canonical URLs, SEO metadata or JSON-LD when changing visual presentation.
- Print on A4 with 17mm margins, white paper and black ink. Reuse the existing compact Nissanka stamp and wordmark in a first-page-only masthead with a Space Mono `NISSANKA.CO.UK / INSIGHTS` identifier and one rule. The masthead is hidden on screen. Subsequent pages show the site identifier and page number in browsers that support CSS page margin boxes; no JavaScript is required.
- Hide site chrome, breadcrumb/share navigation, cover photography and commercial link bands in print; retain the headline, standfirst, byline, date, body and references. Use one rule below metadata, `10pt / 1.45` body text and reduced paragraph and section spacing. Keep headings with the following material, list introductions with the start of their `ul` or `ol`, and author biographies intact where they fit. Use three-line widow/orphan controls and avoid splits inside fitting quotations, tables and callouts. Check the ending and biography in the actual print output; page count is not a design constraint.
- For future changes, run `npm run build`, compare substantive DOM text, markup and links with the previous render, inspect print, and check 390, 768, 1024, 1440 and 1920px. Capture matched mobile and desktop screenshots for visual review.
