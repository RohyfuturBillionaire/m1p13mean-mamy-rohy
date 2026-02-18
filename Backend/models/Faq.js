const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    reponse: {
        type: String,
        required: true
    },
    id_boutique: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Boutique',
        required: true
    },
    id_categorie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FaqCategorie',
        required: true
    },
    ordre: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Faq', faqSchema);
