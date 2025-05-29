import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../../services/CartContext";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import HeaderClient from "../../components/client/HeaderClient";
import { useTranslation } from 'react-i18next';
import axios from 'axios';

function CartClient() {
  const { cartItems, removeFromCart, clearCart, totalPrice } = useContext(CartContext);
  const [dateRetrait, setDateRetrait] = useState(null);
  const [trancheHoraire, setTrancheHoraire] = useState("matin");
  const [userSolde, setUserSolde] = useState(0);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const getNomProduit = (produit) => {
    if (i18n.language === 'en') return produit.nom_en || produit.nom;
    if (i18n.language === 'nl') return produit.nom_nl || produit.nom;
    return produit.nom;
  };
  const getDescriptionProduit = (produit) => {
    if (i18n.language === 'en') return produit.description_en || produit.description;
    if (i18n.language === 'nl') return produit.description_nl || produit.description;
    return produit.description;
  };
  // Récupérer le solde de l'utilisateur
  useEffect(() => {
    const fetchUserSolde = async () => {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      if (!token || !userData.id) return;
      
      try {
        const response = await axios.get(`http://localhost:3000/api/utilisateurs/${userData.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.solde !== undefined) {
          setUserSolde(response.data.solde);
          
          // Mettre à jour le solde dans localStorage
          const updatedUserData = { ...userData, solde: response.data.solde };
          localStorage.setItem('userData', JSON.stringify(updatedUserData));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du solde:", error);
      }
    };
    
    fetchUserSolde();
  }, []);

  const handleValidation = async () => {
    if (!dateRetrait) {
      // Notification d'erreur pour date manquante
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
  
    if (!token) {
      alert(t('erreurConnexionRequise'));
      navigate('/login');
      return;
    }
    
    // Vérifier si le solde est suffisant
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
  
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      // AMÉLIORATION: Format des produits pour mieux gérer les sandwichs
      const produitsFormatted = cartItems.map(item => {
        // Pour les sandwichs personnalisés - LOGIQUE AMÉLIORÉE
        if (item.type === 'sandwich' || item.isSandwich || item.estSandwich || item.categorie === 'sandwich') {
          // Log pour débogage
          console.log('Sandwich détecté dans le panier:', item);
          
          return {
            produitId: item.id,
            quantite: 1,
            prix: item.prix,
            isSandwich: true,
            estSandwich: true, // Double marquage pour être sûr
            categorie: 'sandwich',
            description: item.nom || item.description || `Sandwich personnalisé ${item.id}`,
            garnitures: item.garnitures || []
          };
        } 
        // Pour les produits standards
        else {
          return {
            produitId: item.id,
            quantite: 1,
            prix: item.prix
          };
        }
      });

      console.log("Produits envoyés à l'API:", produitsFormatted);

      // Créer la commande avec les produits formatés
      const responseCommande = await axios.post('http://localhost:3000/api/commandes', {
        produits: produitsFormatted,
        dateRetrait: dateRetrait.toISOString().split('T')[0],
        trancheHoraireRetrait: trancheHoraire
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Mettre à jour le solde de l'utilisateur
      const nouveauSolde = userSolde - total;
      await axios.put(`http://localhost:3000/api/utilisateurs/${userData.id}`, 
        { solde: nouveauSolde },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Mettre à jour le localStorage
      const updatedUserData = { ...userData, solde: nouveauSolde };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserSolde(nouveauSolde);
  
      // Notification de succès
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50';
      notification.innerHTML = `<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>${t('commandeValidee', { date: dateRetrait.toLocaleDateString(), tranche: trancheHoraire, nouveauSolde: nouveauSolde.toFixed(2) })}</div>`;
      document.body.appendChild(notification);
  
      setTimeout(() => {
        notification.remove();
        clearCart();
        navigate("/orders");
      }, 3000);
  
    } catch (error) {
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

  return (
    <div className="min-h-screen bg-amber-50">
      <HeaderClient />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-amber-800">🛒 {t('votrePanier')}</h1>

          {/* Affichage du solde */}
          <div className="bg-amber-50 p-3 rounded-lg mb-6 flex justify-between items-center">
            <span className="font-medium text-amber-800">{t('votreSolde')}</span>
            <span className="font-bold text-lg text-amber-800">{userSolde.toFixed(2)} €</span>
          </div>

          {cartItems.length === 0 ? (
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
              <ul className="space-y-4 mb-8">
                {cartItems.map((item, index) => (
                  <li key={index} className="flex items-center justify-between bg-amber-50 rounded-lg p-4 border border-amber-100">
                    <div className="flex-1">
                      <span className="font-semibold text-amber-800">{item.nom}</span>
                      
                      {/* AMÉLIORATION: Afficher clairement si c'est un sandwich */}
                      {(item.type === 'sandwich' || item.isSandwich || item.estSandwich || item.categorie === 'sandwich') && (
                        <span className="ml-2 px-2 py-0.5 bg-amber-200 rounded-full text-xs text-amber-800">
                          {t('sandwich')}
                        </span>
                      )}
                      
                      {item.garnitures && item.garnitures.length > 0 && (
                        <p className="text-sm text-gray-600">
                          {t('garnitures')} : {item.garnitures.map(g => g.nom).join(', ')}
                        </p>
                      )}

                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-amber-700 mr-4">{item.prix.toFixed(2)} €</span>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="bg-amber-100 p-4 rounded-lg mb-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-amber-800">{t('sousTotal')}</h2>
                  <span className="text-xl font-bold text-amber-800">{totalPrice().toFixed(2)} €</span>
                </div>
                
                {/* Indication sur le solde */}
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

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-amber-800 mb-4">{t('detailsCommande')}</h2>
                
                <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">{t('dateRetrait')} :</label>
                    <DatePicker
                      selected={dateRetrait}
                      onChange={(date) => setDateRetrait(date)}
                      minDate={new Date()}
                      className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholderText={t('selectionnerDate')}
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>

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

              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <button
                  onClick={clearCart}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition duration-300 order-2 sm:order-1"
                >
                  {t('viderPanier')}
                </button>
                <button
                  onClick={handleValidation}
                  disabled={userSolde < totalPrice()}
                  className={`text-white font-bold py-3 px-6 rounded-lg transition duration-300 order-1 sm:order-2 ${
                    userSolde < totalPrice() 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {t('validerCommande')}
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Suggestions - reste inchangé */}
        {cartItems.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-amber-800 mb-4">{t('vousPourriezAimer')}</h2>
            <div className="flex flex-col items-center">
              <p className="text-center text-gray-600 mb-4">
                {t('texteSuggestion')}
              </p>
              <button
                onClick={() => navigate('/products')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
              >
                {t('voirProduits')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartClient;