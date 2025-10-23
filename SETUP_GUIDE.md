# CloudCurio CMS Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker Desktop** (v20.10+)
- **Docker Compose** (v2.0+)
- **Node.js** (v18.0+)
- **Git**

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/cbwinslow/cloudcurio.cc-CMS.git
cd cloudcurio.cc-CMS
```

### 2. Environment Configuration

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env` with your preferred editor:

```bash
nano .env
# or
vim .env
```

**Required Configuration:**

```env
# Server
NODE_ENV=development
PORT=3001

# MongoDB (use the Docker service or external)
MONGODB_URI=mongodb://admin:changeme@localhost:27017/cloudcurio_cms?authSource=admin

# Vector Database
QDRANT_URL=http://localhost:6333

# AI Services
LOCALAI_URL=http://localhost:8080
# OPENAI_API_KEY=sk-...  # Optional: Add for OpenAI support

# Other Services
N8N_URL=http://localhost:5678
FLOWISE_URL=http://localhost:3000
SEARXNG_URL=http://localhost:8888
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-random-secret-key-change-this
```

### 3. Start Services with Docker

Start all required services:

```bash
docker-compose up -d
```

This will start:
- MongoDB (port 27017)
- Qdrant (port 6333)
- LocalAI (port 8080)
- n8n (port 5678)
- SearXNG (port 8888)
- Flowise (port 3000)
- Redis (port 6379)

Check service status:

```bash
docker-compose ps
```

View logs:

```bash
docker-compose logs -f
```

### 4. Install Node.js Dependencies

```bash
npm install
```

### 5. Start the Application

**Development Mode:**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

The server will start on `http://localhost:3001`

### 6. Verify Installation

Check the health endpoint:

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "services": {
    "mongodb": "connected",
    "qdrant": "connected",
    "api": "running"
  }
}
```

## Accessing Services

### Main Application
- **Web Dashboard**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api

### External Services
- **n8n Workflow**: http://localhost:5678
  - Username: `admin`
  - Password: `changeme`
  
- **Flowise**: http://localhost:3000
  - Username: `admin`
  - Password: `changeme`
  
- **SearXNG Search**: http://localhost:8888
  
- **Qdrant Dashboard**: http://localhost:6333/dashboard

## Quick Start Tutorial

### 1. Generate Your First Article

Open your browser and navigate to http://localhost:3001

1. Click on the "Generate Article" tab
2. Enter a topic: `The Benefits of Cloud Computing`
3. Add tags: `cloud, technology, computing`
4. Click "🚀 Generate Article"
5. Wait for the process to complete (1-2 minutes)

### 2. View Generated Article

1. Click on the "Articles" tab
2. You'll see your newly generated article
3. Click on it to view full content

### 3. Using the API

Generate an article via API:

```bash
curl -X POST http://localhost:3001/api/workflow/generate-article \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Artificial Intelligence in Healthcare",
    "tags": ["ai", "healthcare", "technology"]
  }'
```

### 4. Chat with AI

1. Click on the "AI Chat" tab
2. Type a question: `What are the latest trends in AI?`
3. Press Send
4. The system will search the knowledge base and provide an answer

### 5. Batch Generation

Generate multiple articles at once:

```bash
curl -X POST http://localhost:3001/api/workflow/batch-generate \
  -H "Content-Type: application/json" \
  -d '{
    "topics": [
      {"topic": "Machine Learning Basics", "tags": ["ml", "ai"]},
      {"topic": "Cloud Computing Trends", "tags": ["cloud", "devops"]},
      {"topic": "Cybersecurity Best Practices", "tags": ["security"]}
    ]
  }'
```

## Advanced Configuration

### Using OpenAI Instead of LocalAI

If you have an OpenAI API key, add it to your `.env`:

```env
OPENAI_API_KEY=sk-your-key-here
```

The system will automatically use OpenAI for better quality results.

### Customizing AI Models

In `.env`, configure:

```env
DEFAULT_AI_MODEL=gpt-3.5-turbo  # or gpt-4
DEFAULT_TEMPERATURE=0.7
MAX_TOKENS=2000
```

### Adding News API Keys

For enhanced news aggregation:

```env
NEWS_API_KEY=your-newsapi-key
GNEWS_API_KEY=your-gnews-key
```

## Troubleshooting

### Services Not Starting

Check Docker logs:

```bash
docker-compose logs [service-name]
```

Restart a specific service:

```bash
docker-compose restart [service-name]
```

### MongoDB Connection Issues

1. Ensure MongoDB is running:
   ```bash
   docker-compose ps mongodb
   ```

2. Check MongoDB logs:
   ```bash
   docker-compose logs mongodb
   ```

3. Verify connection string in `.env`

### Qdrant Connection Issues

1. Check if Qdrant is running:
   ```bash
   curl http://localhost:6333/collections
   ```

2. View Qdrant logs:
   ```bash
   docker-compose logs qdrant
   ```

### LocalAI Not Responding

LocalAI may take time to download models on first run.

Check status:

```bash
docker-compose logs localai
```

If issues persist, you can use OpenAI by adding an API key.

### Port Conflicts

If ports are already in use, edit `docker-compose.yml` to change port mappings:

```yaml
ports:
  - "3002:3001"  # Change 3002 to any available port
```

## Development Tips

### Hot Reload

The dev server uses nodemon for automatic restart on code changes:

```bash
npm run dev
```

### Running Tests

```bash
npm test
```

### Linting Code

```bash
npm run lint
```

### Database Management

Access MongoDB shell:

```bash
docker-compose exec mongodb mongosh -u admin -p changeme
```

View collections:

```javascript
use cloudcurio_cms
show collections
db.articles.find().pretty()
```

### Stopping Services

Stop all services:

```bash
docker-compose down
```

Stop and remove volumes (⚠️ deletes all data):

```bash
docker-compose down -v
```

## Production Deployment

### 1. Update Environment

Set production environment:

```env
NODE_ENV=production
```

Update passwords and secrets:

```env
JWT_SECRET=use-a-strong-random-secret
MONGODB_URI=mongodb://user:strong-password@mongo-host/db
```

### 2. Build Docker Image

```bash
docker build -t cloudcurio-cms:latest .
```

### 3. Use Production Compose

Create `docker-compose.prod.yml` with production settings.

### 4. Enable HTTPS

Use a reverse proxy (Nginx) with SSL certificates:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5. Set Up Monitoring

- Configure log aggregation (ELK Stack)
- Set up uptime monitoring
- Configure alerts
- Enable metrics collection

## Backup and Recovery

### Backup MongoDB

```bash
docker-compose exec mongodb mongodump \
  --uri="mongodb://admin:changeme@localhost:27017" \
  --out=/data/backup
```

### Backup Qdrant

```bash
docker-compose exec qdrant tar -czf \
  /qdrant/storage/backup.tar.gz /qdrant/storage
```

### Restore

```bash
docker-compose exec mongodb mongorestore \
  --uri="mongodb://admin:changeme@localhost:27017" \
  /data/backup
```

## Getting Help

- **Documentation**: Check README.md and ARCHITECTURE.md
- **Issues**: GitHub Issues tracker
- **Logs**: Check application and Docker logs
- **Community**: Join our Discord/Slack community

## Next Steps

1. **Customize AI prompts** in `src/services/aiService.js`
2. **Add custom workflows** in n8n
3. **Configure SearXNG engines** in `config/searxng/settings.yml`
4. **Create custom agents** extending the base agent pattern
5. **Build custom UI components** in the public folder

## Security Best Practices

1. Change all default passwords
2. Use strong JWT secrets
3. Enable HTTPS in production
4. Regularly update dependencies
5. Implement rate limiting
6. Add authentication middleware
7. Configure CORS properly
8. Use environment variables for secrets
9. Regular backups
10. Monitor for security vulnerabilities

---

**Congratulations!** You now have a fully functional AI-powered blog CMS.

For more information, visit the [GitHub repository](https://github.com/cbwinslow/cloudcurio.cc-CMS).
