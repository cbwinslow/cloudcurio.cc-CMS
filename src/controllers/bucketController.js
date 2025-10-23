const Bucket = require('../models/Bucket');
const ResearchData = require('../models/ResearchData');
const KnowledgeBase = require('../models/KnowledgeBase');
const Article = require('../models/Article');

// Get all buckets
exports.getAllBuckets = async (req, res) => {
  try {
    const buckets = await Bucket.find().sort({ createdAt: -1 });
    res.json(buckets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single bucket
exports.getBucket = async (req, res) => {
  try {
    const bucket = await Bucket.findById(req.params.id);
    
    if (!bucket) {
      return res.status(404).json({ error: 'Bucket not found' });
    }

    // Get items in bucket
    const research = await ResearchData.find({ bucket: bucket.name }).limit(10);
    const knowledge = await KnowledgeBase.find({ bucket: bucket.name }).limit(10);
    const articles = await Article.find().limit(10); // Articles don't have bucket field yet

    res.json({
      bucket,
      items: {
        research,
        knowledge,
        articles
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create bucket
exports.createBucket = async (req, res) => {
  try {
    const bucket = new Bucket(req.body);
    await bucket.save();
    res.status(201).json(bucket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update bucket
exports.updateBucket = async (req, res) => {
  try {
    const bucket = await Bucket.findById(req.params.id);
    
    if (!bucket) {
      return res.status(404).json({ error: 'Bucket not found' });
    }

    Object.assign(bucket, req.body);
    await bucket.save();

    res.json(bucket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete bucket
exports.deleteBucket = async (req, res) => {
  try {
    const bucket = await Bucket.findById(req.params.id);
    
    if (!bucket) {
      return res.status(404).json({ error: 'Bucket not found' });
    }

    await bucket.deleteOne();

    res.json({ message: 'Bucket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bucket statistics
exports.getBucketStats = async (req, res) => {
  try {
    const bucket = await Bucket.findById(req.params.id);
    
    if (!bucket) {
      return res.status(404).json({ error: 'Bucket not found' });
    }

    const researchCount = await ResearchData.countDocuments({ bucket: bucket.name });
    const knowledgeCount = await KnowledgeBase.countDocuments({ bucket: bucket.name });

    res.json({
      bucket: bucket.name,
      stats: {
        research: researchCount,
        knowledge: knowledgeCount,
        total: researchCount + knowledgeCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
