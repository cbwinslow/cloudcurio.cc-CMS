const KnowledgeBase = require('../models/KnowledgeBase');
const vectorService = require('../services/vectorService');

// Get all knowledge base entries
exports.getAllKnowledge = async (req, res) => {
  try {
    const { tags, category, bucket, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (tags) query.tags = { $in: tags.split(',') };
    if (category) query.category = category;
    if (bucket) query.bucket = bucket;

    const entries = await KnowledgeBase.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await KnowledgeBase.countDocuments(query);

    res.json({
      entries,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single knowledge entry
exports.getKnowledgeEntry = async (req, res) => {
  try {
    const entry = await KnowledgeBase.findById(req.params.id)
      .populate('relatedEntries');
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    entry.usageCount += 1;
    await entry.save();

    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create knowledge entry
exports.createKnowledgeEntry = async (req, res) => {
  try {
    const entry = new KnowledgeBase(req.body);
    await entry.save();

    // Create vector embedding
    const vectorText = `${entry.title}\n\n${entry.content}`;
    const vector = await vectorService.generateEmbedding(vectorText);
    const vectorId = await vectorService.storeVector('knowledge_base', entry._id.toString(), vector, {
      title: entry.title,
      tags: entry.tags,
      type: 'knowledge'
    });
    
    entry.vectorId = vectorId;
    await entry.save();

    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update knowledge entry
exports.updateKnowledgeEntry = async (req, res) => {
  try {
    const entry = await KnowledgeBase.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    Object.assign(entry, req.body);
    await entry.save();

    // Update vector if content changed
    if (req.body.content && entry.vectorId) {
      const vectorText = `${entry.title}\n\n${entry.content}`;
      const vector = await vectorService.generateEmbedding(vectorText);
      await vectorService.storeVector('knowledge_base', entry._id.toString(), vector, {
        title: entry.title,
        tags: entry.tags,
        type: 'knowledge'
      });
    }

    res.json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete knowledge entry
exports.deleteKnowledgeEntry = async (req, res) => {
  try {
    const entry = await KnowledgeBase.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Delete from vector database
    if (entry.vectorId) {
      await vectorService.deleteVector('knowledge_base', entry._id.toString());
    }

    await entry.deleteOne();

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search knowledge base
exports.searchKnowledge = async (req, res) => {
  try {
    const { q, tags } = req.query;
    
    const query = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ]
    };

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const entries = await KnowledgeBase.find(query)
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(20);

    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
