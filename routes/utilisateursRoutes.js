const express = require('express');
const router = express.Router();
const { Utilisateur } = require('../models');

// Ajouter un utilisateur
router.post('/', async (req, res) => {
    try {
        const utilisateur = await Utilisateur.create(req.body);
        res.status(201).json(utilisateur);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Récupérer tous les utilisateurs
router.get('/', async (req, res) => {
    try {
        const utilisateurs = await Utilisateur.findAll();
        res.status(200).json(utilisateurs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Récupérer un utilisateur spécifique
router.get('/:id', async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findByPk(req.params.id);
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.status(200).json(utilisateur);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mettre à jour un utilisateur
router.put('/:id', async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findByPk(req.params.id);
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        await utilisateur.update(req.body);
        res.status(200).json(utilisateur);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Supprimer un utilisateur
router.delete('/:id', async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findByPk(req.params.id);
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        await utilisateur.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
