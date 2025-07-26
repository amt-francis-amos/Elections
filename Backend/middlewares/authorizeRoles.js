
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
  
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

     
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
        });
      }

 
      next();
    } catch (error) {
      console.error('Authorization middleware error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error in authorization'
      });
    }
  };
};
