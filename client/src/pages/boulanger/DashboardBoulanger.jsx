import React, { useEffect, useState } from 'react';
import HeaderBoulanger from '../../components/boulanger/HeaderBoulanger';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Calendar, Search, Filter, Clock, User, Package, Euro } from 'lucide-react';

/**
 * Composant principal du tableau de bord du boulanger
 * Permet de visualiser et gérer toutes les commandes reçues
 * Fonctionnalités : filtrage par date/statut, recherche, mise à jour des statuts
 */
const DashboardBoulanger = () => {
  // Hook pour la gestion de l'internationalisation (français, anglais, néerlandais)
  const { t, i18n } = useTranslation();
  
  // États pour la gestion des données et de l'interface
  const [commandes, setCommandes] = useState([]); // Liste de toutes les commandes
  const [loading, setLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // Gestion des erreurs
  const [filtreStatut, setFiltreStatut] = useState('tous'); // Filtre par statut des commandes
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche
  const [dateFiltre, setDateFiltre] = useState(new Date().toISOString().split('T')[0]); // Filtre par date (défaut: aujourd'hui)
  const [isSearching, setIsSearching] = useState(false); // Indicateur si une recherche est active

  // URL de base de l'API (depuis les variables d'environnement ou localhost par défaut)
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  /**
   * Fonction utilitaire pour formater les tranches horaires selon la langue sélectionnée
   * @param {string} tranche - La tranche horaire ('matin', 'midi', 'soir')
   * @returns {string} - La tranche formatée selon la langue
   */
  const formaterPlageHoraire = (tranche) => {
    const tranches = {
      'matin': {
        fr: '7h - 11h',
        en: '7am - 11am',
        nl: '7u - 11u'
      },
      'midi': {
        fr: '12h - 14h',
        en: '12pm - 2pm',
        nl: '12u - 14u'
      },
      'soir': {
        fr: '14h - 19h',
        en: '2pm - 7pm',
        nl: '14u - 19u'
      }
    };
    
    const langue = i18n.language;
    return tranches[tranche]?.[langue] || tranche;
  };

  /**
   * Fonction pour formater les dates selon les conventions locales de chaque langue
   * @param {string} dateString - Date au format ISO
   * @returns {string} - Date formatée localement
   */
  const formaterDate = (dateString) => {
    const date = new Date(dateString);
    const langue = i18n.language;
    
    // Options de formatage pour chaque langue
    const options = {
      fr: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      en: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      nl: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    };

    // Locales correspondantes
    const locales = {
      fr: 'fr-FR',
      en: 'en-US',
      nl: 'nl-NL'
    };

    return date.toLocaleDateString(locales[langue] || 'fr-FR', options[langue] || options.fr);
  };

  /**
   * Détermine la classe CSS pour le badge de statut selon l'état de la commande
   * @param {string} statut - Le statut de la commande
   * @returns {string} - Classes CSS pour le style du badge
   */
  const getStatutBadgeClass = (statut) => {
    switch (statut) {
      case 'en attente':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'en préparation':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'prêt':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'annulé':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'livré':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  /**
   * Récupère le nom du produit dans la langue sélectionnée
   * Utilise les champs nom_en, nom_nl ou nom selon la langue
   * @param {Object} produit - L'objet produit
   * @returns {string} - Le nom traduit du produit
   */
  const getProduitNom = (produit) => {
    if (!produit) return t('dashboard.unknownProduct', 'Produit inconnu');
    const langue = i18n.language;
    return (
      (langue === 'en' && produit.nom_en) ||
      (langue === 'nl' && produit.nom_nl) ||
      produit.nom ||
      t('dashboard.unknownProduct', 'Produit inconnu')
    );
  };

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
    ,
    gris: {
      fr: 'gris',
      en: 'gray',
      nl: 'grijs'
    }
  };

  return pains[nomPain]?.[i18n.language] || nomPain;
};


  /**
   * Récupère le nom de la garniture dans la langue sélectionnée
   * @param {Object} garniture - L'objet garniture
   * @returns {string} - Le nom traduit de la garniture
   */
  const getGarnitureNom = (garniture) => {
    if (!garniture) return t('dashboard.unknownTopping', 'Garniture inconnue');
    const langue = i18n.language;
    return (
      (langue === 'en' && garniture.nom_en) ||
      (langue === 'nl' && garniture.nom_nl) ||
      garniture.nom ||
      t('dashboard.unknownTopping', 'Garniture inconnue')
    );
  };

  /**
   * Détermine si un produit est un sandwich en vérifiant plusieurs propriétés
   * Vérifie le type, les propriétés booléennes ou la présence de garnitures
   * @param {Object} produit - L'objet produit à vérifier
   * @returns {boolean} - true si c'est un sandwich
   */
  const isSandwich = (produit) => {
    return produit?.type === 'sandwich' || 
           produit?.estSandwich || 
           produit?.isSandwich ||
           (produit?.garnitures && produit.garnitures.length > 0);
  };

  /**
   * Récupère le type de pain pour un sandwich
   * Cherche d'abord dans les propriétés directes du produit, puis dans les garnitures
   * @param {Object} produit - L'objet produit
   * @returns {string} - Le type de pain ('blanc' par défaut)
   */
  const getTypePain = (produit) => {
    // Vérifier d'abord s'il y a un typePain direct sur le produit
    if (produit?.typePain) {
      return produit.typePain;
    }
    
    // Ensuite vérifier dans les garnitures
    if (produit?.garnitures && Array.isArray(produit.garnitures) && produit.garnitures.length > 0) {
      const garnitureAvecPain = produit.garnitures.find(g => g?.typePain);
      if (garnitureAvecPain && garnitureAvecPain.typePain) {
        return garnitureAvecPain.typePain;
      }
    }
    
    // Valeur par défaut pour les sandwichs
    return 'blanc';
  };

  /**
   * Calcule le montant total d'une commande en additionnant :
   * - Prix des produits × quantité
   * - Prix des garnitures
   * Fallback sur le prixTotal de la commande si le calcul échoue
   * @param {Object} cmd - L'objet commande
   * @returns {number} - Le montant total calculé
   */
  const calculerTotalCommande = (cmd) => {
    if (!cmd || !cmd.Produits || !Array.isArray(cmd.Produits)) {
      // Si pas de produits, utiliser le prixTotal de la commande
      return parseFloat(cmd?.prixTotal) || 0;
    }
    
    const totalCalcule = cmd.Produits.reduce((total, prod) => {
      if (!prod) return total;
      
      const quantite = parseInt(prod.quantite) || 1;
      const prixProduit = (parseFloat(prod.prix) || 0) * quantite;
      
      // Calcul du prix des garnitures
      const prixGarnitures = (prod.garnitures && Array.isArray(prod.garnitures)) 
        ? prod.garnitures.reduce((sousTotal, garniture) => {
            if (!garniture) return sousTotal;
            return sousTotal + (parseFloat(garniture.prix) || 0);
          }, 0)
        : 0;
      
      return total + prixProduit + prixGarnitures;
    }, 0);

    // Si le calcul donne 0 mais qu'il y a un prixTotal dans la commande, utiliser ce dernier
    return totalCalcule > 0 ? totalCalcule : (parseFloat(cmd.prixTotal) || 0);
  };

  /**
   * Traduit les statuts des commandes selon la langue sélectionnée
   * @param {string} statut - Le statut à traduire
   * @returns {string} - Le statut traduit
   */
  const getStatutTraduction = (statut) => {
    const statuts = {
      'en attente': t('dashboard.status.pending', 'En attente'),
      'en préparation': t('dashboard.status.preparing', 'En préparation'),
      'prêt': t('dashboard.status.ready', 'Prêt'),
      'annulé': t('dashboard.status.cancelled', 'Annulé'),
      'livré': t('dashboard.status.delivered', 'Livré')
    };
    return statuts[statut] || statut;
  };

  /**
   * Met à jour le statut d'une commande via l'API
   * Envoie une requête PUT et met à jour l'état local en cas de succès
   * @param {number} commandeId - ID de la commande à mettre à jour
   * @param {string} nouveauStatut - Le nouveau statut à appliquer
   */
  const handleStatutUpdate = async (commandeId, nouveauStatut) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Requête API pour mettre à jour le statut
      await axios.put(`${API_BASE_URL}/api/boulanger/commandes/${commandeId}/statut`, {
        statut: nouveauStatut
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Mise à jour de l'état local
      setCommandes(prev =>
        prev.map(cmd =>
          cmd.id === commandeId ? { ...cmd, statut: nouveauStatut } : cmd
        )
      );
      
      // Affichage d'une notification de succès
      showNotification(
        t('dashboard.notifications.orderUpdated', 'Commande #{{id}} mise à jour avec succès!', { id: commandeId }), 
        'success'
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
      showNotification(t('dashboard.notifications.updateError', 'Impossible de mettre à jour la commande.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Affiche une notification temporaire en haut à droite de l'écran
   * Crée dynamiquement un élément DOM avec animation d'entrée/sortie
   * @param {string} message - Le message à afficher
   * @param {string} type - Type de notification ('success' ou 'error')
   */
  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    const bgColor = type === 'error' 
      ? 'bg-red-100 border-red-500 text-red-700' 
      : 'bg-green-100 border-green-500 text-green-700';
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
    
    // Animation d'apparition
    document.body.appendChild(notification);
    setTimeout(() => { 
      notification.classList.remove('translate-x-full', 'opacity-0'); 
    }, 10);
    
    // Animation de disparition après 4 secondes
    setTimeout(() => { 
      notification.classList.add('translate-x-full', 'opacity-0'); 
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  };

  /**
   * Effect Hook pour charger les commandes au montage du composant et lors des changements de filtre de date
   * Effectue une requête GET vers l'API selon la date sélectionnée
   */
  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Construire l'URL avec le filtre de date
        const url = dateFiltre 
          ? `${API_BASE_URL}/api/boulanger/commandes-by-date?date=${dateFiltre}`
          : `${API_BASE_URL}/api/boulanger/commandes-aujourdhui`;

        // Requête API avec authentification JWT
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setCommandes(res.data);
        setError(null);
        
        // Debug temporaire pour voir la structure des données
        if (res.data && res.data.length > 0) {
          console.log('Structure des données reçues:', JSON.stringify(res.data[0], null, 2));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des commandes :", error);
        setError(t('dashboard.errors.loadFailed', 'Impossible de charger les commandes. Veuillez réessayer plus tard.'));
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, [dateFiltre, t]); // Dépendances : se re-exécute quand la date ou la langue change

  /**
   * Filtre les commandes selon les critères sélectionnés :
   * - Statut (si différent de 'tous')
   * - Terme de recherche (nom, prénom du client ou ID de commande)
   */
  const commandesFiltrees = (commandes || [])
    .filter(cmd => filtreStatut === 'tous' || cmd.statut === filtreStatut)
    .filter(cmd => {
      if (!searchTerm.trim()) return true;
      const searchLower = searchTerm.toLowerCase().trim();
      const prenom = (cmd.utilisateur?.prenom || '').toLowerCase();
      const nom = (cmd.utilisateur?.nom || '').toLowerCase();
      const nomComplet = `${prenom} ${nom}`.toLowerCase();
      return prenom.includes(searchLower) || 
             nom.includes(searchLower) || 
             nomComplet.includes(searchLower) ||
             String(cmd.id || '').includes(searchLower);
    });

  /**
   * Calcule les statistiques des commandes pour l'affichage dans le dashboard
   * Compte le nombre de commandes par statut et calcule le chiffre d'affaires
   * @returns {Object} - Objet contenant toutes les statistiques
   */
  const getStatsCommandes = () => {
    if (!commandes || commandes.length === 0) {
      return {
        total: 0,
        enAttente: 0,
        enPreparation: 0,
        pret: 0,
        livre: 0,
        annule: 0,
        chiffreAffaires: 0
      };
    }

    // Calcul du chiffre d'affaires (exclut les commandes annulées)
    const chiffreAffaires = commandes.reduce((total, cmd) => {
      // Ne compter que les commandes validées (pas annulées)
      if (cmd.statut === 'annulé') return total;
      return total + calculerTotalCommande(cmd);
    }, 0);

    return {
      total: commandes.length,
      enAttente: commandes.filter(cmd => cmd.statut === 'en attente').length,
      enPreparation: commandes.filter(cmd => cmd.statut === 'en préparation').length,
      pret: commandes.filter(cmd => cmd.statut === 'prêt').length,
      livre: commandes.filter(cmd => cmd.statut === 'livré').length,
      annule: commandes.filter(cmd => cmd.statut === 'annulé').length,
      chiffreAffaires: chiffreAffaires
    };
  };

  // Calcul des statistiques pour l'affichage
  const stats = getStatsCommandes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header fixe avec navigation du boulanger */}
      <HeaderBoulanger />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section en-tête avec titre et statistiques */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-800 mb-2">
                {t('dashboard.title', 'Tableau de bord')}
              </h1>
              <p className="text-gray-600">
                {t('dashboard.subtitle', 'Gestion des commandes et aperçu de l\'activité')}
              </p>
            </div>
            
            {/* Cartes de statistiques rapides */}
            <div className="mt-4 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              {/* Total des commandes */}
              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{stats.total}</div>
                <div className="text-xs text-gray-600">{t('dashboard.stats.total', 'Total')}</div>
              </div>
              {/* Commandes en attente */}
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.enAttente}</div>
                <div className="text-xs text-gray-600">{t('dashboard.stats.pending', 'En attente')}</div>
              </div>
              {/* Commandes prêtes */}
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.pret}</div>
                <div className="text-xs text-gray-600">{t('dashboard.stats.ready', 'Prêtes')}</div>
              </div>
              {/* Chiffre d'affaires */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.chiffreAffaires.toFixed(2)}€</div>
                <div className="text-xs text-gray-600">{t('dashboard.stats.revenue', 'CA')}</div>
              </div>
            </div>
          </div>

          {/* Section des filtres et contrôles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Filtre de date de retrait */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 mr-2 text-amber-500" />
                {t('dashboard.filters.date', 'Date de retrait')}
              </label>
              <input
                type="date"
                value={dateFiltre}
                onChange={(e) => setDateFiltre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Barre de recherche */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Search className="w-4 h-4 mr-2 text-amber-500" />
                {t('dashboard.filters.search', 'Recherche')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('dashboard.searchPlaceholder', 'Client, commande #...')}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsSearching(true);
                  }}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {/* Bouton pour effacer la recherche */}
                {searchTerm && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setIsSearching(false);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Filtre par statut */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Filter className="w-4 h-4 mr-2 text-amber-500" />
                {t('dashboard.filters.status', 'Statut')}
              </label>
              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="tous">{t('dashboard.status.all', 'Tous')}</option>
                <option value="en attente">{t('dashboard.status.pending', 'En attente')}</option>
                <option value="en préparation">{t('dashboard.status.preparing', 'En préparation')}</option>
                <option value="prêt">{t('dashboard.status.ready', 'Prêt')}</option>
                <option value="livré">{t('dashboard.status.delivered', 'Livré')}</option>
                <option value="annulé">{t('dashboard.status.cancelled', 'Annulé')}</option>
              </select>
            </div>

            {/* Bouton de réinitialisation des filtres */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 opacity-0">Reset</label>
              <button
                onClick={() => {
                  setDateFiltre(new Date().toISOString().split('T')[0]);
                  setSearchTerm('');
                  setFiltreStatut('tous');
                  setIsSearching(false);
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
              >
                {t('dashboard.filters.reset', 'Réinitialiser')}
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
              <p className="text-gray-600">{t('dashboard.loading', 'Chargement des commandes...')}</p>
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
              {t('dashboard.retry', 'Réessayer')}
            </button>
          </div>
        ) : commandesFiltrees.length === 0 ? (
          // État vide - aucune commande trouvée
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t('dashboard.noOrders', 'Aucune commande trouvée')}
            </h3>
            <p className="text-gray-600">
              {isSearching 
                ? t('dashboard.noSearchResults', 'Aucun résultat pour "{{term}}"', { term: searchTerm })
                : t('dashboard.noOrdersForDate', 'Aucune commande pour cette date.')
              }
            </p>
          </div>
        ) : (
          // Grille des cartes de commandes
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {commandesFiltrees.map((cmd) => (
              <div 
                key={cmd.id} 
                className="bg-white rounded-xl shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* En-tête de la carte commande */}
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 border-b border-amber-200">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg text-amber-900">
                      {t('dashboard.order', 'Commande')} #{cmd.id}
                    </h3>
                    {/* Badge de statut avec couleur dynamique */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutBadgeClass(cmd.statut)}`}>
                      {getStatutTraduction(cmd.statut)}
                    </span>
                  </div>
                  {/* Informations client dans l'en-tête */}
                  <div className="flex items-center text-sm text-amber-800">
                    <User className="w-4 h-4 mr-1" />
                    {cmd.utilisateur?.prenom || t('dashboard.unknownClient', 'Client inconnu')} {cmd.utilisateur?.nom || ''}
                  </div>
                </div>
                
                {/* Corps de la carte avec détails de la commande */}
                <div className="p-4 space-y-4">
                  {/* Section dates - commande et retrait */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {t('dashboard.orderDate', 'Commandée le')}
                      </p>
                      <p className="font-medium">{formaterDate(cmd.dateRetrait)}</p>
                      <p className="text-xs text-amber-600 font-medium">
                        {formaterPlageHoraire(cmd.trancheHoraireRetrait)}
                      </p>
                    </div>
                  </div>

                  {/* Section informations client détaillées */}
                  {cmd.utilisateur && (
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {t('dashboard.clientInfo', 'Informations client')}
                      </h4>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">
                          {cmd.utilisateur.prenom} {cmd.utilisateur.nom}
                        </p>
                        {/* Lien téléphone cliquable */}
                        {cmd.utilisateur.telephone && (
                          <p>
                            <a 
                              href={`tel:${cmd.utilisateur.telephone}`} 
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              📞 {cmd.utilisateur.telephone}
                            </a>
                          </p>
                        )}
                        {/* Email du client */}
                        {cmd.utilisateur.email && (
                          <p className="text-xs text-gray-600 truncate">
                            ✉️ {cmd.utilisateur.email}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section liste des produits commandés */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                      <Package className="w-4 h-4 mr-1" />
                      {t('dashboard.products', 'Produits')}
                    </h4>
                    <ul className="space-y-2">
                      {/* Mapping sur chaque produit de la commande */}
                      {cmd.Produits && Array.isArray(cmd.Produits) && cmd.Produits.map((prod, i) => {
                        if (!prod) return null; // Protection contre les produits null/undefined
                        
                        return (
                          <li key={i} className="text-sm border-b border-gray-100 pb-2 last:border-b-0">
                            {/* Ligne principale : quantité × nom du produit et prix */}
                            <div className="flex justify-between items-start">
                              <span className="font-medium">
                                {parseInt(prod.quantite) || 1} × {getProduitNom(prod)}
                              </span>
                              <span className="text-amber-600 font-semibold">
                                {(parseFloat(prod.prix) || 0).toFixed(2)} €
                              </span>
                            </div>

                            {/* Affichage spécial pour les sandwichs : type de pain */}
                            {isSandwich(prod) && (
                              <div className="ml-4 mt-1">
                                <span className="text-xs text-gray-600 bg-orange-100 px-2 py-0.5 rounded-full flex items-center w-fit">
                                  🥖 {t('pain')} : <span className="capitalize font-medium ml-1">{getNomPain(getTypePain(prod))}</span>
                                </span>
                              </div>
                            )}

                            {/* Liste des garnitures avec leurs prix */}
                            {prod.garnitures && Array.isArray(prod.garnitures) && prod.garnitures.length > 0 && (
                              <ul className="ml-4 mt-1 space-y-1">
                                {prod.garnitures.map((g, j) => {
                                  if (!g) return null; // Protection contre les garnitures null
                                  return (
                                    <li key={j} className="text-xs text-gray-500 flex justify-between">
                                      <span>+ {getGarnitureNom(g)}</span>
                                      <span>+{(parseFloat(g.prix) || 0).toFixed(2)} €</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Section total et actions selon le statut */}
                  <div className="pt-3 border-t border-amber-100">
                    {/* Affichage du montant total */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold flex items-center">
                        <Euro className="w-4 h-4 mr-1" />
                        {t('dashboard.total', 'Total')}
                      </span>
                      <span className="font-bold text-xl text-amber-800">
                        {(calculerTotalCommande(cmd) || 0).toFixed(2)} €
                      </span>
                    </div>
                    
                    {/* Boutons d'action conditionnels selon le statut de la commande */}
                    
                    {/* Statut "en attente" : Accepter ou Refuser */}
                    {cmd.statut === 'en attente' && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleStatutUpdate(cmd.id, 'en préparation')}
                          className="py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex justify-center items-center"
                        >
                          ✓ {t('dashboard.actions.accept', 'Accepter')}
                        </button>
                        <button
                          onClick={() => handleStatutUpdate(cmd.id, 'annulé')}
                          className="py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex justify-center items-center"
                        >
                          × {t('dashboard.actions.refuse', 'Refuser')}
                        </button>
                      </div>
                    )}
                    
                    {/* Statut "en préparation" : Marquer comme prêt */}
                    {cmd.statut === 'en préparation' && (
                      <button
                        onClick={() => handleStatutUpdate(cmd.id, 'prêt')}
                        className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {t('dashboard.actions.markReady', 'Marquer comme prêt')}
                      </button>
                    )}
                    
                    {/* Statut "prêt" : Marquer comme livré */}
                    {cmd.statut === 'prêt' && (
                      <button
                        onClick={() => handleStatutUpdate(cmd.id, 'livré')}
                        className="w-full py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {t('dashboard.actions.markDelivered', 'Marquer comme livré')}
                      </button>
                    )}
                    
                    {/* Pour les statuts "livré" et "annulé", aucune action n'est disponible */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardBoulanger;