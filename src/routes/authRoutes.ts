import express from "express";
const router = express.Router();
import { registerUser } from "../controllers/authController.js";

// Register a user
router.post("/register", registerUser);

export default router;
