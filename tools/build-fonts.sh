#!/usr/bin/env bash
# =============================================================================
# londre.ge — FiraGO web font build
#
# FiraGO (SIL OFL, bBox Type) is the only open superfamily that draws Latin and
# Georgian as one design. That is the whole point: the EN/GE switch changes the
# language, never the typeface.
#
# The shipped woff2 files are ~250 KB each because they also carry Arabic,
# Devanagari, Hebrew, Thai, Cyrillic and Greek. None of that is used here, so we
# subset. Two slices per weight, split by script with unicode-range, so an
# English visitor never downloads Georgian outlines and vice versa.
#
# Not run at deploy time. Run it only when the font needs rebuilding, then
# commit assets/fonts/. Exclude tools/ when uploading the site.
#
#   ./tools/build-fonts.sh
#
# Requires: python3, and fonttools + brotli (installed into a local venv below).
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/assets/fonts"
WORK="$ROOT/_fontsrc"          # gitignored scratch
VENV="$WORK/venv"

UPSTREAM="https://raw.githubusercontent.com/bBoxType/FiraGO/master/Fonts/FiraGO_TTF_1001/Roman"

# weight-name:css-weight — 400 body, 500 nav/labels, 600 headings.
WEIGHTS=("Regular:400" "Medium:500" "SemiBold:600")

# --- unicode slices -----------------------------------------------------------
# The site uses 114 distinct codepoints today (verified by scanning the HTML).
# We subset to ranges rather than that exact set, so ordinary copy edits later
# do not silently produce tofu.
#
# Latin-1 covers © · × and the accented characters. The rest is the punctuation
# actually in use plus the arrow the buttons draw via CSS content.
LATIN="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,\
U+2000-200D,U+2010-2015,U+2018-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,\
U+2044,U+20AC,U+20BE,U+2122,U+2190-2193,U+2212,U+FEFF,U+FFFD"

# Georgian: Mkhedruli only. FiraGO ships no Mtavruli (U+1C90-1CBF) or
# Asomtavruli (U+10A0-10CF), and the site uses neither — verified. Georgian is
# caseless in Mkhedruli, so the uppercase labels simply stay as drawn.
GEORGIAN="U+10D0-10FF"

FEATURES='kern,liga,clig,calt,tnum,ccmp,mark,mkmk'

# --- toolchain ----------------------------------------------------------------
mkdir -p "$OUT" "$WORK"
if [ ! -x "$VENV/bin/pyftsubset" ]; then
  echo "→ setting up fonttools venv"
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install --quiet --upgrade pip
  "$VENV/bin/pip" install --quiet fonttools brotli
fi

# --- fetch --------------------------------------------------------------------
for entry in "${WEIGHTS[@]}"; do
  name="${entry%%:*}"
  if [ ! -f "$WORK/FiraGO-$name.ttf" ]; then
    echo "→ fetching FiraGO-$name.ttf"
    curl -sSL --fail --max-time 120 -o "$WORK/FiraGO-$name.ttf" "$UPSTREAM/FiraGO-$name.ttf"
  fi
done

# --- subset -------------------------------------------------------------------
echo
printf '%-30s %10s\n' "file" "size"
printf '%-30s %10s\n' "------------------------------" "----------"
total=0
for entry in "${WEIGHTS[@]}"; do
  name="${entry%%:*}"; css="${entry##*:}"
  for slice in latin georgian; do
    [ "$slice" = latin ] && ranges="$LATIN" || ranges="$GEORGIAN"
    dest="$OUT/firago-$css-$slice.woff2"
    "$VENV/bin/pyftsubset" "$WORK/FiraGO-$name.ttf" \
      --flavor=woff2 \
      --output-file="$dest" \
      --unicodes="$ranges" \
      --layout-features="$FEATURES" \
      --desubroutinize \
      --drop-tables+=DSIG \
      --no-hinting \
      --name-IDs='' \
      --notdef-outline
    size=$(stat -f%z "$dest" 2>/dev/null || stat -c%s "$dest")
    total=$((total + size))
    printf '%-30s %7.1f KB\n' "$(basename "$dest")" "$(echo "$size/1024" | bc -l)"
  done
done
printf '%-30s %7.1f KB\n' "TOTAL (all six)" "$(echo "$total/1024" | bc -l)"
echo
echo "Per visitor: 3 latin slices (EN) or 3 latin + 3 georgian (GE)."
