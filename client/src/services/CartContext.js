import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
  try {
    const stored = localStorage.getItem('panier');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed
        .filter(item => item && item.id && item.nom)
        .map(item => ({
          ...item,
          quantite: item.quantite || item.quantity || 1,
          prix: item.prix || 0,
        }));
    }
  } catch (e) {
    console.error("❌ Erreur parsing localStorage panier :", e);
  }
  return [];
});

  // Charger les éléments du panier depuis localStorage au montage
  useEffect(() => {
    const storedItems = localStorage.getItem('panier');
    if (storedItems) {
      try {
        const parsed = JSON.parse(storedItems);
        console.log('🔄 Chargement du panier depuis localStorage:', parsed);
        
        // Vérifier et nettoyer les données
        const corrected = parsed
          .filter(item => item && item.id && item.nom) // Filtrer les items invalides
          .map(item => ({
            ...item,
            quantite: item.quantite || item.quantity || 1,
            prix: item.prix || 0 // S'assurer qu'il y a un prix
          }));
        
        console.log('✅ Panier corrigé:', corrected);
        setCartItems(corrected);

      } catch (error) {
        console.error('❌ Erreur lors du chargement du panier:', error);
        localStorage.setItem('panier', JSON.stringify([]));
        setCartItems([]);
      }
    }
  }, []);

  // Mettre à jour localStorage quand le panier change
  useEffect(() => {
    console.log('💾 Sauvegarde du panier:', cartItems);
    localStorage.setItem('panier', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    console.log('➕ Ajout au panier:', item);
    
    // Vérifier que l'item est valide
    if (!item || !item.id || !item.nom || item.prix === undefined) {
      console.error('❌ Item invalide:', item);
      return;
    }
    
    setCartItems(prevItems => {
      // Rechercher si le produit existe déjà (même ID et mêmes garnitures)
      const index = prevItems.findIndex(p =>
        p.id === item.id &&
        JSON.stringify(p.garnitures || []) === JSON.stringify(item.garnitures || [])
      );

      if (index !== -1) {
        // Produit déjà présent → augmenter la quantité
        const updated = [...prevItems];
        const quantiteAjout = item.quantite || item.quantity || 1;
        updated[index].quantite = (updated[index].quantite || 1) + quantiteAjout;
        console.log('🔄 Quantité mise à jour:', updated[index]);
        return updated;
      } else {
        // Nouveau produit → l'ajouter avec quantité = 1
        const newItem = { 
          ...item, 
          quantite: item.quantite || item.quantity || 1,
          prix: item.prix || 0
        };
        console.log('🆕 Nouveau produit ajouté:', newItem);
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (index) => {
    console.log('🗑️ Suppression de l\'article à l\'index:', index);
    setCartItems(prevItems => {
      const newItems = [...prevItems];
      newItems.splice(index, 1);
      console.log('✅ Panier après suppression:', newItems);
      return newItems;
    });
  };

  const clearCart = () => {
    console.log('🧹 Vidage du panier');
    setCartItems([]);
  };

  const totalPrice = () => {
    return cartItems.reduce((total, item) => {
      const prix = item.prix || 0;
      const quantite = item.quantite || 1;
      return total + (prix * quantite);
    }, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      setCartItems, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
};