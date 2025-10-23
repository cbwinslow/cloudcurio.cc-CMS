const ragService = require('../services/ragService');
const aiService = require('../services/aiService');

// Chat with RAG
exports.chat = async (req, res) => {
  try {
    const { message, context = {} } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await ragService.query(message, context);

    res.json({
      response: result.answer,
      sources: result.sources.map(s => ({
        content: s.content.substring(0, 200),
        score: s.score,
        collection: s.collection
      })),
      confidence: result.confidence
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate content with context
exports.generateWithContext = async (req, res) => {
  try {
    const { prompt, tags = [] } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await ragService.generateWithContext(prompt, tags);

    res.json({
      content: result.content,
      sources: result.sources.map(s => ({
        content: s.content.substring(0, 200),
        score: s.score
      })),
      confidence: result.confidence
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Simple AI generation (without RAG)
exports.generate = async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const content = await aiService.generateText(prompt, options);

    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Summarize content
exports.summarize = async (req, res) => {
  try {
    const { content, maxLength = 200 } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const summary = await aiService.summarize(content, maxLength);

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
