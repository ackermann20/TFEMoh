'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Utilisateur extends Model {
    static associate(models) {
      // Un utilisateur a plusieurs commandes et favoris
      this.hasMany(models.Commande, { foreignKey: 'utilisateurId', as: 'commandes' });
      this.hasMany(models.Favoris, { foreignKey: 'utilisateurId', as: 'favoris' });
    }
  }

  Utilisateur.init({
    nom: DataTypes.STRING,
    prenom: DataTypes.STRING,
    email: DataTypes.STRING,
    telephone: DataTypes.STRING,
    motDePasse: {
      type: DataTypes.STRING,
      field: 'motDePasse' // Nom de la colonne dans la BDD
    },
    role: DataTypes.STRING, // boulanger, client, etc.
    solde: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0 // Portefeuille virtuel
    }
  }, {
    sequelize,
    modelName: 'Utilisateur',
    tableName: 'utilisateurs',
  });

  return Utilisateur;
};
