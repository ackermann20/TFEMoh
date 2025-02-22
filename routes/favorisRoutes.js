const express = require('express');
const router = express.Router();
const { Favoris, Utilisateur, Produit } = require('../models');

// Récupérer tous les favoris
router.get('/', async (req, res) => {
  try {
    const favoris = await Favoris.findAll({
      include: [{ model: Utilisateur, as: 'utilisateur' }, { model: Produit, as: 'produit' }]
    });
    res.status(200).json(favoris);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des favoris.', error });
  }
});

// Récupérer un favori par ID
router.get('/:id', async (req, res) => {
  try {
    const favori = await Favoris.findByPk(req.params.id, {
      include: [{ model: Utilisateur, as: 'utilisateur' }, { model: Produit, as: 'produit' }]
    });

    if (!favori) {
      return res.status(404).json({ message: 'Favori non trouvé.' });
    }

    res.status(200).json(favori);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du favori.', error });
  }
});

// Ajouter un produit aux favoris
router.post('/', async (req, res) => {
  try {
    const { utilisateurId, produitId } = req.body;

    const newFavori = await Favoris.create({ utilisateurId, produitId });
    res.status(201).json(newFavori);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout du favori.', error });
  }
});

// Supprimer un favori
router.delete('/:id', async (req, res) => {
  try {
    const favori = await Favoris.findByPk(req.params.id);
    if (!favori) {
      return res.status(404).json({ message: 'Favori non trouvé.' });
    }

    await favori.destroy();
    res.status(200).json({ message: 'Favori supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du favori.', error });
  }
});

module.exports = router;
