const { sequelize, Produit } = require('../models');

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Produit Model', () => {
  afterEach(async () => {
    await Produit.destroy({ where: {} });
  });

  it('devrait créer un produit avec succès', async () => {
    const produit = await Produit.create({
      nom: 'Baguette',
      prix: 1.2,
      description: 'Délicieuse baguette artisanale',
      disponible: true,
      image: 'baguette.jpg'
    });

    expect(produit).toBeDefined();
    expect(produit.id).toBeGreaterThan(0);
    expect(produit.nom).toBe('Baguette');
    expect(produit.prix).toBe(1.2);
    expect(produit.description).toBe('Délicieuse baguette artisanale');
    expect(produit.disponible).toBe(true);
    expect(produit.image).toBe('baguette.jpg');
  });
});
