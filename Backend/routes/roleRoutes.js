const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const authenticateToken = require('../middleware/authMiddleware');
// Créer un role
router.post('/',authenticateToken ,async (req, res) => {
 try {
 const role = new Role(req.body);
 await role.save();
 res.status(201).json(role);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});
var myLogger = function (req, res, next) {
  console.log(req.url);
  next();
}
router.use(myLogger);
// Lire tous les roles
router.get('/', async (req, res) => {
 try {
 const roles = await Role.find();
 res.json(roles);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

router.put('/:id', authenticateToken, async (req, res) => {
 try {
 const role = await Role.findByIdAndUpdate(req.params.id,
req.body, { new: true });
 res.json(role);
 } catch (error) {
 res.status(400).json({ message: error.message });
 }
});
// Supprimer un role
router.delete('/:id', authenticateToken, async (req, res) => {
 try {
 await Role.findByIdAndDelete(req.params.id);
 res.json({ message: "Role supprimé" });
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

module.exports = router;