const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

router.get('/', articleController.getAllArticles);
router.get('/search', articleController.searchArticles);
router.get('/:id', articleController.getArticle);
router.get('/slug/:slug', articleController.getArticleBySlug);
router.post('/', articleController.createArticle);
router.put('/:id', articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);
router.post('/:id/publish', articleController.publishArticle);

module.exports = router;
