const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  categories: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  author: {
    type: String,
    default: 'AI Agent'
  },
  metadata: {
    researchSources: [{
      url: String,
      title: String,
      relevanceScore: Number
    }],
    aiModel: String,
    generationMethod: String,
    confidence: Number,
    keywords: [String]
  },
  vectorId: {
    type: String
  },
  workflow: {
    researchCompleted: {
      type: Boolean,
      default: false
    },
    contentGenerated: {
      type: Boolean,
      default: false
    },
    reviewed: {
      type: Boolean,
      default: false
    }
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search
articleSchema.index({ title: 'text', content: 'text', tags: 'text' });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ tags: 1 });

module.exports = mongoose.model('Article', articleSchema);
