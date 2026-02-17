const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const Boutique = require('../models/Boutique');
const authenticateToken = require('../middleware/authMiddleware');

// GET users (with filters: role, unassigned, search, pagination)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role, unassigned, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    // Filter by role name
    if (role) {
      const roleDoc = await Role.findOne({ role_name: role });
      if (!roleDoc) return res.json({ data: [], total: 0, page: Number(page), limit: Number(limit) });
      filter.id_role = roleDoc._id;
    }

    // Search by username (case-insensitive)
    if (search) {
      filter.username = { $regex: search, $options: 'i' };
    }

    const total = await User.countDocuments(filter);

    let users = await User.find(filter)
      .select('-password')
      .populate('id_role')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    // Exclude users already assigned to an active boutique
    if (unassigned === 'true') {
      const assignedBoutiques = await Boutique.find({ user_proprietaire: { $ne: null }, status: true })
        .select('user_proprietaire');
      const assignedUserIds = assignedBoutiques.map(b => b.user_proprietaire.toString());
      users = users.filter(u => !assignedUserIds.includes(u._id.toString()));
    }

    // Enrich with boutique association info
    const boutiqueUsers = await Boutique.find({ user_proprietaire: { $ne: null }, status: true })
      .select('user_proprietaire nom _id');
    const boutiqueMap = {};
    boutiqueUsers.forEach(b => {
      boutiqueMap[b.user_proprietaire.toString()] = { boutiqueId: b._id, boutiqueNom: b.nom };
    });

    const enrichedUsers = users.map(u => {
      const obj = u.toObject();
      obj.boutique = boutiqueMap[obj._id.toString()] || null;
      return obj;
    });

    res.json({ data: enrichedUsers, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
