import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import HeaderClient from '../../components/client/HeaderClient';
import { useContext } from 'react';
import { CartContext } from '../../services/CartContext';

const CustomizeSandwichClient = () => {
  const { id } = useParams();
  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [garnitures, setGarnitures] = useState([]);
  const [selectedGarnitures, setSelectedGarnitures] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduitEtGarnitures = async () => {
      try {
        const [resProduit, resGarnitures] = await Promise.all([
          axios.get(`http://localhost:3000/api/produits/${id}`),
          axios.get(`http://localhost:3000/api/garnitures`)
        ]);
        setProduit(resProduit.data);
        setGarnitures(resGarnitures.data);
      } catch (error) {
        console.error('Erreur lors du chargement', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduitEtGarnitures();
  }, [id]);

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


 const handleAddToCart = () => {
  const garnituresChoisies = garnitures
    .filter(g => selectedGarnitures.includes(g.id))
    .map(g => ({
      id: g.id,
      nom: g.nom,
      prix: g.prix
    }));

  const total = getTotal();

  const article = {
    id: produit.id,
    nom: produit.nom,
    image: produit.image,
    prix: total,
    quantite: 1,
    type: produit.type,
    garnitures: garnituresChoisies,
    estSandwich: true
  };

  addToCart(article); // ✅ Ajoute via le contexte partagé
  alert('Sandwich personnalisé ajouté au panier !');
};



  return (
  <div className="bg-neutral-50 min-h-screen">
    <HeaderClient />
    <div className="max-w-4xl mx-auto px-4 py-8">
      {loading ? (
        <p className="text-center text-gray-600">Chargement...</p>
      ) : produit ? (
        <>
          <h1 className="text-2xl font-bold mb-6 text-amber-800">
            Personnaliser : {produit.nom}
          </h1>

          <div className="flex gap-6">
            <img
              src={`http://localhost:3000/uploads/${produit.image}`}
              alt={produit.nom}
              className="w-40 h-40 object-cover rounded-md shadow"
            />
            <div>
              <p className="mb-2 text-gray-700">{produit.description}</p>
              <p className="font-semibold text-lg mb-4">
                Prix de base : {produit.prix.toFixed(2)} €
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2 text-amber-800">Garnitures</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {garnitures.map((garniture) => (
                <label key={garniture.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedGarnitures.includes(garniture.id)}
                    onChange={() => toggleGarniture(garniture.id)}
                  />
                  {garniture.nom} (+{garniture.prix.toFixed(2)} €)
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 text-right text-lg font-bold text-amber-900">
            Total : {getTotal().toFixed(2)} €
          </div>

          {/* 🔸 BOUTON AJOUTER AU PANIER */}
          <div className="mt-6 text-right">
            <button
              onClick={handleAddToCart}
              className="bg-amber-600 text-white font-semibold px-6 py-2 rounded hover:bg-amber-700"
            >
              Ajouter au panier
            </button>
          </div>
        </>
      ) : (
        <p className="text-red-600 text-center">Produit introuvable</p>
      )}
    </div>
  </div>
);

};

export default CustomizeSandwichClient;
