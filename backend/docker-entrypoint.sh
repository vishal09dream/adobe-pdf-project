#!/bin/sh
set -e

# Where the built frontend is located
STATIC_DIR="/app/static"
INDEX_HTML="$STATIC_DIR/index.html"
ENV_JS="$STATIC_DIR/env.js"

# Ensure static and storage directories exist
mkdir -p "$STATIC_DIR"
mkdir -p /app/storage /app/storage/audio

# Write runtime env vars for frontend consumption
cat > "$ENV_JS" <<EOF
window.__APP_CONFIG__ = {
  ADOBE_EMBED_API_KEY: "${ADOBE_EMBED_API_KEY:-}",
  LLM_PROVIDER: "${LLM_PROVIDER:-}",
  OLLAMA_MODEL: "${OLLAMA_MODEL:-}",
  TTS_PROVIDER: "${TTS_PROVIDER:-}"
};
EOF

# Inject env.js into built index.html if not already present
if [ -f "$INDEX_HTML" ]; then
  if ! grep -q "/env.js" "$INDEX_HTML"; then
    # insert before closing </head>
    tmpfile=$(mktemp)
    awk '{print} /<\/head>/{print "    <script src=\"/env.js\"></script>"} ' "$INDEX_HTML" > "$tmpfile" && mv "$tmpfile" "$INDEX_HTML"
  fi
fi

# Start the Flask server
exec python /app/app.py