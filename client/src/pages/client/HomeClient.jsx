import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HeaderClient from '../../components/client/HeaderClient';
import ProductCard from '../../components/client/ProductCard';
import ProductFilter from '../../components/client/ProductFilter';
import { useTranslation } from 'react-i18next';

/**
 * Composant principal de la page d'accueil client
 * Permet aux clients de parcourir, filtrer et rechercher des produits de boulangerie
 */
const HomeClient = () => {
  // États pour la gestion des produits et de l'interface
  const [produits, setProduits] = useState([]); // Liste complète des produits récupérés depuis l'API
  const [filteredProduits, setFilteredProduits] = useState([]); // Produits après application des filtres
  const [selectedTypes, setSelectedTypes] = useState([]); // Types de produits sélectionnés pour le filtrage
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche saisi par l'utilisateur
  const [erreur, setErreur] = useState(''); // Message d'erreur en cas de problème avec l'API
  const [isLoading, setIsLoading] = useState(true); // État de chargement pour afficher le spinner
  
  // Hook d'internationalisation pour le support multi-langue
  const { t } = useTranslation();

  // Configuration de l'URL de base de l'API (variable d'environnement ou localhost par défaut)
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  /**
   * useEffect pour récupérer la liste des produits au montage du composant
   * Effectue un appel API GET pour obtenir tous les produits disponibles
   */
  useEffect(() => {
    const fetchProduits = async () => {
      setIsLoading(true); // Activation du spinner de chargement
      try {
        // Appel API pour récupérer les produits
        const res = await axios.get(`${API_BASE_URL}/api/produits`);
        setProduits(res.data); // Stockage des produits dans l'état
      } catch (err) {
        console.error(err); // Log de l'erreur pour le debugging
        setErreur(t("erreurChargementProduits")); // Affichage d'un message d'erreur traduit
      } finally {
        setIsLoading(false); // Désactivation du spinner dans tous les cas
      }
    };

    fetchProduits(); // Exécution de la fonction de récupération
  }, [t]); // Dépendance sur 't' pour relancer si la langue change

  /**
   * useEffect pour le filtrage en temps réel des produits
   * Se déclenche à chaque changement de produits, types sélectionnés ou terme de recherche
   */
  useEffect(() => {
    let filtered = produits; // Copie de la liste complète des produits

    // Filtrage par type de produit si des types sont sélectionnés
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(produit =>
        selectedTypes.includes(produit.type || 'autre') // Inclusion si le type correspond (fallback sur 'autre')
      );
    }

    // Filtrage par terme de recherche si un terme est saisi
    if (searchTerm.trim() !== '') {
      const lower = searchTerm.toLowerCase(); // Conversion en minuscules pour recherche insensible à la casse
      filtered = filtered.filter(produit =>
        // Recherche dans le nom ou la description du produit
        (produit.nom || '').toLowerCase().includes(lower) ||
        (produit.description || '').toLowerCase().includes(lower)
      );
    }

    setFilteredProduits(filtered); // Mise à jour de la liste filtrée
  }, [produits, selectedTypes, searchTerm]); // Dépendances pour déclencher le filtrage

  /**
   * Gestionnaire de changement des filtres par type
   * @param {Array} newSelectedTypes - Nouveaux types sélectionnés
   */
  const handleFilterChange = (newSelectedTypes) => {
    setSelectedTypes(newSelectedTypes);
  };

  /**
   * Fonction pour effacer le terme de recherche
   */
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Composant header de navigation pour les clients */}
      <HeaderClient />

      {/* Section hero avec titre et slogan de bienvenue */}
      <div className="bg-amber-100 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-amber-800 mb-4">
            {t('titreAccueil')} {/* Titre traduit */}
          </h1>
          <p className="text-xl text-amber-700 max-w-2xl mx-auto">
            {t('sloganAccueil')} {/* Slogan traduit */}
          </p>
        </div>
      </div>

      {/* Section principale des produits */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-amber-800 mb-8 text-center">
          {t('produits')} {/* Titre de section traduit */}
        </h2>

        {/* Affichage conditionnel du message d'erreur */}
        {erreur && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{erreur}</p>
          </div>
        )}

        {/* Affichage conditionnel : spinner de chargement ou contenu principal */}
        {isLoading ? (
          <div className="flex justify-center my-8">
            {/* Spinner animé pendant le chargement */}
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          </div>
        ) : (
          <>
            {/* Barre de filtres et recherche - Interface complète de filtrage */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-amber-200">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                
                {/* Section Filtres par type de produit */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔍</span> {/* Emoji décoratif */}
                  <span className="text-lg font-semibold text-gray-700 whitespace-nowrap">
                    {t('filtres', 'Filtres')} : {/* Label avec fallback */}
                  </span>
                  {/* Composant de filtrage par type */}
                  <ProductFilter
                    produits={produits}
                    onFilterChange={handleFilterChange}
                    selectedTypes={selectedTypes}
                  />
                </div>

                {/* Séparateur vertical visible uniquement sur desktop */}
                <div className="hidden lg:block w-px h-12 bg-gray-300"></div>

                {/* Section Recherche textuelle */}
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">🔎</span> {/* Emoji décoratif */}
                  <span className="text-lg font-semibold text-gray-700 whitespace-nowrap">
                    {t('recherche', 'Recherche')} : {/* Label avec fallback */}
                  </span>
                  <div className="relative flex-1 max-w-md">
                    {/* Champ de saisie pour la recherche */}
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)} // Mise à jour en temps réel
                      placeholder={t('rechercherProduit', 'Rechercher un produit...')}
                      className="w-full pl-4 pr-10 py-3 border-2 border-amber-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-amber-50/50"
                    />
                    {/* Bouton d'effacement conditionnel (visible si terme de recherche) */}
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={t('effacerRecherche', 'Effacer la recherche')}
                      >
                        {/* Icône SVG de croix */}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Section Compteur de résultats */}
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-100 px-4 py-2 rounded-lg whitespace-nowrap">
                  <span className="text-lg">📊</span> {/* Emoji décoratif */}
                  <span className="font-medium">
                    {/* Affichage du nombre de produits trouvés avec gestion des pluriels */}
                    {t('produitsTrouves', { count: filteredProduits.length })}
                  </span>
                </div>
              </div>

              {/* Section des filtres actifs - Affichage conditionnel */}
              {(selectedTypes.length > 0 || searchTerm) && (
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      {t('filtresActifs', 'Filtres actifs')} : {/* Label */}
                    </span>
                    
                    {/* Affichage des types sélectionnés sous forme de badges */}
                    {selectedTypes.map((type) => (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {/* Nom du type traduit avec capitalisation */}
                        {t(`type${type.charAt(0).toUpperCase() + type.slice(1)}`, type)}
                        {/* Bouton de suppression du filtre */}
                        <button
                          onClick={() => handleFilterChange(selectedTypes.filter(t => t !== type))}
                          className="ml-1 hover:text-amber-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    {/* Badge du terme de recherche actif */}
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        "{searchTerm}" {/* Terme entre guillemets */}
                        {/* Bouton de suppression de la recherche */}
                        <button
                          onClick={clearSearch}
                          className="ml-1 hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {/* Bouton pour effacer tous les filtres */}
                    <button
                      onClick={() => {
                        handleFilterChange([]);
                        setSearchTerm('');
                      }}
                      className="ml-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
                    >
                      {t('toutEffacer', 'Tout effacer')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Grille responsive des produits filtrés */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProduits.map((produit) => (
                <div key={produit.id} className="flex justify-center">
                  {/* Composant carte de produit */}
                  <ProductCard produit={produit} />
                </div>
              ))}
            </div>

            {/* Message d'état vide - Affiché quand aucun produit ne correspond aux filtres */}
            {filteredProduits.length === 0 && produits.length > 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div> {/* Grande icône de recherche */}
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                  {t('aucunResultat', 'Aucun résultat trouvé')}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {t('aucunProduitCorrespondFiltre', 'Aucun produit ne correspond à vos critères de recherche.')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {/* Bouton pour effacer tous les filtres */}
                  <button
                    onClick={() => {
                      handleFilterChange([]);
                      setSearchTerm('');
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {t('effacerTousFiltres', 'Effacer tous les filtres')}
                  </button>
                  {/* Bouton pour effacer seulement la recherche */}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-200"
                  >
                    {t('effacerRecherche', 'Effacer la recherche')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer avec informations sur la boulangerie */}
      <footer className="bg-amber-800 text-amber-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            {/* Section gauche : nom et slogan */}
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">Boulangerie 🍞</h3>
              <p>{t('sloganFooter')}</p> {/* Slogan traduit */}
            </div>
            {/* Section droite : horaires d'ouverture */}
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('horairesFooter')}</h3>
              <p>{t('semaine')}: 7h - 20h</p> {/* Horaires en semaine */}
              <p>{t('weekend')}: 7h - 19h</p> {/* Horaires weekend */}
            </div>
          </div>
          {/* Ligne de copyright */}
          <div className="mt-6 pt-4 border-t border-amber-700 text-center">
            <p>&copy; {new Date().getFullYear()} Boulangerie. {t('droitsReserves')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeClient;