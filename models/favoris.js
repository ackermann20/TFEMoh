'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Favoris extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Utilisateur, { foreignKey: 'utilisateurId', as: 'utilisateur' });
      this.belongsTo(models.Produit, { foreignKey: 'produitId', as: 'produit' });
    }
    
  }
  Favoris.init({
    utilisateurId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    produitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Favoris',
  });
  return Favoris;
};