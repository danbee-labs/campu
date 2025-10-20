import express from "express";

const app = express();
const PORT = 3005;

app.use(express.json({ limit: "10kb" }));

app.get("/api/ping", (req, res) => {
  return res.status(200).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`);
});
