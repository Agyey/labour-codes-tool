FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libatomic1 \
    build-essential \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and Prisma schema
COPY . .

# Generate Prisma client
RUN prisma generate --schema=schema.prisma

# Uvicorn will listen on the port provided by Railway
CMD ["sh", "-c", "prisma db push --schema=schema.prisma && uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8001}"]
