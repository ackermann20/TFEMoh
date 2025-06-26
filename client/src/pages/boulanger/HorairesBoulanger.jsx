// src/pages/boulanger/HorairesBoulanger.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HeaderBoulanger from '../../components/boulanger/HeaderBoulanger';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const HorairesBoulanger = () => {
  const [joursFermes, setJoursFermes] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const toLocalDate = (dateStr) => {
    // Créer la date en mode local pour éviter les problèmes de fuseau horaire
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day); // month - 1 car les mois commencent à 0
    return d;
  };

  // Charger les jours fermés au montage
  useEffect(() => {
    const fetchJoursFermes = async () => {
      try {
        console.log("🔄 Chargement des jours fermés...");
        const response = await axios.get(`${API_BASE_URL}/api/horaires`);
        console.log("📅 Jours fermés reçus:", response.data);
        
        const dates = response.data.map(j => toLocalDate(j.date));
        setJoursFermes(dates);
        console.log("✅ Jours fermés chargés:", dates.map(d => d.toISOString().split('T')[0]));
      } catch (err) {
        console.error("❌ Erreur chargement jours fermés:", err);
      }
    };

    fetchJoursFermes();
  }, []);

  const estJourFerme = (date) => {
    // Formater la date locale au format YYYY-MM-DD 
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const isFerme = joursFermes.some(d => {
      const year2 = d.getFullYear();
      const month2 = String(d.getMonth() + 1).padStart(2, '0');
      const day2 = String(d.getDate()).padStart(2, '0');
      const dateStr2 = `${year2}-${month2}-${day2}`;
      return dateStr === dateStr2;
    });
    
    return isFerme;
  };

  const handleToggleDate = async (date) => {
    if (isLoading) return; // Éviter les clics multiples
    
    setIsLoading(true);
    const isFerme = estJourFerme(date);
    
    // Formater la date locale au format YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateISO = `${year}-${month}-${day}`;
    
    console.log(`🔄 ${isFerme ? 'Ouverture' : 'Fermeture'} du jour ${dateISO}`);

    try {
      if (isFerme) {
        // Ouvrir le jour (supprimer de la liste des jours fermés)
        console.log("🔓 Suppression du jour fermé...");
        await axios.delete(`${API_BASE_URL}/api/horaires/${dateISO}`);
        
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
        // Fermer le jour (ajouter à la liste des jours fermés)
        console.log("🔒 Ajout du jour fermé...");
        await axios.post(`${API_BASE_URL}/api/horaires`, { 
          date: dateISO 
        });
        
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
      
      // Afficher l'erreur à l'utilisateur
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

  // Générer le calendrier du mois
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Commencer par lundi

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

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const getMonthName = (monthIndex) => {
    const monthKeys = [
      'months.january', 'months.february', 'months.march', 'months.april',
      'months.may', 'months.june', 'months.july', 'months.august',
      'months.september', 'months.october', 'months.november', 'months.december'
    ];
    return t(monthKeys[monthIndex], monthKeys[monthIndex].split('.')[1]);
  };

  const getDayName = (dayIndex) => {
    const dayKeys = [
      'days.monday', 'days.tuesday', 'days.wednesday', 'days.thursday',
      'days.friday', 'days.saturday', 'days.sunday'
    ];
    return t(dayKeys[dayIndex], dayKeys[dayIndex].split('.')[1]);
  };
  
  const weeks = generateCalendar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <HeaderBoulanger />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
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

        {/* Légende */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-md">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-700">{t('horaires.open', 'Ouvert')}</span>
          </div>
          <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-md">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-700">{t('horaires.closed', 'Fermé')}</span>
          </div>
          <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-md">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-gray-700">{t('horaires.today', 'Aujourd\'hui')}</span>
          </div>
        </div>

        {/* Calendrier */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
          {/* Header du calendrier */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h2 className="text-2xl font-bold text-white">
                {getMonthName(currentMonth.getMonth())} {currentMonth.getFullYear()}
              </h2>
              
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

          {/* Tableau du calendrier */}
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* En-têtes des jours */}
              <thead>
                <tr className="bg-amber-100">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                    <th key={dayIndex} className="py-4 px-2 text-center font-semibold text-amber-800 text-sm md:text-base">
                      <span className="hidden sm:inline">{getDayName(dayIndex)}</span>
                      <span className="sm:hidden">{getDayName(dayIndex).charAt(0)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              
              {/* Corps du calendrier */}
              <tbody>
                {weeks.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {week.map((date, dayIndex) => {
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
                                ? 'text-gray-300 cursor-not-allowed' 
                                : isTodayDate
                                  ? 'bg-blue-500 text-white shadow-lg transform hover:scale-105'
                                  : isFerme
                                    ? 'bg-red-500 text-white shadow-md hover:bg-red-600 transform hover:scale-105'
                                    : 'bg-green-500 text-white shadow-md hover:bg-green-600 transform hover:scale-105'
                              }
                              ${isCurrentMonthDay && !isLoading ? 'hover:shadow-lg' : ''}
                              ${isLoading ? 'opacity-70 cursor-wait' : ''}
                            `}
                          >
                            <div className="flex flex-col items-center justify-center h-full">
                              <span className="font-bold">{date.getDate()}</span>
                              {isCurrentMonthDay && (
                                <span className="text-xs opacity-80 hidden md:block">
                                  {isFerme ? t('horaires.closed', 'Fermé') : t('horaires.open', 'Ouvert')}
                                </span>
                              )}
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

        {/* Statistiques */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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

        {/* Instructions */}
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