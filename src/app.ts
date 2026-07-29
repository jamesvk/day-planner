import "dotenv/config";
import express from "express";
import tripRoutes from "./routes/tripRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mesage: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);

export default app;
