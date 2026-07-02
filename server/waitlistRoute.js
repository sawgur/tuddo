import { addToWaitlist } from "./db.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function processWaitlistSignup(email) {
  const normalized = String(email ?? "")
    .trim()
    .toLowerCase();

  if (!normalized || !EMAIL_RE.test(normalized)) {
    return { status: 400, body: { error: "Invalid email address." } };
  }

  try {
    const entry = addToWaitlist(normalized);
    return { status: 201, body: { ok: true, entry } };
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return { status: 409, body: { error: "You're already on the waitlist." } };
    }
    throw err;
  }
}
