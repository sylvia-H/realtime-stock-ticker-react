// 模擬多檔股票隨機價格波動
import { WebSocketServer } from 'ws';

type StockTick = {
  symbol: string;
  price: number;
  timestamp: number;
};

const symbols = ['AAPL', 'TSLA', 'AMZN', 'GOOG', 'MSFT', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC','ADBE'];
const prices: Record<string, number> = Object.fromEntries(symbols.map(s => [s, 100 + Math.random() * 50]));

export function startSimulator(wss: WebSocketServer) {
  setInterval(() => {
    const updates: StockTick[] = [];

    for (const symbol of symbols) {
      for (let i = 0; i < 5; i++) {
        const last = prices[symbol];
        const newPrice = +(last * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2);
        prices[symbol] = newPrice;

        updates.push({
          symbol,
          price: newPrice,
          timestamp: Date.now(),
        });
      }
    }

    const message = JSON.stringify({ type: 'price-update', data: updates });
    wss.clients.forEach(client => client.readyState === 1 && client.send(message));
  }, 1000);
}
