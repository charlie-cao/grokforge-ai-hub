# Docker 构建超时配置指南

## 问题说明

Docker 构建本身**没有直接的超时设置**，但在构建过程中可能会遇到以下超时问题：

1. **网络超时**：下载依赖包时网络连接超时
2. **构建步骤超时**：某个 RUN 命令执行时间过长
3. **资源限制**：内存或磁盘空间不足导致失败
4. **CPU 过载**：CPU 使用率过高导致进程被系统 kill（错误码 255）

## 解决方案

### 1. Dockerfile 中的 CPU 限制和超时保护

我们已经在 Dockerfile 中添加了 CPU 限制来防止 CPU 过载导致进程被 kill：

```dockerfile
# 安装 nice 工具（用于降低进程优先级）
RUN apk add --no-cache util-linux

# 使用 nice 降低 CPU 优先级（19 = 最低优先级，防止 CPU 飙满）
# 这样可以防止系统因为 CPU 过载而 kill 进程
RUN nice -n 19 bun install --frozen-lockfile || \
    (echo "First attempt failed, retrying..." && \
     sleep 10 && \
     nice -n 19 bun install --frozen-lockfile)
```

**为什么使用 `nice -n 19`？**
- `nice` 值范围：-20（最高优先级）到 19（最低优先级）
- 使用 `nice -n 19` 可以显著降低进程的 CPU 使用优先级
- 防止 `bun install` 占用过多 CPU 导致系统 kill 进程
- 虽然构建会慢一些，但更稳定可靠

### 2. Docker Compose 构建超时

在 `docker-compose.yml` 中，可以通过 `build` 配置添加超时：

```yaml
services:
  queue-server:
    build:
      context: .
      dockerfile: Dockerfile.queue
      # 注意：docker-compose 本身不支持超时参数
      # 需要在命令行使用 timeout 命令
```

### 3. 使用 timeout 命令包装构建

在服务器上构建时，可以使用系统 `timeout` 命令：

```bash
# 设置 1 小时超时（3600秒）
timeout 3600 docker compose build

# 或者使用 make 命令（已在 Makefile 中添加）
make build-timeout
```

### 4. 配置 Docker Daemon 网络超时

编辑 `/etc/docker/daemon.json`：

```json
{
  "max-concurrent-downloads": 3,
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ],
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```

重启 Docker 服务：

```bash
sudo systemctl restart docker
```

### 5. 增加 Docker 构建资源限制

如果构建失败是因为资源不足，可以：

```bash
# 检查 Docker 资源使用
docker system df

# 清理未使用的资源
docker system prune -a

# 增加 Docker 内存限制（在 docker-compose.yml 中）
services:
  queue-server:
    build:
      context: .
      dockerfile: Dockerfile.queue
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G
```

## 常见问题排查

### 问题 1: bun install 超时

**症状**：构建在 `bun install` 步骤失败，错误码 255

**解决方案**：
1. 检查网络连接：`ping registry.npmjs.org`
2. 配置镜像加速器（见上方）
3. 增加超时时间（修改 Dockerfile 中的 1800 秒）
4. 检查磁盘空间：`df -h`

### 问题 2: 构建整体超时

**症状**：整个构建过程被中断

**解决方案**：
```bash
# 使用 timeout 命令包装
timeout 7200 make build  # 2小时超时

# 或者分步构建
docker build -f Dockerfile.queue -t test-queue .
```

### 问题 3: 内存不足

**症状**：构建过程中容器被杀死（OOM）

**解决方案**：
1. 增加服务器内存
2. 减少并发构建数量
3. 使用 `--memory` 限制单个构建的内存使用

### 问题 4: CPU/内存过载导致进程被 kill

**症状**：构建在 `bun install` 步骤失败，错误码 255，系统日志显示进程被 kill。htop 显示 CPU 100%，内存使用率 >90%

**解决方案**：
1. **使用串行构建**（最推荐，特别是内存 <1GB 的系统）：
   ```bash
   # 一次只构建一个服务，避免并行构建导致资源竞争
   make build-serial
   
   # 或使用最安全的构建方式
   make build-safe
   ```

2. **使用 CPU 限制构建**：
   ```bash
   # 使用 Makefile 提供的低 CPU 优先级构建
   make build-low-cpu
   
   # 或手动使用 nice
   nice -n 19 make build
   ```

2. **检查系统资源**：
   ```bash
   # 查看 CPU 使用情况
   top
   htop
   
   # 查看系统日志中的 kill 记录
   dmesg | grep -i kill
   journalctl -k | grep -i oom
   ```

3. **限制 Docker 构建的 CPU 使用**：
   ```bash
   # 使用 docker buildx 限制 CPU
   docker buildx build --cpuset-cpus="0-1" -f Dockerfile.queue .
   ```

4. **在服务器上设置 CPU 限制**：
   ```bash
   # 使用 cpulimit（需要先安装）
   apt-get install cpulimit
   cpulimit -l 50 docker compose build  # 限制为 50% CPU
   ```

## 推荐的构建命令

```bash
# ⚠️ 对于低内存系统（<1GB RAM），强烈推荐使用串行构建
make build-safe

# 标准构建（Dockerfile 内部已使用 nice 限制 CPU）
make build

# 低 CPU 优先级构建（如果标准构建仍然失败）
make build-low-cpu

# 串行构建（一次只构建一个服务，防止内存/CPU 过载）
make build-serial

# 最安全的构建方式（CPU 限制 + 串行构建）
make build-safe

# 带系统超时的构建（2小时）
make build-timeout

# 无缓存重建（用于调试）
make rebuild

# 单独构建某个服务（带 CPU 限制）
nice -n 19 docker build -f Dockerfile.queue -t queue-server .

# 监控构建过程的 CPU 和内存使用
watch -n 1 'free -h && echo "" && top -b -n 1 | head -20'
htop  # 更详细的监控
```

## 监控构建过程

```bash
# 实时查看构建日志
docker compose build --progress=plain

# 查看详细错误信息
docker compose build 2>&1 | tee build.log
```

## 总结

- ✅ Dockerfile 中已添加 `timeout` 保护（30分钟）
- ✅ 支持自动重试机制
- ✅ 建议配置 Docker 镜像加速器
- ✅ 可以使用系统 `timeout` 命令包装整个构建过程

如果仍然遇到超时问题，请检查：
1. 网络连接稳定性
2. 服务器资源（内存、磁盘）
3. Docker daemon 配置
4. 构建日志中的具体错误信息

