import { Navigate } from 'react-router-dom';

/**
 * Composant de protection de route pour les utilisateurs NON authentifiés
 * 
 * Ce composant est utilisé pour protéger les pages qui ne doivent être accessibles
 * qu'aux utilisateurs non connectés (comme les pages de login, register, etc.)
 * 
 * Fonctionnement :
 * - Si l'utilisateur EST connecté (token présent) → Redirection vers l'accueil
 * - Si l'utilisateur N'EST PAS connecté (pas de token) → Affichage du contenu demandé
 * 
 * Cas d'usage typiques :
 * - Page de connexion (/login)
 * - Page d'inscription (/register) 
 * - Page de récupération de mot de passe (/forgot-password)
 * 
 * @param {Object} props - Props du composant
 * @param {React.ReactNode} props.children - Contenu à afficher si l'utilisateur n'est pas connecté
 * @returns {React.ReactElement} Soit le contenu demandé, soit une redirection
 */
const RequireNoAuth = ({ children }) => {
  // Vérification de la présence d'un token d'authentification dans le localStorage
  // Le token indique si l'utilisateur est actuellement connecté
  const token = localStorage.getItem("token");
  
  // Logique de protection :
  // - Si token existe (utilisateur connecté) → Redirection vers l'accueil "/"
  // - Si pas de token (utilisateur non connecté) → Affichage du contenu (children)
  return token ? <Navigate to="/" /> : children;
};

export default RequireNoAuth;