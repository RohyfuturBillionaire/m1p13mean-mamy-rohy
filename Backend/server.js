const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authenticateToken = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200', // Angular app URL
  credentials: true // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {}).then(() => console.log("MongoDB connecté")).catch(err => console.log(err));

// Public routes (no auth required)
app.use('/auth', require('./routes/authRoutes'));
app.use('/roles', require('./routes/roleRoutes'));
app.use('/users', require('./routes/userRoutes'));

// Protected routes (auth required)
app.use('/articles', authenticateToken, require('./routes/articleRoutes'));
app.use('/sitecrm', authenticateToken, require('./routes/siteCrmRoutes'));
app.use('/sitecontenu', authenticateToken, require('./routes/siteContenuRoutes'));
app.use('/imgslider', authenticateToken, require('./routes/imgSliderRoutes'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});