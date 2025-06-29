const { sequelize, Utilisateur } = require('../models');

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Utilisateur Model', () => {
  afterEach(async () => {
    await Utilisateur.destroy({ where: {} });
  });

  it('devrait créer un utilisateur', async () => {
    const user = await Utilisateur.create({
      nom: 'Test',
      prenom: 'User',
      email: 'testuser@example.com',
      telephone: '0123456789',
      motDePasse: 'password123',
      role: 'client',
      solde: 0,
    });

    expect(user).toBeDefined();
    expect(user.id).toBeGreaterThan(0);
    expect(user.email).toBe('testuser@example.com');
  });
});
