const express = require('express');
const router = express.Router();
const knowledgeBaseController = require('../controllers/knowledgeBaseController');

router.get('/', knowledgeBaseController.getAllKnowledge);
router.get('/search', knowledgeBaseController.searchKnowledge);
router.get('/:id', knowledgeBaseController.getKnowledgeEntry);
router.post('/', knowledgeBaseController.createKnowledgeEntry);
router.put('/:id', knowledgeBaseController.updateKnowledgeEntry);
router.delete('/:id', knowledgeBaseController.deleteKnowledgeEntry);

module.exports = router;
