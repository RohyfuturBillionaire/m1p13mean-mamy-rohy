const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {}).then(() => console.log("MongoDB connecté")).catch(err => console.log(err));

// Legacy routes
app.use('/articles', require('./routes/articleRoutes'));

// API routes
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/contract-types', require('./routes/contractTypeRoutes'));
app.use('/api/boutiques', require('./routes/boutiqueRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
