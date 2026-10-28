# Notion callout colours → what Bullet renders

Quick reference for picking a callout colour in Notion. Source of truth is
`charm_style_sheet.css` (§1 tokens, §7–§14); line numbers drift, so search for
the class name.

Bullet gives a callout with a *background* colour the class
`.notion-<colour>_background_co`. A callout with no colour gets
`.notion-default-callout`. Text-colour callouts (not background) are not styled.

## The short version

| Notion background | Renders as | Text | Use it for |
|---|---|---|---|
| **Blue** | Indigo band `#2E1B88`, full-bleed | White; links peach `#F6C696`; eyebrows peach | Hero, process strip, final CTA, any dark section |
| **Brown** | Warm off-white band `#FAF7F2`, full-bleed — *except* as the first block, where it turns into the indigo hero | Ink `#1F1F1F` | Warm tinted section between white bands (pillar 2) |
| **Gray** | Ink `#1F1F1F` | Not forced to white — see caveat | Dark aside; blog posts |
| **Yellow** | White card, 1px rule border, small shadow, inset 100px from the edges | Default ink | Legacy pillar cards; a light boxed card |
| **Default** (no colour) | Bullet's default callout; inside a 2-column row, a white card with a rule border | Default ink | Cards in a 2×2 grid |
| **Red, orange, green, pink, purple, teal** | Not brand-styled. Bullet derives them from the theme baseline HSL, which is mostly blues (orange and pink both come out blue) | Bullet default | Avoid |

## Blue changes with position

The same blue callout gets three different treatments depending on where it
sits among the page's top-level blocks:

| Position | Treatment |
|---|---|
| First (`:first-of-type`) | **Hero** — dotted indigo, 88/100/120px padding, huge H1, body text 88% white, icon hidden, images left-aligned |
| Last (`:last-of-type`) | **Final CTA** — dotted indigo, centred, 140px padding, huge H2, `*italic*` in the H2 turns peach |
| Anywhere else | **Plain indigo band** — 96px/100px padding, no dots |
| Containing a 4-column block | **Process strip** — dashed ruler behind the columns; callouts inside the columns lose their background and their icon becomes a 48px outlined circle (the 01/02/03 markers) |

`:first-of-type` / `:last-of-type` count by element type (`div`), not by
callout, so "first" means the first block on the page, not the first blue
callout. A paragraph above the hero callout breaks the hero styling.

## Brown also changes with position

| Position | Treatment |
|---|---|
| First block on the page | Same indigo hero as blue (hills photo hidden, white text) |
| Anywhere else | Warm `#FAF7F2` band, 64px/100px padding, all text ink. Inner 2-columns get the pillar styling (numbered eyebrow, indigo headline, azure code pills) |

On `/about-us/` the brown band has its own extra rules (§19).

## Callouts inside a 2-column row

Any callout, whatever its colour, that is a direct child of a top-level
2-column block becomes a card: 28/32px padding, small shadow, and the row
becomes a 2×2 grid with equal cell heights (one column under 800px). Card
headings drop to 1.375rem. An uncoloured callout here gets a white
background and rule border so it matches its coloured neighbours.

## Things that follow the colour automatically

- **Eyebrows** (a paragraph that is only an inline-code span): ochre on light
  callouts, peach on blue and gray.
- **Buttons** (`.bullet-btn`): always ochre with white text, including on blue
  and gray.
- **Dividers**: dashed indigo at 32% on light; dashed white at 30% on blue and
  gray.
- **Blog posts**: blue and gray callouts lose their side margins and sit flush
  with the text column.

## Caveat: gray

The gray tokens set the background to ink `#1F1F1F`, but unlike blue there is
no rule forcing gray's text white — only its eyebrows, dividers and buttons
are recoloured. Check the rendered page before using a gray callout with body
copy in it; if the text is dark on dark, add a
`.notion-gray_background_co * { color: #fff !important; }` rule next to
blue's in §7.

## Changing a mapping

Colours are set as tokens in §1 of `charm_style_sheet.css`
(`--notion-<colour>_background_co`). Swap the `var(--wf-…)` there to recolour
everywhere; the layout rules (padding, full-bleed, hero/CTA position) live in
§7, §9, §10 and §13. Deploy per the README.
