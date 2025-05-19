import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRouteBoulanger = ({ children }) => {
  const userData = JSON.parse(localStorage.getItem('userData'));

  if (!userData || userData.role !== 'boulanger') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRouteBoulanger;
