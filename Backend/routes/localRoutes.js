const express = require('express');
const router = express.Router();
const Local = require('../models/Local');

// Get available locals (status: true)
router.get('/available', async (req, res) => {
  try {
    const locaux = await Local.find({ status: true });
    res.json(locaux);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer un local
router.post('/', async (req, res) => {
 try {
 const local = new Local(req.body);
 await local.save();
 res.status(201).json(local);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});
var myLogger = function (req, res, next) {
  console.log(req.url);
  next();
}
router.use(myLogger);
// Lire tous les locaux
router.get('/', async (req, res) => {
 try {
 const locaux = await Local.find();
 res.json(locaux);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

router.put('/:id', async (req, res) => {
 try {
 const local = await Local.findByIdAndUpdate(req.params.id,
req.body, { new: true });
 res.json(local);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});
// Supprimer un local
router.delete('/:id', async (req, res) => {
 try {
 await Local.findByIdAndDelete(req.params.id);
 res.json({ message: "Local supprimé" });
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

module.exports = router;