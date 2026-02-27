const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ImgSlider = require('../models/ImgSlider');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/imgslider');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'));
  }
};

const upload = multer({ storage, fileFilter });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image fournie' });
    }
    
    const imgSlider = new ImgSlider({
      url_image: '/uploads/imgslider/' + req.file.filename,
    });
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
    await ImgSlider.findByIdAndDelete(req.params.id);
    res.json({ message: "Image supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
