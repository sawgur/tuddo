import { useMemo } from "react";

const COLORS = ["#2d6a4f", "#d64545", "#4361ee", "#e07a2f", "#7b2cbf"];

export interface TimeSeriesPoint {
  time: number;
  values: number[];
}

interface StudioChartProps {
  labels: string[];
  series: TimeSeriesPoint[];
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  expandTimeScale: boolean;
}

const WIDTH = 720;
const BASE_HEIGHT = 320;
const PAD = { top: 20, right: 16, bottom: 36, left: 48 };

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`;
}

export default function StudioChart({
  labels,
  series,
  duration,
  currentTime,
  isPlaying,
  expandTimeScale,
}: StudioChartProps) {
  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = BASE_HEIGHT - PAD.top - PAD.bottom;

  const timeScaleMax = useMemo(() => {
    if (expandTimeScale && isPlaying) {
      return Math.max(currentTime, 0.25);
    }
    return duration;
  }, [expandTimeScale, isPlaying, currentTime, duration]);

  const toX = (time: number) =>
    PAD.left + (timeScaleMax <= 0 ? 0 : (time / timeScaleMax) * plotW);

  const toY = (value: number) => PAD.top + plotH * (1 - value / 100);

  const visibleSeries = useMemo(() => {
    if (!isPlaying && series.length > 0) return series;
    return series.filter((point) => point.time <= currentTime + 0.001);
  }, [series, currentTime, isPlaying]);

  const paths = useMemo(
    () =>
      labels.map((_, seriesIndex) =>
        visibleSeries
          .map((point, idx) => {
            const x = toX(point.time);
            const y = toY(point.values[seriesIndex] ?? 0);
            return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" "),
      ),
    [visibleSeries, labels, timeScaleMax, plotH],
  );

  const latest = visibleSeries[visibleSeries.length - 1]?.values ?? [];

  const timeTicks = useMemo(() => {
    const count = 5;
    return Array.from({ length: count + 1 }, (_, i) => (timeScaleMax / count) * i);
  }, [timeScaleMax]);

  const showPlayhead =
    isPlaying && currentTime > 0 && !expandTimeScale;

  return (
    <div className="studio-chart">
      <div className="studio-chart-body">
        <svg
          viewBox={`0 0 ${WIDTH} ${BASE_HEIGHT}`}
          className="studio-chart-svg"
          role="img"
          aria-label="Odds over time"
        >
          {[0, 25, 50, 75, 100].map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={toY(tick)}
                y2={toY(tick)}
                className="studio-chart-grid"
              />
              <text
                x={PAD.left - 8}
                y={toY(tick) + 4}
                className="studio-chart-axis"
              >
                {tick}%
              </text>
            </g>
          ))}

          {timeTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={toX(tick)}
                x2={toX(tick)}
                y1={PAD.top}
                y2={BASE_HEIGHT - PAD.bottom}
                className="studio-chart-grid studio-chart-grid--time"
              />
              <text
                x={toX(tick)}
                y={BASE_HEIGHT - 10}
                className="studio-chart-axis studio-chart-axis--time"
              >
                {formatTime(tick)}
              </text>
            </g>
          ))}

          {showPlayhead && (
            <line
              x1={toX(currentTime)}
              x2={toX(currentTime)}
              y1={PAD.top}
              y2={BASE_HEIGHT - PAD.bottom}
              className="studio-chart-playhead"
            />
          )}

          {expandTimeScale && isPlaying && currentTime > 0 && (
            <line
              x1={WIDTH - PAD.right}
              x2={WIDTH - PAD.right}
              y1={PAD.top}
              y2={BASE_HEIGHT - PAD.bottom}
              className="studio-chart-playhead studio-chart-playhead--now"
            />
          )}

          {paths.map((d, i) => (
            <path
              key={labels[i]}
              d={d}
              fill="none"
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>

        <div className="studio-legend" aria-label="Market options">
          {labels.map((label, i) => (
            <div key={label + i} className="studio-legend-item">
              <span
                className="studio-legend-dot"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <div className="studio-legend-copy">
                <span className="studio-legend-label">{label}</span>
                <span
                  className="studio-legend-value"
                  style={{ color: COLORS[i % COLORS.length] }}
                >
                  {Math.round(latest[i] ?? 0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
