const { Commande, Utilisateur } = require('./models');

(async () => {
  try {
    // Synchroniser la base de données
    await Commande.sequelize.sync();

    // Créer un utilisateur fictif
    const utilisateur = await Utilisateur.create({
      nom: 'Doe',
      prenom: 'John',
      email: 'john.doe@example.com',
      telephone: '1234567890',
      motDePasse: 'password123',
      role: 'client',
    });

    // Créer une commande fictive
    const commande = await Commande.create({
      utilisateurId: utilisateur.id,
      dateRetrait: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
      trancheHoraireRetrait: '08:00-09:00',
      statut: 'en attente',
      description: 'Commande de test',
    });

    console.log('Commande ajoutée avec succès :', commande.toJSON());
  } catch (error) {
    console.error('Erreur lors du test des commandes :', error);
  }
})();
