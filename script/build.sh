#!/usr/bin/env bash
# =============================================================================
#  build.sh — Build MySQL Schema Diff Tool and deploy to /build
# =============================================================================
set -euo pipefail

# ── Resolve project root (one level up from /script) ─────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"
BUILD_DIR="$ROOT_DIR/build"
BUILD_PHP_DIR="$BUILD_DIR/compare_php"

echo "============================================================"
echo "  MySQL Schema Diff — Build Script"
echo "  Root     : $ROOT_DIR"
echo "  Build to : $BUILD_DIR"
echo "============================================================"

# ── 1. Clean previous build ───────────────────────────────────────────────────
echo ""
echo "[1/4] Cleaning previous build..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR" "$BUILD_PHP_DIR"

# ── 2. Build Angular frontend ─────────────────────────────────────────────────
echo ""
echo "[2/4] Building Angular frontend (base-href=/mysqlcompare/)..."
cd "$FRONTEND_DIR"
npm run build -- --base-href /mysqlcompare/

# Angular 17+ outputs to dist/<project-name>/browser
DIST_DIR="$FRONTEND_DIR/dist/mysql-diff-tool/browser"
if [ ! -d "$DIST_DIR" ]; then
  DIST_DIR="$FRONTEND_DIR/dist/mysql-diff-tool"
fi

echo "      Copying Angular build from $DIST_DIR..."
cp -r "$DIST_DIR/." "$BUILD_DIR/"
echo "      Angular build complete."

# ── 3. Copy PHP backend ───────────────────────────────────────────────────────
echo ""
echo "[3/4] Copying PHP backend to $BUILD_PHP_DIR..."
rsync -av --exclude='.gitkeep' \
    "$BACKEND_DIR/" "$BUILD_PHP_DIR/"

# Ensure history directory exists in build (SQLite will be created at runtime)
mkdir -p "$BUILD_PHP_DIR/history"
touch    "$BUILD_PHP_DIR/history/.gitkeep"

echo "      Backend copy complete."

# ── 4. Summary ────────────────────────────────────────────────────────────────
echo ""
echo "[4/4] Build summary:"
echo "      Frontend : $BUILD_DIR  (serve at http://yourserver/mysqlcompare/)"
echo "      Backend  : $BUILD_PHP_DIR  (available at http://yourserver/mysqlcompare/compare_php/)"
echo ""
echo "============================================================"
echo "  Deploy Instructions:"
echo "  1. Copy contents of $BUILD_DIR to your web root /mysqlcompare/"
echo "  2. Ensure PHP 8.1+ with pdo_mysql and pdo_sqlite extensions"
echo "  3. Enable mod_rewrite for Apache (AllowOverride All)"
echo "  4. Adjust $BUILD_PHP_DIR/.env_cfg as needed"
echo "============================================================"
echo "  Done!"
