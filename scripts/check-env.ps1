# Environment Check Script for Windows
# 环境检查脚本 - Windows 版本

Write-Host "🔍 检查系统环境..." -ForegroundColor Green
Write-Host ""

$errors = @()
$warnings = @()

# Check Docker
Write-Host -NoNewline "检查 Docker: "
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $dockerVersion" -ForegroundColor Green
    } else {
        $errors += "Docker 未安装或未在 PATH 中"
        Write-Host "✗ Docker 未安装" -ForegroundColor Red
    }
} catch {
    $errors += "Docker 未安装或未在 PATH 中"
    Write-Host "✗ Docker 未安装" -ForegroundColor Red
}

# Check Docker Compose
Write-Host -NoNewline "检查 Docker Compose: "
try {
    $composeVersion = docker-compose --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $composeVersion" -ForegroundColor Green
    } else {
        $errors += "Docker Compose 未安装"
        Write-Host "✗ Docker Compose 未安装" -ForegroundColor Red
    }
} catch {
    $errors += "Docker Compose 未安装"
    Write-Host "✗ Docker Compose 未安装" -ForegroundColor Red
}

# Check Docker daemon
Write-Host -NoNewline "检查 Docker 守护进程: "
try {
    docker info | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 运行中" -ForegroundColor Green
    } else {
        $errors += "Docker 守护进程未运行"
        Write-Host "✗ 未运行" -ForegroundColor Red
    }
} catch {
    $errors += "Docker 守护进程未运行"
    Write-Host "✗ 未运行" -ForegroundColor Red
}

# Check ports
Write-Host ""
Write-Host "检查端口占用:" -ForegroundColor Yellow
function Test-Port {
    param($port, $service)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet
        if ($connection) {
            Write-Host "  ✗ 端口 $port ($service): 占用" -ForegroundColor Red
            $script:warnings += "端口 $port ($service) 被占用，可能导致服务启动失败"
        } else {
            Write-Host "  ✓ 端口 $port ($service): 可用" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ✓ 端口 $port ($service): 可用" -ForegroundColor Green
    }
}

Test-Port 3000 "Web Server"
Test-Port 3001 "Queue Server"
Test-Port 6379 "Redis"
Test-Port 11434 "Ollama"

# Check optional Ollama
Write-Host ""
Write-Host -NoNewline "检查本地 Ollama (可选): "
try {
    $ollamaVersion = ollama --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 已安装 $ollamaVersion" -ForegroundColor Green
        Write-Host "  提示: 可以使用 '.\scripts\docker-run.ps1 run-local' 使用本地 Ollama" -ForegroundColor Cyan
    } else {
        Write-Host "未安装（可选）" -ForegroundColor Yellow
    }
} catch {
    Write-Host "未安装（可选）" -ForegroundColor Yellow
}

# Check Make (optional)
Write-Host ""
Write-Host -NoNewline "检查 Make (可选): "
try {
    $makeVersion = make --version 2>&1 | Select-Object -First 1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 已安装 $makeVersion" -ForegroundColor Green
    } else {
        Write-Host "未安装（可选，可使用 PowerShell 脚本代替）" -ForegroundColor Yellow
    }
} catch {
    Write-Host "未安装（可选，可使用 PowerShell 脚本代替）" -ForegroundColor Yellow
}

# Summary
Write-Host ""
if ($errors.Count -eq 0) {
    Write-Host "✅ 环境检查通过！" -ForegroundColor Green
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "⚠️  警告:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
    }
    Write-Host ""
    Write-Host "可以开始启动服务了：" -ForegroundColor Cyan
    Write-Host "  .\scripts\docker-run.ps1 run        # 使用容器中的 Ollama" -ForegroundColor White
    Write-Host "  .\scripts\docker-run.ps1 run-local  # 使用本地 Ollama" -ForegroundColor White
    exit 0
} else {
    Write-Host "❌ 环境检查失败：" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "请先解决上述问题后再继续。" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "安装指南:" -ForegroundColor Cyan
    Write-Host "  Docker: https://docs.docker.com/get-docker/" -ForegroundColor White
    Write-Host "  Docker Desktop (Windows): https://www.docker.com/products/docker-desktop" -ForegroundColor White
    exit 1
}

