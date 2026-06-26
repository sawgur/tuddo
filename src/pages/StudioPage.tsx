import { useCallback, useEffect, useRef, useState } from "react";
import Logo from "../components/Logo";
import StudioChart, { type TimeSeriesPoint } from "../studio/StudioChart";
import {
  applyNaturalization,
  BASE_SAMPLE_INTERVAL,
  equalOdds,
  interpolateOdds,
  naturalizeSampleInterval,
  newKeyframeId,
  normalizeOdds,
  type Keyframe,
} from "../studio/marketAnimation";

export default function StudioPage() {
  const [question, setQuestion] = useState("Will I get a second date");
  const [labels, setLabels] = useState(["Yes", "No"]);
  const [duration, setDuration] = useState(30);
  const [naturalize, setNaturalize] = useState(true);
  const [naturalizeStrength, setNaturalizeStrength] = useState(4);
  const [naturalizeFrequency, setNaturalizeFrequency] = useState(6);
  const [expandTimeScale, setExpandTimeScale] = useState(true);
  const [keyframes, setKeyframes] = useState<Keyframe[]>([
    { id: newKeyframeId(), atSeconds: 0, odds: [50, 50] },
    { id: newKeyframeId(), atSeconds: 30, odds: [72, 28] },
  ]);

  const [series, setSeries] = useState<TimeSeriesPoint[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startWallRef = useRef<number | null>(null);

  const optionCount = labels.length;

  const setOptionCount = (count: number) => {
    const clamped = Math.min(4, Math.max(2, count));
    setLabels((prev) => {
      const next = prev.slice(0, clamped);
      while (next.length < clamped) {
        if (clamped === 2) {
          next.push(next.length === 0 ? "Yes" : "No");
        } else {
          next.push(`Option ${String.fromCharCode(65 + next.length)}`);
        }
      }
      return next;
    });
    setKeyframes((prev) =>
      prev.map((kf) => {
        const nextOdds = kf.odds.slice(0, clamped);
        while (nextOdds.length < clamped) {
          nextOdds.push(equalOdds(clamped)[nextOdds.length] ?? 25);
        }
        return { ...kf, odds: normalizeOdds(nextOdds) };
      }),
    );
  };

  const addKeyframe = () => {
    const sorted = [...keyframes].sort((a, b) => a.atSeconds - b.atSeconds);
    const last = sorted[sorted.length - 1];
    const atSeconds = Math.min(
      duration,
      (last?.atSeconds ?? 0) + Math.max(5, duration / 4),
    );
    setKeyframes((prev) => [
      ...prev,
      {
        id: newKeyframeId(),
        atSeconds,
        odds: [...(last?.odds ?? equalOdds(optionCount))],
      },
    ]);
  };

  const updateKeyframe = (
    id: string,
    patch: Partial<Pick<Keyframe, "atSeconds" | "odds">>,
  ) => {
    setKeyframes((prev) =>
      prev.map((kf) => (kf.id === id ? { ...kf, ...patch } : kf)),
    );
  };

  const updateKeyframeOdd = (id: string, index: number, value: number) => {
    setKeyframes((prev) =>
      prev.map((kf) => {
        if (kf.id !== id) return kf;
        const next = [...kf.odds];
        next[index] = value;
        return { ...kf, odds: normalizeOdds(next) };
      }),
    );
  };

  const removeKeyframe = (id: string) => {
    setKeyframes((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((kf) => kf.id !== id);
    });
  };

  const buildFullSeries = useCallback(() => {
    const sampleInterval = naturalize
      ? naturalizeSampleInterval(naturalizeFrequency)
      : BASE_SAMPLE_INTERVAL;
    const points: TimeSeriesPoint[] = [];
    for (let t = 0; t <= duration; t += sampleInterval) {
      const base = interpolateOdds(keyframes, t, optionCount);
      const values = naturalize
        ? applyNaturalization(base, naturalizeStrength)
        : base;
      points.push({ time: Math.min(t, duration), values });
    }
    const final = interpolateOdds(keyframes, duration, optionCount);
    points.push({
      time: duration,
      values: naturalize
        ? applyNaturalization(final, naturalizeStrength)
        : final,
    });
    return points;
  }, [
    duration,
    keyframes,
    naturalize,
    naturalizeStrength,
    naturalizeFrequency,
    optionCount,
  ]);

  const stopPlayback = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startWallRef.current = null;
    setIsPlaying(false);
  }, []);

  const runAnimation = useCallback(() => {
    stopPlayback();
    const fullSeries = buildFullSeries();
    setSeries(fullSeries);
    setCurrentTime(0);
    setIsPlaying(true);
    startWallRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - (startWallRef.current ?? now)) / 1000;
      if (elapsed >= duration) {
        setCurrentTime(duration);
        setIsPlaying(false);
        return;
      }
      setCurrentTime(elapsed);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [buildFullSeries, duration, stopPlayback]);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  useEffect(() => {
    if (!isPlaying) {
      setSeries(buildFullSeries());
      setCurrentTime(duration);
    }
  }, [keyframes, duration, naturalize, naturalizeStrength, naturalizeFrequency, labels, isPlaying, buildFullSeries]);

  const sortedKeyframes = [...keyframes].sort(
    (a, b) => a.atSeconds - b.atSeconds,
  );

  return (
    <div className="studio">
      <header className="nav studio-nav">
        <Logo />
        <span className="studio-badge">Private studio</span>
      </header>

      <main className="studio-main">
        <div className="studio-header">
          <h1>Market animation studio</h1>
          <p>
            Set keyframes for how odds should move over time, then run a live
            sportsbook-style chart. Only available at{" "}
            <code>/studio</code> — not linked from the main page.
          </p>
        </div>

        <div className="studio-layout">
          <div className="studio-panel">
            <label className="field">
              <span className="field-label">Market question</span>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </label>

            <div className="field">
              <span className="field-label">Options</span>
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
                      labels.length === count ? "mode-toggle-btn--active" : ""
                    }
                    onClick={() => setOptionCount(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {labels.map((label, i) => (
              <label key={i} className="field">
                <span className="field-label">Option {i + 1}</span>
                <input
                  type="text"
                  value={label}
                  onChange={(e) =>
                    setLabels((prev) =>
                      prev.map((l, idx) => (idx === i ? e.target.value : l)),
                    )
                  }
                />
              </label>
            ))}

            <label className="field">
              <span className="field-label">
                Animation duration — {duration}s
              </span>
              <input
                type="range"
                min={5}
                max={180}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </label>

            <label className="studio-check">
              <input
                type="checkbox"
                checked={naturalize}
                onChange={(e) => setNaturalize(e.target.checked)}
              />
              Naturalization (small random wiggles)
            </label>

            {naturalize && (
              <>
                <label className="field">
                  <span className="field-label">
                    Wiggle strength — {naturalizeStrength}
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={naturalizeStrength}
                    onChange={(e) =>
                      setNaturalizeStrength(Number(e.target.value))
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">
                    Wiggle frequency — {naturalizeFrequency} (
                    {(
                      1 / naturalizeSampleInterval(naturalizeFrequency)
                    ).toFixed(1)}
                    /s)
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={naturalizeFrequency}
                    onChange={(e) =>
                      setNaturalizeFrequency(Number(e.target.value))
                    }
                  />
                  <span className="field-hint">
                    Low = smoother, choppy updates · High = rapid sportsbook
                    ticks
                  </span>
                </label>
              </>
            )}

            <label className="studio-check">
              <input
                type="checkbox"
                checked={expandTimeScale}
                onChange={(e) => setExpandTimeScale(e.target.checked)}
              />
              Expand time scale (chart end follows current time)
            </label>

            <div className="studio-keyframes">
              <div className="studio-keyframes-head">
                <span className="field-label">Time markers (keyframes)</span>
                <button type="button" className="studio-btn-secondary" onClick={addKeyframe}>
                  + Add marker
                </button>
              </div>

              {sortedKeyframes.map((kf) => (
                <div key={kf.id} className="studio-keyframe">
                  <div className="studio-keyframe-head">
                    <label className="field field--inline">
                      <span className="field-label">Time (s)</span>
                      <input
                        type="number"
                        min={0}
                        max={duration}
                        step={1}
                        value={kf.atSeconds}
                        onChange={(e) =>
                          updateKeyframe(kf.id, {
                            atSeconds: Math.min(
                              duration,
                              Math.max(0, Number(e.target.value)),
                            ),
                          })
                        }
                      />
                    </label>
                    {sortedKeyframes.length > 1 && (
                      <button
                        type="button"
                        className="studio-btn-remove"
                        onClick={() => removeKeyframe(kf.id)}
                        aria-label="Remove keyframe"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {labels.map((label, i) => (
                    <label key={label + i} className="field">
                      <span className="field-label">
                        {label} — {kf.odds[i] ?? 0}%
                      </span>
                      <input
                        type="range"
                        min={1}
                        max={99}
                        value={kf.odds[i] ?? equalOdds(optionCount)[i]}
                        onChange={(e) =>
                          updateKeyframeOdd(kf.id, i, Number(e.target.value))
                        }
                      />
                    </label>
                  ))}
                </div>
              ))}
            </div>

            <div className="studio-actions">
              <button
                type="button"
                className="market-builder-send"
                onClick={runAnimation}
                disabled={isPlaying}
              >
                {isPlaying ? "Playing…" : "Run animation"}
              </button>
              <button
                type="button"
                className="studio-btn-secondary"
                onClick={() => {
                  stopPlayback();
                  setCurrentTime(0);
                  setSeries([]);
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="studio-chart-panel">
            <p className="chart-title">{question.trim() || "Market odds"}</p>
            <StudioChart
              labels={labels}
              series={series}
              duration={duration}
              currentTime={currentTime}
              isPlaying={isPlaying}
              expandTimeScale={expandTimeScale}
            />
            <p className="studio-chart-caption">
              {isPlaying
                ? `Playing ${currentTime.toFixed(1)}s / ${duration}s${
                    expandTimeScale ? " · scale 0–" + currentTime.toFixed(1) + "s" : ""
                  }`
                : series.length > 0
                  ? `Preview — ${duration}s total`
                  : "Adjust keyframes, then run the animation"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
