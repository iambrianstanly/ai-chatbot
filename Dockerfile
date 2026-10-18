# Multi-stage image for the Angular UI and Django API.
# Build a specific target: --target backend | --target frontend
# Or run both with: docker compose up --build

# ---------------------------------------------------------------------------
# Frontend build
# ---------------------------------------------------------------------------
FROM node:22-alpine AS frontend-build
WORKDIR /ui

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ---------------------------------------------------------------------------
# Frontend runtime (nginx)
# Angular calls http://localhost:8000, so publish the backend on host port 8000.
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS frontend
COPY --from=frontend-build /ui/dist/chatbot-ui/browser /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# ---------------------------------------------------------------------------
# Backend runtime (Django + Gunicorn)
# ---------------------------------------------------------------------------
FROM python:3.12-slim-bookworm AS backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    DJANGO_SETTINGS_MODULE=app.settings

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

COPY backend/ ./
RUN mkdir -p /data

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn app.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120"]
