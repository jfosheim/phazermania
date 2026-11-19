#!/bin/sh
# Downloads every exploded diagram named in data/diagrams.js into data/diagrams/.
#
# The CDN path is derivable from the filename: the third path segment is the
# first character of the hash after the dash.
#   MjIxMDc0MQ-67fa1fb5.png -> https://cdn.partzilla.com/MTE/d/6/MjIxMDc0MQ-67fa1fb5.png
#
# Safe to re-run: files already on disk are skipped, so an interrupted run resumes.
set -e
cd "$(dirname "$0")/.."
mkdir -p data/diagrams

names=$(grep -o '[A-Za-z0-9_]*-[0-9a-f]\{8\}\.png' data/diagrams.js | sort -u)
total=$(printf '%s\n' "$names" | grep -c . || true)
echo "$total unique diagrams referenced"

i=0; got=0; skip=0; fail=0
for f in $names; do
  i=$((i + 1))
  if [ -s "data/diagrams/$f" ]; then
    skip=$((skip + 1))
    continue
  fi
  hash=${f#*-}          # 67fa1fb5.png
  d=$(printf '%s' "$hash" | cut -c1)
  url="https://cdn.partzilla.com/MTE/d/$d/$f"
  if curl -sS -f --retry 2 --max-time 30 -o "data/diagrams/$f.part" "$url" 2>/dev/null; then
    mv "data/diagrams/$f.part" "data/diagrams/$f"
    got=$((got + 1))
  else
    rm -f "data/diagrams/$f.part"
    fail=$((fail + 1))
    echo "  FAILED $f"
  fi
  if [ $((i % 50)) -eq 0 ]; then echo "  $i/$total ..."; fi
done

echo "downloaded=$got skipped=$skip failed=$fail"
du -sh data/diagrams 2>/dev/null || true
