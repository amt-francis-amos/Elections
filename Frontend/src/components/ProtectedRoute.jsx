import React from 'react';
import { Navigate } from 'react-router-dom';


const isAuthenticated = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'admin';
};

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
