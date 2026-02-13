const express = require('express');
const router = express.Router();
const FaqCategorie = require('../models/FaqCategorie');
// Créer un faqCategorie
router.post('/', async (req, res) => {
 try {
 const faqCategorie = new FaqCategorie(req.body);
 await faqCategorie.save();
 res.status(201).json(faqCategorie);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});
var myLogger = function (req, res, next) {
  console.log(req.url);
  next();
}
router.use(myLogger);
// Lire tous les faqCategories
router.get('/', async (req, res) => {
 try {
 const faqCategories = await FaqCategorie.find();
 res.json(faqCategories);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

router.put('/:id', async (req, res) => {
 try {
 const faqCategorie = await FaqCategorie.findByIdAndUpdate(req.params.id,
req.body, { new: true });
 res.json(faqCategorie);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});
// Supprimer un faqCategorie
router.delete('/:id', async (req, res) => {
 try {
 await FaqCategorie.findByIdAndDelete(req.params.id);
 res.json({ message: "FaqCategorie supprimé" });
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

module.exports = router;