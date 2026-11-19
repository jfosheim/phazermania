#!/bin/sh
# Fetch Yamaha parts fiches from richsyamaha.com.
#
# Why this source: it serves every section (38 for a 1990 Phazer II, against the
# 16 our Partzilla scraper was told to collect), it answers a plain curl without
# the 403 Partzilla returns, and its model slugs are identical to Partzilla's, so
# models map one-to-one with data/parts.js.
#
# The fiche itself is a CSS background image with a completely predictable URL:
#   https://cdpcdn.dx1app.com/fiche-section-images/<section-uuid>.gif
# and <section-uuid> is the last path segment of the section page URL.
#
# Two passes so we stay polite: harvest every section UUID from the 30 model
# pages first, then download only the UUIDs we have not already got. Both passes
# resume, so re-running after an interruption costs almost nothing.
#
# Output:
#   data/diagrams-richs/<uuid>.gif   the fiches
#   data/richs-index.tsv             model<TAB>section<TAB>uuid
#
# These are Yamaha's copyrighted illustrations, carrying a dealer watermark.
# They stay local: the build deliberately keeps them out of the shared artifact.

set -e
cd "$(dirname "$0")/.."

OUT=data/diagrams-richs
IDX=data/richs-index.tsv
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
BASE=https://www.richsyamaha.com/Parts/Parts-Diagrams/yamaha/snowmobiles
CDN=https://cdpcdn.dx1app.com/fiche-section-images

mkdir -p "$OUT"

# ---- pass 1: harvest section UUIDs -------------------------------------------
# Model slugs come straight from specs.json so the two data sets cannot drift.
# Match only slugs (they always contain a "/"), or the meta block's prose value
# for the same key gets picked up and fetched as if it were a model.
MODELS=$(grep -oE '"partzilla": "[0-9]{4}/[^"]+"' data/specs.json | sed 's/.*: "//;s/"//')
TOTAL=$(printf '%s\n' "$MODELS" | wc -l)

# The two sites agree on slugs everywhere except here, where Partzilla uses the
# bare model code and Rich's spells the model out.
richs_slug() {
  case "$1" in
    vt480s) echo venture-xl-vt480s ;;
    *)      echo "$1" ;;
  esac
}

if [ -s "$IDX" ]; then
  echo "index exists ($(wc -l < "$IDX") rows) - delete $IDX to re-harvest"
else
  : > "$IDX"
  n=0
  for m in $MODELS; do
    n=$((n + 1))
    year=${m%%/*}
    slug=$(richs_slug "${m#*/}")
    printf '  [%2d/%2d] %s ... ' "$n" "$TOTAL" "$slug"
    page=$(curl -sS -f -A "$UA" --max-time 60 "$BASE/$year/$slug" 2>/dev/null) || {
      echo "FAILED"; continue; }
    # Section links look like .../<slug>/<section>/<uuid>; keep section + uuid.
    echo "$page" \
      | grep -oE "$slug/[a-z0-9-]+/[0-9a-f]{8}-[0-9a-f-]{27}" \
      | sort -u \
      | sed "s|^$slug/||" \
      | awk -v M="$m" -F/ '{print M "\t" $1 "\t" $2}' >> "$IDX"
    echo "$(grep -c "^$m	" "$IDX") sections"
    sleep 1
  done
fi

# ---- pass 2: download unique fiches ------------------------------------------
UUIDS=$(cut -f3 "$IDX" | sort -u)
TOTAL=$(printf '%s\n' "$UUIDS" | wc -l)
echo "unique fiches: $TOTAL"

n=0; got=0; skip=0; fail=0
for u in $UUIDS; do
  n=$((n + 1))
  f="$OUT/$u.gif"
  if [ -s "$f" ]; then skip=$((skip + 1)); continue; fi
  if curl -sS -f -A "$UA" --max-time 60 -o "$f" "$CDN/$u.gif" 2>/dev/null; then
    got=$((got + 1))
  else
    rm -f "$f"; fail=$((fail + 1))
  fi
  [ $((n % 25)) -eq 0 ] && echo "  $n/$TOTAL (new $got, had $skip, failed $fail)"
  sleep 0.3
done

echo
echo "fiches:   $(ls "$OUT" | wc -l) files, $(du -sh "$OUT" | cut -f1)"
echo "index:    $(wc -l < "$IDX") rows, $(cut -f2 "$IDX" | sort -u | wc -l) distinct sections"
echo "new $got / already had $skip / failed $fail"
