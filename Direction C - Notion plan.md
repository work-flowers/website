# Direction C — Notion implementation plan

The drop-in `charm_style_sheet.css` does most of the heavy lifting, but the homepage **structure** has to change in Notion to match the mock. This doc walks through your home page block-by-block, top to bottom.

> **Convention used below**
> - **`/code`** in Notion = inline code span. Type a backtick, type the text, type another backtick. We'll use these as class-name triggers (the CSS recognises specific class names on inline code).
> - **Callout** = Notion's `/callout` block. Bullet renders these as `.bullet-callout` and propagates the colour you set (Brown, Blue, Gray, Orange, Purple).
> - **Column block** = Notion's `/columns` block (2, 3, or 4 columns). Bullet renders as `.bullet-2-column` etc.
> - To add a class to a block in Bullet: open the block menu → **Block ID / Class** → paste the class name(s). (If your Bullet version doesn't expose this, the fallback for inline elements is to wrap them in inline code with the class name as the text — the CSS targets both shapes.)

---

## Page-level setup

1. **Set the page wrapper.** On the home page in Bullet, open page settings and add the class **`wf-home`** to the page (or set `data-page="home"` on `<body>`). This is what tells the CSS to invert the nav.
2. **Nav links.** The nav itself is rendered by Bullet, but make sure the link order reads: **About Us · Blog · Case Studies · Pricing**, with **Get in touch** as the right-most CTA button.

---

## Section 1 — Hero (top of page)

This becomes a single full-bleed indigo section with a deck-cover headline.

**Build it as one Brown-coloured callout** (this is the same `brown_bg` you already use; the new CSS reskins it as the indigo full-bleed band). Inside the callout, top to bottom:

1. **Eyebrow** — type:
   ```
   `OPS ON DEMAND · SINGAPORE → APAC`
   ```
   then add the class **`eyebrow`** to that inline-code span.
2. **Headline (H1)**, three lines:
   ```
   Ops on
   demand
   *for lean teams.*
   ```
   The third line should be italicised — the CSS turns italics inside `brown_bg` into the peach-coloured deck accent automatically.
3. **Lead paragraph:**
   > Flexible access to senior-level operations horsepower. We automate the busywork, ship audit-ready systems, and build dashboards your team and investors will actually use.
4. **Buttons** — keep your existing two buttons but reorder so **Get in Touch →** is first (primary, peach) and **Schedule a Call** is second (ghost). Add class `btn--ochre` to the first, `btn--ghost` to the second.
5. **Image** — paper-robots image, right-aligned. Use a 2-column block where the left column holds steps 1–4 and the right column holds the image.
6. **Tagline strip** at the bottom of the callout — a thin horizontal rule then a single line of text:
   > Your jobs to be done. *Done smarter. Done faster.*
   Followed by three small mono-style credentials (`1ST ZAPIER PARTNER · SEA` / `VANTA MSP` / `NOTION SPECIALIST`). Each credential is an inline code span with no class — the default `<code>` styling is fine.

> **Notion edit summary:** restructure existing hero into a single Brown callout with a 2-column block inside. The H1 grows from ~40px to ~128px (handled by CSS, no Notion change needed).

---

## Section 2 — "The mess we fix" (pain-points)

This is the existing auto-scroll widget, **kept**, but promoted to be the second screen of the homepage (currently it appears further down).

1. Move the existing pain-points widget block up to immediately follow the hero.
2. Wrap it in a **2-column block**:
   - **Left column:** eyebrow `\`SLACK AT 11PM\`` (class `eyebrow is-azure`), then H2:
     > The mess
     > we fix.
     Then a paragraph:
     > Real questions our clients have asked. The pattern's always the same: humans doing what software should do.
     Then an inline code span: `` `Like an animal.` `` with class `animal-chip`, followed by the text `← stop.`
   - **Right column:** the existing auto-scroll widget. **No structural change needed** — the new CSS provides the masking gradient and bubble styling, and your existing widget JS continues to drive the scroll.

---

## Section 3 — Three pillars (full-width bands)

This is the biggest restructure. Today these are three callouts in a row; in Direction C they become three stacked full-width sections, alternating image/text sides.

**For each pillar**, create a **2-column block** and add the class **`wf-pillar`** to it. For pillar 02 (Insights), also add **`wf-pillar--flip`** so the image lands on the left.

### Pillar 01 — Automation everywhere
Left column:
- Inline code `` `01` `` (class `num-marker`) followed by 🤖 emoji
- H3: **Automation everywhere.**
- Body:
  > Stop writing release notes, onboarding employees, or routing leads manually. `Like an animal.`
  (the trailing chip is an inline-code span with class `animal-chip`)
- Sub-body:
  > We'll build workflows powered by no-code tools and AI to give you time back and reduce manual errors.

Right column: `paper-robots.png`

### Pillar 02 — Insights. Cool charts. *(flipped)*
Same structure, swap content. Image: dashboard chart.

### Pillar 03 — Compliance, less suck.
Same structure as pillar 01. Image: enrichment-flow.

> **Notion edit summary:** delete the existing 3-column pillars block, add three 2-column blocks in its place each with class `wf-pillar` (and `wf-pillar--flip` on the second).

---

## Section 4 — TL;DR (preserves your existing About blurb)

This is a short transition section that holds the company-description copy you currently have on the homepage. It lives just before the dark Process strip, which is a satisfying "small light → big dark" rhythm.

1. Add a Gray-coloured callout (class `gray_bg`).
2. Inside:
   - Eyebrow `` `TL;DR` `` (class `eyebrow is-azure`)
   - H2: **We automate away the manual, time-sucking pain points of running small businesses and lean teams.**
   - Paragraph (your existing About copy):
     > We help early-stage startups scale with automation, analytics, and AI. We blend experience from tech, finance, and the nonprofit sector to deliver clear strategy and hands-on implementation. Based in Singapore, **work.flowers** serves teams throughout the Asia Pacific region with a pragmatic, outcomes-first approach.

---

## Section 5 — How we work (Process strip)

A new section. Indigo full-bleed.

1. New Brown-coloured callout (`brown_bg`).
2. Eyebrow `` `HOW WE WORK` `` (class `eyebrow`).
3. Optional inline divider: `` `dot-rule` `` (renders as the dashed rule).
4. H2:
   > A senior operator on call *— for as long as you need one.*
5. **4-column block** with class **`wf-process-strip`**. Each column contains:
   - H3: the number — `01`, `02`, `03`, `04`
   - H4: the step name — Discover / Design / Build / Hand off
   - Paragraph: one-sentence description (use the copy from `DirectionC_Final.jsx`)

> **Note:** the number bubble + dotted ruler behind the steps is rendered entirely in CSS via the `.wf-process-strip` class on the column block. You don't need to draw any of it manually.

---

## Section 6 — Partners & shiny badges

Replace your existing partner logos with three "top-bar" editorial cards.

1. Eyebrow `` `PARTNERS & SHINY BADGES` ``.
2. **3-column block** with class **`wf-partners`**.
3. Each column gets one of the partner classes (`is-zapier`, `is-notion`, `is-vanta`) and contains:
   - H3 with the partner name in mono caps (e.g. `ZAPIER · GOLD SOLUTION PARTNER`)
   - One paragraph of body copy.

The coloured top bar comes from the `is-*` class — no images needed, but you can add the partner logo above the H3 if you'd like; it'll sit on top of the bar and look fine.

---

## Section 7 — Closer ("Stop doing ops manually. Like an animal.")

Mirror of the hero — same indigo, same dotted bg, same display-scale type.

1. Brown-coloured callout (`brown_bg`).
2. Centred content (you can wrap in a callout with `text-align: center` set, or just leave default-aligned and Bullet's centring will follow).
3. Eyebrow `` `READY?` ``.
4. H2 at deck-closer scale (the CSS already targets H2 inside `brown_bg` correctly):
   > Stop doing ops
   > manually. *Like an animal.*
5. Lead:
   > Ready to get started? To discuss which option best suits your needs, get in touch with us.
6. Two buttons: **Schedule a Call** (`btn--ochre`), **Get in Touch** (`btn--ghost`).

---

## Section 8 — Footer

No changes required. The new CSS restyles `.bullet-footer` to the dark editorial footer automatically. Just make sure your footer columns are: **Company / Legal / Connect** as in your current site.

---

## Order of operations (safe rollout)

If you want to ship in stages instead of all at once, this order minimises broken intermediate states:

1. **Drop in the new `charm_style_sheet.css`** with no Notion changes. Your existing site will *immediately* look 80% different — bigger headlines, new eyebrow style, restyled callouts, dark footer. **This is a great place to pause and gather feedback.**
2. **Promote pain-points to second-screen** (move existing block up). Wrap in 2-col, add the eyebrow + headline.
3. **Restructure the pillars** into three `wf-pillar` 2-column blocks.
4. **Add the Process strip** (new section).
5. **Add the TL;DR Gray callout** (new section, holds existing About copy).
6. **Restyle Partners** as `wf-partners`.
7. **Add the Closer** as a final Brown callout.

After step 1 your homepage already feels Direction-C-ish; steps 2–7 each add a discrete piece of structure and can be done in any order across multiple sessions.

---

## Class-name cheat sheet

| Class | What it does | Where to put it |
|---|---|---|
| `wf-home` | Inverts the nav for dark hero | Page-level wrapper |
| `eyebrow` | Deck-style "● LABEL" eyebrow | Inline code at top of section |
| `eyebrow is-azure` | Same, blue tint | Same |
| `brown_bg` | **Indigo** full-bleed band (existing class, restyled) | Callout block |
| `gray_bg` | Light tint full-bleed band | Callout block |
| `orange_bg` | Warm paper full-bleed band | Callout block |
| `wf-pillar` | Image+text full-width band | 2-column block |
| `wf-pillar--flip` | Reverses the column order | Same 2-column block |
| `wf-process-strip` | 4-step numbered process row | 4-column block |
| `wf-partners` | Editorial partner top-bars | 3-column block |
| `is-zapier` / `is-notion` / `is-vanta` | Partner colour bar | Each partner column |
| `num-marker` | Numbered circle (e.g. `01`) | Inline code |
| `animal-chip` | "Like an animal." pill | Inline code |
| `dot-rule` | Dashed horizontal rule | Notion divider or inline code |
| `btn--ochre` | Peach/ochre primary button | CTA button |
| `btn--ghost` | Outlined ghost button | CTA button |

---

## Open questions / things to confirm later

- **Hamburger menu on mobile.** The CSS hides the desktop nav links at ≤540px and assumes Bullet has its own hamburger. Confirm this works in your build; if not, ping me and I'll add a CSS-only menu toggle.
- **Partner logos.** I left them out of the editorial top-bar treatment, but they look fine if you slot them above the H3. Decide based on how the real logos look.
- **Pillar images.** Right now they're recycled from the deck (paper-robots, dashboard-chart, enrichment-flow). For long-term polish, commission a paper-craft illustration per pillar.
- **Hero image.** Same caveat — paper-robots is doing a lot of work as both the hero image AND a pillar image. Long-term, pick one.

When you're ready to start, drop the CSS in first and let me know what shifts unexpectedly. I'll iterate from there.
