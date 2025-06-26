'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LigneCommandeGarniture extends Model {
    static associate(models) {
      // Chaque entrée appartient à une ligne de commande
      LigneCommandeGarniture.belongsTo(models.LigneCommande, {
        foreignKey: 'ligneCommandeId',
        as: 'ligneCommande',
      });

      // Et à une garniture
      LigneCommandeGarniture.belongsTo(models.Garniture, {
        foreignKey: 'garnitureId',
        as: 'garniture',
      });
    }
  }

  LigneCommandeGarniture.init({
    ligneCommandeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    garnitureId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    typePain: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'blanc' // Type de pain choisi par le client
    }
  }, {
    sequelize,
    modelName: 'LigneCommandeGarniture',
  });

  return LigneCommandeGarniture;
};
