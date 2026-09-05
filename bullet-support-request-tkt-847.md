# Bullet support request — purge two stranded pages (TKT-847 / audit C-04)

Drafted 5 Sep 2026. **Not yet sent.**

Everything C-04 can reach from this repo is done: 112 of the 113 WebeeUI URLs
return 404, `sitemap.xml` holds at 130 `<loc>` entries with zero WebeeUI, and
PR #14's `noindex` block is live on the three pages the footer script reaches.
The two paths below are stranded renders — see *What Bullet will publish* in
`README.md` for why no deploy on any surface can touch them. Only Bullet can.

---

**Subject:** Two deleted pages still served from a stale build — please purge so they 404/410

Hi Bullet team,

Two URLs on our site (work.flowers, Notion-sourced) are still being served even
though the pages no longer exist in our Notion source:

- https://www.work.flowers/webeeui-bullet-website-builder-kit/
- https://www.work.flowers/embed-test/

Both return a real **200** with full content. We'd like them to return **410**
(or 404) — they are gone for good, not moved.

**What we've already tried**

Deleting the pages in Notion and republishing. That worked for the rest of the
tree — 112 of the 113 pages under the WebeeUI kit now correctly return 404, and
both URLs are absent from our `sitemap.xml`. These two roots are what's left.

**Why we think a republish can't fix them**

They appear to be stale renders from an earlier deploy that are never rebuilt,
because they're no longer in the Notion tree for a publish to walk. The asset
pin in their `<head>` shows it — we serve a versioned stylesheet from jsDelivr,
and these two are pinned several deploys behind everything else:

| Path | `charm_style_sheet.css` pin |
| --- | --- |
| `/webeeui-bullet-website-builder-kit/` | `@2f915188` |
| `/embed-test/` | `@2f915188` |
| every live page (`/`, `/components/`, …) | `@40c90de0` |

They also render with only 2 `data-bullet-head-type="global"` nodes versus 5 on
live pages, i.e. our custom footer code never runs on them. That's why we can't
reach them with a client-side `noindex` either — we've shipped one scoped to
these paths and confirmed it does not apply here.

**The ask**

Please purge the stranded published output for those two paths so the URLs
return 410 (or 404). If there's a way for us to do this ourselves from the
dashboard, we're happy to — we just couldn't find one.

Happy to give you any further detail. Thanks!

---

## Verification recipe

Re-run before sending, and again to confirm the fix landed.

```bash
for u in /webeeui-bullet-website-builder-kit/ /embed-test/ /this-page-does-not-exist-xyz/; do
  printf "%-42s " "$u"
  curl -sL -o /dev/null -w "%{http_code}\n" "https://www.work.flowers$u"
done
```

Wanted for the first two: `404` or `410`. As of 5 Sep 2026 both are `200`, while
the third — a control for a genuinely missing URL — is a real `404`, which is how
we know Bullet serves the two deliberately rather than as a soft 404.

Pin check, the tell for a stranded render:

```bash
curl -sL https://www.work.flowers/embed-test/ \
  | grep -oE 'https://cdn\.jsdelivr\.net[^"]*charm_style_sheet\.css'
```
