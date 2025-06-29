import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import HeaderBoulanger from '../../components/boulanger/HeaderBoulanger';
import { Search, Filter, Package, Euro, Eye, EyeOff, Edit3, Plus, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Composant ProductBoulanger - Interface de gestion des produits et garnitures
 * 
 * Fonctionnalités principales :
 * - Vue double : produits ET garnitures avec toggle
 * - Gestion de disponibilité en temps réel (toggle disponible/indisponible)
 * - Système de prix promotionnels pour les produits
 * - Modification des prix de base pour produits et garnitures
 * - Filtrage avancé par catégorie et recherche textuelle
 * - Statistiques dynamiques selon le mode d'affichage
 * - Interface responsive avec cartes visuelles
 * - Gestion d'images avec fallback par défaut
 * - Traduction multilingue des noms de produits/garnitures
 */
const ProductBoulanger = () => {
  // Hook pour la traduction multilingue
  const { t, i18n } = useTranslation();
  
  // États pour la gestion des données
  const [produits, setProduits] = useState([]); // Liste des produits
  const [garnitures, setGarnitures] = useState([]); // Liste des garnitures
  const [loading, setLoading] = useState(true); // État de chargement initial
  const [error, setError] = useState(null); // Gestion des erreurs
  
  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche
  const [filterCategory, setFilterCategory] = useState("all"); // Filtre par catégorie (produits uniquement)
  const [viewMode, setViewMode] = useState("produits"); // Mode d'affichage : "produits" ou "garnitures"
  
  // États pour la gestion des prix
  const [tempPrices, setTempPrices] = useState({}); // Prix promotionnels temporaires avant validation
  const [nouveauPrixProduit, setNouveauPrixProduit] = useState({}); // Nouveaux prix de base pour produits
  const [nouveauPrixGarniture, setNouveauPrixGarniture] = useState({}); // Nouveaux prix pour garnitures

  // Configuration de l'API depuis les variables d'environnement
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  /**
   * Génère l'URL complète pour les images des produits/garnitures
   * Fournit une image par défaut si aucune image n'est définie
   * @param {string} imageFileName - Nom du fichier image
   * @returns {string} - URL complète de l'image
   */
  const getImageUrl = (imageFileName) => {
    if (!imageFileName) return `${API_BASE_URL}/uploads/default.jpg`;
    return `${API_BASE_URL}/uploads/${imageFileName}`;
  };

  /**
   * Obtient le nom traduit d'un produit selon la langue sélectionnée
   * Utilise les champs nom_en, nom_nl ou nom selon la langue active
   * @param {Object} produit - Objet produit avec propriétés multilingues
   * @returns {string} - Nom traduit du produit
   */
  const getProduitNom = (produit) => {
    if (!produit) return t('products.unknownProduct', 'Produit inconnu');
    const langue = i18n.language;
    return (
      (langue === 'en' && produit.nom_en) ||
      (langue === 'nl' && produit.nom_nl) ||
      produit.nom ||
      t('products.unknownProduct', 'Produit inconnu')
    );
  };

  /**
   * Obtient le nom traduit d'une garniture selon la langue sélectionnée
   * @param {Object} garniture - Objet garniture avec propriétés multilingues
   * @returns {string} - Nom traduit de la garniture
   */
  const getGarnitureNom = (garniture) => {
    if (!garniture) return t('products.unknownTopping', 'Garniture inconnue');
    const langue = i18n.language;
    return (
      (langue === 'en' && garniture.nom_en) ||
      (langue === 'nl' && garniture.nom_nl) ||
      garniture.nom ||
      t('products.unknownTopping', 'Garniture inconnue')
    );
  };

  /**
   * Effect Hook pour charger les données au montage du composant
   * Lance le chargement des produits et garnitures en parallèle
   */
  useEffect(() => {
    fetchProduits();
    fetchGarnitures();
  }, []);

  /**
   * Récupère la liste des produits depuis l'API
   * Gère les états de chargement et d'erreur
   */
  const fetchProduits = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/produits`);
      setProduits(res.data);
      setError(null);
    } catch (error) {
      console.error("Erreur fetch produits:", error);
      setError(t('products.errors.loadFailed', 'Impossible de charger les produits. Veuillez réessayer plus tard.'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Récupère la liste des garnitures depuis l'API
   * Fonction séparée pour permettre le rechargement indépendant
   */
  const fetchGarnitures = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/garnitures`);
      setGarnitures(res.data);
    } catch (error) {
      console.error("Erreur fetch garnitures:", error);
    }
  };

  /**
   * Met à jour un produit via l'API avec authentification JWT
   * Met à jour l'état local optimiste, rollback en cas d'erreur
   * @param {number} id - ID du produit à mettre à jour
   * @param {Object} updates - Objet contenant les champs à modifier
   */
  const updateProduit = async (id, updates) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Requête API pour la mise à jour
      await axios.put(`${API_BASE_URL}/api/boulanger/produits/${id}`, updates, config);
      
      // Mise à jour optimiste de l'état local
      setProduits(prevProduits => 
        prevProduits.map(prod => 
          prod.id === id ? { ...prod, ...updates } : prod
        )
      );
    } catch (err) {
      console.error("Erreur mise à jour produit:", err);
      // En cas d'erreur, recharger les données depuis l'API
      fetchProduits();
    }
  };

  /**
   * Met à jour une garniture via l'API avec authentification JWT
   * Fonctionnement similaire à updateProduit mais pour les garnitures
   * @param {number} id - ID de la garniture à mettre à jour
   * @param {Object} updates - Objet contenant les champs à modifier
   */
  const updateGarniture = async (id, updates) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(`${API_BASE_URL}/api/boulanger/garnitures/${id}`, updates, config);
      
      // Mise à jour optimiste de l'état local
      setGarnitures(prevGarnitures => 
        prevGarnitures.map(garn => 
          garn.id === id ? { ...garn, ...updates } : garn
        )
      );
    } catch (err) {
      console.error("Erreur mise à jour garniture:", err);
      fetchGarnitures();
    }
  };

  /**
   * Gère la modification temporaire des prix promotionnels
   * Stocke les valeurs dans un état temporaire avant validation
   * @param {number} productId - ID du produit
   * @param {string} newPrice - Nouveau prix en chaîne de caractères
   */
  const handlePriceChange = (productId, newPrice) => {
    setTempPrices(prev => ({
      ...prev,
      [productId]: newPrice
    }));
  };

  /**
   * Valide et applique un prix promotionnel
   * Convertit la chaîne en nombre ou null pour supprimer la promotion
   * @param {number} productId - ID du produit à mettre à jour
   */
  const validatePrice = (productId) => {
    const newPrice = tempPrices[productId];
    if (newPrice !== undefined) {
      // Conversion : chaîne vide = null (pas de promotion), sinon parseFloat
      const prixPromo = newPrice === "" ? null : parseFloat(newPrice);
      updateProduit(productId, { prixPromo });
      
      // Nettoyer l'état temporaire après validation
      setTempPrices(prev => {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  /**
   * Filtre les produits selon les critères de recherche et de catégorie
   * Utilise une logique de correspondance basée sur les mots-clés pour les catégories
   */
  const filteredProducts = produits.filter(product => {
    const productName = getProduitNom(product);
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Système de filtrage par catégorie basé sur les mots-clés dans le nom
    const matchesCategory = filterCategory === "all" || 
      (filterCategory === "pain" && (productName.toLowerCase().includes("pain") || productName.toLowerCase().includes("baguette") || productName.toLowerCase().includes("bread"))) ||
      (filterCategory === "viennoiserie" && (productName.toLowerCase().includes("croissant") || productName.toLowerCase().includes("chocolat") || productName.toLowerCase().includes("pastry"))) ||
      (filterCategory === "sandwich" && productName.toLowerCase().includes("sandwich")) ||
      (filterCategory === "boisson" && (productName.toLowerCase().includes("bouteille") || productName.toLowerCase().includes("drink") || productName.toLowerCase().includes("beverage")));
    
    return matchesSearch && matchesCategory;
  });

  /**
   * Filtre les garnitures selon le terme de recherche uniquement
   * Plus simple que les produits car pas de catégories pour les garnitures
   */
  const filteredGarnitures = garnitures.filter(garniture => {
    const garnitureName = getGarnitureNom(garniture);
    return garnitureName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  /**
   * Calcule les statistiques des produits pour l'affichage dans le header
   * @returns {Object} - Objet contenant total, disponibles, indisponibles, en promotion
   */
  const getStatsProducts = () => {
    if (!produits || produits.length === 0) {
      return { total: 0, disponibles: 0, indisponibles: 0, enPromotion: 0 };
    }
    return {
      total: produits.length,
      disponibles: produits.filter(p => p.disponible).length,
      indisponibles: produits.filter(p => !p.disponible).length,
      enPromotion: produits.filter(p => p.prixPromo).length // Produits ayant un prix promotionnel
    };
  };

  /**
   * Calcule les statistiques des garnitures
   * Plus simple que les produits (pas de promotions)
   * @returns {Object} - Objet contenant total, disponibles, indisponibles
   */
  const getStatsGarnitures = () => {
    if (!garnitures || garnitures.length === 0) {
      return { total: 0, disponibles: 0, indisponibles: 0 };
    }
    return {
      total: garnitures.length,
      disponibles: garnitures.filter(g => g.disponible).length,
      indisponibles: garnitures.filter(g => !g.disponible).length
    };
  };

  // Sélection des statistiques selon le mode d'affichage actuel
  const stats = viewMode === "produits" ? getStatsProducts() : getStatsGarnitures();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header de navigation du boulanger */}
      <HeaderBoulanger />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section en-tête avec toggle, titre et statistiques */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* Toggle pour basculer entre produits et garnitures */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setViewMode("produits")}
                className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === "produits"
                    ? "bg-amber-600 text-white shadow-md"
                    : "text-gray-600 hover:text-amber-600"
                }`}
              >
                🍞 {t('products.products', 'Produits')}
              </button>
              <button
                onClick={() => setViewMode("garnitures")}
                className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === "garnitures"
                    ? "bg-amber-600 text-white shadow-md"
                    : "text-gray-600 hover:text-amber-600"
                }`}
              >
                🥬 {t('products.toppings', 'Garnitures')}
              </button>
            </div>
          </div>

          {/* Titre et description conditionnels selon le mode */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-800 mb-2">
                {viewMode === "produits" 
                  ? t('products.title', 'Gestion des Produits')
                  : t('products.toppingsTitle', 'Gestion des Garnitures')
                }
              </h1>
              <p className="text-gray-600">
                {viewMode === "produits" 
                  ? t('products.subtitle', 'Gérez la disponibilité et les prix de vos produits')
                  : t('products.toppingsSubtitle', 'Gérez la disponibilité de vos garnitures')
                }
              </p>
            </div>
            
            {/* Cartes de statistiques rapides */}
            <div className="mt-4 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              {/* Total */}
              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{stats.total}</div>
                <div className="text-xs text-gray-600">{t('products.stats.total', 'Total')}</div>
              </div>
              {/* Disponibles */}
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.disponibles}</div>
                <div className="text-xs text-gray-600">{t('products.stats.available', 'Disponibles')}</div>
              </div>
              {/* Indisponibles */}
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.indisponibles}</div>
                <div className="text-xs text-gray-600">{t('products.stats.unavailable', 'Indisponibles')}</div>
              </div>
              {/* En promotion (uniquement pour les produits) */}
              {viewMode === "produits" && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.enPromotion}</div>
                  <div className="text-xs text-gray-600">{t('products.stats.onSale', 'En promo')}</div>
                </div>
              )}
            </div>
          </div>

          {/* Section des filtres et contrôles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Barre de recherche */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Search className="w-4 h-4 mr-2 text-amber-500" />
                {t('products.filters.search', 'Recherche')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={viewMode === "produits" 
                    ? t('products.searchPlaceholder', 'Nom du produit...')
                    : t('products.searchToppingsPlaceholder', 'Nom de la garniture...')
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {/* Bouton pour effacer la recherche */}
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Filtre par catégorie - uniquement visible pour les produits */}
            {viewMode === "produits" && (
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Filter className="w-4 h-4 mr-2 text-amber-500" />
                  {t('products.filters.category', 'Catégorie')}
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="all">{t('products.categories.all', 'Tous les produits')}</option>
                  <option value="pain">{t('products.categories.bread', 'Pains')}</option>
                  <option value="viennoiserie">{t('products.categories.pastry', 'Viennoiseries')}</option>
                  <option value="sandwich">{t('products.categories.sandwich', 'Sandwichs')}</option>
                  <option value="boisson">{t('products.categories.drink', 'Boissons')}</option>
                </select>
              </div>
            )}

            {/* Bouton de réinitialisation des filtres */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 opacity-0">Reset</label>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
              >
                {t('products.filters.reset', 'Réinitialiser')}
              </button>
            </div>
          </div>
        </div>

        {/* Section de contenu principal - gestion des différents états */}
        {loading ? (
          // État de chargement avec spinner
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('products.loading', 'Chargement des produits...')}</p>
            </div>
          </div>
        ) : error ? (
          // État d'erreur avec bouton de retry
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              {t('products.retry', 'Réessayer')}
            </button>
          </div>
        ) : (
          <>
            {/* Affichage conditionnel selon le mode sélectionné */}
            {viewMode === "produits" ? (
              // Affichage des produits
              filteredProducts.length === 0 ? (
                // État vide pour les produits
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {t('products.noProducts', 'Aucun produit trouvé')}
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? t('products.noSearchResults', 'Aucun résultat pour "{{term}}"', { term: searchTerm })
                      : t('products.noProductsForCategory', 'Aucun produit dans cette catégorie.')
                    }
                  </p>
                </div>
              ) : (
                // Grille des cartes de produits
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((prod) => (
                    <div 
                      key={prod.id} 
                      className="bg-white rounded-xl shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Section image avec badges de statut */}
                      <div className="relative h-48 bg-gradient-to-br from-amber-50 to-orange-100">
                        <img
                          src={getImageUrl(prod.image)}
                          alt={getProduitNom(prod)}
                          className="w-full h-full object-cover"
                        />
                        {/* Badge de disponibilité */}
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                          prod.disponible 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {prod.disponible 
                            ? t('products.available', 'Disponible')
                            : t('products.unavailable', 'Indisponible')
                          }
                        </div>
                        {/* Badge de promotion (si applicable) */}
                        {prod.prixPromo && (
                          <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold animate-pulse">
                            PROMO
                          </div>
                        )}
                      </div>
                      
                      {/* Section détails du produit */}
                      <div className="p-6 space-y-4">
                        {/* Nom et prix */}
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{getProduitNom(prod)}</h3>
                          <div className="flex items-center space-x-2">
                            {prod.prixPromo ? (
                              // Affichage prix barré + prix promo
                              <>
                                <span className="text-lg text-gray-400 line-through">
                                  {prod.prix.toFixed(2)} €
                                </span>
                                <span className="text-2xl font-bold text-red-600">
                                  {prod.prixPromo.toFixed(2)} €
                                </span>
                              </>
                            ) : (
                              // Affichage prix normal
                              <span className="text-2xl font-bold text-gray-800">
                                {prod.prix.toFixed(2)} €
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Section contrôles */}
                        <div className="space-y-4">
                          {/* Bouton toggle disponibilité */}
                          <button
                            className={`w-full px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 ${
                              prod.disponible 
                                ? "bg-orange-500 hover:bg-orange-600 shadow-lg" 
                                : "bg-green-500 hover:bg-green-600 shadow-lg"
                            }`}
                            onClick={() => updateProduit(prod.id, { disponible: !prod.disponible })}
                          >
                            {prod.disponible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            <span>
                              {prod.disponible 
                                ? t('products.makeUnavailable', 'Rendre indisponible')
                                : t('products.makeAvailable', 'Rendre disponible')
                              }
                            </span>
                          </button>

                          {/* Section gestion prix promotion */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('products.promoPrice', 'Prix promotion')} (€)
                            </label>
                            <div className="flex space-x-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                  value={tempPrices[prod.id] !== undefined ? tempPrices[prod.id] : (prod.prixPromo ?? "")}
                                  onChange={(e) => handlePriceChange(prod.id, e.target.value)}
                                  placeholder={t('products.noPromo', 'Aucune promotion')}
                                />
                                <Edit3 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              </div>
                              {/* Bouton validation prix promo */}
                              <button
                                onClick={() => validatePrice(prod.id)}
                                className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors duration-200"
                                title="Valider le prix"
                              >
                                ✓
                              </button>
                            </div>
                            {/* Indicateur de promotion active */}
                            {prod.prixPromo && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ Promotion active : {prod.prixPromo.toFixed(2)}€
                              </p>
                            )}
                          </div>

                          {/* Section modification prix de base */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Prix de base (€)
                            </label>
                            <div className="flex space-x-2 items-center">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={nouveauPrixProduit[prod.id] ?? prod.prix}
                                onChange={(e) =>
                                  setNouveauPrixProduit((prev) => ({
                                    ...prev,
                                    [prod.id]: parseFloat(e.target.value),
                                  }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                              {/* Bouton validation prix de base */}
                              <button
                                onClick={() => updateProduit(prod.id, { prix: nouveauPrixProduit[prod.id] })}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md"
                              >
                                Valider
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Affichage des garnitures
              filteredGarnitures.length === 0 ? (
                // État vide pour les garnitures
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {t('products.noToppings', 'Aucune garniture trouvée')}
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? t('products.noSearchResults', 'Aucun résultat pour "{{term}}"', { term: searchTerm })
                      : t('products.noToppingsAvailable', 'Aucune garniture disponible.')
                    }
                  </p>
                </div>
              ) : (
                // Grille des cartes de garnitures
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredGarnitures.map((garn) => (
                    <div 
                      key={garn.id} 
                      className="bg-white rounded-xl shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Section image avec badge de statut */}
                      <div className="relative h-48 bg-gradient-to-br from-green-50 to-emerald-100">
                        <img
                          src={getImageUrl(garn.image)}
                          alt={getGarnitureNom(garn)}
                          className="w-full h-full object-cover"
                        />
                        {/* Badge de disponibilité pour garnitures */}
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                          garn.disponible 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {garn.disponible 
                            ? t('products.available', 'Disponible')
                            : t('products.unavailable', 'Indisponible')
                          }
                        </div>
                      </div>
                      
                      {/* Section détails de la garniture */}
                      <div className="p-6 space-y-4">
                        {/* Nom et prix de la garniture */}
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{getGarnitureNom(garn)}</h3>
                          <span className="text-2xl font-bold text-gray-800">
                            {garn.prix.toFixed(2)} €
                          </span>
                        </div>

                        {/* Bouton toggle disponibilité pour garnitures */}
                        <button
                          className={`w-full px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 ${
                            garn.disponible 
                              ? "bg-orange-500 hover:bg-orange-600 shadow-lg" 
                              : "bg-green-500 hover:bg-green-600 shadow-lg"
                          }`}
                          onClick={() => updateGarniture(garn.id, { disponible: !garn.disponible })}
                        >
                          {garn.disponible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          <span>
                            {garn.disponible 
                              ? t('products.makeUnavailable', 'Rendre indisponible')
                              : t('products.makeAvailable', 'Rendre disponible')
                            }
                          </span>
                        </button>

                        {/* Section modification prix de garniture */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prix (€)
                          </label>
                          <div className="flex space-x-2 items-center">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={nouveauPrixGarniture[garn.id] ?? garn.prix}
                              onChange={(e) =>
                                setNouveauPrixGarniture((prev) => ({
                                  ...prev,
                                  [garn.id]: parseFloat(e.target.value),
                                }))
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            {/* Bouton validation prix de garniture */}
                            <button
                              onClick={() => updateGarniture(garn.id, { prix: nouveauPrixGarniture[garn.id] })}
                              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md"
                            >
                              Valider
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ProductBoulanger;