# work.flowers website

Custom styles, scripts, and assets for the [work.flowers](https://work.flowers) website.

## Stack

Content is managed in **Notion** and published via **Bullet.so**. This repo holds the CSS and HTML snippets that are injected through Bullet's custom code settings.

## Files

| File | Purpose |
|------|---------|
| `charm_style_sheet.css` | Main site stylesheet — CSS custom properties, Notion/Bullet class overrides, blog typography, responsive breakpoints |
| `head.html` | Pasted into Bullet's custom head code: font preconnects + the single Google Fonts `<link>` (Inter, JetBrains Mono) |
| `footer.html` | Injected into every page footer: GA4, LinkedIn Insight tag, callout-height equaliser script |
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