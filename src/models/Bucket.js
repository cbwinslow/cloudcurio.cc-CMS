const mongoose = require('mongoose');

const bucketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['research', 'knowledge', 'articles', 'mixed'],
    default: 'mixed'
  },
  tags: [{
    type: String,
    trim: true
  }],
  settings: {
    autoResearch: {
      type: Boolean,
      default: false
    },
    researchInterval: {
      type: String,
      default: 'daily'
    },
    aiModel: String,
    maxItems: Number
  },
  itemCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

bucketSchema.index({ name: 1 });
bucketSchema.index({ tags: 1 });

module.exports = mongoose.model('Bucket', bucketSchema);
