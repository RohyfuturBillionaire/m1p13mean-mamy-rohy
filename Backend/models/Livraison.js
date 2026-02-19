const mongoose = require('mongoose');

const LivraisonSchema = new mongoose.Schema({
  lieu_livraison: { type: String, required: true },
  date_livraison: { type: Date },
  status: {
    type: String,
    enum: ['EN_PREPARATION', 'EXPEDIEE', 'EN_TRANSIT', 'LIVREE'],
    default: 'EN_PREPARATION'
  },
  id_client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id_boutique: { type: mongoose.Schema.Types.ObjectId, ref: 'Boutique', required: true },
  id_commande: { type: mongoose.Schema.Types.ObjectId, ref: 'Commande', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Livraison', LivraisonSchema);
