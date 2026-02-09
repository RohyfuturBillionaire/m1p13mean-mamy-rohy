const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  contract_type: { type: mongoose.Schema.Types.ObjectId, ref: 'ContractType', required: true },
  date_debut: { type: Date, required: true },
  date_fin: { type: Date, required: true },
  id_boutique: { type: mongoose.Schema.Types.ObjectId, ref: 'Boutique' },
  id_client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  loyer: { type: Number, required: true },
  nom_client: { type: String },
  nom_entreprise: { type: String },
  surface: { type: Number },
  etage: { type: Number },
  numero: { type: String },
  statut: { type: String, enum: ['actif', 'expire', 'resilie'], default: 'actif' }
}, { timestamps: true });

module.exports = mongoose.model('Contract', ContractSchema);
