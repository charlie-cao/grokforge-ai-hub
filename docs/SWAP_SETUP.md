# Swap 交换分区设置指南

对于低内存系统（<1GB RAM），强烈建议创建 swap 文件以避免 OOM (Out of Memory) kill。

## 快速创建 Swap（推荐）

### 方式 1: 使用脚本（最简单）

```bash
# 1. 进入项目目录
cd ~/work/grokforge-ai-hub

# 2. 运行 swap 设置脚本
chmod +x scripts/setup-swap.sh
sudo ./scripts/setup-swap.sh 2G
```

脚本会自动：
- 检查磁盘空间
- 创建 2GB swap 文件
- 启用 swap
- 添加到 `/etc/fstab` 使其永久生效

### 方式 2: 手动创建（如果脚本不可用）

```bash
# 1. 创建 2GB swap 文件（根据你的磁盘空间调整大小）
sudo fallocate -l 2G /swapfile

# 如果 fallocate 不可用，使用 dd（较慢）
# sudo dd if=/dev/zero of=/swapfile bs=1M count=2048

# 2. 设置权限（安全要求）
sudo chmod 600 /swapfile

# 3. 格式化为 swap
sudo mkswap /swapfile

# 4. 启用 swap
sudo swapon /swapfile

# 5. 验证
free -h
swapon --show

# 6. 永久生效（添加到 /etc/fstab）
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 验证 Swap

```bash
# 查看内存和 swap 使用情况
free -h

# 查看 swap 详细信息
swapon --show

# 查看 /proc/swaps
cat /proc/swaps
```

## 调整 Swap 大小

如果需要调整 swap 大小：

```bash
# 1. 关闭现有 swap
sudo swapoff /swapfile

# 2. 删除旧文件
sudo rm /swapfile

# 3. 创建新大小的 swap（例如 4GB）
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 4. 更新 /etc/fstab（如果路径改变）
```

## 优化 Swap 性能（可选）

### 调整 swappiness

`swappiness` 控制系统使用 swap 的倾向（0-100）：
- 0: 尽可能不使用 swap
- 100: 积极使用 swap
- 默认通常是 60

对于低内存系统，可以设置为 10-20：

```bash
# 临时设置
sudo sysctl vm.swappiness=10

# 永久设置
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

### 调整 swap 优先级

如果有多个 swap，可以设置优先级：

```bash
# 在 /etc/fstab 中添加优先级（数字越大优先级越高）
/swapfile none swap sw,pri=10 0 0
```

## 删除 Swap（如果需要）

```bash
# 1. 关闭 swap
sudo swapoff /swapfile

# 2. 从 /etc/fstab 中删除对应行
sudo sed -i '/swapfile/d' /etc/fstab

# 3. 删除文件
sudo rm /swapfile
```

## 常见问题

### Q: 应该创建多大的 swap？

**建议：**
- 内存 < 1GB: 创建 2-4GB swap
- 内存 1-2GB: 创建 1-2GB swap
- 内存 > 2GB: 通常不需要 swap

### Q: swap 会影响性能吗？

- **会**，但比 OOM kill 好得多
- swap 在磁盘上，比 RAM 慢 100-1000 倍
- 但对于低内存系统，这是必要的权衡

### Q: 为什么 bun install 还是被 kill？

即使有 swap，如果：
1. swap 空间也不够
2. 磁盘 I/O 太慢
3. 系统负载太高

**解决方案：**
1. 增加 swap 大小（4GB 或更多）
2. 使用 `ulimit -v` 限制进程内存
3. 使用 `nice -n 19` 降低优先级
4. 分步安装依赖

### Q: 如何监控 swap 使用？

```bash
# 实时监控
watch -n 1 'free -h'

# 查看 swap 使用趋势
vmstat 1 10

# 查看哪些进程在使用 swap
sudo swapon --show=NAME,TYPE,SIZE,USED,PRIO
```

## 使用 Swap 后重新安装依赖

创建 swap 后，重新运行：

```bash
# 使用内存限制安装
ulimit -v 300000  # 限制 300MB
nice -n 19 bun install --frozen-lockfile
```

或使用优化后的脚本：

```bash
./scripts/run-baremetal.sh start
```

脚本会自动检测 swap 并使用内存限制。

