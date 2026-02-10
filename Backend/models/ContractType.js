const mongoose = require('mongoose');

const ContractTypeSchema = new mongoose.Schema({
  contract_type_name: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ContractType', ContractTypeSchema);
