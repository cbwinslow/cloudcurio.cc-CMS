const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');

router.post('/', researchController.performResearch);
router.post('/deep-research', researchController.deepResearch);
router.get('/', researchController.getAllResearch);
router.get('/news', researchController.aggregateNews);
router.get('/:id', researchController.getResearch);
router.put('/:id', researchController.updateResearch);
router.delete('/:id', researchController.deleteResearch);

module.exports = router;
