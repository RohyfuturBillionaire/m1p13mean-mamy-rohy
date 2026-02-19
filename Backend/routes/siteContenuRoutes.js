const express = require('express');
const router = express.Router();
const SiteContenu = require('../models/SiteContenu');

router.post('/', async (req, res) => {
 try {
 const siteContenu = new SiteContenu(req.body);
 await siteContenu.save();
 res.status(201).json(siteContenu);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});

router.get('/', async (req, res) => {
 try {
 const siteContenu = await SiteContenu.find();
 res.json(siteContenu);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

router.put('/:id', async (req, res) => {
 try {
 const siteContenu = await SiteContenu.findByIdAndUpdate(req.params.id,
req.body, { new: true });
 res.json(siteContenu);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});

router.delete('/:id', async (req, res) => {
 try {
 await SiteContenu.findByIdAndDelete(req.params.id);
 res.json({ message: "SiteContenu supprimé" });
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

module.exports = router;