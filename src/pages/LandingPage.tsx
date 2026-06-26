import Hero from "../components/Hero";
import Logo from "../components/Logo";
import MarketBuilder from "../components/MarketBuilder";
import PhoneShowcase from "../components/PhoneShowcase";
import Waitlist from "../components/Waitlist";

export default function LandingPage() {
  return (
    <div className="app">
      <header className="nav">
        <Logo />
        <a href="#waitlist" className="nav-cta">
          Join waitlist
        </a>
      </header>

      <main>
        <Hero />
        <MarketBuilder />
        <PhoneShowcase />
        <Waitlist />
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Tuddo. Everybody wins.</p>
      </footer>
    </div>
  );
}
