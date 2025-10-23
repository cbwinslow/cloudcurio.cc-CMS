const vectorService = require('./vectorService');
const aiService = require('./aiService');
const Article = require('../models/Article');
const KnowledgeBase = require('../models/KnowledgeBase');
const ResearchData = require('../models/ResearchData');

class RAGService {
  // Retrieval Augmented Generation for answering questions
  async query(question, context = {}) {
    const {
      collections = ['articles', 'knowledge_base', 'research_data'],
      limit = 5,
      tags = []
    } = context;

    try {
      // Generate embedding for the question
      const questionVector = await vectorService.generateEmbedding(question);

      // Search across collections
      const relevantContext = [];

      for (const collection of collections) {
        const results = await vectorService.searchSimilar(collection, questionVector, limit);
        
        // Fetch full content from database
        for (const result of results) {
          const content = await this.fetchContent(collection, result.id);
          if (content) {
            relevantContext.push({
              content: content,
              score: result.score,
              collection: collection
            });
          }
        }
      }

      // Sort by relevance score
      relevantContext.sort((a, b) => b.score - a.score);

      // Generate answer using relevant context
      const contextText = relevantContext
        .slice(0, 5)
        .map((item, i) => `[${i + 1}] ${item.content}`)
        .join('\n\n');

      const prompt = `Based on the following context, answer the question: "${question}"

Context:
${contextText}

Provide a comprehensive answer based on the context provided. If the context doesn't contain enough information, say so.

Answer:`;

      const answer = await aiService.generateText(prompt, {
        temperature: 0.3,
        maxTokens: 1000,
        systemMessage: 'You are a helpful assistant that provides accurate answers based on the given context.'
      });

      return {
        answer: answer,
        sources: relevantContext.slice(0, 5),
        confidence: this.calculateConfidence(relevantContext)
      };
    } catch (error) {
      console.error('Error in RAG query:', error.message);
      throw error;
    }
  }

  // Fetch content from database
  async fetchContent(collection, id) {
    try {
      let doc;
      
      switch (collection) {
        case 'articles':
          doc = await Article.findById(id);
          return doc ? `${doc.title}\n\n${doc.content}` : null;
        
        case 'knowledge_base':
          doc = await KnowledgeBase.findById(id);
          return doc ? `${doc.title}\n\n${doc.content}` : null;
        
        case 'research_data':
          doc = await ResearchData.findById(id);
          return doc ? `${doc.topic}\n\n${doc.summary}` : null;
        
        default:
          return null;
      }
    } catch (error) {
      console.error('Error fetching content:', error.message);
      return null;
    }
  }

  // Calculate confidence score
  calculateConfidence(context) {
    if (context.length === 0) return 0;
    
    const avgScore = context.reduce((sum, item) => sum + item.score, 0) / context.length;
    return Math.min(avgScore, 1.0);
  }

  // Generate content with RAG
  async generateWithContext(prompt, tags = []) {
    // Find relevant context
    const queryResult = await this.query(prompt, { tags, limit: 5 });

    // Generate with context
    const enhancedPrompt = `${prompt}

Relevant context for reference:
${queryResult.sources.map((s, i) => `[${i + 1}] ${s.content.substring(0, 500)}`).join('\n\n')}

Generate comprehensive content based on the prompt and context:`;

    const content = await aiService.generateText(enhancedPrompt, {
      temperature: 0.7,
      maxTokens: 2500
    });

    return {
      content: content,
      sources: queryResult.sources,
      confidence: queryResult.confidence
    };
  }
}

module.exports = new RAGService();
