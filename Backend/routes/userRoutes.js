const express = require('express');
const router = express.Router();
const User = require('../models/User');
// Créer un utilisateur
var myLogger = function (req, res, next) {
  console.log(req.url);
  next();
}
router.use(myLogger);
// Lire tous les utilisateurs
router.get('/', async (req, res) => {
 try {
 const users = await User.find();
 res.json(users);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

router.put('/:id', async (req, res) => {
 try {

 const user = await User.findByIdAndUpdate(req.params.id,
req.body, { new: true });
 res.json(user);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});
// Supprimer un utilisateur
router.delete('/:id', async (req, res) => {
 try {
 await User.findByIdAndDelete(req.params.id);
 res.json({ message: "User supprimé" });
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

module.exports = router;