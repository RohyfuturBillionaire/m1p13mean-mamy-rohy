const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const Commande = require('../models/Commande');
const Bucket = require('../models/Bucket');
const Article = require('../models/Article');
const MouvementStock = require('../models/MouvementStock');
const Livraison = require('../models/Livraison');
const authenticateToken = require('../middleware/authMiddleware');
const requireBoutique = require('../middleware/requireBoutique');

// Helper: compute current stock for an article
async function getCurrentStock(articleId, session) {
  const query = MouvementStock.find({ id_article: articleId });
  if (session) query.session(session);
  const mouvements = await query;
  let stock = 0;
  for (const m of mouvements) {
    if (m.type_mouvement === 1) stock += m.quantity;
    else if (m.type_mouvement === 2) stock -= m.quantity;
  }
  return stock;
}

// Generate unique order number
function generateNumeroCommande() {
  const now = new Date();
  const d = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TC-${d}-${rand}`;
}

// POST /api/commandes/checkout — create orders (1 per boutique), decrement stock, clear bucket
router.post('/checkout', authenticateToken, async (req, res) => {
  const { methodePaiement, clientNom, clientEmail, clientTelephone, clientAdresse, typeLivraison, lieuLivraison } = req.body;

  try {
    // 1. Load bucket
    const bucket = await Bucket.findOne({ id_user: req.user.userId });
    if (!bucket || bucket.items.length === 0) {
      return res.status(400).json({ message: 'Panier vide' });
    }

    // 2. Verify stock for ALL items before creating anything
    for (const item of bucket.items) {
      const stock = await getCurrentStock(item.id_article, null);
      if (stock < item.quantite) {
        const article = await Article.findById(item.id_article);
        return res.status(409).json({
          message: `Stock insuffisant pour "${article?.nom || 'article'}"`,
          articleId: item.id_article,
          disponible: stock,
          demande: item.quantite
        });
      }
    }

    // 3. Load article details for snapshots
    const articleIds = bucket.items.map(i => i.id_article);
    const articles = await Article.find({ _id: { $in: articleIds } });
    const articleMap = {};
    articles.forEach(a => { articleMap[a._id.toString()] = a; });

    // 4. Group items by boutique
    const byBoutique = {};
    for (const item of bucket.items) {
      const boutiqueId = item.id_boutique.toString();
      if (!byBoutique[boutiqueId]) byBoutique[boutiqueId] = [];
      byBoutique[boutiqueId].push(item);
    }

    // 5. Create one commande per boutique
    const createdCommandes = [];

    for (const [boutiqueId, items] of Object.entries(byBoutique)) {
      const commandeArticles = items.map(item => {
        const article = articleMap[item.id_article.toString()];
        return {
          id_article: item.id_article,
          nom: article ? article.nom : 'Article',
          prix: item.prix_promo || item.prix,
          quantite: item.quantite
        };
      });

      const total = commandeArticles.reduce((sum, a) => sum + a.prix * a.quantite, 0);

      const commande = await Commande.create({
        articles: commandeArticles,
        type_livraison: typeLivraison || 'standard',
        status: 'EN_ATTENTE',
        id_client: req.user.userId,
        total,
        id_boutique: boutiqueId,
        date_commande: new Date(),
        numero_commande: generateNumeroCommande(),
        methode_paiement: methodePaiement,
        client_nom: clientNom,
        client_email: clientEmail,
        client_telephone: clientTelephone,
        client_adresse: clientAdresse
      });

      // 6. Create MouvementStock (type=2 exit) for each item
      for (const item of items) {
        await MouvementStock.create({
          id_article: item.id_article,
          quantity: item.quantite,
          type_mouvement: 2,
          date_mouvement: new Date()
        });
      }

      // 7. Create Livraison if needed
      if (typeLivraison === 'livraison' && lieuLivraison) {
        await Livraison.create({
          lieu_livraison: lieuLivraison,
          status: 'EN_PREPARATION',
          id_client: req.user.userId,
          id_boutique: boutiqueId,
          id_commande: commande._id
        });
      }

      createdCommandes.push(commande);
    }

    // 8. Clear bucket
    bucket.items = [];
    bucket.total = 0;
    await bucket.save();

    // Populate and return
    const populated = await Commande.find({
      _id: { $in: createdCommandes.map(c => c._id) }
    })
      .populate('id_boutique', 'nom logo')
      .populate('id_client', 'username email');

    res.status(201).json({ commandes: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/commandes — user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const commandes = await Commande.find({ id_client: req.user.userId })
      .populate('id_boutique', 'nom logo')
      .sort({ date_commande: -1 });

    res.json(commandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/commandes/boutique — boutique's orders (seller view)
router.get('/boutique', authenticateToken, requireBoutique, async (req, res) => {
  try {
    if (!req.boutique) {
      return res.status(403).json({ message: 'Accès réservé aux boutiques' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const filter = { id_boutique: req.boutique._id };
    if (status) filter.status = status;

    const total = await Commande.countDocuments(filter);
    const commandes = await Commande.find(filter)
      .populate('id_client', 'username email')
      .sort({ date_commande: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ data: commandes, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/commandes/boutique/stats — aggregated KPIs for seller
router.get('/boutique/stats', authenticateToken, requireBoutique, async (req, res) => {
  try {
    if (!req.boutique) {
      return res.status(403).json({ message: 'Accès réservé aux boutiques' });
    }

    const boutiqueId = req.boutique._id;

    // Global stats (exclude ANNULEE)
    const globalStats = await Commande.aggregate([
      { $match: { id_boutique: boutiqueId, status: { $ne: 'ANNULEE' } } },
      { $unwind: '$articles' },
      {
        $group: {
          _id: null,
          totalRevenu: { $sum: '$total' },
          totalArticlesVendus: { $sum: '$articles.quantite' },
          nbCommandes: { $sum: 1 }
        }
      }
    ]);

    // Fix: totalRevenu should be sum of totals at commande level, not after unwind
    const revenueStats = await Commande.aggregate([
      { $match: { id_boutique: boutiqueId, status: { $ne: 'ANNULEE' } } },
      {
        $group: {
          _id: null,
          totalRevenu: { $sum: '$total' },
          nbCommandes: { $sum: 1 }
        }
      }
    ]);

    const articleStats = await Commande.aggregate([
      { $match: { id_boutique: boutiqueId, status: { $ne: 'ANNULEE' } } },
      { $unwind: '$articles' },
      {
        $group: {
          _id: null,
          totalArticlesVendus: { $sum: '$articles.quantite' }
        }
      }
    ]);

    // Monthly breakdown (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthly = await Commande.aggregate([
      {
        $match: {
          id_boutique: boutiqueId,
          status: { $ne: 'ANNULEE' },
          date_commande: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: { year: { $year: '$date_commande' }, month: { $month: '$date_commande' } },
          revenu: { $sum: '$total' },
          nbCommandes: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Best sellers
    const bestSellers = await Commande.aggregate([
      { $match: { id_boutique: boutiqueId, status: { $ne: 'ANNULEE' } } },
      { $unwind: '$articles' },
      {
        $group: {
          _id: '$articles.id_article',
          nom: { $first: '$articles.nom' },
          totalVendu: { $sum: '$articles.quantite' },
          revenu: { $sum: { $multiply: ['$articles.prix', '$articles.quantite'] } }
        }
      },
      { $sort: { totalVendu: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalRevenu: revenueStats[0]?.totalRevenu || 0,
      totalArticlesVendus: articleStats[0]?.totalArticlesVendus || 0,
      nbCommandes: revenueStats[0]?.nbCommandes || 0,
      monthly: monthly.map(m => ({
        year: m._id.year,
        month: m._id.month,
        revenu: m.revenu,
        nbCommandes: m.nbCommandes
      })),
      bestSellers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/commandes/:id — single order (verify ownership)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id)
      .populate('id_boutique', 'nom logo')
      .populate('id_client', 'username email');

    if (!commande) return res.status(404).json({ message: 'Commande introuvable' });

    // Verify ownership: either the client or the boutique owner
    const isClient = commande.id_client._id.toString() === req.user.userId;
    if (!isClient) {
      // Check if user is boutique owner
      const Boutique = require('../models/Boutique');
      const boutique = await Boutique.findOne({ _id: commande.id_boutique._id, user_proprietaire: req.user.userId });
      if (!boutique) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    }

    res.json(commande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/commandes/:id/status — update order status (boutique only)
router.put('/:id/status', authenticateToken, requireBoutique, async (req, res) => {
  try {
    if (!req.boutique) {
      return res.status(403).json({ message: 'Accès réservé aux boutiques' });
    }

    const { status } = req.body;
    const validStatuses = ['EN_ATTENTE', 'VALIDEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const commande = await Commande.findById(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande introuvable' });

    // Verify boutique ownership
    if (commande.id_boutique.toString() !== req.boutique._id.toString()) {
      return res.status(403).json({ message: 'Cette commande ne vous appartient pas' });
    }

    // Prevent status regression from terminal states
    if (['LIVREE', 'ANNULEE'].includes(commande.status)) {
      return res.status(400).json({ message: `Impossible de modifier une commande ${commande.status}` });
    }

    commande.status = status;
    await commande.save();

    const populated = await Commande.findById(commande._id)
      .populate('id_boutique', 'nom logo')
      .populate('id_client', 'username email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
