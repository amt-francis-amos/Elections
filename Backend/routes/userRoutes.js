import express from "express";
import rateLimit from "express-rate-limit";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadProfilePicture,
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many authentication attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

router.get("/profile", generalLimiter, authenticateToken, getUserProfile);
router.put("/profile", generalLimiter, authenticateToken, updateUserProfile);
router.post(
  "/profile/picture",
  generalLimiter,
  authenticateToken,
  upload.single("image"),
  uploadProfilePicture
);
router.put("/change-password", generalLimiter, authenticateToken, changePassword);

export default router;
