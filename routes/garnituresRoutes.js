const express = require('express');
const router = express.Router();
const { Garniture } = require('../models');


// ===============================
// 🍖 Récupérer toutes les garnitures
// ===============================
router.get('/', async (req, res) => {
  try {
    const garnitures = await Garniture.findAll();
    res.status(200).json(garnitures);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des garnitures',
      error,
    });
  }
});


// ===============================
// 🔍 Récupérer une garniture par ID
// ===============================
router.get('/:id', async (req, res) => {
  try {
    const garniture = await Garniture.findByPk(req.params.id);
    if (!garniture) {
      return res.status(404).json({ message: 'Garniture non trouvée' });
    }
    res.status(200).json(garniture);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération de la garniture',
      error,
    });
  }
});


// ===============================
// ➕ Créer une nouvelle garniture
// ===============================
router.post('/', async (req, res) => {
  try {
    const { nom, prix, disponible } = req.body;
    const nouvelleGarniture = await Garniture.create({ nom, prix, disponible });
    res.status(201).json(nouvelleGarniture);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la création de la garniture',
      error,
    });
  }
});


// ===============================
// ✏️ Modifier une garniture existante
// ===============================
router.put('/:id', async (req, res) => {
  try {
    const garniture = await Garniture.findByPk(req.params.id);
    if (!garniture) {
      return res.status(404).json({ message: 'Garniture non trouvée' });
    }
    const { nom, prix, disponible } = req.body;
    await garniture.update({ nom, prix, disponible });
    res.status(200).json(garniture);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la mise à jour de la garniture',
      error,
    });
  }
});


// ===============================
// 🗑️ Supprimer une garniture
// ===============================
router.delete('/:id', async (req, res) => {
  try {
    const garniture = await Garniture.findByPk(req.params.id);
    if (!garniture) {
      return res.status(404).json({ message: 'Garniture non trouvée' });
    }
    await garniture.destroy();
    res.status(200).json({ message: 'Garniture supprimée avec succès' });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la suppression de la garniture',
      error,
    });
  }
});

module.exports = router;
