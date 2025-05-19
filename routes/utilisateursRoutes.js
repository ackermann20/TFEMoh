const express = require('express');
const router = express.Router();
const { Commande,Utilisateur , LigneCommande, Produit, Garniture, LigneCommandeGarniture } = require('../models');
const models = require('../models');
const bcrypt = require('bcrypt');
const verifyToken = require('../middleware/verifyToken');

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
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id, {
      attributes: ['id', 'nom', 'prenom', 'email', 'telephone', 'role', 'solde']
    });

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(utilisateur);
  } catch (error) {
    console.error('Erreur lors de la récupération de l’utilisateur :', error);
    res.status(500).json({ message: 'Erreur serveur' });
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
// Ajoutez ce code à votre fichier utilisateursRoutes.js

// Récupérer les commandes d'un utilisateur spécifique
router.get('/:id/commandes', verifyToken, async (req, res) => {
  try {
    const utilisateurId = req.params.id;

    const commandes = await Commande.findAll({
  where: { utilisateurId: req.params.id },
  iinclude: [
  {
    model: LigneCommande,
    as: 'ligneCommandes',
    include: [
      {
        model: Produit,
        as: 'produit'
      },
      {
        model: LigneCommandeGarniture,
        as: 'ligneGarnitures',
        include: [
          {
            model: Garniture,
            as: 'garniture'
          }
        ]
      }
    ]
  }
]

});


    res.json(commandes);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour changer le mot de passe
router.put('/change-password', verifyToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const utilisateurId = req.utilisateur.id; // Tu récupères l'id du token
  
    try {
      const utilisateur = await Utilisateur.findByPk(utilisateurId);
  
      if (!utilisateur) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
  
      const isMatch = await bcrypt.compare(oldPassword, utilisateur.motDePasse);
  
      if (!isMatch) {
        return res.status(400).json({ message: 'Ancien mot de passe incorrect' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      utilisateur.motDePasse = hashedPassword;
      await utilisateur.save();
  
      res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe :', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
module.exports = router;
