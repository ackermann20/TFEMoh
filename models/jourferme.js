// Modèle pour enregistrer les jours où la boulangerie est fermée
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class JourFerme extends Model {}

  JourFerme.init({
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true, // Un jour ne peut être fermé qu'une seule fois
    }
  }, {
    sequelize,
    modelName: 'JourFerme',
  });

  return JourFerme;
};
