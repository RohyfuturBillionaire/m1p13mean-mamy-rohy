const mongoose = require('mongoose');

const LocalSchema = new mongoose.Schema({
  numero: { type: String, required: true },
  etage: { type: Number, required: true, default: 1 },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  largeur: { type: Number, default: 1 },
  hauteur: { type: Number, default: 1 },
  couleur: { type: String, default: '#C9A962' },
  statut: { type: String, enum: ['LIBRE', 'OCCUPE'], default: 'LIBRE' },
  id_boutique: { type: mongoose.Schema.Types.ObjectId, ref: 'Boutique', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Local', LocalSchema);
