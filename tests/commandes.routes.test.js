const request = require('supertest');
const app = require('../app');
const { sequelize, Commande, Utilisateur, Produit, LigneCommande } = require('../models');

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Routes commandes', () => {
  afterEach(async () => {
    await LigneCommande.destroy({ where: {} });
    await Commande.destroy({ where: {} });
    await Produit.destroy({ where: {} });
    await Utilisateur.destroy({ where: {} });
  });

  it('POST /api/commandes → devrait créer une commande', async () => {
    // Créer un utilisateur via l'API
    const userRes = await request(app)
      .post('/api/utilisateurs')
      .send({
        prenom: 'Test',
        nom: 'User',
        email: 'testuser@example.com',
        motDePasse: 'password123',
        telephone: '0123456789'
      });

    const token = userRes.body.token;
    expect(token).toBeDefined();

    // Créer un produit
    const produit = await Produit.create({
      nom: 'Sandwich',
      prix: 5.0,
      description: 'Sandwich jambon-beurre',
      disponible: true,
      image: 'sandwich.jpg'
    });

    const commandePayload = {
      produits: [
        {
          produitId: produit.id,
          quantite: 2,
          prix: produit.prix,
          isSandwich: false
        }
      ],
      dateRetrait: new Date(),
      trancheHoraireRetrait: 'Matin'
    };

    const res = await request(app)
      .post('/api/commandes')
      .set('Authorization', `Bearer ${token}`)
      .send(commandePayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toContain('Commande créée');
  });

  it('GET /api/commandes → devrait récupérer toutes les commandes', async () => {
    const utilisateur = await Utilisateur.create({
      nom: 'Test',
      prenom: 'User',
      email: 'testuser@example.com',
      telephone: '0123456789',
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
      description: 'Commande test'
    });

    const res = await request(app).get('/api/commandes');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].id).toBe(commande.id);
  });
});
