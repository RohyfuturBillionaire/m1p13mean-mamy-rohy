const mongoose = require('mongoose');

const HoraireBoutiqueSchema = new mongoose.Schema({
  horaire_ouverture: { type: Date, required: true },
  horaire_fermeture: { type: Date, required: true },
  id_boutique: { type: mongoose.Schema.Types.ObjectId, ref: 'Boutique', required: true },
  label: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('HoraireBoutique', HoraireBoutiqueSchema);