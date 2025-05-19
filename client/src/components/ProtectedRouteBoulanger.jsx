import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRouteBoulanger = ({ children }) => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  if (!userData || userData.role !== 'boulanger') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRouteBoulanger;
