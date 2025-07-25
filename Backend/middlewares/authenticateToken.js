import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and has Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || typeof token !== "string") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Debug log
    console.log("🔐 Decoded token:", decoded);

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token payload.",
      });
    }

    // Look up the user
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.warn("⚠️ Token is valid but user not found:", decoded.userId);
      return res.status(401).json({
        success: false,
        message: "Access denied. User not found.",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Authentication error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token has expired.",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Access denied. Authentication failed.",
    });
  }
};
