const express = require('express');
const router = express.Router();
const Local = require('../models/Local');
const Boutique = require('../models/Boutique');

// GET /api/locaux — list all (public, used by client map)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.etage) filter.etage = Number(req.query.etage);

    const locaux = await Local.find(filter)
      .populate('id_boutique', 'nom logo type_boutique description')
      .sort({ etage: 1, y: 1, x: 1 });

    res.json(locaux);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/locaux/:id — single
router.get('/:id', async (req, res) => {
  try {
    const local = await Local.findById(req.params.id)
      .populate('id_boutique', 'nom logo type_boutique description');
    if (!local) return res.status(404).json({ message: 'Local non trouvé' });
    res.json(local);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/locaux — create a new space (admin)
router.post('/', async (req, res) => {
  try {
    const { numero, etage, x, y, largeur, hauteur, couleur } = req.body;

    if (!numero || x === undefined || y === undefined) {
      return res.status(400).json({ message: 'numero, x et y sont requis' });
    }

    const local = new Local({ numero, etage, x, y, largeur, hauteur, couleur });
    await local.save();

    res.status(201).json(local);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/locaux/:id — update space properties (admin)
router.put('/:id', async (req, res) => {
  try {
    const { numero, etage, x, y, largeur, hauteur, couleur, statut } = req.body;

    const local = await Local.findByIdAndUpdate(
      req.params.id,
      { numero, etage, x, y, largeur, hauteur, couleur, statut },
      { new: true, runValidators: true }
    ).populate('id_boutique', 'nom logo type_boutique description');

    if (!local) return res.status(404).json({ message: 'Local non trouvé' });
    res.json(local);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/locaux/:id/assign-boutique — assign/unassign boutique (admin)
router.put('/:id/assign-boutique', async (req, res) => {
  try {
    const { id_boutique } = req.body;

    const update = id_boutique
      ? { id_boutique, statut: 'OCCUPE' }
      : { id_boutique: null, statut: 'LIBRE' };

    // Validate boutique exists if assigning
    if (id_boutique) {
      const boutique = await Boutique.findById(id_boutique);
      if (!boutique) return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    const local = await Local.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).populate('id_boutique', 'nom logo type_boutique description');

    if (!local) return res.status(404).json({ message: 'Local non trouvé' });
    res.json(local);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/locaux/:id — delete space (admin)
router.delete('/:id', async (req, res) => {
  try {
    const local = await Local.findByIdAndDelete(req.params.id);
    if (!local) return res.status(404).json({ message: 'Local non trouvé' });
    res.json({ message: 'Local supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
