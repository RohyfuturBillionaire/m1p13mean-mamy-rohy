const mongoose = require('mongoose');

const CommandeArticleSchema = new mongoose.Schema({
  id_article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  nom: { type: String, required: true },
  prix: { type: Number, required: true },
  quantite: { type: Number, required: true, min: 1 }
}, { _id: false });

const CommandeSchema = new mongoose.Schema({
  articles: [CommandeArticleSchema],
  type_livraison: { type: String, default: 'standard' },
  status: {
    type: String,
    enum: ['EN_ATTENTE', 'VALIDEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE'],
    default: 'EN_ATTENTE'
  },
  id_client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  total: { type: Number, required: true },
  id_boutique: { type: mongoose.Schema.Types.ObjectId, ref: 'Boutique', required: true },
  date_commande: { type: Date, default: Date.now },
  numero_commande: { type: String, unique: true },
  methode_paiement: { type: String },
  client_nom: { type: String },
  client_email: { type: String },
  client_telephone: { type: String },
  client_adresse: { type: String }
}, { timestamps: true });

CommandeSchema.index({ id_boutique: 1, date_commande: -1 });
CommandeSchema.index({ id_client: 1, date_commande: -1 });

module.exports = mongoose.model('Commande', CommandeSchema);
