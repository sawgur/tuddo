import { useEffect, useMemo, useState } from "react";

const COLORS = ["#2d6a4f", "#d64545", "#4361ee", "#e07a2f", "#7b2cbf"];
const LEGEND_MAX_LINES = 3;
const LEGEND_CHARS_PER_LINE = 14;
const LEGEND_LINE_HEIGHT = 13;
const LEGEND_ROW_GAP = 22;
const INITIAL_HISTORY_POINTS = 14;

interface OddsChartProps {
  labels: string[];
  odds: number[];
}

interface HistoryPoint {
  values: number[];
}

const WIDTH = 640;
const BASE_HEIGHT = 260;
const PAD = { top: 16, right: 132, bottom: 28, left: 44 };
const PLOT_W = WIDTH - PAD.left - PAD.right;

function wrapLegendText(text: string): string[] {
  const value = text.trim() || "Option";
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= LEGEND_CHARS_PER_LINE) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
    } else {
      lines.push(word.slice(0, LEGEND_CHARS_PER_LINE));
      current = word.slice(LEGEND_CHARS_PER_LINE);
    }

    if (lines.length >= LEGEND_MAX_LINES) break;
  }

  if (lines.length < LEGEND_MAX_LINES && current) {
    lines.push(current);
  }

  const trimmed = lines.slice(0, LEGEND_MAX_LINES);
  const joinedLength = value.replace(/\s+/g, " ").length;
  const shownLength = trimmed.join(" ").length;

  if (shownLength < joinedLength && trimmed.length > 0) {
    const last = trimmed[trimmed.length - 1];
    trimmed[trimmed.length - 1] =
      last.length > LEGEND_CHARS_PER_LINE - 1
        ? `${last.slice(0, LEGEND_CHARS_PER_LINE - 1)}…`
        : `${last}…`;
  }

  return trimmed.length > 0 ? trimmed : [value];
}

function legendBlockHeight(lineCount: number) {
  return (lineCount + 1) * LEGEND_LINE_HEIGHT + LEGEND_ROW_GAP;
}

function seedHistory(values: number[]): HistoryPoint[] {
  return Array.from({ length: INITIAL_HISTORY_POINTS }, () => ({
    values: [...values],
  }));
}

export default function OddsChart({ labels, odds }: OddsChartProps) {
  const labelKey = labels.join("|");
  const oddsKey = odds.join(",");
  const [history, setHistory] = useState<HistoryPoint[]>(() => seedHistory(odds));

  useEffect(() => {
    setHistory(seedHistory(odds));
  }, [labelKey]);

  useEffect(() => {
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last?.values.every((v, i) => v === odds[i])) return prev;
      return [...prev.slice(-30), { values: [...odds] }];
    });
  }, [oddsKey]);

  const latest = history[history.length - 1]?.values ?? odds;

  const legendItems = useMemo(
    () =>
      labels.map((label, i) => ({
        lines: wrapLegendText(label),
        value: Math.round(latest[i] ?? odds[i] ?? 0),
        color: COLORS[i % COLORS.length],
      })),
    [labels, latest, odds],
  );

  const legendLayout = useMemo(() => {
    let y = PAD.top + 4;
    return legendItems.map((item) => {
      const anchorY = y;
      y += legendBlockHeight(item.lines.length);
      return { ...item, y: anchorY };
    });
  }, [legendItems]);

  const height = useMemo(() => {
    if (legendLayout.length === 0) return BASE_HEIGHT;
    const last = legendLayout[legendLayout.length - 1];
    const lastLines = legendItems[legendItems.length - 1]?.lines.length ?? 1;
    const legendBottom = last.y + legendBlockHeight(lastLines) + PAD.bottom;
    return Math.max(BASE_HEIGHT, legendBottom);
  }, [legendLayout, legendItems]);

  const plotH = height - PAD.top - PAD.bottom;

  const toY = (value: number) => PAD.top + plotH * (1 - value / 100);

  const paths = useMemo(() => {
    if (history.length === 0) return labels.map(() => "");
    const step = history.length <= 1 ? 0 : PLOT_W / (history.length - 1);

    return labels.map((_, seriesIndex) =>
      history
        .map((point, idx) => {
          const x = PAD.left + idx * step;
          const y = toY(point.values[seriesIndex] ?? 0);
          return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
        })
        .join(" "),
    );
  }, [history, labels, plotH]);

  return (
    <div className="odds-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="odds-chart-svg"
        role="img"
        aria-label="Odds over time chart"
      >
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={toY(tick)}
              y2={toY(tick)}
              className="odds-chart-grid"
            />
            <text x={PAD.left - 8} y={toY(tick) + 4} className="odds-chart-axis">
              {tick}%
            </text>
          </g>
        ))}

        {paths.map((d, i) => (
          <path
            key={labels[i]}
            d={d}
            fill="none"
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="odds-chart-line"
          />
        ))}

        {legendLayout.map((item, i) => {
          const blockHeight =
            item.lines.length * LEGEND_LINE_HEIGHT + LEGEND_LINE_HEIGHT;
          const circleY = item.y + blockHeight / 2;

          return (
            <g key={`${labels[i]}-${item.lines.join("-")}`}>
              <circle
                cx={WIDTH - PAD.right + 6}
                cy={circleY}
                r={5}
                fill={item.color}
              />
              <text
                x={WIDTH - PAD.right + 16}
                y={item.y + 8}
                className="odds-chart-legend"
              >
                {item.lines.map((line, lineIndex) => (
                  <tspan
                    key={lineIndex}
                    x={WIDTH - PAD.right + 16}
                    dy={lineIndex === 0 ? 0 : LEGEND_LINE_HEIGHT}
                  >
                    {line}
                  </tspan>
                ))}
                <tspan
                  x={WIDTH - PAD.right + 16}
                  dy={LEGEND_LINE_HEIGHT}
                  className="odds-chart-legend-value"
                >
                  {item.value}%
                </tspan>
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
