# Simple single-stage Dockerfile for GrokForge AI Hub
# Usage: docker build -f Dockerfile.simple -t grokforge-app:simple .

FROM oven/bun:1.3.3-alpine

WORKDIR /app

# Create non-root user first (before copying files to avoid chown overhead)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bunjs -u 1001

# Copy package files and install dependencies (with ownership)
# Note: Not using --production because Bun needs all dependencies for runtime compilation
COPY --chown=bunjs:nodejs package.json bun.lock ./
# Install dependencies with CPU throttling to prevent system overload
# Use nice to lower priority and limit CPU usage
# Install nice utility first
RUN apk add --no-cache util-linux
# Install with CPU throttling and better error handling
RUN echo "Starting bun install with CPU throttling..." && \
    echo "Disk space:" && df -h / && \
    echo "CPU cores:" && nproc && \
    # Use nice to lower priority (19 = lowest, prevents CPU spike)
    # Limit to 50% CPU usage by running with lower priority
    nice -n 19 bun install --frozen-lockfile 2>&1 | tee /tmp/install.log || \
    (echo "=== First install attempt failed ===" && \
     echo "Last 50 lines of install log:" && \
     tail -50 /tmp/install.log && \
     echo "Retrying in 10 seconds with even lower priority..." && \
     sleep 10 && \
     nice -n 19 bun install --frozen-lockfile 2>&1 | tee /tmp/install-retry.log || \
     (echo "=== Second install attempt also failed ===" && \
      echo "Last 50 lines of retry log:" && \
      tail -50 /tmp/install-retry.log && \
      echo "Checking network connectivity..." && \
      (ping -c 3 registry.npmjs.org || echo "Network check failed") && \
      exit 1)) 

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

