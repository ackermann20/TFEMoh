import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../../services/CartContext';

const ProductCard = ({ produit, showFavori = false }) => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { t, i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const imageUrl = produit.image
    ? `http://localhost:3000/uploads/${produit.image}`
    : 'https://via.placeholder.com/150';

  const afficherPrix = (produit.type === 'sandwich' && produit.prix === 0)
    ? t('aPartirDe', { prix: '3.5' })
    : `${produit.prix.toFixed(2)} €`;

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
    setIsAddingToCart(true);

    if (produit.type === 'sandwich') {
      navigate(`/customize-sandwich/${produit.id}`);
    } else {
      addToCart({ id: produit.id, nom: produit.nom, prix: produit.prix, type: produit.type, image: produit.image });
      showNotification(t('produitAjoute', { nom: produit.nom }));
      setTimeout(() => setIsAddingToCart(false), 1000);
    }
  };

  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 transform translate-x-full opacity-0 transition-all duration-300';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        ${message}
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => { notification.classList.remove('translate-x-full', 'opacity-0'); }, 10);
    setTimeout(() => { notification.classList.add('translate-x-full', 'opacity-0'); setTimeout(() => notification.remove(), 300); }, 3000);
  };

  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 w-full max-w-xs ${isHovered ? 'transform scale-[1.02]' : ''}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative">
        <img src={imageUrl} alt={produit.nom} className="w-full h-48 object-cover transition-all duration-300" />
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(produit.type)}`}>
          {produit.type ? produit.type.charAt(0).toUpperCase() + produit.type.slice(1) : t('produit')}
        </div>
        {isLoggedIn && showFavori && (
          <div className="absolute top-2 left-2">
            <span className="text-red-500 text-xl">❤️</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-amber-800 mb-1">{nom}</h3>
        <p className="text-gray-600 text-sm h-12 overflow-hidden mb-3">
          {description || t('produitParDefaut')}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-amber-700 font-semibold">{afficherPrix}</span>
          <button onClick={ajouterAuPanier} disabled={isAddingToCart} className={`relative overflow-hidden ${produit.type === 'sandwich' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'} text-white px-4 py-2 rounded-md transition-all duration-300 ${isAddingToCart ? 'opacity-75' : ''}`}>
            {isAddingToCart ? (
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
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
