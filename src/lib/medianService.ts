export function getMedianServiceTime(times: number[]): number {
  if (!times.length) {
    return 3;
  }

  const sorted = [...times].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(1));
  }

  return Number(sorted[middle].toFixed(1));
}

export function getRollingMedian(times: number[], limit = 20): number {
  return getMedianServiceTime(times.slice(-limit));
}
