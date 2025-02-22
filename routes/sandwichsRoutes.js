const express = require('express');
const router = express.Router();
const { Sandwich, Produit } = require('../models');

// Route pour récupérer tous les sandwichs
router.get('/', async (req, res) => {
  try {
    const sandwichs = await Sandwich.findAll({
      include: {
        model: Produit,
        as: 'produit', // Association avec Produit
      },
    });
    res.status(200).json(sandwichs);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des sandwichs.', error });
  }
});

// Route pour récupérer un sandwich par ID
router.get('/:id', async (req, res) => {
  try {
    const sandwich = await Sandwich.findByPk(req.params.id, {
      include: {
        model: Produit,
        as: 'produit',
      },
    });
    if (!sandwich) {
      return res.status(404).json({ message: 'Sandwich non trouvé.' });
    }
    res.status(200).json(sandwich);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du sandwich.', error });
  }
});

// Route pour créer un sandwich
router.post('/', async (req, res) => {
  try {
    const { produitId, prixBase, description, image } = req.body;

    // Vérifier que le produit existe
    const produit = await Produit.findByPk(produitId);
    if (!produit) {
      return res.status(404).json({ message: 'Produit associé non trouvé.' });
    }

    const newSandwich = await Sandwich.create({ produitId, prixBase, description, image });
    res.status(201).json(newSandwich);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du sandwich.', error });
  }
});

// Route pour mettre à jour un sandwich
router.put('/:id', async (req, res) => {
  try {
    const { produitId, prixBase, description, image } = req.body;

    const sandwich = await Sandwich.findByPk(req.params.id);
    if (!sandwich) {
      return res.status(404).json({ message: 'Sandwich non trouvé.' });
    }

    const produit = await Produit.findByPk(produitId);
    if (!produit) {
      return res.status(404).json({ message: 'Produit associé non trouvé.' });
    }

    await sandwich.update({ produitId, prixBase, description, image });
    res.status(200).json(sandwich);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du sandwich.', error });
  }
});

// Route pour supprimer un sandwich
router.delete('/:id', async (req, res) => {
  try {
    const sandwich = await Sandwich.findByPk(req.params.id);
    if (!sandwich) {
      return res.status(404).json({ message: 'Sandwich non trouvé.' });
    }

    await sandwich.destroy();
    res.status(200).json({ message: 'Sandwich supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du sandwich.', error });
  }
});

module.exports = router;
