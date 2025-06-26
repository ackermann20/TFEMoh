const express = require('express');
const router = express.Router();
const { Produit } = require('../models');


// ===============================
// 🧺 Récupérer tous les produits
// ===============================
router.get('/', async (req, res) => {
  try {
    const produits = await Produit.findAll();
    res.status(200).json(produits);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des produits.' });
  }
});


// ===============================
// 🔍 Récupérer un produit par ID
// ===============================
router.get('/:id', async (req, res) => {
  try {
    const produit = await Produit.findByPk(req.params.id);

    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }

    res.status(200).json(produit);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du produit.' });
  }
});


// ===============================
// ➕ Ajouter un nouveau produit
// ===============================
router.post('/', async (req, res) => {
  try {
    const { nom, prix, disponible, description, image } = req.body;
    const produit = await Produit.create({ nom, prix, disponible, description, image });
    res.status(201).json(produit);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout du produit.' });
  }
});


// ===============================
// ✏️ Modifier un produit
// ===============================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prix, disponible, description, image } = req.body;

    const produit = await Produit.findByPk(id);
    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }

    await produit.update({ nom, prix, disponible, description, image });
    res.status(200).json(produit);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit.' });
  }
});


// ===============================
// ❌ Supprimer un produit
// ===============================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const produit = await Produit.findByPk(id);

    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }

    await produit.destroy();
    res.status(200).json({ message: 'Produit supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression du produit.' });
  }
});

module.exports = router;
