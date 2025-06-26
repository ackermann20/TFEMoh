'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LigneCommande extends Model {
    static associate(models) {
      // Chaque ligne appartient à une commande
      LigneCommande.belongsTo(models.Commande, {
        foreignKey: 'commandeId',
        as: 'commande',
      });

      // Chaque ligne peut avoir plusieurs garnitures
      LigneCommande.hasMany(models.LigneCommandeGarniture, {
        foreignKey: 'ligneCommandeId',
        as: 'ligneGarnitures',
      });

      // Produit concerné
      LigneCommande.belongsTo(models.Produit, {
        foreignKey: 'produitId',
        as: 'produit',
      });
    }
  }

  LigneCommande.init({
    commandeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    produitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    prixUnitaire: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'LigneCommande',
    tableName: 'LigneCommandes',
    timestamps: true, // createdAt & updatedAt
  });

  return LigneCommande;
};
