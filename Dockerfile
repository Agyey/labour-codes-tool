# Combine Frontend and Backend into a single Railway Service

# --- Stage 1: Frontend Build ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# --- Stage 2: Backend Build ---
FROM python:3.10-slim AS backend-builder
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend ./

# --- Stage 3: Final Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

# Install Python and dependencies in the runner
RUN apk add --no-cache python3 py3-pip supervisor

# Copy Frontend Standalone and Static Files
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public

# Copy Backend
COPY --from=backend-builder /app/backend ./backend
RUN pip install --no-cache-dir fastapi uvicorn sqlalchemy psycopg2-binary pydantic alembic

# Supervisor Configuration to run both
COPY supervisord.conf /etc/supervisord.conf

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV BACKEND_PORT=8000

EXPOSE 3000

# Start both services via Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
