# Deployment Guide - Brain Tumor Detection API

Complete guide for deploying the Brain Tumor Detection API to various platforms.

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Platforms](#cloud-platforms)
4. [Production Setup](#production-setup)
5. [Monitoring & Logging](#monitoring--logging)

---

## Local Development

### Setup

```bash
# Clone repository
cd server

# Create virtual environment
python -m venv venv

# Activate environment (Windows)
venv\Scripts\activate

# Activate environment (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run application
python app.py
```

The API will be available at `http://localhost:5000`

---

## Docker Deployment

### Quick Start with Docker Compose

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t brain-tumor-api:latest .

# Run container
docker run -p 5000:5000 -v $(pwd)/model:/app/model brain-tumor-api:latest

# Windows PowerShell
docker run -p 5000:5000 -v ${PWD}/model:/app/model brain-tumor-api:latest
```

### Docker with GPU Support

```bash
# Build with GPU support
docker build --build-arg CUDA_VERSION=11.8 -t brain-tumor-api:gpu .

# Run with GPU
docker run --gpus all -p 5000:5000 -v $(pwd)/model:/app/model brain-tumor-api:gpu
```

---

## Cloud Platforms

### AWS EC2

1. **Launch Instance**
   - Ubuntu 22.04 LTS
   - t3.medium or larger (for model inference)
   - Security group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **SSH into instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Python and dependencies
   sudo apt install -y python3.11 python3-pip python3-venv git
   
   # Clone repository
   git clone <your-repo-url>
   cd server
   
   # Setup virtual environment
   python3 -m venv venv
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Run with gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

4. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt install -y nginx
   ```
   
   Create `/etc/nginx/sites-available/brain-tumor-api`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_read_timeout 120s;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/brain-tumor-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### AWS ECS (Docker Container Service)

1. **Push to ECR**
   ```bash
   # Login to ECR
   aws ecr get-login-password | docker login --username AWS --password-stdin your-account-id.dkr.ecr.region.amazonaws.com
   
   # Tag image
   docker tag brain-tumor-api:latest your-account-id.dkr.ecr.region.amazonaws.com/brain-tumor-api:latest
   
   # Push image
   docker push your-account-id.dkr.ecr.region.amazonaws.com/brain-tumor-api:latest
   ```

2. **Create ECS Task Definition**
   - Use ECR image
   - Set port 5000
   - Set memory to 2048 MB
   - Set CPU to 1024

3. **Create Service**
   - Select VPC and subnets
   - Attach load balancer
   - Set desired count to 2+ (for high availability)

### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/your-project-id/brain-tumor-api

# Deploy
gcloud run deploy brain-tumor-api \
  --image gcr.io/your-project-id/brain-tumor-api \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --timeout 120 \
  --allow-unauthenticated
```

### Microsoft Azure Container Instances

```bash
# Create resource group
az group create --name myResourceGroup --location eastus

# Create container registry
az acr create --resource-group myResourceGroup --name myregistry --sku Basic

# Build and push
az acr build --registry myregistry --image brain-tumor-api:latest .

# Deploy
az container create \
  --resource-group myResourceGroup \
  --name brain-tumor-api \
  --image myregistry.azurecr.io/brain-tumor-api:latest \
  --cpu 2 \
  --memory 2 \
  --ports 5000 \
  --registry-login-server myregistry.azurecr.io \
  --registry-username <username> \
  --registry-password <password>
```

### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create brain-tumor-api

# Create Procfile
echo "web: gunicorn -w 4 -b 0.0.0.0:\$PORT app:app" > Procfile

# Deploy
git push heroku main

# View logs
heroku logs -f
```

---

## Production Setup

### Systemd Service (Linux)

Create `/etc/systemd/system/brain-tumor-api.service`:

```ini
[Unit]
Description=Brain Tumor Detection API
After=network.target

[Service]
Type=notify
User=appuser
WorkingDirectory=/home/appuser/brain-tumor-api/server
Environment="PATH=/home/appuser/brain-tumor-api/server/venv/bin"
ExecStart=/home/appuser/brain-tumor-api/server/venv/bin/gunicorn \
    -w 4 \
    -b 0.0.0.0:5000 \
    --timeout 120 \
    --access-logfile /var/log/brain-tumor-api/access.log \
    --error-logfile /var/log/brain-tumor-api/error.log \
    app:app

Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable brain-tumor-api
sudo systemctl start brain-tumor-api
```

### Nginx Configuration (Production)

```nginx
upstream brain_tumor_api {
    server 127.0.0.1:5000 fail_timeout=0;
}

server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://brain_tumor_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        proxy_read_timeout 120s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }

    # Cache health check responses
    location /health {
        proxy_pass http://brain_tumor_api;
        proxy_cache_valid 200 10s;
        access_log off;
    }
}

# HTTPS (after setting up SSL)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # ... rest of config
}
```

### Performance Tuning

1. **Gunicorn Workers**
   ```bash
   # CPU-bound: (2 * CPU cores) + 1
   gunicorn -w 5 app:app  # For 2-core machine
   ```

2. **Nginx Settings**
   ```nginx
   worker_processes auto;
   keepalive_timeout 65;
   ```

3. **TensorFlow GPU**
   ```bash
   pip install tensorflow[and-cuda]
   ```

---

## Monitoring & Logging

### Application Monitoring

1. **Health Endpoint**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Prometheus Metrics** (Optional integration)
   ```python
   from prometheus_flask_exporter import PrometheusMetrics
   
   metrics = PrometheusMetrics(app)
   ```

3. **Application Insights** (Azure)
   ```python
   from azure.monitor.opentelemetry import configure_azure_monitor
   
   configure_azure_monitor()
   ```

### Logging Setup

1. **File Logging**
   ```python
   import logging
   from logging.handlers import RotatingFileHandler
   
   handler = RotatingFileHandler('app.log', maxBytes=10485760, backupCount=10)
   app.logger.addHandler(handler)
   ```

2. **Cloud Logging**
   - AWS CloudWatch
   - Google Cloud Logging
   - Azure Monitor
   - ELK Stack (Elasticsearch, Logstash, Kibana)

### Uptime Monitoring

1. **Uptime Robot**
   - Monitor `/health` endpoint
   - Alert on failures

2. **Cloud Monitoring**
   - AWS CloudWatch
   - Google Cloud Monitoring
   - Azure Monitor

---

## Security Considerations

1. **API Authentication** (if needed)
   ```python
   from flask_httpauth import HTTPBearer
   
   auth = HTTPBearer()
   
   @app.route("/predict", methods=["POST"])
   @auth.login_required
   def predict():
       # ...
   ```

2. **Rate Limiting**
   ```python
   from flask_limiter import Limiter
   
   limiter = Limiter(app, key_func=lambda: request.remote_addr)
   
   @app.route("/predict", methods=["POST"])
   @limiter.limit("10 per minute")
   def predict():
       # ...
   ```

3. **CORS Configuration**
   ```python
   CORS(app, resources={
       r"/predict": {"origins": ["https://your-frontend.com"]}
   })
   ```

4. **Environment Variables**
   - Never commit `.env` files
   - Use secrets management (AWS Secrets Manager, Azure Key Vault)
   - Rotate sensitive credentials regularly

---

## Backup & Recovery

1. **Model Backup**
   ```bash
   aws s3 cp model/brain_tumor_cnn_model.h5 s3://your-bucket/backups/
   ```

2. **Database Backup** (if using database)
   - Automated snapshots
   - Point-in-time recovery
   - Cross-region replication

---

## Scaling

1. **Horizontal Scaling**
   - Load balancer setup
   - Multiple service instances
   - Container orchestration (Kubernetes)

2. **Vertical Scaling**
   - Increase server resources
   - GPU acceleration
   - Larger memory allocation

---

## Troubleshooting

### High Latency
- Check GPU availability
- Increase Gunicorn workers
- Use model quantization

### Out of Memory
- Reduce batch size
- Use smaller model variant
- Implement request queuing

### High CPU Usage
- Use GPU
- Implement caching
- Reduce model complexity

---

For questions or issues, refer to the main README.md or QUICKSTART.md
