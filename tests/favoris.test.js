const { sequelize, Utilisateur, Produit, Favoris } = require('../models');

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Favoris Model', () => {
  afterEach(async () => {
    await Favoris.destroy({ where: {} });
    await Produit.destroy({ where: {} });
    await Utilisateur.destroy({ where: {} });
  });

  it('devrait créer un favori lié à un utilisateur et un produit', async () => {
    const utilisateur = await Utilisateur.create({
      nom: 'azerty',
      prenom: 'azerty',
      email: 'azerty@azerty.com',
      telephone: '0478965441',
      motDePasse: 'azerty',
      role: 'client',
      solde: 0,
    });

    const produit = await Produit.create({
      nom: 'Baguette',
      prix: 1.2,
      description: 'Baguette fraîche et croustillante',
      disponible: true,
      image: 'baguette.jpg',
    });

    const favori = await Favoris.create({
      utilisateurId: utilisateur.id,
      produitId: produit.id,
    });

    expect(favori).toBeDefined();
    expect(favori.utilisateurId).toBe(utilisateur.id);
  });
});
