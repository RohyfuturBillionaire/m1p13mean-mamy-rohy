const express = require('express');
const router = express.Router();
const Bucket = require('../models/Bucket');
const Article = require('../models/Article');
const MouvementStock = require('../models/MouvementStock');
const ImgArticle = require('../models/ImgArticle');
const authenticateToken = require('../middleware/authMiddleware');

// Helper: compute current stock for an article
async function getCurrentStock(articleId) {
  const mouvements = await MouvementStock.find({ id_article: articleId });
  let stock = 0;
  for (const m of mouvements) {
    if (m.type_mouvement === 1) stock += m.quantity;
    else if (m.type_mouvement === 2) stock -= m.quantity;
  }
  return stock;
}

// Helper: enrich article with stock + images
async function enrichArticle(article) {
  const art = typeof article.toObject === 'function' ? article.toObject() : article;
  const stock = await getCurrentStock(art._id);
  const images = await ImgArticle.find({ id_article: art._id });
  return { ...art, stock, images: images.map(i => i.url_img) };
}

// GET /api/bucket - get current user's bucket (populated + enriched)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let bucket = await Bucket.findOne({ id_user: req.user.userId })
      .populate({
        path: 'items.id_article',
        populate: { path: 'id_categorie_article' }
      })
      .populate('items.id_boutique', 'nom logo');

    if (!bucket) {
      return res.json({ items: [], total: 0, status: 'actif' });
    }

    const enrichedItems = await Promise.all(bucket.items.map(async (item) => {
      const itemObj = typeof item.toObject === 'function' ? item.toObject() : { ...item };
      if (itemObj.id_article) {
        const stock = await getCurrentStock(itemObj.id_article._id);
        const images = await ImgArticle.find({ id_article: itemObj.id_article._id });
        itemObj.id_article.stock = stock;
        itemObj.id_article.images = images.map(i => i.url_img);
      }
      return itemObj;
    }));

    res.json({
      _id: bucket._id,
      items: enrichedItems,
      total: bucket.total,
      status: bucket.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/bucket/add - add item to bucket (or increment if exists)
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { articleId, boutiqueId, quantite = 1, prixPromo } = req.body;

    const article = await Article.findById(articleId);
    if (!article || !article.actif) {
      return res.status(404).json({ message: 'Article non trouve ou inactif' });
    }

    const stock = await getCurrentStock(articleId);

    let bucket = await Bucket.findOne({ id_user: req.user.userId });
    if (!bucket) {
      bucket = new Bucket({ id_user: req.user.userId, items: [], total: 0 });
    }

    const existingIndex = bucket.items.findIndex(
      item => item.id_article.toString() === articleId
    );

    let newQuantite = quantite;
    if (existingIndex >= 0) {
      newQuantite = bucket.items[existingIndex].quantite + quantite;
    }

    if (stock < newQuantite) {
      return res.status(409).json({ message: 'Stock insuffisant', disponible: stock });
    }

    // Only store prix_promo if it's a valid discount (less than full price)
    const prixEffectif = (prixPromo && prixPromo > 0 && prixPromo < article.prix) ? Number(prixPromo) : null;

    if (existingIndex >= 0) {
      bucket.items[existingIndex].quantite = newQuantite;
      bucket.items[existingIndex].prix = article.prix;
      bucket.items[existingIndex].prix_promo = prixEffectif;
    } else {
      bucket.items.push({
        id_article: articleId,
        id_boutique: boutiqueId || article.id_boutique,
        quantite: newQuantite,
        prix: article.prix,
        prix_promo: prixEffectif
      });
    }

    bucket.total = bucket.items.reduce((sum, item) => sum + (item.prix_promo || item.prix) * item.quantite, 0);
    await bucket.save();

    res.json({ message: 'Article ajoute au panier', total: bucket.total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/bucket/update - update item quantity
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const { articleId, quantite } = req.body;

    const bucket = await Bucket.findOne({ id_user: req.user.userId });
    if (!bucket) return res.status(404).json({ message: 'Panier introuvable' });

    const itemIndex = bucket.items.findIndex(
      item => item.id_article.toString() === articleId
    );
    if (itemIndex < 0) return res.status(404).json({ message: 'Article non trouve dans le panier' });

    if (quantite <= 0) {
      bucket.items.splice(itemIndex, 1);
    } else {
      const stock = await getCurrentStock(articleId);
      if (stock < quantite) {
        return res.status(409).json({ message: 'Stock insuffisant', disponible: stock });
      }
      bucket.items[itemIndex].quantite = quantite;
    }

    bucket.total = bucket.items.reduce((sum, item) => sum + (item.prix_promo || item.prix) * item.quantite, 0);
    await bucket.save();

    res.json({ message: 'Panier mis a jour', total: bucket.total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/bucket/remove/:articleId - remove item from bucket
router.delete('/remove/:articleId', authenticateToken, async (req, res) => {
  try {
    const bucket = await Bucket.findOne({ id_user: req.user.userId });
    if (!bucket) return res.status(404).json({ message: 'Panier introuvable' });

    bucket.items = bucket.items.filter(
      item => item.id_article.toString() !== req.params.articleId
    );
    bucket.total = bucket.items.reduce((sum, item) => sum + (item.prix_promo || item.prix) * item.quantite, 0);
    await bucket.save();

    res.json({ message: 'Article retire du panier', total: bucket.total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/bucket/clear - clear the bucket
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    await Bucket.findOneAndUpdate(
      { id_user: req.user.userId },
      { items: [], total: 0 }
    );
    res.json({ message: 'Panier vide' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
