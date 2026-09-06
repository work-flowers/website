/* =======================================================================
   work.flowers — Bullet.so runtime bundle
   =======================================================================
   Loaded once, sitewide, from Bullet's global HEAD custom code as:

     <script src="https://cdn.jsdelivr.net/gh/work-flowers/website@<sha>/bullet_bundle.js" defer></script>

   Generate that line with scripts/bullet-head.sh; check the deployed
   result with scripts/verify-live.py. Do not paste this file into Bullet
   by hand — the whole point is that a change here rides the SHA pin the
   same way charm_style_sheet.css does.

   This replaces two surfaces that used to move by hand:

     footer.html      Bullet -> Settings -> Custom Code -> Footer.
                      A 38 KB paste that had to be re-pasted in full for
                      any footer change to reach the site.
     filed_index.js   a second jsDelivr pin, in the /about-us/ page-level
                      custom code, with its own SHA to keep in step.

   Both are now sections below. Bullet's global footer and the /about-us/,
   /legal/msa/, /legal/dpa/ and /privacy/ page-level pastes should all be
   EMPTY once this is live.

   ORDER OF EXECUTION. `defer` runs this after the document has parsed and
   before DOMContentLoaded — the same point the old end-of-body paste ran
   at, so nothing about timing changes. document.body is guaranteed to
   exist by the time the first line executes.

   Each section self-gates on the page it applies to and does nothing
   elsewhere, so there is no page-scoped code to maintain.

   NOT IN HERE, deliberately: the sitewide Organization / ProfessionalService
   JSON-LD. It stays a literal <script type="application/ld+json"> in the
   head paste so it is server-rendered. Moving it here would make the site's
   primary entity markup visible only after Google renders the page — the
   same weakness the archive-title section below documents. Generated code
   is cheap; server-rendered structured data is not.
   ======================================================================= */

/* =======================================================================
   Body classes
   =======================================================================
   Bullet emits <body id="page-<slug>"> server-side and no classes at all.
   The stylesheet is written against classes — 133 selectors across
   body.home, body.about-us and body.legal — so until now each of those
   pages carried a hand-pasted inline script adding its class:

     /              footer.html      classList.add('home')
     /about-us/     page-level       classList.add('about-us')
     /legal/msa/    page-level       classList.add('legal')
     /legal/dpa/    page-level       classList.add('legal')
     /privacy/      page-level       classList.add('legal')

   Five pastes to keep in step, and the /privacy/ one is why this is a
   table and not a rule: it takes body.legal without living under /legal/.
   The mapping is editorial, so it is written down rather than derived.

   Retargeting the CSS to body#page-index et al was the other option. It
   would raise 133 selectors from class to ID specificity, changing which
   later rules can still override them, for no gain over three lines here.
   ======================================================================= */
(function () {
  var BODY_CLASS = {
    'page-index': 'home',
    'page-about-us': 'about-us',
    'page-legal-msa': 'legal',
    'page-legal-dpa': 'legal',
    'page-privacy': 'legal'
  };

  var cls = BODY_CLASS[document.body.id];
  if (cls) document.body.classList.add(cls);
}());

/* =======================================================================
   Google Analytics (GA4)

   Guarded against: iframe previews, non-canonical domains, and the Bullet.so
   editor. The old hostname check used endsWith('work.flowers'), which also
   matched Bullet's editor host, so build sessions on /site/<siteId>/pages
   were being counted as real website traffic. Now the hostname must match
   exactly and /site/ paths are excluded.
   ======================================================================= */
var WF_GA_HOSTS = ['work.flowers', 'www.work.flowers'];
var wfIsSite   = WF_GA_HOSTS.indexOf(window.location.hostname) !== -1;
var wfIsEditor = window.location.pathname.indexOf('/site/') === 0;
if (window.top === window.self && wfIsSite && !wfIsEditor) {
  var ga = document.createElement('script');
  ga.async = true;
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-6FPQKF7KR9';
  document.head.appendChild(ga);
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'G-6FPQKF7KR9');
  gtag('config', 'AW-17609903901');
}

/* =======================================================================
   Equal-height callouts in multi-column rows

   Normalise height for horizontally aligned callouts
   ======================================================================= */
(function () {
  // How strict a "same row" check is (px of vertical tolerance)
  const ROW_TOL = 6;

  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const visible = el => {
    if (!el) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  // Find every Notion/Bullet multi-column row
  function getRows() {
    // Prefer rows Bullet tags (e.g., bullet-2-column / bullet-3-column),
    // but also catch generic .notion-row in case class names vary
    const rows = $$('.notion-row');
    // keep rows that contain at least two visible callouts in direct columns
    return rows.filter(row => {
      const callouts = $$(':scope > .notion-column > .notion-callout, :scope > .notion-column > [class*="callout"]', row).filter(visible);
      return callouts.length >= 2;
    });
  }

  function clearHeights(els){ els.forEach(el => { el.style.minHeight = ''; el.style.height = ''; }); }

  function sameRow(els){
    const tops = els.map(e => Math.round(e.getBoundingClientRect().top));
    return Math.max(...tops) - Math.min(...tops) <= ROW_TOL;
  }

  function equaliseRow(row){
    // Grab only top-level callouts inside columns for this row
    const cards = $$(':scope > .notion-column > .notion-callout, :scope > .notion-column > [class*="callout"]', row)
      .filter(visible);

    if (cards.length < 2) return;

    // Reset to natural heights before measuring
    clearHeights(cards);

    // If they’ve stacked (each ~full width), skip equalising
    const parentW = row.getBoundingClientRect().width || 0;
    const stacked = cards.every(c => {
      const w = c.getBoundingClientRect().width || 0;
      return parentW && (w / parentW) > 0.9;
    });
    if (stacked || !sameRow(cards)) return;

    // Measure and apply
    const maxH = Math.max(...cards.map(c => c.getBoundingClientRect().height));
    const target = Math.ceil(maxH);
    cards.forEach(c => { c.style.minHeight = target + 'px'; });
  }

  // Re-run equalising for all rows
  function run(){
    getRows().forEach(equaliseRow);
  }

  // Re-run after images in a row finish loading (covers lazy loads)
  function watchImages(){
    getRows().forEach(row => {
      const imgs = $$('img', row).filter(img => !img.complete);
      if (!imgs.length) return;
      let left = imgs.length;
      const again = () => { if (--left === 0) run(); };
      imgs.forEach(img => {
        img.addEventListener('load', again, { once:true });
        img.addEventListener('error', again, { once:true });
      });
      // safety pass in case some never fire
      setTimeout(run, 1500);
    });
  }

  // Lifecycle wiring
  let t; const go = () => { clearTimeout(t); t = setTimeout(() => { run(); watchImages(); }, 80); };

  document.addEventListener('DOMContentLoaded', go);
  window.addEventListener('load', go);
  window.addEventListener('resize', go);

  // Respond to Notion/Bullet hydration and DOM changes
  new MutationObserver(go).observe(document.documentElement, { childList:true, subtree:true });

  // Fonts can reflow heights too
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go).catch(()=>{});
})();

/* =======================================================================
   BreadcrumbList (JSON-LD) — SEO audit C-05

   BreadcrumbList — SEO audit C-05.
        Bullet has no breadcrumb template, so the trail is derived from
        the URL path at runtime. Emitted only when the page is at least
        one level deep; the homepage gets nothing, which is correct.
        Segment labels are title-cased from the slug, except the last
        crumb, which uses the page's own H1 where one is available.
   ======================================================================= */
(function () {
  var path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (!path) return;

  var segments = path.split('/').filter(Boolean);
  if (!segments.length) return;

  // Words Bullet slugs lowercase that should not be title-cased naively.
  var ACRONYMS = { ai: 'AI', seo: 'SEO', bi: 'BI', crm: 'CRM', api: 'API', sop: 'SOP', sops: 'SOPs', mcp: 'MCP' };

  function label(slug) {
    return slug.split('-').map(function (word) {
      if (ACRONYMS[word]) return ACRONYMS[word];
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  // Intermediate crumbs only get a URL if that section actually resolves.
  // /customer-reviews/ and /blog/tag/ are synthetic path segments with no
  // page behind them (audit C-03, H-05), so linking them would point Google
  // at a 404. A crumb with a name and no item is still valid schema.
  var LINKABLE_SECTIONS = { '/blog': true, '/about-us': true };

  var items = [{
    '@type': 'ListItem',
    position: 1,
    name: 'Home',
    item: 'https://www.work.flowers/'
  }];

  var built = '';
  segments.forEach(function (segment, index) {
    built += '/' + segment;
    var isLast = index === segments.length - 1;
    var name = label(segment);

    if (isLast) {
      var h1 = document.querySelector('h1');
      var heading = h1 && h1.textContent.trim();
      // Bullet renders the Notion Title as the H1; ignore it when it is
      // just the nav label (see audit C-02) or empty.
      if (heading && heading.length > 1 && heading.toLowerCase() !== 'home') {
        name = heading;
      }
    }

    var crumb = {
      '@type': 'ListItem',
      position: index + 2,
      name: name
    };
    if (isLast || LINKABLE_SECTIONS[built]) {
      crumb.item = 'https://www.work.flowers' + built + '/';
    }
    items.push(crumb);
  });

  var node = document.createElement('script');
  node.type = 'application/ld+json';
  node.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': 'https://www.work.flowers' + window.location.pathname + '#breadcrumb',
    itemListElement: items
  });
  document.head.appendChild(node);
})();

/* =======================================================================
   Tag & author archive metadata + noindex — audit H-05 / TKT-849

   Tag & author archive metadata — SEO audit H-05
   36 archive pages (33 tags + 3 authors) all ship the title
   "workFlowers" with an empty meta description.

   The audit assumed one Bullet template change would fix them.
   It won't: Bullet's Tags database reads only Name, Slug, Posts
   and Color, its Authors database has no meta fields either, and
   Blog Settings exposes no title format or template variables.
   Archive metadata is simply not configurable in Bullet, so the
   only lever is rewriting it here at runtime.

   This sets title, meta description and the Open Graph / Twitter
   equivalents, so link previews stop reading "workFlowers" too.

   SEPARATE DECISION — see NOINDEX below.
   ======================================================================= */
(function () {
  var path = window.location.pathname.replace(/\/+$/, '');
  var tagMatch = path.match(/^\/blog\/tags\/([^/]+)$/);
  var authorMatch = path.match(/^\/blog\/authors\/([^/]+)$/);
  if (!tagMatch && !authorMatch) return;

  // Slugs whose display form isn't just title-case.
  var LABELS = {
    'ai': 'AI',
    'ai-agents': 'AI Agents',
    'ai-skills': 'AI Skills',
    'chatgpt': 'ChatGPT',
    'crm': 'CRM',
    'dataviz': 'DataViz',
    'google-gemini': 'Google Gemini',
    'seo': 'SEO',
    'whatsapp': 'WhatsApp',
    'wordpress': 'WordPress'
  };

  function label(slug) {
    if (LABELS[slug]) return LABELS[slug];
    return slug.split('-').map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  var name = label(tagMatch ? tagMatch[1] : authorMatch[1]);
  var title, description;

  if (tagMatch) {
    title = name + ' — Articles & Guides | workFlowers';
    // Keep inside Google's ~60-char display budget: drop the descriptor
    // before the brand, never the brand itself.
    if (title.length > 60) title = name + ' | workFlowers';
    description = 'Every workFlowers article tagged ' + name +
      ' — automation, analytics and AI enablement notes from a Singapore operations consultancy.';
  } else {
    title = 'Posts by ' + name + ' | workFlowers';
    description = 'Articles written by ' + name +
      ' for workFlowers — automation, analytics and AI enablement for lean teams across Asia Pacific.';
  }

  document.title = title;

  function setMeta(selector, attr, value, content) {
    var tag = document.querySelector(selector);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, value);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  }

  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[property="og:title"]', 'property', 'og:title', title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);

  // ---- NOINDEX (ON since 5 Sep 2026 — TKT-849) -------------------
  // Decided on. These 36 archives are thin listing pages over a
  // 55-post blog that earns ~150 organic sessions in five months
  // (audit H-06); two of the four author archives belong to people
  // who have left. Where they do rank they engage badly:
  // /blog/tags/case-studies/ took 10 organic sessions with 2
  // engaged (20%) against the site's 49.7% organic average.
  //
  // The deciding evidence: the titles above are written by THIS
  // script, so the server-rendered title is still bare
  // "workFlowers". Google only sees the good one after rendering —
  // a delayed second pass, not guaranteed. So "they have real
  // titles now, let them rank" was weaker than it looked.
  //
  // Titles still matter either way: they fix the browser tab and
  // link previews, which noindex does not touch.
  //
  // "follow" is deliberate — link equity keeps flowing to the posts.
  // Google eventually treats links on long-term-noindex pages as
  // nofollow, which is fine here: /blog/ and sitemap.xml list every
  // post directly, so discovery never depended on these archives.
  //
  // Known loose end: Bullet still lists 28 of these in sitemap.xml,
  // so we submit URLs we are asking Google not to index. Wasteful
  // rather than harmful, and the sitemap is Bullet-generated.
  //
  // To switch off, change NOINDEX_ARCHIVES to false.
  var NOINDEX_ARCHIVES = true;
  if (NOINDEX_ARCHIVES) {
    setMeta('meta[name="robots"]', 'name', 'robots', 'noindex, follow');
  }
})();

/* =======================================================================
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
   ======================================================================= */
/* BEGIN GENERATED reviews — build_review_schema.py writes everything to the END marker */
(function () {
  if (window.location.pathname.replace(/\/+$/, '') !== '/about-us') return;

  var node = document.createElement('script');
  node.type = 'application/ld+json';
  node.textContent = JSON.stringify({"@context": "https://schema.org", "@graph": [{"@type": "AboutPage", "@id": "https://www.work.flowers/about-us/#page", "url": "https://www.work.flowers/about-us/", "name": "About workFlowers", "about": {"@id": "https://www.work.flowers/#organization"}, "mainEntity": {"@type": "ItemList", "numberOfItems": 11, "itemListElement": [{"@type": "ListItem", "position": 1, "item": {"@id": "https://www.work.flowers/about-us/#review-strategic-and-speedy-execution"}}, {"@type": "ListItem", "position": 2, "item": {"@id": "https://www.work.flowers/about-us/#review-ruey-teo-no-live-page"}}, {"@type": "ListItem", "position": 3, "item": {"@id": "https://www.work.flowers/about-us/#review-professional-and-knowledgable-about-several-fields"}}, {"@type": "ListItem", "position": 4, "item": {"@id": "https://www.work.flowers/about-us/#review-great-experience-in-automating-hr-ops-workflows"}}, {"@type": "ListItem", "position": 5, "item": {"@id": "https://www.work.flowers/about-us/#review-excellent-service-and-solution-for-my-issue"}}, {"@type": "ListItem", "position": 6, "item": {"@id": "https://www.work.flowers/about-us/#review-automation-a-scalability-enabler"}}, {"@type": "ListItem", "position": 7, "item": {"@id": "https://www.work.flowers/about-us/#review-excellent-service"}}, {"@type": "ListItem", "position": 8, "item": {"@id": "https://www.work.flowers/about-us/#review-streamlined-operations-with-smart-scalable-automations-from-dennis"}}, {"@type": "ListItem", "position": 9, "item": {"@id": "https://www.work.flowers/about-us/#review-effective-and-quick-solution"}}, {"@type": "ListItem", "position": 10, "item": {"@id": "https://www.work.flowers/about-us/#review-deep-insights"}}, {"@type": "ListItem", "position": 11, "item": {"@id": "https://www.work.flowers/about-us/#review-highly-recommend"}}]}}, {"@type": "AggregateRating", "itemReviewed": {"@id": "https://www.work.flowers/#organization"}, "ratingValue": 5.0, "bestRating": 5, "worstRating": 1, "reviewCount": 11, "ratingCount": 11}, {"@type": "Review", "@id": "https://www.work.flowers/about-us/#review-strategic-and-speedy-execution", "name": "Strategic and speedy execution", "reviewBody": "work.flowers offers the perfect combination of strategic guidance and speedy execution. Dennis doesn't just build Zaps, he genuinely puts himself in your shoes to solve complex business problems. He can communicate seamlessly with both technical and business stakeholders and execute the vision flawlessly.", "datePublished": "2026-05-17", "author": {"@type": "Organization", "name": "Secure Code Warrior"}, "reviewRating": {"@type": "Rating", "ratingValue": 5, "bestRating": 5, "worstRating": 1}, "itemReviewed": {"@id": "https://www.work.flowers/#organization"}}, {"@type": "Review", "@id": "https://www.work.flowers/about-us/#review-ruey-teo-no-live-page", "name": "Honest, clear, and does what he promises", "reviewBody": "Dennis is not only knowledgeable but also helpful and efficient professional. What sets him apart from others is that he is honest, communicates clearly and sets out to do what he promises.", "datePublished": "2026-02-02", "author": {"@type": "Person", "name": "Ruey Teo"}, "reviewRating": {"@type": "Rating", "ratingValue": 5, "bestRating": 5, "worstRating": 1}, "itemReviewed": {"@id": "https://www.work.flowers/#organization"}}, {"@type": "Review", "@id": "https://www.work.flowers/about-us/#review-professional-and-knowledgable-about-several-fields", "name": "Professional and knowledgable about several fields", "reviewBody": "Dennis is a professional and deeply knowledgeable across multiple domains, including accounting, workflow design, automation, and operational problem-solving - essentially everything you need to make your back end run independently. He begins from a perspective of building a system that will self-sustain, not simply replacing the existing workflow. This is someone that understands core mechanics.", "datePublished": "2026-01-19", "author": {"@type": "Person", "name": "N P"}, "reviewRating": {"@type": "Rating", "ratingValue": 5, "bestRating": 5, "worstRating": 1}, "itemReviewed": {"@id": "https://www.work.flowers/#organization"}}, {"@type": "Review", "@id": "https://www.work.flowers/about-us/#review-great-experience-in-automating-hr-ops-workflows", "name": "Great experience in automating HR Ops workflows", "reviewBody": "It's been a great experience working with Dennis to automate our HR Ops processes. He is very responsive and helpful, the solutions were built and tested fairly quickly and received positive feedback from internal teams.", "datePublished": "2025-12-10", "author": {"@type": "Person", "name": "Celine Nguyen", "worksFor": {"@type": "Organization", "name": "co:grow"}}, "reviewRating": {"@type": "Rating", "ratingValue": 5, "bestRating": 5, "worstRating": 1}, "itemReviewed": {"@id": "https://www.work.flowers/#organization"}}, {"@type": "Review", "@id": "https://www.work.flowers/about-us/#review-excellent-service-and-solution-for-my-issue", "name": "Excellent service and solution for my issue", "reviewBody": "Dennis was an incredible help with pushing forward my automation. I felt like my previous solutions were basic and they were working 60% of the time. During the 1st meeting i explained the issues, and Dennis understood my issues and proposed solutions that were both workable and not complicated for my company. A week later i had a fully working solution that went above and beyond my brief. I 100% recommend Work Flowers for automation solutions.", "datePublished": "2025-11-12", "author": {"@type": "Person", "name": "Lucy Bradbury", "worksFor": {"@type": "Organization", "name": "Start Right"}}, "reviewRating": {"@type": "Rating", "ratingValue": 5, "bestRating": 5, "worstRating": 1}, "itemReviewed": {"@id": "https://www.work.flowers/#organization"}}, {"@type": "Review", "@id": "https://www.work.flowers/about-us/#review-automation-a-scalability-enabler", "name": "Automation - a scalability enabler", "reviewBody": "I am happy to recommend Dennis, who was instrumental in helping me realise my vision to automate a highly manual and time-sensitive process. The outcome of our project has been nothing short of transformative. Thanks to his expertise, we have cut down the execution time significantly and most importantly, allowed us to scale our operations. This opened a path towards future growth.", "datePublished": "2025-11-12", "author": {"@type": "Person", "name": "Faizal K", "worksFor": {"@type": "Organization", "name": "NTUC"}}, "reviewRating": {"@type": "Rating", "ratingValue": 5, "bestRating": 5, "worstRating": 1}, "itemReviewed": {"@id": "https://www.work.flowers/#organization"}}, {"@type": "Review", "@id": "https://www.work.flowers/about-us/#review-excellent-service", "name": "Excellent service", "reviewBody": "Work Flowers has revolutionised our business and made us improve our performance heaps. Could not be more grateful for their service!", "datePublished": "2025-07-30", "author": {"@type": "Person", "name": "Eric Vuong", "worksFor": {"@type": "Organization", "name": "Elite Athlete Academy"}}, "reviewRating": {"@type": "Rating", "ratingValue": 5, "bestRating": 5, "worstRating": 1}, "itemReviewed": {"@id": "https://www.work.flowers/#organization"}}, {"@type": "Review", "@id": "https://www.work.flowers/about-us/#review-streamlined-operations-with-smart-scalable-automations-from-dennis", "name": "Streamlined operations with smart, scalable automations", "reviewBody": "Dennis has played a key role in transforming the day-to-day operations of our business. Tasks that previously took hours to complete are now automated, running seamlessly in the background and freeing up our team to focus on higher-value work. What sets Dennis apart is his thoughtful approach - he didn't just build scripts. He took the time to understand our pain points and crafted solutions that integrated seamlessly into our existing systems. Highly recommend!", "datePublished": "2025-07-22", "author": {"@type": "Person", "name": "Ezra Shuek", "worksFor": {"@type": "Organization", "name": "Ordinary Folk"}}, "reviewRating": {"@type": "Rating", "ratingValue": 5, "bestRating": 5, "worstRating": 1}, "itemReviewed": {"@id": "https://www.work.flowers/#organization"}}, {"@type": "Review", "@id": "https://www.work.flowers/about-us/#review-effective-and-quick-solution", "name": "Effective and quick solution", "reviewBody": "My sales team was in dire need of automation to reduce interval time between processes. Engaging Dennis from work.flowers has allowed my firm to increase both efficiency and productivity. The best part is that the automation works behind the scene so it feels as though we have hired a new team of worker assisting our department. If you are looking for automation, Dennis is your guy. Will definitely be engaging him again for any future improvements.", "datePublished": "2025-06-17", "author": {"@type": "Person", "name": "Shawmann Yeo", "worksFor": {"@type": "Organization", "name": "ES-Team Lighting"}}, "reviewRating": {"@type": "Rating", "ratingValue": 5, "bestRating": 5, "worstRating": 1}, "itemReviewed": {"@id": "https://www.work.flowers/#organization"}}, {"@type": "Review", "@id": "https://www.work.flowers/about-us/#review-deep-insights", "name": "Deep insights", "reviewBody": "We've worked with various automation tools over the years, but Dennis and the team at work.flowers brought a new level of insight and clarity. Their depth of expertise in AI-powered workflows, and automation strategies has helped us level up the way we work. As a non profit, we have found it useful to try and automate as much of our process as possible to reduce cost, work.flowers has been extremely helpful. Highly recommended!", "datePublished": "2025-06-12", "author": {"@type": "Person", "name": "Glenn Lim", "worksFor": {"@type": "Organization", "name": "Brands For Good Ltd"}}, "reviewRating": {"@type": "Rating", "ratingValue": 5, "bestRating": 5, "worstRating": 1}, "itemReviewed": {"@id": "https://www.work.flowers/#organization"}}, {"@type": "Review", "@id": "https://www.work.flowers/about-us/#review-highly-recommend", "name": "Highly recommend!", "reviewBody": "I worked with WF to automate our hiring process. The experience was smooth - I liked how I could share my ideas, and the team would be able to translate them into the desired output. The team was extremely knowledgeable and quickly understood the pain points I was facing - this has helped them be creative in delivering the desired output with zapier, amongst other tools. Highly recommend WF if you want to work with a team who truly understands and delivers (and has a sense of humour)!", "datePublished": "2025-05-13", "author": {"@type": "Person", "name": "Kyara Tan"}, "reviewRating": {"@type": "Rating", "ratingValue": 5, "bestRating": 5, "worstRating": 1}, "itemReviewed": {"@id": "https://www.work.flowers/#organization"}}]});
  document.head.appendChild(node);
})();
/* END GENERATED reviews */

/* =======================================================================
   Empty review row pages — SEO audit C-06

   Empty review row pages — SEO audit C-06 (revised)
   The eleven /customer-reviews/<slug>/ pages are published and
   indexable but render nothing except the footer: the review text
   lives in Notion properties and Bullet renders page bodies, which
   are empty. The content itself is fine — it is on /about-us/ via
   the inline gallery view — so these URLs are eleven empty
   duplicates of content that already has a home.

   Dennis confirmed 4 Sep that these were never meant to be
   click-through destinations — the reviews are a widget on
   /about-us/, and filed_index.js discards the gallery markup that
   would otherwise link to them, so nothing on the site points
   here. Switched ON. Set to false to revert; the URLs keep
   working either way, they just leave the index.
   ======================================================================= */
(function () {
  var NOINDEX_EMPTY_REVIEW_PAGES = true;
  if (!NOINDEX_EMPTY_REVIEW_PAGES) return;

  var path = window.location.pathname.replace(/\/+$/, '');
  if (path.indexOf('/customer-reviews/') !== 0 || path === '/customer-reviews') return;

  var tag = document.querySelector('meta[name="robots"]');
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', 'robots');
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', 'noindex, follow');
}());

/* =======================================================================
   Non-public pages — SEO audit C-04 (TKT-847) / M-06 (TKT-854)

   Non-public pages — SEO audit C-04 (TKT-847) and M-06 (TKT-854)

   Five URLs that were never meant for search: the WebeeUI Bullet
   starter-kit root, Bullet's own /components/ gallery, an agent
   embed test, an internal note to ourselves about where form
   submissions land, and the form thank-you page. All returned a
   real 200 with a self-canonical and no robots directive.

   Plain "noindex", not "noindex, follow" — these are meant to be
   gone, not to pass equity onward.

   ---- WHICH OF THE FIVE THIS ACTUALLY REACHES ----------------
   Only three. Verified 5 Sep 2026 by fetching each URL and
   looking for the global body paste (<div
   id="bullet-custom-global-body">) and the sitewide JSON-LD:

     /components/     global footer present  -> this works
     /contact-form/   global footer present  -> this works
     /submitted/      global footer present  -> this works
     /webeeui-bullet-website-builder-kit/   global body EMPTY
     /embed-test/                           global body EMPTY

   Those last two are stale artifacts, not live pages. The giveaway
   is the jsDelivr pin in their <head>: they carry
   charm_style_sheet.css@2f915188 while every live page carries
   @40c90de0. They were rendered at an older deploy and have not
   been re-rendered since, because they are no longer in the Notion
   tree for a publish to walk. Nothing pasted into the footer can
   ever reach them — they need Bullet to purge the orphaned output
   so the URLs 404/410. Their paths are listed below anyway, so
   that if Bullet ever does re-render them they land noindexed
   rather than silently returning to the index.

   ---- ORDERING, WHICH MATTERS MORE THAN IT LOOKS -------------
   Do NOT unpublish these in Notion first. That is what created
   C-04: deleting the WebeeUI pages in Notion took them out of
   sitemap.xml but left the root serving a stale, un-noindexable
   200. Unpublishing removes our only lever before the page has
   left the index.

   The order is: noindex (here) -> wait for Google to drop them ->
   then unpublish in Notion -> then Disallow in robots.txt. Each
   step is only safe once the previous one has taken effect.

   Set NOINDEX_NON_PUBLIC to false to revert; the URLs keep working
   either way, they just leave the index.
   ======================================================================= */
(function () {
  var NOINDEX_NON_PUBLIC = true;
  if (!NOINDEX_NON_PUBLIC) return;

  // Prefixes: the path itself and anything beneath it.
  var PREFIXES = [
    '/webeeui-bullet-website-builder-kit',
    '/components',
    '/embed-test',
    '/contact-form',
    '/submitted'
  ];

  var path = window.location.pathname.replace(/\/+$/, '');

  var match = false;
  for (var i = 0; i < PREFIXES.length; i++) {
    if (path === PREFIXES[i] || path.indexOf(PREFIXES[i] + '/') === 0) {
      match = true;
      break;
    }
  }
  if (!match) return;

  var tag = document.querySelector('meta[name="robots"]');
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', 'robots');
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', 'noindex');
}());

/* =======================================================================
   One meaningful H1 per page — SEO audit C-02, L-02, L-05

   charm_style_sheet.css:130 hides .notion-title sitewide, so every
   Notion page ships an H1 containing a nav label ("Home",
   "About Us") at display:none, while the real headline renders as
   an <h2> carrying Notion's .notion-h1 styling. The CSS route is
   therefore already taken — and it is what leaves these pages with
   no usable H1. CSS can hide an element; it cannot retag one or
   change its text. This does the retag.

   No visual change: the heading styles come from the
   notion-h / notion-h1 classes, not from the tag name. Verified
   that charm_style_sheet.css has no tag-qualified .notion-h
   selectors, and that the hero is not inside .hero_section (whose
   h1 rules are scoped to the blog landing and tag pages).

   Caveat worth knowing: this runs in the browser, so Google only
   sees it after rendering. It renders, but a server-side fix —
   renaming the Notion Title properties — would be more robust.
   Bullet exposes no other server-side lever.

   Behaviour by page shape:
     homepage, /about-us/, static pages  promote hero h2 -> h1,
                                         demote phantom -> div
     /contact/                           form card H1 is already
                                         real; demote phantom only
     blog posts                          post title H1 is real;
                                         demote phantom only (L-02)
     /blog/tags/*, /blog/authors/*       no phantom; just strip the
                                         literal "# " Bullet bakes
                                         into h1.tag-name (L-05)
   ======================================================================= */
(function () {
  var done = false;

  function visible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function retag(el, tagName) {
    var out = document.createElement(tagName);
    for (var i = 0; i < el.attributes.length; i++) {
      out.setAttribute(el.attributes[i].name, el.attributes[i].value);
    }
    while (el.firstChild) out.appendChild(el.firstChild);
    el.parentNode.replaceChild(out, el);
    return out;
  }

  function stripTagHash() {
    // L-05: the "#" is inside the heading's own text node — Bullet's
    // template decoration, not a pseudo-element — so CSS cannot reach it.
    var heading = document.querySelector('h1.tag-name');
    if (heading && /^#\s+/.test(heading.textContent)) {
      heading.textContent = heading.textContent.replace(/^#\s+/, '');
    }
  }

  function fixHeadings() {
    stripTagHash();

    // A native form block's title carries the same class but is opted back
    // into display by the stylesheet, and is a legitimate visible heading —
    // so pick the hidden one explicitly rather than trusting DOM order.
    var phantom = Array.prototype.slice.call(document.querySelectorAll('h1.notion-title'))
      .filter(function (h) { return !visible(h); })[0];
    if (!phantom) return document.querySelectorAll('h1.notion-title').length > 0;

    var realH1 = Array.prototype.slice.call(document.querySelectorAll('h1'))
      .filter(function (h) { return h !== phantom && visible(h); })[0];

    if (realH1) {
      retag(phantom, 'div');
      return true;
    }

    var hero = Array.prototype.slice.call(document.querySelectorAll('h2.notion-h1'))
      .filter(function (h) { return visible(h) && !h.closest('.hero_section'); })[0];

    if (!hero) return false;   // nothing safe to promote — leave the page alone

    retag(hero, 'h1');
    retag(phantom, 'div');
    return true;
  }

  function attempt() {
    if (done) return;
    if (fixHeadings()) done = true;
  }

  // Bullet hydrates client-side, so the headings may not exist yet. Retry
  // until one pass succeeds, then stop watching.
  document.addEventListener('DOMContentLoaded', attempt);
  window.addEventListener('load', attempt);
  attempt();

  var observer = new MutationObserver(function () {
    attempt();
    if (done) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(function () { observer.disconnect(); }, 8000);
})();

/* =======================================================================
   Filed Index — testimonial spotlight widget (/about-us/)

   Reads the Notion gallery cards Bullet renders under OUR CLIENTS and turns
   them into a two-column quote-spotlight + ledger layout. Idempotent.
   Paired with 19.6 in charm_style_sheet.css.

   Was filed_index.js: a second jsDelivr pin, carried in the /about-us/
   page-level custom code, with its own SHA to keep in step with the CSS.
   It rides the bundle now, and gates on the body id rather than the class
   that paste used to add, so it no longer depends on the paste existing.
   ======================================================================= */
(function () {
  if (document.body.id !== 'page-about-us') return;

  const ROTATE_MS = 6000;

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  /**
   * Convert the numeric Rating property (1–5) into a "★★★★★" glyph
   * string. CSS colours ★ ochre.
   */
  function normaliseStars(raw) {
    if (raw == null) return '';
    const n = Math.round(parseFloat(String(raw).trim()));
    if (!Number.isFinite(n)) return '';
    return '★'.repeat(Math.max(0, Math.min(5, n)));
  }

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];

  function monthIndex(word) {
    const w = String(word).toLowerCase().replace(/\.$/, '');
    for (let i = 0; i < MONTHS.length; i++) {
      const full = MONTHS[i].toLowerCase();
      if (w === full || w === full.slice(0, 3)) return i;
    }
    return -1;
  }

  /**
   * Parse the Review Date property text into { y, m, d } calendar parts.
   *
   * Bullet does NOT honour the Notion view's date format: the view is set to
   * YYYY/MM/DD but the rendered cell reads "May 17, 2026". Both are handled,
   * plus "17 May 2026", with Date.parse as a last resort.
   *
   * Deliberately avoids Date.toISOString(): Date.parse("May 17, 2026") yields
   * local midnight, and in UTC+8 that converts back to the 16th. Everything
   * here stays in calendar parts so the date can never drift by a day.
   */
  function parseDateParts(raw) {
    if (!raw) return null;
    const text = String(raw).trim();

    // "2026/05/17", "2026-05-17"
    let m = text.match(/(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/);
    if (m) return { y: +m[1], m: +m[2] - 1, d: +m[3] };

    // "May 17, 2026" — Bullet's actual output
    m = text.match(/([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})/);
    if (m && monthIndex(m[1]) >= 0) return { y: +m[3], m: monthIndex(m[1]), d: +m[2] };

    // "17 May 2026"
    m = text.match(/(\d{1,2})\s+([A-Za-z]{3,9})\.?\s+(\d{4})/);
    if (m && monthIndex(m[2]) >= 0) return { y: +m[3], m: monthIndex(m[2]), d: +m[1] };

    const t = Date.parse(text);
    if (!Number.isNaN(t)) {
      const dt = new Date(t);
      // Local getters, to match how the string was interpreted.
      return { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate() };
    }
    return null;
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  /**
   * ISO value for the <time datetime> attribute plus a UK-formatted label.
   * Falls back to showing the raw string if nothing parses, so a format
   * change degrades to something readable rather than to nothing.
   */
  function parseReviewDate(raw) {
    if (!raw) return { iso: '', label: '' };
    const parts = parseDateParts(raw);
    if (!parts) return { iso: '', label: String(raw).trim() };
    return {
      iso: parts.y + '-' + pad2(parts.m + 1) + '-' + pad2(parts.d),
      // Swap for `MONTHS[parts.m] + ' ' + parts.y` if day-level precision
      // ever reads as too much for a testimonial.
      label: parts.d + ' ' + MONTHS[parts.m] + ' ' + parts.y
    };
  }

  /**
   * Find the Review Date cell. Bullet emits `prop-review-date` only while
   * Review Date is a shown property on the Notion gallery view — if it is
   * ever removed from the view, fall back to sniffing the other property
   * cells for something date-shaped rather than silently rendering nothing.
   */
  function findDateText(card) {
    const direct = card.querySelector('.prop-review-date');
    if (direct) return direct.textContent.trim();

    const cells = card.querySelectorAll('[class*="prop-"]');
    for (const cell of cells) {
      if (/prop-(reviewer-name|review-body|rating|headline)/.test(String(cell.className))) continue;
      const text = cell.textContent.trim();
      if (text && parseDateParts(text)) return text;
    }
    return '';
  }

  function extract(card) {
    const iconImg = card.querySelector('.notion-page-title-icon img, .notion-page-icon-inline img');
    const iconSrc = iconImg ? iconImg.src : null;

    // Bullet generates `prop-<slug>` classes on each property based on the
    // Notion property name, e.g. "Reviewer Name" → `.prop-reviewer-name`.
    const nameEl = card.querySelector('.prop-reviewer-name');
    const name = nameEl ? nameEl.textContent.trim() : '';

    const bodyEl = card.querySelector('.prop-review-body');
    const body = bodyEl ? bodyEl.textContent.trim() : '';

    const starsEl = card.querySelector('.prop-rating');
    const stars = starsEl ? normaliseStars(starsEl.textContent) : '';

    const date = parseReviewDate(findDateText(card));

    return { name, body, stars, iconSrc, dateIso: date.iso, dateLabel: date.label };
  }

  function initials(name) {
    const parts = (name || '').split(/\s+/).filter(Boolean).map(s => s[0]);
    return (parts.slice(0, 2).join('') || 'WF').toUpperCase();
  }

  /**
   * Find the top-level page block that contains the gallery cards. Could
   * be a callout wrapping the inline DB view, or the bare collection
   * itself if the author removed the callout. Returns null if no gallery
   * has rendered yet.
   */
  function findGallery() {
    const card = document.querySelector('.notion-page-content-inner .notion-collection-card');
    if (!card) return null;
    let el = card;
    while (el && el.parentElement && !el.parentElement.classList.contains('notion-page-content-inner')) {
      el = el.parentElement;
    }
    if (!el || !el.parentElement || !el.parentElement.classList.contains('notion-page-content-inner')) return null;
    return el;
  }

  /**
   * Pull the eyebrow text. If the gallery is wrapped (callout), look
   * inside for an eyebrow paragraph not inside a card. If the gallery is
   * top-level, look at the immediately preceding sibling. Returns the
   * text plus an element to remove during mount (preceding sibling case),
   * or null if no eyebrow is found — caller falls back to a default.
   */
  function extractEyebrow(galleryWrap) {
    const insideTexts = galleryWrap.querySelectorAll('.notion-text');
    for (const t of insideTexts) {
      if (t.closest('.notion-collection-card')) continue;
      const text = t.textContent.trim();
      if (text) return { text: text.replace(/^[●•·]\s*/, '').trim(), consume: null };
    }
    const prev = galleryWrap.previousElementSibling;
    if (prev && prev.classList && prev.classList.contains('notion-text')) {
      const text = prev.textContent.trim();
      if (text) return { text: text.replace(/^[●•·]\s*/, '').trim(), consume: prev };
    }
    return { text: null, consume: null };
  }

  function build(items, eyebrow) {
    const root = document.createElement('section');
    root.className = 'wf-filed-index';
    root.setAttribute('data-paused', 'false');
    root.innerHTML = `
      <header class="wf-filed-index__header">
        <p class="wf-filed-index__eyebrow">${escapeHtml(eyebrow || 'Client testimonials')}</p>
        <span class="wf-filed-index__rule" aria-hidden="true"></span>
        <span class="wf-filed-index__counter"><strong data-active-counter>01</strong> / ${String(items.length).padStart(2, '0')}</span>
      </header>
      <div class="wf-filed-index__grid">
        <div class="wf-filed-index__quote" aria-live="polite"></div>
        <aside class="wf-filed-index__ledger">
          <div class="wf-filed-index__ledger-head">
            <span>The full ledger</span>
            <span>Rating · Client</span>
          </div>
          <ul class="wf-filed-index__list" role="tablist"></ul>
        </aside>
      </div>
    `;

    const list = root.querySelector('.wf-filed-index__list');
    items.forEach((item, i) => {
      const li = document.createElement('li');
      li.className = 'wf-filed-index__row';
      li.setAttribute('role', 'tab');
      li.setAttribute('data-index', String(i));
      li.innerHTML = `
        <button type="button">
          <span class="wf-filed-index__row-index">${String(i + 1).padStart(2, '0')}</span>
          <span class="wf-filed-index__row-meta">
            <span class="wf-filed-index__row-name">${escapeHtml(item.name || 'Anonymous')}</span>
            <span class="wf-filed-index__row-preview">${escapeHtml(item.body)}</span>
          </span>
          <span class="wf-filed-index__row-stars">${escapeHtml(item.stars)}</span>
          <span class="wf-filed-index__row-progress" aria-hidden="true"></span>
        </button>
      `;
      list.appendChild(li);
    });

    return root;
  }

  function mount(galleryWrap, items) {
    const { text: eyebrow, consume } = extractEyebrow(galleryWrap);
    const root = build(items, eyebrow);
    const quotePanel = root.querySelector('.wf-filed-index__quote');
    const counterEl = root.querySelector('[data-active-counter]');
    const rows = root.querySelectorAll('.wf-filed-index__row');

    let active = 0;
    let timer = null;

    function renderActive() {
      const item = items[active];
      const logoHtml = item.iconSrc
        ? `<span class="wf-filed-index__logo"><img src="${escapeHtml(item.iconSrc)}" alt=""></span>`
        : `<span class="wf-filed-index__logo wf-filed-index__logo--monogram">${escapeHtml(initials(item.name))}</span>`;

      quotePanel.innerHTML = `
        <header class="wf-filed-index__quote-head">
          ${logoHtml}
          <span class="wf-filed-index__stars">${escapeHtml(item.stars)}</span>
        </header>
        <blockquote class="wf-filed-index__body">
          <span class="wf-filed-index__quote-glyph">&ldquo;</span>${escapeHtml(item.body)}<span class="wf-filed-index__quote-glyph">&rdquo;</span>
        </blockquote>
        <footer class="wf-filed-index__attribution">
          <span class="wf-filed-index__from">From</span>
          <span class="wf-filed-index__name">${escapeHtml(item.name || 'Anonymous')}</span>
          ${item.dateLabel
            ? `<time class="wf-filed-index__date"${item.dateIso ? ` datetime="${escapeHtml(item.dateIso)}"` : ''}>${escapeHtml(item.dateLabel)}</time>`
            : ''}
        </footer>
      `;

      rows.forEach((row, i) => {
        if (i === active) {
          row.setAttribute('data-active', 'true');
          // Clone the progress bar to restart its CSS animation cleanly
          const bar = row.querySelector('.wf-filed-index__row-progress');
          if (bar) bar.replaceWith(bar.cloneNode(false));
        } else {
          row.removeAttribute('data-active');
        }
      });

      counterEl.textContent = String(active + 1).padStart(2, '0');
    }

    function setActive(i) {
      active = (i + items.length) % items.length;
      renderActive();
    }
    function tick() { setActive(active + 1); }
    function start() { stop(); timer = setInterval(tick, ROTATE_MS); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    rows.forEach(row => {
      row.querySelector('button').addEventListener('click', () => {
        setActive(parseInt(row.getAttribute('data-index'), 10));
        start(); // restart timer on user interaction
      });
    });
    root.addEventListener('mouseenter', () => { stop(); root.setAttribute('data-paused', 'true'); });
    root.addEventListener('mouseleave', () => { root.setAttribute('data-paused', 'false'); start(); });

    if (consume && consume.parentElement) consume.remove();
    galleryWrap.replaceWith(root);
    renderActive();
    start();
  }

  function tryInit() {
    const galleryWrap = findGallery();
    if (!galleryWrap || galleryWrap.dataset.filedIndexMounted === 'true') return false;

    const cards = galleryWrap.querySelectorAll('.notion-collection-card');
    if (!cards.length) return false;

    const items = Array.from(cards).map(extract).filter(it => it.body || it.name);
    if (!items.length) return false;

    galleryWrap.dataset.filedIndexMounted = 'true';
    mount(galleryWrap, items);
    return true;
  }

  function start() {
    if (tryInit()) return;
    // Bullet may render gallery cards client-side after initial paint —
    // observe the document until cards appear, then init once.
    const observer = new MutationObserver(() => {
      if (tryInit()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    // Stop watching after 15s either way to avoid leaking.
    setTimeout(() => observer.disconnect(), 15000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
