// Modèle pour stocker les messages envoyés via le formulaire de contact
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('contactMessage', {
    nom: DataTypes.STRING,             // Nom de l'expéditeur
    prenom: DataTypes.STRING,         // Prénom de l'expéditeur
    email: DataTypes.STRING,          // Email de contact
    telephone: DataTypes.STRING,      // Numéro de téléphone
    objet: DataTypes.STRING,          // Sujet du message
    message: DataTypes.TEXT,          // Contenu du message
    utilisateurId: DataTypes.INTEGER, // Optionnel : ID de l'utilisateur connecté
  });
};
