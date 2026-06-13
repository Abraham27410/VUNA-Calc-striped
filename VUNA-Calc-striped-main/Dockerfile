# Dockerfile for VUNA Calculator
# Multi-stage build for optimal size and performance

# Build stage - for linting and testing
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Run linting and tests
RUN npm run lint
RUN npm test

# Production stage
FROM nginx:1.25-alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy application files from builder stage
COPY --from=builder /app/index.html /usr/share/nginx/html/
COPY --from=builder /app/calculator/ /usr/share/nginx/html/calculator/
COPY --from=builder /app/.gitignore /usr/share/nginx/html/

# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]