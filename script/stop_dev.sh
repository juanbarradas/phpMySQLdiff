#!/usr/bin/env bash
# =============================================================================
#  stop_dev.sh — Stop MySQL Schema Diff development servers
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMP_DIR="$SCRIPT_DIR/temp"
mkdir -p "$TEMP_DIR"

echo "Stopping development services..."

# 1. Kill by PID files
for svc in "backend" "frontend"; do
    PID_FILE="$TEMP_DIR/$svc.pid"
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "Stopping $svc (PID $PID)..."
            kill "$PID" || kill -9 "$PID"
        else
            echo "$svc PID $PID is not running."
        fi
        rm -f "$PID_FILE"
    fi
done

# 2. Port cleanup fallback (in case terminal was closed or PIDs lost)
# Port 8000 for backend, Port 4200 for frontend
for port in 8000 4200; do
    if command -v lsof >/dev/null 2>&1; then
        PIDS=$(lsof -t -i :$port 2>/dev/null || true)
        if [ -n "$PIDS" ]; then
            echo "Port $port is active. Killing process(es): $PIDS"
            kill $PIDS 2>/dev/null || kill -9 $PIDS 2>/dev/null
        fi
    elif command -v fuser >/dev/null 2>&1; then
        fuser -k ${port}/tcp >/dev/null 2>&1 || true
    fi
done

echo "Development services stopped successfully."
