const {
    sequelize,
    Utilisateur,
    Produit,
    Garniture,
    Commande,
    LigneCommande,
    LigneCommandeGarniture,
    Favoris,
  } = require('./models');
  
  async function testGlobal() {
    try {
      await sequelize.sync({ force: true });
  
      // Crée un utilisateur
      const utilisateur = await Utilisateur.create({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        telephone: '123456789',
        motDePasse: 'password123',
        role: 'client',
      });
  
      console.log('Utilisateur ajouté :', utilisateur.toJSON());
  
      // Crée un produit
      const produit = await Produit.create({
        nom: 'Baguette',
        prix: 1.2,
        stock: 50,
        description: 'Délicieuse baguette artisanale',
        image: 'baguette.jpg',
      });
  
      console.log('Produit ajouté :', produit.toJSON());
  
      // Crée une garniture
      const garniture = await Garniture.create({
        nom: 'Salade',
        prix: 0.5,
        stock: 100,
      });
  
      console.log('Garniture ajoutée :', garniture.toJSON());
  
      // Ajoute le produit aux favoris de l'utilisateur
      const favoris = await Favoris.create({
        utilisateurId: utilisateur.id,
        produitId: produit.id,
      });
  
      console.log('Favoris ajouté :', favoris.toJSON());
  
      // Crée une commande
      const commande = await Commande.create({
        utilisateurId: utilisateur.id,
        dateCommande: new Date(),
        dateRetrait: new Date(),
        trancheHoraireRetrait: 'Matin',
        statut: 'en attente',
        description: 'Commande de test',
      });
  
      console.log('Commande ajoutée :', commande.toJSON());
  
      // Crée une ligne de commande
      const ligneCommande = await LigneCommande.create({
        commandeId: commande.id,
        produitId: produit.id,
        quantite: 2,
      });
  
      console.log('LigneCommande ajoutée :', ligneCommande.toJSON());
  
      // Ajoute une garniture à la ligne de commande
      const ligneCommandeGarniture = await LigneCommandeGarniture.create({
        ligneCommandeId: ligneCommande.id,
        garnitureId: garniture.id,
      });
  
      console.log('LigneCommandeGarniture ajoutée :', ligneCommandeGarniture.toJSON());
  
      console.log('Test global terminé avec succès !');
    } catch (error) {
      console.error('Erreur lors du test global :', error);
    } finally {
      await sequelize.close();
    }
  }
  
  testGlobal();
  