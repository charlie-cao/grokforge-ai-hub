# 磁盘空间不足解决方案

## 问题

Docker 拉取 Ollama 镜像时提示：`no space left on device`

Ollama 镜像大小约 2GB+，需要足够的磁盘空间。

## 快速解决方案

### 方案 1: 清理 Docker 空间（推荐）

```bash
# 运行清理脚本
chmod +x scripts/cleanup-disk.sh
./scripts/cleanup-disk.sh docker

# 或手动清理
docker compose down
docker system prune -a -f --volumes
```

### 方案 2: 使用本地 Ollama（避免下载镜像）

如果你已经在服务器上安装了 Ollama，可以使用本地服务：

```bash
# 1. 确保本地 Ollama 运行
ollama serve

# 2. 使用本地 Ollama 配置启动
make run-local

# 或
docker compose -f docker-compose.yml -f docker-compose.local-ollama.yml up -d
```

这样可以避免下载 2GB+ 的 Ollama 镜像。

### 方案 3: 只启动必要的服务

如果只需要主应用和 Queue Server：

```bash
# 修改 docker-compose.yml，注释掉 ollama 服务
# 然后启动
docker compose up -d app queue-server redis
```

## 检查磁盘空间

```bash
# 查看磁盘使用
df -h

# 查看 Docker 使用
docker system df

# 查看大文件
sudo find / -type f -size +100M 2>/dev/null | head -10
```

## 清理步骤

### 1. 清理 Docker（释放最多空间）

```bash
# 停止所有容器
docker compose down

# 清理未使用的镜像、容器、网络、卷
docker system prune -a -f --volumes

# 查看释放的空间
docker system df
```

### 2. 清理日志

```bash
# 清理项目日志
find logs -type f -name "*.log" -mtime +7 -delete

# 清理系统日志（可选）
sudo journalctl --vacuum-time=7d
```

### 3. 清理 APT 缓存

```bash
sudo apt-get clean
sudo apt-get autoclean
sudo apt-get autoremove -y
```

### 4. 清理未使用的包

```bash
# 查找未使用的包
dpkg -l | grep ^rc

# 清理配置残留
sudo apt-get purge $(dpkg -l | grep ^rc | awk '{print $2}')
```

## 使用本地 Ollama（推荐）

### 安装本地 Ollama

```bash
# 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 启动服务
ollama serve

# 下载模型（在另一个终端）
ollama pull qwen3:latest
```

### 使用本地 Ollama 配置

```bash
# 使用本地 Ollama 启动（不下载 Docker 镜像）
make run-local
```

这会：
- ✅ 使用本地 Ollama 服务
- ✅ 不下载 2GB+ 的 Docker 镜像
- ✅ 节省磁盘空间
- ✅ 启动更快

## 扩展磁盘空间（如果可能）

### 云服务器扩展

- **阿里云**: ECS → 云盘 → 扩容
- **腾讯云**: 云硬盘 → 扩容
- **AWS**: EBS → Modify Volume

### 添加新磁盘

```bash
# 1. 查看新磁盘
lsblk

# 2. 格式化
sudo mkfs.ext4 /dev/sdb

# 3. 挂载
sudo mkdir /mnt/data
sudo mount /dev/sdb /mnt/data

# 4. 永久挂载
echo '/dev/sdb /mnt/data ext4 defaults 0 2' | sudo tee -a /etc/fstab
```

## 监控磁盘使用

```bash
# 实时监控
watch -n 1 'df -h'

# 查看目录大小
du -sh /* 2>/dev/null | sort -h

# 查看 Docker 使用
docker system df -v
```

## 预防措施

1. **定期清理 Docker**
   ```bash
   # 添加到 crontab
   0 2 * * 0 docker system prune -a -f
   ```

2. **使用本地服务**
   - 使用本地 Ollama 而不是 Docker 镜像
   - 使用本地 Redis 而不是 Docker 容器

3. **监控磁盘使用**
   ```bash
   # 设置告警（当使用 > 80%）
   df -h | awk '$5+0 > 80 {print "警告: " $1 " 使用率 " $5}'
   ```

## 最小化部署（裸机运行）

如果磁盘空间非常有限，建议使用裸机运行：

```bash
# 不需要 Docker，直接运行
./scripts/run-baremetal.sh start
```

这只需要：
- Bun 运行时
- 项目代码和依赖
- 不需要 Docker 镜像（节省 5GB+ 空间）

## 总结

**最快解决方案：**
1. 清理 Docker: `docker system prune -a -f --volumes`
2. 使用本地 Ollama: `make run-local`
3. 或使用裸机运行: `./scripts/run-baremetal.sh start`

