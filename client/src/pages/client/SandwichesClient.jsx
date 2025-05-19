import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderClient from '../../components/client/HeaderClient';
import axios from 'axios';

const SandwichesClient = () => {
  const [sandwiches, setSandwiches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSandwiches = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get('http://localhost:3000/api/sandwichs');
        setSandwiches(res.data);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des sandwiches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSandwiches();
  }, []);

  const personnaliserSandwich = (id) => {
    navigate(`/customize-sandwich/${id}`);
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <HeaderClient />
      
      {/* Hero Section */}
      <div className="bg-amber-100 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-800 mb-3">
            Créez Votre Sandwich Idéal 🥪
          </h1>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Sélectionnez la base de votre choix et personnalisez-la avec nos garnitures fraîches
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Loading spinner */}
        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-amber-800 mb-6 text-center">
              Sélectionnez votre base de sandwich
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sandwiches.map((sandwich) => (
                <div key={sandwich.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={`http://localhost:3000/uploads/${sandwich.image}`}
                      alt={sandwich.description}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-amber-800 mb-2">{sandwich.description}</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Base de sandwich artisanal
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-amber-700 font-semibold text-lg">{sandwich.prixBase} €</span>
                      <button 
                        onClick={() => personnaliserSandwich(sandwich.id)} 
                        className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                      >
                        Personnaliser
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Section Informations */}
      <div className="bg-amber-100 py-10 mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-amber-800 mb-6 text-center">
            Comment ça marche ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-amber-600 text-4xl mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2 text-amber-800">Choisissez votre base</h3>
              <p className="text-gray-600">Sélectionnez parmi nos différentes bases de sandwich préparées chaque jour.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-amber-600 text-4xl mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2 text-amber-800">Ajoutez vos garnitures</h3>
              <p className="text-gray-600">Personnalisez avec nos garnitures fraîches et savoureuses selon vos goûts.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-amber-600 text-4xl mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2 text-amber-800">Validez votre commande</h3>
              <p className="text-gray-600">Ajoutez à votre panier et venez récupérer votre sandwich personnalisé.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-amber-800 text-amber-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-2">Boulangerie 🍞</h3>
              <p className="mb-4">Des produits frais, chaque jour</p>
            </div>
            <div className="mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Horaires</h3>
              <p>Lun-Ven: 7h - 19h</p>
              <p>Sam-Dim: 7h - 13h</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <p>123 Rue de la Boulangerie</p>
              <p>contact@boulangerie.com</p>
              <p>01 23 45 67 89</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-amber-700 text-center">
            <p>&copy; {new Date().getFullYear()} Boulangerie. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SandwichesClient;