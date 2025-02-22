const { sequelize, Utilisateur, Favoris, Produit } = require('./models');

async function testUtilisateur() {
  try {
    await sequelize.sync({ force: true }); // Réinitialise la base de données

    // Crée un utilisateur
    const utilisateur = await Utilisateur.create({
      nom: 'azerty',
      prenom: 'azerty',
      email: 'azerty@azerty.com',
      telephone: '0478965441',
      motDePasse: 'azerty',
      role: 'client',
    });

    console.log('Utilisateur ajouté :', utilisateur.toJSON());

    // Crée un produit
    const produit = await Produit.create({
      nom: 'Baguette',
      prix: 1.2,
      stock: 100,
      description: 'Baguette fraîche et croustillante',
      image: 'baguette.jpg',
    });

    console.log('Produit ajouté :', produit.toJSON());

    // Ajoute un favori
    const favori = await Favoris.create({
      utilisateurId: utilisateur.id,
      produitId: produit.id,
    });

    console.log('Favori ajouté :', favori.toJSON());
  } catch (error) {
    console.error('Erreur lors du test des associations utilisateur :', error);
  } finally {
    await sequelize.close();
  }
}

testUtilisateur();
