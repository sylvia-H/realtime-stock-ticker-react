// server/utils/priceHistory.ts
type Tick = {
  symbol: string;
  price: number;
  timestamp: number;
};

const history: Record<string, Tick[]> = {}; // symbol => Tick[]

export function addPriceTick(tick: Tick) {
  if (!history[tick.symbol]) {
    history[tick.symbol] = [];
  }
  history[tick.symbol].push(tick);

  // 僅保留最近 5 分鐘資料（依實際需求可調整）
  const cutoff = Date.now() - 5 * 60 * 1000;
  history[tick.symbol] = history[tick.symbol].filter(t => t.timestamp >= cutoff);
}

export function getTicksSince(symbol: string, since: number): Tick[] {
  return (history[symbol] || []).filter(t => t.timestamp > since);
}
