const mongoose = require('mongoose');

const BucketItemSchema = new mongoose.Schema({
  id_article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  id_boutique: { type: mongoose.Schema.Types.ObjectId, ref: 'Boutique', required: true },
  quantite: { type: Number, required: true, min: 1 },
  prix: { type: Number, required: true }
}, { _id: false });

const BucketSchema = new mongoose.Schema({
  id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [BucketItemSchema],
  total: { type: Number, default: 0 },
  status: { type: String, default: 'actif' }
}, { timestamps: true });

module.exports = mongoose.model('Bucket', BucketSchema);
