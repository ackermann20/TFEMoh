const express = require('express');
const router = express.Router();
const { Commande, Utilisateur, Produit, LigneCommande, Garniture, LigneCommandeGarniture, sequelize } = require('../models');
const { Op } = require('sequelize');
const verifyToken = require('../middleware/verifyToken');

// Récupérer les commandes d'aujourd'hui avec détails complets
router.get('/commandes-aujourdhui', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const commandes = await Commande.findAll({
      where: {
        dateRetrait: {
            [Op.gte]: today
        }
        },
      include: [
        { 
          model: Utilisateur, 
          as: 'utilisateur',
          attributes: ['id', 'prenom', 'nom', 'email', 'telephone'] 
        },
       {
            model: LigneCommande,
            as: 'ligneCommandes', 

          include: [
            {
              model: Produit,
              as: 'produit',
              attributes: ['id', 'nom', 'prix', 'description', 'type']

            },
            {
              model: LigneCommandeGarniture,
              as: 'ligneGarnitures',
              include: [
                {
                  model: Garniture,
                  as: 'garniture',
                  attributes: ['id', 'nom', 'prix']
                }
              ]
            }
          ]
        }
      ],
      order: [
        ['dateRetrait', 'ASC'],
        ['createdAt', 'ASC']
      ]
    });

    // Transformer les données pour faciliter l'utilisation côté client
    const transformedCommandes = commandes.map(commande => {
      const plainCommande = commande.get({ plain: true });
      
      // Calculer le prix total et ajouter des informations sur les produits
      let total = 0;
      const Produits = plainCommande.ligneCommandes.map(ligne => {
        const produit = ligne.produit;
        const quantite = ligne.quantite;
        let prixLigne = produit.prix * quantite;
        
        // Ajouter les garnitures et leurs prix
        const garnitures = ligne.ligneGarnitures.map(lcg => {
          const garniture = lcg.garniture;
          prixLigne += garniture.prix;
          return {
            id: garniture.id,
            nom: garniture.nom,
            prix: garniture.prix
          };
        });
        
        total += prixLigne;
        
        return {
          id: produit.id,
          nom: produit.nom,
          prix: produit.prix,
          description: produit.description,
          categorie: produit.categorie,
          quantite: quantite,
          prixTotal: prixLigne,
          garnitures: garnitures
        };
      });
      
      return {
        ...plainCommande,
        Produits,
        prixTotal: total
      };
    });

    res.json(transformedCommandes);
  } catch (error) {
    console.error("Erreur récupération commandes :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Mettre à jour le statut d'une commande
router.put('/commandes/:id/statut', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    
    // Vérifier que le statut est valide
    const statutsValides = ['en attente', 'en préparation', 'prêt', 'livré', 'annulé'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ message: "Statut invalide" });
    }
    
    const commande = await Commande.findByPk(id);
    
    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    
    commande.statut = statut;
    await commande.save();
    
    // Ajouter un timestamp pour les changements importants
    if (statut === 'prêt') {
      commande.datePreparation = new Date();
      await commande.save();
    } else if (statut === 'livré') {
      commande.dateLivraison = new Date();
      await commande.save();
    }
    
    res.json({ message: "Statut mis à jour avec succès", commande });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Get stats for baker dashboard
router.get('/statistiques', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Count commandes by status for today
    const commandesParStatut = await Commande.findAll({
      attributes: [
        'statut',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        dateRetrait: {
          [Op.gte]: today
        }
      },
      group: ['statut']
    });
    
    // Get upcoming orders for the next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const commandesProchaines = await Commande.count({
      where: {
        dateRetrait: {
          [Op.gt]: today,
          [Op.lte]: nextWeek.toISOString().split('T')[0]
        }
      }
    });
    
    // Get most ordered products
    const produitsPlusCommandes = await LigneCommande.findAll({
      attributes: [
        'produitId',
        [sequelize.fn('SUM', sequelize.col('quantite')), 'totalQuantite']
      ],
      include: [
        {
          model: Produit,
          as: 'produit',
          attributes: ['nom']
        },
        {
          model: Commande,
          as: 'commande',
          attributes: [],
          where: {
            createdAt: {
              [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
            }
          }
        }
      ],
      group: ['produitId', 'produit.nom'],
      order: [[sequelize.fn('SUM', sequelize.col('quantite')), 'DESC']],
      limit: 5
    });
    
    res.json({
      commandesParStatut,
      commandesProchaines,
      produitsPlusCommandes
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

module.exports = router;