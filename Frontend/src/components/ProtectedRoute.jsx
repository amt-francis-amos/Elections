import React from 'react';
import { Navigate } from 'react-router-dom';

const getUserData = () => {
  const token = localStorage.getItem('token');
  const userDataRaw = localStorage.getItem('userData');

  if (token && userDataRaw) {
    try {
      const userData = JSON.parse(userDataRaw);
      if (userData && typeof userData === 'object' && userData.role) {
        return userData;
      }
    } catch {
      return null;
    }
  }
  return null;
};

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const token = localStorage.getItem('token');
  const user = getUserData();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
