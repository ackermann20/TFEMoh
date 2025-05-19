import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../../components/client/ProductCard';

const ProductsClient = () => {
  const [produits, setProduits] = useState([]);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/produits');
        setProduits(res.data);
      } catch (err) {
        console.error(err);
        setErreur("Erreur lors du chargement des produits.");
      }
    };

    fetchProduits();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Liste des produits</h2>
      {erreur && <p style={{ color: 'red' }}>{erreur}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {produits.map((produit) => (
          <ProductCard key={produit.id} produit={produit} />
        ))}
      </div>
    </div>
  );
};

export default ProductsClient;
