const { sequelize, Commande, Utilisateur } = require('../models');

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Commande Model', () => {
  afterEach(async () => {
    await Commande.destroy({ where: {} });
    await Utilisateur.destroy({ where: {} });
  });

  it('devrait créer une commande liée à un utilisateur', async () => {
    const utilisateur = await Utilisateur.create({
      nom: 'Hasard',
      prenom: 'Eden',
      email: 'EH10@pro.com',
      telephone: '0498989898',
      motDePasse: 'password123',
      role: 'client',
      solde: 0,
    });

    const commande = await Commande.create({
      utilisateurId: utilisateur.id,
      dateCommande: new Date(),
      dateRetrait: new Date(),
      trancheHoraireRetrait: 'Matin',
      statut: 'en attente',
      description: 'Commande test',
    });

    expect(commande).toBeDefined();
    expect(commande.utilisateurId).toBe(utilisateur.id);
    expect(commande.statut).toBe('en attente');
  });
});
