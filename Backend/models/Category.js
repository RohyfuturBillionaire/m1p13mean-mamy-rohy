const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  nom: { type: String, required: true },
  icone: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
