#!/usr/bin/env bash
# Start a new Angular product from this repo's full layered skeleton.
#
#   tools/new-app.sh billing-web ~/Documents/projects/billing-web
#
# Copies the committed tree (git archive HEAD), so the new product keeps AGENTS.md,
# CLAUDE.md, tools/ (scaffolding + hook + arch-check), the Jenkinsfile and the arch-qube gate.
# `ng new` plus a few copied src/app folders loses all of that (AGENTS.md §1).
#
# No --no-demo option: the template has no demo-only module. The Users feature is the worked
# example tools/new-feature.sh anchors on (app.config.ts providers, repository tokens), and the
# layout (sidebar, NavGraphService, offline sync, IndexedDB) is built around it; Home is the
# landing route. Remove them in the product through app.routes.ts / app.config.ts when unneeded.
set -euo pipefail

[ $# -eq 2 ] || { echo "usage: $0 <app-name> <dest-dir>" >&2; exit 1; }
APP="$1"
DEST="$2"
[[ "$APP" =~ ^[a-z][a-z0-9]*(-[a-z0-9]+)*$ ]] || { echo "app-name: lower-case letters/digits, words joined by '-' (it becomes the npm package, angular project, image and CI names)" >&2; exit 1; }
[[ "$APP" =~ ^(arcana|arcana-angular|angular-app)$ ]] && { echo "app-name must differ from the template's own names" >&2; exit 1; }
[ ! -e "$DEST" ] || { echo "$DEST already exists — refusing to overwrite" >&2; exit 1; }
command -v perl >/dev/null || { echo "perl is required" >&2; exit 1; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
git -C "$ROOT" diff --quiet HEAD -- AGENTS.md tools/ || echo "note: uncommitted changes in AGENTS.md/tools are NOT copied (git archive HEAD)" >&2

mkdir -p "$DEST"
git -C "$ROOT" archive HEAD | tar -x -C "$DEST"
SRC_SHA="$(git -C "$ROOT" rev-parse --short HEAD)"
cd "$DEST"

# ---- Product identity. Every place the template name is load-bearing:
#  1. npm package + angular.json project "arcana-angular" (=> dist/<name>/browser copied by
#     Dockerfile.ci, coverage/<name>/lcov.info read by Sonar), Sonar projectName.
#  2. Jenkins APP_NAME / image / Sonar key "angular-app" (docker-compose.ci.yml image too).
#  3. Per-host CI container names angular-test-* and arcana-arch-qube-angular-*: two products
#     on one Jenkins daemon must not `docker rm -f` each other's containers.
#  4. The arch-qube metrics project name and the <title> in src/index.html.
# Not renamed on purpose: the component selector prefix `app` (generic, not an identity),
# arcana.boo (registry / arch-qube image host). tools/ is excluded: these scripts describe the
# template and must keep working in the product.
TEXT_FILES="$(grep -rIl -e arcana-angular -e angular-app -e angular-test- -e "Arcana Angular" . --exclude-dir=.git --exclude-dir=tools --exclude=CHANGELOG.md --exclude=package-lock.json || true)"
printf '%s\n' "$TEXT_FILES" package-lock.json | xargs perl -pi -e "
    s/arcana-arch-qube-angular-/${APP}-arch-qube-/g;
    s/\\bangular-test-/${APP}-test-/g;
    s/\\barcana-angular\\b/${APP}/g;
    s/\\bangular-app\\b/${APP}/g;
    s/Arcana Angular/${APP}/g;
"
LEFT="$(grep -rInE --exclude-dir=.git --exclude-dir=tools --exclude=CHANGELOG.md 'arcana-angular|\bangular-app\b|angular-test-|arcana-arch-qube-angular|Arcana Angular' . || true)"
if [ -n "$LEFT" ]; then
    echo "new-app: template identities still present after rename:" >&2
    printf '%s\n' "$LEFT" | head >&2
    exit 1
fi

# ---- Fresh history: version 0.1.0, empty changelog.
rm -f CHANGELOG.md
printf '{\n  ".": "0.1.0"\n}\n' > .release-please-manifest.json
perl -0pi -e "s/(\"name\": \"${APP}\",\n\\s*\"version\": \")[^\"]+\"/\${1}0.1.0\"/g" package.json package-lock.json

cat >> AGENTS.md <<EOT

## Origin

Created from arcana-angular @ \`${SRC_SHA}\` by \`tools/new-app.sh\` (package, angular project,
image, CI container and Sonar names renamed to \`${APP}\`). The layers, rules and definition of
done above apply unchanged. Remove template features you do not need through
\`src/app/app.routes.ts\` and \`src/app/app.config.ts\`, not by flattening.
EOT

git init -q
tools/install-hooks.sh >/dev/null
git add -A
# --no-verify only for this import commit: every file counts as "added" here, so the hook
# would judge the template's own root files (src/app/app.ts, app.config.ts, app.routes.ts…)
# as new flat files. The template itself passes arch-check; every later commit in the
# product goes through the hook.
git -c user.name="${GIT_AUTHOR_NAME:-new-app}" -c user.email="${GIT_AUTHOR_EMAIL:-new-app@localhost}" \
    commit -q --no-verify -m "chore: start ${APP} from arcana-angular ${SRC_SHA}"

echo "created $DEST (${APP}) from arcana-angular ${SRC_SHA}; hooks: $(git config core.hooksPath)"
echo "next: cd $DEST && npm ci --legacy-peer-deps && tools/new-feature.sh <Name>"
