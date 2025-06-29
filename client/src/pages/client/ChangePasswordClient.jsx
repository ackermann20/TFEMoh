import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function ChangePasswordClient() {
 // Hook pour l'internationalisation
 const { t } = useTranslation();
 
 // États locaux pour gérer les champs du formulaire
 const [oldPassword, setOldPassword] = useState(''); // Mot de passe actuel
 const [newPassword, setNewPassword] = useState(''); // Nouveau mot de passe
 const [confirmPassword, setConfirmPassword] = useState(''); // Confirmation du nouveau mot de passe
 const [error, setError] = useState(''); // Message d'erreur à afficher
 const [success, setSuccess] = useState(''); // Message de succès à afficher

 // URL de base de l'API, utilise la variable d'environnement ou localhost par défaut
 const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

 // Fonction de gestion de la soumission du formulaire
 const handleSubmit = async (e) => {
   e.preventDefault(); // Empêche le rechargement de la page
   
   // Réinitialise les messages d'erreur et de succès
   setError('');
   setSuccess('');

   // Validation côté client : vérification que les nouveaux mots de passe correspondent
   if (newPassword !== confirmPassword) {
     setError(t('changePassword.error.mismatch'));
     return;
   }

   try {
     // Récupération du token d'authentification depuis le localStorage
     const token = localStorage.getItem("token");

     // Appel API pour changer le mot de passe
     const response = await axios.post(
       `${API_BASE_URL}/api/auth/change-password`,
       {
         userId: JSON.parse(localStorage.getItem('userData')).id, // ID de l'utilisateur connecté
         currentPassword: oldPassword, // Mot de passe actuel pour vérification
         newPassword: newPassword, // Nouveau mot de passe
       },
       {
         headers: {
           Authorization: `Bearer ${token}`, // Token JWT pour l'authentification
         },
       }
     );

     // Si la requête réussit, afficher le message de succès et vider les champs
     setSuccess(t('changePassword.success'));
     setOldPassword('');
     setNewPassword('');
     setConfirmPassword('');
   } catch (error) {
     console.error(error);
     
     // Gestion des erreurs selon le code de statut HTTP
     if (error.response && error.response.status === 400) {
       // Erreur 400 : mot de passe actuel incorrect
       setError(t('changePassword.error.incorrect'));
     } else {
       // Autres erreurs : message générique
       setError(t('changePassword.error.generic'));
     }
   }
 };

 return (
   <div className="min-h-screen bg-orange-50 p-8">
     {/* Conteneur principal centré avec style de carte */}
     <div className="max-w-md mx-auto bg-white shadow-md rounded-md p-6">
       {/* Titre de la page */}
       <h2 className="text-2xl font-bold text-center text-orange-800 mb-4">
         {t('changePassword.title')}
       </h2>
       
       {/* Affichage conditionnel des messages d'erreur */}
       {error && <div className="bg-red-100 text-red-800 p-2 rounded mb-4">{error}</div>}
       
       {/* Affichage conditionnel des messages de succès */}
       {success && <div className="bg-green-100 text-green-800 p-2 rounded mb-4">{success}</div>}
       
       {/* Formulaire de changement de mot de passe */}
       <form onSubmit={handleSubmit}>
         {/* Champ pour le mot de passe actuel */}
         <div className="mb-4">
           <label className="block font-medium text-gray-700">{t('changePassword.current')}</label>
           <input
             type="password"
             value={oldPassword}
             onChange={(e) => setOldPassword(e.target.value)}
             className="mt-1 p-2 w-full border rounded"
             required // Champ obligatoire
           />
         </div>
         
         {/* Champ pour le nouveau mot de passe */}
         <div className="mb-4">
           <label className="block font-medium text-gray-700">{t('changePassword.new')}</label>
           <input
             type="password"
             value={newPassword}
             onChange={(e) => setNewPassword(e.target.value)}
             className="mt-1 p-2 w-full border rounded"
             required // Champ obligatoire
           />
           {/* Texte d'aide pour les règles de mot de passe */}
           <p className="text-sm text-gray-500">{t('changePassword.rules')}</p>
         </div>
         
         {/* Champ de confirmation du nouveau mot de passe */}
         <div className="mb-6">
           <label className="block font-medium text-gray-700">{t('changePassword.confirm')}</label>
           <input
             type="password"
             value={confirmPassword}
             onChange={(e) => setConfirmPassword(e.target.value)}
             className="mt-1 p-2 w-full border rounded"
             required // Champ obligatoire
           />
         </div>
         
         {/* Boutons d'action */}
         <div className="flex justify-between">
           {/* Bouton d'annulation/réinitialisation */}
           <button
             type="button"
             onClick={() => {
               // Vide tous les champs et messages
               setOldPassword('');
               setNewPassword('');
               setConfirmPassword('');
               setError('');
               setSuccess('');
             }}
             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
           >
             {t('changePassword.cancel')}
           </button>
           
           {/* Bouton de soumission */}
           <button
             type="submit"
             className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
           >
             {t('changePassword.submit')}
           </button>
         </div>
       </form>
       
       {/* Section de conseils pour la sécurité des mots de passe */}
       <div className="mt-6 bg-orange-100 p-4 rounded text-sm text-orange-900">
         <h4 className="font-semibold">{t('changePassword.tips.title')}</h4>
         <ul className="list-disc list-inside mt-2 space-y-1">
           <li>{t('changePassword.tips.unique')}</li>
           <li>{t('changePassword.tips.mix')}</li>
           <li>{t('changePassword.tips.avoid')}</li>
           <li>{t('changePassword.tips.changeOften')}</li>
         </ul>
       </div>
     </div>
   </div>
 );
}

export default ChangePasswordClient;