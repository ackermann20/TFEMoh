'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  // Définition du modèle Commande
  class Commande extends Model {
    /**
     * Définition des associations entre les tables
     */
    static associate(models) {
      // Une commande appartient à un utilisateur
      this.belongsTo(models.Utilisateur, { foreignKey: 'utilisateurId', as: 'utilisateur' });
      // Une commande contient plusieurs lignes de commande
      this.hasMany(models.LigneCommande, { foreignKey: 'commandeId', as: 'ligneCommandes' });
    }
  }

  // Initialisation des champs de la table Commandes
  Commande.init({
    utilisateurId: {
      type: DataTypes.INTEGER,
      allowNull: false, // L'utilisateur est obligatoire
    },
    dateCommande: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Date actuelle par défaut
    },
    dateRetrait: {
      type: DataTypes.DATE,
      allowNull: false, // Date de retrait obligatoire
    },
    trancheHoraireRetrait: {
      type: DataTypes.STRING,
      allowNull: false, // Tranche horaire obligatoire (matin, midi, soir)
    },
    statut: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'en attente', // Statut par défaut
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true, // Champ facultatif pour les notes
    },
  }, {
    sequelize,
    modelName: 'Commande',
    tableName: 'Commandes',
    timestamps: true, // Ajoute createdAt et updatedAt
  });

  return Commande;
};
