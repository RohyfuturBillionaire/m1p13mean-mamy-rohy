const express = require('express');
const router = express.Router();
const MouvementStock = require('../models/MouvementStock');
const ImgArticle = require('../models/ImgArticle');
const Article = require('../models/Article');
const Boutique = require('../models/Boutique');
const Notification = require('../models/Notification');

// GET all mouvements (filtré par boutique si boutique_id fourni)
router.get('/', async (req, res) => {
  try {
    const { boutique_id } = req.query;
    let filter = {};

    if (boutique_id) {
      const articles = await Article.find({ id_boutique: boutique_id }).select('_id');
      const articleIds = articles.map(a => a._id);
      filter = { id_article: { $in: articleIds } };
    }

    const mouvements = await MouvementStock.find(filter).sort({ createdAt: -1 }).populate('id_article');
    res.json(mouvements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create mouvement
router.post('/', async (req, res) => {
  try {
    const mouvement = new MouvementStock(req.body);
    await mouvement.save();
    res.status(201).json(mouvement);

    // Check stock alert for exits (type 2) — fire-and-forget after response
    if (mouvement.type_mouvement === 2 || mouvement.type_mouvement === '2') {
      const mouvements = await MouvementStock.find({ id_article: mouvement.id_article });
      let stock = 0;
      for (const m of mouvements) {
        if (m.type_mouvement === 1 || m.type_mouvement === '1') stock += m.quantity;
        else if (m.type_mouvement === 2 || m.type_mouvement === '2') stock -= m.quantity;
      }
      const seuil = mouvement.seuil_alerte ?? 5;
      if (stock <= seuil) {
        const article = await Article.findById(mouvement.id_article).select('nom id_boutique');
        if (article?.id_boutique) {
          const boutique = await Boutique.findById(article.id_boutique).select('user_proprietaire');
          if (boutique?.user_proprietaire) {
            await Notification.create({
              titre: stock <= 0 ? 'Rupture de stock' : 'Stock faible',
              message: stock <= 0
                ? `"${article.nom}" est en rupture de stock`
                : `Stock de "${article.nom}" est bas (${stock} unité${stock > 1 ? 's' : ''} restante${stock > 1 ? 's' : ''})`,
              type: 'stock',
              lien: '/seller/stocks',
              destinataire_user: boutique.user_proprietaire
            });
          }
        }
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/current-stocks', async (req, res) => {
  try {
    const { boutique_id } = req.query;

    // Si boutique_id fourni, récupérer uniquement les articles de cette boutique
    let articleIds = null;
    if (boutique_id) {
      const articles = await Article.find({ id_boutique: boutique_id }).select('_id');
      articleIds = new Set(articles.map(a => a._id.toString()));
    }

    const mouvements = await MouvementStock.find().populate('id_article');
    const imgs = await ImgArticle.find();

    // Group by article and calculate stock
    const stockMap = {};
    mouvements.forEach(mouvement => {
      if (!mouvement.id_article) return;
      const articleId = mouvement.id_article._id.toString();

      // Filtrer par boutique si un boutique_id est fourni
      if (articleIds && !articleIds.has(articleId)) return;

      const img = imgs.find(im => im.id_article.toString() === articleId);
      if (!stockMap[articleId]) {
        stockMap[articleId] = {
          id: articleId,
          nom: mouvement.id_article.nom,
          seuil_alerte: mouvement.seuil_alerte,
          stock_entree: 0,
          stock_sortie: 0,
          img_url: img || null
        };
      }

      if (mouvement.type_mouvement === 1 || mouvement.type_mouvement === '1') {
        stockMap[articleId].stock_entree += mouvement.quantity;
      } else if (mouvement.type_mouvement === 2 || mouvement.type_mouvement === '2') {
        stockMap[articleId].stock_sortie += mouvement.quantity;
      }
    });

    const stockData = Object.values(stockMap).map(item => ({
      id: item.id,
      nom: item.nom,
      seuil_alerte: item.seuil_alerte,
      stock_entree: item.stock_entree,
      stock_sortie: item.stock_sortie,
      stock_restant: item.stock_entree - item.stock_sortie,
      img_url: item.img_url ? (process.env.URL + item.img_url.url_img) : null
    }));

    res.json(stockData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
