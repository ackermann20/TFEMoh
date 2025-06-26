import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import HeaderClient from '../../components/client/HeaderClient';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Trash2, X, Check } from 'lucide-react';

const ProfileClient = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    step: 0, // 0: fermé, 1: première confirmation, 2: deuxième confirmation, 3: confirmation finale
    password: '',
    confirmText: '',
    isDeleting: false
  });
  const { t } = useTranslation();

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";


  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Récupérer les données directement depuis localStorage
    setIsLoading(true);
    try {
      let storedUserData = {};
      try {
        storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      } catch (e) {
        console.error("Erreur lors de la lecture de userData:", e);
      }
      
      // Utiliser les données disponibles
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
  }, [navigate]);

  // Gérer uniquement les changements du numéro de téléphone
  const handleChange = (e) => {
    setUserData(prev => ({
      ...prev,
      telephone: e.target.value
    }));
  };

  // Dans la fonction handleSubmit du composant ProfileClient
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
  
    try {
      // Récupérer les données actuelles de localStorage
      let storedUserData = {};
      try {
        storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      } catch (e) {
        console.error("Erreur lors de la lecture de userData:", e);
        setMessage({ text: 'Erreur lors de la récupération des données utilisateur', type: 'error' });
        return;
      }
      
      if (!storedUserData.id) {
        setMessage({ text: t('profile.userIdMissing'), type: 'error' });
        return;
      }
  
      // Mettre à jour le téléphone dans la base de données
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ text: t('profile.mustBeLoggedIn'), type: 'error' });
        return;
      }
  
      // Faire l'appel à l'API pour mettre à jour le numéro de téléphone
      await axios.put(`${API_BASE_URL}/api/utilisateurs/${storedUserData.id}`, 
        { telephone: userData.telephone },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Mettre à jour les données dans localStorage
      const updatedUserData = {
        ...storedUserData,
        telephone: userData.telephone
      };
      
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      setMessage({ text: t('profile.phoneUpdated'), type: 'success' });
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setMessage({ text: t('profile.updateError'), type: 'error' });
    }
  };

  // Annuler les modifications
  const handleCancel = () => {
    setIsEditing(false);
    
    // Recharger les données depuis localStorage
    let storedUserData = {};
    try {
      storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    } catch (e) {
      console.error("Erreur lors de la lecture de userData:", e);
    }
    
    setUserData(prev => ({
      ...prev,
      telephone: storedUserData.telephone || ''
    }));
  };

  // Gérer la suppression du compte
  const handleDeleteAccount = async () => {
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    
    try {
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const token = localStorage.getItem('token');
      
      if (!token || !storedUserData.id) {
        setMessage({ text: 'Erreur d\'authentification', type: 'error' });
        return;
      }

      // Appel API pour supprimer le compte
      await axios.delete(`${API_BASE_URL}/api/utilisateurs/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { 
          password: deleteModal.password,
          userId: storedUserData.id 
        }
      });

      // Nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('userPrenom');
      localStorage.removeItem('email');

      // Rediriger vers la page d'accueil avec un message
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
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Réinitialiser le modal de suppression
  const resetDeleteModal = () => {
    setDeleteModal({
      step: 0,
      password: '',
      confirmText: '',
      isDeleting: false
    });
  };

  // Passer à l'étape suivante de suppression
  const nextDeleteStep = () => {
    if (deleteModal.step < 3) {
      setDeleteModal(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  // Valider l'étape actuelle
  const canProceedToNext = () => {
    switch (deleteModal.step) {
      case 1:
        return true; // Première confirmation, juste cliquer
      case 2:
        return deleteModal.confirmText.toLowerCase() === 'supprimer mon compte';
      case 3:
        return deleteModal.password.length >= 6; // Validation basique du mot de passe
      default:
        return false;
    }
  };

  // Récupérer le solde depuis localStorage
  const getUserSolde = () => {
    try {
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      return storedUserData.solde || 0;
    } catch (e) {
      return 0;
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <HeaderClient />
      
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-amber-800 mb-6 text-center">{t('profile.title')}</h1>
        
        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            {message.text && (
              <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : message.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="prenom" className="block text-gray-700 font-medium mb-2">{t('profile.firstname')}</label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={userData.prenom || ''}
                    disabled={true}
                    className="w-full p-3 border rounded-lg bg-gray-100 border-gray-200"
                  />
                </div>
                
                <div>
                  <label htmlFor="nom" className="block text-gray-700 font-medium mb-2">{t('profile.lastname')}</label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={userData.nom || ''}
                    disabled={true}
                    className="w-full p-3 border rounded-lg bg-gray-100 border-gray-200"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">{t('profile.email')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email || ''}
                    disabled={true}
                    className="w-full p-3 border rounded-lg bg-gray-100 border-gray-200"
                  />
                </div>
                
                <div>
                  <label htmlFor="telephone" className="block text-gray-700 font-medium mb-2">{t('profile.phone')}</label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={userData.telephone || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full p-3 border rounded-lg ${isEditing ? 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200' : 'bg-gray-100 border-gray-200'}`}
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                {isEditing ? (
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition duration-300"
                    >
                      {t('profile.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition duration-300"
                    >
                      {t('profile.save')}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition duration-300"
                  >
                    {t('profile.editPhone')}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        
        {!isLoading && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-amber-800 mb-4">{t('profile.actions')}</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => navigate('/orders')}
                className="w-full p-3 bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 rounded-lg transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">📋</span> {t('profile.orders')}
              </button>
              
              <button
                onClick={() => navigate('/change-password')}
                className="w-full p-3 bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 rounded-lg transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">🔒</span> {t('profile.changePassword')}
              </button>
              
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('userData');
                  localStorage.removeItem('userPrenom');
                  localStorage.removeItem('email');
                  navigate('/');
                  window.location.reload();
                }}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">🚪</span> {t('profile.logout')}
              </button>

              {/* Bouton de suppression de compte */}
              <button
                onClick={() => setDeleteModal(prev => ({ ...prev, step: 1 }))}
                className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-300 flex items-center justify-center"
              >
                <Trash2 className="mr-2 w-5 h-5" />
                Supprimer mon compte
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de suppression de compte */}
      {deleteModal.step > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Bouton fermer */}
            <button
              onClick={resetDeleteModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              disabled={deleteModal.isDeleting}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Étape 1: Première confirmation */}
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
                    onClick={resetDeleteModal}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={nextDeleteStep}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-300"
                  >
                    Je comprends, continuer
                  </button>
                </div>
              </div>
            )}

            {/* Étape 2: Confirmation par texte */}
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
                  
                  <div className="bg-gray-100 p-3 rounded-lg mb-4">
                    <code className="font-mono text-lg font-semibold">
                      SUPPRIMER MON COMPTE
                    </code>
                  </div>
                  
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
                  
                  {deleteModal.confirmText && deleteModal.confirmText.toLowerCase() !== 'supprimer mon compte' && (
                    <p className="text-red-600 text-sm mt-2">
                      Le texte ne correspond pas exactement.
                    </p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setDeleteModal(prev => ({ ...prev, step: 1 }))}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition duration-300"
                  >
                    Retour
                  </button>
                  <button
                    onClick={nextDeleteStep}
                    disabled={!canProceedToNext()}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition duration-300"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* Étape 3: Confirmation par mot de passe */}
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
                    onClick={() => setDeleteModal(prev => ({ ...prev, step: 2 }))}
                    disabled={deleteModal.isDeleting}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 rounded-lg transition duration-300"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={!canProceedToNext() || deleteModal.isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition duration-300 flex items-center justify-center"
                  >
                    {deleteModal.isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Suppression...
                      </>
                    ) : (
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