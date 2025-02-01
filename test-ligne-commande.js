const { sequelize, LigneCommande, Produit, Commande, Utilisateur } = require('./models');

async function testLigneCommande() {
  try {
    await sequelize.sync({ force: true });

    // Crée un utilisateur
    const utilisateur = await Utilisateur.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      telephone: '123456789',
      motDePasse: 'password123',
      role: 'client',
    });

    // Crée une commande
    const commande = await Commande.create({
      utilisateurId: utilisateur.id,
      dateCommande: new Date(),
      dateRetrait: new Date(),
      trancheHoraireRetrait: 'Matin',
      statut: 'en attente',
      description: 'Commande test',
    });

    // Crée un produit
    const produit = await Produit.create({
      nom: 'Croissant',
      prix: 1.5,
      stock: 50,
      description: 'Croissant au beurre',
      image: 'croissant.jpg',
    });

    // Ajoute une ligne de commande
    const ligneCommande = await LigneCommande.create({
      commandeId: commande.id,
      produitId: produit.id,
      quantite: 2,
    });

    console.log('Ligne de commande ajoutée :', ligneCommande.toJSON());
  } catch (error) {
    console.error('Erreur lors du test de ligne commande :', error);
  } finally {
    await sequelize.close();
  }
}

testLigneCommande();
