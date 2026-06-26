import { useEffect, useState } from "react";

export default function Hero() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={`hero ${started ? "hero--started" : ""}`}>
      <h1 className="hero-headline">
        Prediction markets where{" "}
        <span className="hero-swap">
          <span className="hero-swap-struck">
            the ho<span className="hero-house-u">u<span className="hero-everybody" aria-hidden="true">everybody</span></span>se
          </span>
        </span>{" "}
        <span className="hero-wins">wins.</span>
      </h1>
      <p className="hero-sub">
        Bet with friends on the things you care about — and share the upside
        together.
      </p>
    </section>
  );
}
