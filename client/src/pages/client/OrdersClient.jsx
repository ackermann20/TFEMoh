import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HeaderClient from '../../components/client/HeaderClient';
import { useNavigate } from 'react-router-dom';

const OrdersClient = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

        const res = await axios.get(`http://localhost:3000/api/utilisateurs/${userData.id}/commandes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Données reçues:', res.data);
        setOrders(res.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur récupération commandes:', error);
        setError('Impossible de récupérer les commandes. Veuillez réessayer.');
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  // Récupère les détails d'une commande spécifique lorsqu'on clique dessus
  const fetchOrderDetails = async (orderId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`http://localhost:3000/api/commandes/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Détails de la commande:', response.data);
      setSelectedOrder(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      setError('Impossible de récupérer les détails de la commande.');
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calculateTotal = (commande) => {
    if (!commande?.ligneCommandes || !Array.isArray(commande.ligneCommandes)) return 0;
    
    return commande.ligneCommandes.reduce((total, item) => {
      // Vérifier si item.prixUnitaire et item.quantite existent
      const prixProduit = item && item.prixUnitaire && item.quantite 
        ? item.prixUnitaire * item.quantite 
        : 0;
      
      // Vérifier que ligneGarnitures est un tableau avant de faire un reduce
      const prixGarnitures = item.ligneGarnitures && Array.isArray(item.ligneGarnitures)
        ? item.ligneGarnitures.reduce((sum, garniture) => {
            return sum + (garniture?.garniture?.prix || 0);
          }, 0) * item.quantite
        : 0;
      
      return total + prixProduit + prixGarnitures;
    }, 0);
  };

  const getNomProduit = (item) => {
    if (item.sandwich) {
      return item.sandwich.nom;
    }
    return item.produit?.nom || 'Produit';
  };

  const getImageProduit = (item) => {
    const nomFichier = item.produit?.image || item.produit?.nom + '.jpg';
    return `http://localhost:3000/uploads/${nomFichier}`;
  };

  return (
    <div>
      <HeaderClient />
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center text-amber-900 mb-6">Mes Commandes</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Liste des commandes */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Historique de commandes</h2>
            {isLoading ? (
              <p>Chargement des commandes...</p>
            ) : orders.length === 0 ? (
              <p>Aucune commande trouvée.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 rounded-lg shadow cursor-pointer bg-white hover:bg-amber-100 ${
                      selectedOrder?.id === order.id ? 'border-2 border-amber-400' : ''
                    }`}
                    onClick={() => fetchOrderDetails(order.id)}
                  >
                    <p className="font-semibold">Commande effectuée le {formatDate(order.dateRetrait)}</p>
                    <p className="text-sm text-gray-600">{order.statut}</p>
                    <p className="text-xs text-gray-500">ID: {order.id}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Détail d'une commande */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Détail de la commande</h2>
            {isLoading ? (
              <p>Chargement des détails...</p>
            ) : selectedOrder && selectedOrder.ligneCommandes && Array.isArray(selectedOrder.ligneCommandes) ? (
              <div className="space-y-4">
                {selectedOrder.ligneCommandes.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-3 rounded-lg bg-white shadow">
                    <img
                      src={getImageProduit(item)}
                      alt={getNomProduit(item)}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-bold">{getNomProduit(item)}</h4>
                      <p>Quantité : {item.quantite}</p>

                      {item.ligneGarnitures && Array.isArray(item.ligneGarnitures) && item.ligneGarnitures.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Garnitures : {item.ligneGarnitures.map(g => g?.garniture?.nom).filter(Boolean).join(', ')}
                        </p>
                      )}

                      <p className="text-sm text-gray-600">
                        Prix : {(item.prixUnitaire * item.quantite).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))}

                <div className="text-right font-bold text-lg mt-4">
                  Total de la commande : {calculateTotal(selectedOrder).toFixed(2)} €
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white rounded-lg text-center text-gray-500">
                Sélectionnez une commande pour voir les détails.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersClient;