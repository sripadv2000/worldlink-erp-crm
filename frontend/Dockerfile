# Build stage
FROM node:20.9.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments
ARG VITE_BACKEND_SERVER
ARG VITE_FILE_BASE_URL

# Set environment variables for build
ENV VITE_BACKEND_SERVER=${VITE_BACKEND_SERVER}
ENV VITE_FILE_BASE_URL=${VITE_FILE_BASE_URL}

# Build the application
RUN npm run build

# Production stage
FROM nginx:1.25-alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx directly (no entrypoint script needed)
CMD ["nginx", "-g", "daemon off;"]