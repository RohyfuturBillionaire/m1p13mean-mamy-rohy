const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Article = require('../models/Article');
const MouvementStock = require('../models/MouvementStock');
const ImgArticle = require('../models/ImgArticle');
const authenticateToken = require('../middleware/authMiddleware');

// GET /api/favorites — user's favorite articles (populated + enriched)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'article_souhait',
        match: { actif: true },
        populate: [
          { path: 'id_categorie_article' },
          { path: 'id_boutique', select: 'nom logo' }
        ]
      });

    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    // Filter out nulls (articles that no longer exist or are inactive)
    const validArticles = (user.article_souhait || []).filter(a => a !== null);

    // Enrich with stock + images
    const enriched = await Promise.all(validArticles.map(async (article) => {
      const art = article.toObject();
      const mouvements = await MouvementStock.find({ id_article: art._id });
      let stock = 0;
      for (const m of mouvements) {
        if (m.type_mouvement === 1) stock += m.quantity;
        else if (m.type_mouvement === 2) stock -= m.quantity;
      }
      const images = await ImgArticle.find({ id_article: art._id });
      return { ...art, stock, images: images.map(i => i.url_img) };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/favorites/:articleId — add article to favorites
router.post('/:articleId', authenticateToken, async (req, res) => {
  try {
    const article = await Article.findById(req.params.articleId);
    if (!article) return res.status(404).json({ message: 'Article introuvable' });

    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { article_souhait: req.params.articleId }
    });

    res.json({ message: 'Article ajouté aux favoris' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/favorites/:articleId — remove article from favorites
router.delete('/:articleId', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { article_souhait: req.params.articleId }
    });

    res.json({ message: 'Article retiré des favoris' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
