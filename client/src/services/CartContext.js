import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Charger les éléments du panier depuis localStorage au montage
  useEffect(() => {
    const storedItems = localStorage.getItem('panier');
    if (storedItems) {
      try {
        setCartItems(JSON.parse(storedItems));
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
        localStorage.setItem('panier', JSON.stringify([]));
      }
    }
  }, []);

  // Mettre à jour localStorage quand le panier change
  useEffect(() => {
    localStorage.setItem('panier', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems(prevItems => [...prevItems, item]);
  };

  const removeFromCart = (index) => {
    setCartItems(prevItems => {
      const newItems = [...prevItems];
      newItems.splice(index, 1);
      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalPrice = () => {
    return cartItems.reduce((total, item) => total + item.prix, 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};