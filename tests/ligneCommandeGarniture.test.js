const {
  sequelize,
  LigneCommande,
  Garniture,
  LigneCommandeGarniture,
  Produit,
  Commande,
  Utilisateur
} = require('../models');

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});

describe('LigneCommandeGarniture Model', () => {
  afterEach(async () => {
    await LigneCommandeGarniture.destroy({ where: {} });
    await LigneCommande.destroy({ where: {} });
    await Garniture.destroy({ where: {} });
    await Produit.destroy({ where: {} });
    await Commande.destroy({ where: {} });
    await Utilisateur.destroy({ where: {} });
  });

  it('devrait créer une LigneCommandeGarniture liée', async () => {
    const utilisateur = await Utilisateur.create({
      nom: 'Jordan',
      prenom: 'Michael',
      email: 'MJ@nba.com',
      telephone: '555298298',
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
      description: 'Commande avec garniture',
    });

    const produit = await Produit.create({
      nom: 'Sandwich',
      prix: 5.0,
      description: 'Sandwich jambon-beurre',
      disponible: true,
      image: 'sandwich.jpg',
    });

    const ligneCommande = await LigneCommande.create({
      commandeId: commande.id,
      produitId: produit.id,
      quantite: 1,
      prixUnitaire: produit.prix,
    });

    const garniture = await Garniture.create({
      nom: 'Salade',
      prix: 0.5,
      disponible: true,
      image: 'salade.jpg'
    });

    const ligneCommandeGarniture = await LigneCommandeGarniture.create({
      ligneCommandeId: ligneCommande.id,
      garnitureId: garniture.id,
      typePain: 'blanc',
    });

    expect(ligneCommandeGarniture).toBeDefined();
    expect(ligneCommandeGarniture.typePain).toBe('blanc');
  });
});
