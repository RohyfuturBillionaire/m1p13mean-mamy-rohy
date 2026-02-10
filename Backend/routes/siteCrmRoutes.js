const express = require('express');
const router = express.Router();
const SiteCrm = require('../models/SiteCrm');

router.post('/', async (req, res) => {
 try {
 const siteCrm = new SiteCrm(req.body);
 await siteCrm.save();
 console.log(siteCrm);
 res.status(201).json(siteCrm);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});

router.get('/', async (req, res) => {
 try {
 const siteCrm = await SiteCrm.find();
 res.json(siteCrm);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});
router.get('/last', async (req, res) => {
 try {
 const siteCrm = await SiteCrm.find().sort({ createdAt: -1 }).limit(1);
 res.json(siteCrm);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

router.put('/:id', async (req, res) => {
 try {
 const siteCrm = await SiteCrm.findByIdAndUpdate(req.params.id,
req.body, { new: true });
 res.json(siteCrm);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});

router.delete('/:id', async (req, res) => {
 try {
 await SiteCrm.findByIdAndDelete(req.params.id);
 res.json({ message: "SiteCrm supprimé" });
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

module.exports = router;