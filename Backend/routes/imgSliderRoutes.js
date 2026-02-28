const express = require('express');
const router = express.Router();
const ImgSlider = require('../models/ImgSlider');
const upload = require('../config/multer');
const { uploadFile, deleteFile } = require('../config/blob');

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image fournie' });
    }

    const url = await uploadFile(req.file, 'slider');
    const imgSlider = new ImgSlider({ url_image: url });
    await imgSlider.save();
    res.status(201).json(imgSlider);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const imgSliders = await ImgSlider.find();
    res.json(imgSliders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const imgSlider = await ImgSlider.findByIdAndUpdate(req.params.id,
      req.body, { new: true });
    res.json(imgSlider);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const imgSlider = await ImgSlider.findByIdAndDelete(req.params.id);
    if (imgSlider) await deleteFile(imgSlider.url_image);
    res.json({ message: "Image supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
