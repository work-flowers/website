# Notion AI prompt — work.flowers SEO fixes, round 2

> Round 1 fixed page titles. This round is almost entirely **meta descriptions**,
> plus three leftovers in Pages List. Paste everything below the line into Notion AI.

---

You are making a second pass of SEO metadata corrections to the work.flowers website
content in Notion. A first pass already fixed page titles — do not redo that work.

Two databases are in scope:

- **Pages List** — `collection://1d791b07-11ac-8140-bb4e-000b76786676`
  (properties: `Title`, `Path`, `Meta Title`, `Meta Description`)
- **Blog Content** — `collection://1d791b07-11ac-8146-9124-000b0d6dbcc8`
  (properties: `Post Title`, `Slug`, `Meta Title`, `Meta Description`, `Publish`)

House style, unchanged from round 1:

- **UK English** — "optimise", "personalise", "summarise", "enquiry". Never "optimize"/"maximize".
- Brand is always **workFlowers** in camelCase.
- Meta Title: **50–60 characters**.
- Meta Description: **140–158 characters**. This is a hard ceiling — Google truncates past
  roughly 160 and the sentence dies mid-word.
- workFlowers is a Singapore-based operations consultancy serving Asia Pacific, specialising in
  workflow automation (Zapier Platinum Solution Partner), analytics/BI, and AI enablement. Also a
  Notion Service Specialist and a Vanta MSP. Clients are early-stage startups and lean teams.

A good meta description is one sentence a human would actually read in a search result: it says
what the page gives them and why it's worth the click. It is not a summary of the article and not
a keyword list. Write for the reader, not the crawler.

## Task 1 — Three leftovers in Pages List

1. **`/security`** — `Meta Title` is empty, so Bullet falls back to the page title with no brand.
   Write one. The page covers workFlowers' security practices: password management, MFA, device
   management, access control and client data handling.
2. **`/zap-map`** — `Meta Title` is currently `An interactive diagram of our Zapier workflows`,
   which reads like a description and carries no brand. Rewrite it as a title, 50–60 characters,
   ending `| workFlowers`.
3. **`/pricing`** — `Meta Title` ends `| work.flowers`. Change that suffix to `| workFlowers`.
   Leave its `Publish` checkbox alone; the page is intentionally unpublished.

## Task 2 — Write the three missing blog meta descriptions

These published posts have an empty `Meta Description`, so Bullet scrapes the first ~157
characters of body text and cuts mid-word. Read each post and write a proper description
(140–158 characters, house style):

| Slug | Post |
|---|---|
| `notion-mail-vs-shortwave` | Notion Mail vs Shortwave: Which AI Email Client Wins |
| `website-redesign` | Why We Switched from WordPress to Bullet and Notion |
| `/granola` | Granola.ai: The Ultimate AI Meeting Transcription Tool |

## Task 3 — Shorten the twenty over-length blog meta descriptions

Each of these published posts has a `Meta Description` longer than 160 characters and will
truncate in search results. Rewrite each to **140–158 characters**, keeping the specific hook the
existing description already has — most of these are good sentences that simply run long, so cut
rather than rewrite from scratch. Current lengths in brackets:

| Slug | Length |
|---|---:|
| `/notion-crm-contact-enrichment` | 257 |
| `/automated-crm` | 226 |
| `/ai-coding-agents-evolve-no-code` | 224 |
| `/notion-ai-meeting-notes` | 212 |
| `/the-future-of-work-isnt-fully-agentic` | 209 |
| `/lessons-from-building-ai-agents` | 194 |
| `/notion-custom-agents-vs-zapier-agents` | 193 |
| `/no-slop-content-workflows` | 189 |
| `/notion-ai-skills` | 187 |
| `/three-tips` | 173 |
| `/custom-notion-crm` | 173 |
| `/zapier-custom-actions` | 171 |
| `/automating-contract-management` | 169 |
| `/ai-finance-agent` | 168 |
| `/skills-over-prompts` | 167 |
| `/how-claude-cowork-does-my-job` | 166 |
| `/ai-impact-on-jobs` | 165 |
| `/ntuc-social-listening` | 165 |
| `/notion-sessions-singapore` | 163 |
| `tableau-pulse` | 162 |

After each rewrite, count the characters and confirm the result is between 140 and 158. If a
rewrite lands outside that range, fix it before moving on.

## Task 4 (optional, lowest priority) — Brand suffix on short blog titles

33 of the 55 published blog posts have a `Meta Title` with no brand mention. Adding `| workFlowers`
aids recognition in a results page, but it costs 13 characters and the keyword matters more than
the brand.

So apply this **only** where it fits cleanly: if a post's current `Meta Title` is **47 characters
or fewer**, append ` | workFlowers`. If the result would exceed 60 characters, leave the title
exactly as it is — do not shorten a working title to make room for the brand.

## Rules

- Work only on `Meta Title` and `Meta Description`. Nothing else.
- **Do not touch `Slug` or `Path` on any record.** Five blog slugs are missing a leading `/` and
  one has a stray trailing `/` — Bullet normalises these and every URL currently resolves.
  Changing them would break live links for no gain. Leave them.
- Do not change any `Publish` checkbox.
- Do not change `Post Title` or `Title` — those control the visible headline.
- Do not edit page body content.
- When you are done, list every record you changed with the old and new value and the new
  character count, so the edits can be reviewed.
