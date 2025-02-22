const express = require('express');
const router = express.Router();
const { LigneCommandeGarniture, LigneCommande, Garniture } = require('../models');

// Récupérer toutes les lignes de commande garniture
router.get('/', async (req, res) => {
  try {
    const lignesCommandeGarniture = await LigneCommandeGarniture.findAll({
      include: [{ model: LigneCommande, as: 'ligneCommande' }, { model: Garniture, as: 'garniture' }]
    });
    res.status(200).json(lignesCommandeGarniture);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des lignes de commande garniture.', error });
  }
});

// Récupérer une ligne de commande garniture par ID
router.get('/:id', async (req, res) => {
  try {
    const ligneCommandeGarniture = await LigneCommandeGarniture.findByPk(req.params.id, {
      include: [{ model: LigneCommande, as: 'ligneCommande' }, { model: Garniture, as: 'garniture' }]
    });

    if (!ligneCommandeGarniture) {
      return res.status(404).json({ message: 'Ligne de commande garniture non trouvée.' });
    }

    res.status(200).json(ligneCommandeGarniture);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la ligne de commande garniture.', error });
  }
});

// Ajouter une ligne de commande garniture
router.post('/', async (req, res) => {
  try {
    const { ligneCommandeId, garnitureId } = req.body;

    const newLigneCommandeGarniture = await LigneCommandeGarniture.create({ ligneCommandeId, garnitureId });
    res.status(201).json(newLigneCommandeGarniture);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la ligne de commande garniture.', error });
  }
});

// Supprimer une ligne de commande garniture
router.delete('/:id', async (req, res) => {
  try {
    const ligneCommandeGarniture = await LigneCommandeGarniture.findByPk(req.params.id);
    if (!ligneCommandeGarniture) {
      return res.status(404).json({ message: 'Ligne de commande garniture non trouvée.' });
    }

    await ligneCommandeGarniture.destroy();
    res.status(200).json({ message: 'Ligne de commande garniture supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la ligne de commande garniture.', error });
  }
});

module.exports = router;
