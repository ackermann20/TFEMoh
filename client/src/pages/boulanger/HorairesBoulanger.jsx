// src/pages/boulanger/HorairesBoulanger.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HeaderBoulanger from '../../components/boulanger/HeaderBoulanger';
import { useTranslation } from 'react-i18next';

// URL de base de l'API depuis les variables d'environnement ou localhost par défaut
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

/**
 * Composant HorairesBoulanger - Interface de gestion des jours de fermeture
 * 
 * Fonctionnalités principales :
 * - Affichage calendaire des jours ouverts/fermés
 * - Toggle pour ouvrir/fermer des jours en un clic
 * - Navigation mensuelle avec flèches
 * - Statistiques en temps réel (jours ouverts, fermés, taux d'ouverture)
 * - Interface responsive avec légende et instructions
 * - Gestion des fuseaux horaires pour éviter les décalages
 * - Feedback visuel avec états de chargement
 */
const HorairesBoulanger = () => {
  // États pour la gestion des données et de l'interface
  const [joursFermes, setJoursFermes] = useState([]); // Liste des dates fermées (objets Date)
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Mois actuellement affiché
  const [isLoading, setIsLoading] = useState(false); // État de chargement pour éviter les clics multiples
  const { t } = useTranslation(); // Hook pour la traduction multilingue

  /**
   * Fonction utilitaire pour créer une date locale à partir d'une chaîne YYYY-MM-DD
   * Évite les problèmes de fuseau horaire en construisant la date en mode local
   * @param {string} dateStr - Date au format "YYYY-MM-DD"
   * @returns {Date} - Objet Date en heure locale
   */
  const toLocalDate = (dateStr) => {
    // Créer la date en mode local pour éviter les problèmes de fuseau horaire
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day); // month - 1 car les mois commencent à 0
    return d;
  };

  /**
   * Effect Hook pour charger les jours fermés depuis l'API au montage du composant
   * Récupère la liste complète des jours de fermeture et les convertit en objets Date locaux
   */
  useEffect(() => {
    const fetchJoursFermes = async () => {
      try {
        console.log("🔄 Chargement des jours fermés...");
        const response = await axios.get(`${API_BASE_URL}/api/horaires`);
        console.log("📅 Jours fermés reçus:", response.data);
        
        // Convertir les chaînes de dates en objets Date locaux
        const dates = response.data.map(j => toLocalDate(j.date));
        setJoursFermes(dates);
        console.log("✅ Jours fermés chargés:", dates.map(d => d.toISOString().split('T')[0]));
      } catch (err) {
        console.error("❌ Erreur chargement jours fermés:", err);
      }
    };

    fetchJoursFermes();
  }, []);

  /**
   * Vérifie si une date donnée est dans la liste des jours fermés
   * Compare les dates en format YYYY-MM-DD pour éviter les problèmes d'heures
   * @param {Date} date - Date à vérifier
   * @returns {boolean} - true si le jour est fermé
   */
  const estJourFerme = (date) => {
    // Formater la date locale au format YYYY-MM-DD 
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Chercher dans la liste des jours fermés
    const isFerme = joursFermes.some(d => {
      const year2 = d.getFullYear();
      const month2 = String(d.getMonth() + 1).padStart(2, '0');
      const day2 = String(d.getDate()).padStart(2, '0');
      const dateStr2 = `${year2}-${month2}-${day2}`;
      return dateStr === dateStr2;
    });
    
    return isFerme;
  };

  /**
   * Gère le toggle (ouverture/fermeture) d'un jour spécifique
   * Envoie une requête API et met à jour l'état local en conséquence
   * @param {Date} date - Date à modifier
   */
  const handleToggleDate = async (date) => {
    if (isLoading) return; // Éviter les clics multiples pendant le chargement
    
    setIsLoading(true);
    const isFerme = estJourFerme(date);
    
    // Formater la date locale au format ISO YYYY-MM-DD pour l'API
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateISO = `${year}-${month}-${day}`;
    
    console.log(`🔄 ${isFerme ? 'Ouverture' : 'Fermeture'} du jour ${dateISO}`);

    try {
      if (isFerme) {
        // Ouvrir le jour : supprimer de la liste des jours fermés
        console.log("🔓 Suppression du jour fermé...");
        await axios.delete(`${API_BASE_URL}/api/horaires/${dateISO}`);
        
        // Mettre à jour l'état local en retirant le jour de la liste
        setJoursFermes(prev => {
          const nouveauxJours = prev.filter(d => {
            const year2 = d.getFullYear();
            const month2 = String(d.getMonth() + 1).padStart(2, '0');
            const day2 = String(d.getDate()).padStart(2, '0');
            const dateStr2 = `${year2}-${month2}-${day2}`;
            return dateStr2 !== dateISO;
          });
          console.log("✅ Jour supprimé. Nouveaux jours fermés:", nouveauxJours.map(d => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
          }));
          return nouveauxJours;
        });
        
      } else {
        // Fermer le jour : ajouter à la liste des jours fermés
        console.log("🔒 Ajout du jour fermé...");
        await axios.post(`${API_BASE_URL}/api/horaires`, { 
          date: dateISO 
        });
        
        // Mettre à jour l'état local en ajoutant le nouveau jour fermé
        const nouvelleDateFermee = toLocalDate(dateISO);
        setJoursFermes(prev => {
          const nouveauxJours = [...prev, nouvelleDateFermee];
          console.log("✅ Jour ajouté. Nouveaux jours fermés:", nouveauxJours.map(d => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
          }));
          return nouveauxJours;
        });
      }
      
    } catch (err) {
      console.error("❌ Erreur lors de la modification:", err);
      
      // Afficher un message d'erreur détaillé à l'utilisateur
      if (err.response) {
        console.error("Détails de l'erreur:", err.response.data);
        alert(`Erreur: ${err.response.data.message || 'Impossible de modifier le statut du jour'}`);
      } else {
        alert('Erreur de connexion au serveur');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Génère la structure du calendrier pour le mois courant
   * Crée une grille 7x6 (semaines x jours) en commençant par lundi
   * @returns {Array<Array<Date>>} - Tableau bidimensionnel de dates (semaines contenant des jours)
   */
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    // Ajuster pour commencer par lundi (getDay() renvoie 0=dimanche, 1=lundi, etc.)
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);

    const weeks = [];
    let currentDate = new Date(startDate);

    // Générer 6 semaines pour couvrir tout le mois
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        weekDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(weekDays);
      
      // Arrêter si on dépasse le mois et qu'on est en nouvelle semaine
      if (currentDate.getMonth() !== month && weekDays.length === 7) break;
    }

    return weeks;
  };

  /**
   * Navigation entre les mois (précédent/suivant)
   * @param {number} direction - -1 pour le mois précédent, +1 pour le suivant
   */
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  /**
   * Vérifie si une date correspond à aujourd'hui
   * @param {Date} date - Date à vérifier
   * @returns {boolean} - true si c'est aujourd'hui
   */
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  /**
   * Vérifie si une date appartient au mois actuellement affiché
   * @param {Date} date - Date à vérifier
   * @returns {boolean} - true si la date est dans le mois courant
   */
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  /**
   * Récupère le nom traduit d'un mois selon la langue sélectionnée
   * @param {number} monthIndex - Index du mois (0-11)
   * @returns {string} - Nom traduit du mois
   */
  const getMonthName = (monthIndex) => {
    const monthKeys = [
      'months.january', 'months.february', 'months.march', 'months.april',
      'months.may', 'months.june', 'months.july', 'months.august',
      'months.september', 'months.october', 'months.november', 'months.december'
    ];
    return t(monthKeys[monthIndex], monthKeys[monthIndex].split('.')[1]);
  };

  /**
   * Récupère le nom traduit d'un jour de la semaine selon la langue sélectionnée
   * @param {number} dayIndex - Index du jour (0=lundi, 6=dimanche)
   * @returns {string} - Nom traduit du jour
   */
  const getDayName = (dayIndex) => {
    const dayKeys = [
      'days.monday', 'days.tuesday', 'days.wednesday', 'days.thursday',
      'days.friday', 'days.saturday', 'days.sunday'
    ];
    return t(dayKeys[dayIndex], dayKeys[dayIndex].split('.')[1]);
  };
  
  // Générer le calendrier pour le rendu
  const weeks = generateCalendar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header de navigation du boulanger */}
      <HeaderBoulanger />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Section d'en-tête avec titre et description */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-6 shadow-lg">
            <span className="text-2xl text-white">📅</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-4">
            {t('horaires.title', 'Gérer les jours de fermeture')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('horaires.subtitle', 'Cliquez sur un jour pour l\'ajouter ou le retirer des jours de fermeture.')}
          </p>
        </div>

        {/* Légende des couleurs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {/* Jour ouvert */}
          <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-md">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-700">{t('horaires.open', 'Ouvert')}</span>
          </div>
          {/* Jour fermé */}
          <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-md">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-700">{t('horaires.closed', 'Fermé')}</span>
          </div>
          {/* Aujourd'hui */}
          <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-md">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-700">{t('horaires.today', 'Aujourd\'hui')}</span>
          </div>
        </div>

        {/* Widget calendrier principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
          {/* En-tête du calendrier avec navigation */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Bouton mois précédent */}
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Titre du mois et année */}
              <h2 className="text-2xl font-bold text-white">
                {getMonthName(currentMonth.getMonth())} {currentMonth.getFullYear()}
              </h2>
              
              {/* Bouton mois suivant */}
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Grille du calendrier */}
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* En-têtes des jours de la semaine */}
              <thead>
                <tr className="bg-amber-100">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                    <th key={dayIndex} className="py-4 px-2 text-center font-semibold text-amber-800 text-sm md:text-base">
                      {/* Affichage adaptatif : nom complet sur desktop, initiale sur mobile */}
                      <span className="hidden sm:inline">{getDayName(dayIndex)}</span>
                      <span className="sm:hidden">{getDayName(dayIndex).charAt(0)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              
              {/* Corps du calendrier avec les dates */}
              <tbody>
                {weeks.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {week.map((date, dayIndex) => {
                      // Calcul des états pour chaque jour
                      const isFerme = estJourFerme(date);
                      const isCurrentMonthDay = isCurrentMonth(date);
                      const isTodayDate = isToday(date);
                      
                      return (
                        <td key={dayIndex} className="p-1 border-b border-gray-100">
                          <button
                            onClick={() => handleToggleDate(date)}
                            disabled={!isCurrentMonthDay || isLoading}
                            className={`
                              w-full h-12 md:h-16 rounded-lg transition-all duration-200 text-sm md:text-base font-medium relative
                              ${!isCurrentMonthDay 
                                ? 'text-gray-300 cursor-not-allowed' // Jours d'autres mois
                                : isTodayDate
                                  ? 'bg-blue-500 text-white shadow-lg transform hover:scale-105' // Aujourd'hui
                                  : isFerme
                                    ? 'bg-red-500 text-white shadow-md hover:bg-red-600 transform hover:scale-105' // Jour fermé
                                    : 'bg-green-500 text-white shadow-md hover:bg-green-600 transform hover:scale-105' // Jour ouvert
                              }
                              ${isCurrentMonthDay && !isLoading ? 'hover:shadow-lg' : ''}
                              ${isLoading ? 'opacity-70 cursor-wait' : ''}
                            `}
                          >
                            <div className="flex flex-col items-center justify-center h-full">
                              {/* Numéro du jour */}
                              <span className="font-bold">{date.getDate()}</span>
                              {/* Texte de statut (visible uniquement sur desktop) */}
                              {isCurrentMonthDay && (
                                <span className="text-xs opacity-80 hidden md:block">
                                  {isFerme ? t('horaires.closed', 'Fermé') : t('horaires.open', 'Ouvert')}
                                </span>
                              )}
                              {/* Spinner de chargement */}
                              {isLoading && isCurrentMonthDay && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              )}
                            </div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section statistiques en temps réel */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Nombre de jours ouverts dans le mois */}
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('horaires.openDays', 'Jours ouverts')}</h3>
            <p className="text-2xl font-bold text-green-600">
              {weeks.flat().filter(date => 
                isCurrentMonth(date) && !estJourFerme(date)
              ).length}
            </p>
          </div>

          {/* Nombre de jours fermés dans le mois */}
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">❌</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('horaires.closedDays', 'Jours fermés')}</h3>
            <p className="text-2xl font-bold text-red-600">
              {weeks.flat().filter(date => 
                isCurrentMonth(date) && estJourFerme(date)
              ).length}
            </p>
          </div>

          {/* Taux d'ouverture en pourcentage */}
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('horaires.openingRate', 'Taux d\'ouverture')}</h3>
            <p className="text-2xl font-bold text-amber-600">
              {(() => {
                const totalDays = weeks.flat().filter(date => isCurrentMonth(date)).length;
                const openDays = weeks.flat().filter(date => isCurrentMonth(date) && !estJourFerme(date)).length;
                return totalDays > 0 ? Math.round((openDays / totalDays) * 100) : 0;
              })()}%
            </p>
          </div>
        </div>

        {/* Section instructions d'utilisation */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6 border border-amber-200">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl text-white">💡</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-800 mb-2">{t('horaires.instructionsTitle', 'Instructions')}</h3>
                <ul className="space-y-1 text-amber-700 text-sm">
                  <li>• {t('horaires.instruction1', 'Cliquez sur un jour vert pour le fermer')}</li>
                  <li>• {t('horaires.instruction2', 'Cliquez sur un jour rouge pour le rouvrir')}</li>
                  <li>• {t('horaires.instruction3', 'Les changements sont sauvegardés automatiquement')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorairesBoulanger;