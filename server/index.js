import cors from "cors";
import express from "express";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { processWaitlistSignup } from "./waitlistRoute.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/waitlist", (req, res) => {
  try {
    const result = processWaitlistSignup(req.body?.email);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Tuddo API running on http://localhost:${PORT}`);
  if (existsSync(distDir)) {
    console.log(`Serving app from ${distDir}`);
  }
});
