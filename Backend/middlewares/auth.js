import jwt from "jsonwebtoken";
import User from "../models/userModel.js";


export const authenticateToken = async (req, res, next) => {
  try {
    let token;

 
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

   
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET not configured");
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

  
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is valid but user not found"
      });
    }

   
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error in authentication"
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required."
    });
  }
};


export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select("-password");

    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};
