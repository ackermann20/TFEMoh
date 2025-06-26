const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');

const utilisateursRoutes = require('./routes/utilisateursRoutes');
const produitRoutes = require('./routes/produitRoutes');
const commandesRoutes = require('./routes/commandesRoutes');
const ligneCommandesRoutes = require('./routes/ligneCommandesRoutes');
const ligneCommandeGarnitureRoutes = require('./routes/ligneCommandeGarnituresRoutes');
const garnituresRoutes = require('./routes/garnituresRoutes');
const favorisRoutes = require('./routes/favorisRoutes');
const authRoutes = require('./routes/auth');
const boulangerRoutes = require('./routes/boulangerRoutes');
const joursFermesRoutes = require('./routes/joursFermesRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Test de la connexion à la base de données
sequelize.authenticate()
    .then(() => console.log('Connexion à la base de données réussie.'))
    .catch(err => console.error('Impossible de se connecter à la base de données :', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/utilisateurs', utilisateursRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/ligne-commandes', ligneCommandesRoutes);
app.use('/api/ligne-commande-garnitures', ligneCommandeGarnitureRoutes);
app.use('/api/garnitures', garnituresRoutes);
app.use('/api/favoris', favorisRoutes);
app.use('/api/boulanger', boulangerRoutes);
app.use('/api/horaires', joursFermesRoutes);
app.use('/api/contact', contactRoutes);

// Route principale
app.get('/', (req, res) => {
    res.send('Bienvenue dans l\'API de la boulangerie.');
});

// Lancer le serveur
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Le serveur tourne sur http://localhost:${PORT}`);
  });
}



module.exports = app;
