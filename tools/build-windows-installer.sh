#!/usr/bin/env bash
# Builds PowerPrezTools-Setup.exe (NSIS) at the repo root.
# Requires makensis. Generates the production manifest first so the
# installer embeds the correct GitHub Pages URLs.
set -euo pipefail

cd "$(dirname "$0")/.."

VERSION="$(node -p "require('./package.json').version")"
BASE="${VERSION%%-*}"
IFS=. read -r MA MI PA <<<"$BASE"
VIPRODUCT="${MA:-0}.${MI:-0}.${PA:-0}.0"

npm run manifest:prod

makensis \
  -DVERSION="$VERSION" \
  -DVIPRODUCT="$VIPRODUCT" \
  -DMANIFESTSRC="$PWD/manifest.prod.xml" \
  -DOUTFILE="$PWD/PowerPrezTools-Setup.exe" \
  installer/windows/power-prez-tools.nsi

echo "Built $PWD/PowerPrezTools-Setup.exe (version $VERSION)"
