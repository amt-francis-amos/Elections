import React from 'react';
import { Navigate } from 'react-router-dom';


const getUserData = () => {
  const raw = localStorage.getItem('userData');

  if (!raw || raw === "undefined") {
    console.warn("No valid userData found in localStorage.");
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error parsing userData:", raw, error);
    return null;
  }
};


const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const token = localStorage.getItem('token');
  const user = getUserData();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
