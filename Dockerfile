# Simple single-stage Dockerfile for GrokForge AI Hub
# Usage: docker build -f Dockerfile.simple -t grokforge-app:simple .

FROM oven/bun:1.3.3-alpine

WORKDIR /app

# Create non-root user first (before copying files to avoid chown overhead)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bunjs -u 1001

# Install timeout utility for build step protection
RUN apk add --no-cache coreutils

# Copy package files and install dependencies (with ownership)
# Note: Not using --production because Bun needs all dependencies for runtime compilation
COPY --chown=bunjs:nodejs package.json bun.lock ./
# Install with timeout protection (30 minutes = 1800 seconds)
# This prevents indefinite hangs during network operations
RUN timeout 1800 bun install --frozen-lockfile --verbose || \
    (echo "First attempt timed out or failed, retrying..." && \
     sleep 10 && \
     timeout 1800 bun install --frozen-lockfile --verbose) 

# Copy all source files (with ownership set directly - much faster than chown -R)
COPY --chown=bunjs:nodejs . .

# Install wget for healthcheck
RUN apk add --no-cache wget

USER bunjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["bun", "run", "start"]

