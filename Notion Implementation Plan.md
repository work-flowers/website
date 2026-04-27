# Homepage redesign — Notion implementation plan

**Direction C (Bold).** Paired with the new `charm_style_sheet.css`. You edit Notion; the CSS does the rest.

The new CSS is **shape-aware**: it targets the *position* and *type* of Notion blocks (first blue callout = hero, last blue callout = closer, divider = section ruler, etc.). So the order and block types below matter. Follow the structure exactly and the page renders as mocked.

---

## 0 · Before you start

1. Replace the entire stylesheet in Bullet with `charm_style_sheet.css`.
2. Open the home page in Notion (`/Home`) — we'll rebuild the body top-to-bottom.
3. Keep the existing pain-points custom-code block aside; you'll paste it back in.

---

## 1 · Hero (replace the existing brown_bg "Ops on demand" callout)

**Block:** **`/callout`** → set color to **Blue background**.

Inside the callout, in this order:

1. Inline-code line: `` `● OPS ON DEMAND · SINGAPORE → APAC` ``
   *(Wrap the whole line in inline code — that's the eyebrow trigger.)*
2. **Heading 1**: `Ops on demand for lean teams.`
   *(Add a line break before "for lean teams." so it stacks; the CSS sizes it to 96–128px responsively.)*
3. **Text**: `Senior-level operations horsepower, on tap. We automate the busywork, embed AI where the work happens, and ship dashboards your team and investors will actually use.`
4. **Text** (bold): `**Your jobs to be done. Done smarter. Done faster.**`
5. Empty line.
6. Two **buttons** side-by-side using a 2-column block:
   - Left: link button → `[Get in Touch →](/contact)`
   - Right: link button → `[Schedule a Call](https://calendar.notion.so/meet/...)`

> **CSS handles:** dotted-pattern indigo bg, white type, large display, peach button.
> **Notion image** (paper-robots): drop it in the right column of a 2-column block inside the callout if you want the image alongside; otherwise leave text-only and the CSS centers it.

---

## 2 · "The mess we fix" (the pain-points widget — promoted)

**Block 1:** Plain `Heading 2`: `The mess we fix.`
**Block 2:** Inline-code eyebrow above it: `` `● SLACK AT 11PM` ``
**Block 3:** Short body text: `Real questions clients have asked us. The pattern's always the same: humans doing what software should do.`

**Block 4:** Paste the existing **HTML embed** (the `<div id="wf-painpoints">…</div>` block) — no edits needed. The CSS now styles it as white bubbles with Slack-style left/right stagger.

> Move this block **above** the pillars. It's the second screen now, not buried below.

---

## 3 · The three pillars (vertical bands — replaces the yellow callouts)

Currently: 3-column row of yellow_bg callouts. **Change to:** an intro block + three full-width vertical sections stacked on top of each other, each with image and copy alternating left/right.

### 3a. Intro

Three blocks stacked, **full-width** (no columns):

1. **Divider** (`---`)
2. **Text** block — type `● WHAT WE DO`, then select the whole line and apply Notion's inline-code formatting (`Cmd/Ctrl + E`). The CSS styles any code-formatted line that starts with a bullet `●` as a small uppercase eyebrow.
3. **Heading 2**: `Three pillars. One AI-powered operator.`
   - Then select just the words *One AI-powered operator.* and italicize them (`Cmd/Ctrl + I`).
   - The CSS recolors italic text inside an H2 to indigo, so you'll see the second sentence light up. (No need to change the color manually — Notion's italic toggle is the trigger.)
4. **Text** block: `**TL;DR.** We make lean teams faster, with AI, automation, and analytics wired into the way you already work.` (Bold the "TL;DR." part with `Cmd/Ctrl + B`.)

> **Why no 2-column block here:** the headline + TL;DR read better as a single centered intro stack than split into a column layout. The columned version was an early idea I've dropped.

### 3b. Pillar 1 — Automation (image LEFT, copy RIGHT)

A full-width **2-column block** (no callout wrapper — band is white by default):

- **Left**: image — `paper-robots.png` (or whatever paper-craft asset suits Automation).
- **Right**: text stack:
  - Inline-code eyebrow: `` `01 / Automation` ``
  - Plain text: `🤖`
  - **Heading 3**: `Work happens without you.`
  - **Text** (bold): `**Autonomous workflows and agents that do the manual stuff.**`
  - **Text**: `Inbox triage, invoice processing, lead enrichment, approvals, release notes. Event-driven pipelines and AI agents that run in the background so your team doesn't have to.`
  - **Text** with three inline-code chips: `` `Zapier`  `AI agents`  `Workflows` ``

### 3c. Pillar 2 — Analytics (copy LEFT, image RIGHT — flipped)

Same 2-column structure, but flipped:

- **Left**: text stack:
  - Eyebrow: `` `02 / Analytics` ``
  - `📊`
  - **Heading 3**: `Work you can see.`
  - **Bold text**: `**Dashboards, warehouses, and the metrics that matter.**`
  - **Text**: `A full BI stack (warehouse, models, dashboards) that turns scattered ops data into the numbers you and your investors actually want, in the tools your team already opens.`
  - Pills: `` `Warehouse`  `Dashboards`  `Metrics on demand` ``
- **Right**: image — `dashboard-chart.png`.

> Wrap this whole pillar in a **brown_background** callout to give it the warm off-white band — the CSS now flattens brown_bg to a band tint, not indigo. (If brown_bg is being used as the indigo statement token instead, make this band a plain section and lean on a divider.)

### 3d. Pillar 3 — AI enablement (image LEFT, copy RIGHT)

- **Left**: image (placeholder until we source a paper-craft AI image — `enrichment-flow.png` works for now).
- **Right**:
  - Eyebrow: `` `03 / AI enablement` ``
  - `✨`
  - **Heading 3**: `Your team, with AI superpowers.`
  - **Bold**: `**Make Claude & co. actually useful inside your business.**`
  - **Text**: `Custom Skills, MCP connectors, and API integrations so AI assistants can read and write your real systems: Notion, Linear, your database, your docs. Plus Vanta-backed SOC 2 / ISO 27001, accelerated with agents that chase evidence for you.`
  - Pills: `` `Skills`  `MCP`  `Integrations` ``

> **Compliance** doesn't disappear — the SOC 2 / ISO line above keeps it discoverable, and the dedicated **Services → Compliance** page (or About) holds the depth.

### Notes on the pills

The CSS turns any `inline code` inside a pillar paragraph into a rounded azure pill. So just type three back-tick-wrapped words on a line.

---

## 4 · How we work (NEW section — process strip)

**Block:** **`/callout`** → set color to **Blue background**.

Inside, in order:

1. Inline-code eyebrow: `` `● HOW WE WORK` ``
2. **Heading 2**: `A senior operator on call — for as long as you need one.`
3. A **4-column block**, each column containing a callout with the icon set to a number:

| # | Icon (callout) | Heading 3 | Body |
|---|---|---|---|
| 01 | `01` | Discover | Free 30-min scoping call. We map jobs-to-be-done and rank by ROI. |
| 02 | `02` | Design | Architecture, vendor short-list, automation flow diagrams. Fixed-fee. |
| 03 | `03` | Build | We ship in sprints inside your tools — Zapier, Notion, your warehouse. |
| 04 | `04` | Hand off | Documented runbooks. Optional retainer for monitoring and tweaks. |

> The CSS turns each callout icon into a circular numbered node, draws the dashed connecting line, and styles the headings/body for the dark band.

---

## 5 · Partners & shiny badges (existing — minor edits)

Keep the existing 3-column row of partner callouts. Just:

- **Above the row**, add a divider + eyebrow: `` `● PARTNERS & SHINY BADGES` ``
- Tighten each callout's body copy to one sentence (the CSS gives them less vertical room now).
- The order matters — Zapier, Notion, Vanta — because the CSS colours the top border per column position.

---

## 6 · Final CTA (replace today's "Ready to get started?" text + button)

**Block:** **`/callout`** → set color to **Blue background**.

Inside:

1. Inline-code eyebrow: `` `● READY?` ``
2. **Heading 2**: `Stop doing ops manually. *Like an animal.*`
   *(The italic span gets coloured peach via the CSS — wrap "Like an animal." in italics in Notion.)*
3. **Text**: `30-minute scoping call. Free. We'll tell you whether we can help.`
4. Two **buttons** in a 2-col block: `[Schedule a Call]` (primary) · `[Get in Touch]` (secondary).

> The CSS recognises this as the **last** blue callout on the page and sizes it to bookend the hero — same dotted indigo, same peach accent.

---

## Final block order (top → bottom)

| # | Block | Notion type | Color |
|---|---|---|---|
| 1 | Hero | Callout | Blue bg |
| 2 | "The mess we fix" — H2 + eyebrow + widget embed | H2 + Text + Custom code | — |
| 3 | "Three pillars" — divider + eyebrow + H2 | Divider + Text + H2 | — |
| 3 | "Three pillars" — divider + eyebrow + H2 + TL;DR | Divider + Text + 2-col (H2 + Text) | — |
| 4a | Pillar 1 (Automation) | 2-column block: image \| text | Default |
| 4b | Pillar 2 (Analytics) | 2-column block: text \| image | Brown bg (warm tint) |
| 4c | Pillar 3 (AI enablement) | 2-column block: image \| text | Default |
| 5 | "How we work" | Callout containing 4-column | Blue bg |
| 6 | "Partners" — divider + eyebrow | Divider + Text | — |
| 7 | Partners row | 3-column of callouts | Default |
| 8 | Final CTA | Callout | Blue bg |

---

## Things you can ignore

- The `--notion-yellow_background` token is now flat white — any leftover yellow callouts will quietly turn into white cards. No need to convert them all today.
- The `--notion-brown_background` is now indigo — so the existing brown_bg hero will work even before you swap it to blue_bg. (But swap it; the markup is cleaner.)
- The `notion-gray_background_co` is now the eerie-black ink colour — useful for any future dark-on-light ribbon.

## Things to test after edits

1. **Eyebrows** render small-caps peach/ochre, not as code blocks. (If they look like code, the inline-code wrap is wrong — make sure the *whole line* is one inline-code.)
2. **Hero H1** wraps to two/three lines with the line break you inserted.
3. **Pain-points** bubbles stagger left/right as they scroll.
4. **Process** numbers sit on a dashed horizontal line.
5. **Partner top-borders** are orange / black / green in that order.
6. **Closer H2** has the peach italic "Like an animal."

If any of those don't render, send me the live URL and I'll iterate the CSS.
