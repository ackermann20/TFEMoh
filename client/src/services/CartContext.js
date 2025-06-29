import React, { createContext, useState, useEffect } from 'react';

// Création du contexte CartContext
export const CartContext = createContext();

/**
 * Provider du contexte panier :
 * Permet à toute l'application d'accéder au panier et de le modifier
 */
export const CartProvider = ({ children }) => {
  // État du panier
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

  /**
   * Chargement du panier au montage depuis le localStorage
   */
  useEffect(() => {
    const storedItems = localStorage.getItem('panier');
    if (storedItems) {
      try {
        const parsed = JSON.parse(storedItems);
        console.log('🔄 Chargement du panier depuis localStorage:', parsed);

        const corrected = parsed
          .filter(item => item && item.id && item.nom)
          .map(item => ({
            ...item,
            quantite: item.quantite || item.quantity || 1,
            prix: item.prix || 0
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

  /**
   * Sauvegarde du panier à chaque modification dans le localStorage
   */
  useEffect(() => {
    console.log('💾 Sauvegarde du panier:', cartItems);
    localStorage.setItem('panier', JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * Ajout d'un produit au panier
   */
  const addToCart = (item) => {
    console.log('➕ Ajout au panier:', item);

    if (!item || !item.id || !item.nom || item.prix === undefined) {
      console.error('❌ Item invalide:', item);
      return;
    }

    setCartItems(prevItems => {
      const index = prevItems.findIndex(p =>
        p.id === item.id &&
        JSON.stringify(p.garnitures || []) === JSON.stringify(item.garnitures || [])
      );

      if (index !== -1) {
        const updated = [...prevItems];
        const quantiteAjout = item.quantite || item.quantity || 1;
        updated[index].quantite = (updated[index].quantite || 1) + quantiteAjout;
        console.log('🔄 Quantité mise à jour:', updated[index]);
        return updated;
      } else {
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

  /**
   * Supprime un élément du panier par son index
   */
  const removeFromCart = (index) => {
    console.log('🗑️ Suppression de l\'article à l\'index:', index);
    setCartItems(prevItems => {
      const newItems = [...prevItems];
      newItems.splice(index, 1);
      console.log('✅ Panier après suppression:', newItems);
      return newItems;
    });
  };

  /**
   * Vide complètement le panier
   */
  const clearCart = () => {
    console.log('🧹 Vidage du panier');
    setCartItems([]);
  };

  /**
   * Calcule le prix total du panier
   */
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
