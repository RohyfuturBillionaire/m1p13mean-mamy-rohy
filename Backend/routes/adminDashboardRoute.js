const express = require('express');
const router = express.Router();
// const Faq = require('../models/Faq');
// Créer un faqCategorie
// Lire tous les faq
const User = require('../models/User');
const Boutique = require('../models/Boutique');
const Payment = require('../models/Payment');
const Promotion = require('../models/Promotion');

router.get('/', async (req, res) => {
 try {
//  const faqs = await Faq.find();
 const boutiques = await Boutique.find({ 
       status: true
     });
 const clients = await User.find().populate('id_role', 'role_name');
 const revenuePayementLoyer = await Payment.aggregate([
  {
    $match: {
      status: 'paye'
    }
  },
  {
    $group: {
      _id: null,
      total: { $sum: '$montant' }
    }
  }
]);
    const revenue_par_mois = await Payment.aggregate([
  {
    $match: {
      status: 'paye',
    }
  },
  {
    $group: {
      _id: { 
        year: "$annee", 
        month: "$mois" 
      },
      totalAmount: { $sum: "$montant" },
      count: { $sum: 1 } // Optional: counts number of payments per month
    }
  }
]);
const loyer_par_boutique = await Boutique.find();
const promo = await Promotion.find();
const dashboardData = {
  totalBoutiques: boutiques.length,
  totalClients: clients.filter(client => client.id_role && client.id_role.role_name === 'user').length,
  revenue_par_mois: revenue_par_mois,
  boutiques:loyer_par_boutique,
  promo_en_attente:promo.filter(prom => prom.status === 'PENDING').length,
  promo_approuve:promo.filter(prom => prom.status === 'APPROVED').length,
  promo_rejete:promo.filter(prom => prom.status === 'REJECTED').length,
  // totalArticles: articles.length,
  // totalMouvements: mouvements.length,
  // totalFaqs: faqs.length,
  revenuePayementLoyer: revenuePayementLoyer[0] ? revenuePayementLoyer[0].total : 0
};
 res.json(dashboardData);
 } catch (error) {
 res.status(500).json({ message: error.message });
 }
});

module.exports = router;