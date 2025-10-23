const Article = require('../models/Article');
const vectorService = require('../services/vectorService');

// Get all articles
exports.getAllArticles = async (req, res) => {
  try {
    const { status, tags, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (tags) query.tags = { $in: tags.split(',') };

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content');

    const count = await Article.countDocuments(query);

    res.json({
      articles,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single article
exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment views
    article.views += 1;
    await article.save();

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get article by slug
exports.getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment views
    article.views += 1;
    await article.save();

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create article
exports.createArticle = async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();

    // Create vector embedding
    if (article.content) {
      const vectorText = `${article.title}\n\n${article.content}`;
      const vector = await vectorService.generateEmbedding(vectorText);
      const vectorId = await vectorService.storeVector('articles', article._id.toString(), vector, {
        title: article.title,
        tags: article.tags,
        type: 'article'
      });
      
      article.vectorId = vectorId;
      await article.save();
    }

    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update article
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    Object.assign(article, req.body);
    await article.save();

    // Update vector if content changed
    if (req.body.content && article.vectorId) {
      const vectorText = `${article.title}\n\n${article.content}`;
      const vector = await vectorService.generateEmbedding(vectorText);
      await vectorService.storeVector('articles', article._id.toString(), vector, {
        title: article.title,
        tags: article.tags,
        type: 'article'
      });
    }

    res.json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete article
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Delete from vector database
    if (article.vectorId) {
      await vectorService.deleteVector('articles', article._id.toString());
    }

    await article.deleteOne();

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search articles
exports.searchArticles = async (req, res) => {
  try {
    const { q, tags } = req.query;
    
    const query = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    };

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-content');

    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Publish article
exports.publishArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    article.status = 'published';
    article.publishedAt = new Date();
    await article.save();

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
