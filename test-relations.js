const { Utilisateur, Commande, LigneCommande, Produit, Garniture, Plainte, Boisson, Sandwich } = require('./models');
const sequelize = require('./models').sequelize;

async function testRelations() {
  try {
    console.log('>> Synchronisation de la base de données...');
    await sequelize.sync({ force: true });

    // Création d'un utilisateur
    const utilisateur = await Utilisateur.create({
        nom: 'azerty',
        prenom: 'azerty',
        email: 'azerty@azerty.com',
        telephone: '0478965441',
        motDePasse: 'azerty',
        role: 'client',
    });

    console.log('Utilisateur ajouté :', utilisateur.toJSON());

    // Création d'un produit
    const produit = await Produit.create({
      nom: 'Croissant',
      prix: 1.5,
      stock: 100,
      description: 'Un croissant au beurre délicieux',
      image: 'croissant.jpg',
    });

    console.log('Produit ajouté :', produit.toJSON());

    // Création d'une commande
    const commande = await Commande.create({
      utilisateurId: utilisateur.id,
      dateCommande: new Date(),
      dateRetrait: new Date(),
      trancheHoraireRetrait: 'Matin',
      statut: 'en attente',
      description: 'Première commande test',
    });

    console.log('Commande ajoutée :', commande.toJSON());

    // Création d'une ligne de commande
    const ligneCommande = await LigneCommande.create({
      commandeId: commande.id,
      produitId: produit.id,
      quantite: 2,
    });

    console.log('Ligne de commande ajoutée :', ligneCommande.toJSON());

    // Création d'une garniture
    const garniture = await Garniture.create({
      nom: 'Fromage',
      prix: 0.5,
      stock: 50,
    });

    console.log('Garniture ajoutée :', garniture.toJSON());

    // Ajout d'une plainte
    const plainte = await Plainte.create({
      utilisateurId: utilisateur.id,
      commandeId: commande.id,
      produitId: produit.id,
      message: 'croissant trop cuit',
    });

    console.log('Plainte ajoutée :', plainte.toJSON());

    console.log('>> Toutes les relations ont été testées avec succès.');
  } catch (error) {
    console.error('Erreur lors du test des relations :', error);
  }
}

testRelations();
