import { useCallback, useMemo, useState } from "react";
import OddsChart from "./OddsChart";

type MarketMode = "binary" | "multi";

const QUESTION_MAX_LENGTH = 80;

function equalOdds(count: number) {
  const base = Math.floor(100 / count);
  const odds = Array.from({ length: count }, () => base);
  odds[0] += 100 - base * count;
  return odds;
}

export default function MarketBuilder() {
  const [mode, setMode] = useState<MarketMode>("binary");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["Yes", "No"]);
  const [odds, setOdds] = useState([50, 50]);

  const labels = useMemo(
    () => (mode === "binary" ? ["Yes", "No"] : options),
    [mode, options],
  );

  const displayOdds =
    mode === "binary" ? odds.slice(0, 2) : odds.slice(0, options.length);

  const chartTitle = question.trim() || "Your market odds";

  const switchMode = (next: MarketMode) => {
    setMode(next);
    if (next === "binary") {
      setOptions(["Yes", "No"]);
      setOdds([50, 50]);
    } else {
      setOptions(["Option A", "Option B"]);
      setOdds(equalOdds(2));
    }
  };

  const setOptionCount = (count: number) => {
    const clamped = Math.min(4, Math.max(2, count));
    setOptions((prev) => {
      const next = prev.slice(0, clamped);
      while (next.length < clamped) {
        next.push(`Option ${String.fromCharCode(65 + next.length)}`);
      }
      return next;
    });
    setOdds(equalOdds(clamped));
  };

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const updateBinaryYes = (yes: number) => {
    const clamped = Math.min(99, Math.max(1, yes));
    setOdds([clamped, 100 - clamped]);
  };

  const updateMultiOdd = (index: number, value: number) => {
    setOdds((prev) => {
      const next = [...prev];
      next[index] = Math.min(99, Math.max(1, value));
      const sum = next.reduce((a, b) => a + b, 0);
      return next.map((v) => Math.round((v / sum) * 100));
    });
  };

  const sendToFriends = useCallback(() => {
    const waitlist = document.getElementById("waitlist");
    waitlist?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      document.getElementById("email")?.focus();
    }, 500);
  }, []);

  return (
    <section className="market-builder">
      <div className="market-builder-inner">
        <p className="market-builder-eyebrow">Try it live</p>
        <h2 className="market-builder-title">Build your market</h2>
        <p className="market-builder-description">
          Draft a prediction market, set the odds, and share it with your group.
        </p>

        <div className="market-builder-layout">
          <div className="market-builder-form">
            <label className="field">
              <span className="field-label">
                Market question
                <span className="field-count">
                  {question.length}/{QUESTION_MAX_LENGTH}
                </span>
              </span>
              <input
                type="text"
                placeholder="Will I get a second date?"
                value={question}
                maxLength={QUESTION_MAX_LENGTH}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </label>

            <div className="mode-toggle" role="group" aria-label="Market type">
              <button
                type="button"
                className={mode === "binary" ? "mode-toggle-btn--active" : ""}
                onClick={() => switchMode("binary")}
              >
                Yes / No
              </button>
              <button
                type="button"
                className={mode === "multi" ? "mode-toggle-btn--active" : ""}
                onClick={() => switchMode("multi")}
              >
                Multiple options
              </button>
            </div>

            {mode === "multi" && (
              <div className="field">
                <span className="field-label">Number of options</span>
                <div
                  className="mode-toggle mode-toggle--compact"
                  role="group"
                  aria-label="Number of options"
                >
                  {[2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      className={
                        options.length === count ? "mode-toggle-btn--active" : ""
                      }
                      onClick={() => setOptionCount(count)}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === "binary" ? (
              <div className="odds-group">
                <label className="field">
                  <span className="field-label">Yes — {odds[0]}%</span>
                  <input
                    type="range"
                    min={1}
                    max={99}
                    value={odds[0]}
                    onChange={(e) => updateBinaryYes(Number(e.target.value))}
                  />
                </label>
                <label className="field">
                  <span className="field-label">No — {odds[1]}%</span>
                  <input
                    type="range"
                    min={1}
                    max={99}
                    value={odds[1]}
                    onChange={(e) => updateBinaryYes(100 - Number(e.target.value))}
                  />
                </label>
              </div>
            ) : (
              <div className="odds-group">
                {options.map((option, i) => (
                  <div key={i} className="multi-option-row">
                    <input
                      type="text"
                      className="multi-option-name"
                      value={option}
                      placeholder={`Option ${i + 1}`}
                      onChange={(e) => updateOption(i, e.target.value)}
                    />
                    <label className="field field--inline">
                      <span className="field-label">{odds[i]}%</span>
                      <input
                        type="range"
                        min={1}
                        max={99}
                        value={odds[i]}
                        onChange={(e) =>
                          updateMultiOdd(i, Number(e.target.value))
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="market-builder-send"
              onClick={sendToFriends}
            >
              Send your market to friends
            </button>
          </div>

          <div className="market-builder-chart-wrap">
            <p className="chart-title">{chartTitle}</p>
            <OddsChart labels={labels} odds={displayOdds} />
          </div>
        </div>
      </div>
    </section>
  );
}
