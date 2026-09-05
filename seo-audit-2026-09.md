# work.flowers SEO audit — September 2026

Hosted version: https://claude.ai/code/artifact/4dfadfa3-06b1-4d91-8fdb-193b2531da5a

Scope: live crawl of 141 indexable URLs (3 Sep 2026), sitemap.xml (254 entries), the Notion
"Our Website" source (page 1d791b07 + Pages List / Posts / Customer Reviews databases),
GA4 property 532585399 (12 Apr – 3 Sep 2026), and the repo's CSS/HTML snippets.

**Status as at 5 Sep 2026 (end of round 4): 33 findings — 17 closed · 1 withdrawn · 15 open**
(2 critical · 1 high · 8 medium · 4 low open, plus 7 verified clean)

**Now tracked as a Notion project:** "work.flowers SEO remediation"
(`3d191b07-11ac-819d-8689-f0b285d3d742`, Projects data source
`407ac9c1-7045-4529-acde-6d71f3b288d5`) with one task per finding in the Tasks data source
`27a91b07-11ac-81ed-973f-000ba6da1441` — 34 tasks: 16 Done, 1 Canceled, 17 Not started (the 16
open findings plus the archives decision). Task names carry the finding ID so the ledger and Notion
stay in step. Notion has three priority levels against the audit's four, so **Critical and High
both map to High** — the ID prefix keeps the distinction.

Four items previously filed as loose "scraps" were given proper IDs when the project was set up:
**M-11** empty tag Slugs · **M-12** publish-or-delete /pricing · **L-07** Ruey Teo's blank
Headline · **L-08** /security/ description at 169 chars.

Everything deployed was read back off the rendered DOM, not inferred from the repo:

| Page | Verified |
|---|---|
| `/` | ProfessionalService + WebSite JSON-LD |
| `/blog/next-gen-zaps/` | BreadcrumbList + Bullet's own Article |
| `/blog/tags/zapier/` | title "Zapier — Articles & Guides \| workFlowers"; H1 "Zapier", hash gone |
| `/about-us/` | AboutPage + AggregateRating 5/5 from 11 + 11 Review nodes; one visible H1 (hero copy); phantom H1 now a `<div>`; date renders with `datetime="2026-02-02"` |
| `/customer-reviews/deep-insights/` | `robots: noindex, follow`; no review schema leaking onto it |

**Deploy mechanics, worth remembering:** `charm_style_sheet.css` and `filed_index.js` are pinned
to jsDelivr by commit SHA (`cdn.jsdelivr.net/gh/work-flowers/website@<sha>/…`), so a repo change is
invisible until both pins move. `footer.html` is pasted inline into Bullet's custom footer and does
*not* move with them. The two pins were on different commits (CSS `2f91518`, JS `f437808`) — pin
both to the same SHA each deploy so a script change cannot outrun its stylesheet. Round 3 shipped
at `a51ca4c`. Round 4 adds a fourth surface: Bullet's custom **head** code, now mirrored in the
repo as `head.html` and pasted the same way the footer is.

**One decision outstanding:** `NOINDEX_ARCHIVES` for the 36 tag and author archives. Confirmed
still off — those pages carry no robots directive.

**Deployed and verified live** (read back off the rendered DOM via the local Chrome MCP): M-03,
C-05 (homepage carries the ProfessionalService + WebSite graph; blog posts carry BreadcrumbList
alongside Bullet's Article), H-05 (`/blog/tags/zapier/` serves "Zapier — Articles & Guides |
workFlowers").

**Awaiting one more paste of `footer.html`:** H-04 (review markup, retargeted to `/about-us/`),
C-02 + L-02 (the H1 retag), L-05 (tag-heading hash strip).

Note for future verification: the Cowork built-in browser's `javascript_tool` returns undefined
and logs nothing, and `read_page` omits `<script>` contents — so JSON-LD cannot be read back
through it. The local `Control_Chrome` MCP's `execute_javascript` works and is what verified all
of the above.

Closed and verified live: C-01 homepage title · H-01 broken footer link (Resources nav item
removed in Bullet, Notion Path lowercased) · H-02 draft annotations in three titles · H-03 all
missing and over-length meta descriptions · M-08 title lengths, UK spelling, brand casing ·
M-09 (new) the Raycast UTM script's invalid mediums · L-01 Meta Keywords, closed by decision.
M-03 is fixed in footer.html but still needs pasting into Bullet's custom footer code.

Remaining Notion-side scraps: /security/ meta description at 169 chars, and a 70-char Meta
Title on the unpublished /pricing.

New finding M-09 — the Unassigned bucket was self-inflicted. GA4 matches utm_medium against a
fixed list; the Raycast tagging script offered community / event / dm / webinar and defaulted to
community, so every tagged link fell through. Direct's share did fall (65.2% → 55.7% Apr–Aug) but
Direct per day rose (11.9 → 13.2) — the share moved because other channels grew, not because
tagging worked. Script now emits social/email/referral with the distinctions in utm_content.
Forward-only; the 142 historical Unassigned sessions need a GA4 custom channel group.

## Round 4 — 5 Sep 2026

**M-01 closed — one font host, one request, correct weights.** Inter was being fetched three
times from two hosts, one of which failed. All three requests are gone, replaced by a single
Google Fonts `<link>` with `preconnect` hints, mirrored in the repo as `head.html`:

- The `@import` at `charm_style_sheet.css:12` is removed. It was the expensive one — an `@import`
  inside a stylesheet cannot begin until that stylesheet has downloaded, so the font request was
  serialised behind the CSS rather than running alongside it. A `<link>` in the head starts both
  at once.
- The `@import` at `jtbd_widget.html:27` is removed. Notion's angle brackets had leaked into the
  URL string, so it 404'd on every homepage load. The widget now inherits the sitewide Inter, and
  its `font-family` carries the same system fallback stack as `--wf-sans` instead of bare
  `sans-serif`.
- The `fonts.bunny.net` `<link>` (Inter 100–900) must be **deleted** from Bullet's head code when
  `head.html` is pasted in. Consolidating on Google Fonts drops a DNS lookup and a connection,
  since JetBrains Mono was already coming from there.

**Weights are now the ones the stylesheet actually sets.** Inter 400/500/600/700/800 — 900 was
loaded but never used. The interesting half is the other direction: **JetBrains Mono 700 is set
in roughly a dozen rules and was never loaded**, because the old import asked for 400/500/600
only. Every bold monospace label on the site has been a browser-synthesised fake bold. It is now
requested properly, so mono headings will render slightly differently — that is the fix, not a
regression.

**Deploying this one takes both a paste and a pin bump.** Paste `head.html` into Bullet's head
code (removing the bunny.net link), then move the `charm_style_sheet.css` and `filed_index.js`
jsDelivr pins to this commit, together as always. Done when the network panel on a homepage load
shows one font host, no 404, and no request for Inter 900.

## Round 3, third pass — 4 Sep 2026

**C-06 decided — noindex switched on.** Dennis confirmed the review URLs were never meant to be
click-through destinations: the reviews are a widget on `/about-us/`, and `filed_index.js` calls
`galleryWrap.replaceWith(root)`, discarding the Notion markup that would otherwise link to them.
Nothing on the site points at those URLs. `NOINDEX_EMPTY_REVIEW_PAGES` is now `true` in
`footer.html`. The URLs keep resolving; they just leave the index.

**L-05 answered — it is not Zapier-specific.** `/blog/tags/notion/` renders
`<h1 class="tag-name"># Notion</h1>` too. Every archive gets the hash, because it is Bullet's
template decoration, not data: all 33 tag Names in the live Tags data source are clean. What has
no hash is the tag *chips* — the pill links in the filter row and under each post — which render
as plain `<a>Notion</a>`. Comparing a chip against an archive H1 is what makes it look selective.

**L-06 (new, low) — the widget never read the review dates.** Adding Review Date to the gallery
view was necessary but not sufficient. `filed_index.js` reads only `.prop-reviewer-name`,
`.prop-review-body` and `.prop-rating`, then rebuilds the layout and throws the Notion markup
away — a property it never queries cannot appear, whatever the CSS says. So this was never a CSS
problem. Fixed: the script now reads `.prop-review-date` and renders a `<time>` at the end of the
attribution row, with a matching rule in `charm_style_sheet.css` § 19.6.

Two things caught while testing, both worth remembering:

- **Bullet ignores the Notion view's date format.** The view is `YYYY/MM/DD`; the rendered cell
  reads `"May 17, 2026"`.
- **A timezone bug that would have shipped.** `Date.parse("May 17, 2026")` returns local midnight,
  and `toISOString()` then converts that to the 16th in UTC+8 — every date a day early. The
  parser now works in calendar parts and never calls `toISOString`. Verified against all 11
  server-rendered cards: every label and `datetime` matches the Notion source.

**Also worth knowing: every Slug field in the live Tags data source is empty**, so Bullet derives
archive URLs from the tag Name. Renaming a tag will silently change its archive URL —
`/blog/tags/zapier/` has inbound links and traffic.

**Verification technique that worked:** `fetch('/about-us/')` + `DOMParser` from inside the page,
via the local Chrome MCP. That reads Bullet's server-rendered gallery markup *before*
`filed_index.js` replaces it — the only way to inspect the original property cells.

## Round 3, second correction — 4 Sep 2026

**C-02's diagnosis was wrong, and the CSS route was already taken.** The audit said the homepage's
most prominent heading is the word "Home". It is not: `charm_style_sheet.css:130` carries
`.notion-title { display: none; }` sitewide, so that H1 is hidden at zero height. Hiding it is
precisely what leaves these pages with no usable H1 — the real headline renders as an `<h2>`
wearing Notion's `.notion-h1` classes. CSS cannot finish the job: it can hide an element but not
retag one or change its text.

What ships instead is a footer script that promotes the first visible hero heading to `<h1>` and
demotes the hidden nav-label H1 to a `<div>`. Verified against the live DOM on four page shapes:

- homepage → single visible H1 "Ops on demand for lean teams.", 112.32px / 437px tall / top 285px
  identical before and after
- `/contact/` → phantom demoted, form card H1 ("Contact workFlowers") untouched at 42.5px. Closes
  L-02, whose "two H1s" are a hidden `h1.notion-title` plus the visible `.notion-form-title`.
- blog posts → post title H1 is real, so only the phantom is removed. (Blog posts also carry a
  second H1 from an embedded widget — left alone; see M-07.)
- `/blog/tags/*` → no phantom; only the L-05 hash strip applies

Checked first that the stylesheet has no tag-qualified `.notion-h` selectors (so retagging is
visually inert) and that the hero sits outside `.hero_section`, whose `h1` rules are scoped to the
blog landing pages. Caveat: browser-side, so Google only sees it after rendering. Renaming the
Notion Titles stays the more robust server-side fix, at the cost of changing nav labels.

**L-05 needs JS, not CSS.** The heading is `<h1 class="tag-name"># Zapier</h1>` with the hash
inside the heading's own single text node — no span, no `::before`. Nothing for CSS to target, and
clipping would still leave a screen reader announcing "hash Zapier".

**The 10 empty review URLs** (C-06), verified against sitemap.xml — 10, not 11:

    /customer-reviews/strategic-and-speedy-execution/
    /customer-reviews/professional-and-knowledgable-about-several-fields/
    /customer-reviews/great-experience-in-automating-hr-ops-workflows/
    /customer-reviews/excellent-service-and-solution-for-my-issue/
    /customer-reviews/automation-a-scalability-enabler/
    /customer-reviews/excellent-service/
    /customer-reviews/streamlined-operations-with-smart-scalable-automations-from-dennis/
    /customer-reviews/effective-and-quick-solution/
    /customer-reviews/deep-insights/
    /customer-reviews/highly-recommend/

Ruey Teo's review has no page: its Notion Headline (the title property) is blank, so Bullet had no
slug to build from. `reviews-schema/customer-reviews.json` now records this and its slugs match
the live URLs.

**Review Date added to the About Us gallery view** by Dennis, so the `datePublished` in the H-04
markup now matches what a visitor sees.

## Round 3 corrections — 4 Sep 2026

**C-06 revised down from critical to medium; H-07 withdrawn.** Both rested on the same mistake.
This audit looked for a `/customer-reviews/` hub, found a 404, and concluded the reviews were
invisible. They are not. `/about-us/` (Notion page `2a891b07-11ac-8011-9836-f97b1008f5dd`) carries
an inline gallery view of the Customer Reviews data source — Notion database
`35391b07-11ac-80cd-874f-ca417a282a72`, "View of Customer Reviews", displaying Headline, Review
Body, Reviewer Name and Rating — which renders all eleven reviews as a carousel plus a full table
under the heading "OUR CLIENTS". Verified by rendered-DOM read.

What survives of C-06 is narrower: eleven `/customer-reviews/<slug>/` URLs that render nothing,
duplicating content that already has a home. Index hygiene, not a credibility gap. No hub page is
needed — building one would create a third location for the same content. A
`NOINDEX_EMPTY_REVIEW_PAGES` switch is in `footer.html`, currently off, because one of those URLs
takes real traffic.

**H-04 unblocked and retargeted.** `reviews-schema/build_review_schema.py` now scopes the markup
to `/about-us/` only, with each Review anchored at `/about-us/#review-<slug>` and no references to
the dead `/customer-reviews/` paths. Loose end: the markup emits `datePublished`, but Review Date
is not among the gallery view's displayed properties — adding it to that view makes the markup
match what a visitor sees.

**L-05 (new, low).** Tag archive headings render a literal markdown hash: `/blog/tags/zapier/`
shows an H1 of "# Zapier". The Notion tag Name is "Zapier"; the "#" is Bullet's own template
decoration escaping as text. Spotted while verifying H-05.

## Round 3 — 4 Sep 2026

**Done and live**

- **GA4 custom channel group created** (`properties/532585399/channelGroups/15717427913`,
  "workFlowers channel group"). Community and Events rules run first, then the 19 standard
  channels fall through via `eachScopeDefaultChannelGroup`. Confirmed by report: 114 of the
  142 Unassigned sessions (94 `community` + 20 `event`) now classify. Channel groups reapply
  to historical data, so this is retroactive. It is **not** the property's primary channel
  group — pick it from the "Channel group" selector in reports, or promote it in Admin.
  The remaining 28 Unassigned sessions are unrelated to the Raycast script.
  *Note for future API work: GA4 channel-group filters use `eachScopeMedium`, not
  `sessionMedium`. The latter returns `unsupported-channel-grouping-field`.*

**Built in `footer.html`, still needs pasting into Bullet's custom footer**

- **C-05 closed (pending deploy).** ProfessionalService + WebSite JSON-LD with legal name, UEN,
  registered address, founder, areaServed, sameAs and a three-service OfferCatalog, anchored at
  `@id` `https://www.work.flowers/#organization`. Plus a runtime BreadcrumbList derived from the
  URL path; intermediate crumbs are emitted without a URL when the section has no page behind it
  (`/customer-reviews/`, `/blog/tags/`), so no crumb links to a 404.
- **H-05 addressed (pending deploy) — and the original fix was wrong.** There is no Bullet
  template to change: the Tags database exposes only Name, Slug, Posts and Color, the Authors
  database has no meta fields, and Blog Settings has no title format or template variables.
  Archive metadata is not configurable in Bullet at all. Titles, meta descriptions and the
  OG/Twitter equivalents are now generated at runtime from the slug for all 36 archives
  (33 tags + 3 authors — the earlier count of 38 was high). A `NOINDEX_ARCHIVES` switch sits
  in the same block, currently `false`, awaiting a decision.
- **H-04 markup built, but blocked on a prerequisite.** `reviews-schema/` holds
  `customer-reviews.json` (cleaned mirror of the Notion data — the source rows carry markdown
  asterisks and pack the company into the Reviewer Name field), `build_review_schema.py`, and
  the generated `customer-reviews-schema.html`. Path-scoped: ItemList + AggregateRating on the
  hub, a single Review per review page, nothing elsewhere. 11 reviews, not 10; all 5 stars.

**New findings**

- **C-06 (new, critical) The customer review pages render empty.** All 11 are published,
  indexable and titled, and `/customer-reviews/professional-and-knowledgable-about-several-fields`
  takes real traffic — but the body renders nothing except the footer. The review text lives in
  Notion *properties* (Review Body, Reviewer Name, Rating), and Bullet renders page *bodies*,
  which are empty. So the site has 11 thin indexable pages and no visible testimonials anywhere,
  homepage included. This also blocks H-04: Google requires marked-up review content to be
  visible on the page. *Fix: build a `/customer-reviews/` hub page in the Pages List holding a
  gallery view of the Customer Reviews database (the Gallery view already displays Headline,
  Review Body and Reviewer Name), then de-index the 11 row pages.*
- **H-07 (new, high) `/customer-reviews/` itself 404s.** There is no hub — the eleven review
  pages have no index, no internal links pointing at them, and nothing on the homepage.
- **M-10 (new) A duplicate, unused blog tree exists in Notion.** Both `Pages List / Blog` and
  `Pages List / Flow Statements` carry a full Blog + Tags + Authors set. The live one is
  **Flow Statements** (its Tags relation targets Blog Content `1d791b07-11ac-8146-9124-000b0d6dbcc8`).
  Edits made to the `Blog` tree have no effect on the site.
- **L-04 (new) Two of the three author archives belong to people who have left** — Ernest Choo
  and Grace Tang. Also: the footer copyright still reads "© 2024".

**Expected-payoff correction on H-04.** Google does not show review stars for reviews a business
collects about itself on Organization or LocalBusiness — the self-serving review policy. This
markup will not produce stars in Google search. It is still worth shipping for Bing, for AI
answer engines that read JSON-LD, and so the entity carries a rating once third-party reviews
exist. The real win in this area is C-06: making the testimonials visible at all.

---

*Original findings below, as first written.*

**5 critical · 6 high · 8 medium · 3 low · 7 verified clean**

Root cause for most of it: the Notion properties Bullet.so reads from are empty, wrong,
or still hold draft notes.

## GA4 baseline (5 months — no data before 12 Apr 2026)

| Channel | Sessions | Engaged |
|---|---:|---:|
| Direct | 1,749 | 484 |
| Organic Search | 386 | 192 |
| Organic Social | 361 | 136 |
| Referral | 181 | 68 |
| Unassigned | 142 | 63 |
| Email | 95 | 42 |
| AI Assistant | 19 | 8 |

Organic engagement rate 49.7% vs Direct 27.7%. Organic by month: Apr 28 (partial),
May 65, Jun 78, Jul 79, Aug 123. Singapore is the largest organic market (120 sessions),
then US (100), Australia (33), India (27).

## Critical

- **C-01 Homepage title is "Ops on Demand"** (13 chars, no brand/service/location). The real
  target terms ("automation service singapore", "zapier experts", "zapier solution partners")
  are sitting in Meta Keywords, which no engine has used since 2009.
  *Fix: Notion → Pages List → Meta Title.*
- **C-02 Every H1 is a nav label.** Bullet renders the Notion `Title` property as H1, demoting
  the hero to H2. Homepage H1 = "Home". About H1 = "About Us".
  *Fix: rename Notion Titles, or suppress the auto-H1 in charm_style_sheet.css.*
- **C-03 No service pages exist.** /automation/, /analytics/, /ai-enablement/, /services/,
  /pricing/ all 404. The three pillars are homepage sections only. A finished /pricing page
  exists in Notion with full meta, Publish unchecked; it took 32 sessions before being pulled.
- **C-04 113 of 254 sitemap URLs are the WebeeUI Bullet starter kit** — published, indexable,
  submitted to Google. 44.5% of the sitemap is template demo content.
- **C-05 Zero Organization / ProfessionalService / Review / BreadcrumbList schema.** Only the
  55 blog posts have markup (Article, auto-generated by Bullet).
  *Fix: one JSON-LD block in footer.html.*

## High

- **H-01 Sitewide broken footer link.** Notion Path is `/inviting-us-to-Zapier` (capital Z);
  Bullet routing is case-sensitive, live page is lowercase. 404 on all 141 pages.
- **H-02 Draft notes live in three titles:**
  - /support/ → `Meta Title: "Expert Customer Support | Quick Help & Feedback | workFlowers"`
  - /blog/ai-impact-on-jobs/ → `... | workFlowers (59 chars)`
  - /blog/zapier-custom-actions/ → `... (KW front, 56 chars, Informational)`
- **H-03 39 pages have no meta description**, so Bullet scrapes the first ~157 chars of body
  text and cuts mid-word. /contact/ currently advertises itself in Google as a list of form fields.
- **H-04 Ten 5-star customer reviews published with no Review/AggregateRating markup**, despite
  reviewer, rating, date and body all existing as structured Notion data.
- **H-05 38 pages share the title "workFlowers"** — every tag and author archive, all with
  empty descriptions. One Bullet template change fixes all of them.
- **H-06 The blog is a social channel, not an organic one.** 55 posts → ~150 organic sessions
  in 5 months; about half drew none. Top organic post is /blog/productivity-app-bundles/
  (Setapp / Lenny's Product Pass) — attracts software-deal hunters, not automation buyers.

## Medium

- **M-01 Fonts load from three sources.** *Closed round 4 — awaiting the head-code paste.*
  fonts.bunny.net (Inter ×9 weights) + a render-blocking `@import` at charm_style_sheet.css:12
  + a malformed third request at jtbd_widget.html:27 where Notion's angle brackets leaked into
  the URL (`@import url('<https://...>')`) → 404s. Now one Google Fonts `<link>` in `head.html`.
- **M-02 All 12 homepage images are PNG with no width/height.** No WebP/AVIF. Alt text is fine.
- **M-03 GA4 counts your own Bullet editor sessions.** `/site/Isbw6XlCS35Ea2JF9Kaj/pages?mode=code`
  and similar appear as landing pages. No internal traffic filter. Direct (60%) is inflated.
- **M-04 Broken inbound links from your own distribution:** `/meet-dennis)` and
  `/notion-builders](https://...` (markdown syntax leaked into a send), plus /blog/slackgpt/
  taking 14 direct sessions to a 404.
- **M-05 No RSS feed and no llms.txt.** /rss.xml, /feed/, /blog/rss.xml, /llms.txt all 404 —
  while "AI Assistant" is already a live GA4 channel (19 sessions).
- **M-06 robots.txt has no Disallow rules** and nothing is noindexed. /embed-test/,
  /components/, /contact-form/ and /submitted/ are all indexable.
- **M-07 Blog heading hierarchy skips.** Posts go H1 → H3, then "Related Posts" H2 below them.
- **M-08 24 titles exceed ~60 chars** (longest 99); 66 are under 30; 80 of 141 have no brand.
  Brand spelled workFlowers (61), work.flowers (1), "Work.Flowers" in body copy.
  US spellings ("Maximize", "Optimize") against a UK-English site.

## Low

- **L-01** Meta Keywords filled sitewide, read by nobody.
- **L-02** /contact/ has two H1s (resolves with C-02).
- **L-03** No hreflang / en-SG signal. Only matters once service pages exist.

## Verified clean

Canonicals correct on all 141 pages · alt text on every image (0 missing) · og:image on all
141 · /terms-of-service/ correctly canonicalises to /legal/msa/ · paginated tag archives
canonicalise to page 1 · 404s return real 404 status · TTFB 35ms, measured CLS 0.

## Search landscape

| Cluster | Page one today | Verdict |
|---|---|---|
| "Zapier consultant/expert" | Zapier's own directory + US/UK agencies | Unwinnable; your directory listing already ranks |
| "Zapier consultant Singapore" | Nobody targeting seriously | **Open** |
| "Notion consultant" | Notion's own consultant directory | Unwinnable directly |
| "Notion consultant Singapore" | One solo competitor, not an official partner | **Open** |
| "AI automation agency Singapore" | Uncredentialed content mills | Contested |
| "BI / data consultant Singapore" | Big-4 + Clutch | Hard on head terms |
| PSG / EDG grant angle | Grant-guide lead funnels | Proven pattern, unexploited |

No keyword volume data was available (no Search Console / Ahrefs / Semrush access) — these
are directional reads of who actually appears in results. Verify Search Console is connected,
and confirm PSG/EDG vendor eligibility with Enterprise Singapore before building content on it.

## Order of work

1. **Week 1 (~2h, Notion only):** C-01, H-02, H-01, C-04, publish-or-delete /pricing.
2. **Week 2 (~3h):** H-03 (ten key pages), H-05 (one template change), M-03.
3. **Week 3 (~4h):** C-05 + H-04 schema in footer.html, M-01 fonts, M-05 llms.txt + RSS.
4. **Weeks 4–8:** C-03 — three service pages plus a real case-study type. This is the work
   that changes the trajectory; everything above just clears the way.
5. **Ongoing:** stop measuring Flow Statements on organic sessions. Put commercial-intent
   content on service pages instead.
