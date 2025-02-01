'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LigneCommandeGarniture extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relation avec LigneCommande
      LigneCommandeGarniture.belongsTo(models.LigneCommande, {
        foreignKey: 'ligneCommandeId',
        as: 'ligneCommande',
      });

      // Relation avec Garniture
      LigneCommandeGarniture.belongsTo(models.Garniture, {
        foreignKey: 'garnitureId',
        as: 'garniture',
      });
    }
    
  }
  LigneCommandeGarniture.init(
    {
      ligneCommandeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      garnitureId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    }, {
    sequelize,
    modelName: 'LigneCommandeGarniture',
  });
  return LigneCommandeGarniture;
};