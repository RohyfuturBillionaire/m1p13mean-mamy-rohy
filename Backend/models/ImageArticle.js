const mongoose = require('mongoose');

const ImageArticleSchema = new mongoose.Schema({
  url_img: { type: String, required: true },
  id_article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true }
}, { timestamps: true });

module.exports =  mongoose.model('ImageArticle', ImageArticleSchema);