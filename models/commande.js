'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Commande extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Utilisateur, { foreignKey: 'utilisateurId', as: 'utilisateur' });
      this.hasMany(models.LigneCommande, { foreignKey: 'commandeId', as: 'ligneCommandes' });
    }
    
  }
  Commande.init({
    utilisateurId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dateCommande: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    dateRetrait: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    trancheHoraireRetrait: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    statut: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'en attente',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Commande',
    tableName: 'Commandes',
    timestamps: true,
  });
  return Commande;
};