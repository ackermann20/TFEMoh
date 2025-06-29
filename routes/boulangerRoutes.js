const express = require('express');
const router = express.Router();
const { Commande, Utilisateur, Produit, LigneCommande, Garniture, LigneCommandeGarniture, sequelize } = require('../models');
const { Op } = require('sequelize');
const verifyToken = require('../middleware/verifyToken');


// ===============================
// 📆 Récupérer les commandes du jour (pour le boulanger)
// ===============================
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
              attributes: ['id', 'nom', 'nom_en', 'nom_nl', 'prix', 'description', 'type']

            },
            {
              model: LigneCommandeGarniture,
              as: 'ligneGarnitures',
              attributes: ['typePain'],
              include: [
                {
                  model: Garniture,
                  as: 'garniture',
                  attributes: ['id', 'nom', 'nom_en', 'nom_nl', 'prix']

                }
              ]
            }
          ]
        }
      ],
      order: [['dateRetrait', 'ASC'], ['createdAt', 'ASC']]
    });

    const transformedCommandes = commandes.map(commande => {
      const plainCommande = commande.get({ plain: true });

      let total = 0;
      const Produits = plainCommande.ligneCommandes.map(ligne => {
        const produit = ligne.produit;
        const quantite = ligne.quantite;
        let prixLigne = produit.prix * quantite;

        let typePain = null;

        const garnitures = ligne.ligneGarnitures.map(lcg => {
          const garniture = lcg.garniture;
          prixLigne += garniture.prix;

          if (lcg.typePain && !typePain) {
            typePain = lcg.typePain;
          }

          return {
             id: garniture.id,
            nom: garniture.nom,
            nom_en: garniture.nom_en,
            nom_nl: garniture.nom_nl,
            prix: garniture.prix,
            typePain: lcg.typePain
          };
        });

        total += prixLigne;

        return {
          id: produit.id,
          nom: produit.nom,
          nom_en: produit.nom_en,
          nom_nl: produit.nom_nl,
          prix: produit.prix,
          description: produit.description,
          categorie: produit.categorie,
          type: produit.type,
          quantite: quantite,
          prixTotal: prixLigne,
          garnitures: garnitures,
          typePain: typePain
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


// ===============================
// 📅 Récupérer les commandes par date
// ===============================
router.get('/commandes-by-date', verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'La date est requise' });

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const commandes = await Commande.findAll({
      where: {
        dateRetrait: {
          [Op.between]: [startDate, endDate]
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
              attributes: ['id', 'nom', 'nom_en', 'nom_nl', 'prix', 'type']
            }
            ,
            {
              model: LigneCommandeGarniture,
              as: 'ligneGarnitures',
              attributes: ['typePain'],
              include: [
                {
                  model: Garniture,
                  as: 'garniture',
                  attributes: ['id', 'nom', 'nom_en', 'nom_nl', 'prix']
                }

              ]
            }
          ]
        }
      ],
      order: [['dateCommande', 'DESC'], ['id', 'DESC']]
    });

    const commandesFormatees = commandes.map(commande => {
      const produits = commande.ligneCommandes.map(ligne => {
        let typePain = null;

        const garnitures = ligne.ligneGarnitures.map(lg => {
          if (lg.typePain && !typePain) typePain = lg.typePain;

          return {
          id: lg.garniture.id,
          nom: lg.garniture.nom,
          nom_en: lg.garniture.nom_en,
          nom_nl: lg.garniture.nom_nl,
          prix: lg.garniture.prix,
          typePain: lg.typePain
          };

        });

        return {
          id: ligne.produit.id,
          nom: ligne.produit.nom,
          nom_en: ligne.produit.nom_en,
          nom_nl: ligne.produit.nom_nl,
          prix: ligne.prixUnitaire,
          quantite: ligne.quantite,
          type: ligne.produit.type,
          garnitures,
          typePain
        };

      });

      return {
        id: commande.id,
        dateCommande: commande.dateCommande,
        dateRetrait: commande.dateRetrait,
        trancheHoraireRetrait: commande.trancheHoraireRetrait,
        statut: commande.statut,
        prixTotal: commande.prixTotal,
        description: commande.description,
        utilisateur: commande.utilisateur,
        Produits: produits
      };
    });

    res.json(commandesFormatees);
  } catch (error) {
    console.error('Erreur récupération commandes par date:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


// ===============================
// 🔁 Mettre à jour le statut d’une commande
// ===============================
router.put('/commandes/:id/statut', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const statutsValides = ['en attente', 'en préparation', 'prêt', 'livré', 'annulé'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const commande = await Commande.findByPk(id);
    if (!commande) return res.status(404).json({ message: "Commande non trouvée" });

    commande.statut = statut;

    if (statut === 'prêt') commande.datePreparation = new Date();
    if (statut === 'livré') commande.dateLivraison = new Date();

    await commande.save();

    if (statut === 'annulé') {
      const utilisateur = await Utilisateur.findByPk(commande.utilisateurId);
      const lignes = await LigneCommande.findAll({
        where: { commandeId: commande.id },
        include: [
          { model: Produit, as: 'produit' },
          {
            model: LigneCommandeGarniture,
            as: 'ligneGarnitures',
            include: [{ model: Garniture, as: 'garniture' }]
          }
        ]
      });

      let montantTotal = 0;
      lignes.forEach(ligne => {
        let prixLigne = ligne.quantite * ligne.produit.prix;
        ligne.ligneGarnitures.forEach(lg => {
          prixLigne += lg.garniture.prix;
        });
        montantTotal += prixLigne;
      });

      if (utilisateur) {
        utilisateur.solde += montantTotal;
        await utilisateur.save();
      }
    }

    res.json({ message: "Statut mis à jour avec succès", commande });
  } catch (error) {
    console.error("Erreur statut commande :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});


// ===============================
// 📈 Statistiques pour dashboard boulanger
// ===============================
router.get('/statistiques', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const commandesParStatut = await Commande.findAll({
      attributes: ['statut', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: { dateRetrait: { [Op.gte]: today } },
      group: ['statut']
    });

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

    const produitsPlusCommandes = await LigneCommande.findAll({
      attributes: [
        'produitId',
        [sequelize.fn('SUM', sequelize.col('quantite')), 'totalQuantite']
      ],
      include: [
        { model: Produit, as: 'produit', attributes: ['nom'] },
        {
          model: Commande,
          as: 'commande',
          attributes: [],
          where: {
            createdAt: {
              [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
            }
          }
        }
      ],
      group: ['produitId', 'produit.nom'],
      order: [[sequelize.fn('SUM', sequelize.col('quantite')), 'DESC']],
      limit: 5
    });

    res.json({ commandesParStatut, commandesProchaines, produitsPlusCommandes });
  } catch (error) {
    console.error("Erreur stats :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});


// ===============================
// 🧺 Mise à jour produit (disponible / promo / prix)
// ===============================
router.put('/produits/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { disponible, prixPromo, prix } = req.body;

    const produit = await Produit.findByPk(id);
    if (!produit) return res.status(404).json({ message: "Produit non trouvé" });

    if (typeof disponible === 'boolean') produit.disponible = disponible;
    if (prixPromo === null || typeof prixPromo === 'number') produit.prixPromo = prixPromo;
    if (typeof prix === 'number') produit.prix = prix;

    await produit.save();

    res.json({ message: "Produit mis à jour avec succès", produit });
  } catch (error) {
    console.error("Erreur produit :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});


// ===============================
// 🥗 Mise à jour garniture (disponible / prix)
// ===============================
router.put('/garnitures/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { disponible, prix } = req.body;

    const garniture = await Garniture.findByPk(id);
    if (!garniture) return res.status(404).json({ message: "Garniture non trouvée" });

    if (typeof disponible === 'boolean') garniture.disponible = disponible;
    if (typeof prix === 'number') garniture.prix = prix;

    await garniture.save();

    res.json({ message: "Garniture mise à jour avec succès", garniture });
  } catch (error) {
    console.error("Erreur garniture :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});


// ===============================
// 👥 Liste des clients
// ===============================
router.get('/clients', verifyToken, async (req, res) => {
  try {
    const clients = await Utilisateur.findAll({
      where: { role: 'client' },
      attributes: ['id', 'prenom', 'nom', 'email', 'telephone', 'solde', 'createdAt'],
      order: [['nom', 'ASC'], ['prenom', 'ASC']]
    });

    res.json(clients);
  } catch (error) {
    console.error("Erreur récupération clients :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});


// ===============================
// 💰 Ajouter du solde à un client
// ===============================
router.put('/clients/:id/add-solde', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { montant, raison } = req.body;

    if (!montant || montant <= 0) {
      return res.status(400).json({ message: "Le montant doit être positif" });
    }

    const client = await Utilisateur.findByPk(id);
    if (!client) return res.status(404).json({ message: "Client non trouvé" });
    if (client.role !== 'client') return res.status(400).json({ message: "Seuls les clients peuvent recevoir du solde" });

    client.solde += parseFloat(montant);
    await client.save();

    res.json({
      message: "Solde ajouté avec succès",
      client: {
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        nouveauSolde: client.solde,
        montantAjoute: parseFloat(montant)
      }
    });
  } catch (error) {
    console.error("Erreur ajout solde :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

module.exports = router;
