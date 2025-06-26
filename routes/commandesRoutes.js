const express = require('express');
const router = express.Router();
const { Commande, LigneCommande, LigneCommandeGarniture, Garniture, Utilisateur, Produit } = require('../models');
const verifyToken = require('../middleware/verifyToken');
const { sequelize } = require('../models');


// ===============================
// 📊 Recommandations pour un utilisateur
// ===============================
router.get('/utilisateurs/:id/recommandations', async (req, res) => {
  const utilisateurId = req.params.id;

  try {
    const results = await sequelize.query(`
      SELECT produitId, COUNT(*) AS nb_commandes
      FROM LigneCommandes
      INNER JOIN Commandes ON LigneCommandes.commandeId = Commandes.id
      WHERE Commandes.utilisateurId = ?
      GROUP BY produitId
      ORDER BY nb_commandes DESC
      LIMIT 5
    `, {
      replacements: [utilisateurId],
      type: sequelize.QueryTypes.SELECT
    });

    let produits;

    if (results.length > 0) {
      const ids = results.map(r => r.produitId);
      const allProduits = await Produit.findAll();
      produits = ids.map(id => allProduits.find(p => p.id === id)).filter(Boolean);
    } else {
      produits = await Produit.findAll({
        order: [['disponible', 'DESC']],
        limit: 5
      });
    }

    res.json(produits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des suggestions' });
  }
});


// ===============================
// 📥 Récupérer toutes les commandes avec détails
// ===============================
router.get('/', async (req, res) => {
  try {
    const commandes = await Commande.findAll({
      include: [
        { model: Utilisateur, as: 'utilisateur', attributes: ['id', 'prenom', 'nom', 'email', 'telephone'] },
        {
          model: LigneCommande,
          as: 'ligneCommandes',
          include: [
            { model: Produit, as: 'produit', attributes: ['id', 'nom', 'prix', 'type'] },
            {
              model: LigneCommandeGarniture,
              as: 'ligneGarnitures',
              attributes: ['typePain'],
              include: [
                { model: Garniture, as: 'garniture', attributes: ['id', 'nom', 'prix'] }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(commandes);
  } catch (error) {
    console.error('Erreur getAll commandes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes', error: error.message });
  }
});


// ===============================
// 🔍 Récupérer une commande par ID
// ===============================
router.get('/:id', async (req, res) => {
  try {
    if (!LigneCommandeGarniture || !Garniture) {
      return res.status(500).json({ message: 'Modèles manquants. Vérifiez vos imports.' });
    }

    const commande = await Commande.findByPk(req.params.id, {
      include: [
        { model: Utilisateur, as: 'utilisateur' },
        {
          model: LigneCommande,
          as: 'ligneCommandes',
          include: [
            { model: Produit, as: 'produit' },
            {
              model: LigneCommandeGarniture,
              as: 'ligneGarnitures',
              include: [{ model: Garniture, as: 'garniture' }]
            }
          ]
        }
      ]
    });

    if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });

    res.status(200).json(commande);
  } catch (error) {
    console.error('Erreur getById commande:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la commande', error: error.message });
  }
});


// ===============================
// 👤 Commandes d’un utilisateur (auth)
// ===============================
router.get('/utilisateur/:id', verifyToken, async (req, res) => {
  try {
    const commandes = await Commande.findAll({
      where: { utilisateurId: req.params.id },
      include: [
        { model: LigneCommande, include: [Produit] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const commandesJSON = commandes.map(commande => {
      const commandeObj = commande.toJSON();
      if (commandeObj.ligneCommandes) {
        commandeObj.ligneCommandes = commandeObj.ligneCommandes.map(ligne => ({
          ...ligne,
          estSandwich: ligne.estSandwich || false
        }));
      }
      return commandeObj;
    });

    res.status(200).json(commandesJSON);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes', error });
  }
});


// ===============================
// 👤 Commandes d’un utilisateur (non auth)
// ===============================
router.get('/utilisateurs/:id/commandes', async (req, res) => {
  try {
    const commandes = await Commande.findAll({
      where: { utilisateurId: req.params.id },
      include: [
        {
          model: LigneCommande,
          as: 'ligneCommandes',
          include: [
            { model: Produit, as: 'produit' },
            {
              model: LigneCommandeGarniture,
              as: 'ligneGarnitures',
              include: [{ model: Garniture, as: 'garniture' }]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const commandesJSON = commandes.map(commande => {
      const commandeObj = commande.toJSON();
      if (commandeObj.ligneCommandes) {
        commandeObj.ligneCommandes.forEach(ligne => {
          if (ligne.LigneCommandeGarnitures && ligne.LigneCommandeGarnitures.length > 0) {
            ligne.garnitures = ligne.LigneCommandeGarnitures.map(lcg => lcg.Garniture.nom);
          }
        });
      }
      return commandeObj;
    });

    res.status(200).json(commandesJSON);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes', error });
  }
});


// ===============================
// ❌ Annuler une commande (et rembourser)
// ===============================
router.patch('/:id/annuler', verifyToken, async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id, {
      include: [
        { model: LigneCommande, as: 'ligneCommandes' },
        { model: Utilisateur, as: 'utilisateur' }
      ]
    });

    if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });
    if (commande.statut !== 'en attente') {
      return res.status(400).json({ message: 'Impossible d’annuler une commande qui a déjà été traitée.' });
    }

    const montantTotal = commande.ligneCommandes.reduce((total, ligne) => {
      return total + ligne.quantite * ligne.prixUnitaire;
    }, 0);

    commande.statut = 'annulée';
    await commande.save();

    commande.utilisateur.solde += montantTotal;
    await commande.utilisateur.save();

    res.status(200).json({ message: 'Commande annulée et montant remboursé.' });
  } catch (err) {
    console.error('Erreur annulation commande :', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// ===============================
// 📆 Commandes du jour (interface boulanger)
// ===============================
router.get('/commandes-aujourdhui', verifyToken, async (req, res) => {
  try {
    const commandes = await Commande.findAll({
      where: {
        statut: 'en attente',
        date: new Date().toISOString().split('T')[0],
      },
      include: [Utilisateur, Produit]
    });

    res.json(commandes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// ===============================
// ➕ Créer une commande (panier, sandwich, pain, etc.)
// ===============================
router.post('/', verifyToken, async (req, res) => {
  const { produits, dateRetrait, trancheHoraireRetrait } = req.body;
  const utilisateurId = req.utilisateur.id;

  if (!produits || produits.length === 0) {
    return res.status(400).json({ message: "Le panier est vide." });
  }

  try {
    const nouvelleCommande = await Commande.create({
      utilisateurId,
      dateRetrait,
      trancheHoraireRetrait,
      statut: 'en attente',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    for (const produit of produits) {
      const produitId = produit.produitId || produit.id;
      const produitBDD = await Produit.findByPk(produitId);

      if (!produitBDD) {
        return res.status(404).json({ message: `Produit ID ${produitId} non trouvé.` });
      }

      const ligneCommande = await LigneCommande.create({
        commandeId: nouvelleCommande.id,
        produitId: produitId,
        quantite: produit.quantite || 1,
        prixUnitaire: produit.prix || produitBDD.prix,
        description: produit.isSandwich ? produit.description : null,
        estSandwich: produit.isSandwich || produit.type === 'sandwich' || false
      });

      if (produit.isSandwich || produit.type === 'sandwich') {
        const typePainChoisi = produit.typePain || 'blanc';

        if (produit.garnitures && produit.garnitures.length > 0) {
          for (const garniture of produit.garnitures) {
            const garnitureBDD = await Garniture.findByPk(garniture.id);
            if (garnitureBDD) {
              await LigneCommandeGarniture.create({
                ligneCommandeId: ligneCommande.id,
                garnitureId: garnitureBDD.id,
                typePain: typePainChoisi
              });
            }
          }
        } else {
          const premiereGarniture = await Garniture.findOne();
          if (premiereGarniture) {
            await LigneCommandeGarniture.create({
              ligneCommandeId: ligneCommande.id,
              garnitureId: premiereGarniture.id,
              typePain: typePainChoisi
            });
          }
        }
      }
    }

    res.status(201).json({ message: 'Commande créée avec succès.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de la commande." });
  }
});


// ===============================
// ✏️ Modifier une commande
// ===============================
router.put('/:id', async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });

    const { dateCommande, dateRetrait, trancheHoraireRetrait, statut, description } = req.body;
    await commande.update({ dateCommande, dateRetrait, trancheHoraireRetrait, statut, description });

    res.status(200).json(commande);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la commande', error });
  }
});


// ===============================
// 🗑️ Supprimer une commande
// ===============================
router.delete('/:id', async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });

    await commande.destroy();
    res.status(200).json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la commande', error });
  }
});

module.exports = router;
