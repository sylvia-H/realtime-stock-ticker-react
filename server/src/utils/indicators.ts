export function calculateSMA(data: number[], windowSize: number): number {
  if (data.length < windowSize) return NaN;
  const sum = data.slice(-windowSize).reduce((a, b) => a + b, 0);
  return +(sum / windowSize).toFixed(2);
}

export function calculateEMA(data: number[], windowSize: number): number {
  if (data.length < windowSize) return NaN;
  const k = 2 / (windowSize + 1);
  let ema = data[0];
  for (let i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return +ema.toFixed(2);
}

export function highLowRange(data: number[]): [number, number] {
  const range = data.slice(-20); // 取近 20 筆
  return [Math.max(...range), Math.min(...range)];
}
