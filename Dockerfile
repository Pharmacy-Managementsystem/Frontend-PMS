# Multi-stage build for production-ready React/Vite application

# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME="Pharmacy Management System"
ARG VITE_APP_VERSION=1.0.0

# Set environment variables for build time
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_URL=${VITE_API_BASE_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}

RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

# Install curl for healthcheck and serve
RUN apk add --no-cache curl && \
    npm i -g serve

WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

CMD ["serve", "-s", "dist"]
