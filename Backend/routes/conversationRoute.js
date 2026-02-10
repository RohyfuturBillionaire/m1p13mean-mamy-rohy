const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
// Créer une conversation
router.post('/', async (req, res) => {
 try {
 const conversation = new Conversation(req.body);
 await conversation.save();
 res.status(201).json(conversation);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});
var myLogger = function (req, res, next) {
  console.log(req.url);
  next();
}
router.use(myLogger);
// Lire toutes les conversations
router.get('/', async (req, res) => {
 try {
 const conversations = await Conversation.find();
 res.json(conversations);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

router.get('/:userId', async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.params.userId
        });
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
 try {
 const conversation = await Conversation.findByIdAndUpdate(req.params.id,
req.body, { new: true });
 res.json(conversation);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});
// Supprimer une conversation
router.delete('/:id', async (req, res) => {
 try {
 await Conversation.findByIdAndDelete(req.params.id);
 res.json({ message: "Conversation supprimée" });
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

module.exports = router;