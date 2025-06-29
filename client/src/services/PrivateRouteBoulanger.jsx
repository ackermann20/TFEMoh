import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Composant de route protégée :
 * Empêche l'accès aux routes réservées au boulanger si l'utilisateur
 * n'est pas connecté ou n'a pas le rôle "boulanger".
 */
const PrivateRouteBoulanger = ({ children }) => {
  // Récupération des informations utilisateur depuis le localStorage
  const userData = JSON.parse(localStorage.getItem('userData'));

  // Si aucun utilisateur ou mauvais rôle → redirection vers /login
  if (!userData || userData.role !== 'boulanger') {
    return <Navigate to="/login" replace />;
  }

  // Sinon, affichage du composant enfant (route protégée)
  return children;
};

export default PrivateRouteBoulanger;
