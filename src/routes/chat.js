const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/', chatController.chat);
router.post('/generate', chatController.generate);
router.post('/generate-with-context', chatController.generateWithContext);
router.post('/summarize', chatController.summarize);

module.exports = router;
