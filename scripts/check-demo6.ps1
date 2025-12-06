# Demo6 服务检查脚本

Write-Host "🔍 检查 Demo6 服务状态..." -ForegroundColor Cyan
Write-Host ""

# 检查 Redis
$redisRunning = docker ps | Select-String "demo6-redis"
if ($redisRunning) {
    Write-Host "✅ Redis 容器: 运行中" -ForegroundColor Green
} else {
    Write-Host "❌ Redis 容器: 未运行" -ForegroundColor Red
    Write-Host "   启动命令: docker-compose -f docker-compose.demo6.yml up -d" -ForegroundColor Yellow
}

# 检查队列服务器 (3001)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ 队列服务器 (3001): 运行中" -ForegroundColor Green
} catch {
    Write-Host "❌ 队列服务器 (3001): 未运行" -ForegroundColor Red
    Write-Host "   启动命令: bun run src/server/demo6-server.ts" -ForegroundColor Yellow
}

# 检查前端服务 (3000)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ 前端服务 (3000): 运行中" -ForegroundColor Green
} catch {
    Write-Host "❌ 前端服务 (3000): 未运行" -ForegroundColor Red
    Write-Host "   启动命令: bun dev" -ForegroundColor Yellow
}

# 检查 Ollama
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Ollama 服务 (11434): 运行中" -ForegroundColor Green
        # 尝试解析模型列表
        try {
            $models = $response.Content | ConvertFrom-Json
            if ($models.models) {
                $modelNames = $models.models | Select-Object -First 3 -ExpandProperty name
                Write-Host "   可用模型: $($modelNames -join ', ')" -ForegroundColor Gray
            }
        } catch {
            # 忽略解析错误
        }
    } else {
        Write-Host "⚠️  Ollama 服务 (11434): 响应异常 (状态码: $($response.StatusCode))" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Ollama 服务 (11434): 未运行或无法连接" -ForegroundColor Yellow
    Write-Host "   启动命令: ollama serve" -ForegroundColor Yellow
    Write-Host "   错误: $($_.Exception.Message)" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "📋 启动顺序:" -ForegroundColor Cyan
Write-Host "   1. Redis: docker-compose -f docker-compose.demo6.yml up -d" -ForegroundColor Gray
Write-Host "   2. 队列服务器: bun run src/server/demo6-server.ts" -ForegroundColor Gray
Write-Host "   3. 前端服务: bun dev (新终端)" -ForegroundColor Gray
Write-Host "   4. Ollama: ollama serve (如果需要)" -ForegroundColor Gray
Write-Host ""

