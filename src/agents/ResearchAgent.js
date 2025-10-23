const researchService = require('../services/researchService');
const vectorService = require('../services/vectorService');
const aiService = require('../services/aiService');
const ResearchData = require('../models/ResearchData');

class ResearchAgent {
  constructor() {
    this.name = 'ResearchAgent';
    this.capabilities = ['web_search', 'content_extraction', 'news_aggregation', 'summarization'];
  }

  // Execute research task
  async executeTask(task) {
    const { topic, tags = [], bucket = 'general' } = task;

    try {
      console.log(`[${this.name}] Starting research on: ${topic}`);

      // Perform deep research
      const researchResults = await researchService.deepResearch(topic, tags);

      // Combine all sources
      const allSources = [
        ...researchResults.webResults,
        ...researchResults.newsResults,
        ...researchResults.extractedContent.map(content => ({
          ...content,
          sourceType: 'web',
          extractedAt: new Date()
        }))
      ];

      // Generate summary
      const contentToSummarize = allSources
        .map(s => s.content)
        .join('\n\n')
        .substring(0, 8000);

      const summary = await aiService.summarize(contentToSummarize, 300);

      // Extract key points
      const keyPointsText = await aiService.extractKeyPoints(contentToSummarize);
      const keyPoints = keyPointsText.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim());

      // Create research data document
      const researchData = new ResearchData({
        topic,
        tags,
        sources: allSources,
        summary,
        keyPoints,
        bucket,
        status: 'completed'
      });

      await researchData.save();

      // Create vector embedding
      const vectorText = `${topic}\n\n${summary}\n\n${keyPoints.join('\n')}`;
      const vector = await vectorService.generateEmbedding(vectorText);
      
      // Store in vector database
      const vectorId = await vectorService.storeVector('research_data', researchData._id.toString(), vector, {
        topic,
        tags,
        type: 'research'
      });

      researchData.vectorId = vectorId;
      await researchData.save();

      console.log(`[${this.name}] Research completed: ${researchData._id}`);

      return {
        success: true,
        researchId: researchData._id,
        summary,
        keyPoints,
        sourceCount: allSources.length
      };
    } catch (error) {
      console.error(`[${this.name}] Error:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update existing research
  async updateResearch(researchId) {
    try {
      const research = await ResearchData.findById(researchId);
      if (!research) {
        throw new Error('Research not found');
      }

      // Perform new research
      const newResults = await researchService.deepResearch(research.topic, research.tags);

      // Add new sources
      research.sources.push(...newResults.webResults, ...newResults.newsResults);
      
      // Regenerate summary
      const contentToSummarize = research.sources
        .map(s => s.content)
        .join('\n\n')
        .substring(0, 8000);
      
      research.summary = await aiService.summarize(contentToSummarize, 300);
      
      await research.save();

      return {
        success: true,
        researchId: research._id
      };
    } catch (error) {
      console.error(`[${this.name}] Error updating research:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ResearchAgent();
