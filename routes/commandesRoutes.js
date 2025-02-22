const express = require('express');
const router = express.Router();
const { Commande, Utilisateur } = require('../models');

// Récupérer toutes les commandes
router.get('/', async (req, res) => {
  try {
    const commandes = await Commande.findAll();
    res.status(200).json(commandes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes', error });
  }
});

// Récupérer une commande par ID
router.get('/:id', async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id, { include: [Utilisateur] });
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.status(200).json(commande);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la commande', error });
  }
});

// Créer une nouvelle commande
router.post('/', async (req, res) => {
  try {
    const { utilisateurId, dateCommande, dateRetrait, trancheHoraireRetrait, statut, description } = req.body;
    const nouvelleCommande = await Commande.create({
      utilisateurId,
      dateCommande,
      dateRetrait,
      trancheHoraireRetrait,
      statut,
      description,
    });
    res.status(201).json(nouvelleCommande);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la commande', error });
  }
});

// Mettre à jour une commande
router.put('/:id', async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    const { dateCommande, dateRetrait, trancheHoraireRetrait, statut, description } = req.body;
    await commande.update({ dateCommande, dateRetrait, trancheHoraireRetrait, statut, description });
    res.status(200).json(commande);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la commande', error });
  }
});

// Supprimer une commande
router.delete('/:id', async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    await commande.destroy();
    res.status(200).json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la commande', error });
  }
});

module.exports = router;
