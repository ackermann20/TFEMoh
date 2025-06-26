const express = require('express');
const router = express.Router();
const { JourFerme } = require('../models');


// ===============================
// 📅 Récupérer tous les jours fermés
// ===============================
router.get('/', async (req, res) => {
  try {
    const jours = await JourFerme.findAll({ order: [['date', 'ASC']] });
    res.json(jours);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du chargement des jours fermés' });
  }
});


// ===============================
// ➕ Ajouter un jour fermé
// ===============================
router.post('/', async (req, res) => {
  try {
    const { date } = req.body;
    const existing = await JourFerme.findOne({ where: { date } });

    if (existing) return res.status(400).json({ error: 'Jour déjà fermé' });

    const nouveauJour = await JourFerme.create({ date });
    res.status(201).json(nouveauJour);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout du jour fermé' });
  }
});


// ===============================
// ❌ Supprimer un jour fermé
// ===============================
router.delete('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    await JourFerme.destroy({ where: { date } });
    res.status(204).send(); // pas de contenu
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du jour' });
  }
});

module.exports = router;
