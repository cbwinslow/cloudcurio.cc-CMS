const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['fact', 'concept', 'procedure', 'reference'],
    default: 'fact'
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true
  },
  source: {
    type: String
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8
  },
  vectorId: {
    type: String
  },
  relatedEntries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeBase'
  }],
  usageCount: {
    type: Number,
    default: 0
  },
  bucket: {
    type: String,
    default: 'general'
  }
}, {
  timestamps: true
});

knowledgeBaseSchema.index({ title: 'text', content: 'text' });
knowledgeBaseSchema.index({ tags: 1, category: 1 });
knowledgeBaseSchema.index({ bucket: 1 });

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
