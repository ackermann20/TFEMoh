const request = require('supertest');
const app = require('../app');
const { sequelize, Produit } = require('../models');

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Routes produits', () => {
  afterEach(async () => {
    await Produit.destroy({ where: {} });
  });

  it('POST /api/produits → devrait créer un produit', async () => {
    const res = await request(app)
      .post('/api/produits')
      .send({
        nom: 'Baguette',
        prix: 1.5,
        description: 'Baguette croustillante',
        disponible: true,
        image: 'baguette.jpg'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.nom).toBe('Baguette');
    expect(res.body.prix).toBe(1.5);
  });

  it('GET /api/produits → devrait renvoyer tous les produits', async () => {
    await Produit.create({
      nom: 'Croissant',
      prix: 1.2,
      description: 'Croissant au beurre',
      disponible: true,
      image: 'croissant.jpg'
    });

    const res = await request(app).get('/api/produits');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].nom).toBe('Croissant');
  });
});
