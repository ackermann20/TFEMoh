import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderClient from '../../components/client/HeaderClient';
import { useTranslation } from 'react-i18next';

const ContactClient = () => {
 // Hook pour l'internationalisation
 const { t } = useTranslation();
 
 // État pour gérer les données du formulaire de contact
 const [formData, setFormData] = useState({
   nom: '',         // Nom de famille
   prenom: '',      // Prénom
   email: '',       // Adresse e-mail
   telephone: '',   // Numéro de téléphone
   objet: '',       // Objet/sujet du message
   message: ''      // Contenu du message
 });

 // États pour gérer les retours utilisateur
 const [success, setSuccess] = useState(false); // Indicateur de succès d'envoi
 const [error, setError] = useState('');        // Message d'erreur à afficher

 // Effect pour pré-remplir le formulaire avec les données utilisateur stockées
 useEffect(() => {
   const userData = JSON.parse(localStorage.getItem('userData'));
   if (userData) {
     // Mise à jour du formulaire avec les données utilisateur existantes
     setFormData(prev => ({
       ...prev,
       nom: userData.nom || '',
       prenom: userData.prenom || '',
       email: userData.email || '',
       telephone: userData.telephone || ''
       // Note: objet et message restent vides pour chaque nouveau contact
     }));
   }
 }, []);

 // Fonction pour gérer les changements dans les champs du formulaire
 const handleChange = (e) => {
   const { name, value } = e.target;
   // Mise à jour de l'état avec la nouvelle valeur du champ modifié
   setFormData(prev => ({ ...prev, [name]: value }));
 };

 // Fonction pour gérer la soumission du formulaire
 const handleSubmit = async (e) => {
   e.preventDefault(); // Empêche le rechargement de la page
   
   try {
     // Envoi du message de contact via l'API
     await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/contact`, {
       ...formData, // Toutes les données du formulaire
       // Ajout de l'ID utilisateur si disponible (pour lier le message à un compte)
       utilisateurId: JSON.parse(localStorage.getItem('userData') || '{}')?.id || null
     });

     // Mise à jour des états en cas de succès
     setSuccess(true);
     setError('');
     // Réinitialisation du formulaire (garde les infos personnelles pré-remplies)
     setFormData({ nom: '', prenom: '', email: '', telephone: '', objet: '', message: '' });
     
   } catch (err) {
     console.error(err);
     // Affichage d'un message d'erreur en cas d'échec
     setError(t('erreurMessage'));
   }
 };

 return (
   <div className="min-h-screen bg-amber-50">
     {/* En-tête de l'application client */}
     <HeaderClient />
     
     {/* Conteneur principal du formulaire de contact */}
     <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded mt-6">
       {/* Titre de la page avec emoji et traduction */}
       <h1 className="text-3xl font-bold mb-6 text-amber-800 text-center">📩 {t('contact')}</h1>

       {/* Affichage conditionnel du message de succès */}
       {success && (
         <div className="mb-4 text-green-600 font-medium">{t('messageEnvoye')}</div>
       )}
       
       {/* Affichage conditionnel du message d'erreur */}
       {error && (
         <div className="mb-4 text-red-600 font-medium">{error}</div>
       )}

       {/* Formulaire de contact */}
       <form onSubmit={handleSubmit} className="space-y-4">
         {/* Ligne avec prénom et nom côte à côte */}
         <div className="flex gap-4">
           <input
             type="text"
             name="prenom"
             value={formData.prenom}
             onChange={handleChange}
             placeholder={t('prenom')}
             required // Champ obligatoire
             className="w-1/2 p-2 border rounded"
           />
           <input
             type="text"
             name="nom"
             value={formData.nom}
             onChange={handleChange}
             placeholder={t('nom')}
             required // Champ obligatoire
             className="w-1/2 p-2 border rounded"
           />
         </div>

         {/* Champ e-mail */}
         <input
           type="email"
           name="email"
           value={formData.email}
           onChange={handleChange}
           placeholder={t('email')}
           required // Champ obligatoire avec validation email automatique
           className="w-full p-2 border rounded"
         />

         {/* Champ téléphone (optionnel) */}
         <input
           type="tel"
           name="telephone"
           value={formData.telephone}
           onChange={handleChange}
           placeholder={t('telephone')}
           className="w-full p-2 border rounded"
           // Note: pas de "required" - le téléphone est optionnel
         />

         {/* Sélecteur d'objet du message */}
         <select
           name="objet"
           value={formData.objet}
           onChange={handleChange}
           required // Champ obligatoire
           className="w-full p-2 border rounded"
         >
           <option value="">{t('objet')}</option> {/* Option par défaut vide */}
           <option value="Demande d'infos / Devis">{t('objet.demande')}</option>
           <option value="Réclamation / Plainte">{t('objet.plainte')}</option>
           <option value="Autres">{t('objet.autres')}</option>
         </select>

         {/* Zone de texte pour le message */}
         <textarea
           name="message"
           value={formData.message}
           onChange={handleChange}
           placeholder={t('message')}
           required // Champ obligatoire
           className="w-full p-2 border rounded min-h-[120px]" // Hauteur minimale définie
         />

         {/* Bouton de soumission */}
         <button
           type="submit"
           className="bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700 transition"
         >
           {t('envoyer')}
         </button>
       </form>
     </div>
   </div>
 );
};

export default ContactClient;