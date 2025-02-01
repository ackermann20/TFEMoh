'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Garniture extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.LigneCommandeGarniture, { foreignKey: 'garnitureId', as: 'ligneCommandeGarnitures' });
    }
    
  }
  Garniture.init({
    nom: DataTypes.STRING,
    prix: DataTypes.FLOAT,
    stock: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Garniture',
  });
  return Garniture;
};