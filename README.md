# work.flowers website

Custom styles, scripts, and assets for the [work.flowers](https://work.flowers) website.

## Stack

Content is managed in **Notion** and published via **Bullet.so**. This repo holds the CSS and HTML snippets that are injected through Bullet's custom code settings.

## Files

| File | Purpose |
|------|---------|
| `charm_style_sheet.css` | Main site stylesheet — CSS custom properties, Notion/Bullet class overrides, blog typography, responsive breakpoints |
| `head.html` | Pasted into Bullet's custom head code: font preconnects + the single Google Fonts `<link>` (Inter, JetBrains Mono) |
| `footer.html` | Pasted into Bullet's custom footer code: GA4, callout-height equaliser, JSON-LD schema, archive/page metadata and the `noindex` rules |
| `jtbd_widget.html` | Auto-scrolling "pain points" chat-bubble widget embedded on the homepage |
| `notocat_custom.css` | Email newsletter styles (Notocat), based on the site's brand tokens |
| `Original Logo.png` | Logo asset |

## SEO audit and remediation

Findings, status and deploy notes live in the Notion project **SEO Remediation** (WF-27),
which is the source of truth:
https://www.notion.so/3d191b0711ac819d8689f0b285d3d742

That page also documents the five separate surfaces a change has to travel through to go
live — worth reading before deploying anything here, because three of them are manual
pastes and one is a Bullet theme setting rather than code.

(The former `seo-audit-2026-09.md` was removed on 5 Sep 2026; it was a second copy that
had to be kept in step by hand. History is in git.)

## Notion source

The website content lives under the **Our Website** page in Notion:
https://www.notion.so/work-flowers/Our-Website-1d791b0711ac80dca190cc3f88777447

Key databases: Pages List, Point Reference Guide, Customer Reviews, Team.

### What Bullet will publish

Not everything nested under Our Website. Bullet starts from the **Pages List** database and
publishes the rows with `Publish` ticked — 12 of its 14 rows today, which are the site's
top-level pages (`/`, `/about-us`, `/blog`, `/legal/msa`, …).

It then follows **linked database views embedded in those pages**, and publishes the rows of
the databases behind them, each at its own path. That second hop is where the bulk of the site
comes from, and it is not visible from Pages List alone:

| Source | Published rows | Paths |
|--------|---------------|-------|
| Pages List | 12 | `/`, `/about-us`, `/privacy`, `/legal/…` |
| Posts | 84 | `/blog/…` |
| Supercut Recordings | 24 | `/supercut-recordings/…` |
| Customer Reviews | 10 | `/customer-reviews/…` |

Those four sum to exactly the 130 URLs in `sitemap.xml`, with nothing unaccounted for — which
is the check to re-run if this table ever looks stale.

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
Google's index with no lever left, and only Bullet support can clear it. That is audit finding
C-04, and it is why `/webeeui-bullet-website-builder-kit/` and `/embed-test/` are still live.

Unpublishing is not a way to remove a page from Google. It is a way to lose control of it.