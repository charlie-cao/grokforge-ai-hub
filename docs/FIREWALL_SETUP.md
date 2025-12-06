# 防火墙和端口配置指南

外部无法访问服务通常是因为防火墙或云服务器安全组未开放端口。

## 快速检查

```bash
# 1. 检查服务是否在运行
ps aux | grep bun

# 2. 检查端口是否监听
netstat -tlnp | grep -E ':(3000|3001)'
# 或
ss -tlnp | grep -E ':(3000|3001)'

# 3. 检查监听地址（应该看到 0.0.0.0 而不是 127.0.0.1）
# 如果看到 127.0.0.1，说明只监听本地，需要修改配置

# 4. 本地测试
curl http://localhost:3000
curl http://localhost:3001/health

# 5. 从服务器测试外部 IP
curl http://$(hostname -I | awk '{print $1}'):3000
```

## 配置防火墙（UFW - Ubuntu/Debian）

### 1. 检查 UFW 状态

```bash
sudo ufw status
```

### 2. 开放端口

```bash
# 开放主应用端口
sudo ufw allow 3000/tcp

# 开放 Queue Server 端口
sudo ufw allow 3001/tcp

# 如果需要开放 Redis（通常不需要，只本地访问）
# sudo ufw allow 6379/tcp

# 如果需要开放 Ollama（通常不需要，只本地访问）
# sudo ufw allow 11434/tcp

# 如果使用 Nginx 反向代理
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 3. 启用防火墙

```bash
# 如果防火墙未启用
sudo ufw enable

# 查看规则
sudo ufw status numbered
```

## 配置防火墙（firewalld - CentOS/RHEL）

```bash
# 检查状态
sudo firewall-cmd --state

# 开放端口
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp

# 重新加载
sudo firewall-cmd --reload

# 查看开放的端口
sudo firewall-cmd --list-ports
```

## 配置防火墙（iptables）

```bash
# 开放端口
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT

# 保存规则（根据系统不同）
# Ubuntu/Debian
sudo iptables-save | sudo tee /etc/iptables/rules.v4

# CentOS/RHEL
sudo service iptables save
```

## 云服务器安全组配置

### 阿里云 ECS

1. 登录阿里云控制台
2. 进入 **ECS** → **实例**
3. 选择你的服务器实例
4. 点击 **安全组** → **配置规则**
5. 添加规则：
   - **端口范围**: 3000/3000
   - **授权对象**: 0.0.0.0/0（或你的 IP）
   - **协议类型**: TCP
   - **描述**: GrokForge 主应用
6. 同样添加 3001 端口

### 腾讯云 CVM

1. 登录腾讯云控制台
2. 进入 **云服务器** → **实例**
3. 选择你的服务器
4. 点击 **安全组** → **修改规则**
5. 添加规则：
   - **类型**: 自定义
   - **来源**: 0.0.0.0/0
   - **协议端口**: TCP:3000
   - **策略**: 允许
6. 同样添加 3001 端口

### AWS EC2

1. 登录 AWS 控制台
2. 进入 **EC2** → **Instances**
3. 选择你的实例
4. 点击 **Security** → **Security groups**
5. 编辑入站规则（Inbound rules）
6. 添加规则：
   - **Type**: Custom TCP
   - **Port**: 3000
   - **Source**: 0.0.0.0/0（或你的 IP）
7. 同样添加 3001 端口

## 确保服务监听所有接口

Bun 的 `serve()` 默认监听 `0.0.0.0`，但可以显式指定：

### 修改主应用（如果需要）

编辑 `src/index.ts`，确保：

```typescript
const server = serve({
  hostname: "0.0.0.0",  // 监听所有接口
  port: PORT,
  // ...
});
```

### 修改 Queue Server（如果需要）

编辑 `src/server/demo6-server.ts`，确保：

```typescript
const server = serve({
  hostname: "0.0.0.0",  // 监听所有接口
  port: PORT,
  // ...
});
```

## 使用 Nginx 反向代理（推荐生产环境）

### 1. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 2. 配置 Nginx

创建 `/etc/nginx/sites-available/grokforge`:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 或你的服务器 IP

    # 主应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Queue Server API
    location /api/queue/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # SSE 流
    location /stream {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding on;
    }
}
```

### 3. 启用配置

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/grokforge /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 4. 开放 80 端口

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp  # 如果使用 HTTPS
```

## 故障排查步骤

### 1. 检查服务是否运行

```bash
ps aux | grep bun
```

### 2. 检查端口监听

```bash
# 查看监听地址
sudo netstat -tlnp | grep -E ':(3000|3001)'

# 应该看到类似：
# tcp  0  0  0.0.0.0:3000  0.0.0.0:*  LISTEN  12345/bun
# 如果是 127.0.0.1:3000，说明只监听本地
```

### 3. 检查防火墙

```bash
# UFW
sudo ufw status

# firewalld
sudo firewall-cmd --list-all

# iptables
sudo iptables -L -n
```

### 4. 测试本地连接

```bash
# 从服务器本地测试
curl http://localhost:3000
curl http://localhost:3001/health
```

### 5. 测试外部连接

```bash
# 获取服务器 IP
hostname -I

# 从服务器测试外部 IP（应该失败，因为防火墙）
curl http://$(hostname -I | awk '{print $1}'):3000
```

### 6. 从外部测试

```bash
# 从你的本地机器测试
curl http://your-server-ip:3000
```

## 常见问题

### Q: 服务运行但外部无法访问

**可能原因：**
1. 防火墙未开放端口
2. 云服务器安全组未配置
3. 服务只监听 127.0.0.1

**解决方案：**
1. 检查防火墙：`sudo ufw status`
2. 开放端口：`sudo ufw allow 3000/tcp`
3. 检查云服务器安全组
4. 确认服务监听 `0.0.0.0`

### Q: 端口被占用

```bash
# 查找占用端口的进程
sudo lsof -i :3000
sudo lsof -i :3001

# 杀死进程
sudo kill -9 <PID>
```

### Q: 连接被拒绝

**可能原因：**
1. 服务未启动
2. 防火墙阻止
3. 服务只监听本地

**解决方案：**
1. 启动服务
2. 检查防火墙规则
3. 确认监听地址为 `0.0.0.0`

## 安全建议

1. **不要开放所有端口到 0.0.0.0/0**
   - 只开放必要的端口
   - 如果可能，限制来源 IP

2. **使用 Nginx 反向代理**
   - 只开放 80/443 端口
   - 应用监听 localhost

3. **使用 HTTPS**
   - 使用 Let's Encrypt 免费证书
   - 配置 SSL/TLS

4. **限制 Redis 和 Ollama 访问**
   - 只允许 localhost 访问
   - 不要开放到公网

