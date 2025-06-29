import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import HeaderClient from '../../components/client/HeaderClient';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Trash2, X, Check } from 'lucide-react';

/**
 * Composant de profil utilisateur avec gestion des données personnelles
 * Interface complète pour modifier le profil, gérer les actions utilisateur
 * et supprimer le compte avec un processus de confirmation multi-étapes
 */
const ProfileClient = () => {
  const navigate = useNavigate(); // Hook pour la navigation programmatique
  
  // États pour la gestion des données utilisateur
  const [userData, setUserData] = useState({
    prenom: '',     // Prénom (lecture seule)
    nom: '',        // Nom (lecture seule)
    email: '',      // Email (lecture seule)
    telephone: ''   // Numéro de téléphone (modifiable)
  });
  
  // États pour la gestion de l'interface
  const [isEditing, setIsEditing] = useState(false); // Mode édition du téléphone
  const [message, setMessage] = useState({ text: '', type: '' }); // Messages de feedback utilisateur
  const [isLoading, setIsLoading] = useState(true); // État de chargement initial
  
  // État complexe pour la gestion du processus de suppression de compte
  const [deleteModal, setDeleteModal] = useState({
    step: 0,            // 0: fermé, 1: première confirmation, 2: deuxième confirmation, 3: confirmation finale
    password: '',       // Mot de passe pour confirmation finale
    confirmText: '',    // Texte de confirmation à saisir
    isDeleting: false   // État de suppression en cours
  });
  
  const { t } = useTranslation(); // Hook pour l'internationalisation

  // Configuration de l'URL de base de l'API
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  /**
   * useEffect pour vérifier l'authentification et charger les données utilisateur
   * Récupère les données depuis le localStorage et vérifie la validité du token
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Redirection si utilisateur non authentifié
    if (!token) {
      navigate('/login');
      return;
    }

    // Chargement des données utilisateur depuis le localStorage
    setIsLoading(true);
    try {
      let storedUserData = {};
      try {
        // Tentative de lecture des données utilisateur sérialisées
        storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      } catch (e) {
        console.error("Erreur lors de la lecture de userData:", e);
      }
      
      // Fusion des données depuis différentes sources du localStorage (compatibilité)
      setUserData({
        prenom: storedUserData.prenom || localStorage.getItem('userPrenom') || '',
        nom: storedUserData.nom || '',
        email: storedUserData.email || localStorage.getItem('email') || '',
        telephone: storedUserData.telephone || ''
      });
      
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ text: t('profile.cannotFetch'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [navigate]); // Dépendance sur navigate pour relancer si changement

  /**
   * Gestionnaire de changement pour le champ téléphone
   * Seul champ modifiable dans le profil
   * @param {Event} e - Événement de changement du champ
   */
  const handleChange = (e) => {
    setUserData(prev => ({
      ...prev,
      telephone: e.target.value // Mise à jour uniquement du téléphone
    }));
  };

  /**
   * Fonction de soumission du formulaire pour mettre à jour le téléphone
   * Effectue un appel API pour sauvegarder et met à jour le localStorage
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' }); // Effacement des messages précédents
  
    try {
      // Récupération des données utilisateur actuelles
      let storedUserData = {};
      try {
        storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      } catch (e) {
        console.error("Erreur lors de la lecture de userData:", e);
        setMessage({ text: 'Erreur lors de la récupération des données utilisateur', type: 'error' });
        return;
      }
      
      // Vérification de la présence de l'ID utilisateur
      if (!storedUserData.id) {
        setMessage({ text: t('profile.userIdMissing'), type: 'error' });
        return;
      }
  
      // Vérification du token d'authentification
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ text: t('profile.mustBeLoggedIn'), type: 'error' });
        return;
      }
  
      // Appel API pour mettre à jour le numéro de téléphone
      await axios.put(`${API_BASE_URL}/api/utilisateurs/${storedUserData.id}`, 
        { telephone: userData.telephone }, // Envoi uniquement du téléphone
        { headers: { Authorization: `Bearer ${token}` }} // Authentification JWT
      );
      
      // Mise à jour du localStorage avec les nouvelles données
      const updatedUserData = {
        ...storedUserData,
        telephone: userData.telephone
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      // Feedback utilisateur et sortie du mode édition
      setMessage({ text: t('profile.phoneUpdated'), type: 'success' });
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setMessage({ text: t('profile.updateError'), type: 'error' });
    }
  };

  /**
   * Fonction d'annulation des modifications
   * Restaure la valeur originale du téléphone depuis le localStorage
   */
  const handleCancel = () => {
    setIsEditing(false);
    
    // Rechargement des données depuis localStorage pour annuler les changements
    let storedUserData = {};
    try {
      storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    } catch (e) {
      console.error("Erreur lors de la lecture de userData:", e);
    }
    
    // Restauration de la valeur originale du téléphone
    setUserData(prev => ({
      ...prev,
      telephone: storedUserData.telephone || ''
    }));
  };

  /**
   * Fonction principale de suppression du compte utilisateur
   * Effectue l'appel API de suppression et nettoie le localStorage
   */
  const handleDeleteAccount = async () => {
    setDeleteModal(prev => ({ ...prev, isDeleting: true })); // Activation de l'état de suppression
    
    try {
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const token = localStorage.getItem('token');
      
      // Vérification des prérequis pour la suppression
      if (!token || !storedUserData.id) {
        setMessage({ text: 'Erreur d\'authentification', type: 'error' });
        return;
      }

      // Appel API pour supprimer le compte avec mot de passe
      await axios.delete(`${API_BASE_URL}/api/utilisateurs/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { 
          password: deleteModal.password,    // Mot de passe pour confirmation
          userId: storedUserData.id          // ID utilisateur pour sécurité
        }
      });

      // Nettoyage complet du localStorage après suppression réussie
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('userPrenom');
      localStorage.removeItem('email');

      // Redirection vers l'accueil avec message de confirmation
      navigate('/', { 
        state: { 
          message: 'Votre compte a été supprimé avec succès. Nous sommes désolés de vous voir partir.' 
        } 
      });

    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Erreur lors de la suppression du compte', 
        type: 'error' 
      });
      setDeleteModal(prev => ({ ...prev, isDeleting: false })); // Désactivation de l'état de suppression
    }
  };

  /**
   * Fonction de réinitialisation du modal de suppression
   * Remet tous les états du modal à leur valeur initiale
   */
  const resetDeleteModal = () => {
    setDeleteModal({
      step: 0,
      password: '',
      confirmText: '',
      isDeleting: false
    });
  };

  /**
   * Fonction pour passer à l'étape suivante du processus de suppression
   * Incrémente le compteur d'étapes jusqu'à un maximum de 3
   */
  const nextDeleteStep = () => {
    if (deleteModal.step < 3) {
      setDeleteModal(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  /**
   * Fonction de validation pour autoriser le passage à l'étape suivante
   * Vérifie les conditions spécifiques à chaque étape du processus
   * @returns {boolean} True si l'utilisateur peut procéder à l'étape suivante
   */
  const canProceedToNext = () => {
    switch (deleteModal.step) {
      case 1:
        return true; // Première confirmation, juste cliquer sur "continuer"
      case 2:
        // Deuxième étape : vérification du texte de confirmation exact
        return deleteModal.confirmText.toLowerCase() === 'supprimer mon compte';
      case 3:
        // Troisième étape : validation basique du mot de passe (longueur minimale)
        return deleteModal.password.length >= 6;
      default:
        return false;
    }
  };

  /**
   * Fonction utilitaire pour récupérer le solde utilisateur
   * Lit le solde depuis le localStorage avec gestion d'erreur
   * @returns {number} Solde de l'utilisateur ou 0 en cas d'erreur
   */
  const getUserSolde = () => {
    try {
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      return storedUserData.solde || 0;
    } catch (e) {
      return 0; // Valeur par défaut en cas d'erreur
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <HeaderClient />
      
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-amber-800 mb-6 text-center">{t('profile.title')}</h1>
        
        {/* Affichage conditionnel : spinner de chargement ou contenu */}
        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          </div>
        ) : (
          /* Carte principale du profil utilisateur */
          <div className="bg-white rounded-lg shadow-md p-6">
            
            {/* Affichage conditionnel des messages de feedback */}
            {message.text && (
              <div className={`p-4 mb-6 rounded-lg ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 
                message.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700'
              }`}>
                {message.text}
              </div>
            )}
            
            {/* Formulaire de modification du profil */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Champ Prénom (lecture seule) */}
                <div>
                  <label htmlFor="prenom" className="block text-gray-700 font-medium mb-2">
                    {t('profile.firstname')}
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={userData.prenom || ''}
                    disabled={true} // Toujours désactivé (non modifiable)
                    className="w-full p-3 border rounded-lg bg-gray-100 border-gray-200"
                  />
                </div>
                
                {/* Champ Nom (lecture seule) */}
                <div>
                  <label htmlFor="nom" className="block text-gray-700 font-medium mb-2">
                    {t('profile.lastname')}
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={userData.nom || ''}
                    disabled={true} // Toujours désactivé (non modifiable)
                    className="w-full p-3 border rounded-lg bg-gray-100 border-gray-200"
                  />
                </div>
                
                {/* Champ Email (lecture seule) */}
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    {t('profile.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email || ''}
                    disabled={true} // Toujours désactivé (non modifiable)
                    className="w-full p-3 border rounded-lg bg-gray-100 border-gray-200"
                  />
                </div>
                
                {/* Champ Téléphone (modifiable en mode édition) */}
                <div>
                  <label htmlFor="telephone" className="block text-gray-700 font-medium mb-2">
                    {t('profile.phone')}
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={userData.telephone || ''}
                    onChange={handleChange} // Gestionnaire de changement
                    disabled={!isEditing} // Activé uniquement en mode édition
                    className={`w-full p-3 border rounded-lg ${
                      isEditing 
                        ? 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200' // Style édition
                        : 'bg-gray-100 border-gray-200' // Style lecture seule
                    }`}
                  />
                </div>
              </div>
              
              {/* Boutons d'action conditionnels selon le mode */}
              <div className="mt-8 flex justify-center">
                {isEditing ? (
                  /* Boutons en mode édition : Annuler / Sauvegarder */
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel} // Annulation des modifications
                      className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition duration-300"
                    >
                      {t('profile.cancel')}
                    </button>
                    <button
                      type="submit" // Soumission du formulaire
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition duration-300"
                    >
                      {t('profile.save')}
                    </button>
                  </div>
                ) : (
                  /* Bouton en mode lecture : Modifier le téléphone */
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)} // Activation du mode édition
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition duration-300"
                  >
                    {t('profile.editPhone')}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        
        {/* Section des actions utilisateur (affichée après le chargement) */}
        {!isLoading && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-amber-800 mb-4">{t('profile.actions')}</h2>
            
            <div className="space-y-4">
              
              {/* Bouton vers la page des commandes */}
              <button
                onClick={() => navigate('/orders')}
                className="w-full p-3 bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 rounded-lg transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">📋</span> {t('profile.orders')}
              </button>
              
              {/* Bouton vers le changement de mot de passe */}
              <button
                onClick={() => navigate('/change-password')}
                className="w-full p-3 bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 rounded-lg transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">🔒</span> {t('profile.changePassword')}
              </button>
              
              {/* Bouton de déconnexion avec nettoyage du localStorage */}
              <button
                onClick={() => {
                  // Nettoyage complet des données de session
                  localStorage.removeItem('token');
                  localStorage.removeItem('userData');
                  localStorage.removeItem('userPrenom');
                  localStorage.removeItem('email');
                  navigate('/');
                  window.location.reload(); // Rechargement pour réinitialiser l'état
                }}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">🚪</span> {t('profile.logout')}
              </button>

              {/* Bouton de suppression de compte (démarrage du processus multi-étapes) */}
              <button
                onClick={() => setDeleteModal(prev => ({ ...prev, step: 1 }))} // Démarrage à l'étape 1
                className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-300 flex items-center justify-center"
              >
                <Trash2 className="mr-2 w-5 h-5" />
                Supprimer mon compte
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de suppression de compte (processus multi-étapes) */}
      {deleteModal.step > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Bouton de fermeture du modal */}
            <button
              onClick={resetDeleteModal} // Fermeture et réinitialisation
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              disabled={deleteModal.isDeleting} // Désactivé pendant la suppression
            >
              <X className="w-6 h-6" />
            </button>

            {/* Étape 1: Première confirmation avec avertissements */}
            {deleteModal.step === 1 && (
              <div>
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
                  <h3 className="text-xl font-bold text-red-700">
                    Attention ! Suppression de compte
                  </h3>
                </div>
                
                <div className="mb-6 space-y-3 text-gray-700">
                  <p className="font-semibold">
                    Vous êtes sur le point de supprimer définitivement votre compte.
                  </p>
                  
                  {/* Zone d'avertissement avec conséquences détaillées */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">
                      ⚠️ Cette action est irréversible et entraînera :
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-red-700">
                      <li>La suppression définitive de toutes vos données</li>
                      <li>L'annulation de toutes vos commandes en cours</li>
                      <li>La perte de votre solde actuel : <strong>{getUserSolde().toFixed(2)} €</strong></li>
                      <li>L'impossibilité de récupérer votre compte</li>
                    </ul>
                  </div>

                  <p className="text-sm text-gray-600">
                    Si vous souhaitez simplement vous déconnecter temporairement, 
                    utilisez le bouton "Se déconnecter" à la place.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={resetDeleteModal} // Annulation complète
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={nextDeleteStep} // Passage à l'étape suivante
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-300"
                  >
                    Je comprends, continuer
                  </button>
                </div>
              </div>
            )}

            {/* Étape 2: Confirmation par saisie d'un texte spécifique */}
            {deleteModal.step === 2 && (
              <div>
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
                  <h3 className="text-xl font-bold text-red-700">
                    Confirmation de suppression
                  </h3>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    Pour continuer, veuillez taper exactement le texte suivant :
                  </p>
                  
                  {/* Affichage du texte à reproduire */}
                  <div className="bg-gray-100 p-3 rounded-lg mb-4">
                    <code className="font-mono text-lg font-semibold">
                      SUPPRIMER MON COMPTE
                    </code>
                  </div>
                  
                  {/* Champ de saisie pour la confirmation */}
                  <input
                    type="text"
                    value={deleteModal.confirmText}
                    onChange={(e) => setDeleteModal(prev => ({ 
                      ...prev, 
                      confirmText: e.target.value 
                    }))}
                    placeholder="Tapez ici..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  
                  {/* Message d'erreur si le texte ne correspond pas */}
                  {deleteModal.confirmText && deleteModal.confirmText.toLowerCase() !== 'supprimer mon compte' && (
                    <p className="text-red-600 text-sm mt-2">
                      Le texte ne correspond pas exactement.
                    </p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setDeleteModal(prev => ({ ...prev, step: 1 }))} // Retour étape précédente
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition duration-300"
                  >
                    Retour
                  </button>
                  <button
                    onClick={nextDeleteStep} // Passage étape suivante
                    disabled={!canProceedToNext()} // Désactivé si validation échoue
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition duration-300"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* Étape 3: Confirmation finale par mot de passe */}
            {deleteModal.step === 3 && (
              <div>
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
                  <h3 className="text-xl font-bold text-red-700">
                    Dernière étape
                  </h3>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    Entrez votre mot de passe pour confirmer la suppression définitive :
                  </p>
                  
                  {/* Champ de saisie du mot de passe */}
                  <input
                    type="password"
                    value={deleteModal.password}
                    onChange={(e) => setDeleteModal(prev => ({ 
                      ...prev, 
                      password: e.target.value 
                    }))}
                    placeholder="Mot de passe"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  
                  {/* Avertissement final très visible */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <p className="text-red-800 font-semibold text-center">
                      🚨 DERNIÈRE CHANCE 🚨
                    </p>
                    <p className="text-red-700 text-center mt-1">
                      Votre compte et toutes vos données seront définitivement supprimés !
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setDeleteModal(prev => ({ ...prev, step: 2 }))} // Retour étape précédente
                    disabled={deleteModal.isDeleting} // Désactivé pendant suppression
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 rounded-lg transition duration-300"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleDeleteAccount} // Exécution de la suppression
                    disabled={!canProceedToNext() || deleteModal.isDeleting} // Désactivé si conditions non remplies
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition duration-300 flex items-center justify-center"
                  >
                    {deleteModal.isDeleting ? (
                      // Affichage pendant la suppression
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Suppression...
                      </>
                    ) : (
                      // Affichage normal
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        SUPPRIMER DÉFINITIVEMENT
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileClient;