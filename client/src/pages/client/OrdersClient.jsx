import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HeaderClient from '../../components/client/HeaderClient';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../../services/CartContext';
import { useContext } from 'react';

const OrdersClient = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addToCart } = useContext(CartContext);

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('userData'));

        if (!token || !userData) {
          navigate('/login');
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/api/commandes/utilisateurs/${userData.id}/commandes`, {

          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("✅ Commandes récupérées :", res.data); // ← ICI

        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setOrders(sortedOrders);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur récupération commandes:', error);
        setError(t('ordersClient.noOrders'));
        setIsLoading(false);
      }
      
    };

    fetchOrders();
    
  }, [navigate, t]);

  const fetchOrderDetails = async (orderId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`http://localhost:3000/api/commandes/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSelectedOrder(response.data);
      setShowMobileDetails(true); // Pour mobile
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      setError(t('ordersClient.selectOrder'));
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(i18n.language, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (date) => {
    return new Date(date).toLocaleDateString(i18n.language, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const getCreneauHoraire = (tranche) => {
    if (!tranche) return '';
    
    const tranches = {
      'matin': {
        'fr': '7h00 - 11h00',
        'en': '7:00 AM - 11:00 PM',
        'nl': '7u00 - 11u00'
      },
      'midi': {
        'fr': '11h00 - 14h00',
        'en': '11:00 PM - 2:00 PM',
        'nl': '11u00 - 14u00'
      },
      'soir': {
        'fr': '14h00 - 19h00',
        'en': '2:00 PM - 7:00 PM',
        'nl': '14u00 - 19u00'
      }
    };

    const trancheLower = tranche.toLowerCase();
    const lang = i18n.language;
    
    if (tranches[trancheLower] && tranches[trancheLower][lang]) {
      return tranches[trancheLower][lang];
    }
    
    return tranche; // Retourne la tranche originale si pas reconnue
  };

  const calculateTotal = (commande) => {
    if (!commande?.ligneCommandes || !Array.isArray(commande.ligneCommandes)) return 0;

    return commande.ligneCommandes.reduce((total, item) => {
      const prixProduit = item?.prixUnitaire && item?.quantite
        ? item.prixUnitaire * item.quantite
        : 0;

      const prixGarnitures = item.ligneGarnitures && Array.isArray(item.ligneGarnitures)
        ? item.ligneGarnitures.reduce((sum, garniture) => {
            return sum + (garniture?.garniture?.prix || 0);
          }, 0) * item.quantite
        : 0;

      return total + prixProduit + prixGarnitures;
    }, 0);
  };

  const remettreDansPanier = () => {
    if (!selectedOrder?.ligneCommandes) return;

    selectedOrder.ligneCommandes.forEach(item => {
      const produit = item.produit;
      if (!produit) return;

      const article = {
        id: produit.id,
        nom: getNomProduit(item),
        prix: item.prixUnitaire,
        type: produit.type,
        image: produit.image,
        garnitures: item.ligneGarnitures?.map(g => ({
          id: g.garniture?.id,
          nom: g.garniture?.nom,
          prix: g.garniture?.prix
        })) || [],
        isSandwich: produit.type === 'sandwich',
        // Ajouter le type de pain s'il existe
        typePain: item.typePain || 'blanc'
      };

      for (let i = 0; i < item.quantite; i++) {
        addToCart(article);
      }
    });

    navigate('/cart');
  };

const annulerCommande = async () => {
  if (!selectedOrder || selectedOrder.statut !== 'en attente') return;
  const confirm = window.confirm("Es-tu sûr de vouloir annuler cette commande ?");
  if (!confirm) return;

  try {
    const token = localStorage.getItem('token');
    await axios.patch(`${API_BASE_URL}/api/commandes/${selectedOrder.id}/annuler`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Recharge les commandes
    const res = await axios.get(`${API_BASE_URL}/api/commandes/utilisateurs/${selectedOrder.utilisateurId}/commandes`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOrders(sortedOrders);
    setSelectedOrder(null);
    // Recharge les infos utilisateur après annulation pour rafraîchir le solde
    try {
      const updatedUser = await axios.get(`${API_BASE_URL}/api/utilisateurs/${selectedOrder.utilisateurId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('userData', JSON.stringify(updatedUser.data));
    } catch (err) {
      console.warn("⚠️ Impossible de recharger le solde après annulation :", err.message);
    }

    alert("Commande annulée avec succès !");
  } 
  catch (err) {
    console.error(err);
    alert("Erreur lors de l'annulation.");
  }
  
};

  const getNomProduit = (item) => {
    const lang = i18n.language;
    const produit = item.produit;
    if (!produit) return t('produit');
    return produit[`nom_${lang}`] || produit.nom;
  };

  const getDescriptionProduit = (item) => {
    const lang = i18n.language;
    const produit = item.produit;
    if (!produit) return '';
    return produit[`description_${lang}`] || produit.description || '';
  };

  const getImageProduit = (item) => {
    const nomFichier = item.produit?.image || item.produit?.nom + '.jpg';
    return `http://localhost:3000/uploads/${nomFichier}`;
  };

  // Fonction pour déterminer si c'est un sandwich
  const isSandwich = (item) => {
    return item.produit?.type === 'sandwich' || 
           item.estSandwich || 
           item.isSandwich ||
           (item.ligneGarnitures && item.ligneGarnitures.length > 0);
  };

  // Fonction pour récupérer le type de pain
  const getTypePain = (item) => {
    // D'abord vérifier s'il y a un typePain dans la ligne de commande
    if (item.typePain) {
      return item.typePain;
    }
    
    // Récupérer depuis LigneCommandeGarniture (plus logique)
    if (item.ligneGarnitures && item.ligneGarnitures.length > 0) {
      // Prendre le typePain de la première garniture (toutes devraient avoir le même)
      const painGarniture = item.ligneGarnitures[0];
      if (painGarniture && painGarniture.typePain) {
        return painGarniture.typePain;
      }
    }
    
    // Valeur par défaut pour les sandwichs sans garnitures
    return 'blanc';
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmee': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_preparation': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'prete': return 'bg-green-100 text-green-800 border-green-200';
      case 'livree': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'annulee': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'en_attente': return '⏳';
      case 'confirmee': return '✅';
      case 'en_preparation': return '👨‍🍳';
      case 'prete': return '🎯';
      case 'livree': return '🚚';
      case 'annulee': return '❌';
      default: return '📋';
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div>
        <HeaderClient />
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">{t('ordersClient.loadingOrders')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <HeaderClient />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header avec icône */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-4 shadow-lg">
              <span className="text-2xl text-white">📋</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-2">
              {t('ordersClient.title')}
            </h1>
            <p className="text-gray-600">{t('ordersClient.subtitle') || 'Suivez vos commandes en temps réel'}</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-sm">
              <div className="flex items-center">
                <span className="text-xl mr-3">⚠️</span>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Layout responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Liste des commandes */}
            <div className={`${showMobileDetails ? 'hidden lg:block' : 'block'}`}>
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-amber-100 rounded-full p-3 mr-4">
                    <span className="text-xl">📝</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">{t('ordersClient.history')}</h2>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛒</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('ordersClient.noOrders')}</h3>
                    <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commandes</p>
                    <button
                      onClick={() => navigate('/')}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      🍞 Découvrir nos produits
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className={`p-5 rounded-xl shadow-sm cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-md ${
                          selectedOrder?.id === order.id 
                            ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-400' 
                            : 'bg-gray-50 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50'
                        }`}
                        onClick={() => fetchOrderDetails(order.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{getStatusIcon(order.statut)}</span>
                            <div>
                              <p className="font-bold text-gray-800 text-lg">
                                Commande #{order.id}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatDate(order.createdAt)}
                              </p>
                              {order.dateRetrait && (
                                <p className="text-xs text-amber-600 font-medium">
                                  🕒 {t('ordersClient.pickup') || 'Retrait'} : {formatDateOnly(order.dateRetrait)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.statut)}`}>
                              {t(`orderStatus.${order.statut}`, order.statut)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            {order.ligneCommandes?.length || 0} article(s)
                          </p>
                          <p className="font-bold text-amber-700">
                            {calculateTotal(order).toFixed(2)} €
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Détails de la commande */}
            <div className={`${!showMobileDetails ? 'hidden lg:block' : 'block'}`}>
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-orange-100 rounded-full p-3 mr-4">
                      <span className="text-xl">🔍</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{t('ordersClient.details')}</h2>
                  </div>
                  
                  {/* Bouton retour mobile */}
                  <button
                    onClick={() => setShowMobileDetails(false)}
                    className="lg:hidden bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>

                {selectedOrder && selectedOrder.ligneCommandes && Array.isArray(selectedOrder.ligneCommandes) ? (
                  <div className="space-y-6">
                    {/* En-tête de la commande */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          Commande #{selectedOrder.id}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedOrder.statut)}`}>
                          {getStatusIcon(selectedOrder.statut)} {t(`orderStatus.${selectedOrder.statut}`, selectedOrder.statut)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600">
                          📅 {t('ordersClient.orderedOn') || 'Commandé le'} : {formatDate(selectedOrder.createdAt)}
                        </p>
                        {selectedOrder.dateRetrait && (
                          <p className="text-gray-600">
                            🕒 {t('ordersClient.pickupDate') || 'Retrait prévu'} : {formatDateOnly(selectedOrder.dateRetrait)}
                          </p>
                        )}
                        {selectedOrder.trancheHoraireRetrait && (
                          <p className="text-gray-600">
                            ⏰ {t('ordersClient.timeSlot') || 'Créneau'} : {getCreneauHoraire(selectedOrder.trancheHoraireRetrait)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Articles de la commande */}
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {selectedOrder.ligneCommandes.map((item, idx) => (
                        <div key={idx} className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="relative">
                            <img
                              src={getImageProduit(item)}
                              alt={getNomProduit(item)}
                              className="w-20 h-20 object-cover rounded-xl shadow-sm"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCAyMEM0Ni42Mjc0IDIwIDUyIDI1LjM3MjYgNTIgMzJDNTIgMzguNjI3NCA0Ni42Mjc0IDQ0IDQwIDQ0QzMzLjM3MjYgNDQgMjggMzguNjI3NCAyOCAzMkMyOCAyNS4zNzI2IDMzLjM3MjYgMjAgNDAgMjBaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0yMCA1Nkw2MCA1NkM2MCA1MiA1NiA0OCA1MiA0OEgyOEMyNCA0OCAyMCA1MiAyMCA1NloiIGZpbGw9IiM5QjlCOUIiLz4KPC9zdmc+';
                              }}
                            />
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                              {item.quantite}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-lg mb-1">{getNomProduit(item)}</h4>
                            <p className="text-sm text-gray-500 mb-2">{getDescriptionProduit(item)}</p>
                            
                            {/* Affichage du type de pain pour les sandwichs */}
                            {isSandwich(item) && (
                              <p className="text-sm text-gray-600 mb-2">
                                🥖 Pain : <span className="capitalize">{getTypePain(item)}</span>
                              </p>
                            )}

                            {item.ligneGarnitures && Array.isArray(item.ligneGarnitures) && item.ligneGarnitures.length > 0 && (
                              <div className="mb-2">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  {t('ordersClient.toppings')} :
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {item.ligneGarnitures
                                    .map(g => {
                                      const garniture = g?.garniture;
                                      if (!garniture) return null;
                                      return garniture[`nom_${i18n.language}`] || garniture.nom;
                                    })
                                    .filter(Boolean)
                                    .map((nom, index) => (
                                      <span key={index} className="bg-amber-100 text-amber-800 px-2 py-1 text-xs rounded-full">
                                        {nom}
                                      </span>
                                    ))
                                  }
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600">
                                {item.quantite} × {item.prixUnitaire.toFixed(2)} €
                              </p>
                              <p className="font-bold text-amber-700 text-lg">
                                {(item.prixUnitaire * item.quantite).toFixed(2)} €
                              </p>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6 border-2 border-amber-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">💰</span>
                          <span className="text-xl font-bold text-gray-800">{t('ordersClient.total')}</span>
                        </div>
                        <span className="text-2xl font-bold text-amber-700">
                          {calculateTotal(selectedOrder).toFixed(2)} €
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={remettreDansPanier}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
                      >
                        🛒 {t('ordersClient.reorder', 'Commander à nouveau')}

                      </button>

                      {selectedOrder?.statut === 'en attente' && (
                        <button
                          onClick={annulerCommande}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                          ❌ Annuler la commande
                        </button>
                      )}

                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👆</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('ordersClient.selectOrder')}</h3>
                    <p className="text-gray-500">Sélectionnez une commande pour voir les détails</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersClient;