import React from 'react';
import { Navigate } from 'react-router-dom';

const getUserData = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');


  if (token && userData && userData !== 'undefined' && userData !== 'null') {
    try {
      return JSON.parse(userData);
    } catch (err) {
      console.error('Error parsing userData:', err);
      return null;
    }
  }
  return null;
};

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const token = localStorage.getItem('token');
  const user = getUserData();

  if (!token || !user) {
    return <Navigate to="/admin" replace />;
  }


  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
