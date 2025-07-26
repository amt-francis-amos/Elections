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