const express = require('express');
const router = express.Router();
const { LigneCommandeGarniture, LigneCommande, Garniture } = require('../models');
const verifyToken = require('../middleware/verifyToken');

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

// NOUVELLE ROUTE: Récupérer toutes les garnitures d'une ligne de commande spécifique
router.get('/ligne-commande/:ligneCommandeId', async (req, res) => {
  try {
    const { ligneCommandeId } = req.params;
    
    // Vérifier que la ligne de commande existe
    const ligneCommande = await LigneCommande.findByPk(ligneCommandeId);
    if (!ligneCommande) {
      return res.status(404).json({ message: 'Ligne de commande non trouvée' });
    }
    
    // Récupérer les garnitures associées à cette ligne de commande
    const garnituresAssociations = await LigneCommandeGarniture.findAll({
      where: { ligneCommandeId },
      include: [{ model: Garniture, as: 'garniture' }]
    });
    
    // Formater les résultats pour une meilleure lisibilité
    const garnitures = garnituresAssociations.map(association => ({
      id: association.garniture.id,
      nom: association.garniture.nom,
      prix: association.garniture.prix,
      description: association.garniture.description
    }));
    
    res.status(200).json(garnitures);
  } catch (error) {
    console.error('Erreur lors de la récupération des garnitures:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des garnitures', error });
  }
});

// NOUVELLE ROUTE: Récupérer toutes les garnitures d'une commande et d'une ligne spécifiques
router.get('/commande/:commandeId/ligne/:ligneCommandeId', verifyToken, async (req, res) => {
  try {
    const { commandeId, ligneCommandeId } = req.params;
    
    // Vérifier que la ligne de commande existe et appartient à la commande spécifiée
    const ligneCommande = await LigneCommande.findOne({
      where: {
        id: ligneCommandeId,
        commandeId: commandeId
      }
    });
    
    if (!ligneCommande) {
      return res.status(404).json({ message: 'Ligne de commande non trouvée dans cette commande' });
    }
    
    // Récupérer les garnitures associées à cette ligne de commande
    const garnituresAssociations = await LigneCommandeGarniture.findAll({
      where: { ligneCommandeId },
      include: [{ model: Garniture, as: 'garniture' }]
    });
    
    // Formater les résultats
    const garnitures = garnituresAssociations.map(association => ({
      id: association.garniture.id,
      nom: association.garniture.nom,
      prix: association.garniture.prix,
      description: association.garniture.description
    }));
    
    res.status(200).json(garnitures);
  } catch (error) {
    console.error('Erreur lors de la récupération des garnitures:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des garnitures', error });
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

// Ajouter plusieurs garnitures à une ligne de commande
router.post('/bulk', async (req, res) => {
  try {
    const { ligneCommandeId, garnitureIds } = req.body;
    
    if (!Array.isArray(garnitureIds)) {
      return res.status(400).json({ message: 'garnitureIds doit être un tableau' });
    }
    
    // Créer un tableau d'objets pour l'insertion en masse
    const garnituresToCreate = garnitureIds.map(garnitureId => ({
      ligneCommandeId,
      garnitureId
    }));
    
    const createdGarnitures = await LigneCommandeGarniture.bulkCreate(garnituresToCreate);
    
    res.status(201).json({
      message: `${createdGarnitures.length} garnitures ajoutées avec succès à la ligne de commande`,
      data: createdGarnitures
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout des garnitures', error });
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

// Supprimer toutes les garnitures d'une ligne de commande
router.delete('/ligne-commande/:ligneCommandeId', async (req, res) => {
  try {
    const { ligneCommandeId } = req.params;
    
    const deleted = await LigneCommandeGarniture.destroy({
      where: { ligneCommandeId }
    });
    
    res.status(200).json({ 
      message: `${deleted} associations de garnitures supprimées avec succès`,
      count: deleted
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression des garnitures', error });
  }
});

module.exports = router;