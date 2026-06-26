import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, "tuddo.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export function addToWaitlist(email) {
  const stmt = db.prepare("INSERT INTO waitlist (email) VALUES (?)");
  const result = stmt.run(email);
  return db
    .prepare("SELECT id, email, created_at FROM waitlist WHERE id = ?")
    .get(result.lastInsertRowid);
}

export function getWaitlistCount() {
  return db.prepare("SELECT COUNT(*) as count FROM waitlist").get().count;
}
