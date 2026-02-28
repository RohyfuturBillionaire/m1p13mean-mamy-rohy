const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['paiement', 'demande', 'alerte', 'info', 'commande', 'stock', 'promotion', 'message'],
      default: 'info'
    },
    lien: { type: String, default: null },
    lu: { type: Boolean, default: false },
    // Ciblage : un seul de ces champs doit être renseigné, ou global = true
    destinataire_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    destinataire_role: { type: String, default: null }, // 'admin', 'boutique', 'client'
    global: { type: Boolean, default: false }
  },
  { timestamps: true }
);

NotificationSchema.index({ destinataire_user: 1, createdAt: -1 });
NotificationSchema.index({ destinataire_role: 1, createdAt: -1 });
NotificationSchema.index({ global: 1, createdAt: -1 });
NotificationSchema.index({ lu: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
