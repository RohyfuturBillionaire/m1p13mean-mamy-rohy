const express = require('express');
const router = express.Router();
const Promotion = require('../models/Promotion');
const Boutique = require('../models/Boutique');
const Notification = require('../models/Notification');
const upload = require('../config/multer');

// GET /active — promotions approuvees et date valide (public)
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      status: 'APPROVED',
      date_debut: { $lte: now },
      date_fin: { $gte: now }
    })
      .populate('id_article')
      .populate('id_boutique', 'nom logo email')
      .sort({ created_at: -1 });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /boutique/:boutiqueId — promotions d'une boutique (seller)
router.get('/boutique/:boutiqueId', async (req, res) => {
  try {
    const promotions = await Promotion.find({ id_boutique: req.params.boutiqueId })
      .populate('id_article')
      .populate('id_boutique', 'nom logo')
      .sort({ created_at: -1 });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET / — toutes les promotions (admin, avec filtres optionnels)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.id_boutique) filter.id_boutique = req.query.id_boutique;

    const promotions = await Promotion.find(filter)
      .populate('id_article')
      .populate('id_boutique', 'nom logo email')
      .sort({ created_at: -1 });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /:id — detail promotion
router.get('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('id_article')
      .populate('id_boutique', 'nom logo email');
    if (!promotion) return res.status(404).json({ message: 'Promotion non trouvee' });
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST / — creer promotion (seller, avec upload image)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = '/uploads/' + req.file.filename;
    }
    data.status = 'PENDING';
    const promotion = new Promotion(data);
    await promotion.save();
    const populated = await Promotion.findById(promotion._id)
      .populate('id_article')
      .populate('id_boutique', 'nom logo email');

    // Notifier l'admin d'une nouvelle demande de promotion
    await Notification.create({
      titre: 'Nouvelle demande de promotion',
      message: `"${populated.id_boutique?.nom || 'Une boutique'}" a soumis une promotion "${populated.titre}" (${populated.remise}% de remise) — en attente de validation`,
      type: 'promotion',
      lien: '/admin/promotions',
      destinataire_role: 'admin'
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /:id — modifier promotion (seller)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = '/uploads/' + req.file.filename;
    }
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
      .populate('id_article')
      .populate('id_boutique', 'nom logo email');
    if (!promotion) return res.status(404).json({ message: 'Promotion non trouvee' });
    res.json(promotion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /:id — supprimer promotion
router.delete('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) return res.status(404).json({ message: 'Promotion non trouvee' });
    res.json({ message: 'Promotion supprimee' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /:id/approve — valider promotion (admin)
router.patch('/:id/approve', async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      { status: 'APPROVED' },
      { new: true }
    )
      .populate('id_article')
      .populate('id_boutique', 'nom logo email');
    if (!promotion) return res.status(404).json({ message: 'Promotion non trouvee' });

    // Notifier le propriétaire de la boutique
    const boutique = await Boutique.findById(promotion.id_boutique).select('user_proprietaire');
    if (boutique?.user_proprietaire) {
      await Notification.create({
        titre: 'Promotion approuvée',
        message: `Votre promotion "${promotion.titre}" (${promotion.remise}% de remise) a été approuvée`,
        type: 'promotion',
        lien: '/seller/promotions',
        destinataire_user: boutique.user_proprietaire
      });
    }

    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /:id/reject — refuser promotion (admin)
router.patch('/:id/reject', async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      { status: 'REJECTED' },
      { new: true }
    )
      .populate('id_article')
      .populate('id_boutique', 'nom logo email');
    if (!promotion) return res.status(404).json({ message: 'Promotion non trouvee' });

    // Notifier le propriétaire de la boutique
    const boutique = await Boutique.findById(promotion.id_boutique).select('user_proprietaire');
    if (boutique?.user_proprietaire) {
      await Notification.create({
        titre: 'Promotion refusée',
        message: `Votre promotion "${promotion.titre}" (${promotion.remise}% de remise) a été refusée`,
        type: 'promotion',
        lien: '/seller/promotions',
        destinataire_user: boutique.user_proprietaire
      });
    }

    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
