const mongoose = require('mongoose');

const faqCategorieSchema = new mongoose.Schema({
    nom_categorie: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FaqCategorie', faqCategorieSchema);
