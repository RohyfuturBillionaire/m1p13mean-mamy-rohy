const mongoose = require('mongoose');

const LocalSchema = new mongoose.Schema({
  numero: { type: String, required: true },
  etage: { type: Number, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  loyer: { type: Number, required: true },
  status: { type: Boolean, default: true},
  longueur: { type: Number, required: true },
  largeur: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Local', LocalSchema);