require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const connectDatabase = require('./config/database');
const { initializeQdrantCollections } = require('./config/qdrant');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/static', express.static('public'));

// Routes
app.use('/api/articles', require('./routes/articles'));
app.use('/api/workflow', require('./routes/workflow'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/research', require('./routes/research'));
app.use('/api/buckets', require('./routes/buckets'));
app.use('/api/knowledge', require('./routes/knowledge'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: 'connected',
      qdrant: 'connected',
      api: 'running'
    }
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'CloudCurio CMS API',
    version: '1.0.0',
    description: 'AI-powered blog content management system with deep research capabilities',
    endpoints: {
      articles: {
        'GET /api/articles': 'Get all articles',
        'GET /api/articles/:id': 'Get article by ID',
        'GET /api/articles/slug/:slug': 'Get article by slug',
        'GET /api/articles/search?q=': 'Search articles',
        'POST /api/articles': 'Create article',
        'PUT /api/articles/:id': 'Update article',
        'DELETE /api/articles/:id': 'Delete article',
        'POST /api/articles/:id/publish': 'Publish article'
      },
      workflow: {
        'POST /api/workflow/generate-article': 'Generate article using AI workflow',
        'POST /api/workflow/batch-generate': 'Batch generate multiple articles',
        'GET /api/workflow/tasks': 'Get workflow tasks',
        'GET /api/workflow/tasks/:id': 'Get task by ID',
        'POST /api/workflow/tasks/:id/cancel': 'Cancel task',
        'POST /api/workflow/tasks/:id/retry': 'Retry failed task',
        'POST /api/workflow/process-pending': 'Process pending tasks'
      },
      chat: {
        'POST /api/chat': 'Chat with RAG',
        'POST /api/chat/generate': 'Generate content',
        'POST /api/chat/generate-with-context': 'Generate with context',
        'POST /api/chat/summarize': 'Summarize content'
      },
      research: {
        'POST /api/research': 'Perform research',
        'POST /api/research/deep-research': 'Deep research on topic',
        'GET /api/research': 'Get all research',
        'GET /api/research/news': 'Aggregate news',
        'GET /api/research/:id': 'Get research by ID',
        'PUT /api/research/:id': 'Update research',
        'DELETE /api/research/:id': 'Delete research'
      },
      buckets: {
        'GET /api/buckets': 'Get all buckets',
        'GET /api/buckets/:id': 'Get bucket by ID',
        'GET /api/buckets/:id/stats': 'Get bucket statistics',
        'POST /api/buckets': 'Create bucket',
        'PUT /api/buckets/:id': 'Update bucket',
        'DELETE /api/buckets/:id': 'Delete bucket'
      },
      knowledge: {
        'GET /api/knowledge': 'Get all knowledge entries',
        'GET /api/knowledge/search?q=': 'Search knowledge base',
        'GET /api/knowledge/:id': 'Get knowledge entry by ID',
        'POST /api/knowledge': 'Create knowledge entry',
        'PUT /api/knowledge/:id': 'Update knowledge entry',
        'DELETE /api/knowledge/:id': 'Delete knowledge entry'
      }
    },
    features: [
      'AI-powered content generation',
      'Deep research capabilities',
      'RAG (Retrieval Augmented Generation)',
      'Vector database with Qdrant',
      'Knowledge base management',
      'Workflow automation with n8n',
      'News aggregation',
      'Tag-based organization',
      'AI agent crews',
      'ChatBot interface',
      'Integration with LocalAI, Flowise, SearXNG'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize and start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Initialize Qdrant collections
    try {
      await initializeQdrantCollections();
    } catch (error) {
      console.warn('Warning: Could not initialize Qdrant collections. Vector features may not work.', error.message);
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           CloudCurio CMS - AI-Powered Blog System            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Server running on port ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}

API Documentation: http://localhost:${PORT}/api
Health Check: http://localhost:${PORT}/health

Services:
- MongoDB: ${process.env.MONGODB_URI}
- Qdrant: ${process.env.QDRANT_URL}
- LocalAI: ${process.env.LOCALAI_URL}
- n8n: ${process.env.N8N_URL}
- SearXNG: ${process.env.SEARXNG_URL}
- Flowise: ${process.env.FLOWISE_URL}

Ready to generate content! 🚀
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
