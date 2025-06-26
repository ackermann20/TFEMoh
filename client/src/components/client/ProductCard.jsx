import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../../services/CartContext';
import axios from 'axios';

const ProductCard = ({ produit, showFavori = false }) => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { t, i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);


const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    checkIfFavorited();
  }, [produit.id]);

  const checkIfFavorited = async () => {
    const userId = JSON.parse(localStorage.getItem('userData'))?.id;
    if (!userId) {
      setIsFavorite(false);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/api/favoris`);
      const favoris = res.data;
      const favorisUtilisateur = favoris.filter(f => f.utilisateurId === userId);
      const match = favorisUtilisateur.find(f => f.produitId === produit.id);
      setIsFavorite(!!match);
    } catch (error) {
      console.error('Erreur vérification favoris', error);
      setIsFavorite(false);
    }
  };

  const toggleFavori = async () => {
    const token = localStorage.getItem('token');
    const userId = JSON.parse(localStorage.getItem('userData'))?.id;
    if (!userId || !token) return;
    
    try {
      if (isFavorite) {
        const res = await axios.get(`${API_BASE_URL}/api/favoris`);
        const fav = res.data.find(f => f.utilisateurId === userId && f.produitId === produit.id);
        if (fav) {
          await axios.delete(`${API_BASE_URL}/api/favoris/${fav.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } else {
        await axios.post(`${API_BASE_URL}/api/favoris`, {
          utilisateurId: userId,
          produitId: produit.id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setIsFavorite(!isFavorite);
      window.dispatchEvent(new CustomEvent('favorisUpdated'));
      
    } catch (err) {
      console.error('Erreur ajout/suppression favoris', err);
      checkIfFavorited();
    }
  };

  const imageUrl = produit.image
  ? `${API_BASE_URL}/uploads/${produit.image}`
  : 'https://via.placeholder.com/150';

  // Gestion des prix avec promotion
  const getPrixAffichage = () => {
    if (produit.type === 'sandwich' && produit.prix === 0) {
      return t('aPartirDe', { prix: '3.5' });
    }
    
    // Si il y a un prix promo
    if (produit.prixPromo && produit.prixPromo > 0) {
      return {
        prixOriginal: `${produit.prix.toFixed(2)} €`,
        prixPromo: `${produit.prixPromo.toFixed(2)} €`,
        hasPromo: true
      };
    }
    
    return {
      prix: `${produit.prix.toFixed(2)} €`,
      hasPromo: false
    };
  };

  const prixInfo = getPrixAffichage();

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'pain': return 'bg-amber-100 text-amber-800';
      case 'sandwich': return 'bg-green-100 text-green-800';
      case 'viennoiserie': return 'bg-orange-100 text-orange-800';
      case 'patisserie': return 'bg-rose-100 text-rose-800';
      case 'boisson': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Déterminer le style d'image selon le type de produit
  const getImageStyle = (type) => {
    if (type === 'boisson') {
      return {
        container: 'h-48 bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4',
        image: 'max-h-full max-w-full object-contain drop-shadow-md'
      };
    }
    return {
      container: 'h-48',
      image: 'w-full h-full object-cover'
    };
  };

  const imageStyle = getImageStyle(produit.type);

  const langue = i18n.language;
  const nom =
    (langue === 'en' && produit.nom_en) ||
    (langue === 'nl' && produit.nom_nl) ||
    produit.nom;

  const description =
    (langue === 'en' && produit.description_en) ||
    (langue === 'nl' && produit.description_nl) ||
    produit.description || t('produitParDefaut');

  const ajouterAuPanier = () => {
    // Vérifier la disponibilité
    if (!produit.disponible) {
      showNotification(t('produitIndisponible', 'Ce produit n\'est pas disponible actuellement.'), 'error');
      return;
    }

    setIsAddingToCart(true);

    if (produit.type === 'sandwich') {
      navigate(`/customize-sandwich/${produit.id}`);
    } else {
      // Utiliser le prix promo si disponible
      const prixFinal = produit.prixPromo && produit.prixPromo > 0 ? produit.prixPromo : produit.prix;
      addToCart({ 
        id: produit.id, 
        nom: produit.nom, 
        prix: prixFinal, 
        type: produit.type, 
        image: produit.image 
      });
      showNotification(t('produitAjoute', { nom: produit.nom }));
      setTimeout(() => setIsAddingToCart(false), 1000);
    }
  };

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-green-100 border-green-500 text-green-700';
    const icon = type === 'error' 
      ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>'
      : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
    
    notification.className = `fixed top-4 right-4 ${bgColor} border-l-4 p-4 rounded shadow-md z-50 transform translate-x-full opacity-0 transition-all duration-300`;
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${icon}
        </svg>
        ${message}
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => { notification.classList.remove('translate-x-full', 'opacity-0'); }, 10);
    setTimeout(() => { notification.classList.add('translate-x-full', 'opacity-0'); setTimeout(() => notification.remove(), 300); }, 3000);
  };

  return (
    <div 
      className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 w-full max-w-xs ${
        isHovered ? 'transform scale-[1.02]' : ''
      } ${!produit.disponible ? 'opacity-75' : ''}`} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Container d'image adaptatif selon le type */}
        <div className={`${imageStyle.container} ${!produit.disponible ? 'filter grayscale' : ''}`}>
          <img 
            src={imageUrl} 
            alt={produit.nom} 
            className={`${imageStyle.image} transition-all duration-300`}
          />
        </div>
        
        {/* Badge type */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(produit.type)}`}>
          {produit.type ? produit.type.charAt(0).toUpperCase() + produit.type.slice(1) : t('produit')}
        </div>

        {/* Badge promotion */}
        {prixInfo.hasPromo && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold animate-pulse">
            PROMO
          </div>
        )}

        {/* Badge indisponible */}
        {!produit.disponible && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
              {t('indisponible', 'Indisponible')}
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-amber-800 mb-1">{nom}</h3>
        <p className="text-gray-600 text-sm h-12 overflow-hidden mb-3">
          {description || t('produitParDefaut')}
        </p>

        <div className="flex items-center justify-between gap-2">
          {/* Affichage des prix */}
          <div className="flex flex-col">
            {prixInfo.hasPromo ? (
              <>
                <span className="text-sm text-gray-400 line-through">{prixInfo.prixOriginal}</span>
                <span className="text-lg font-bold text-red-600">{prixInfo.prixPromo}</span>
              </>
            ) : (
              <span className="text-amber-700 font-semibold">
                {typeof prixInfo === 'string' ? prixInfo : prixInfo.prix}
              </span>
            )}
          </div>

          <div className="flex gap-1">
            <button 
              onClick={ajouterAuPanier} 
              disabled={isAddingToCart || !produit.disponible} 
              className={`relative overflow-hidden ${
                !produit.disponible 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : produit.type === 'sandwich' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-amber-600 hover:bg-amber-700'
              } text-white px-4 py-2 rounded-md transition-all duration-300 ${
                isAddingToCart ? 'opacity-75' : ''
              }`}
            >
              {!produit.disponible ? (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                  </svg>
                  {t('indisponible', 'Indisponible')}
                </span>
              ) : isAddingToCart ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('ajout')}
                </span>
              ) : (
                <span className="flex items-center">
                  {produit.type === 'sandwich' ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      {t('personnaliser')}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      {t('ajouter')}
                    </>
                  )}
                </span>
              )}
            </button>
            
            {isLoggedIn && (
              <button
                onClick={toggleFavori}
                disabled={!produit.disponible}
                className={`px-3 py-2 rounded-md transition-colors border border-gray-300 ${
                  !produit.disponible 
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'hover:bg-gray-50 bg-white'
                } ${
                  isFavorite 
                    ? 'text-red-600' 
                    : 'text-gray-300'
                }`}
                title={!produit.disponible ? t('indisponible') : t('ajouterAuxFavoris')}
              >
                <svg 
                  className="w-4 h-4" 
                  fill={isFavorite ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;