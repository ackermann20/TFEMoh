'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LigneCommande extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relation avec Commande
      LigneCommande.belongsTo(models.Commande, {
        foreignKey: 'commandeId',
        as: 'commande',
      });

      LigneCommande.hasMany(models.LigneCommandeGarniture, {
        foreignKey: 'ligneCommandeId',
        as: 'ligneGarnitures',
      });

      // Relation avec Produit
      LigneCommande.belongsTo(models.Produit, {
        foreignKey: 'produitId',
        as: 'produit',
      });    }
    
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
      defaultValue: 1,
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
    timestamps: true,
  });
  return LigneCommande;
};