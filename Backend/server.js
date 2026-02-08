const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());
// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {}).then(() => console.log("MongoDB connecté")).catch(err => console.log(err));

app.use('/articles', require('./routes/articleRoutes'));
app.use('/sitecrm', require('./routes/siteCrmRoutes'));
app.use('/sitecontenu', require('./routes/siteContenuRoutes'));
app.use('/imgslider', require('./routes/imgSliderRoutes'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});