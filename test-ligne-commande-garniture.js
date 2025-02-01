const { sequelize, LigneCommande, Garniture, LigneCommandeGarniture, Produit, Commande, Utilisateur } = require('./models');

async function testLigneCommandeGarniture() {
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
      description: 'Commande avec garniture',
    });

    // Crée un produit
    const produit = await Produit.create({
      nom: 'Sandwich',
      prix: 5.0,
      stock: 20,
      description: 'Sandwich jambon-beurre',
      image: 'sandwich.jpg',
    });

    // Crée une ligne de commande
    const ligneCommande = await LigneCommande.create({
      commandeId: commande.id,
      produitId: produit.id,
      quantite: 1,
    });

    // Crée une garniture
    const garniture = await Garniture.create({
      nom: 'Salade',
      prix: 0.5,
      stock: 100,
    });

    // Associe la garniture à la ligne de commande
    const ligneCommandeGarniture = await LigneCommandeGarniture.create({
      ligneCommandeId: ligneCommande.id,
      garnitureId: garniture.id,
    });

    console.log('LigneCommandeGarniture ajoutée :', ligneCommandeGarniture.toJSON());
  } catch (error) {
    console.error('Erreur lors du test de LigneCommandeGarniture :', error);
  } finally {
    await sequelize.close();
  }
}

testLigneCommandeGarniture();
