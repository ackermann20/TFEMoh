'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Utilisateur extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un utilisateur peut avoir plusieurs commandes
      this.hasMany(models.Commande, { foreignKey: 'utilisateurId', as: 'commandes' });

      // Un utilisateur peut avoir plusieurs favoris
      this.hasMany(models.Favoris, { foreignKey: 'utilisateurId', as: 'favoris' });

      // Un utilisateur peut déposer plusieurs plaintes
      this.hasMany(models.Plainte, { foreignKey: 'utilisateurId', as: 'plaintes' });
    }

    
  }
  Utilisateur.init({
    nom: DataTypes.STRING,
    prenom: DataTypes.STRING,
    email: DataTypes.STRING,
    telephone: DataTypes.STRING,
    motDePasse: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Utilisateur',
  });
  return Utilisateur;
};