# Deployment script for GrokForge AI Hub (PowerShell)
# Usage: .\scripts\deploy.ps1 [dev|prod]

param(
    [string]$Env = "dev"
)

Write-Host "🚀 Deploying GrokForge AI Hub ($Env environment)..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ docker-compose is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Load environment variables
if (Test-Path .env) {
    Write-Host "✅ Loading environment variables from .env" -ForegroundColor Green
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]*)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
} else {
    Write-Host "⚠️  No .env file found. Using defaults." -ForegroundColor Yellow
}

# Select compose file
if ($Env -eq "prod") {
    $ComposeFile = "docker-compose.prod.yml"
    Write-Host "📦 Using production configuration" -ForegroundColor Cyan
} else {
    $ComposeFile = "docker-compose.yml"
    Write-Host "📦 Using development configuration" -ForegroundColor Cyan
}

# Build images
Write-Host "🔨 Building Docker images..." -ForegroundColor Cyan
docker-compose -f $ComposeFile build

# Start services
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
docker-compose -f $ComposeFile up -d

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check service status
Write-Host "📊 Service status:" -ForegroundColor Cyan
docker-compose -f $ComposeFile ps

# Pull Ollama model if needed
$OllamaContainer = if ($Env -eq "prod") { "grokforge-ollama-prod" } else { "grokforge-ollama" }
Write-Host "📥 Pulling Ollama model (this may take a while)..." -ForegroundColor Cyan
docker exec -it $OllamaContainer ollama pull qwen3:latest 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Model pull failed or already exists" -ForegroundColor Yellow
}

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
$AppPort = [Environment]::GetEnvironmentVariable("APP_PORT", "Process")
$QueuePort = [Environment]::GetEnvironmentVariable("QUEUE_PORT", "Process")
Write-Host "🌐 Application: http://localhost:$($AppPort ?? '3000')" -ForegroundColor Cyan
Write-Host "🔧 Queue Server: http://localhost:$($QueuePort ?? '3001')" -ForegroundColor Cyan
Write-Host "📊 View logs: docker-compose -f $ComposeFile logs -f" -ForegroundColor Cyan

