'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sandwich extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Sandwich.belongsTo(models.Produit, {
        foreignKey: 'produitId',
        as: 'produit',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    
    }
  }
  Sandwich.init(
    {
      produitId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      prixBase: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
    sequelize,
    modelName: 'Sandwich',
  });
  return Sandwich;
};