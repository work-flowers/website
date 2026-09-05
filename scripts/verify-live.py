#!/usr/bin/env python3
"""Check that work.flowers is actually serving what this repo says it should.

    scripts/verify-live.py             # against origin/main
    scripts/verify-live.py <ref|sha>   # against anything else

Reading the live page tells you a pin is *present*. It cannot tell you the pin
is *right* — a stale or mistyped SHA looks identical in the HTML. So the load
bearing check here is the hash comparison: fetch what jsDelivr actually serves
for each pin and compare it byte for byte against the repo at the expected
commit. Everything else is drift detection around that.

Exits non-zero with a checklist of what is wrong. No third-party imports.
"""

import argparse
import hashlib
import json
import pathlib
import re
import subprocess
import sys
import urllib.error
import urllib.request

REPO = pathlib.Path(subprocess.run(
    ["git", "rev-parse", "--show-toplevel"],
    capture_output=True, text=True, check=True).stdout.strip())

SITE = "https://www.work.flowers"
CDN = "https://cdn.jsdelivr.net/gh/work-flowers/website@{sha}/{path}"
UA = "work.flowers-deploy-verifier"

# Files pinned from Bullet's head, and so served to every visitor.
PINNED = ["charm_style_sheet.css", "bullet_bundle.js"]

# Pages worth fetching, and why. The four after the first two are the ones that
# used to carry their own page-level custom-code paste (see the body-class table
# in bullet_bundle.js); they are here so the verifier notices if one comes back.
PAGES = {
    "/": "page-index",
    "/about-us/": "page-about-us",
    "/legal/msa/": "page-legal-msa",
    "/legal/dpa/": "page-legal-dpa",
    "/privacy/": "page-privacy",
    "/blog/": "page-blog",
}

THEME_BASELINE = REPO / "bullet_theme_baseline.css"

GREEN, RED, YELLOW, DIM, RESET = "\033[32m", "\033[31m", "\033[33m", "\033[2m", "\033[0m"


class Report:
    def __init__(self):
        self.rows = []

    def add(self, status, name, detail=""):
        self.rows.append((status, name, detail))

    ok = lambda self, n, d="": self.add("ok", n, d)
    fail = lambda self, n, d="": self.add("fail", n, d)
    warn = lambda self, n, d="": self.add("warn", n, d)

    @property
    def failed(self):
        return any(s == "fail" for s, _, _ in self.rows)

    def render(self):
        mark = {"ok": f"{GREEN}✓{RESET}", "fail": f"{RED}✗{RESET}", "warn": f"{YELLOW}!{RESET}"}
        for status, name, detail in self.rows:
            print(f"  {mark[status]} {name}")
            for line in (detail.splitlines() if detail else []):
                print(f"      {DIM}{line}{RESET}")


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read()
    return raw if binary else raw.decode("utf-8", "replace")


def git_show(sha, path):
    r = subprocess.run(["git", "show", f"{sha}:{path}"],
                       capture_output=True, cwd=REPO)
    return r.stdout if r.returncode == 0 else None


def sha256(b):
    return hashlib.sha256(b).hexdigest()[:16]


def head_pins(html):
    """Every jsDelivr pin on the page, as (sha, filename)."""
    return re.findall(r"cdn\.jsdelivr\.net/gh/work-flowers/website@([0-9a-f]+)/([^\"'?]+)", html)


def tag_set(markup):
    """Normalise <link>/<script> tags to a comparable set.

    Bullet stamps data-bullet-head-type="global" onto everything it injects
    from the head paste, and is free to reorder attributes, so compare on
    (tag name, sorted attributes) with that marker removed.
    """
    out = set()
    for m in re.finditer(r"<(link|script)\b([^>]*)>", markup, re.I):
        name, attrs = m.group(1).lower(), m.group(2)
        attrs = re.sub(r'\s*data-bullet-head-type="[^"]*"', "", attrs)
        pairs = re.findall(r'([\w:-]+)(?:=(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+)))?', attrs)
        norm = tuple(sorted(f"{k}={(a or b or c or '')}" for k, a, b, c in pairs if k))
        # The ld+json script carries content, not attributes; handled separately.
        if name == "script" and any(p.startswith("type=application/ld+json") for p in norm):
            continue
        out.add((name, norm))
    return out


def ld_json_blocks(html):
    return re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
                      html, re.S | re.I)


def footer_embed(html):
    m = re.search(r"<div class=footer-embed>(.*?)(?=<div id=\"bullet-custom-global-body\")",
                  html, re.S)
    return m.group(1) if m else None


def page_body_paste(html):
    m = re.search(r'<div id="bullet-custom-page-body">(.*?)</div>\s*<script', html, re.S)
    return m.group(1).strip() if m else ""


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("ref", nargs="?", default="origin/main",
                    help="commit the live site is expected to be pinned to")
    args = ap.parse_args()

    r = subprocess.run(["git", "rev-parse", "--verify", f"{args.ref}^{{commit}}"],
                       capture_output=True, text=True, cwd=REPO)
    if r.returncode != 0:
        sys.exit(f"error  '{args.ref}' is not a commit. Try 'git fetch origin' first.")
    sha = r.stdout.strip()

    print(f"\nverifying {SITE} against {sha[:8]} ({args.ref})\n")
    rep = Report()

    # ---- fetch ------------------------------------------------------------
    pages = {}
    for path in PAGES:
        try:
            pages[path] = fetch(SITE + path)
        except Exception as e:
            rep.fail(f"fetch {path}", str(e))
    if not pages:
        rep.render()
        sys.exit(1)

    # ---- 1. pins ----------------------------------------------------------
    bad, extra = [], []
    for path, html in pages.items():
        pins = head_pins(html)
        if not pins:
            bad.append(f"{path}: no jsDelivr pin at all")
            continue
        for pin_sha, pin_file in pins:
            if not sha.startswith(pin_sha):
                bad.append(f"{path}: {pin_file} pinned to {pin_sha[:8]}, expected {sha[:8]}")
            if pin_file not in PINNED:
                extra.append(f"{path}: unexpected pin {pin_file}@{pin_sha[:8]}")
    if bad:
        rep.fail("jsDelivr pins are on the expected commit", "\n".join(bad))
    else:
        rep.ok("jsDelivr pins are on the expected commit", f"{sha[:8]} on all {len(pages)} pages")
    if extra:
        rep.fail("no leftover pins", "\n".join(extra) +
                 "\nfiled_index.js rides bullet_bundle.js now — clear the /about-us/ page paste.")

    # ---- 2. served bytes match the repo ----------------------------------
    for f in PINNED:
        want = git_show(sha, f)
        if want is None:
            rep.fail(f"{f} exists at {sha[:8]}", "not in the commit being verified")
            continue
        url = CDN.format(sha=sha, path=f)
        try:
            got = fetch(url, binary=True)
        except urllib.error.HTTPError as e:
            rep.fail(f"{f} is served", f"{url}\nHTTP {e.code} — is the commit pushed to GitHub?")
            continue
        except Exception as e:
            rep.fail(f"{f} is served", f"{url}\n{e}")
            continue
        if got == want:
            rep.ok(f"{f} served bytes match the repo", f"sha256:{sha256(want)}  {len(want):,} bytes")
        else:
            rep.fail(f"{f} served bytes match the repo",
                     f"repo sha256:{sha256(want)} ({len(want):,} B)\n"
                     f"cdn  sha256:{sha256(got)} ({len(got):,} B)")

    # ---- 3. served CSS carries no @import --------------------------------
    css = git_show(sha, "charm_style_sheet.css")
    if css and re.search(rb"^\s*@import", css, re.M):
        rep.fail("no @import in the stylesheet",
                 "an @import cannot start until the stylesheet has downloaded (audit M-01)")
    elif css:
        rep.ok("no @import in the stylesheet")

    # ---- 4. the head paste matches what the generator produces -----------
    gen = subprocess.run([str(REPO / "scripts" / "bullet-head.sh"), sha],
                         capture_output=True, text=True, cwd=REPO)
    if gen.returncode != 0:
        rep.fail("head paste matches scripts/bullet-head.sh", gen.stderr.strip())
    else:
        want_tags = tag_set(gen.stdout)
        for path, html in pages.items():
            head = html.split("</head>")[0]
            missing = want_tags - tag_set(head)
            if missing:
                rep.fail(f"head paste is complete on {path}",
                         "\n".join("missing: " + " ".join(a for a in t[1] if a.split("=")[0]
                                                          in ("href", "src", "rel"))
                                   for t in sorted(missing)))
            else:
                rep.ok(f"head paste is complete on {path}")

        # The Organization JSON-LD is literal markup in the paste; compare parsed.
        want_ld = None
        for blk in ld_json_blocks(gen.stdout):
            want_ld = json.loads(blk)
        for path, html in pages.items():
            found = False
            for blk in ld_json_blocks(html.split("</head>")[0]):
                try:
                    if json.loads(blk) == want_ld:
                        found = True
                except json.JSONDecodeError:
                    pass
            (rep.ok if found else rep.fail)(f"Organization JSON-LD server-rendered on {path}")

    # ---- 5. every JSON-LD block on every page parses ---------------------
    broken = []
    for path, html in pages.items():
        for blk in ld_json_blocks(html):
            try:
                json.loads(blk)
            except json.JSONDecodeError as e:
                broken.append(f"{path}: {e}")
    (rep.fail if broken else rep.ok)("all JSON-LD parses", "\n".join(broken))

    # ---- 6. cutover: the pastes the bundle replaced are empty ------------
    dirty = []
    for path, html in pages.items():
        fe = footer_embed(html)
        if fe and "<script" in fe:
            n = len(re.findall(r"<script", fe))
            dirty.append(f"{path}: Bullet's global footer still holds {n} script block(s)")
    if dirty:
        rep.fail("Bullet global footer is empty",
                 "\n".join(dirty) +
                 "\nthese ride bullet_bundle.js now; running both means duplicate GA4 and JSON-LD."
                 "\nclear Settings -> Custom Code -> Footer.")
    else:
        rep.ok("Bullet global footer is empty")

    stale = [f"{path}: {page_body_paste(html)[:70]}"
             for path, html in pages.items() if page_body_paste(html)]
    if stale:
        rep.fail("page-level pastes are empty", "\n".join(stale) +
                 "\nthe body-class shim in bullet_bundle.js covers these.")
    else:
        rep.ok("page-level pastes are empty")

    # ---- 7. the body ids the class shim keys off still exist -------------
    wrong = [f"{path}: expected id={want!r}, got {re.search(r'<body[^>]*>', html).group(0)!r}"
             for path, html in pages.items()
             if (want := PAGES[path]) and f"id='{want}'" not in html and f'id="{want}"' not in html]
    if wrong:
        rep.fail("body ids match the class shim", "\n".join(wrong) +
                 "\nBODY_CLASS in bullet_bundle.js keys off these; a renamed slug silently"
                 "\ndrops that page's styling.")
    else:
        rep.ok("body ids match the class shim", f"{len(pages)} pages")

    # ---- 8. the jtbd widget still matches the repo copy ------------------
    widget = (REPO / "jtbd_widget.html").read_text(encoding="utf-8")
    prompts = re.findall(r'^\s*"(.+?)",?\s*$', widget.split("];")[0], re.M)
    home = pages.get("/", "")
    absent = [p for p in prompts if p.replace("'", "&#39;") not in home and p not in home]
    if not prompts:
        rep.warn("jtbd widget matches the repo", "could not read prompts out of jtbd_widget.html")
    elif absent:
        rep.fail("jtbd widget matches the repo",
                 f"{len(absent)}/{len(prompts)} prompts missing from the live homepage\n"
                 f"first: {absent[0][:70]}\n"
                 "this block is pasted into Notion, not deployed from here — re-paste it.")
    else:
        rep.ok("jtbd widget matches the repo", f"all {len(prompts)} prompts present")

    # ---- 9. Bullet theme settings have not drifted -----------------------
    live_theme = None
    m = re.search(r'<style id="bullet-theme">(.*?)</style>', pages.get("/", ""), re.S)
    if m:
        live_theme = m.group(1).strip()
    if live_theme is None:
        rep.warn("Bullet theme settings unchanged", "no #bullet-theme block on /")
    elif not THEME_BASELINE.exists():
        THEME_BASELINE.write_text(live_theme + "\n", encoding="utf-8")
        rep.warn("Bullet theme settings unchanged",
                 f"no baseline yet — wrote {THEME_BASELINE.name}, commit it")
    elif THEME_BASELINE.read_text(encoding="utf-8").strip() == live_theme:
        rep.ok("Bullet theme settings unchanged")
    else:
        rep.fail("Bullet theme settings unchanged",
                 "the theme is a Bullet setting, not code — someone changed it in the dashboard.\n"
                 f"if the change was intended: curl -s {SITE}/ | "
                 "perl -0777 -ne 'print $1 if /<style id=\"bullet-theme\">(.*?)<\\/style>/s' "
                 f"> {THEME_BASELINE.name}")

    print()
    rep.render()
    n_fail = sum(1 for s, _, _ in rep.rows if s == "fail")
    print()
    if rep.failed:
        print(f"{RED}{n_fail} check(s) failed{RESET} — the live site does not match {sha[:8]}.\n")
        sys.exit(1)
    print(f"{GREEN}all checks passed{RESET} — live site matches {sha[:8]}.\n")


if __name__ == "__main__":
    main()
