import app from "./app.js";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set — refusing to start");
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
