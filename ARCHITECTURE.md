# CloudCurio CMS Architecture

## System Overview

CloudCurio CMS is a comprehensive AI-powered content management system designed for automated blog content generation with deep research capabilities.

## Core Components

### 1. API Server (Express.js)
- RESTful API endpoints
- Request validation and error handling
- CORS and security middleware
- Static file serving

### 2. Database Layer

#### MongoDB (Document Store)
- Articles collection
- ResearchData collection
- KnowledgeBase collection
- WorkflowTask collection
- Bucket collection

#### Qdrant (Vector Database)
- Semantic search capabilities
- Content similarity matching
- RAG context retrieval
- Collections: articles, research_data, knowledge_base

#### Redis (Cache)
- Session storage
- API response caching
- Rate limiting
- Queue management

### 3. AI Services Layer

#### AI Service
- Text generation (OpenAI/LocalAI)
- Article generation
- Summarization
- Tag extraction
- Key point extraction

#### Vector Service
- Embedding generation
- Vector storage and retrieval
- Similarity search
- Vector deletion

#### RAG Service
- Context-aware generation
- Multi-source retrieval
- Confidence scoring
- Source attribution

#### Research Service
- Web search (SearXNG)
- News aggregation (RSS)
- Content extraction
- Page parsing

### 4. AI Agent System

#### ResearchAgent
**Responsibilities:**
- Execute research tasks
- Aggregate data from multiple sources
- Generate summaries
- Extract key points
- Store research in database and vector DB

**Workflow:**
1. Receive topic and tags
2. Search web using SearXNG
3. Aggregate news from RSS feeds
4. Extract content from top URLs
5. Generate summary using AI
6. Extract key points
7. Store in MongoDB and Qdrant
8. Return research ID

#### WriterAgent
**Responsibilities:**
- Generate article content
- Create excerpts
- Generate SEO-friendly slugs
- Tag generation
- Vector embedding creation

**Workflow:**
1. Receive topic, tags, and research ID
2. Fetch research data
3. Generate article using AI
4. Create excerpt
5. Generate additional tags
6. Store article in MongoDB
7. Create vector embedding
8. Store in Qdrant
9. Return article ID

#### CrewCoordinator
**Responsibilities:**
- Orchestrate multi-agent workflows
- Task scheduling and prioritization
- Error handling and retry logic
- Progress tracking

**Workflow Types:**
1. Single article generation
   - Create research task
   - Execute ResearchAgent
   - Create writing task
   - Execute WriterAgent
   - Return results

2. Batch generation
   - Create multiple workflows
   - Execute sequentially
   - Aggregate results
   - Return summary

3. Pending task processing
   - Query pending tasks
   - Execute by priority
   - Update task status
   - Handle errors

### 5. External Services Integration

#### LocalAI
- Local AI inference
- Model hosting
- Embedding generation
- Cost-effective alternative to cloud AI

#### n8n (Workflow Automation)
- Scheduled tasks
- Webhook integrations
- Data transformation
- External API orchestration

#### SearXNG (Metasearch)
- Privacy-respecting search
- Multiple engine aggregation
- JSON API
- Result filtering

#### Flowise (LLM Orchestration)
- Visual flow builder
- Chain management
- Agent configuration
- Prompt templates

## Data Flow

### Article Generation Flow

```
User Request
    ↓
API Endpoint (/api/workflow/generate-article)
    ↓
CrewCoordinator.executeArticleWorkflow()
    ↓
    ├─→ Create Research Task (WorkflowTask)
    │       ↓
    │   ResearchAgent.executeTask()
    │       ↓
    │       ├─→ SearXNG Web Search
    │       ├─→ RSS News Aggregation
    │       ├─→ Content Extraction
    │       │       ↓
    │       ├─→ AI Summarization
    │       ├─→ Key Point Extraction
    │       │       ↓
    │       ├─→ Store in MongoDB (ResearchData)
    │       └─→ Store in Qdrant (vector)
    │               ↓
    │       Return Research ID
    │
    └─→ Create Writing Task (WorkflowTask)
            ↓
        WriterAgent.executeTask()
            ↓
            ├─→ Fetch Research Data
            ├─→ AI Article Generation
            ├─→ Create Excerpt
            ├─→ Generate Tags
            │       ↓
            ├─→ Store in MongoDB (Article)
            └─→ Store in Qdrant (vector)
                    ↓
            Return Article ID
                    ↓
User Response (Article & Research IDs)
```

### RAG Query Flow

```
User Query
    ↓
API Endpoint (/api/chat)
    ↓
RAGService.query()
    ↓
    ├─→ Generate Query Embedding
    │       ↓
    ├─→ Search Qdrant Collections
    │   ├─→ articles
    │   ├─→ research_data
    │   └─→ knowledge_base
    │           ↓
    ├─→ Fetch Full Content from MongoDB
    │       ↓
    ├─→ Sort by Relevance Score
    │       ↓
    └─→ Generate Answer with AI
        (using retrieved context)
            ↓
Return Answer + Sources + Confidence
```

## Security Considerations

### Authentication & Authorization
- JWT token-based auth (ready for implementation)
- Role-based access control
- API key management

### Data Protection
- Input validation
- SQL/NoSQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting

### Service Security
- Helmet.js security headers
- CORS configuration
- Environment variable protection
- Secure credential storage
- Docker network isolation

## Scalability

### Horizontal Scaling
- Stateless API design
- Redis for session sharing
- Load balancer ready
- Microservice architecture

### Vertical Scaling
- MongoDB sharding support
- Qdrant clustering
- Redis clustering
- Worker pool for agents

### Performance Optimization
- Vector search caching
- Result pagination
- Lazy loading
- Index optimization
- Connection pooling

## Monitoring & Logging

### Application Monitoring
- Morgan HTTP logging
- Custom error tracking
- Performance metrics
- Health check endpoints

### Service Monitoring
- Docker container health
- Database connection status
- API response times
- Error rates

## Deployment

### Docker Deployment
- Multi-container setup
- Service orchestration
- Volume management
- Network isolation
- Environment configuration

### Production Considerations
- HTTPS/TLS
- Reverse proxy (Nginx)
- Database backups
- Log rotation
- Secret management
- Auto-restart policies

## Future Enhancements

### Planned Features
1. User authentication system
2. Advanced analytics dashboard
3. Content scheduling
4. Multi-language support
5. Custom AI model training
6. Advanced workflow builder
7. Integration marketplace
8. Mobile app
9. Real-time collaboration
10. Advanced SEO tools

### Scalability Improvements
1. Kubernetes deployment
2. CDN integration
3. Database replication
4. Caching layer expansion
5. Microservice separation
6. Event-driven architecture
7. Message queue integration (RabbitMQ/Kafka)

## Development Guidelines

### Code Organization
- Model-View-Controller pattern
- Service layer abstraction
- Route-based organization
- Utility function modules

### Best Practices
- Async/await for asynchronous operations
- Error handling middleware
- Input validation
- Code documentation
- Unit testing
- Integration testing

### Git Workflow
- Feature branches
- Pull request reviews
- Semantic versioning
- Changelog maintenance

## Testing Strategy

### Unit Tests
- Service layer testing
- Utility function testing
- Model validation testing

### Integration Tests
- API endpoint testing
- Database operations
- External service mocking

### End-to-End Tests
- Complete workflow testing
- User journey simulation
- Performance testing

## Dependencies

### Core Dependencies
- express: Web framework
- mongoose: MongoDB ODM
- @qdrant/js-client-rest: Vector DB client
- axios: HTTP client
- dotenv: Environment management

### AI & ML
- openai: OpenAI API client
- langchain: LLM framework

### Utilities
- cheerio: HTML parsing
- rss-parser: RSS feed parsing
- uuid: Unique ID generation
- markdown-it: Markdown parsing

### Security
- helmet: Security headers
- cors: CORS middleware
- bcryptjs: Password hashing
- jsonwebtoken: JWT tokens

## Configuration Management

### Environment Variables
- Centralized in .env file
- Validation on startup
- Sensitive data protection
- Service URL configuration

### Feature Flags
- Enable/disable features
- A/B testing support
- Gradual rollout capability

## API Documentation

### Swagger/OpenAPI
- Auto-generated documentation
- Interactive testing
- Schema validation
- Example requests/responses

## Conclusion

CloudCurio CMS provides a robust, scalable foundation for AI-powered content generation with a focus on automation, research quality, and user experience. The architecture supports future growth and feature additions while maintaining clean separation of concerns and best practices.
