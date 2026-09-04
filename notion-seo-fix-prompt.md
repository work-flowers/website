# Notion AI prompt — work.flowers SEO fixes (Notion-side only)

> Paste everything below the line into Notion AI. It only touches SEO metadata
> properties. It does not rename page titles, change slugs, or publish/unpublish
> anything — those are listed at the end as manual decisions for Dennis.

---

You are making SEO metadata corrections to the work.flowers website content in Notion.
The site is published via Bullet.so, which reads its `<title>` tag from the **Meta Title**
property and its meta description from the **Meta Description** property.

Two databases are in scope:

- **Pages List** — `collection://1d791b07-11ac-8140-bb4e-000b76786676`
  (static pages; key properties: `Title`, `Path`, `Meta Title`, `Meta Description`, `Meta Keywords`, `Publish`)
- **Blog Content** — `collection://1d791b07-11ac-8146-9124-000b0d6dbcc8`
  (blog posts; key properties: `Post Title`, `Slug`, `Meta Title`, `Meta Description`, `Meta Keywords`, `Publish`)

House style for all Meta Titles and Meta Descriptions you write:

- **UK English** ("optimise", "personalise", "prioritise" — never "optimize"/"maximize").
- Brand is always **workFlowers** in camelCase. Never "work.flowers", "Work Flowers" or "Work.Flowers" in a Meta Title.
- Meta Title: **50–60 characters**, most important keyword first, ending `| workFlowers`.
- Meta Description: **140–158 characters**, written as a sentence a human would read in a search result, ending with a reason to click.
- workFlowers is a Singapore-based operations consultancy serving Asia Pacific, specialising in
  workflow automation (Zapier Platinum Solution Partner), analytics/BI, and AI enablement.
  It is also a Notion Service Specialist and a Vanta MSP. Clients are early-stage startups and lean teams.

## Task 1 — Fix the homepage title (highest priority)

In **Pages List**, find the record where `Path` is `/` (Title: "Home").

Its `Meta Title` is currently `Ops on Demand` — 13 characters, no service, no brand, no location.
Meanwhile its `Meta Keywords` already list the real targets: "automation service singapore",
"zapier experts", "zapier solution partners", "automate work singapore".

Replace `Meta Title` with a 50–60 character title that leads with the service and the market.
Use this unless you can do better within the constraints:

`Zapier & Notion Automation Consultants Singapore | workFlowers`

Leave its `Meta Description` as is — it is already fine.

## Task 2 — Remove draft annotations that are live in three titles

These three records have leftover drafting notes inside the Meta Title. Rewrite each to a clean
title following the house style.

**In Pages List:**

| Path | Current Meta Title (broken) |
|---|---|
| `/support` | `Meta Title: "Expert Customer Support \| Quick Help & Feedback \| workFlowers"` |

The words `Meta Title:` and the surrounding quotation marks must go. The intended title was
`Expert Customer Support | Quick Help & Feedback | workFlowers` — shorten it to fit 60 characters.

**In Blog Content:**

| Slug | Current Meta Title (broken) |
|---|---|
| `/ai-impact-on-jobs` | `AI's impact on jobs: Insights for Southeast Asia startups \| workFlowers (59 chars)` |
| `/zapier-custom-actions` | `Maximize Efficiency with Zapier Custom Actions for Startups (KW front, 56 chars, Informational)` |

Strip the trailing annotations `(59 chars)` and `(KW front, 56 chars, Informational)`.
For the second one, also change "Maximize" to the UK spelling "Maximise".

## Task 3 — Fix the broken footer link

In **Pages List**, find the record with `Path` = `/inviting-us-to-Zapier`.

Bullet.so routing is case-sensitive and serves this page at the lowercase URL, so the capital `Z`
means the footer link 404s on every page of the site. Change `Path` to:

`/inviting-us-to-zapier`

Do not change the `Title` or `Meta Title` on this record.

## Task 4 — Write the missing meta descriptions

In **Pages List**, these records have an empty `Meta Description`. When it is blank, Bullet
auto-generates one by scraping the first ~157 characters of body text and cutting mid-word — the
contact page currently advertises itself in Google as a list of form field labels.

Write a proper Meta Description (140–158 characters, house style) for each:

- `/` — already has one, skip
- `/contact`
- `/blog`
- `/privacy`
- `/submitted`
- `/zap-map`
- `/inviting-us-to-zapier`

Also check `/contact`, `/submitted` and `/zap-map` for an empty `Meta Title` and write one where missing.

## Task 5 — Bring blog Meta Titles into house style

In **Blog Content**, review the `Meta Title` of every record where `Publish` is checked.

Fix any that:

1. **Exceed 60 characters** — Google truncates these. The worst offenders are the posts with slugs
   `/productivity-app-bundles` (99 chars), `/zapier-custom-actions` (95),
   `/lessons-from-building-ai-agents` (100), `/the-future-of-work-isnt-fully-agentic` (86),
   `/notion-crm-contact-enrichment` (83), `/zapier-tables` (81).
2. **Use US spelling** — "Maximize", "Optimize", "Revolutionize", "Personalize" → UK equivalents.
3. **Spell the brand wrong** — `/stop-troubleshooting-zaps-manually` currently ends `| work.flowers`;
   it should be `| workFlowers`.

Do not change the `Post Title` or `Slug` on any record — those control the visible headline and the
URL, and changing them would break existing links. Only edit `Meta Title`.

## Rules

- Work only on the properties named above. Do not edit page body content.
- Do not change any `Publish` checkbox.
- Do not change any `Title`, `Post Title`, `Slug`, or `Public URL`.
- When you are done, list every record you changed with its old and new value, so the edits can be reviewed.

---

## NOT in this prompt — manual decisions for Dennis

These came out of the audit but should not be handed to an AI:

1. **The H1 problem (C-02).** Bullet renders the Notion `Title` property as the page H1, so the
   homepage H1 is literally "Home". Fixing it means either renaming Notion Titles — which also
   changes navigation labels — or suppressing the auto-H1 in `charm_style_sheet.css`. The CSS route
   is safer. Decide which, then do it by hand.
2. **`/pricing` (C-03).** Fully written with meta copy, `Publish` unchecked, currently 404s. It drew
   32 sessions before it was pulled. Publish it or delete it — don't leave it drafted.
3. **The WebeeUI starter kit (C-04).** 113 published demo pages. These are nested child pages under
   "Our Website", not Pages List rows, so unpublishing means either moving them out of the Bullet
   root page in Notion or removing them in the Bullet dashboard. Same for `/components/` and
   `/embed-test/`. Verify in Bullet afterwards that they actually drop out of the sitemap.
4. **`/videos` oddity.** Its Pages List row has `Publish` unchecked and `Path` = `/videos`, but its
   `Public URL` is `/embed-test` — and `/embed-test/` is live and indexable. Worth checking whether
   unpublishing in Notion actually removed it.
5. **Meta Keywords (L-01).** No search engine has used these since 2009. Harmless to leave, and they
   are a useful internal record of intent — so don't spend time clearing them. Just stop adding them.
