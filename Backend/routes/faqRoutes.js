const express = require('express');
const router = express.Router();
const Faq = require('../models/Faq');
// Créer un faqCategorie
router.post('/', async (req, res) => {
 try {
 const faq = new Faq(req.body);
 await faq.save();
 res.status(201).json(faq);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});
var myLogger = function (req, res, next) {
  console.log(req.url);
  next();
}
router.use(myLogger);
// Lire tous les faq
router.get('/', async (req, res) => {
 try {
 const faqs = await Faq.find();
 res.json(faqs);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

router.get('/:boutiqueId', async (req, res) => {
    try {
        const faqs = await Faq.find({ id_boutique: req.params.boutiqueId });
        res.json(faqs);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
 try {
 const faq = await Faq.findByIdAndUpdate(req.params.id,
req.body, { new: true });
 res.json(faq);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});
// Supprimer un faq
router.delete('/:id', async (req, res) => {
 try {
 await Faq.findByIdAndDelete(req.params.id);
 res.json({ message: "Faq supprimé" });
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

module.exports = router;