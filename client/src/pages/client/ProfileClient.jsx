import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import HeaderClient from '../../components/client/HeaderClient';

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
      setMessage({ text: 'Impossible de récupérer les informations utilisateur', type: 'error' });
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
        setMessage({ text: 'ID utilisateur manquant', type: 'error' });
        return;
      }
  
      // Mettre à jour le téléphone dans la base de données
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ text: 'Vous devez être connecté pour effectuer cette action', type: 'error' });
        return;
      }
  
      // Faire l'appel à l'API pour mettre à jour le numéro de téléphone
      await axios.put(`http://localhost:3000/api/utilisateurs/${storedUserData.id}`, 
        { telephone: userData.telephone },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Mettre à jour les données dans localStorage
      const updatedUserData = {
        ...storedUserData,
        telephone: userData.telephone
      };
      
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      setMessage({ text: 'Numéro de téléphone mis à jour avec succès !', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setMessage({ text: 'Erreur lors de la mise à jour du profil dans la base de données', type: 'error' });
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

  return (
    <div className="min-h-screen bg-amber-50">
      <HeaderClient />
      
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-amber-800 mb-6 text-center">Mon Profil</h1>
        
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
                  <label htmlFor="prenom" className="block text-gray-700 font-medium mb-2">Prénom</label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={userData.prenom || ''}
                    disabled={true} // Toujours désactivé
                    className="w-full p-3 border rounded-lg bg-gray-100 border-gray-200"
                  />
                </div>
                
                <div>
                  <label htmlFor="nom" className="block text-gray-700 font-medium mb-2">Nom</label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={userData.nom || ''}
                    disabled={true} // Toujours désactivé
                    className="w-full p-3 border rounded-lg bg-gray-100 border-gray-200"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email || ''}
                    disabled={true} // Toujours désactivé
                    className="w-full p-3 border rounded-lg bg-gray-100 border-gray-200"
                  />
                </div>
                
                <div>
                  <label htmlFor="telephone" className="block text-gray-700 font-medium mb-2">Téléphone</label>
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
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition duration-300"
                    >
                      Enregistrer
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition duration-300"
                  >
                    Modifier mon numéro de téléphone
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        
        {!isLoading && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-amber-800 mb-4">Actions</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => navigate('/orders')}
                className="w-full p-3 bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 rounded-lg transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">📋</span> Voir mes commandes
              </button>
              
              <button
                onClick={() => navigate('/change-password')}
                className="w-full p-3 bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 rounded-lg transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">🔒</span> Changer mon mot de passe
              </button>
              
              <button
                onClick={() => {
                  // Logique de déconnexion
                  localStorage.removeItem('token');
                  localStorage.removeItem('userData');
                  localStorage.removeItem('userPrenom');
                  localStorage.removeItem('email');
                  navigate('/');
                  window.location.reload();
                }}
                className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">🚪</span> Se déconnecter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileClient;