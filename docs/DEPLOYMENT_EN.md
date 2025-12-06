# Containerized Deployment Guide

This guide will help you deploy GrokForge AI Hub to a server using Docker.

## 📋 Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- At least 4GB available RAM
- At least 10GB available disk space (for Ollama models)

## 🚀 Quick Deployment

### Method 1: Using Docker Compose (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/charlie-cao/grokforge-ai-hub.git
cd grokforge-ai-hub
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env file with your configuration
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Check service status**
```bash
docker-compose ps
```

5. **View logs**
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f queue-server
```

### Method 2: Deploy Services Individually

#### 1. Start Redis
```bash
docker-compose -f docker-compose.demo6.yml up -d redis
```

#### 2. Start Ollama (if using containerized)
```bash
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama-data:/root/.ollama \
  ollama/ollama:latest

# Pull model
docker exec -it ollama ollama pull qwen3:latest
```

#### 3. Build application image
```bash
docker build -t grokforge-ai-hub:latest .
```

#### 4. Run application container
```bash
docker run -d \
  --name grokforge-app \
  -p 3000:3000 \
  --link redis:redis \
  --link ollama:ollama \
  -e REDIS_HOST=redis \
  -e OLLAMA_HOST=ollama \
  grokforge-ai-hub:latest
```

## 🔧 Configuration

### Environment Variables

Create `.env` file and configure the following variables:

```env
# Application port
APP_PORT=3000

# Queue server port
QUEUE_PORT=3001

# Redis configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password  # Recommended for production

# Ollama configuration
OLLAMA_HOST=ollama  # Or external Ollama service address
OLLAMA_PORT=11434
OLLAMA_MODEL=qwen3:latest

# CORS configuration (recommend specific domain for production)
CORS_ORIGIN=https://yourdomain.com
```

### Port Mapping

- **3000**: Main application (frontend + API)
- **3001**: Queue server (Demo6)
- **6379**: Redis
- **11434**: Ollama

## 🏗️ Production Deployment

### 1. Using External Redis (Recommended)

If you have an existing Redis service, modify `docker-compose.yml`:

```yaml
services:
  app:
    environment:
      - REDIS_HOST=your-redis-host.com
      - REDIS_PORT=6379
      - REDIS_PASSWORD=your-password
    # Remove depends_on: redis
```

### 2. Using External Ollama

If you have an existing Ollama service, modify `docker-compose.yml`:

```yaml
services:
  app:
    environment:
      - OLLAMA_HOST=your-ollama-host.com
      - OLLAMA_PORT=11434
    # Remove depends_on: ollama
```

### 3. Using Reverse Proxy (Nginx)

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

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

### 4. Using HTTPS (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

## 📊 Monitoring and Maintenance

### Check container status
```bash
docker-compose ps
```

### View resource usage
```bash
docker stats
```

### Restart services
```bash
docker-compose restart app
docker-compose restart queue-server
```

### Update application
```bash
# Pull latest code
git pull

# Rebuild images
docker-compose build

# Restart services
docker-compose up -d
```

### Backup data
```bash
# Backup Redis data
docker exec grokforge-redis redis-cli SAVE
docker cp grokforge-redis:/data/dump.rdb ./backup/

# Backup Ollama models
docker cp grokforge-ollama:/root/.ollama ./backup/ollama-data
```

## 🔒 Security Recommendations

1. **Set Redis password**
```env
REDIS_PASSWORD=strong-random-password
```

2. **Limit CORS origins**
```env
CORS_ORIGIN=https://yourdomain.com
```

3. **Use non-root user** (already configured in Dockerfile)

4. **Regularly update images**
```bash
docker-compose pull
docker-compose up -d
```

5. **Configure firewall**
```bash
# Only open necessary ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 🐛 Troubleshooting

### Container won't start
```bash
# View detailed logs
docker-compose logs app

# Check port usage
netstat -tulpn | grep :3000
```

### Redis connection failed
```bash
# Test Redis connection
docker exec grokforge-redis redis-cli ping

# Check Redis logs
docker-compose logs redis
```

### Ollama model not loaded
```bash
# Enter Ollama container
docker exec -it grokforge-ollama sh

# Manually pull model
ollama pull qwen3:latest

# Check model list
ollama list
```

### Out of memory
If you encounter memory issues:
1. Increase server RAM
2. Limit container memory:
```yaml
services:
  ollama:
    deploy:
      resources:
        limits:
          memory: 4G
```

## 📈 Performance Optimization

### 1. Use multi-stage builds
Already implemented to reduce image size.

### 2. Enable Redis persistence
Already configured with `--appendonly yes`.

### 3. Configure Ollama cache
Ollama automatically caches models, no extra configuration needed.

### 4. Use CDN (optional)
Deploy static assets to CDN for faster loading.

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/grokforge-ai-hub
            git pull
            docker-compose build
            docker-compose up -d
```

## 📝 Deployment Checklist

Pre-deployment checklist:

- [ ] Environment variables configured
- [ ] Redis password set (production)
- [ ] CORS origins limited (production)
- [ ] Firewall rules configured
- [ ] SSL certificate configured (HTTPS)
- [ ] Backup strategy in place
- [ ] Monitoring tools configured
- [ ] Log collection configured

## 🆘 Getting Help

If you encounter issues:

1. Check logs: `docker-compose logs`
2. Check GitHub Issues
3. Open a new Issue

---

**Happy deploying!** 🚀

