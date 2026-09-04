#!/usr/bin/env python3
"""Build the customer-review JSON-LD block for work.flowers (SEO audit H-04).

Reads customer-reviews.json (the cleaned mirror of the Notion Customer Reviews
data source) and writes customer-reviews-schema.html — a paste-ready block for
Bullet's custom footer.

Scope: /about-us/ only. That page carries an inline gallery view of the Customer
Reviews database under "OUR CLIENTS", which renders all eleven reviews with
reviewer, body and star rating visible. Google requires marked-up review content
to be visible on the page it is marked up on, so /about-us/ is the correct and
only target. The /customer-reviews/<slug>/ row pages render empty and get no
markup.

Reviews are anchored at /about-us/#review-<slug> and reference the sitewide
organisation node by @id, so the entity is declared once (in footer.html) and
only pointed at here.

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

    out = f"""<!-- ============================================================
     Customer review markup (JSON-LD) — SEO audit H-04
     GENERATED FILE. Do not hand-edit: change customer-reviews.json
     and re-run build_review_schema.py.

     Scope: /about-us/ only. That page carries an inline gallery view
     of the Customer Reviews database under "OUR CLIENTS", which
     renders all eleven reviews with reviewer, body and star rating
     visible. Google requires marked-up review content to be visible
     on the page carrying the markup, so this is the correct target.
     The /customer-reviews/<slug>/ row pages render empty and get
     nothing.

     itemReviewed points at the sitewide organisation node declared
     in footer.html rather than restating the entity.

     NOTE ON EXPECTED PAYOFF: Google does not show review stars for
     reviews a business collects about itself ("self-serving"
     reviews) on Organization or LocalBusiness. This markup will not
     produce stars in Google search. It is worth shipping for Bing,
     for AI answer engines that read JSON-LD, and so the entity has
     a rating when third-party review sources exist.

     ONE LOOSE END: datePublished is emitted but the review dates are
     not among the gallery view's displayed properties. Adding Review
     Date to that view in Notion makes the markup fully match what a
     visitor sees — and recent dates read better to a human anyway.
     ============================================================ -->
<script>
(function () {{
  if (window.location.pathname.replace(/\/+$/, '') !== '/about-us') return;

  var node = document.createElement('script');
  node.type = 'application/ld+json';
  node.textContent = JSON.stringify({json.dumps(payload, ensure_ascii=False)});
  document.head.appendChild(node);
}})();
</script>
"""
    (HERE / "customer-reviews-schema.html").write_text(out)
    print(f"wrote customer-reviews-schema.html — {len(reviews)} reviews, "
          f"aggregate {aggregate['ratingValue']}/5 from {aggregate['reviewCount']}")


if __name__ == "__main__":
    main()
