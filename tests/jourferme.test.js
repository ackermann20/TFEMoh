const { sequelize, JourFerme } = require('../models');

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});

describe('JourFerme Model', () => {
  afterEach(async () => {
    await JourFerme.destroy({ where: {} });
  });

  it('devrait créer un jour fermé', async () => {
    const jour = await JourFerme.create({
      date: '2025-12-25'
    });

    expect(jour).toBeDefined();
    expect(jour.date).toBe('2025-12-25');
  });
});
