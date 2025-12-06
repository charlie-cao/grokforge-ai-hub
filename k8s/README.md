# Kubernetes 部署指南

## 概述

本目录包含将 GrokForge AI Hub 部署到 Kubernetes 集群所需的所有配置文件。

## 前置要求

1. **Kubernetes 集群** (v1.20+)
2. **kubectl** 已配置并连接到集群
3. **Docker 镜像** 已推送到镜像仓库
4. **存储类 (StorageClass)** 已配置（用于 PersistentVolume）

## 快速开始

### 1. 构建并推送 Docker 镜像

```bash
# 构建镜像
docker build -t your-registry/grokforge-app:latest -f Dockerfile .
docker build -t your-registry/grokforge-queue:latest -f Dockerfile.queue .
docker build -t your-registry/grokforge-scheduler:latest -f Dockerfile.scheduler .

# 推送镜像
docker push your-registry/grokforge-app:latest
docker push your-registry/grokforge-queue:latest
docker push your-registry/grokforge-scheduler:latest
```

### 2. 更新镜像地址

编辑以下文件，替换 `your-registry` 为你的镜像仓库地址：

- `k8s/app.yaml`
- `k8s/queue-server.yaml`
- `k8s/scheduler-server.yaml`
- `k8s/kustomization.yaml` (如果使用 kustomize)

### 3. 配置 Secrets（可选）

如果需要 Redis 密码或其他密钥：

```bash
# 复制示例文件
cp k8s/secrets.yaml.example k8s/secrets.yaml

# 编辑并填入真实值
# 然后应用
kubectl apply -f k8s/secrets.yaml
```

### 4. 部署

#### 方式 1: 使用 kubectl（推荐）

```bash
# 创建命名空间
kubectl apply -f k8s/namespace.yaml

# 创建配置
kubectl apply -f k8s/configmap.yaml

# 创建持久化存储
kubectl apply -f k8s/persistent-volumes.yaml

# 部署服务（按依赖顺序）
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/ollama.yaml
kubectl apply -f k8s/queue-server.yaml
kubectl apply -f k8s/scheduler-server.yaml
kubectl apply -f k8s/app.yaml

# 可选：部署 Ingress
kubectl apply -f k8s/ingress.yaml
```

#### 方式 2: 使用 kustomize

```bash
kubectl apply -k k8s/
```

### 5. 检查部署状态

```bash
# 查看所有资源
kubectl get all -n grokforge

# 查看 Pod 状态
kubectl get pods -n grokforge

# 查看服务
kubectl get svc -n grokforge

# 查看日志
kubectl logs -f deployment/app -n grokforge
kubectl logs -f deployment/queue-server -n grokforge
kubectl logs -f deployment/ollama -n grokforge
```

## 配置说明

### 存储配置

- **Redis 数据**: 1Gi (PersistentVolumeClaim)
- **Ollama 模型**: 20Gi (PersistentVolumeClaim) - 用于存储 AI 模型
- **应用数据**: 5Gi (PersistentVolumeClaim) - 用于 SQLite 数据库等

### 资源限制

默认资源配置：

- **App**: 256Mi-512Mi 内存, 100m-500m CPU
- **Queue Server**: 256Mi-512Mi 内存, 100m-500m CPU
- **Scheduler**: 256Mi-512Mi 内存, 100m-500m CPU
- **Redis**: 256Mi-512Mi 内存, 100m-500m CPU
- **Ollama**: 2Gi-8Gi 内存, 500m-2000m CPU（AI 模型需要更多资源）

### 扩缩容

```bash
# 扩展应用实例
kubectl scale deployment app -n grokforge --replicas=3

# 使用 HPA (Horizontal Pod Autoscaler)
kubectl autoscale deployment app -n grokforge --min=2 --max=10 --cpu-percent=80
```

## 使用外部服务

### 使用外部 Redis

如果使用云 Redis 服务（如 AWS ElastiCache, Google Cloud Memorystore）：

1. 更新 `k8s/configmap.yaml` 中的 `REDIS_HOST`
2. 删除 `k8s/redis.yaml` 部署

### 使用外部 Ollama

如果使用外部 Ollama 服务：

1. 更新 `k8s/configmap.yaml` 中的 `OLLAMA_HOST` 和 `OLLAMA_PORT`
2. 删除 `k8s/ollama.yaml` 部署

## 网络配置

### Service 类型

- **App Service**: `LoadBalancer` (外部访问) 或 `ClusterIP` (仅内部)
- **其他服务**: `ClusterIP` (仅内部访问)

### Ingress

如果需要域名访问，配置 `k8s/ingress.yaml`：

1. 安装 Ingress Controller (nginx, traefik 等)
2. 更新 `k8s/ingress.yaml` 中的域名
3. 应用配置：`kubectl apply -f k8s/ingress.yaml`

## 监控和日志

### 查看日志

```bash
# 所有 Pod 日志
kubectl logs -f -l app=grokforge-app -n grokforge

# 特定 Pod
kubectl logs -f deployment/app -n grokforge
```

### 健康检查

所有服务都配置了健康检查：

- **Liveness Probe**: 检测容器是否存活
- **Readiness Probe**: 检测容器是否就绪

## 故障排查

### Pod 无法启动

```bash
# 查看 Pod 状态
kubectl describe pod <pod-name> -n grokforge

# 查看事件
kubectl get events -n grokforge --sort-by='.lastTimestamp'
```

### 存储问题

```bash
# 查看 PVC 状态
kubectl get pvc -n grokforge

# 查看 PV 状态
kubectl get pv
```

### 网络问题

```bash
# 测试服务连接
kubectl run -it --rm debug --image=busybox --restart=Never -n grokforge -- sh
# 在容器内测试
wget -O- http://app-service:80
wget -O- http://redis-service:6379
```

## 清理

```bash
# 删除所有资源
kubectl delete namespace grokforge

# 或逐个删除
kubectl delete -f k8s/
```

## 生产环境建议

1. **使用 Secrets** 管理敏感信息（Redis 密码、API 密钥等）
2. **配置 ResourceQuota** 限制命名空间资源
3. **使用 NetworkPolicy** 限制网络访问
4. **配置 PodDisruptionBudget** 确保高可用
5. **使用 HPA** 自动扩缩容
6. **配置监控** (Prometheus, Grafana)
7. **配置日志聚合** (ELK, Loki)
8. **定期备份** PersistentVolume 数据

## 示例：完整部署脚本

```bash
#!/bin/bash

# 设置变量
NAMESPACE="grokforge"
REGISTRY="your-registry"

# 构建并推送镜像
docker build -t ${REGISTRY}/grokforge-app:latest -f Dockerfile .
docker build -t ${REGISTRY}/grokforge-queue:latest -f Dockerfile.queue .
docker build -t ${REGISTRY}/grokforge-scheduler:latest -f Dockerfile.scheduler .

docker push ${REGISTRY}/grokforge-app:latest
docker push ${REGISTRY}/grokforge-queue:latest
docker push ${REGISTRY}/grokforge-scheduler:latest

# 更新镜像地址（使用 sed）
sed -i "s|your-registry|${REGISTRY}|g" k8s/*.yaml

# 部署
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/persistent-volumes.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/ollama.yaml
kubectl apply -f k8s/queue-server.yaml
kubectl apply -f k8s/scheduler-server.yaml
kubectl apply -f k8s/app.yaml

# 等待就绪
kubectl wait --for=condition=ready pod -l app=grokforge-app -n ${NAMESPACE} --timeout=300s

echo "部署完成！"
```

