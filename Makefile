.PHONY: help run run-local stop logs clean build rebuild restart status check

# Default target
.DEFAULT_GOAL := help

# Docker Compose file
COMPOSE_FILE := docker-compose.yml

# Colors for output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)GrokForge AI Hub - Containerized Deployment$(NC)"
	@echo ""
	@echo "Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

run: ## Start all services (web, queue, scheduler, redis, ollama)
	@echo "$(GREEN)🚀 Starting all services...$(NC)"
	@docker compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✅ All services started!$(NC)"
	@echo ""
	@echo "$(YELLOW)Services:$(NC)"
	@echo "  • Web Server:      http://localhost:3000"
	@echo "  • Queue Server:    http://localhost:3001"
	@echo "  • Redis:           localhost:6379"
	@echo "  • Ollama:          http://localhost:11434"
	@echo ""
	@echo "Use 'make logs' to view logs or 'make status' to check service status."

run-local: ## Start services using local Ollama (no container, saves disk space)
	@echo "$(GREEN)🚀 Starting services with local Ollama...$(NC)"
	@echo "$(YELLOW)⚠️  Make sure Ollama is running locally on port 11434$(NC)"
	@docker compose -f $(COMPOSE_FILE) -f docker-compose.local-ollama.yml up -d
	@echo "$(GREEN)✅ All services started!$(NC)"
	@echo ""
	@echo "$(YELLOW)Services:$(NC)"
	@echo "  • Web Server:      http://localhost:3000"
	@echo "  • Queue Server:    http://localhost:3001"
	@echo "  • Redis:           localhost:6379"
	@echo "  • Ollama:          Using local service (http://localhost:11434)"
	@echo ""
	@echo "Use 'make logs' to view logs or 'make status' to check service status."

stop: ## Stop all services
	@echo "$(YELLOW)🛑 Stopping all services...$(NC)"
	@docker compose -f $(COMPOSE_FILE) stop
	@echo "$(GREEN)✅ All services stopped!$(NC)"

down: ## Stop and remove all containers
	@echo "$(YELLOW)🗑️  Stopping and removing all containers...$(NC)"
	@docker compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✅ All containers removed!$(NC)"

logs: ## View logs from all services
	@docker compose -f $(COMPOSE_FILE) logs -f

logs-app: ## View logs from web server only
	@docker compose -f $(COMPOSE_FILE) logs -f app

logs-queue: ## View logs from queue server only
	@docker compose -f $(COMPOSE_FILE) logs -f queue-server

logs-scheduler: ## View logs from scheduler server only
	@docker compose -f $(COMPOSE_FILE) logs -f scheduler-server

build: ## Build all Docker images
	@echo "$(GREEN)🔨 Building Docker images...$(NC)"
	@echo "$(YELLOW)💡 Tip: If build fails due to CPU overload, use 'make build-low-cpu'$(NC)"
	@docker compose -f $(COMPOSE_FILE) build
	@echo "$(GREEN)✅ Build complete!$(NC)"

build-low-cpu: ## Build with CPU throttling (prevents CPU spike/kill)
	@echo "$(GREEN)🔨 Building Docker images with CPU throttling...$(NC)"
	@echo "$(YELLOW)⚠️  Using nice to lower CPU priority (slower but safer)$(NC)"
	@nice -n 19 docker compose -f $(COMPOSE_FILE) build
	@echo "$(GREEN)✅ Build complete!$(NC)"

build-serial: ## Build images one at a time (prevents memory/CPU overload)
	@echo "$(GREEN)🔨 Building Docker images serially (one at a time)...$(NC)"
	@echo "$(YELLOW)⚠️  This prevents memory/CPU overload on low-resource systems$(NC)"
	@echo "$(YELLOW)📊 Current system resources:$(NC)"
	@free -h || echo "free command not available"
	@echo ""
	@echo "$(YELLOW)🧹 Stopping any running builds to free resources...$(NC)"
	@docker compose -f $(COMPOSE_FILE) down 2>/dev/null || true
	@echo "$(YELLOW)⏳ Waiting 5 seconds for resources to free up...$(NC)"
	@sleep 5
	@echo ""
	@echo "$(GREEN)📦 Building queue-server...$(NC)"
	@nice -n 19 docker compose -f $(COMPOSE_FILE) build --no-parallel queue-server || \
		(echo "$(RED)❌ queue-server build failed!$(NC)" && exit 1)
	@echo "$(YELLOW)⏳ Waiting 3 seconds before next build...$(NC)"
	@sleep 3
	@echo "$(GREEN)📦 Building scheduler-server...$(NC)"
	@nice -n 19 docker compose -f $(COMPOSE_FILE) build --no-parallel scheduler-server || \
		(echo "$(RED)❌ scheduler-server build failed!$(NC)" && exit 1)
	@echo "$(YELLOW)⏳ Waiting 3 seconds before next build...$(NC)"
	@sleep 3
	@echo "$(GREEN)📦 Building app...$(NC)"
	@nice -n 19 docker compose -f $(COMPOSE_FILE) build --no-parallel app || \
		(echo "$(RED)❌ app build failed!$(NC)" && exit 1)
	@echo "$(GREEN)✅ All images built successfully!$(NC)"

build-safe: ## Build with maximum resource protection (CPU + serial)
	@echo "$(GREEN)🔨 Building with maximum resource protection...$(NC)"
	@echo "$(YELLOW)⚠️  Using: CPU throttling + Serial build + Low priority$(NC)"
	@echo "$(YELLOW)📊 System resources before build:$(NC)"
	@free -h || echo "free command not available"
	@echo ""
	@make build-serial

build-timeout: ## Build all Docker images with timeout (2 hours)
	@echo "$(GREEN)🔨 Building Docker images with 2-hour timeout...$(NC)"
	@timeout 7200 docker compose -f $(COMPOSE_FILE) build || \
		(echo "$(RED)❌ Build timed out or failed!$(NC)" && exit 1)
	@echo "$(GREEN)✅ Build complete!$(NC)"

rebuild: ## Rebuild all Docker images (no cache)
	@echo "$(GREEN)🔨 Rebuilding Docker images (no cache)...$(NC)"
	@docker compose -f $(COMPOSE_FILE) build --no-cache
	@echo "$(GREEN)✅ Rebuild complete!$(NC)"

restart: ## Restart all services
	@echo "$(YELLOW)🔄 Restarting all services...$(NC)"
	@docker compose -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)✅ All services restarted!$(NC)"

status: ## Show status of all services
	@echo "$(GREEN)📊 Service Status:$(NC)"
	@docker compose -f $(COMPOSE_FILE) ps

check: ## Check if all services are healthy
	@echo "$(GREEN)🔍 Checking service health...$(NC)"
	@echo ""
	@docker compose -f $(COMPOSE_FILE) ps
	@echo ""
	@echo "$(YELLOW)Health Checks:$(NC)"
	@echo -n "  Web Server:      "
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200\|301\|302" && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Unhealthy$(NC)"
	@echo -n "  Queue Server:    "
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null | grep -q "200" && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Unhealthy$(NC)"
	@echo -n "  Redis:           "
	@docker exec grokforge-redis redis-cli ping 2>/dev/null | grep -q "PONG" && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Unhealthy$(NC)"
	@echo -n "  Ollama:          "
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:11434/api/tags 2>/dev/null | grep -q "200" && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Unhealthy$(NC)"

clean: ## Stop and remove all containers, volumes, and images
	@echo "$(RED)⚠️  This will remove all containers, volumes, and images!$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to cancel, or wait 5 seconds to continue...$(NC)"
	@sleep 5 || timeout /t 5 /nobreak >nul 2>&1 || true
	@docker compose -f $(COMPOSE_FILE) down -v --rmi all
	@echo "$(GREEN)✅ Cleanup complete!$(NC)"

clean-volumes: ## Remove all volumes (⚠️ This will delete all data!)
	@echo "$(RED)⚠️  This will delete all volumes and data!$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to cancel, or wait 5 seconds to continue...$(NC)"
	@sleep 5 || timeout /t 5 /nobreak >nul 2>&1 || true
	@docker compose -f $(COMPOSE_FILE) down -v
	@echo "$(GREEN)✅ Volumes removed!$(NC)"

shell-app: ## Open shell in web server container
	@docker compose -f $(COMPOSE_FILE) exec app sh

shell-queue: ## Open shell in queue server container
	@docker compose -f $(COMPOSE_FILE) exec queue-server sh

shell-scheduler: ## Open shell in scheduler server container
	@docker compose -f $(COMPOSE_FILE) exec scheduler-server sh


