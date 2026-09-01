import "dotenv/config";
import express from "express";
import cors from "cors";

import tripRoutes from "./routes/tripRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://day-planner-theta-ochre.vercel.app",
];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);

export default app;
