const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const authenticateToken = require('../middleware/authMiddleware');

// Récupère les notifications visibles par l'utilisateur courant
// (destinataire direct + son rôle + global)
async function getVisibleQuery(userId) {
  const user = await User.findById(userId).populate('id_role').lean();
  const roleName = user?.id_role?.role_name || null;
  return {
    $or: [
      { destinataire_user: userId },
      ...(roleName ? [{ destinataire_role: roleName }] : []),
      { global: true }
    ]
  };
}

// GET /api/notifications — Liste des notifications de l'utilisateur connecté
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = await getVisibleQuery(req.user.userId);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .lean();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/notifications/unread-count — Compteur non lues
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const visibleQuery = await getVisibleQuery(req.user.userId);
    const count = await Notification.countDocuments({ ...visibleQuery, lu: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notifications — Créer une notification (admin uniquement)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { titre, message, type, lien, destinataire_user, destinataire_role, global: isGlobal } = req.body;

    if (!titre || !message) {
      return res.status(400).json({ message: 'Les champs titre et message sont obligatoires.' });
    }

    if (!destinataire_user && !destinataire_role && !isGlobal) {
      return res.status(400).json({
        message: 'Précisez un destinataire : utilisateur, rôle, ou cochez global.'
      });
    }

    const notification = await Notification.create({
      titre,
      message,
      type: type || 'info',
      lien: lien || null,
      destinataire_user: destinataire_user || null,
      destinataire_role: destinataire_role || null,
      global: isGlobal || false
    });

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/read-all — Marquer toutes comme lues
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const visibleQuery = await getVisibleQuery(req.user.userId);
    await Notification.updateMany({ ...visibleQuery, lu: false }, { lu: true });
    res.json({ message: 'Toutes les notifications ont été marquées comme lues.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/:id/read — Marquer une notification comme lue
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { lu: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable.' });
    }
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/notifications/:id — Supprimer une notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable.' });
    }
    res.json({ message: 'Notification supprimée.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
