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
	@docker-compose -f $(COMPOSE_FILE) up -d
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
	@docker-compose -f $(COMPOSE_FILE) -f docker-compose.local-ollama.yml up -d
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
	@docker-compose -f $(COMPOSE_FILE) stop
	@echo "$(GREEN)✅ All services stopped!$(NC)"

down: ## Stop and remove all containers
	@echo "$(YELLOW)🗑️  Stopping and removing all containers...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✅ All containers removed!$(NC)"

logs: ## View logs from all services
	@docker-compose -f $(COMPOSE_FILE) logs -f

logs-app: ## View logs from web server only
	@docker-compose -f $(COMPOSE_FILE) logs -f app

logs-queue: ## View logs from queue server only
	@docker-compose -f $(COMPOSE_FILE) logs -f queue-server

logs-scheduler: ## View logs from scheduler server only
	@docker-compose -f $(COMPOSE_FILE) logs -f scheduler-server

build: ## Build all Docker images
	@echo "$(GREEN)🔨 Building Docker images...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) build
	@echo "$(GREEN)✅ Build complete!$(NC)"

rebuild: ## Rebuild all Docker images (no cache)
	@echo "$(GREEN)🔨 Rebuilding Docker images (no cache)...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) build --no-cache
	@echo "$(GREEN)✅ Rebuild complete!$(NC)"

restart: ## Restart all services
	@echo "$(YELLOW)🔄 Restarting all services...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)✅ All services restarted!$(NC)"

status: ## Show status of all services
	@echo "$(GREEN)📊 Service Status:$(NC)"
	@docker-compose -f $(COMPOSE_FILE) ps

check: ## Check if all services are healthy
	@echo "$(GREEN)🔍 Checking service health...$(NC)"
	@echo ""
	@docker-compose -f $(COMPOSE_FILE) ps
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
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose -f $(COMPOSE_FILE) down -v --rmi all; \
		echo "$(GREEN)✅ Cleanup complete!$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled.$(NC)"; \
	fi

clean-volumes: ## Remove all volumes (⚠️ This will delete all data!)
	@echo "$(RED)⚠️  This will delete all volumes and data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose -f $(COMPOSE_FILE) down -v; \
		echo "$(GREEN)✅ Volumes removed!$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled.$(NC)"; \
	fi

shell-app: ## Open shell in web server container
	@docker-compose -f $(COMPOSE_FILE) exec app sh

shell-queue: ## Open shell in queue server container
	@docker-compose -f $(COMPOSE_FILE) exec queue-server sh

shell-scheduler: ## Open shell in scheduler server container
	@docker-compose -f $(COMPOSE_FILE) exec scheduler-server sh


