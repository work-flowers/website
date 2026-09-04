#!/usr/bin/env python3
"""Build the customer-review JSON-LD block for work.flowers (SEO audit H-04).

Reads customer-reviews.json (the cleaned mirror of the Notion Customer Reviews
data source) and writes customer-reviews-schema.html — a paste-ready block for
Bullet's custom footer.

The block is path-scoped at runtime:
  /customer-reviews/          -> ItemList of every review + AggregateRating
  /customer-reviews/<slug>/   -> that single Review
  anywhere else               -> nothing

Both reference the sitewide organisation node by @id, so the entity is declared
once (in footer.html) and only pointed at here.

Usage:  python3 build_review_schema.py
"""

import json
from pathlib import Path

HERE = Path(__file__).parent
ORG_ID = "https://www.work.flowers/#organization"
BASE = "https://www.work.flowers"


def author_node(review):
    if review["author_type"] == "Organization":
        return {"@type": "Organization", "name": review["author"]}
    node = {"@type": "Person", "name": review["author"]}
    if review.get("company"):
        node["worksFor"] = {"@type": "Organization", "name": review["company"]}
    return node


def review_node(review):
    return {
        "@type": "Review",
        "@id": f"{BASE}/customer-reviews/{review['slug']}/#review",
        "url": f"{BASE}/customer-reviews/{review['slug']}/",
        "name": review["headline"],
        "reviewBody": review["body"],
        "datePublished": review["date"],
        "author": author_node(review),
        "reviewRating": {
            "@type": "Rating",
            "ratingValue": review["rating"],
            "bestRating": 5,
            "worstRating": 1,
        },
        "itemReviewed": {"@id": ORG_ID},
    }


def main():
    data = json.loads((HERE / "customer-reviews.json").read_text())
    reviews = data["reviews"]

    ratings = [r["rating"] for r in reviews]
    aggregate = {
        "@type": "AggregateRating",
        "itemReviewed": {"@id": ORG_ID},
        "ratingValue": round(sum(ratings) / len(ratings), 1),
        "bestRating": 5,
        "worstRating": 1,
        "reviewCount": len(reviews),
        "ratingCount": len(reviews),
    }

    per_slug = {r["slug"]: review_node(r) for r in reviews}

    hub = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": f"{BASE}/customer-reviews/#page",
                "url": f"{BASE}/customer-reviews/",
                "name": "Customer reviews",
                "about": {"@id": ORG_ID},
                "mainEntity": {
                    "@type": "ItemList",
                    "numberOfItems": len(reviews),
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": i + 1,
                            "item": {"@id": per_slug[r["slug"]]["@id"]},
                        }
                        for i, r in enumerate(reviews)
                    ],
                },
            },
            aggregate,
            *[per_slug[r["slug"]] for r in reviews],
        ],
    }

    payload = {
        "hub": hub,
        "bySlug": {slug: {"@context": "https://schema.org", **node}
                   for slug, node in per_slug.items()},
    }

    out = f"""<!-- ============================================================
     Customer review markup (JSON-LD) — SEO audit H-04
     GENERATED FILE. Do not hand-edit: change customer-reviews.json
     and re-run build_review_schema.py.

     Scope: emits the review ItemList + AggregateRating on the
     /customer-reviews/ hub, a single Review on each review page,
     and nothing anywhere else. itemReviewed points at the sitewide
     organisation node declared in footer.html.

     PRECONDITION: the marked-up text must be visible on the page.
     Google's structured data policy requires it, and today the
     review pages render empty because the review text lives in
     Notion *properties*, not in the page body. Build the hub page
     (a gallery view of the Customer Reviews database) before or
     alongside deploying this, or the markup describes content that
     is not there.

     NOTE ON EXPECTED PAYOFF: Google does not show review stars for
     reviews a business collects about itself ("self-serving"
     reviews) on Organization or LocalBusiness. This markup will not
     produce stars in Google search. It is still worth shipping for
     Bing, for AI answer engines that read JSON-LD, and so the
     entity has a rating when third-party review sources exist.
     ============================================================ -->
<script>
(function () {{
  var DATA = {json.dumps(payload, indent=2, ensure_ascii=False)};

  var path = window.location.pathname.replace(/\\/+$/, '');
  var PREFIX = '/customer-reviews';
  if (path !== PREFIX && path.indexOf(PREFIX + '/') !== 0) return;

  var payload = null;
  if (path === PREFIX) {{
    payload = DATA.hub;
  }} else {{
    var slug = path.slice(PREFIX.length + 1).split('/')[0];
    payload = DATA.bySlug[slug] || null;
  }}
  if (!payload) return;

  var node = document.createElement('script');
  node.type = 'application/ld+json';
  node.textContent = JSON.stringify(payload);
  document.head.appendChild(node);
}})();
</script>
"""
    (HERE / "customer-reviews-schema.html").write_text(out)
    print(f"wrote customer-reviews-schema.html — {len(reviews)} reviews, "
          f"aggregate {aggregate['ratingValue']}/5 from {aggregate['reviewCount']}")


if __name__ == "__main__":
    main()
