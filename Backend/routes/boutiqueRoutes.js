const express = require('express');
const router = express.Router();
const Boutique = require('../models/Boutique');
const Local = require('../models/Local');
const upload = require('../config/multer');

// GET all boutiques
router.get('/', async (req, res) => {
  try {
    const { nom, categorie, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (nom) filter.nom = { $regex: nom, $options: 'i' };
    if (categorie) filter.id_categorie = categorie;
    if (status !== undefined) filter.status = status === 'true';

    const boutiques = await Boutique.find(filter)
      .populate('user_proprietaire', 'nom prenom email')
      .populate('id_categorie')
      .populate('local_boutique')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Boutique.countDocuments(filter);
    res.json({ data: boutiques, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET boutiques without owner (not linked to any user)
router.get('/unlinked', async (req, res) => {
  try {
    const boutiques = await Boutique.find({ 
      $or: [
        { user_proprietaire: null },
        { user_proprietaire: { $exists: false } }
      ],
      status: true
    })
      .populate('id_categorie')
      .sort({ createdAt: -1 });

    res.json({ data: boutiques });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Link a boutique to a user
router.put('/:id/link-user', async (req, res) => {
  try {
    const { userId } = req.body;
    const boutique = await Boutique.findByIdAndUpdate(
      req.params.id, 
      { user_proprietaire: userId }, 
      { new: true, runValidators: true }
    )
      .populate('user_proprietaire', 'nom prenom email')
      .populate('id_categorie');
    
    if (!boutique) return res.status(404).json({ message: 'Boutique non trouvée' });
    res.json(boutique);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET single boutique
router.get('/:id', async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id)
      .populate('user_proprietaire', 'nom prenom email')
      .populate('id_categorie')
      .populate('local_boutique');
    if (!boutique) return res.status(404).json({ message: 'Boutique non trouvée' });
    res.json(boutique);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const boutiques = await Boutique.find({ user_proprietaire: req.params.userId }) 
      .populate('user_proprietaire', 'nom prenom email')
      .populate('id_categorie')
      .populate('local_boutique');
    res.json(boutiques);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
});

// POST create boutique
router.post('/', upload.single('logo'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.logo = '/uploads/' + req.file.filename;
    }
    const boutique = new Boutique(data);
    await boutique.save();
    
    // If a local is assigned, set its status to false (occupied)
    if (data.local_boutique) {
      await Local.findByIdAndUpdate(data.local_boutique, { status: false });
    }
    
    const populated = await Boutique.findById(boutique._id)
      .populate('user_proprietaire', 'nom prenom email')
      .populate('id_categorie')
      .populate('local_boutique');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update boutique
router.put('/:id', upload.single('logo'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.logo = '/uploads/' + req.file.filename;
    }
    
    // Get current boutique to check if local is changing
    const currentBoutique = await Boutique.findById(req.params.id);
    if (!currentBoutique) return res.status(404).json({ message: 'Boutique non trouvée' });
    
    // If local is changing, update statuses
    const oldLocalId = currentBoutique.local_boutique?.toString();
    const newLocalId = data.local_boutique;
    
    if (oldLocalId !== newLocalId) {
      // Set old local as available (if exists)
      if (oldLocalId) {
        await Local.findByIdAndUpdate(oldLocalId, { status: true });
      }
      // Set new local as occupied (if exists)
      if (newLocalId) {
        await Local.findByIdAndUpdate(newLocalId, { status: false });
      }
    }
    
    const boutique = await Boutique.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
      .populate('user_proprietaire', 'nom prenom email')
      .populate('id_categorie')
      .populate('local_boutique');
    res.json(boutique);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE boutique (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const boutique = await Boutique.findByIdAndUpdate(req.params.id, { status: false }, { new: true });
    if (!boutique) return res.status(404).json({ message: 'Boutique non trouvée' });
    res.json({ message: 'Boutique désactivée', boutique });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
