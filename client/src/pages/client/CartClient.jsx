import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../../services/CartContext";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import HeaderClient from "../../components/client/HeaderClient";
import { useTranslation } from 'react-i18next';
import axios from 'axios';

function CartClient() {
 // Récupération des fonctions et données du contexte du panier
 const { cartItems, removeFromCart, clearCart, totalPrice, addToCart, setCartItems } = useContext(CartContext);
 
 // États locaux pour la gestion de la commande
 const [dateRetrait, setDateRetrait] = useState(null); // Date de retrait sélectionnée
 const [allProducts, setAllProducts] = useState([]); // Liste de tous les produits disponibles
 const [allGarnitures, setAllGarnitures] = useState([]); // Liste de toutes les garnitures disponibles
 const [trancheHoraire, setTrancheHoraire] = useState("matin"); // Tranche horaire de retrait
 const [userSolde, setUserSolde] = useState(0); // Solde de l'utilisateur
 const navigate = useNavigate(); // Hook pour la navigation
 const { t, i18n } = useTranslation(); // Hook pour l'internationalisation
 const [suggestions, setSuggestions] = useState([]); // Produits suggérés
 const [joursFermes, setJoursFermes] = useState([]); // Jours où la boulangerie est fermée

 // URL de base de l'API
 const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

 // Fonction utilitaire pour convertir une date string en objet Date local
 const toLocalDate = (dateStr) => {
   const d = new Date(dateStr);
   d.setHours(12, 0, 0, 0); // Définit l'heure à midi pour éviter les problèmes de timezone
   return d;
 };

 // Fonction pour ajouter un produit au panier (utilisée pour les suggestions)
 const ajouterAuPanier = (produit) => {
   const item = {
     id: produit.id,
     nom: getNomProduit(produit),
     prix: produit.prixPromo ?? produit.prix, // Utilise le prix promo si disponible
     garnitures: [],
     type: produit.type,
     isSandwich: produit.type === 'sandwich',
   };
   removeFromCart(-1); // Supprime un élément fictif (?)
   addToCart(item);
 };

 // Fonction pour obtenir le nom du produit selon la langue sélectionnée
 const getNomProduit = (produit) => {
   const lang = i18n.language;
   if (lang === 'en' && produit.nom_en) return produit.nom_en;
   if (lang === 'nl' && produit.nom_nl) return produit.nom_nl;
   return produit.nom; // Retourne le nom par défaut (français)
 };

 // Fonction pour obtenir la description du produit selon la langue sélectionnée
 const getDescriptionProduit = (produit) => {
   const lang = i18n.language;
   if (lang === 'en' && produit.description_en) return produit.description_en;
   if (lang === 'nl' && produit.description_nl) return produit.description_nl;
   return produit.description; // Retourne la description par défaut
 };

 // Les articles du panier groupés (actuellement juste une référence directe)
 const groupedCartItems = cartItems;

 // Fonction pour gérer les changements de quantité des articles dans le panier
 const handleQuantityChange = (index, newQuantity, item) => {
   if (newQuantity <= 0) {
     // Supprimer l'article si la quantité est 0 ou moins
     removeFromCart(index);
     return;
   }

   // Mettre à jour la quantité directement dans le contexte
   setCartItems(prevItems => {
     const newItems = [...prevItems];
     newItems[index] = { ...newItems[index], quantite: newQuantity };
     return newItems;
   });
 };

 // Effect pour charger la liste des produits au montage du composant
 useEffect(() => {
   const fetchProduits = async () => {
     const token = localStorage.getItem('token');
     try {
       const res = await axios.get(`${API_BASE_URL}/api/produits`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       setAllProducts(res.data);
     } catch (err) {
       console.error("Erreur chargement produits:", err);
     }
   };

   fetchProduits();
 }, []);

 // Fonction pour charger les garnitures disponibles
 const fetchGarnitures = async () => {
   const token = localStorage.getItem('token');
   try {
     const res = await axios.get(`${API_BASE_URL}/api/garnitures`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     setAllGarnitures(res.data);
   } catch (err) {
     console.error("Erreur chargement garnitures:", err);
   }
 };

 // Effect pour charger les garnitures au montage
 useEffect(() => {
   fetchGarnitures();
 }, []);

 // Création d'un objet de lookup pour les produits par ID
 const produitsById = {};
 allProducts.forEach(p => {
   produitsById[p.id] = p;
 });

 // Effect pour logger les changements du panier (debug)
 useEffect(() => {
   console.log('🛒 CartClient - cartItems changed:', cartItems);
 }, [cartItems]);

 // Fonction pour obtenir le nom du type de pain selon la langue
 const getNomPain = (nomPain) => {
   const pains = {
     blanc: {
       fr: 'blanc',
       en: 'white',
       nl: 'wit'
     },
     complet: {
       fr: 'complet',
       en: 'wholemeal',
       nl: 'volkoren'
     },
     demiGris: {
       fr: 'demi-gris',
       en: 'half-white',
       nl: 'half-grijs'
     }
   };

   return pains[nomPain]?.[i18n.language] || nomPain;
 };

 // Effect principal pour charger les données nécessaires au montage
 useEffect(() => {
   // Chargement des jours fermés
   axios.get(`${API_BASE_URL}/api/horaires`)
     .then(res => {
       const dates = res.data.map(j => toLocalDate(j.date));
       setJoursFermes(dates);
     })
     .catch(err => console.error("Erreur chargement jours fermés :", err));

   // Fonction pour récupérer le solde de l'utilisateur
   const fetchUserSolde = async () => {
     const token = localStorage.getItem('token');
     const userData = JSON.parse(localStorage.getItem('userData') || '{}');
     
     if (!token || !userData.id) return;
     
     try {
       const response = await axios.get(`${API_BASE_URL}/api/utilisateurs/${userData.id}`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       
       if (response.data && response.data.solde !== undefined) {
         setUserSolde(response.data.solde);
         // Mise à jour du localStorage avec le nouveau solde
         const updatedUserData = { ...userData, solde: response.data.solde };
         localStorage.setItem('userData', JSON.stringify(updatedUserData));
       }
     } catch (error) {
       console.error("Erreur lors de la récupération du solde:", error);
     }
   };
   
   fetchUserSolde();

   // Fonction pour récupérer les suggestions de produits basées sur l'historique
   const fetchSuggestions = async () => {
     const token = localStorage.getItem('token');
     const userData = JSON.parse(localStorage.getItem('userData') || '{}');

     if (!token || !userData.id) return;

     try {
       const res = await axios.get(`${API_BASE_URL}/api/commandes/utilisateurs/${userData.id}/recommandations`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       setSuggestions(res.data);
       console.log("Suggestions récupérées :", res.data);
     } catch (err) {
       console.error('Erreur suggestions :', err);
     }
   };

   fetchSuggestions();
 }, []);

 // Fonction principale pour valider et créer la commande
 const handleValidation = async () => {
   // Vérification que la date de retrait est sélectionnée
   if (!dateRetrait) {
     const notification = document.createElement('div');
     notification.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50';
     notification.innerHTML = `<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>${t('erreurDateManquante')}</div>`;
     document.body.appendChild(notification);
     
     setTimeout(() => {
       notification.remove();
     }, 3000);
     return;
   }
 
   const token = localStorage.getItem('token');
 
   // Vérification de l'authentification
   if (!token) {
     alert(t('erreurConnexionRequise'));
     navigate('/login');
     return;
   }
   
   // Vérification du solde suffisant
   const total = totalPrice();
   if (userSolde < total) {
     const notification = document.createElement('div');
     notification.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50';
     notification.innerHTML = `<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>${t('soldeInsuffisant', { soldeActuel: userSolde.toFixed(2), montantNecessaire: total.toFixed(2) })}</div>`;
     document.body.appendChild(notification);
     
     setTimeout(() => {
       notification.remove();
     }, 5000);
     return;
   }

   // Vérification de la disponibilité des produits et garnitures
   try {
     const resProduits = await axios.get(`${API_BASE_URL}/api/produits`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     const produitsDisponibles = resProduits.data;

     const resGarnitures = await axios.get(`${API_BASE_URL}/api/garnitures`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     const garnituresDisponibles = resGarnitures.data;

     let produitsIndisponibles = [];
     let garnituresIndisponibles = [];

     // Vérification de chaque article du panier
     cartItems.forEach(item => {
       const produitActuel = produitsDisponibles.find(p => p.id === item.id);
       if (!produitActuel || produitActuel.disponible === false) {
         produitsIndisponibles.push(item.nom);
         return;
       }

       // Vérification des garnitures pour les sandwiches
       (item.garnitures || []).forEach(g => {
         const garnitureActuelle = garnituresDisponibles.find(ga => ga.id === g.id);
         if (!garnitureActuelle || garnitureActuelle.disponible === false) {
           garnituresIndisponibles.push(g.nom);
         }
       });
     });

     // Affichage des erreurs si des produits/garnitures sont indisponibles
     if (produitsIndisponibles.length > 0 || garnituresIndisponibles.length > 0) {
       let message = '';

       if (produitsIndisponibles.length > 0) {
         message += `⚠️ ${t('produitsIndisponibles')}:\n- ${produitsIndisponibles.join('\n- ')}\n\n`;
       }
       if (garnituresIndisponibles.length > 0) {
         message += `⚠️ ${t('garnituresIndisponibles')}:\n- ${garnituresIndisponibles.join('\n- ')}`;
       }

       const notification = document.createElement('div');
       notification.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50';
       notification.innerHTML = `<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg><pre>${message}</pre></div>`;
       document.body.appendChild(notification);
       
       setTimeout(() => {
         notification.remove();
       }, 5000);

       return;
     }

   } catch (err) {
     console.error("Erreur vérification disponibilités:", err);
   }
 
   // Création de la commande si toutes les vérifications passent
   try {
     const userData = JSON.parse(localStorage.getItem('userData') || '{}');
     
     // Formatage des produits pour l'API
     const produitsFormatted = cartItems.map(item => {
       if (item.type === 'sandwich' || item.isSandwich || item.estSandwich || item.categorie === 'sandwich') {
         return {
           produitId: item.id,
           quantite: item.quantite, 
           prix: item.prix,
           isSandwich: true,
           estSandwich: true,
           categorie: 'sandwich',
           description: item.nom || item.description || `Sandwich personnalisé ${item.id}`,
           garnitures: item.garnitures || [],
           typePain: item.typePain || 'blanc'
         };
       } else {
         return {
           produitId: item.id,
           quantite: item.quantite, 
           prix: item.prix
         };
       }
     });

     console.log("Produits envoyés à l'API:", produitsFormatted);

     // Envoi de la commande à l'API
     const responseCommande = await axios.post(`${API_BASE_URL}/api/commandes`, {
       produits: produitsFormatted,
       dateRetrait: dateRetrait.toLocaleDateString('fr-CA'), 
       trancheHoraireRetrait: trancheHoraire
     }, {
       headers: {
         Authorization: `Bearer ${token}`,
         'Content-Type': 'application/json'
       }
     });
     
     // Mise à jour du solde de l'utilisateur
     const nouveauSolde = userSolde - total;
     await axios.put(`${API_BASE_URL}/api/utilisateurs/${userData.id}`, 
       { solde: nouveauSolde },
       { headers: { Authorization: `Bearer ${token}` }}
     );
     
     // Mise à jour du localStorage et de l'état local
     const updatedUserData = { ...userData, solde: nouveauSolde };
     localStorage.setItem('userData', JSON.stringify(updatedUserData));
     setUserSolde(nouveauSolde);
 
     // Affichage de la notification de succès
     const notification = document.createElement('div');
     notification.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50';
     notification.innerHTML = `<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>${t('commandeValidee', { date: dateRetrait.toLocaleDateString(), tranche: trancheHoraire, nouveauSolde: nouveauSolde.toFixed(2) })}</div>`;
     document.body.appendChild(notification);
 
     // Redirection après succès
     setTimeout(() => {
       notification.remove();
       clearCart(); // Vide le panier
       navigate("/orders"); // Redirige vers la page des commandes
     }, 3000);
 
   } catch (error) {
     // Gestion des erreurs lors de la création de la commande
     console.error('Erreur lors de la création de la commande :', error);
     const notification = document.createElement('div');
     notification.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50';
     notification.innerHTML = `<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>${t('erreurValidationCommande')}</div>`;
     document.body.appendChild(notification);
     
     setTimeout(() => {
       notification.remove();
     }, 3000);
   }
 };

 // Rendu du composant
 return (
   <div className="min-h-screen bg-amber-50">
     <HeaderClient />
     
     <div className="max-w-4xl mx-auto p-6">
       <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
         <h1 className="text-3xl font-bold mb-6 text-center text-amber-800">🛒 {t('votrePanier')}</h1>

         {/* Affichage du solde utilisateur */}
         <div className="bg-amber-50 p-3 rounded-lg mb-6 flex justify-between items-center">
           <span className="font-medium text-amber-800">{t('votreSolde')}</span>
           <div className="flex items-center gap-4">
             <span className="font-bold text-lg text-amber-800">{userSolde.toFixed(2)} €</span>
           </div>
         </div>

         {/* Affichage conditionnel : panier vide ou contenu du panier */}
         {cartItems.length === 0 ? (
           // Panier vide - affichage d'un message et bouton pour parcourir les produits
           <div className="text-center py-10">
             <div className="text-6xl mb-4">🛒</div>
             <p className="text-center text-gray-600 mb-6">{t('panierVide')}</p>
             <button
               onClick={() => navigate('/')}
               className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
             >
               {t('parcourirProduits')}
             </button>
           </div>
         ) : (
           <>
             {/* Liste des articles dans le panier */}
             <div className="space-y-4 mb-8">
               {groupedCartItems.map((item, index) => (
                 <div key={index} className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                   <div className="flex items-center justify-between">
                     <div className="flex-1">
                       {/* Nom du produit avec badge pour les sandwiches */}
                       <div className="flex items-center gap-2 mb-2">
                         <span className="font-semibold text-amber-800">{getNomProduit(produitsById[item.id] || item)}</span>
                         
                         {(item.type === 'sandwich' || item.isSandwich || item.estSandwich || item.categorie === 'sandwich') && (
                           <span className="px-2 py-0.5 bg-amber-200 rounded-full text-xs text-amber-800">
                             {t('sandwich')}
                           </span>
                         )}
                       </div>
                       
                       {/* Affichage des garnitures si présentes */}
                       {item.garnitures && item.garnitures.length > 0 && (
                         <p className="text-sm text-gray-600 mb-2">
                           {t('garnitures')} : {item.garnitures.map(g => {
                             const garniture = allGarnitures.find(ga => ga.id === g.id);
                             if (!garniture) return g.nom;
                             return garniture[`nom_${i18n.language}`] || garniture.nom;
                           }).join(', ')}
                         </p>
                       )}

                       {/* Affichage du type de pain pour les sandwiches */}
                       {item.typePain && (
                         <p className="text-sm text-gray-600 mb-2">
                           {t('pain').charAt(0).toUpperCase() + t('pain').slice(1)} : <span className="capitalize">{getNomPain(item.typePain)}</span>
                         </p>
                       )}

                       {/* Affichage des prix */}
                       <div className="flex items-center gap-4">
                         <span className="text-sm text-gray-600">
                           {t('prixUnitaire', 'Prix unitaire')}: {item.prix.toFixed(2)} €
                         </span>
                         <span className="font-medium text-amber-700">
                           {t('total', 'Total')}: {(item.prix * item.quantite).toFixed(2)} €
                         </span>
                       </div>
                     </div>

                     {/* Contrôles de quantité et suppression */}
                     <div className="flex items-center gap-3">
                       {/* Contrôles de quantité */}
                       <div className="flex items-center bg-white rounded-lg border border-gray-300">
                         <button
                           onClick={() => handleQuantityChange(index, item.quantite - 1, item)}
                           className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                           disabled={item.quantite <= 1}
                         >
                           <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                           </svg>
                         </button>
                         
                         <span className="px-4 py-2 font-medium text-gray-800 border-x border-gray-300 min-w-[3rem] text-center">
                           {item.quantite}
                         </span>
                         
                         <button
                           onClick={() => handleQuantityChange(index, item.quantite + 1, item)}
                           className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                         >
                           <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                           </svg>
                         </button>
                       </div>

                       {/* Bouton supprimer */}
                       <button
                         onClick={() => handleQuantityChange(index, 0, item)}
                         className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition duration-300"
                         title={t('supprimerArticle', 'Supprimer cet article')}
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>

             {/* Affichage du sous-total avec vérification du solde */}
             <div className="bg-amber-100 p-4 rounded-lg mb-8">
               <div className="flex justify-between items-center">
                 <h2 className="text-xl font-semibold text-amber-800">{t('sousTotal')}</h2>
                 <span className="text-xl font-bold text-amber-800">{totalPrice().toFixed(2)} €</span>
               </div>
               
               {/* Indication du statut du solde */}
               {userSolde < totalPrice() ? (
                 <div className="mt-2 text-red-600 text-sm">
                   {t('soldeInsuffisantIndication', { montantManquant: (totalPrice() - userSolde).toFixed(2) })}
                 </div>
               ) : (
                 <div className="mt-2 text-green-600 text-sm">
                   {t('soldeSuffisant')}
                 </div>
               )}
             </div>

             {/* Section des détails de commande */}
             <div className="mb-8">
               <h2 className="text-xl font-semibold text-amber-800 mb-4">{t('detailsCommande')}</h2>
               
               <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
                 {/* Sélecteur de date */}
                 <div>
                   <label className="block mb-2 font-medium text-gray-700">{t('dateRetrait')} :</label>
                   <DatePicker
                     selected={dateRetrait}
                     onChange={(date) => setDateRetrait(date)}
                     minDate={new Date(new Date().setDate(new Date().getDate() + 1))} // Minimum le lendemain
                     className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                     placeholderText={t('selectionnerDate')}
                     excludeDates={joursFermes} // Exclut les jours fermés
                     dateFormat="dd/MM/yyyy"
                   />
                 </div>

                 {/* Sélecteur de tranche horaire */}
                 <div>
                   <label className="block mb-2 font-medium text-gray-700">{t('trancheHoraire')} :</label>
                   <select
                     value={trancheHoraire}
                     onChange={(e) => setTrancheHoraire(e.target.value)}
                     className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                   >
                     <option value="matin">{t('matin')}</option>
                     <option value="midi">{t('midi')}</option>
                     <option value="soir">{t('soir')}</option>
                   </select>
                 </div>
               </div>
             </div>

             {/* Boutons d'action */}
             <div className="flex flex-col sm:flex-row justify-between gap-4">
               <button
                 onClick={clearCart}
                 className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition duration-300 order-2 sm:order-1"
               >
                 {t('viderPanier')}
               </button>
               <button
                 onClick={handleValidation}
                 disabled={userSolde < totalPrice()} // Désactivé si solde insuffisant
                   className={`text-white font-bold py-3 px-6 rounded-lg transition duration-300 order-1 sm:order-2 ${
                   userSolde < totalPrice() 
                     ? 'bg-gray-400 cursor-not-allowed' // Style désactivé si solde insuffisant
                     : 'bg-amber-600 hover:bg-amber-700' // Style normal si solde suffisant
                 }`}
               >
                 {t('validerCommande')}
               </button>
             </div>
           </>
         )}
       </div>
       
       {/* Section des suggestions - affichée uniquement si le panier est vide */}
       {cartItems.length === 0 && (
         <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
           <h2 className="text-xl font-semibold text-amber-800 mb-4">{t('vousPourriezAimer')}</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
             {suggestions
               .filter(prod => prod.disponible) // Filtre uniquement les produits disponibles
               .map(prod => (
                 <div key={prod.id} className="border p-4 rounded shadow">
                   {/* Image du produit suggéré */}
                   <img
                     src={`${API_BASE_URL}/uploads/${prod.image}`}
                     alt={getNomProduit(prod)}
                     className="w-full h-32 object-cover rounded mb-2"
                   />
                   {/* Nom et description du produit */}
                   <h3 className="text-lg font-semibold text-amber-700">{getNomProduit(prod)}</h3>
                   <p className="text-sm text-gray-600 mb-2">{getDescriptionProduit(prod)}</p>

                   {/* Affichage du prix (avec prix promo si applicable) */}
                   <div className="mb-2">
                     {prod.prixPromo && prod.prixPromo > 0 ? (
                       <>
                         <span className="text-sm text-gray-400 line-through">{prod.prix.toFixed(2)} €</span><br />
                         <span className="text-lg font-bold text-red-600">{prod.prixPromo.toFixed(2)} €</span>
                       </>
                     ) : (
                       <span className="text-amber-800 font-bold">{prod.prix.toFixed(2)} €</span>
                     )}
                   </div>

                   {/* Bouton d'action différent selon le type de produit */}
                   {prod.type === 'sandwich' ? (
                     // Pour les sandwiches : redirection vers la page de personnalisation
                     <button
                       onClick={() => navigate(`/customize-sandwich/${prod.id}`)}
                       className="mt-2 block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition duration-300"
                     >
                       + {t('personnaliser', 'Personnaliser')}
                     </button>
                   ) : (
                     // Pour les autres produits : ajout direct au panier
                     <button
                       onClick={() => {
                         const item = {
                           id: prod.id,
                           nom: getNomProduit(prod),
                           prix: prod.prixPromo > 0 ? prod.prixPromo : prod.prix,
                           type: prod.type,
                           image: prod.image
                         };
                         addToCart(item);
                       }}
                       className="mt-2 block bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 px-4 rounded transition duration-300"
                     >
                       {t('ajouter', 'Ajouter')}
                     </button>
                   )}
                 </div>
             ))}
           </div>
         </div>
       )}
     </div>
   </div>
 );
}

export default CartClient;