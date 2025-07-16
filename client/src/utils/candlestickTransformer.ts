// src/utils/candlestickTransformer.ts
import type { StockPriceUpdate } from '../types';

export interface CandlestickDataPoint {
  x: number | string | Date;
  o: number;
  h: number;
  l: number;
  c: number;
}

/**
 * 將最新的股價資料轉換為 K 線圖資料點（滾動視窗方式）
 * 只處理可完整分組的區段（如：150 筆資料，每 5 筆分一組，共 30 根 K 棒）
 */
export function transformToCandlestick(
  history: StockPriceUpdate[],
  groupSize = 5
): CandlestickDataPoint[] {
  const candles: CandlestickDataPoint[] = [];

  if (history.length < groupSize) return []; // 不足一組

  for (let i = 0; i <= history.length - groupSize; i += groupSize) {
    const group = history.slice(i, i + groupSize);
    if (group.length < groupSize) continue; // 不足 groupSize 的不處理

    const open = parseFloat(group[0].price);
    const close = parseFloat(group[group.length - 1].price);
    const high = Math.max(...group.map((d) => parseFloat(d.price)));
    const low = Math.min(...group.map((d) => parseFloat(d.price)));
    const time = new Date(group[0].timestamp).getTime();

    candles.push({
      x: time,
      o: open,
      h: high,
      l: low,
      c: close,
    });
  }

  return candles;
}
