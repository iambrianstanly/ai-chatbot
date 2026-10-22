# Multi-stage image for the React UI and FastAPI.
# Build a specific target: --target backend | --target frontend
# Or run both with: docker compose up --build

# ---------------------------------------------------------------------------
# Frontend build (Vite + React)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS frontend-build
WORKDIR /ui

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ---------------------------------------------------------------------------
# Frontend runtime (nginx)
# React app calls http://localhost:8000, so publish the backend on host port 8000.
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS frontend
COPY --from=frontend-build /ui/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# ---------------------------------------------------------------------------
# Backend runtime (FastAPI + Uvicorn)
# ---------------------------------------------------------------------------
FROM python:3.12-slim-bookworm AS backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

COPY backend/ ./

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
