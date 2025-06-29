import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/client/ProductCard';
import { useTranslation } from 'react-i18next';
import Header from '../../components/client/HeaderClient';

const FavorisClient = () => {
 // États locaux pour gérer les données des favoris
 const [favoris, setFavoris] = useState([]); // Liste des produits favoris
 const [loading, setLoading] = useState(true); // État de chargement
 const [error, setError] = useState(null); // Gestion des erreurs
 
 // Hooks pour la navigation et l'internationalisation
 const navigate = useNavigate();
 const { t } = useTranslation();

 // Fonction pour récupérer les favoris de l'utilisateur connecté
 const fetchFavoris = async () => {
   const token = localStorage.getItem('token');
   
   // Vérification de l'authentification
   if (!token) {
     navigate('/login'); // Redirection vers login si pas de token
     return;
   }
   
   try {
     // Récupération de l'ID utilisateur depuis le localStorage
     const userId = JSON.parse(localStorage.getItem("userData"))?.id;
     
     // Appel API pour récupérer les favoris
     const res = await axios.get('http://localhost:3000/api/favoris/mes', {
       headers: {
         Authorization: `Bearer ${token}`, // Token JWT pour l'authentification
         userid: userId // ID utilisateur dans les headers
       }
     });

     setFavoris(res.data); // Mise à jour de la liste des favoris
     setError(null); // Réinitialisation des erreurs en cas de succès
   } catch (err) {
     // Gestion des erreurs de chargement
     setError(t('erreurChargementFavoris'));
   } finally {
     setLoading(false); // Fin du chargement dans tous les cas
   }
 };

 // Effect pour charger les favoris au montage et gérer les événements
 useEffect(() => {
   fetchFavoris(); // Chargement initial

   // Fonction de gestion de la mise à jour des favoris
   const handleFavorisUpdate = () => {
     fetchFavoris(); // Rechargement des favoris
   };

   // Écoute de l'événement personnalisé 'favorisUpdated'
   // Cet événement est probablement déclenché depuis ProductCard lors d'ajout/suppression
   window.addEventListener('favorisUpdated', handleFavorisUpdate);

   // Nettoyage de l'event listener au démontage du composant
   return () => {
     window.removeEventListener('favorisUpdated', handleFavorisUpdate);
   };
 }, [navigate, t]);

 // Affichage de l'état de chargement
 if (loading) {
   return (
     <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
       <Header />
       <div className="flex items-center justify-center py-20">
         <div className="text-center">
           {/* Spinner de chargement avec animation CSS */}
           <div className="animate-spin inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mb-4"></div>
           <p className="text-amber-800 text-lg">{t('chargement')}...</p>
         </div>
       </div>
     </div>
   );
 }

 // Affichage en cas d'erreur
 if (error) {
   return (
     <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
       <Header />
       <div className="flex items-center justify-center py-20">
         <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
           {/* Icône d'erreur */}
           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
             </svg>
           </div>
           <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('erreur')}</h3>
           <p className="text-red-600 mb-4">{error}</p>
           {/* Bouton pour recharger la page */}
           <button 
             onClick={() => window.location.reload()} 
             className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition-colors"
           >
             {t('réessayer')}
           </button>
         </div>
       </div>
     </div>
   );
 }

 // Affichage principal de la page des favoris
 return (
   <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
     <Header />
     
     {/* Section hero avec titre et description */}
     <div className="bg-amber-100 py-12 px-4">
       <div className="max-w-7xl mx-auto text-center">
         <h1 className="text-4xl font-bold text-amber-800 mb-4">
           {t('mesFavoris')}
         </h1>
         <p className="text-xl text-amber-700 max-w-2xl mx-auto">
           {favoris.length > 0 
             ? t('découvrezVosFavoris', { count: favoris.length }) // Message avec nombre de favoris
             : t('vousNAvezPasEncoreDeFavoris') // Message si aucun favori
           }
         </p>
       </div>
     </div>

     {/* Contenu principal */}
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
       {favoris.length === 0 ? (
         // Affichage si aucun favori
         <div className="text-center py-16">
           <div className="max-w-md mx-auto">
             {/* Icône de cœur pour les favoris vides */}
             <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
               </svg>
             </div>
             <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('aucunFavori')}</h3>
             <p className="text-gray-600 mb-8">{t('commencezAjouterFavoris')}</p>
             {/* Bouton pour découvrir les produits */}
             <button 
               onClick={() => navigate('/')}
               className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
             >
               {t('découvrirProduits')}
             </button>
           </div>
         </div>
       ) : (
         <>
           {/* Section d'information sur les favoris */}
           <div className="bg-white rounded-lg shadow-md p-6 mb-8">
             <div className="flex items-center justify-between">
               <div className="flex items-center">
                 {/* Icône de cœur rempli */}
                 <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mr-4">
                   <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                   </svg>
                 </div>
                 <div>
                   {/* Affichage du nombre de favoris avec gestion singulier/pluriel */}
                   <h3 className="text-lg font-semibold text-gray-900">
                     {favoris.length} {favoris.length === 1 ? t('produitFavori') : t('produitsFavoris')}
                   </h3>
                   <p className="text-gray-600">{t('vosProduitsPreféres')}</p>
                 </div>
               </div>
               {/* Bouton pour ajouter plus de favoris */}
               <button 
                 onClick={() => navigate('/')}
                 className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-md transition-colors font-medium"
               >
                 {t('ajouterPlus')}
               </button>
             </div>
           </div>

           {/* Grille des produits favoris */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
             {favoris.map((item) => (
               <div key={item.id} className="transform transition-all duration-300 hover:scale-105">
                 {/* 
                   Utilisation du composant ProductCard pour afficher chaque favori
                   - produit={item.produit} : passe les données du produit
                   - showFavori={true} : active l'affichage du bouton favori
                 */}
                 <ProductCard produit={item.produit} showFavori={true} />
               </div>
             ))}
           </div>
         </>
       )}
     </div>
   </div>
 );
};

export default FavorisClient;