const express = require('express');
const router = express.Router();
const { Boisson, Produit } = require('../models');

// Route pour récupérer toutes les boissons
router.get('/', async (req, res) => {
  try {
    const boissons = await Boisson.findAll({
      include: {
        model: Produit,
        as: 'produit',
      },
    });
    res.status(200).json(boissons);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des boissons.', error });
  }
});

// Route pour récupérer une boisson par ID
router.get('/:id', async (req, res) => {
  try {
    const boisson = await Boisson.findByPk(req.params.id, {
      include: {
        model: Produit,
        as: 'produit',
      },
    });
    if (!boisson) {
      return res.status(404).json({ message: 'Boisson non trouvée.' });
    }
    res.status(200).json(boisson);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la boisson.', error });
  }
});

// Route pour créer une boisson
router.post('/', async (req, res) => {
  try {
    const { produitId, volume, type } = req.body;

    // Vérifier si le produit existe
    const produit = await Produit.findByPk(produitId);
    if (!produit) {
      return res.status(404).json({ message: 'Produit associé non trouvé.' });
    }

    const newBoisson = await Boisson.create({ produitId, volume, type });
    res.status(201).json(newBoisson);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la boisson.', error });
  }
});

// Route pour mettre à jour une boisson
router.put('/:id', async (req, res) => {
  try {
    const { produitId, volume, type } = req.body;

    const boisson = await Boisson.findByPk(req.params.id);
    if (!boisson) {
      return res.status(404).json({ message: 'Boisson non trouvée.' });
    }

    const produit = await Produit.findByPk(produitId);
    if (!produit) {
      return res.status(404).json({ message: 'Produit associé non trouvé.' });
    }

    await boisson.update({ produitId, volume, type });
    res.status(200).json(boisson);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la boisson.', error });
  }
});

// Route pour supprimer une boisson
router.delete('/:id', async (req, res) => {
  try {
    const boisson = await Boisson.findByPk(req.params.id);
    if (!boisson) {
      return res.status(404).json({ message: 'Boisson non trouvée.' });
    }

    await boisson.destroy();
    res.status(200).json({ message: 'Boisson supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la boisson.', error });
  }
});

module.exports = router;
