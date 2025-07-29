import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const getUserData = () => {
  const token = localStorage.getItem('token');
  const userDataRaw = localStorage.getItem('userData');

  if (!token || !userDataRaw) {
    return null;
  }

  try {
    const userData = JSON.parse(userDataRaw);
    if (userData && typeof userData === 'object' && userData.role) {
      return userData;
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    return null;
  }

  return null;
};

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const token = localStorage.getItem('token');
  const user = getUserData();
  const location = useLocation();

  useEffect(() => {
    if (!token || !user) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    }
  }, [token, user]);

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;