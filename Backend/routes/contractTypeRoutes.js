const express = require('express');
const router = express.Router();
const ContractType = require('../models/ContractType');

// GET all contract types
router.get('/', async (req, res) => {
  try {
    const types = await ContractType.find().sort({ contract_type_name: 1 });
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single contract type
router.get('/:id', async (req, res) => {
  try {
    const type = await ContractType.findById(req.params.id);
    if (!type) return res.status(404).json({ message: 'Type de contrat non trouvé' });
    res.json(type);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create contract type
router.post('/', async (req, res) => {
  try {
    const contractType = new ContractType(req.body);
    await contractType.save();
    res.status(201).json(contractType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update contract type
router.put('/:id', async (req, res) => {
  try {
    const type = await ContractType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!type) return res.status(404).json({ message: 'Type de contrat non trouvé' });
    res.json(type);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE contract type
router.delete('/:id', async (req, res) => {
  try {
    const type = await ContractType.findByIdAndDelete(req.params.id);
    if (!type) return res.status(404).json({ message: 'Type de contrat non trouvé' });
    res.json({ message: 'Type de contrat supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
