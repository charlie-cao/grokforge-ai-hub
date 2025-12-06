#!/bin/bash
# Kubernetes 部署脚本

set -e

NAMESPACE="grokforge"
REGISTRY="${DOCKER_REGISTRY:-your-registry}"

echo "🚀 开始部署 GrokForge AI Hub 到 Kubernetes..."

# 检查 kubectl
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl 未安装，请先安装 kubectl"
    exit 1
fi

# 检查集群连接
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ 无法连接到 Kubernetes 集群，请检查 kubeconfig"
    exit 1
fi

# 更新镜像地址
if [ "$REGISTRY" != "your-registry" ]; then
    echo "📝 更新镜像地址为: $REGISTRY"
    find k8s -name "*.yaml" -type f -exec sed -i.bak "s|your-registry|${REGISTRY}|g" {} \;
    find k8s -name "*.yaml.bak" -delete
fi

# 创建命名空间
echo "📦 创建命名空间..."
kubectl apply -f k8s/namespace.yaml

# 创建配置
echo "⚙️  创建配置..."
kubectl apply -f k8s/configmap.yaml

# 创建持久化存储
echo "💾 创建持久化存储..."
kubectl apply -f k8s/persistent-volumes.yaml

# 等待 PVC 就绪
echo "⏳ 等待存储就绪..."
kubectl wait --for=condition=Bound pvc/redis-data-pvc -n ${NAMESPACE} --timeout=60s || true
kubectl wait --for=condition=Bound pvc/ollama-models-pvc -n ${NAMESPACE} --timeout=60s || true
kubectl wait --for=condition=Bound pvc/app-data-pvc -n ${NAMESPACE} --timeout=60s || true

# 部署 Redis
echo "🔴 部署 Redis..."
kubectl apply -f k8s/redis.yaml

# 部署 Ollama
echo "🤖 部署 Ollama..."
kubectl apply -f k8s/ollama.yaml

# 等待基础服务就绪
echo "⏳ 等待基础服务就绪..."
kubectl wait --for=condition=ready pod -l app=redis -n ${NAMESPACE} --timeout=300s || true

# 部署队列服务器
echo "📨 部署队列服务器..."
kubectl apply -f k8s/queue-server.yaml

# 部署调度服务器
echo "⏰ 部署调度服务器..."
kubectl apply -f k8s/scheduler-server.yaml

# 部署主应用
echo "🌐 部署主应用..."
kubectl apply -f k8s/app.yaml

# 等待应用就绪
echo "⏳ 等待应用就绪..."
kubectl wait --for=condition=ready pod -l app=grokforge-app -n ${NAMESPACE} --timeout=300s || true

# 显示状态
echo ""
echo "✅ 部署完成！"
echo ""
echo "📊 服务状态:"
kubectl get all -n ${NAMESPACE}

echo ""
echo "🌐 访问应用:"
echo "  - 内部访问: http://app-service.${NAMESPACE}.svc.cluster.local"
echo "  - 外部访问: kubectl port-forward -n ${NAMESPACE} svc/app-service 3000:80"
echo ""
echo "📝 查看日志:"
echo "  kubectl logs -f deployment/app -n ${NAMESPACE}"

