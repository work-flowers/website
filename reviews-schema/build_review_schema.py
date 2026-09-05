#!/usr/bin/env python3
"""Build the customer-review JSON-LD block for work.flowers (SEO audit H-04).

Reads customer-reviews.json (the cleaned mirror of the Notion Customer Reviews
data source) and rewrites the generated region of ../bullet_bundle.js in place.

There is no paste step and no intermediate file: the bundle is pinned by SHA
from Bullet's head, so re-running this and merging is the whole deploy. Run
scripts/verify-live.py afterwards.

Scope: /about-us/ only. That page carries an inline gallery view of the Customer
Reviews database under "OUR CLIENTS", which renders all eleven reviews with
reviewer, body and star rating visible. Google requires marked-up review content
to be visible on the page it is marked up on, so /about-us/ is the correct and
only target. The /customer-reviews/<slug>/ row pages render empty and get no
markup.

Reviews are anchored at /about-us/#review-<slug> and reference the sitewide
organisation node by @id, so the entity is declared once (in head.html, as
server-rendered markup) and only pointed at here.

Usage:  python3 build_review_schema.py
"""

import json
from pathlib import Path

HERE = Path(__file__).parent
# Rewritten in place between these markers; they live in bullet_bundle.js and
# must match it byte for byte.
BEGIN = ("/* BEGIN GENERATED reviews — build_review_schema.py writes everything "
         "to the END marker */")
END = "/* END GENERATED reviews */"
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
        "@id": f"{BASE}/about-us/#review-{review['slug']}",
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
                "@type": "AboutPage",
                "@id": f"{BASE}/about-us/#page",
                "url": f"{BASE}/about-us/",
                "name": "About workFlowers",
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

    payload = hub

    payload = hub

    body = rf"""(function () {{
  if (window.location.pathname.replace(/\/+$/, '') !== '/about-us') return;

  var node = document.createElement('script');
  node.type = 'application/ld+json';
  node.textContent = JSON.stringify({json.dumps(payload, ensure_ascii=False)});
  document.head.appendChild(node);
}})();"""

    bundle = HERE.parent / "bullet_bundle.js"
    src = bundle.read_text(encoding="utf-8")

    i, j = src.find(BEGIN), src.find(END)
    if i == -1 or j == -1:
        raise SystemExit(
            f"markers not found in {bundle.name}. Expected a region bounded by\n"
            f"  {BEGIN}\n  {END}\n"
            "Restore them rather than pasting this block by hand."
        )

    updated = src[: i + len(BEGIN)] + "\n" + body + "\n" + src[j:]
    if updated == src:
        print(f"{bundle.name} already up to date — {len(reviews)} reviews")
        return

    bundle.write_text(updated, encoding="utf-8")
    print(
        f"rewrote the generated region of {bundle.name} — {len(reviews)} reviews, "
        f"aggregate {aggregate['ratingValue']}/5 from {aggregate['reviewCount']}\n"
        "next: merge, then scripts/bullet-head.sh and scripts/verify-live.py"
    )


if __name__ == "__main__":
    main()
