const express = require('express');
const router = express.Router();
const { Commande, Utilisateur, LigneCommande, Produit, Garniture, LigneCommandeGarniture } = require('../models');
const models = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const verifyToken = require('../middleware/verifyToken');

// ====== ROUTES SPÉCIFIQUES EN PREMIER (AVANT LES ROUTES AVEC PARAMÈTRES) ======

// Route pour changer le mot de passe
router.put('/change-password', verifyToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const utilisateurId = req.utilisateur.id;
  
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

// Route pour supprimer définitivement son compte (avec vérifications de sécurité)
router.delete('/delete-account', verifyToken, async (req, res) => {
  const { password, userId } = req.body;
  const tokenUserId = req.utilisateur.id;

  try {
    console.log('🗑️ Tentative de suppression de compte:', { userId, tokenUserId });

    // Vérification 1: L'utilisateur ne peut supprimer que son propre compte
    if (parseInt(userId) !== tokenUserId) {
      return res.status(403).json({ 
        message: 'Vous ne pouvez supprimer que votre propre compte' 
      });
    }

    // Vérification 2: Récupérer l'utilisateur
    const utilisateur = await Utilisateur.findByPk(tokenUserId);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérification 3: Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, utilisateur.motDePasse);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        message: 'Mot de passe incorrect. Suppression annulée.' 
      });
    }

    // Vérification 4: Empêcher la suppression des comptes administrateurs/boulangers
    if (utilisateur.role === 'boulanger' || utilisateur.role === 'admin') {
      return res.status(403).json({ 
        message: 'Les comptes avec des privilèges spéciaux ne peuvent pas être supprimés via cette méthode' 
      });
    }

    console.log('🔄 Début de la suppression des données liées...');

    // Étape 1: Supprimer toutes les données liées à l'utilisateur
    
    // 1.1: Récupérer toutes les commandes de l'utilisateur
    const commandesUtilisateur = await Commande.findAll({
      where: { utilisateurId: tokenUserId },
      include: [{
        model: LigneCommande,
        as: 'ligneCommandes'
      }]
    });

    console.log(`📦 Trouvé ${commandesUtilisateur.length} commandes à supprimer`);

    // 1.2: Supprimer les garnitures des lignes de commande
    for (const commande of commandesUtilisateur) {
      if (commande.ligneCommandes) {
        for (const ligneCommande of commande.ligneCommandes) {
          await LigneCommandeGarniture.destroy({
            where: { ligneCommandeId: ligneCommande.id }
          });
        }
      }
    }

    // 1.3: Supprimer les lignes de commande
    if (commandesUtilisateur.length > 0) {
      const commandeIds = commandesUtilisateur.map(c => c.id);
      await LigneCommande.destroy({
        where: { commandeId: commandeIds }
      });
    }

    // 1.4: Supprimer les commandes
    await Commande.destroy({
      where: { utilisateurId: tokenUserId }
    });

    // 1.5: Supprimer les favoris (si la table existe)
    try {
      const { Favoris } = require('../models');
      await Favoris.destroy({
        where: { utilisateurId: tokenUserId }
      });
    } catch (error) {
      console.log('ℹ️ Table Favoris non trouvée ou erreur:', error.message);
    }

    // Étape 2: Supprimer l'utilisateur lui-même
    console.log('❌ Suppression de l\'utilisateur...');
    await utilisateur.destroy();

    // Log de sécurité
    console.log(`✅ COMPTE SUPPRIMÉ - Utilisateur ID: ${tokenUserId}, Email: ${utilisateur.email}, Date: ${new Date().toISOString()}`);

    res.status(200).json({ 
      message: 'Votre compte a été supprimé définitivement. Nous sommes désolés de vous voir partir.',
      deletedData: {
        commandes: commandesUtilisateur.length,
        soldePerdus: utilisateur.solde
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression du compte:', error);
    
    res.status(500).json({ 
      message: 'Une erreur est survenue lors de la suppression du compte. Veuillez réessayer plus tard.',
      error: error.message
    });
  }
});

// Route pour obtenir un aperçu de ce qui sera supprimé
router.get('/delete-preview', verifyToken, async (req, res) => {
  const utilisateurId = req.utilisateur.id;

  try {
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Compter les données qui seront supprimées
    const nombreCommandes = await Commande.count({
      where: { utilisateurId: utilisateurId }
    });

    let nombreFavoris = 0;
    try {
      const { Favoris } = require('../models');
      nombreFavoris = await Favoris.count({
        where: { utilisateurId: utilisateurId }
      });
    } catch (error) {
      // Table n'existe pas
    }

    res.json({
      apercu: {
        commandes: nombreCommandes,
        favoris: nombreFavoris,
        solde: utilisateur.solde
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'aperçu:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ====== ROUTES GÉNÉRIQUES (AVEC PARAMÈTRES) EN DERNIER ======

// Ajouter un utilisateur
router.post('/', async (req, res) => {
  const { prenom, nom, email, motDePasse, telephone } = req.body;

  try {
    // Vérifier si l'email existe déjà
    const utilisateurExistant = await Utilisateur.findOne({ where: { email } });
    if (utilisateurExistant) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Créer l'utilisateur
    const utilisateur = await Utilisateur.create({
      prenom,
      nom,
      email,
      telephone,
      motDePasse: hashedPassword,
      solde: 0,
      role: 'client'
    });

    // Générer un token
    const token = jwt.sign(
      { id: utilisateur.id, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Enlever le mot de passe du retour
    const userSansMotDePasse = {
      id: utilisateur.id,
      prenom: utilisateur.prenom,
      nom: utilisateur.nom,
      email: utilisateur.email,
      telephone: utilisateur.telephone,
      role: utilisateur.role,
      solde: utilisateur.solde
    };

    res.status(201).json({ token, user: userSansMotDePasse });
  } catch (error) {
    console.error("Erreur création utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur" });
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
    console.error('Erreur lors de la récupération de l\'utilisateur :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les commandes d'un utilisateur spécifique
router.get('/:id/commandes', verifyToken, async (req, res) => {
  try {
    const utilisateurId = req.params.id;

    const commandes = await Commande.findAll({
      where: { utilisateurId: req.params.id },
      include: [
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

// Supprimer un utilisateur (route administrative)
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