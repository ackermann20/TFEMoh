'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Produit extends Model {
    static associate(models) {
      // Un produit peut être dans plusieurs favoris et lignes de commande
      this.hasMany(models.Favoris, { foreignKey: 'produitId', as: 'favoris' });
      this.hasMany(models.LigneCommande, { foreignKey: 'produitId', as: 'ligneCommandes' });
    }
  }

  Produit.init({
    nom: DataTypes.STRING,             // Nom FR
    nom_en : DataTypes.STRING,         // Nom EN
    nom_nl : DataTypes.STRING,         // Nom NL
    prix: DataTypes.FLOAT,             // Prix normal
    disponible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true               // Produit visible ou non
    },
    description: DataTypes.TEXT,       // Description FR
    description_en: DataTypes.TEXT,    // Description EN
    description_nl: DataTypes.TEXT,    // Description NL
    prixPromo: {
      type: DataTypes.FLOAT,
      allowNull: true,                 // Prix promo si appliqué
      defaultValue: null
    },
    image: DataTypes.STRING,           // URL image
    type: DataTypes.STRING             // Exemple : viennoiserie, pain...
  }, {
    sequelize,
    modelName: 'Produit',
  });

  return Produit;
};
