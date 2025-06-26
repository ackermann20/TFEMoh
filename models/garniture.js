'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Garniture extends Model {
    /**
     * Une garniture peut apparaître dans plusieurs lignes de commande
     */
    static associate(models) {
      this.hasMany(models.LigneCommandeGarniture, { foreignKey: 'garnitureId', as: 'ligneCommandeGarnitures' });
    }
  }

  Garniture.init({
    nom: {
      type: DataTypes.STRING,
      allowNull: false, // Nom en français obligatoire
    },
    nom_en: {
      type: DataTypes.STRING,
      allowNull: true, // Nom en anglais
    },
    nom_nl: {
      type: DataTypes.STRING,
      allowNull: true, // Nom en néerlandais
    },
    prix: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0, // Prix de la garniture
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Garniture dispo ou non
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true, // URL de l'image de la garniture
    }

  }, {
    sequelize,
    modelName: 'Garniture',
  });

  return Garniture;
};
