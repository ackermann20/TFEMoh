import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Composant de route protégée réservé au rôle "boulanger".
 * Empêche l'accès aux routes boulanger si l'utilisateur n'est pas authentifié
 * ou n'a pas le rôle "boulanger".
 */
const ProtectedRouteBoulanger = ({ children }) => {
  // Récupération des informations utilisateur depuis le localStorage
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Si aucun utilisateur ou mauvais rôle, redirection vers la page d'accueil
  if (!userData || userData.role !== 'boulanger') {
    return <Navigate to="/" replace />;
  }

  // Sinon, affichage du composant enfant (route protégée)
  return children;
};

export default ProtectedRouteBoulanger;
