import { useEffect, useRef, useState, type ReactNode } from "react";

interface PhoneShowcaseProps {
  reverse?: boolean;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="phone-scene">
      <div className="phone">
        <div className="phone-notch" />
        <div className="phone-screen">{children}</div>
        <div className="phone-button" />
      </div>
      <div className="phone-shadow" />
    </div>
  );
}

function ShowcaseBlock({
  reverse = false,
  eyebrow,
  title,
  description,
  children,
}: PhoneShowcaseProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`showcase ${reverse ? "showcase--reverse" : ""} ${
        visible ? "showcase--visible" : ""
      }`}
    >
      <div className="showcase-copy">
        <p className="showcase-eyebrow">{eyebrow}</p>
        <h2 className="showcase-title">{title}</h2>
        <p className="showcase-description">{description}</p>
      </div>
      <PhoneFrame>{children}</PhoneFrame>
    </section>
  );
}

function MarketsScreen() {
  return (
    <div className="screen screen--markets">
      <div className="screen-header">
        <span className="screen-logo">Tuddo</span>
        <span className="screen-pill">Your group</span>
      </div>
      <p className="screen-greeting">Tonight&apos;s markets</p>
      <div className="market-card market-card--featured">
        <p className="market-question">
          Will Alex finish the marathon under 4 hours?
        </p>
        <div className="market-odds">
          <button type="button" className="odds-btn odds-btn--yes">
            Yes <span>62¢</span>
          </button>
          <button type="button" className="odds-btn odds-btn--no">
            No <span>38¢</span>
          </button>
        </div>
        <p className="market-meta">$240 pooled · 8 friends</p>
      </div>
      <div className="market-card">
        <p className="market-question">
          Rain during the rooftop party Saturday?
        </p>
        <div className="market-odds">
          <button type="button" className="odds-btn odds-btn--yes">
            Yes <span>41¢</span>
          </button>
          <button type="button" className="odds-btn odds-btn--no">
            No <span>59¢</span>
          </button>
        </div>
        <p className="market-meta">$85 pooled · 5 friends</p>
      </div>
    </div>
  );
}

function PayoutsScreen() {
  return (
    <div className="screen screen--payouts">
      <div className="screen-header">
        <span className="screen-logo">Tuddo</span>
        <span className="screen-pill screen-pill--win">Settled</span>
      </div>
      <p className="screen-greeting">Everybody wins</p>
      <div className="payout-hero">
        <p className="payout-label">Total returned to your group</p>
        <p className="payout-amount">$312</p>
        <p className="payout-sub">100% of the pool — no house cut</p>
      </div>
      <ul className="payout-list">
        <li>
          <span className="payout-name">You</span>
          <span className="payout-value payout-value--up">+$48</span>
        </li>
        <li>
          <span className="payout-name">Maya</span>
          <span className="payout-value payout-value--up">+$36</span>
        </li>
        <li>
          <span className="payout-name">Jordan</span>
          <span className="payout-value payout-value--up">+$22</span>
        </li>
        <li>
          <span className="payout-name">Sam</span>
          <span className="payout-value">+$18</span>
        </li>
      </ul>
      <div className="payout-banner">
        <span>🎉</span> The house didn&apos;t take a dime.
      </div>
    </div>
  );
}

export default function PhoneShowcase() {
  return (
    <div className="showcases">
      <ShowcaseBlock
        eyebrow="Create together"
        title="Markets made for your crew"
        description="Spin up prediction markets with the people you actually know. Set the stakes, pick the question, and let the group set the odds — no strangers, no algorithms."
      >
        <MarketsScreen />
      </ShowcaseBlock>

      <ShowcaseBlock
        reverse
        eyebrow="Share the upside"
        title="When the market settles, everybody wins"
        description="Unlike traditional prediction markets, Tuddo returns the full pool to your group. Winners get paid, and nobody's lining a house's pockets."
      >
        <PayoutsScreen />
      </ShowcaseBlock>
    </div>
  );
}
