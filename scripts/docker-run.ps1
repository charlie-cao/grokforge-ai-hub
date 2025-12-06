# GrokForge AI Hub - Docker Deployment Script
# Windows PowerShell script for containerized deployment

param(
    [Parameter(Position=0)]
    [ValidateSet("run", "run-local", "stop", "logs", "status", "check", "build", "rebuild", "restart", "down", "clean", "help")]
    [string]$Command = "help"
)

$COMPOSE_FILE = "docker-compose.yml"

function Show-Help {
    Write-Host "GrokForge AI Hub - Containerized Deployment" -ForegroundColor Green
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  run       - Start all services (web, queue, scheduler, redis, ollama)"
    Write-Host "  run-local - Start services using local Ollama (no container)"
    Write-Host "  stop      - Stop all services"
    Write-Host "  logs      - View logs from all services"
    Write-Host "  status    - Show status of all services"
    Write-Host "  check     - Check if all services are healthy"
    Write-Host "  build     - Build all Docker images"
    Write-Host "  rebuild   - Rebuild all Docker images (no cache)"
    Write-Host "  restart   - Restart all services"
    Write-Host "  down      - Stop and remove all containers"
    Write-Host "  clean     - Stop and remove all containers, volumes, and images"
    Write-Host "  help      - Show this help message"
    Write-Host ""
}

function Start-Services {
    Write-Host "🚀 Starting all services..." -ForegroundColor Green
    docker-compose -f $COMPOSE_FILE up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ All services started!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Services:" -ForegroundColor Yellow
        Write-Host "  • Web Server:      http://localhost:3000"
        Write-Host "  • Queue Server:    http://localhost:3001"
        Write-Host "  • Redis:           localhost:6379"
        Write-Host "  • Ollama:          http://localhost:11434"
        Write-Host ""
        Write-Host "Use '.\scripts\docker-run.ps1 logs' to view logs or '.\scripts\docker-run.ps1 status' to check service status."
    } else {
        Write-Host "❌ Failed to start services!" -ForegroundColor Red
    }
}

function Start-Services-LocalOllama {
    Write-Host "🚀 Starting services with local Ollama..." -ForegroundColor Green
    Write-Host "⚠️  Make sure Ollama is running locally on port 11434" -ForegroundColor Yellow
    docker-compose -f $COMPOSE_FILE -f docker-compose.local-ollama.yml up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ All services started!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Services:" -ForegroundColor Yellow
        Write-Host "  • Web Server:      http://localhost:3000"
        Write-Host "  • Queue Server:    http://localhost:3001"
        Write-Host "  • Redis:           localhost:6379"
        Write-Host "  • Ollama:          Using local service (http://localhost:11434)"
        Write-Host ""
        Write-Host "Use '.\scripts\docker-run.ps1 logs' to view logs or '.\scripts\docker-run.ps1 status' to check service status."
    } else {
        Write-Host "❌ Failed to start services!" -ForegroundColor Red
    }
}

function Stop-Services {
    Write-Host "🛑 Stopping all services..." -ForegroundColor Yellow
    docker-compose -f $COMPOSE_FILE stop
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ All services stopped!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to stop services!" -ForegroundColor Red
    }
}

function Show-Logs {
    docker-compose -f $COMPOSE_FILE logs -f
}

function Show-Status {
    Write-Host "📊 Service Status:" -ForegroundColor Green
    docker-compose -f $COMPOSE_FILE ps
}

function Check-Health {
    Write-Host "🔍 Checking service health..." -ForegroundColor Green
    Write-Host ""
    docker-compose -f $COMPOSE_FILE ps
    Write-Host ""
    Write-Host "Health Checks:" -ForegroundColor Yellow
    
    # Check Web Server
    Write-Host -NoNewline "  Web Server:      "
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -in @(200, 301, 302)) {
            Write-Host "✓ Healthy" -ForegroundColor Green
        } else {
            Write-Host "✗ Unhealthy" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Unhealthy" -ForegroundColor Red
    }
    
    # Check Queue Server
    Write-Host -NoNewline "  Queue Server:    "
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Healthy" -ForegroundColor Green
        } else {
            Write-Host "✗ Unhealthy" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Unhealthy" -ForegroundColor Red
    }
    
    # Check Redis
    Write-Host -NoNewline "  Redis:           "
    try {
        $result = docker exec grokforge-redis redis-cli ping 2>$null
        if ($result -match "PONG") {
            Write-Host "✓ Healthy" -ForegroundColor Green
        } else {
            Write-Host "✗ Unhealthy" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Unhealthy" -ForegroundColor Red
    }
    
    # Check Ollama
    Write-Host -NoNewline "  Ollama:          "
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Healthy" -ForegroundColor Green
        } else {
            Write-Host "✗ Unhealthy" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Unhealthy" -ForegroundColor Red
    }
}

function Build-Images {
    Write-Host "🔨 Building Docker images..." -ForegroundColor Green
    docker-compose -f $COMPOSE_FILE build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build complete!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
    }
}

function Rebuild-Images {
    Write-Host "🔨 Rebuilding Docker images (no cache)..." -ForegroundColor Green
    docker-compose -f $COMPOSE_FILE build --no-cache
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Rebuild complete!" -ForegroundColor Green
    } else {
        Write-Host "❌ Rebuild failed!" -ForegroundColor Red
    }
}

function Restart-Services {
    Write-Host "🔄 Restarting all services..." -ForegroundColor Yellow
    docker-compose -f $COMPOSE_FILE restart
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ All services restarted!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to restart services!" -ForegroundColor Red
    }
}

function Remove-Containers {
    Write-Host "🗑️  Stopping and removing all containers..." -ForegroundColor Yellow
    docker-compose -f $COMPOSE_FILE down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ All containers removed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to remove containers!" -ForegroundColor Red
    }
}

function Clean-All {
    Write-Host "⚠️  This will remove all containers, volumes, and images!" -ForegroundColor Red
    $confirmation = Read-Host "Are you sure? [y/N]"
    if ($confirmation -eq "y" -or $confirmation -eq "Y") {
        docker-compose -f $COMPOSE_FILE down -v --rmi all
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Cleanup complete!" -ForegroundColor Green
        } else {
            Write-Host "❌ Cleanup failed!" -ForegroundColor Red
        }
    } else {
        Write-Host "Cancelled." -ForegroundColor Yellow
    }
}

# Main command dispatcher
switch ($Command) {
    "run" { Start-Services }
    "run-local" { Start-Services-LocalOllama }
    "stop" { Stop-Services }
    "logs" { Show-Logs }
    "status" { Show-Status }
    "check" { Check-Health }
    "build" { Build-Images }
    "rebuild" { Rebuild-Images }
    "restart" { Restart-Services }
    "down" { Remove-Containers }
    "clean" { Clean-All }
    default { Show-Help }
}

