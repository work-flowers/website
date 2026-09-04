/**
 * Filed Index — testimonial spotlight widget for About Us.
 * Reads the existing Notion gallery cards rendered by Bullet, transforms
 * them into a two-column quote-spotlight + ledger layout. Runs only on
 * `body.about-us`. Idempotent. Paired with §19.6 in charm_style_sheet.css.
 */
(function () {
  if (!document.body.classList.contains('about-us')) return;

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
