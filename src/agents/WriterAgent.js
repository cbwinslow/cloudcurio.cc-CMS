const aiService = require('../services/aiService');
const vectorService = require('../services/vectorService');
const Article = require('../models/Article');
const ResearchData = require('../models/ResearchData');

class WriterAgent {
  constructor() {
    this.name = 'WriterAgent';
    this.capabilities = ['article_generation', 'content_editing', 'seo_optimization'];
  }

  // Execute writing task
  async executeTask(task) {
    const { topic, tags = [], researchId, style = 'professional' } = task;

    try {
      console.log(`[${this.name}] Starting article generation on: ${topic}`);

      // Fetch research data
      let researchData = [];
      if (researchId) {
        const research = await ResearchData.findById(researchId);
        if (research) {
          researchData = research.sources.map(s => ({
            title: s.title,
            content: s.content,
            url: s.url
          }));
        }
      }

      // Generate article content
      const content = await aiService.generateArticle(topic, researchData, tags);

      // Generate excerpt
      const excerpt = await aiService.summarize(content, 150);

      // Generate slug
      const slug = this.generateSlug(topic);

      // Generate additional tags if needed
      const generatedTags = await aiService.generateTags(content, 10);
      const allTags = [...new Set([...tags, ...generatedTags])];

      // Create article
      const article = new Article({
        title: topic,
        slug,
        content,
        excerpt,
        tags: allTags,
        status: 'draft',
        metadata: {
          researchSources: researchData.slice(0, 5),
          aiModel: process.env.DEFAULT_AI_MODEL || 'gpt-3.5-turbo',
          generationMethod: 'ai_agent',
          confidence: 0.85,
          keywords: generatedTags.slice(0, 10)
        },
        workflow: {
          researchCompleted: !!researchId,
          contentGenerated: true,
          reviewed: false
        }
      });

      await article.save();

      // Create vector embedding
      const vectorText = `${article.title}\n\n${article.excerpt}\n\n${article.content}`;
      const vector = await vectorService.generateEmbedding(vectorText);
      
      // Store in vector database
      const vectorId = await vectorService.storeVector('articles', article._id.toString(), vector, {
        title: article.title,
        tags: article.tags,
        type: 'article'
      });

      article.vectorId = vectorId;
      await article.save();

      console.log(`[${this.name}] Article created: ${article._id}`);

      return {
        success: true,
        articleId: article._id,
        title: article.title,
        slug: article.slug,
        wordCount: content.split(/\s+/).length
      };
    } catch (error) {
      console.error(`[${this.name}] Error:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Edit existing article
  async editArticle(articleId, changes) {
    try {
      const article = await Article.findById(articleId);
      if (!article) {
        throw new Error('Article not found');
      }

      // Apply changes
      Object.assign(article, changes);
      
      // Regenerate excerpt if content changed
      if (changes.content) {
        article.excerpt = await aiService.summarize(changes.content, 150);
      }

      await article.save();

      return {
        success: true,
        articleId: article._id
      };
    } catch (error) {
      console.error(`[${this.name}] Error editing article:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate slug from title
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }

  // Enhance article with SEO
  async enhanceWithSEO(articleId) {
    try {
      const article = await Article.findById(articleId);
      if (!article) {
        throw new Error('Article not found');
      }

      // Generate SEO-friendly title variations
      const seoPrompt = `Suggest 3 SEO-friendly title variations for this article:
Title: ${article.title}
Content: ${article.content.substring(0, 500)}

Provide titles that are compelling and optimized for search engines.`;

      const suggestions = await aiService.generateText(seoPrompt, {
        temperature: 0.7,
        maxTokens: 200
      });

      return {
        success: true,
        suggestions: suggestions.split('\n').filter(s => s.trim().length > 0)
      };
    } catch (error) {
      console.error(`[${this.name}] Error enhancing SEO:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new WriterAgent();
