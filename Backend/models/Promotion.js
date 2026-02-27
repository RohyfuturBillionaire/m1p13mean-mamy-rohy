const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  date_debut: { type: Date, required: true },
  date_fin: { type: Date, required: true },
  remise: { type: Number, required: true },
  id_article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  id_boutique: { type: mongoose.Schema.Types.ObjectId, ref: 'Boutique', required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Promotion', PromotionSchema);
