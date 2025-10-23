const mongoose = require('mongoose');

const researchDataSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  sources: [{
    url: String,
    title: String,
    content: String,
    sourceType: {
      type: String,
      enum: ['web', 'news', 'academic', 'social', 'rss'],
      default: 'web'
    },
    extractedAt: Date,
    relevanceScore: Number
  }],
  summary: {
    type: String
  },
  keyPoints: [String],
  entities: [{
    name: String,
    type: String,
    relevance: Number
  }],
  vectorId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  bucket: {
    type: String,
    default: 'general'
  }
}, {
  timestamps: true
});

researchDataSchema.index({ topic: 'text', summary: 'text' });
researchDataSchema.index({ tags: 1 });
researchDataSchema.index({ bucket: 1 });

module.exports = mongoose.model('ResearchData', researchDataSchema);
