# Combine Frontend and Backend into a single Railway Service

# --- Stage 1: Frontend Build ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci
COPY frontend ./frontend
RUN cd frontend && npm run build

# --- Stage 2: Backend Build ---
FROM python:3.10-slim AS backend-builder
WORKDIR /app
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend ./backend

# --- Stage 3: Final Runner ---
FROM nikolaik/python-nodejs:python3.10-nodejs20-alpine AS runner
WORKDIR /app

# Install supervisor and PostgreSQL binary dependencies
RUN apk add --no-cache supervisor libpq

# Copy Frontend Standalone - This folder includes its own node_modules
# In monorepo, it mirrors the path: /app/frontend/.next/standalone/frontend/server.js
COPY --from=frontend-builder /app/frontend/.next/standalone ./
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public

# Copy Backend and Install Dependencies
COPY --from=backend-builder /app/backend ./backend
RUN pip install --no-cache-dir fastapi uvicorn sqlalchemy psycopg2-binary pydantic alembic

# Supervisor Configuration to run both
COPY supervisord.conf /etc/supervisord.conf

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV BACKEND_PORT=8000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# Start both services via Supervisor
# We run from /app, and next standalone is copied here.
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
