# work.flowers website

Custom styles, scripts, and assets for the [work.flowers](https://work.flowers) website.

## Stack

Content is managed in **Notion** and published via **Bullet.so**. This repo holds the CSS
and JS that Bullet loads, plus the snippets that have to be pasted somewhere by hand.

## Files

| File | Purpose |
|------|---------|
| `charm_style_sheet.css` | Main site stylesheet — CSS custom properties, Notion/Bullet class overrides, blog typography, responsive breakpoints |
| `bullet_bundle.js` | Every piece of runtime behaviour on the site: body classes, GA4, JSON-LD, the `noindex` rules, the H1 retag, the `/about-us/` testimonial widget. Loaded once from the head, pinned by SHA |
| `head.html` | Template for the one block pasted into Bullet's custom **head** code. `{{SHA}}` is filled in by `scripts/bullet-head.sh` — do not paste this file directly |
| `bullet_theme_baseline.css` | Snapshot of Bullet's `#bullet-theme` block, so the verifier can tell when someone changes a theme setting in the dashboard |
| `jtbd_widget.html` | Auto-scrolling "pain points" chat-bubble widget. Pasted into a Notion custom-code block on the homepage, not deployed from here |
| `newsletter_embed.html` | Email newsletter signup embed |
| `reviews-schema/` | `customer-reviews.json` plus `build_review_schema.py`, which rewrites the generated review-JSON-LD region of `bullet_bundle.js` in place |
| `scripts/bullet-head.sh` | Prints (and copies) the head block for a given commit |
| `scripts/verify-live.py` | Checks the live site actually matches a given commit |

## Deploying

Three commands, one paste:

```bash
scripts/bullet-head.sh              # 1. prints the block, copies it to the clipboard
                                    # 2. paste into Bullet, then publish
scripts/verify-live.py              # 3. proves the live site matches
```

Step 1 fetches `origin`, resolves `origin/main` to a full commit SHA, fills it into both
jsDelivr pins and copies the result. Paste that into **Bullet → Settings → Custom Code →
Head**, replacing everything already there, and publish — Bullet serves a stored render,
so custom-code edits only reach the CDN on a publish. Nothing else moves.

Every merged change to the stylesheet or the bundle needs this, because the commit SHA is
in both pins and moves whenever either file does.

Both scripts fetch `origin` themselves rather than trusting the local ref. That is not
convenience: a stale `origin/main` would make them agree with each other on the *previous*
commit and call a one-commit-behind site green.

### Why the SHA pins stay

Pinning to `@main`, or to a moving `@live` tag, would remove the paste entirely. It is
still wrong. jsDelivr serves a branch ref with `cache-control: max-age=604800,
s-maxage=43200`, against `max-age=31536000, immutable` for a SHA. A moving ref means
returning visitors keep stale CSS for up to a week, and the purge API cannot clear a
browser cache. The pins are correct; typing them by hand was the problem, and that is
what `bullet-head.sh` removes.

### What the verifier actually proves

Reading the live page tells you a pin is *present*. It cannot tell you the pin is
*right* — a stale or mistyped SHA looks identical in the HTML. So the load-bearing check
is the hash comparison: `verify-live.py` fetches what jsDelivr serves for each pin and
compares it byte for byte against the repo at the expected commit. Around that it checks
the head paste is complete, that the JSON-LD parses, that no leftover paste is running a
second copy of anything, that the body ids the class shim keys off still exist, that the
homepage still matches `jtbd_widget.html`, and that nobody has changed a Bullet theme
setting. It exits non-zero with a checklist.

Both scripts default to `origin/main`; pass a ref or SHA to work against something else.

### Surfaces that still move by hand

Down from five to three, and only one of them is code:

| Surface | State |
|---------|-------|
| Bullet global **head** | one generated paste — the only manual code step |
| `jtbd_widget.html` (Notion custom-code block) | manual, but the verifier fails when the live homepage stops matching the repo copy |
| Bullet **theme settings** | a setting, not code — the verifier diffs the served `#bullet-theme` against `bullet_theme_baseline.css` |

Bullet's global **footer** and the per-page custom code on `/about-us/`, `/legal/msa/`,
`/legal/dpa/` and `/privacy/` are no longer surfaces at all: they should be empty, and
`verify-live.py` fails if anything comes back. Everything they held now rides
`bullet_bundle.js`.

The one thing deliberately *not* in the bundle is the sitewide Organization /
ProfessionalService JSON-LD. It stays literal markup in the head paste so it is
server-rendered. Injecting the site's primary entity from JavaScript would make Google's
view of it depend on a render pass that is delayed and not guaranteed — the same weakness
the archive-title section of the bundle documents about itself.

### Body classes

The stylesheet is written against `body.home`, `body.about-us` and `body.legal` — 133
selectors. Bullet emits `<body id="page-<slug>">` server-side and no classes at all, so
each of those pages used to carry a hand-pasted inline script adding its own class. The
`BODY_CLASS` table at the top of `bullet_bundle.js` does it in one place instead.

The mapping is written out rather than derived, because it is editorial: `/privacy/`
takes `body.legal` without living under `/legal/`. Adding a page that needs one of these
classes means adding a row there. `verify-live.py` checks the body ids the table keys off
still exist, so a renamed Notion slug fails loudly instead of silently dropping a page's
styling.

## SEO audit and remediation

Findings, status and deploy notes live in the Notion project **SEO Remediation** (WF-27),
which is the source of truth:
https://www.notion.so/3d191b0711ac819d8689f0b285d3d742

Its **How deploys work** section describes the five-surface deploy that TKT-864 replaced.
The loop above is the current one; three of those surfaces are gone.

(The former `seo-audit-2026-09.md` was removed on 5 Sep 2026; it was a second copy that
had to be kept in step by hand. History is in git.)

## Notion source

The website content lives under the **Our Website** page in Notion:
https://www.notion.so/work-flowers/Our-Website-1d791b0711ac80dca190cc3f88777447

Databases that produce their own URLs: **Pages List**, **Posts**, **Supercut Recordings**,
**Customer Reviews** — see below. Other databases in this tree (Point Reference Guide, Team)
render inside pages and never get URLs of their own; none of them appears in `sitemap.xml`.

### What Bullet will publish

Not everything nested under Our Website. Bullet starts from the **Pages List** database and
publishes the rows with `Publish` ticked — 12 of its 14 rows today, which are the site's
top-level pages (`/`, `/about-us`, `/blog`, `/legal/msa`, …).

It then follows **linked database views embedded in those pages**, and publishes the rows of
the databases behind them, each at its own path. That second hop is where the bulk of the site
comes from, and it is not visible from Pages List alone:

| Source | URLs | Paths |
|--------|------|-------|
| Pages List | 12 | `/`, `/about-us`, `/legal/…`, and the `/blog` index |
| Posts | 83 | `/blog/<slug>` |
| Supercut Recordings | 24 | `/supercut-recordings/<slug>` |
| Customer Reviews | 10 | `/customer-reviews/<slug>` |
| Contact Form | 1 | `/contact-form` |

That is exactly the 130 URLs in `sitemap.xml`, with nothing unaccounted for — the check to
re-run whenever this table looks stale.

`/contact-form` is the one exception to the rule above: it is **not** a Pages List row, but a
plain page sitting as a direct child of Our Website. So a child page of Our Website can publish
on its own. Treat it as the known exception rather than evidence that nesting is what selects
pages generally — the other 129 URLs all arrive through Pages List and its linked views.

So publication is a **chain**, not a property of a page: a Pages List row with `Publish` ticked,
the linked view sitting inside it, and the database row behind that view. Break any link and
everything downstream of it leaves the publish walk at once. That is how one starter-kit row
became 113 URLs (its `component-database` was reached exactly this way), and how deleting that
one row removed all 113.

**This matters more than it sounds, because breaking the chain strands the pages rather
than removing them.** Bullet drops it from `sitemap.xml`, but its last render stays on the CDN
still returning `200` — and since a republish can only walk pages it can still reach, that
render is frozen. No future deploy, on any surface, will touch it again. The URL keeps serving
whatever the page contained at the moment it left the tree.

A stale jsDelivr pin in a page's `<head>` is the reliable tell that this has happened: compare
its `charm_style_sheet.css@<sha>` against a page you know is live. Worth spot-checking one row
from each database after any restructuring, since unpublishing a single *host* page would
strand every row of the view it carried.

**So: noindex first, unpublish second.** Get the directive into the render while the page is
still reachable, then take it out of the tree. In that order a stranded copy is harmless — it
keeps serving `noindex` and leaves the index by itself. In the other order the page is stuck in
Google's index with the render frozen against you. That is audit finding C-04, and it is why
`/webeeui-bullet-website-builder-kit/` and `/embed-test/` served demo content for months.

Unpublishing is not a way to remove a page from Google. It is a way to lose control of it.

### Recovering a stranded page

There is one lever left, and it is not in this repo: **Settings → Redirects** in the Bullet
dashboard. Redirects resolve at Bullet's routing layer, *in front of* the stored render, so they
reach pages that no deploy can — which is exactly the property `footer.html` lacks. Adding
`/old-path/ → /` stops a stranded URL serving its frozen content immediately.

Two things to know before relying on it:

- **Bullet emits `302`, not `301`.** The form has no type selector. A 302 reads as *temporary*,
  so Google may keep the URL indexed rather than dropping it. It reliably ends the content being
  served; it does not reliably deindex. For that, ask Bullet support to purge the path so it
  returns `410`.
- It is a repair, not a substitute for the ordering above. Noindex-first still costs nothing and
  still works on its own; reach for a redirect only once a page is already stranded.

Precedent in the redirect list: `/html-test`, `/test-post-1/`, `/newhome` and a raw Notion page
id `/1d991b0711ac80d1b9e2c741a04521bb/` all point at `/` — earlier orphans, cleared this way.
`/webeeui-bullet-website-builder-kit/` and `/embed-test/` joined them on 6 Sep 2026, and both
now return `302 → /` instead of `200`.