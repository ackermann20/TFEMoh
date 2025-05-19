import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './services/CartContext';

// Pages client
import HomeClient from './pages/client/HomeClient';
import LoginClient from './pages/client/LoginClient';
import ProductsClient from './pages/client/ProductsClient';
import CartClient from './pages/client/CartClient';
import CustomizeSandwichClient from './pages/client/CustomizeSandwichClient'; 
import SandwichesClient from './pages/client/SandwichesClient';
import ProfileClient from './pages/client/ProfileClient';
import OrdersClient from './pages/client/OrdersClient';
import ChangePasswordClient from './pages/client/ChangePasswordClient';
import ProtectedRouteBoulanger from './components/ProtectedRouteBoulanger';
import DashboardBoulanger from './pages/boulanger/DashboardBoulanger';



const user = JSON.parse(localStorage.getItem('userData'));
const defaultRoute = user?.role === "boulanger" ? "/admin" : "/produits";

function App() {
  return (
    <CartProvider>
    <Router>
      <Routes>
        
        <Route path="/" element={<HomeClient />} />
        <Route path="/login" element={<LoginClient />} />
        <Route path="/products" element={<ProductsClient />} />
        <Route path="/cart" element={<CartClient />} />
        <Route path="/customize-sandwich/:id" element={<CustomizeSandwichClient />} />
        <Route path="/sandwiches" element={<SandwichesClient />} />
        <Route path="/profile" element={<ProfileClient />} />
        <Route path="/orders" element={<OrdersClient />} />
        <Route path="/change-password" element={<ChangePasswordClient />} />
        
        <Route path="/boulanger" element={
          <ProtectedRouteBoulanger>
            <DashboardBoulanger />
          </ProtectedRouteBoulanger>
        } />


      </Routes>
    </Router>
    </CartProvider>
  );
}

export default App;
