const mongoose = require('mongoose');

const ImgSliderSchema = new mongoose.Schema({
  url_image: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ImgSlider', ImgSliderSchema);
