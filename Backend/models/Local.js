const mongoose = require('mongoose');

const LocalSchema = new mongoose.Schema({
  numero: { type: String, required: true },
  etage: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  loyer: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Local', LocalSchema);