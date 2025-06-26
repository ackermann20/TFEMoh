import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderClient from '../../components/client/HeaderClient';
import { CartContext } from '../../services/CartContext';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Minus, ShoppingCart, Check, AlertTriangle } from 'lucide-react';

const CustomizeSandwichClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [produit, setProduit] = useState(null);
  const [typePain, setTypePain] = useState('blanc');
  const [loading, setLoading] = useState(true);
  const [garnitures, setGarnitures] = useState([]);
  const [selectedGarnitures, setSelectedGarnitures] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);

  // Configuration de l'API
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchProduitEtGarnitures = async () => {
      try {
        const [resProduit, resGarnitures] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/produits/${id}`),
          axios.get(`${API_BASE_URL}/api/garnitures`)
        ]);
        
        const produitData = resProduit.data;
        
        // Vérifier si le produit est disponible
        if (!produitData.disponible) {
          setError('indisponible');
          setLoading(false);
          return;
        }
        
        setProduit(produitData);
        // Filtrer uniquement les garnitures disponibles
        setGarnitures(resGarnitures.data.filter(g => g.disponible));
      } catch (error) {
        console.error('Erreur lors du chargement', error);
        if (error.response && error.response.status === 404) {
          setError('introuvable');
        } else {
          setError('chargement');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduitEtGarnitures();
  }, [id, API_BASE_URL]);

  // Fonction pour obtenir le nom traduit du produit
  const getProduitNom = () => {
    if (!produit) return '';
    const langue = i18n.language;
    return (
      (langue === 'en' && produit.nom_en) ||
      (langue === 'nl' && produit.nom_nl) ||
      produit.nom
    );
  };

  // Fonction pour obtenir la description traduite du produit
  const getProduitDescription = () => {
    if (!produit) return '';
    const langue = i18n.language;
    return (
      (langue === 'en' && produit.description_en) ||
      (langue === 'nl' && produit.description_nl) ||
      produit.description
    );
  };

  // Fonction pour obtenir le nom traduit d'une garniture
  const getGarnitureNom = (garniture) => {
    const langue = i18n.language;
    return (
      (langue === 'en' && garniture.nom_en) ||
      (langue === 'nl' && garniture.nom_nl) ||
      garniture.nom
    );
  };

  const toggleGarniture = (garnitureId) => {
    setSelectedGarnitures((prev) =>
      prev.includes(garnitureId)
        ? prev.filter((id) => id !== garnitureId)
        : [...prev, garnitureId]
    );
  };

  const getTotal = () => {
    if (!produit) return 0;
    const totalGarnitures = garnitures
      .filter((g) => selectedGarnitures.includes(g.id))
      .reduce((sum, g) => sum + g.prix, 0);
    return produit.prix + totalGarnitures;
  };

  const handleAddToCart = async () => {
    // Double vérification de la disponibilité avant ajout
    if (!produit || !produit.disponible) {
      showNotification(t('produitIndisponible', 'Ce produit n\'est plus disponible.'), 'error');
      return;
    }

    setIsAdding(true);
    
    const garnituresChoisies = garnitures
      .filter(g => selectedGarnitures.includes(g.id))
      .map(g => ({
        id: g.id,
        nom: getGarnitureNom(g),
        prix: g.prix
      }));

    const total = getTotal();

    const article = {
      id: produit.id,
      nom: getProduitNom(),
      image: produit.image,
      prix: total,
      quantite: 1,
      type: produit.type,
      garnitures: garnituresChoisies,
      estSandwich: true,
      typePain: typePain
    };

    addToCart(article);
    
    // Animation de succès
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsAdding(false);
    
    // Notification de succès
    showNotification(t('sandwichAjoutePanier', 'Sandwich personnalisé ajouté au panier !'));
  };

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-green-100 border-green-500 text-green-700';
    const icon = type === 'error' 
      ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
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
    setTimeout(() => { 
      notification.classList.add('translate-x-full', 'opacity-0'); 
      setTimeout(() => notification.remove(), 300); 
    }, 3000);
  };

  const imageUrl = produit?.image 
    ? `${API_BASE_URL}/uploads/${produit.image}`
    : 'https://via.placeholder.com/300x200';

  // Affichage d'erreur pour produit indisponible ou introuvable
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <HeaderClient />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-red-600 text-xl font-semibold mb-2">
                {error === 'indisponible' && t('produitIndisponibleTitre', 'Produit indisponible')}
                {error === 'introuvable' && t('produitIntrouvable', 'Produit introuvable')}
                {error === 'chargement' && t('erreurChargement', 'Erreur de chargement')}
              </h2>
              <p className="text-red-600 mb-4">
                {error === 'indisponible' && t('produitIndisponibleMessage', 'Ce sandwich n\'est actuellement plus disponible à la commande.')}
                {error === 'introuvable' && t('produitIntrouvableMessage', 'Ce produit n\'existe pas ou a été supprimé.')}
                {error === 'chargement' && t('erreurChargementMessage', 'Impossible de charger les informations du produit.')}
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/')}
                  className="block w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  {t('retourAccueil', 'Retour à l\'accueil')}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="block w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  {t('retour', 'Retour')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <HeaderClient />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('chargement', 'Chargement...')}</p>
            </div>
          </div>
        ) : produit ? (
          <>
            {/* En-tête avec bouton retour */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                {t('retour', 'Retour')}
              </button>
              <h1 className="text-3xl font-bold text-amber-800">
                {t('personnaliser', 'Personnaliser')} : {getProduitNom()}
              </h1>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Section image et informations du produit */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center mb-6">
                  <img
                    src={imageUrl}
                    alt={getProduitNom()}
                    className="w-full max-w-sm mx-auto h-64 object-cover rounded-xl shadow-md"
                  />
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-amber-800">{getProduitNom()}</h2>
                  <p className="text-gray-600 leading-relaxed">{getProduitDescription()}</p>
                  
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">
                        {t('prixBase', 'Prix de base')} :
                      </span>
                      <span className="text-xl font-bold text-amber-600">
                        {produit.prix.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section garnitures */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-2">
                  <Plus className="w-6 h-6" />
                  {t('garnitures', 'Garnitures')}
                </h3>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {garnitures.map((garniture) => {
                    const isSelected = selectedGarnitures.includes(garniture.id);
                    return (
                      <div
                        key={garniture.id}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                          isSelected
                            ? 'border-amber-400 bg-amber-50 shadow-sm'
                            : 'border-gray-200 hover:border-amber-300'
                        }`}
                        onClick={() => toggleGarniture(garniture.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                              isSelected
                                ? 'bg-amber-500 border-amber-500'
                                : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="font-medium text-gray-800">
                              {getGarnitureNom(garniture)}
                            </span>
                          </div>
                          <span className="font-semibold text-amber-600">
                            +{garniture.prix.toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {garnitures.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('aucuneGarnitureDisponible', 'Aucune garniture disponible')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section récapitulatif et commande */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Récapitulatif */}
                <div className="space-y-4 flex-1">
                  <h4 className="text-lg font-semibold text-gray-800">
                    {t('recapitulatif', 'Récapitulatif')}
                  </h4>
                  <div className="space-y-3">
                    {/* Produit de base */}
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-800 font-medium">{getProduitNom()}</span>
                      <span className="text-amber-600 font-semibold">{produit.prix.toFixed(2)} €</span>
                    </div>
                    
                    {/* Garnitures sélectionnées */}
                    {selectedGarnitures.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-amber-600 font-medium text-sm">
                          {t('garnituresSelectionnees', 'Garnitures sélectionnées')} :
                        </div>
                        {garnitures
                          .filter(g => selectedGarnitures.includes(g.id))
                          .map(garniture => (
                            <div key={garniture.id} className="flex justify-between items-center py-1 pl-4 text-sm">
                              <span className="text-gray-600">• {getGarnitureNom(garniture)}</span>
                              <span className="text-amber-600 font-medium">+{garniture.prix.toFixed(2)} €</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-2">Choix du pain :</label>
                  <select
                    value={typePain}
                    onChange={(e) => setTypePain(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="blanc">Pain blanc</option>
                    <option value="gris">Pain gris</option>
                  </select>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Pain choisi :</span>
                  <span className="text-amber-700 font-semibold capitalize">{typePain}</span>
                </div>

                  
                  {/* Total */}
                  <div className="border-t-2 border-amber-200 pt-4 mt-4">
                    <div className="flex justify-between items-center text-xl font-bold text-amber-800">
                      <span>{t('total', 'Total')} :</span>
                      <span className="text-2xl">{getTotal().toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                {/* Bouton d'ajout au panier */}
                <div className="lg:ml-8">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding || !produit.disponible}
                    className="w-full lg:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isAdding ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        {t('ajoutEnCours', 'Ajout en cours...')}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        {t('ajouterAuPanier', 'Ajouter au panier')}
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default CustomizeSandwichClient;