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
# Strip the template's HTML comments first, so the SHA note inside them cannot
# be substituted into the output, then fill in the pins.
BLOCK="$(
  perl -0777 -pe 's/<!--.*?-->\n*//gs' head.html \
    | perl -0777 -pe 's/\{\{SHA\}\}/'"$SHA"'/g' \
    | perl -0777 -pe 's/\A\n+//; s/\n+\z/\n/'
)"

grep -q '{{SHA}}' <<<"$BLOCK" && die "a {{SHA}} placeholder survived rendering."

printf '%s\n' "$BLOCK"

if command -v pbcopy >/dev/null 2>&1; then
  printf '%s\n' "$BLOCK" | pbcopy
  printf '\n\033[32m✓\033[0m  copied to clipboard — pin %s\n' "$(git rev-parse --short "$SHA")" >&2
else
  printf '\n\033[33m·\033[0m  no pbcopy; copy the block above by hand\n' >&2
fi

printf '   paste into Bullet -> Settings -> Custom Code -> Head (replace everything),\n' >&2
printf '   then run: scripts/verify-live.py %s\n' "$(git rev-parse --short "$SHA")" >&2
