# Build stage
FROM node:20-slim AS build

WORKDIR /app

# Copy package management files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Default to building the production bundle, but allow overriding
# ARG BUILD_CMD="npm run build"
# RUN ${BUILD_CMD}

# Production server stage
FROM nginx:alpine

# Copy the nginx config we created
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the build stage to nginx's serving directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (Railway will map the PORT env var to this)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
