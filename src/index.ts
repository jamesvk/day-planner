import "dotenv/config";
import express from "express";
import tripRoutes from "./routes/tripRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mesage: "Server is running" });
});

app.use("/api/trips", tripRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
