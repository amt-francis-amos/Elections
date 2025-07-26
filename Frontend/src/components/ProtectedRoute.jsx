import React from 'react';
import { Navigate } from 'react-router-dom';

const getUserData = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Invalid userData in localStorage", error);
    return null;
  }
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = getUserData();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'voter':
      return <Navigate to="/vote" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

export default ProtectedRoute;
