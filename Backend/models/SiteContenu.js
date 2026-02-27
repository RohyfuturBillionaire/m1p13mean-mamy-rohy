const mongoose = require('mongoose');

const SiteContenuSchema = new mongoose.Schema({
  SHOW_PROMOTION: { type: Boolean, default: true },
  SHOW_PLAN_CENTRE: { type: Boolean, default: true },
  SHOW_BOUTIQUES: { type: Boolean, default: true },
  SHOW_EVENEMENTS: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('SiteContenu', SiteContenuSchema);
