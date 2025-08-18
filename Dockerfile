# # ---- Frontend build stage ----
# FROM node:20-alpine AS frontend

# WORKDIR /frontend

# COPY package.json package-lock.json ./
# RUN npm ci --no-audit --no-fund

# COPY src ./src
# COPY index.html ./
# COPY vite.config.js ./vite.config.js
# COPY tailwind.config.js ./tailwind.config.js
# COPY postcss.config.js ./postcss.config.js
# COPY public ./public
# RUN npm run build

# # ---- Backend runtime stage ----
# FROM python:3.11-slim AS backend


# ENV PYTHONDONTWRITEBYTECODE=1 \
#     PYTHONUNBUFFERED=1 \
#     PIP_NO_CACHE_DIR=1 \
#     PORT=8080

# WORKDIR /app

# RUN apt-get update \
#     && apt-get install -y --no-install-recommends \
#         libgomp1 \
#         ca-certificates \
#     && rm -rf /var/lib/apt/lists/*

# COPY backend/requirements.txt /tmp/requirements.txt
# RUN pip install --no-cache-dir -r /tmp/requirements.txt

# COPY backend/ /app/

# RUN mkdir -p /app/static
# COPY --from=frontend /frontend/dist/ /app/static/

# COPY backend/docker-entrypoint.sh /app/entrypoint.sh
# RUN chmod +x /app/entrypoint.sh

# EXPOSE 8080

# # --- API & Backend ENV settings (overridable at runtime) ---
# # API keys and secrets; values are empty, overridable with docker run -e ...
# ENV ADOBE_EMBED_API_KEY="" \
#     LLM_PROVIDER="" \
#     OLLAMA_MODEL="" \
#     TTS_PROVIDER="" \
#     FLASK_ENV="development" \
#     SECRET_KEY="" \
#     GEMINI_API_KEY="" \
#     GEMINI_MODEL="" \
#     AZURE_TTS_KEY="" \
#     AZURE_TTS_REGION=""

# CMD ["/bin/sh", "/app/entrypoint.sh"]
# ///////////////////////////////////////////////////////////////////
# ---- Frontend build stage ----
FROM node:20-alpine AS frontend

WORKDIR /frontend

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY src ./src
COPY index.html ./
COPY vite.config.js ./vite.config.js
COPY tailwind.config.js ./tailwind.config.js
COPY postcss.config.js ./postcss.config.js
COPY public ./public
RUN npm run build

# ---- Backend runtime stage ----
FROM python:3.11-slim-bullseye AS backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8080

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    ca-certificates \
    libssl1.1 \
    libasound2 \
    libpulse0 \
    libffi7 \
    pulseaudio \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY backend/ /app/

RUN mkdir -p /app/static
COPY --from=frontend /frontend/dist/ /app/static/

COPY backend/docker-entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8080

# --- API & Backend ENV settings (overridable at runtime) ---
ENV ADOBE_EMBED_API_KEY="" \
    LLM_PROVIDER="" \
    OLLAMA_MODEL="" \
    TTS_PROVIDER="" \
    FLASK_ENV="development" \
    SECRET_KEY="" \
    GEMINI_API_KEY="" \
    GEMINI_MODEL="" \
    AZURE_TTS_KEY="" \
    AZURE_TTS_REGION=""

CMD ["/bin/sh", "/app/entrypoint.sh"]
