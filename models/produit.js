'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Produit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Favoris, { foreignKey: 'produitId', as: 'favoris' });
      this.hasMany(models.Plainte, { foreignKey: 'produitId', as: 'plaintes' });
      this.hasMany(models.LigneCommande, { foreignKey: 'produitId', as: 'ligneCommandes' });
    }
    
  }
  Produit.init({
    nom: DataTypes.STRING,
    nom_en : DataTypes.STRING,
    nom_nl : DataTypes.STRING,

    prix: DataTypes.FLOAT,
    stock: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    description_en: DataTypes.TEXT,
    description_nl: DataTypes.TEXT,

    image: DataTypes.STRING,
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Produit',
  });
  return Produit;
};