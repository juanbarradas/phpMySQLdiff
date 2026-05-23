#!/usr/bin/env bash
# =============================================================================
#  start_dev.sh — Start MySQL Schema Diff development servers (backend & frontend)
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMP_DIR="$SCRIPT_DIR/temp"
mkdir -p "$TEMP_DIR"

# 1. Stop any running dev services first
"$SCRIPT_DIR/stop_dev.sh"

echo ""
echo "Starting development servers..."

# 2. Start PHP backend development server (port 8000)
# We run from the backend directory and use index.php as the router
echo "Starting backend PHP dev server on http://127.0.0.1:8000..."
cd "$ROOT_DIR/backend"
php -S 127.0.0.1:8000 index.php > "$TEMP_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" > "$TEMP_DIR/backend.pid"

# 3. Start Angular frontend development server (port 4200)
# We pass the proxy configuration to route /mysqlcompare/compare_php/ to http://127.0.0.1:8000
echo "Starting frontend Angular dev server on http://localhost:4200..."
cd "$ROOT_DIR/frontend"

# Make sure proxy.conf.json exists
PROXY_CONF="$ROOT_DIR/frontend/proxy.conf.json"
if [ ! -f "$PROXY_CONF" ]; then
    echo "Creating frontend proxy configuration..."
    cat << 'EOF' > "$PROXY_CONF"
{
  "/mysqlcompare/compare_php": {
    "target": "http://127.0.0.1:8000",
    "secure": false,
    "changeOrigin": true
  }
}
EOF
fi

# Run angular server using proxy
npm run start -- --proxy-config proxy.conf.json --serve-path /mysqlcompare/ > "$TEMP_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" > "$TEMP_DIR/frontend.pid"

echo ""
echo "Development servers are starting up in the background!"
echo "- Frontend: http://localhost:4200/mysqlcompare/"
echo "- Backend API proxied to http://127.0.0.1:8000/"
echo ""
echo "To view logs:"
echo "  Tail backend:  tail -f $TEMP_DIR/backend.log"
echo "  Tail frontend: tail -f $TEMP_DIR/frontend.log"
echo "To stop servers:"
echo "  Run: ./script/stop_dev.sh"
