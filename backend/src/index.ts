import app from "./app.js";
import cors from "cors";

app.use(cors({ origin: "http://localhost:5173" }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
