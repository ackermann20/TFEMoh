'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Plainte extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Utilisateur, { foreignKey: 'utilisateurId', as: 'utilisateur' });
      this.belongsTo(models.Commande, { foreignKey: 'commandeId', as: 'commande' });
      this.belongsTo(models.Produit, { foreignKey: 'produitId', as: 'produit' });
    }
    
  }
  Plainte.init({
    utilisateurId: DataTypes.INTEGER,
    commandeId: DataTypes.INTEGER,
    produitId: DataTypes.INTEGER,
    message: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Plainte',
  });
  return Plainte;
};