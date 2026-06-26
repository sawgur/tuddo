import cors from "cors";
import express from "express";
import { addToWaitlist } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/waitlist", (req, res) => {
  const email = String(req.body?.email ?? "")
    .trim()
    .toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  try {
    const row = addToWaitlist(email);
    return res.status(201).json({ ok: true, entry: row });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "You're already on the waitlist." });
    }
    console.error(err);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Tuddo API running on http://localhost:${PORT}`);
});
