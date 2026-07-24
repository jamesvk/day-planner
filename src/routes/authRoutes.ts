import express from "express";
const router = express.Router();
import { registerUser, loginUser } from "../controllers/authController.js";

// Register a user
router.post("/register", registerUser);

// Login a user
router.post("/login", loginUser);

export default router;
