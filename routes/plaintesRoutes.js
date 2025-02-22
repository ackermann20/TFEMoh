const express = require('express');
const router = express.Router();
const { Plainte, Utilisateur, Commande, Produit } = require('../models');

// Récupérer toutes les plaintes
router.get('/', async (req, res) => {
  try {
    const plaintes = await Plainte.findAll({
      include: [
        { model: Utilisateur, as: 'utilisateur' },
        { model: Commande, as: 'commande' },
        { model: Produit, as: 'produit' }
      ]
    });
    res.status(200).json(plaintes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des plaintes.', error });
  }
});

// Récupérer une plainte par ID
router.get('/:id', async (req, res) => {
  try {
    const plainte = await Plainte.findByPk(req.params.id, {
      include: [
        { model: Utilisateur, as: 'utilisateur' },
        { model: Commande, as: 'commande' },
        { model: Produit, as: 'produit' }
      ]
    });

    if (!plainte) {
      return res.status(404).json({ message: 'Plainte non trouvée.' });
    }

    res.status(200).json(plainte);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la plainte.', error });
  }
});

// Ajouter une plainte
router.post('/', async (req, res) => {
  try {
    const { utilisateurId, commandeId, produitId, message } = req.body;

    const newPlainte = await Plainte.create({ utilisateurId, commandeId, produitId, message });
    res.status(201).json(newPlainte);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la plainte.', error });
  }
});

// Supprimer une plainte
router.delete('/:id', async (req, res) => {
  try {
    const plainte = await Plainte.findByPk(req.params.id);
    if (!plainte) {
      return res.status(404).json({ message: 'Plainte non trouvée.' });
    }

    await plainte.destroy();
    res.status(200).json({ message: 'Plainte supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la plainte.', error });
  }
});

module.exports = router;
