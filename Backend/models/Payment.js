const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  id_contract: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  id_boutique: { type: mongoose.Schema.Types.ObjectId, ref: 'Boutique', required: true },
  mois: { type: Number, required: true, min: 1, max: 12 },
  annee: { type: Number, required: true },
  montant: { type: Number, required: true },
  date_echeance: { type: Date, required: true },
  date_paiement: { type: Date, default: null },
  status: { type: String, enum: ['paye', 'en_attente', 'en_retard'], default: 'en_attente' },
  facture_numero: { type: String, unique: true, sparse: true },
  notes: { type: String },
  email_sent: { type: Boolean, default: false },
  email_sent_date: { type: Date, default: null }
}, { timestamps: true });

// Index unique pour eviter les doublons
PaymentSchema.index({ id_contract: 1, mois: 1, annee: 1 }, { unique: true });

// Pre-save hook pour generer le numero de facture
PaymentSchema.pre('save', async function () {
  if (!this.facture_numero) {
    const count = await mongoose.model('Payment').countDocuments();
    this.facture_numero = `FACT-${this.annee}-${String(this.mois).padStart(2, '0')}-${String(count + 1).padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('Payment', PaymentSchema);
