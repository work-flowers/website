#!/usr/bin/env bash
#
# Print the exact block to paste into Bullet -> Settings -> Custom Code -> Head,
# with the jsDelivr pins resolved to a real commit SHA. Copies it to the
# clipboard on macOS.
#
#   scripts/bullet-head.sh            # origin/main (what you want after a merge)
#   scripts/bullet-head.sh <ref>      # any branch, tag or SHA
#
# head.html is the template. Edit that, never the paste, and never the copy
# living in the Bullet dashboard.
#
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

REF="${1:-origin/main}"
REPO_PATH="work-flowers/website"
PINNED=(charm_style_sheet.css bullet_bundle.js)

die() { printf '\033[31merror\033[0m  %s\n' "$*" >&2; exit 1; }
warn() { printf '\033[33mwarning\033[0m  %s\n' "$*" >&2; }

[[ -f head.html ]] || die "head.html not found — run this from inside the repo."

# --- Resolve the ref -------------------------------------------------------
# Only a full 40-char SHA goes into the pin. jsDelivr accepts short ones, but a
# full SHA is what makes the pin unambiguous and diffable against the live page.
SHA="$(git rev-parse --verify "$REF^{commit}" 2>/dev/null)" \
  || die "'$REF' is not a commit. Try 'git fetch origin' first."

# --- Refuse to pin something jsDelivr cannot serve -------------------------
# jsDelivr reads GitHub, so a SHA that exists only locally produces a pin that
# 404s for every visitor. This is the failure that is invisible until it is live.
if ! git merge-base --is-ancestor "$SHA" origin/main 2>/dev/null; then
  if git rev-parse --verify origin/main >/dev/null 2>&1; then
    warn "$(git rev-parse --short "$SHA") is not on origin/main."
    warn "jsDelivr serves from GitHub — push it before pasting, or the pins will 404."
  else
    warn "No origin/main to check against; run 'git fetch origin'."
  fi
fi

# --- The pinned files must exist at that commit ----------------------------
for f in "${PINNED[@]}"; do
  git cat-file -e "$SHA:$f" 2>/dev/null || die "$f does not exist at $(git rev-parse --short "$SHA")."
done

# --- Render ----------------------------------------------------------------
RENDER=$(cat <<'RENDER_PY'
import json, re, sys

sha = sys.argv[1]
block = open("head.html", encoding="utf-8").read()

# Strip the template comments first, so the {{SHA}} mentioned inside one of
# them cannot be substituted into the output.
block = re.sub(r"<!--.*?-->\n*", "", block, flags=re.S)
block = block.replace("{{SHA}}", sha)
if "{{SHA}}" in block:
    sys.exit("a {{SHA}} placeholder survived rendering.")

# Re-emit the JSON-LD with every non-ASCII character as a \\uXXXX escape.
#
# This paste travels through a clipboard and a web form, and that path has
# mangled UTF-8 before: on 6 Sep 2026 the two em dashes in the Analytics
# description reached the live site as CP1252 mojibake, having been decoded
# as the wrong charset somewhere in between. Bullet itself is fine -- the old
# footer paste carried the same character correctly for months -- but the
# journey is not. A \\u escape is plain ASCII, survives any re-encoding, and
# parses back to exactly the same string, so the failure cannot recur.
def ascii_json(m):
    try:
        data = json.loads(m.group(2))
    except json.JSONDecodeError as e:
        sys.exit(f"the JSON-LD in head.html does not parse: {e}")
    return m.group(1) + json.dumps(data, indent=2, ensure_ascii=True) + m.group(3)

block, n = re.subn(r"(<script type=\"application/ld\+json\">\n)(.*?)(\n</script>)",
                   ascii_json, block, flags=re.S)
if n != 1:
    sys.exit(f"expected exactly one JSON-LD block in head.html, found {n}.")

block = block.strip("\n") + "\n"
if not block.isascii():
    bad = sorted({c for c in block if not c.isascii()})
    sys.exit("non-ASCII survived rendering: " + " ".join(f"U+{ord(c):04X}" for c in bad))

sys.stdout.write(block)
RENDER_PY
)

BLOCK="$(python3 -c "$RENDER" "$SHA")" || die "could not render head.html (see above)."
printf '%s\n' "$BLOCK"

if command -v pbcopy >/dev/null 2>&1; then
  printf '%s\n' "$BLOCK" | pbcopy
  printf '\n\033[32m✓\033[0m  copied to clipboard — pin %s\n' "$(git rev-parse --short "$SHA")" >&2
else
  printf '\n\033[33m·\033[0m  no pbcopy; copy the block above by hand\n' >&2
fi

printf '   paste into Bullet -> Settings -> Custom Code -> Head (replace everything),\n' >&2
printf '   then run: scripts/verify-live.py %s\n' "$(git rev-parse --short "$SHA")" >&2
