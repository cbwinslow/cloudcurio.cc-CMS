const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');

router.post('/generate-article', workflowController.generateArticle);
router.post('/batch-generate', workflowController.batchGenerateArticles);
router.get('/tasks', workflowController.getWorkflowTasks);
router.get('/tasks/:id', workflowController.getWorkflowTask);
router.post('/tasks/:id/cancel', workflowController.cancelTask);
router.post('/tasks/:id/retry', workflowController.retryTask);
router.post('/process-pending', workflowController.processPendingTasks);

module.exports = router;
