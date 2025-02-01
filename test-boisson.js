const { sequelize, Boisson, Produit } = require('./models');

async function testBoisson() {
  try {
    // Synchroniser la base de données
    await sequelize.sync({ force: true });
    console.log('Base de données synchronisée avec succès.');

    // Ajouter un produit de test
    const produit = await Produit.create({
      nom: 'Jus d\'orange',
      prix: 3.5,
      stock: 100,
      description: 'Boisson rafraîchissante',
      image: 'jus_orange.jpg',
    });

    console.log('Produit ajouté :', produit.toJSON());

    // Ajouter une boisson liée au produit
    const boisson = await Boisson.create({
      volume: 1.0,
      type: 'Fruit',
      produitId: produit.id,
    });

    console.log('Boisson ajoutée :', boisson.toJSON());
  } catch (error) {
    console.error('Erreur lors du test des boissons :', error);
  } finally {
    await sequelize.close();
  }
}

testBoisson();
