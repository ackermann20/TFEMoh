const request = require('supertest');
const app = require('../app');
const { sequelize, Utilisateur } = require('../models');

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Routes utilisateurs', () => {
  afterEach(async () => {
    await Utilisateur.destroy({ where: {} });
  });

  it('POST /api/utilisateurs → devrait créer un utilisateur', async () => {
    const res = await request(app)
      .post('/api/utilisateurs')
      .send({
        prenom: 'Test',
        nom: 'User',
        email: 'testuser@example.com',
        motDePasse: 'password123',
        telephone: '0123456789'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('testuser@example.com');
  });
});
