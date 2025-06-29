const { sequelize, contactMessage } = require('../models');

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});

describe('contactMessage Model', () => {
  afterEach(async () => {
    await contactMessage.destroy({ where: {} });
  });

  it('devrait créer un message de contact', async () => {
    const message = await contactMessage.create({
      nom: 'John',
      prenom: 'Doe',
      email: 'john.doe@example.com',
      telephone: '0123456789',
      objet: 'Demande info',
      message: 'Bonjour, je souhaite plus d’informations.',
      utilisateurId: null
    });

    expect(message).toBeDefined();
    expect(message.nom).toBe('John');
  });
});
