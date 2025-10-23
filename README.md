# CloudCurio CMS - AI-Powered Blog Content Generator

A comprehensive, AI-powered content management system with deep research capabilities, RAG (Retrieval Augmented Generation), vector database integration, and automated workflow orchestration.

## 🚀 Features

### Core Capabilities
- **AI-Powered Content Generation**: Automated blog article creation using advanced AI models
- **Deep Research Tools**: Automated web scraping, news aggregation, and content extraction
- **RAG (Retrieval Augmented Generation)**: Context-aware content generation with vector similarity search
- **Vector Database**: Qdrant integration for semantic search and content discovery
- **Knowledge Base Management**: Organized storage and retrieval of information
- **Bucket System**: Categorized content organization for research and articles
- **Tag-Based Organization**: Flexible tagging system for content classification

### AI & Research Services
- **LocalAI**: Local AI inference for privacy and cost-effectiveness
- **OpenAI Integration**: Optional cloud-based AI for enhanced capabilities
- **SearXNG**: Privacy-respecting metasearch engine for web research
- **Flowise**: LLM orchestration and flow management
- **News Aggregator**: RSS feed parsing and news collection
- **Content Vectorization**: Automatic embedding generation for semantic search

### Workflow & Automation
- **n8n Integration**: Workflow automation and task scheduling
- **AI Agent Crews**: Coordinated multi-agent systems (ResearchAgent, WriterAgent)
- **Task Management**: Priority-based workflow execution
- **Batch Processing**: Generate multiple articles in sequence
- **Automatic Research**: Tag-based deep research before content generation

### User Interface
- **Web Dashboard**: Modern, responsive interface for content management
- **AI Chatbot**: RAG-powered conversational interface
- **Real-time Updates**: Live workflow status monitoring
- **Article Management**: Full CRUD operations for blog posts
- **Research Dashboard**: View and manage research data

## 🏗️ Architecture

### Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (document storage)
- **Vector DB**: Qdrant (semantic search)
- **Cache**: Redis (session & cache management)
- **AI Services**: LocalAI, OpenAI API
- **Workflow**: n8n (automation)
- **Search**: SearXNG (metasearch)
- **LLM Orchestration**: Flowise

### System Components

```
┌─────────────────────────────────────────────────────┐
│                 Frontend Dashboard                   │
│         (HTML/CSS/JS - Web Interface)               │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│              Express.js API Server                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │Articles  │  │Workflow  │  │Research  │          │
│  │Controller│  │Controller│  │Controller│          │
│  └──────────┘  └──────────┘  └──────────┘          │
└────────┬────────────┬──────────────┬────────────────┘
         │            │              │
    ┌────▼────┐  ┌───▼────┐   ┌────▼─────┐
    │ MongoDB │  │  Redis │   │  Qdrant  │
    │Database │  │ Cache  │   │ VectorDB │
    └─────────┘  └────────┘   └──────────┘
         │
    ┌────▼──────────────────────────────────┐
    │         AI Agent System                │
    │  ┌────────────┐    ┌──────────────┐   │
    │  │  Research  │    │    Writer    │   │
    │  │   Agent    │◄──►│    Agent     │   │
    │  └────────────┘    └──────────────┘   │
    │         ▲                  ▲           │
    │         └──────┬───────────┘           │
    │         ┌──────▼───────┐               │
    │         │     Crew     │               │
    │         │ Coordinator  │               │
    │         └──────────────┘               │
    └────────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │        External Services               │
    │  ┌────────┐  ┌────────┐  ┌─────────┐  │
    │  │LocalAI │  │SearXNG │  │Flowise  │  │
    │  └────────┘  └────────┘  └─────────┘  │
    │  ┌────────┐                            │
    │  │  n8n   │                            │
    │  └────────┘                            │
    └────────────────────────────────────────┘
```

## 📦 Installation

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/cbwinslow/cloudcurio.cc-CMS.git
cd cloudcurio.cc-CMS
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start all services with Docker Compose**
```bash
docker-compose up -d
```

4. **Install dependencies (for local development)**
```bash
npm install
```

5. **Start the development server**
```bash
npm run dev
```

### Service URLs
- **CMS Dashboard**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api
- **n8n Workflow**: http://localhost:5678 (admin/changeme)
- **Flowise**: http://localhost:3000 (admin/changeme)
- **SearXNG**: http://localhost:8888
- **Qdrant Dashboard**: http://localhost:6333/dashboard

## 🎯 Usage

### Generate an Article via API

```bash
curl -X POST http://localhost:3001/api/workflow/generate-article \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "The Future of Artificial Intelligence",
    "tags": ["ai", "technology", "future"]
  }'
```

### Generate via Web Dashboard

1. Open http://localhost:3001 in your browser
2. Navigate to the "Generate Article" tab
3. Enter topic and tags
4. Click "Generate Article"
5. Wait for the workflow to complete
6. View the generated article in the "Articles" tab

### Batch Generation

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

### Chat with RAG

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the latest AI trends?",
    "context": {
      "collections": ["articles", "knowledge_base"],
      "tags": ["ai", "technology"]
    }
  }'
```

## 📡 API Endpoints

### Articles
- `GET /api/articles` - List all articles
- `GET /api/articles/:id` - Get article by ID
- `GET /api/articles/slug/:slug` - Get article by slug
- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `POST /api/articles/:id/publish` - Publish article

### Workflow
- `POST /api/workflow/generate-article` - Generate single article
- `POST /api/workflow/batch-generate` - Batch generate articles
- `GET /api/workflow/tasks` - List workflow tasks
- `POST /api/workflow/process-pending` - Process pending tasks

### Research
- `POST /api/research` - Perform research on topic
- `POST /api/research/deep-research` - Deep research with sources
- `GET /api/research` - List research data
- `GET /api/research/news` - Aggregate latest news

### Chat & AI
- `POST /api/chat` - Chat with RAG
- `POST /api/chat/generate` - Generate content
- `POST /api/chat/summarize` - Summarize content

### Buckets
- `GET /api/buckets` - List all buckets
- `POST /api/buckets` - Create bucket
- `GET /api/buckets/:id` - Get bucket contents

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```env
# AI Services
OPENAI_API_KEY=your-key-here          # Optional: for OpenAI
LOCALAI_URL=http://localhost:8080     # LocalAI endpoint

# Databases
MONGODB_URI=mongodb://...              # MongoDB connection
QDRANT_URL=http://localhost:6333      # Qdrant vector DB

# Workflow & Services
N8N_URL=http://localhost:5678         # n8n automation
FLOWISE_URL=http://localhost:3000     # Flowise orchestration
SEARXNG_URL=http://localhost:8888     # SearXNG search

# AI Model Configuration
DEFAULT_AI_MODEL=gpt-3.5-turbo        # Default model
DEFAULT_TEMPERATURE=0.7               # Generation temperature
MAX_TOKENS=2000                       # Max tokens per request
```

## 🤖 AI Agents

### ResearchAgent
Performs deep research on topics using multiple sources:
- Web search via SearXNG
- News aggregation from RSS feeds
- Content extraction and parsing
- Automatic summarization
- Key point extraction

### WriterAgent
Generates high-quality blog content:
- Article generation from research
- SEO optimization
- Automatic excerpt creation
- Tag generation
- Markdown formatting

### CrewCoordinator
Orchestrates multi-agent workflows:
- Sequential task execution
- Error handling and retry logic
- Progress tracking
- Batch processing support

## 📊 Workflow System

### Article Generation Workflow

1. **Research Phase**
   - ResearchAgent searches web and news sources
   - Extracts and parses relevant content
   - Generates summary and key points
   - Stores in vector database

2. **Writing Phase**
   - WriterAgent uses research data
   - Generates article with AI
   - Creates excerpt and tags
   - Stores in database and vector DB

3. **Review Phase** (manual)
   - View generated article
   - Edit if needed
   - Publish when ready

## 🔒 Security

- Helmet.js for HTTP security headers
- CORS configuration
- Input validation with express-validator
- Environment variable protection
- Secure credential storage

## 🧪 Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Docker Commands
```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please use the GitHub issue tracker.

## 🎉 Acknowledgments

- OpenAI for AI capabilities
- Qdrant for vector database
- n8n for workflow automation
- SearXNG for privacy-respecting search
- All open-source contributors

---

Built with ❤️ by CloudCurio Team