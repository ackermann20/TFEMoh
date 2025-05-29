const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

require('dotenv').config();
const secretKey = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
    const { email, motDePasse } = req.body;
    console.log(' Reçu :', email, motDePasse);
  
    try {
      const utilisateur = await Utilisateur.findOne({ where: { email } });
      if (!utilisateur) {
        console.log('Utilisateur introuvable');
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      const match = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
  
      if (!match) {
        console.log('Mot de passe incorrect');
        return res.status(401).json({ message: 'Mot de passe incorrect' });
      }
  
      const token = jwt.sign(
        { 
          id: utilisateur.id, 
          role: utilisateur.role,
          exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expire dans 1 heure
        },
        secretKey
      );
            
      
      res.json({ 
        token, 
        utilisateur: { 
          id: utilisateur.id, 
          email: utilisateur.email, 
          role: utilisateur.role, 
          prenom: utilisateur.prenom, 
          nom: utilisateur.nom, 
          telephone: utilisateur.telephone,
          solde: utilisateur.solde
        } 
      });
  
    } catch (error) {
      console.error('Erreur serveur', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Nouvelle route pour changer le mot de passe
router.post('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    // Vérifier que tous les champs nécessaires sont présents
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Trouver l'utilisateur par son ID
    const utilisateur = await Utilisateur.findByPk(userId);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier que le mot de passe actuel est correct
    const passwordMatch = await bcrypt.compare(currentPassword, utilisateur.motDePasse);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe
    await utilisateur.update({ motDePasse: hashedPassword });

    res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;