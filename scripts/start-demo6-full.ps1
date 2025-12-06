# Demo6 完整启动脚本 (PowerShell)
# 启动 Redis、队列服务器和前端服务

Write-Host "🚀 启动 Demo6: AI 对话队列系统 (完整版)" -ForegroundColor Cyan
Write-Host ""

# 检查 Docker 是否运行
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker 未运行，请先启动 Docker" -ForegroundColor Red
    exit 1
}

# 检查 Redis 容器是否已运行
$redisRunning = docker ps | Select-String "demo6-redis"
if ($redisRunning) {
    Write-Host "✅ Redis 容器已在运行" -ForegroundColor Green
} else {
    Write-Host "📦 启动 Redis 容器..." -ForegroundColor Yellow
    docker-compose -f docker-compose.demo6.yml up -d
    Start-Sleep -Seconds 2
}

# 检查 Ollama 是否运行
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Ollama 服务已运行" -ForegroundColor Green
} catch {
    Write-Host "⚠️  警告: Ollama 服务未运行，请确保 Ollama 在 http://localhost:11434 运行" -ForegroundColor Yellow
    Write-Host "   启动命令: ollama serve" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 启动说明:" -ForegroundColor Cyan
Write-Host "   需要启动两个服务:" -ForegroundColor Gray
Write-Host ""
Write-Host "   1️⃣  队列服务器 (当前终端):" -ForegroundColor Yellow
Write-Host "      bun run src/server/demo6-server.ts" -ForegroundColor White
Write-Host ""
Write-Host "   2️⃣  前端服务 (新终端):" -ForegroundColor Yellow
Write-Host "      bun dev" -ForegroundColor White
Write-Host ""
Write-Host "   访问地址:" -ForegroundColor Cyan
Write-Host "   - 前端页面: http://localhost:3000/demo6" -ForegroundColor Green
Write-Host "   - 队列 API: http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "按任意键启动队列服务器..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "🔧 启动队列服务器 (端口 3001)..." -ForegroundColor Cyan
Write-Host ""

bun run src/server/demo6-server.ts

