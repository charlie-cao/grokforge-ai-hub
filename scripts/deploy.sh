#!/bin/bash

# Deployment script for GrokForge AI Hub
# Usage: ./scripts/deploy.sh [dev|prod]

set -e

ENV=${1:-dev}

echo "🚀 Deploying GrokForge AI Hub ($ENV environment)..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    echo "✅ Loading environment variables from .env"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found. Using defaults."
fi

# Select compose file
if [ "$ENV" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo "📦 Using production configuration"
else
    COMPOSE_FILE="docker-compose.yml"
    echo "📦 Using development configuration"
fi

# Build images
echo "🔨 Building Docker images..."
docker-compose -f $COMPOSE_FILE build

# Start services
echo "🚀 Starting services..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Service status:"
docker-compose -f $COMPOSE_FILE ps

# Pull Ollama model if needed
if [ "$ENV" = "prod" ]; then
    echo "📥 Pulling Ollama model (this may take a while)..."
    docker exec -it grokforge-ollama-prod ollama pull qwen3:latest || echo "⚠️  Model pull failed or already exists"
else
    echo "📥 Pulling Ollama model (this may take a while)..."
    docker exec -it grokforge-ollama ollama pull qwen3:latest || echo "⚠️  Model pull failed or already exists"
fi

echo "✅ Deployment complete!"
echo ""
echo "🌐 Application: http://localhost:${APP_PORT:-3000}"
echo "🔧 Queue Server: http://localhost:${QUEUE_PORT:-3001}"
echo "📊 View logs: docker-compose -f $COMPOSE_FILE logs -f"

