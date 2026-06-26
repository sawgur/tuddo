import { FormEvent, useState } from "react";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Try again.",
        );
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage(
        "Could not reach the server. Make sure the API is running.",
      );
    }
  }

  return (
    <section id="waitlist" className="waitlist">
      <div className="waitlist-inner">
        <p className="waitlist-eyebrow">Early access</p>
        <h2 className="waitlist-title">Join the waitlist</h2>
        <p className="waitlist-description">
          Be first to try Tuddo with your friends. We&apos;re rolling out to
          small groups soon.
        </p>

        {status === "success" ? (
          <div className="waitlist-success" role="status">
            <p>You&apos;re on the list. We&apos;ll be in touch soon.</p>
          </div>
        ) : (
          <form className="waitlist-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              className={status === "error" ? "input--error" : ""}
              autoComplete="email"
              disabled={status === "loading"}
            />
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Joining…" : "Get early access"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="waitlist-error" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    </section>
  );
}
