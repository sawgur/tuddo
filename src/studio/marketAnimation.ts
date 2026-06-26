export interface Keyframe {
  id: string;
  atSeconds: number;
  odds: number[];
}

export function equalOdds(count: number): number[] {
  const base = Math.floor(100 / count);
  const odds = Array.from({ length: count }, () => base);
  odds[0] += 100 - base * count;
  return odds;
}

export function normalizeOdds(values: number[]): number[] {
  const clamped = values.map((v) => Math.max(0.1, v));
  const sum = clamped.reduce((a, b) => a + b, 0);
  const rounded = clamped.map((v) => Math.round((v / sum) * 100));
  const diff = 100 - rounded.reduce((a, b) => a + b, 0);
  rounded[0] += diff;
  return rounded;
}

export function interpolateOdds(
  keyframes: Keyframe[],
  timeSeconds: number,
  optionCount: number,
): number[] {
  if (keyframes.length === 0) return equalOdds(optionCount);

  const sorted = [...keyframes].sort((a, b) => a.atSeconds - b.atSeconds);

  if (timeSeconds <= sorted[0].atSeconds) {
    return normalizeOdds(sorted[0].odds.slice(0, optionCount));
  }

  const last = sorted[sorted.length - 1];
  if (timeSeconds >= last.atSeconds) {
    return normalizeOdds(last.odds.slice(0, optionCount));
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i];
    const end = sorted[i + 1];
    if (timeSeconds >= start.atSeconds && timeSeconds <= end.atSeconds) {
      const span = end.atSeconds - start.atSeconds;
      const t = span === 0 ? 0 : (timeSeconds - start.atSeconds) / span;
      const blended = start.odds.map((startOdd, idx) => {
        const endOdd = end.odds[idx] ?? startOdd;
        return startOdd + (endOdd - startOdd) * t;
      });
      return normalizeOdds(blended.slice(0, optionCount));
    }
  }

  return equalOdds(optionCount);
}

export function applyNaturalization(
  baseOdds: number[],
  strength: number,
): number[] {
  if (strength <= 0) return baseOdds;
  const jittered = baseOdds.map(
    (v) => v + (Math.random() - 0.5) * strength * 2,
  );
  return normalizeOdds(jittered);
}

/** Higher frequency → more frequent wiggle samples (shorter interval). */
export function naturalizeSampleInterval(frequency: number): number {
  const clamped = Math.min(10, Math.max(1, frequency));
  const minInterval = 0.06;
  const maxInterval = 1.0;
  const t = (clamped - 1) / 9;
  return maxInterval + (minInterval - maxInterval) * t;
}

export const BASE_SAMPLE_INTERVAL = 0.12;

export function newKeyframeId() {
  return crypto.randomUUID();
}
