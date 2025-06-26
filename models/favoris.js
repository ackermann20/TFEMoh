'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Favoris extends Model {
    /**
     * Associations entre les modèles
     */
    static associate(models) {
      // Le favori appartient à un utilisateur
      this.belongsTo(models.Utilisateur, { foreignKey: 'utilisateurId', as: 'utilisateur' });
      // Le favori est lié à un produit
      this.belongsTo(models.Produit, { foreignKey: 'produitId', as: 'produit' });
    }
  }

  // Champs du modèle Favoris
  Favoris.init({
    utilisateurId: {
      type: DataTypes.INTEGER,
      allowNull: false, // L'utilisateur est requis
    },
    produitId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Le produit est requis
    },
  }, {
    sequelize,
    modelName: 'Favoris',
  });

  return Favoris;
};
