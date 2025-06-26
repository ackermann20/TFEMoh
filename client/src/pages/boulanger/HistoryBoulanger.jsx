import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import HeaderBoulanger from '../../components/boulanger/HeaderBoulanger';
import { 
  Clock, 
  User, 
  Euro, 
  Package, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  X, 
  FileText,
  TrendingUp,
  ShoppingBag,
  Filter,
  Search
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const HistoryBoulanger = () => {
  const { t, i18n } = useTranslation();
  const [commandes, setCommandes] = useState([]);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/commandes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // ✅ DEBUG : Afficher la structure des données
        console.log('🔍 Structure des commandes dans l\'historique:', JSON.stringify(res.data[0], null, 2));
        
        setCommandes(res.data);
        setError(null);
      } catch (err) {
        console.error('Erreur récupération commandes', err);
        setError(t('history.errors.loadFailed', 'Impossible de charger l\'historique des commandes.'));
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, [t]);

  // ✅ Fonction pour déterminer si c'est un sandwich
  const isSandwich = (ligne) => {
    return ligne.produit?.type === 'sandwich' || 
           ligne.estSandwich || 
           ligne.isSandwich ||
           (ligne.ligneGarnitures && ligne.ligneGarnitures.length > 0);
  };

  // ✅ Fonction pour récupérer le type de pain
  const getTypePain = (ligne) => {
    // Vérifier d'abord s'il y a un typePain direct dans la ligne
    if (ligne.typePain) {
      return ligne.typePain;
    }
    
    // Ensuite vérifier dans les garnitures
    if (ligne.ligneGarnitures && Array.isArray(ligne.ligneGarnitures) && ligne.ligneGarnitures.length > 0) {
      const garnitureAvecPain = ligne.ligneGarnitures.find(g => g?.typePain);
      if (garnitureAvecPain && garnitureAvecPain.typePain) {
        return garnitureAvecPain.typePain;
      }
    }
    
    // Valeur par défaut pour les sandwichs
    return 'blanc';
  };

  // ✅ Fonction pour obtenir le nom traduit d'une garniture
  const getGarnitureNom = (garniture) => {
    if (!garniture) return t('history.unknownTopping', 'Garniture inconnue');
    const langue = i18n.language;
    return (
      (langue === 'en' && garniture.nom_en) ||
      (langue === 'nl' && garniture.nom_nl) ||
      garniture.nom ||
      t('history.unknownTopping', 'Garniture inconnue')
    );
  };

  const toggleCommande = (commande) => {
    if (selectedCommande?.id === commande.id) {
      setSelectedCommande(null);
    } else {
      setSelectedCommande(commande);
    }
  };

  const getTotal = (commande) => {
    return commande.ligneCommandes?.reduce((sum, ligne) => {
      let total = ligne.quantite * (ligne.produit?.prix || 0);
      
      // Ajouter le prix des garnitures
      if (ligne.ligneGarnitures && Array.isArray(ligne.ligneGarnitures)) {
        ligne.ligneGarnitures.forEach(lg => {
          total += (lg.garniture?.prix || 0) * ligne.quantite;
        });
      }
      
      return sum + total;
    }, 0).toFixed(2);
  };

  // ✅ Nouvelle fonction pour calculer le prix d'une ligne avec garnitures
  const getPrixLigne = (ligne) => {
    let total = ligne.quantite * (ligne.produit?.prix || 0);
    
    // Ajouter le prix des garnitures
    if (ligne.ligneGarnitures && Array.isArray(ligne.ligneGarnitures)) {
      ligne.ligneGarnitures.forEach(lg => {
        total += (lg.garniture?.prix || 0) * ligne.quantite;
      });
    }
    
    return total.toFixed(2);
  };

  const getStatusColor = (statut) => {
    switch (statut.toLowerCase()) {
      case 'livre':
      case 'livré':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pret':
      case 'prêt':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en attente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'en preparation':
      case 'en préparation':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'annule':
      case 'annulé':
      case 'annulee':
      case 'annulée':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (statut) => {
    switch (statut.toLowerCase()) {
      case 'livre':
      case 'livré':
        return '✅';
      case 'pret':
      case 'prêt':
        return '📦';
      case 'en attente':
        return '⏳';
      case 'en preparation':
      case 'en préparation':
        return '👨‍🍳';
      case 'annule':
      case 'annulé':
      case 'annulee':
      case 'annulée':
        return '❌';
      default:
        return '📋';
    }
  };

  const normalizeStatus = (status) => {
    return status.toLowerCase()
      .replace(/é/g, 'e')
      .replace(/ê/g, 'e')
      .replace(/è/g, 'e')
      .replace(/ë/g, 'e')
      .replace(/à/g, 'a')
      .replace(/ù/g, 'u')
      .replace(/ç/g, 'c')
      .trim();
  };

  const filteredCommandes = commandes.filter(commande => {
    const matchesSearch = searchTerm === '' || 
      commande.utilisateur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.utilisateur?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.id.toString().includes(searchTerm);
    
    if (filterStatus === 'tous') {
      return matchesSearch;
    }
    
    const normalizedCommandeStatus = normalizeStatus(commande.statut);
    const normalizedFilterStatus = normalizeStatus(filterStatus);
    
    // Gestion des variantes de statuts
    const statusVariants = {
      'annule': ['annule', 'annulee', 'annulé', 'annulée'],
      'livre': ['livre', 'livré'],
      'pret': ['pret', 'prêt'],
      'en attente': ['en attente', 'en_attente', 'enattente'],
      'en preparation': ['en preparation', 'en préparation', 'en_preparation', 'enpreparation']
    };
    
    let matchesStatus = false;
    
    // Vérifier si le statut correspond directement
    if (normalizedCommandeStatus === normalizedFilterStatus) {
      matchesStatus = true;
    } else {
      // Vérifier les variantes
      for (const [baseStatus, variants] of Object.entries(statusVariants)) {
        if (normalizedFilterStatus === normalizeStatus(baseStatus)) {
          matchesStatus = variants.some(variant => 
            normalizedCommandeStatus === normalizeStatus(variant)
          );
          if (matchesStatus) break;
        }
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    return {
      total: commandes.length,
      today: commandes.filter(c => new Date(c.dateCommande).toDateString() === today).length,
      thisMonth: commandes.filter(c => {
        const cmdDate = new Date(c.dateCommande);
        return cmdDate.getMonth() === thisMonth && cmdDate.getFullYear() === thisYear;
      }).length,
      revenue: commandes.reduce((sum, c) => sum + parseFloat(getTotal(c)), 0).toFixed(2)
    };
  };

  const stats = getStats();

  // Composant carte pour mobile
  const CommandeCard = ({ commande }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-amber-500">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="bg-amber-100 rounded-full p-2 mr-3">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">#{commande.id}</h3>
            <p className="text-xs text-gray-500">
              {commande.utilisateur?.prenom} {commande.utilisateur?.nom}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(commande.statut)}`}>
          {getStatusIcon(commande.statut)} {t(`history.status.${commande.statut.toLowerCase().replace(/ /g, '_').replace(/é/g, 'e').replace(/ê/g, 'e')}`, commande.statut)}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            {new Date(commande.dateCommande).toLocaleDateString('fr-FR')}
          </div>
          <div className="flex items-center font-semibold text-amber-600">
            <Euro className="w-4 h-4 mr-1" />
            {getTotal(commande)} €
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Package className="w-4 h-4 mr-2 text-gray-400" />
          {commande.ligneCommandes?.length || 0} {t('history.items', 'article(s)')}
        </div>
      </div>
      
      <button
        onClick={() => toggleCommande(commande)}
        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <FileText className="w-4 h-4" />
        <span>{t('history.buttons.viewDetails', 'Voir détails')}</span>
        {selectedCommande?.id === commande.id ? 
          <ChevronUp className="w-4 h-4" /> : 
          <ChevronDown className="w-4 h-4" />
        }
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <HeaderBoulanger />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête avec titre et statistiques */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-amber-800 mb-2">
                {t('history.title', 'Historique des Commandes')}
              </h1>
              <p className="text-gray-600">
                {t('history.subtitle', 'Consultez toutes les commandes passées')}
              </p>
            </div>
            
            {/* Statistiques rapides */}
            <div className="mt-4 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 w-full lg:w-auto">
              <div className="bg-blue-50 p-2 lg:p-3 rounded-lg text-center">
                <div className="text-lg lg:text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-xs text-gray-600">{t('history.stats.total', 'Total')}</div>
              </div>
              <div className="bg-green-50 p-2 lg:p-3 rounded-lg text-center">
                <div className="text-lg lg:text-2xl font-bold text-green-600">{stats.today}</div>
                <div className="text-xs text-gray-600">{t('history.stats.today', 'Aujourd\'hui')}</div>
              </div>
              <div className="bg-purple-50 p-2 lg:p-3 rounded-lg text-center">
                <div className="text-lg lg:text-2xl font-bold text-purple-600">{stats.thisMonth}</div>
                <div className="text-xs text-gray-600">{t('history.stats.thisMonth', 'Ce mois')}</div>
              </div>
              <div className="bg-amber-50 p-2 lg:p-3 rounded-lg text-center">
                <div className="text-lg lg:text-2xl font-bold text-amber-600">{stats.revenue}€</div>
                <div className="text-xs text-gray-600">{t('history.stats.revenue', 'Chiffre d\'affaires')}</div>
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 mr-2 text-amber-500" />
                {t('history.search', 'Rechercher')}
              </label>
              <input
                type="text"
                placeholder={t('history.searchPlaceholder', 'Client, ID commande...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="lg:w-48">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 mr-2 text-amber-500" />
                {t('history.filterStatus', 'Filtrer par statut')}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="tous">{t('history.filters.allStatus', 'Tous les statuts')}</option>
                <option value="en attente">{t('history.status.pending', 'En attente')}</option>
                <option value="en preparation">{t('history.status.preparing', 'En préparation')}</option>
                <option value="pret">{t('history.status.ready', 'Prêt')}</option>
                <option value="livre">{t('history.status.delivered', 'Livré')}</option>
                <option value="annule">{t('history.status.cancelled', 'Annulé')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('history.loading', 'Chargement de l\'historique...')}</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              {t('history.retry', 'Réessayer')}
            </button>
          </div>
        ) : filteredCommandes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm || filterStatus !== 'tous' ? 
                t('history.messages.noResults', 'Aucune commande trouvée avec ces critères') :
                t('history.messages.empty', 'Aucune commande dans l\'historique')
              }
            </h3>
          </div>
        ) : (
          <>
            {/* Vue mobile (cartes) */}
            <div className="block lg:hidden">
              {filteredCommandes.map((commande) => (
                <CommandeCard key={commande.id} commande={commande} />
              ))}
            </div>

            {/* Vue desktop (tableau) */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-amber-50 border-b border-amber-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        {t('history.table.date', 'Date')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        {t('history.table.client', 'Client')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        {t('history.table.status', 'Statut')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        {t('history.table.amount', 'Montant')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        {t('history.table.actions', 'Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCommandes.map((commande) => (
                      <React.Fragment key={commande.id}>
                        <tr className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {new Date(commande.dateCommande).toLocaleDateString('fr-FR')}
                                </div>
                                <div className="text-xs text-gray-500">
                                  #{commande.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-amber-100 rounded-full p-2 mr-3">
                                <User className="w-4 h-4 text-amber-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {commande.utilisateur?.prenom} {commande.utilisateur?.nom}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {commande.ligneCommandes?.length || 0} {t('history.items', 'article(s)')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(commande.statut)}`}>
                              <span className="mr-1">{getStatusIcon(commande.statut)}</span>
                              {t(`history.status.${commande.statut.toLowerCase().replace(/ /g, '_').replace(/é/g, 'e').replace(/ê/g, 'e')}`, commande.statut)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm font-medium text-gray-900">
                              <Euro className="w-4 h-4 mr-1 text-amber-600" />
                              {getTotal(commande)} €
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleCommande(commande)}
                              className="text-amber-600 hover:text-amber-800 transition-colors duration-200 flex items-center space-x-1"
                            >
                              <FileText className="w-4 h-4" />
                              <span>{t('history.buttons.details', 'Détails')}</span>
                              {selectedCommande?.id === commande.id ? 
                                <ChevronUp className="w-4 h-4" /> : 
                                <ChevronDown className="w-4 h-4" />
                              }
                            </button>
                          </td>
                        </tr>

                        {/* Détails de la commande (desktop) */}
                        {selectedCommande?.id === commande.id && (
                          <tr className="bg-amber-50">
                            <td colSpan="5" className="px-6 py-6">
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                  <Package className="w-5 h-5 mr-2 text-amber-600" />
                                  {t('history.orderDetails.title', 'Détails de la commande')}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {commande.ligneCommandes?.map((ligne, i) => (
                                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                                      <div className="font-medium text-gray-900">
                                        {ligne.produit?.nom || 'Produit'}
                                      </div>
                                      
                                      {/* ✅ Affichage du type de pain pour les sandwichs */}
                                      {isSandwich(ligne) && (
                                        <div className="mt-1">
                                          <span className="text-xs text-gray-600 bg-orange-100 px-2 py-0.5 rounded-full flex items-center w-fit">
                                            🥖 Pain : <span className="capitalize font-medium ml-1">{getTypePain(ligne)}</span>
                                          </span>
                                        </div>
                                      )}

                                      {/* ✅ Affichage des garnitures */}
                                      {ligne.ligneGarnitures && ligne.ligneGarnitures.length > 0 && (
                                        <div className="mt-2">
                                          <div className="text-xs text-gray-600 mb-1 font-medium">
                                            {t('history.toppings', 'Garnitures')} :
                                          </div>
                                          <div className="flex flex-wrap gap-1">
                                            {ligne.ligneGarnitures.map((lg, j) => (
                                              <span key={j} className="bg-amber-100 text-amber-800 px-2 py-0.5 text-xs rounded-full">
                                                {getGarnitureNom(lg.garniture)}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      <div className="text-sm text-gray-600 mt-2">
                                        {t('history.orderDetails.quantity', 'Quantité')}: {ligne.quantite}
                                      </div>
                                      <div className="text-sm font-medium text-amber-600">
                                        {ligne.quantite} × {ligne.produit?.prix?.toFixed(2)} € = {(ligne.quantite * ligne.produit?.prix).toFixed(2)} €
                                        {/* ✅ Afficher le prix des garnitures si présentes */}
                                        {ligne.ligneGarnitures && ligne.ligneGarnitures.length > 0 && (
                                          <span className="text-gray-600 ml-2">
                                            + {ligne.ligneGarnitures.reduce((sum, lg) => sum + (lg.garniture?.prix || 0), 0).toFixed(2)} € garnitures
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-sm font-bold text-orange-600 mt-1">
                                        Total ligne : {getPrixLigne(ligne)} €
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-800">{t('history.orderDetails.total', 'Total')}:</span>
                                    <span className="text-xl font-bold text-amber-600">{getTotal(commande)} €</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Modal mobile pour les détails */}
        {selectedCommande && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 lg:hidden">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t('history.modal.title', 'Détails de la commande')}
                  </h3>
                  <button
                    onClick={() => setSelectedCommande(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-4 mb-6">
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">{t('history.modal.order', 'Commande')}</div>
                    <div className="font-semibold text-gray-900">#{selectedCommande.id}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">{t('history.modal.client', 'Client')}</div>
                      <div className="font-medium">{selectedCommande.utilisateur?.prenom} {selectedCommande.utilisateur?.nom}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">{t('history.modal.date', 'Date')}</div>
                      <div className="font-medium">{new Date(selectedCommande.dateCommande).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">{t('history.modal.status', 'Statut')}</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedCommande.statut)}`}>
                      {getStatusIcon(selectedCommande.statut)} {t(`history.status.${selectedCommande.statut.toLowerCase().replace(/ /g, '_').replace(/é/g, 'e').replace(/ê/g, 'e')}`, selectedCommande.statut)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-amber-600" />
                    {t('history.modal.items', 'Articles commandés')}
                  </h4>
                  {selectedCommande.ligneCommandes?.map((ligne, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-900">
                        {ligne.produit?.nom || t('history.modal.product', 'Produit')}
                      </div>
                      
                      {/* ✅ Affichage du type de pain pour les sandwichs (mobile) */}
                      {isSandwich(ligne) && (
                        <div className="mt-1">
                          <span className="text-xs text-gray-600 bg-orange-100 px-2 py-0.5 rounded-full flex items-center w-fit">
                            🥖 Pain : <span className="capitalize font-medium ml-1">{getTypePain(ligne)}</span>
                          </span>
                        </div>
                      )}

                      {/* ✅ Affichage des garnitures (mobile) */}
                      {ligne.ligneGarnitures && ligne.ligneGarnitures.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1 font-medium">
                            {t('history.toppings', 'Garnitures')} :
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {ligne.ligneGarnitures.map((lg, j) => (
                              <span key={j} className="bg-amber-100 text-amber-800 px-2 py-0.5 text-xs rounded-full">
                                {getGarnitureNom(lg.garniture)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600">{t('history.modal.quantity', 'Quantité')}: {ligne.quantite}</span>
                        <div className="text-right">
                          <div className="font-medium text-amber-600">
                            {(ligne.quantite * ligne.produit?.prix).toFixed(2)} €
                            {/* ✅ Afficher le prix des garnitures si présentes (mobile) */}
                            {ligne.ligneGarnitures && ligne.ligneGarnitures.length > 0 && (
                              <div className="text-xs text-gray-600">
                                + {ligne.ligneGarnitures.reduce((sum, lg) => sum + (lg.garniture?.prix || 0), 0).toFixed(2)} € garnitures
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-bold text-orange-600">
                            Total : {getPrixLigne(ligne)} €
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">{t('history.modal.total', 'Total')}:</span>
                    <span className="text-2xl font-bold text-amber-600">{getTotal(selectedCommande)} €</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryBoulanger;