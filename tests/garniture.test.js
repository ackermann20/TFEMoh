const { sequelize, Garniture } = require('../models');

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Garniture Model', () => {
  afterEach(async () => {
    await Garniture.destroy({ where: {} });
  });

  it('devrait créer une garniture', async () => {
    const garniture = await Garniture.create({
      nom: 'Salade',
      prix: 0.5,
      disponible: true,
      image: 'salade.jpg'
    });

    expect(garniture).toBeDefined();
    expect(garniture.nom).toBe('Salade');
    expect(garniture.prix).toBe(0.5);
  });
});
