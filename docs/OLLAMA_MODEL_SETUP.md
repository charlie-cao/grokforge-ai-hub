# Ollama 模型配置说明

## 自动安装模型

Ollama 容器现在会在首次启动时自动拉取 `qwen3:latest` 模型。

**配置位置：** `docker-compose.yml`

```yaml
command: >
  sh -c "ollama serve & 
  sleep 10 && 
  ollama pull qwen3:latest || true && 
  wait"
```

**说明：**
- `|| true` 确保即使模型已存在也不会失败
- 首次启动会下载模型（可能需要几分钟，取决于网络速度）
- 模型会保存在 `./data/ollama` 目录中

## 模型数据目录

模型数据现在使用**绑定挂载**（bind mount）而不是 Docker 卷，方便管理：

**配置：**
```yaml
volumes:
  - "${OLLAMA_DATA_DIR:-./data/ollama}:/root/.ollama"
```

**默认位置：** `./data/ollama`

**自定义位置：**
```bash
# 设置环境变量
export OLLAMA_DATA_DIR=/path/to/your/models

# 然后启动
make run
```

## 手动管理模型

### 查看已安装的模型
```bash
docker exec grokforge-ollama ollama list
```

### 手动拉取模型
```bash
docker exec grokforge-ollama ollama pull qwen3:latest
```

### 删除模型
```bash
docker exec grokforge-ollama ollama rm qwen3:latest
```

### 查看模型文件位置
```bash
# Windows
dir data\ollama

# Linux/macOS
ls -lh data/ollama
```

## 禁用自动拉取

如果不想自动拉取模型，可以注释掉 `command` 部分：

```yaml
# command: >
#   sh -c "ollama serve & 
#   sleep 10 && 
#   ollama pull qwen3:latest || true && 
#   wait"
```

然后手动拉取：
```bash
docker exec grokforge-ollama ollama pull qwen3:latest
```

## 模型大小

- `qwen3:latest` 大约 2-4GB（取决于具体版本）
- 模型文件保存在 `./data/ollama/models/` 目录
- 可以通过删除目录来释放空间

## 跨容器共享模型

由于使用绑定挂载，多个 Ollama 容器可以共享同一个模型目录：

```yaml
volumes:
  - "./data/ollama:/root/.ollama"  # 所有容器共享
```

