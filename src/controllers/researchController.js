const ResearchAgent = require('../agents/ResearchAgent');
const ResearchData = require('../models/ResearchData');
const researchService = require('../services/researchService');

// Perform research
exports.performResearch = async (req, res) => {
  try {
    const { topic, tags = [], bucket = 'general' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const result = await ResearchAgent.executeTask({ topic, tags, bucket });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all research data
exports.getAllResearch = async (req, res) => {
  try {
    const { tags, bucket, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (tags) query.tags = { $in: tags.split(',') };
    if (bucket) query.bucket = bucket;

    const research = await ResearchData.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-sources.content');

    const count = await ResearchData.countDocuments(query);

    res.json({
      research,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single research
exports.getResearch = async (req, res) => {
  try {
    const research = await ResearchData.findById(req.params.id)
      .populate('relatedArticles');
    
    if (!research) {
      return res.status(404).json({ error: 'Research not found' });
    }

    res.json(research);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update research
exports.updateResearch = async (req, res) => {
  try {
    const result = await ResearchAgent.updateResearch(req.params.id);

    if (result.success) {
      const research = await ResearchData.findById(req.params.id);
      res.json(research);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete research
exports.deleteResearch = async (req, res) => {
  try {
    const research = await ResearchData.findById(req.params.id);
    
    if (!research) {
      return res.status(404).json({ error: 'Research not found' });
    }

    await research.deleteOne();

    res.json({ message: 'Research deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Aggregate news
exports.aggregateNews = async (req, res) => {
  try {
    const { topics = [], limit = 20 } = req.query;
    
    const topicsArray = topics ? topics.split(',') : [];
    const news = await researchService.aggregateNews(topicsArray, parseInt(limit));

    res.json({ news, count: news.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deep research
exports.deepResearch = async (req, res) => {
  try {
    const { topic, tags = [] } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const tagsArray = Array.isArray(tags) ? tags : tags.split(',');
    const results = await researchService.deepResearch(topic, tagsArray);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
