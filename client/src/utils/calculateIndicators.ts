import { calculateSMA, calculateEMA, highLowRange } from '../../../server/src/utils/indicators';

export function scheduleIndicatorUpdate(
  prices: number[],
  callback: (result: { sma: number; ema: number; high: number; low: number }) => void
) {
  const fn = () => {
    const sma = calculateSMA(prices, 10);
    const ema = calculateEMA(prices, 10);
    const [high, low] = highLowRange(prices);

    callback({ sma, ema, high, low });
  };

  if ('requestIdleCallback' in window) {
    (window as Window & typeof globalThis).requestIdleCallback(fn);
  } else {
    setTimeout(fn, 0);
  }
}
