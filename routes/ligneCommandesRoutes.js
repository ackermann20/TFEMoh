const express = require('express');
const router = express.Router();
const { LigneCommande, Produit, Commande } = require('../models');


// ===============================
// 📋 Récupérer toutes les lignes de commande
// ===============================
router.get('/', async (req, res) => {
  try {
    const lignesCommandes = await LigneCommande.findAll();
    res.status(200).json(lignesCommandes);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des lignes de commande',
      error,
    });
  }
});


// ===============================
// 🔍 Récupérer une ligne de commande par ID
// ===============================
router.get('/:id', async (req, res) => {
  try {
    const ligneCommande = await LigneCommande.findByPk(req.params.id, {
      include: [Produit, Commande],
    });

    if (!ligneCommande) {
      return res.status(404).json({ message: 'Ligne de commande non trouvée' });
    }

    res.status(200).json(ligneCommande);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération de la ligne de commande',
      error,
    });
  }
});


// ===============================
// ➕ Créer une nouvelle ligne de commande
// ===============================
router.post('/', async (req, res) => {
  try {
    const { commandeId, produitId, quantite } = req.body;

    const nouvelleLigneCommande = await LigneCommande.create({
      commandeId,
      produitId,
      quantite,
    });

    res.status(201).json(nouvelleLigneCommande);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la création de la ligne de commande',
      error,
    });
  }
});


// ===============================
// ✏️ Modifier une ligne de commande
// ===============================
router.put('/:id', async (req, res) => {
  try {
    const ligneCommande = await LigneCommande.findByPk(req.params.id);
    if (!ligneCommande) {
      return res.status(404).json({ message: 'Ligne de commande non trouvée' });
    }

    const { quantite } = req.body;
    await ligneCommande.update({ quantite });

    res.status(200).json(ligneCommande);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la mise à jour de la ligne de commande',
      error,
    });
  }
});


// ===============================
// ❌ Supprimer une ligne de commande
// ===============================
router.delete('/:id', async (req, res) => {
  try {
    const ligneCommande = await LigneCommande.findByPk(req.params.id);
    if (!ligneCommande) {
      return res.status(404).json({ message: 'Ligne de commande non trouvée' });
    }

    await ligneCommande.destroy();
    res.status(200).json({ message: 'Ligne de commande supprimée avec succès' });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la suppression de la ligne de commande',
      error,
    });
  }
});

module.exports = router;
