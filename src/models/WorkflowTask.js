const mongoose = require('mongoose');

const workflowTaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['research', 'generation', 'review', 'publish', 'aggregate'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  input: {
    tags: [String],
    topic: String,
    parameters: mongoose.Schema.Types.Mixed
  },
  output: {
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article'
    },
    researchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchData'
    },
    data: mongoose.Schema.Types.Mixed
  },
  agent: {
    type: String
  },
  errors: [{
    message: String,
    timestamp: Date
  }],
  retryCount: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow'
  }
}, {
  timestamps: true
});

workflowTaskSchema.index({ status: 1, priority: -1 });
workflowTaskSchema.index({ workflow: 1 });

module.exports = mongoose.model('WorkflowTask', workflowTaskSchema);
