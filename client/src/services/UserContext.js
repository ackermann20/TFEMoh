import { createContext } from 'react';

/**
 * Contexte utilisateur global :
 * Permet de partager l'état de l'utilisateur (user) dans toute l'application
 * sans avoir besoin de passer les props manuellement à chaque niveau.
 *
 * - user : objet représentant l'utilisateur connecté (ou null si déconnecté)
 * - setUser : fonction pour mettre à jour l'utilisateur
 */
export const UserContext = createContext({
  user: null,
  setUser: () => {},
});
