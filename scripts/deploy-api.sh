#!/usr/bin/env bash
#
# Deploy / refresh BOTH language editions of the API on the VPS.
#
# Run from anywhere on the VPS:
#     bash scripts/deploy-api.sh
#
# Prereqs (one-time, see docs/deploy-backend.md):
#   - apps/api/.env.bn and apps/api/.env.en exist and are filled in
#   - both databases exist and PM2 is installed
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$REPO_ROOT/apps/api"

echo "==> Pulling latest code"
git -C "$REPO_ROOT" pull --ff-only

echo "==> Installing dependencies"
( cd "$REPO_ROOT" && npm install )

echo "==> Building the API"
( cd "$REPO_ROOT" && npm run build -w @sports/api )

for f in .env.bn .env.en; do
  if [[ ! -f "$API_DIR/$f" ]]; then
    echo "ERROR: missing $API_DIR/$f — copy from $f.example and fill it in." >&2
    exit 1
  fi
done

echo "==> Running migrations on the Bangla database"
( cd "$API_DIR" && set -a && . ./.env.bn && set +a && npx prisma migrate deploy )

echo "==> Running migrations on the English database"
( cd "$API_DIR" && set -a && . ./.env.en && set +a && npx prisma migrate deploy )

echo "==> (Re)starting both API processes with PM2"
pm2 startOrReload "$API_DIR/ecosystem.config.js" --update-env
pm2 save

echo "==> Done. Status:"
pm2 status
