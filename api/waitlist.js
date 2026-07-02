import { neon } from "@neondatabase/serverless";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let tableReady = false;

function getSql() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error("POSTGRES_URL is not configured");
  }
  return neon(url);
}

async function ensureTable(sql) {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS waitlist (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  tableReady = true;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const email = String(req.body?.email ?? "")
    .trim()
    .toLowerCase();

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  try {
    const sql = getSql();
    await ensureTable(sql);
    const rows = await sql`
      INSERT INTO waitlist (email)
      VALUES (${email})
      RETURNING id, email, created_at
    `;
    return res.status(201).json({ ok: true, entry: rows[0] });
  } catch (err) {
    if (err.message === "POSTGRES_URL is not configured") {
      return res.status(503).json({
        error: "Waitlist database is not configured on Vercel yet.",
      });
    }
    if (err.code === "23505") {
      return res.status(409).json({ error: "You're already on the waitlist." });
    }
    console.error(err);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
}
