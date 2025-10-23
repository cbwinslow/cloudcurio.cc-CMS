const CrewCoordinator = require('../agents/CrewCoordinator');
const WorkflowTask = require('../models/WorkflowTask');

// Generate article using AI workflow
exports.generateArticle = async (req, res) => {
  try {
    const { topic, tags = [] } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const result = await CrewCoordinator.executeArticleWorkflow(topic, tags);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Batch generate articles
exports.batchGenerateArticles = async (req, res) => {
  try {
    const { topics } = req.body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ error: 'Topics array is required' });
    }

    const result = await CrewCoordinator.executeBatchWorkflow(topics);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get workflow tasks
exports.getWorkflowTasks = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const tasks = await WorkflowTask.find(query)
      .sort({ createdAt: -1, priority: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('output.articleId output.researchId');

    const count = await WorkflowTask.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single task
exports.getWorkflowTask = async (req, res) => {
  try {
    const task = await WorkflowTask.findById(req.params.id)
      .populate('output.articleId output.researchId');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel task
exports.cancelTask = async (req, res) => {
  try {
    const task = await WorkflowTask.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed task' });
    }

    task.status = 'cancelled';
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Retry failed task
exports.retryTask = async (req, res) => {
  try {
    const task = await WorkflowTask.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'failed') {
      return res.status(400).json({ error: 'Only failed tasks can be retried' });
    }

    task.status = 'pending';
    task.retryCount += 1;
    task.errors = [];
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Process pending tasks
exports.processPendingTasks = async (req, res) => {
  try {
    const result = await CrewCoordinator.processPendingTasks();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
