const express = require('express');
const router = express.Router();
const AvisClientArticle = require('../models/AvisClientArticle');
const AvisClientBoutique = require('../models/AvisClientBoutique');
const Article = require('../models/Article');
const Boutique = require('../models/Boutique');
const authenticateToken = require('../middleware/authMiddleware');

// Optional auth middleware — sets req.user if token present, but doesn't block
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (!err) req.user = user;
    next();
  });
};

// ========== ARTICLE RATINGS ==========

// GET /api/avis/article/:articleId — average + count + user's note
router.get('/article/:articleId', optionalAuth, async (req, res) => {
  try {
    const avis = await AvisClientArticle.find({ id_article: req.params.articleId });

    let moyenne = 0;
    if (avis.length > 0) {
      const sum = avis.reduce((acc, a) => acc + a.note, 0);
      moyenne = Math.round((sum / avis.length) * 10) / 10;
    }

    let userNote = null;
    if (req.user) {
      const userAvis = avis.find(a => a.id_user.toString() === req.user.userId);
      if (userAvis) userNote = userAvis.note;
    }

    res.json({ moyenne, count: avis.length, userNote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/avis/article/:articleId — rate article (upsert)
router.post('/article/:articleId', authenticateToken, async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || note < 1 || note > 5) {
      return res.status(400).json({ message: 'Note doit être entre 1 et 5' });
    }

    const article = await Article.findById(req.params.articleId);
    if (!article) return res.status(404).json({ message: 'Article introuvable' });

    const avis = await AvisClientArticle.findOneAndUpdate(
      { id_user: req.user.userId, id_article: req.params.articleId },
      { note, date_avis: new Date() },
      { upsert: true, new: true, runValidators: true }
    );

    res.json(avis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== BOUTIQUE RATINGS ==========

// GET /api/avis/boutique/:boutiqueId — average + count + user's note
router.get('/boutique/:boutiqueId', optionalAuth, async (req, res) => {
  try {
    const avis = await AvisClientBoutique.find({ id_boutique: req.params.boutiqueId });

    let moyenne = 0;
    if (avis.length > 0) {
      const sum = avis.reduce((acc, a) => acc + a.note, 0);
      moyenne = Math.round((sum / avis.length) * 10) / 10;
    }

    let userNote = null;
    if (req.user) {
      const userAvis = avis.find(a => a.id_user.toString() === req.user.userId);
      if (userAvis) userNote = userAvis.note;
    }

    res.json({ moyenne, count: avis.length, userNote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/avis/boutique/:boutiqueId — rate boutique (upsert)
router.post('/boutique/:boutiqueId', authenticateToken, async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || note < 1 || note > 5) {
      return res.status(400).json({ message: 'Note doit être entre 1 et 5' });
    }

    const boutique = await Boutique.findById(req.params.boutiqueId);
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable' });

    const avis = await AvisClientBoutique.findOneAndUpdate(
      { id_user: req.user.userId, id_boutique: req.params.boutiqueId },
      { note, date_avis: new Date() },
      { upsert: true, new: true, runValidators: true }
    );

    res.json(avis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
