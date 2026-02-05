const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  id_role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
  article_souhait: [{ type: mongoose.Schema.Types.ObjectId, ref: 'article' }],
  boutique_favoris: [{ type: mongoose.Schema.Types.ObjectId, ref: 'boutique' }],
  achat: [{
  article_id: { type: mongoose.Schema.Types.ObjectId, ref: 'article' },
  prix: Number,
  quantite: Number,
  date_achat: { type: Date, default: Date.now }
}]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
