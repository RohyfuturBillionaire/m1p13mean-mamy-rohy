const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const authenticateToken = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:4200','https://m1p13mean-mamy-rohy-g7pl.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(require('cookie-parser')());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {}).then(() => console.log("MongoDB connecté")).catch(err => console.log(err));

// Auth & roles
app.use('/auth', require('./routes/authRoutes'));
app.use('/roles', require('./routes/roleRoutes'));

// Legacy routes
// Public routes (no auth required)
app.use('/auth', require('./routes/authRoutes'));
app.use('/roles', require('./routes/roleRoutes'));
app.use('/users',authenticateToken, require('./routes/userRoutes'));
app.use('/horaire', require('./routes/horaireBoutiqueRoutes'));
app.use('/local', require('./routes/localRoutes'));
app.use('/mouvementstock', authenticateToken, require('./routes/MouvementStockRoute'));
// Protected routes (auth required)
app.use('/admin',require('./routes/adminDashboardRoute'));
app.use('/articles', authenticateToken, require('./routes/articleRoutes'));
app.use('/sitecrm', require('./routes/siteCrmRoutes'));
app.use('/sitecontenu', authenticateToken, require('./routes/siteContenuRoutes'));
app.use('/imgslider', authenticateToken, require('./routes/imgSliderRoutes'));
app.use('/conversations', authenticateToken, require('./routes/conversationRoute'));
app.use('/messages', authenticateToken, require('./routes/MessageRoute'));
app.use('/faqs', authenticateToken, require('./routes/faqRoutes'));
app.use('/faqCategories', require('./routes/faqCategorieRoutes'));


// API routes
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/contract-types', require('./routes/contractTypeRoutes'));
app.use('/api/boutiques', require('./routes/boutiqueRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/promotions', require('./routes/promotionRoutes'));
app.use('/api/locaux', require('./routes/localRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/bucket', require('./routes/bucketRoutes'));
app.use('/api/commandes', require('./routes/commandeRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/avis', require('./routes/avisRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Cron jobs
const cron = require('node-cron');
const { generateCurrentMonthPayments, checkOverduePayments } = require('./utils/paymentGenerator');

// Verification quotidienne des retards a minuit
cron.schedule('0 0 * * *', async () => {
  try {
    const result = await checkOverduePayments();
    console.log(`[CRON] Verification retards: ${result.updated} paiements mis a jour`);
  } catch (error) {
    console.error('[CRON] Erreur verification retards:', error.message);
  }
});

// Generation automatique le 1er de chaque mois a 1h du matin
cron.schedule('0 1 1 * *', async () => {
  try {
    const result = await generateCurrentMonthPayments();
    console.log(`[CRON] Generation mensuelle: ${result.created} crees, ${result.skipped} ignores`);
  } catch (error) {
    console.error('[CRON] Erreur generation mensuelle:', error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
