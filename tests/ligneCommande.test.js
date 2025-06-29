const { sequelize, LigneCommande, Produit, Commande, Utilisateur } = require('../models');

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});

describe('LigneCommande Model', () => {
  afterEach(async () => {
    await LigneCommande.destroy({ where: {} });
    await Commande.destroy({ where: {} });
    await Produit.destroy({ where: {} });
    await Utilisateur.destroy({ where: {} });
  });

  it('devrait créer une ligne de commande', async () => {
    const utilisateur = await Utilisateur.create({
      nom: 'azerty',
      prenom: 'azerty',
      email: 'azerty@azerty.com',
      telephone: '0478965441',
      motDePasse: 'azerty',
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

    const produit = await Produit.create({
      nom: 'Croissant',
      prix: 1.5,
      description: 'Croissant au beurre',
      disponible: true,
      image: 'croissant.jpg',
    });

    const ligneCommande = await LigneCommande.create({
      commandeId: commande.id,
      produitId: produit.id,
      quantite: 2,
      prixUnitaire: produit.prix,
    });

    expect(ligneCommande).toBeDefined();
    expect(ligneCommande.quantite).toBe(2);
    expect(ligneCommande.produitId).toBe(produit.id);
  });
});
