const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
// Créer un message
router.post('/', async (req, res) => {
 try {
 const message = new Message(req.body);
 await message.save();
 res.status(201).json(message);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});
var myLogger = function (req, res, next) {
  console.log(req.url);
  next();
}
router.use(myLogger);
// Lire tous les messages
router.get('/', async (req, res) => {
 try {
 const messages = await Message.find();
 res.json(messages);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});
router.get('/:conversationId', async (req, res) => {
    try {
        const messages = await Message.find({
            id_conversation: req.params.conversationId
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});se

router.put('/:id', async (req, res) => {
 try {
 const message = await Message.findByIdAndUpdate(req.params.id,
req.body, { new: true });
 res.json(message);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});
// Supprimer un message
router.delete('/:id', async (req, res) => {
 try {
 await Message.findByIdAndDelete(req.params.id);
 res.json({ message: "Message supprimé" });
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

module.exports = router;