const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');

const utilisateursRoutes = require('./routes/utilisateursRoutes');
const produitRoutes = require('./routes/produitRoutes');
const commandesRoutes = require('./routes/commandesRoutes');
const ligneCommandesRoutes = require('./routes/ligneCommandesRoutes');
const ligneCommandeGarnitureRoutes = require('./routes/ligneCommandeGarnituresRoutes');
const garnituresRoutes = require('./routes/garnituresRoutes');
const sandwichRoutes = require('./routes/sandwichsRoutes');
const boissonRoutes = require('./routes/boissonsRoutes');
const favorisRoutes = require('./routes/favorisRoutes');
const plaintesRoutes = require('./routes/plaintesRoutes');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Test de la connexion à la base de données
sequelize.authenticate()
    .then(() => console.log('Connexion à la base de données réussie.'))
    .catch(err => console.error('Impossible de se connecter à la base de données :', err));

// Routes
app.use('/api/utilisateurs', utilisateursRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/ligne-commandes', ligneCommandesRoutes);
app.use('/api/ligne-commande-garnitures', ligneCommandeGarnitureRoutes);
app.use('/api/garnitures', garnituresRoutes);
app.use('/api/sandwichs', sandwichRoutes);
app.use('/api/boissons', boissonRoutes);
app.use('/api/favoris', favorisRoutes);
app.use('/api/plaintes', plaintesRoutes);


// Route principale
app.get('/', (req, res) => {
    res.send('Bienvenue dans l\'API de la boulangerie.');
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Le serveur tourne sur http://localhost:${PORT}`);
});

module.exports = app;
