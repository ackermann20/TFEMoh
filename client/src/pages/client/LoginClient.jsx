import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeaderClient from '../../components/client/HeaderClient';
import axios from 'axios';
import jwtDecode from "jwt-decode";
import { useTranslation } from 'react-i18next';

/**
 * Composant de connexion pour les clients et boulangers
 * Interface moderne avec design glassmorphism et animations
 * Gère l'authentification JWT et la redirection selon le rôle utilisateur
 */
const LoginClient = () => {
  // États pour la gestion du formulaire de connexion
  const [email, setEmail] = useState(''); // Adresse email saisie par l'utilisateur
  const [motDePasse, setMotDePasse] = useState(''); // Mot de passe saisi par l'utilisateur
  const [erreur, setErreur] = useState(''); // Message d'erreur à afficher en cas d'échec
  const [showPassword, setShowPassword] = useState(false); // Contrôle la visibilité du mot de passe
  const [isLoading, setIsLoading] = useState(false); // État de chargement pendant la requête d'authentification
  
  // Hooks pour la navigation et l'internationalisation
  const navigate = useNavigate(); // Hook pour la navigation programmatique
  const { t } = useTranslation(); // Hook pour les traductions

  // Configuration de l'URL de base de l'API (variable d'environnement ou localhost par défaut)
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  /**
   * Gestionnaire de soumission du formulaire de connexion
   * Effectue l'authentification via l'API et gère la redirection selon le rôle
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleLogin = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setIsLoading(true); // Active l'état de chargement
    setErreur(''); // Efface les erreurs précédentes
    
    try {
      // Appel API pour l'authentification
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        motDePasse
      });
      
      // Extraction du token JWT et des données utilisateur depuis la réponse
      const { token, utilisateur } = response.data;
      
      // Stockage sécurisé des données d'authentification dans le localStorage
      localStorage.setItem("token", token); // Token JWT pour les futures requêtes
      localStorage.setItem("userData", JSON.stringify(utilisateur)); // Données utilisateur sérialisées
      
      // Redirection conditionnelle selon le rôle de l'utilisateur
      if (utilisateur.role === "boulanger") {
        navigate("/boulanger"); // Redirection vers le tableau de bord boulanger
      } else {
        navigate("/"); // Redirection vers l'accueil client
      }
    } catch (err) {
      // Gestion des erreurs de connexion
      console.error("Erreur lors de la connexion :", err); // Log pour le debugging
      setErreur(t("erreurConnexion")); // Affichage d'un message d'erreur traduit
    } finally {
      setIsLoading(false); // Désactivation de l'état de chargement dans tous les cas
    }
  };

  /**
   * Gestionnaire de navigation vers la page de récupération de mot de passe
   */
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  /**
   * Gestionnaire de navigation vers la page d'inscription
   */
  const handleCreateAccount = () => {
    navigate('/register');
  };

  return (
    <>
      {/* Composant header de navigation */}
      <HeaderClient />
      
      {/* Container principal avec design dégradé et éléments décoratifs */}
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 relative overflow-hidden">
        
        {/* Éléments décoratifs d'arrière-plan - Design glassmorphism */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Cercle décoratif en haut à droite */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/30 to-orange-300/30 rounded-full blur-3xl"></div>
          {/* Cercle décoratif en bas à gauche */}
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-amber-300/20 to-yellow-200/20 rounded-full blur-3xl"></div>
          {/* Cercle décoratif animé au centre */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-orange-200/40 to-amber-200/40 rounded-full blur-2xl animate-pulse"></div>
        </div>
        
        {/* Container principal du formulaire avec z-index élevé */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            
            {/* Header avec logo et titre de bienvenue */}
            <div className="text-center mb-8">
              {/* Logo avec icône Sparkles et effet hover */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              {/* Titre principal avec effet de texte dégradé */}
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {t("Bienvenue")} {/* Titre traduit */}
              </h1>
              <p className="text-gray-600 mt-2">{t("connectezVous")}</p> {/* Sous-titre traduit */}
            </div>

            {/* Carte de connexion avec effet glassmorphism */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
              
              {/* Formulaire de connexion */}
              <form onSubmit={handleLogin} className="space-y-6">
                
                {/* Champ Email avec icône et validation */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-500" /> {/* Icône email */}
                    {t("email")} {/* Label traduit */}
                  </label>
                  <div className="relative">
                    <input
                      type="email" // Type email pour validation HTML5
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} // Mise à jour de l'état en temps réel
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                      placeholder="votreemail@exemple.com" // Placeholder informatif
                      required // Champ obligatoire
                    />
                  </div>
                </div>

                {/* Champ Mot de passe avec toggle de visibilité */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500" /> {/* Icône cadenas */}
                    {t("motDePasse")} {/* Label traduit */}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} // Type conditionnel selon l'état de visibilité
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)} // Mise à jour de l'état en temps réel
                      className="w-full px-4 py-3 pr-12 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                      placeholder="********" // Placeholder masqué
                      required // Champ obligatoire
                    />
                    {/* Bouton toggle pour afficher/masquer le mot de passe */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)} // Inversion de l'état de visibilité
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-500 transition-colors duration-200"
                    >
                      {/* Icône conditionnelle selon l'état de visibilité */}
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Message d'erreur conditionnel avec animation */}
                {erreur && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-fadeIn">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {/* Icône d'alerte */}
                    <p className="text-sm">{erreur}</p> {/* Message d'erreur */}
                  </div>
                )}

                {/* Bouton de soumission avec état de chargement */}
                <button
                  type="submit"
                  disabled={isLoading} // Désactivation pendant le chargement
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    // Affichage conditionnel pendant le chargement
                    <div className="flex items-center justify-center gap-2">
                      {/* Spinner de chargement */}
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {t("chargementConnexion")} {/* Texte de chargement traduit */}
                    </div>
                  ) : (
                    t("seConnecter") // Texte normal traduit
                  )}
                </button>

                {/* Section des liens de navigation */}
                <div className="space-y-3 pt-4">
                  {/* Lien vers la récupération de mot de passe */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleForgotPassword} // Navigation vers forgot-password
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium hover:underline transition-colors duration-200"
                    >
                      {t("motDePasseOublie")} {/* Texte traduit */}
                    </button>
                  </div>
                  
                  {/* Séparateur visuel "ou" */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div> {/* Ligne horizontale */}
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">{t("ou")}</span> {/* Texte "ou" centré */}
                    </div>
                  </div>

                  {/* Lien vers la création de compte */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleCreateAccount} // Navigation vers register
                      className="text-sm text-gray-600 hover:text-amber-600 transition-colors duration-200"
                    >
                      {t("pasEncoreDeCompte")} {/* Première partie du texte */}
                      <span className="font-semibold text-amber-600 hover:text-amber-700 ml-1">
                        {t("creerCompte")} {/* Deuxième partie mise en valeur */}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer avec texte informatif */}
            <div className="text-center mt-8 text-sm text-gray-500">
              <p>{t("footer")}</p> {/* Texte de footer traduit */}
            </div>
          </div>
        </div>

        {/* Styles CSS-in-JS pour les animations personnalisées */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); } /* État initial : invisible et décalé vers le haut */
            to { opacity: 1; transform: translateY(0); } /* État final : visible et en position normale */
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out; /* Application de l'animation fadeIn */
          }
        `}</style>
      </div>
    </>
  );
};

export default LoginClient;