const express = require('express');
const router = express.Router();
const MouvementStock = require('../models/MouvementStock');
const ImgArticle = require('../models/ImgArticle');

// GET all mouvements
router.get('/', async (req, res) => {
  try {
    const mouvements = await MouvementStock.find().sort({ createdAt: -1 }).populate('id_article');
    res.json(mouvements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create mouvement
router.post('/', async (req, res) => {
  try {
    const mouvement = new MouvementStock(req.body);
    await mouvement.save();
    res.status(201).json(mouvement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/current-stocks', async (req, res) => {
  try {
    const mouvements = await MouvementStock.find().populate('id_article');
    const imgs= await ImgArticle.find();
    // Group by article and calculate stock
    const stockMap = {};
    console.log("all imgs :",imgs);
    mouvements.forEach(mouvement => {
      if (!mouvement.id_article) return;
       let articleId = mouvement.id_article._id.toString();
       let img = imgs.filter(im => im.id_article.toString() === articleId)[0];
       console.log("img :",img);
      if (!stockMap[articleId]) {
        stockMap[articleId] = {
          id: articleId,
          nom: mouvement.id_article.nom,
          seuil_alerte: mouvement.seuil_alerte,
          stock_entree: 0,  // type 1
          stock_sortie: 0,  // type 2
          stock_restant: 0,
          img_url :img
        };
      }
      console.log(`Processing mouvement for article ${mouvement.id_article.nom}: type ${mouvement.type_mouvement}, quantity ${mouvement.quantity}`);

      // type 1 = entrée (add), type 2 = sortie (subtract)
      if (mouvement.type_mouvement === 1 || mouvement.type_mouvement === '1') {
        console.log(`Adding ${mouvement.quantity} to stock_entree for article ${mouvement.id_article.nom}`);
        stockMap[articleId].stock_entree += mouvement.quantity;
      } else if (mouvement.type_mouvement === 2 || mouvement.type_mouvement === '2') {
        console.log(`Adding ${mouvement.quantity} to stock_sortie for article ${mouvement.id_article.nom}`);
        stockMap[articleId].stock_sortie += mouvement.quantity;
      }
    });
    

    // Calculate remaining stock
    // console.log(stockMap);
    const stockData = Object.values(stockMap).map(item => ({
      id: item.id,
      nom: item.nom,
      seuil_alerte: item.seuil_alerte,
      stock_entree: item.stock_entree,
      stock_sortie: item.stock_sortie,
      stock_restant: item.stock_entree - item.stock_sortie,
      img_url:process.env.URL+item.img_url.url_img
    }));
    console.log(stockData);
    // res.json(stockData);
    res.json(stockData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
