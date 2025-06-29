import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordClient() {
 // Hook pour l'internationalisation
 const { t } = useTranslation();
 
 // États locaux pour gérer le formulaire et les retours utilisateur
 const [email, setEmail] = useState(""); // Adresse e-mail saisie par l'utilisateur
 const [message, setMessage] = useState(null); // Message de succès à afficher
 const [error, setError] = useState(null); // Message d'erreur à afficher

 // Fonction de gestion de la soumission du formulaire
 const handleSubmit = async (e) => {
   e.preventDefault(); // Empêche le rechargement de la page
   
   // Réinitialisation des messages précédents
   setError(null);
   setMessage(null);

   try {
     // Appel API pour demander la réinitialisation du mot de passe
     const res = await axios.post(`http://localhost:3000/api/auth/forgot-password`, { email });
     
     // Affichage du message de succès retourné par le serveur
     setMessage(res.data.message);
   } catch (err) {
     // Gestion des erreurs avec message personnalisé ou fallback
     setError(err.response?.data?.message || t("erreurServeur"));
   }
 };

 return (
   <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded-xl">
     {/* Titre de la page */}
     <h1 className="text-xl font-bold mb-4 text-center">{t("motDePasseOublie")}</h1>
     
     {/* Formulaire de demande de réinitialisation */}
     <form onSubmit={handleSubmit}>
       {/* Champ e-mail */}
       <input
         type="email"
         required // Validation HTML5 pour le format e-mail
         className="w-full p-2 border mb-3 rounded"
         placeholder={t("placeholderEmail")} // Placeholder traduit
         value={email}
         onChange={(e) => setEmail(e.target.value)} // Mise à jour de l'état à chaque saisie
       />
       
       {/* Bouton de soumission */}
       <button className="w-full bg-amber-600 text-white p-2 rounded">
         {t("envoyer")}
       </button>
     </form>
     
     {/* Affichage conditionnel du message de succès */}
     {message && <p className="text-green-600 mt-3">{message}</p>}
     
     {/* Affichage conditionnel du message d'erreur */}
     {error && <p className="text-red-600 mt-3">{error}</p>}
   </div>
 );
}