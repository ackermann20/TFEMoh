const express = require('express');
const router = express.Router();
const { Commande, LigneCommande,LigneCommandeGarniture,Garniture, Utilisateur, Produit } = require('../models');
const verifyToken = require('../middleware/verifyToken');

// Récupérer toutes les commandes
router.get('/', async (req, res) => {
  try {
    const commandes = await Commande.findAll();
    res.status(200).json(commandes);
  } catch (error) {
    console.error('Erreur getAll commandes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes', error: error.message });
  }
});
// Récupérer une commande par ID
router.get('/:id', async (req, res) => {
  try {
    // Assurez-vous que tous les modèles nécessaires sont importés en haut du fichier
    if (!LigneCommandeGarniture || !Garniture) {
      return res.status(500).json({ 
        message: 'Modèles manquants. Vérifiez vos imports.'
      });
    }
    
    const commande = await Commande.findByPk(req.params.id, {
      include: [
        {
          model: Utilisateur,
          as: 'utilisateur'
        },
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

    
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    
    res.status(200).json(commande);
  } catch (error) {
    console.error('Erreur getById commande:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération de la commande', 
      error: error.message,
      stack: error.stack
    });
  }
});

// Route qui récupère les commandes d'un utilisateur
router.get('/utilisateur/:id', verifyToken, async (req, res) => {
  try {
    const commandes = await Commande.findAll({
      where: { utilisateurId: req.params.id },
      include: [
        {
          model: LigneCommande,
          include: [Produit]
        }
      ],
      order: [['dateRetrait', 'DESC']]
    });
    
    // Transformer pour utiliser la description personnalisée
    const commandesJSON = commandes.map(commande => {
      const commandeObj = commande.toJSON();
      if (commandeObj.ligneCommandes) {
        commandeObj.ligneCommandes = commandeObj.ligneCommandes.map(ligne => {
          // Ne pas modifier le produit original mais ajouter des infos
          return {
            ...ligne,
            // Garder l'information que c'est un sandwich si applicable
            estSandwich: ligne.estSandwich || false
          };
        });
      }
      return commandeObj;
    });
    
    res.status(200).json(commandesJSON);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes', error });
  }
});

router.get('/utilisateurs/:id/commandes', async (req, res) => {
  try {
    const commandes = await Commande.findAll({
  where: { utilisateurId: req.params.id },
  include: [
    {
      model: LigneCommande,
      as: 'ligneCommandes', // ce nom doit être EXACTEMENT le même que celui défini dans les associations
      include: [
        {
          model: Produit,
          as: 'produit',
        },
        {
          model: LigneCommandeGarniture,
          as: 'ligneGarnitures',
          include: [
            {
              model: Garniture,
              as: 'garniture',
            },
          ],
        },
      ],
    },
  ],
});

    
    // Transformer les données pour faciliter leur utilisation côté client
    const commandesJSON = commandes.map(commande => {
      const commandeObj = commande.toJSON();
      
      // Pour chaque ligne de commande, récupérer ses garnitures
      if (commandeObj.ligneCommandes) {
        for (let i = 0; i < commandeObj.ligneCommandes.length; i++) {
          const ligne = commandeObj.ligneCommandes[i];
          
          // Transformer les garnitures en tableau de noms pour faciliter l'affichage
          if (ligne.LigneCommandeGarnitures && ligne.LigneCommandeGarnitures.length > 0) {
            ligne.garnitures = ligne.LigneCommandeGarnitures.map(lcg => lcg.Garniture.nom);
          }
        }
      }
      
      return commandeObj;
    });
    
    res.status(200).json(commandesJSON);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes', error });
  }
});

// routes/boulanger.js
router.get('/commandes-aujourdhui', verifyToken, async (req, res) => {
  try {
    const commandes = await Commande.findAll({
      where: {
        statut: 'en attente',
        date: new Date().toISOString().split('T')[0], // filtre sur la date du jour
      },
      include: [Utilisateur, Produit]
    });

    res.json(commandes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;


// Créer une nouvelle commande
// Dans commandesRoutes.js, la fonction post pour créer une commande
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
      statut: 'en attente'
    });

    for (const produit of produits) {
      // Vérifiez le format des données et utilisez le bon identifiant
      const produitId = produit.produitId || produit.id;
      
      const produitBDD = await Produit.findByPk(produitId);

      if (!produitBDD) {
        return res.status(404).json({ message: `Produit ID ${produitId} non trouvé.` });
      }

      // Créez la ligne de commande
      const ligneCommande = await LigneCommande.create({
        commandeId: nouvelleCommande.id,
        produitId: produitId,
        quantite: produit.quantite || 1,
        prixUnitaire: produit.prix || produitBDD.prix,
        description: produit.isSandwich ? produit.description : null,
        estSandwich: produit.isSandwich || produit.type === 'sandwich' || false
      });
      
      // Si c'est un sandwich avec des garnitures, les enregistrer
      if ((produit.isSandwich || produit.type === 'sandwich') && produit.garnitures && produit.garnitures.length > 0) {
        console.log("Garnitures pour sandwich:", produit.garnitures);
        
        // Pour chaque garniture, créer une entrée dans LigneCommandeGarniture
        for (const garnitureName of produit.garnitures) {
          try {
            // Trouver la garniture par son nom
            const garniture = await Garniture.findOne({ 
              where: { nom: garnitureName } 
            });
            
            if (garniture) {
              // Créer l'association entre la ligne de commande et la garniture
              await LigneCommandeGarniture.create({
                ligneCommandeId: ligneCommande.id,
                garnitureId: garniture.id
              });
              console.log(`Garniture ${garnitureName} ajoutée à la ligne de commande ${ligneCommande.id}`);
            } else {
              console.log(`Garniture ${garnitureName} non trouvée dans la base de données`);
            }
          } catch (garnitureError) {
            console.error(`Erreur lors de l'ajout de la garniture ${garnitureName}:`, garnitureError);
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

// Mettre à jour une commande
router.put('/:id', async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    const { dateCommande, dateRetrait, trancheHoraireRetrait, statut, description } = req.body;
    await commande.update({ dateCommande, dateRetrait, trancheHoraireRetrait, statut, description });
    res.status(200).json(commande);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la commande', error });
  }
});

// Supprimer une commande
router.delete('/:id', async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    await commande.destroy();
    res.status(200).json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la commande', error });
  }
});

module.exports = router;