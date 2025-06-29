import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './services/CartContext';
import { UserContext } from './services/UserContext';

// Import des pages client
import HomeClient from './pages/client/HomeClient';
import LoginClient from './pages/client/LoginClient';
import CartClient from './pages/client/CartClient';
import CustomizeSandwichClient from './pages/client/CustomizeSandwichClient';
import ProfileClient from './pages/client/ProfileClient';
import OrdersClient from './pages/client/OrdersClient';
import ChangePasswordClient from './pages/client/ChangePasswordClient';
import ProtectedRouteBoulanger from './services/ProtectedRouteBoulanger';
import DashboardBoulanger from './pages/boulanger/DashboardBoulanger';
import FavorisClient from './pages/client/favorisClient';
import RegisterClient from './pages/client/RegisterClient';
import ForgotPassword from './pages/client/ForgotPasswordClient';
import RequireNoAuth from './pages/client/PrivateRoute';
import ResetPasswordClient from './pages/client/ResetPasswordClient';
import ProductBoulanger from './pages/boulanger/ProductBoulanger';
import ClientsBoulanger from './pages/boulanger/ClientsBoulanger';
import HorairesBoulanger from './pages/boulanger/HorairesBoulanger';
import ContactClient from './pages/client/ContactClient';
import ContactBoulanger from './pages/boulanger/ContactBoulanger';
import HistoryBoulanger from './pages/boulanger/HistoryBoulanger';

function App() {
  // État global utilisateur, initialisé depuis localStorage si présent
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('userData');
    return stored ? JSON.parse(stored) : null;
  });

  return (
    // Fournisseur du contexte panier
    <CartProvider>
      {/* Fournisseur du contexte utilisateur */}
      <UserContext.Provider value={{ user, setUser }}>
        <Router>
          <Routes>
            {/* Routes publiques côté client */}
            <Route path="/" element={<HomeClient />} />
            <Route path="/login" element={
              <RequireNoAuth>
                <LoginClient />
              </RequireNoAuth>
            } />
            <Route path="/cart" element={<CartClient />} />
            <Route path="/customize-sandwich/:id" element={<CustomizeSandwichClient />} />
            <Route path="/profile" element={<ProfileClient />} />
            <Route path="/orders" element={<OrdersClient />} />
            <Route path="/change-password" element={<ChangePasswordClient />} />
            <Route path="/favoris" element={<FavorisClient />} />
            <Route path="/contact" element={<ContactClient />} />
            <Route path="/register" element={
              <RequireNoAuth>
                <RegisterClient />
              </RequireNoAuth>
            } />
            <Route path="/forgot-password" element={
              <RequireNoAuth>
                <ForgotPassword />
              </RequireNoAuth>
            } />
            <Route path="/reset-password/:token" element={<ResetPasswordClient />} />

            {/* Routes protégées pour le boulanger */}
            <Route path="/boulanger" element={
              <ProtectedRouteBoulanger>
                <DashboardBoulanger />
              </ProtectedRouteBoulanger>
            } />
            <Route path="/boulanger/products" element={
              <ProtectedRouteBoulanger>
                <ProductBoulanger />
              </ProtectedRouteBoulanger>
            } />
            <Route path="/boulanger/clients" element={
              <ProtectedRouteBoulanger>
                <ClientsBoulanger />
              </ProtectedRouteBoulanger>
            } />
            <Route path="/boulanger/horaires" element={
              <ProtectedRouteBoulanger>
                <HorairesBoulanger />
              </ProtectedRouteBoulanger>
            } />
            <Route path="/boulanger/messages" element={
              <ProtectedRouteBoulanger>
                <ContactBoulanger />
              </ProtectedRouteBoulanger>
            } />
            <Route path="/boulanger/history" element={
              <ProtectedRouteBoulanger>
                <HistoryBoulanger />
              </ProtectedRouteBoulanger>
            } />
          </Routes>
        </Router>
      </UserContext.Provider>
    </CartProvider>
  );
}

export default App;
