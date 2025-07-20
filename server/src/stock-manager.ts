import { StockPriceUpdate } from './types';
import { generatePrice } from './price-generator';

// StockManager 主要負責管理多支股票的即時價格狀態，模擬價格波動
// 並提供最新的價格資料給 WebSocket Server 做推播

const MAX_HISTORY = 5000;
const MAX_RESYNC_RETURN = 1000; // ⚠️ 補發上限（可依需求調整）

export class StockManager {
  /**
   * 選用 Map 來管理價格與波動率的原因
   * 1. Map 針對動態新增與查找優化，在大規模資料時通常表現較物件穩定
   * 2. Map 保持元素插入的順序（雖然 Object 非整數字串鍵的插入順序是被保留的，整數字串鍵則會被排序）
   * 3. Map 提供 .set(), .get(), .has() 等明確方法，使用上較直覺，且避免物件原型鏈帶來的潛在問題
   */
  private prices: Map<string, number> = new Map();
  private volatilityMap: Map<string, number> = new Map();
  // 👇 新增歷史紀錄（最多保留 5000 筆）
  private history: StockPriceUpdate[] = [];

  // 建構多股陣列，初始化所有股票價格為 100，並設定預設波動幅度。
  constructor(tickers: string[]) {
    tickers.forEach((ticker) => {
      this.prices.set(ticker, 100); // 預設初始價 100
      this.volatilityMap.set(ticker, 1); // 預設波動率 1
    });
  }

  updatePrices(): StockPriceUpdate[] {
    const updates: StockPriceUpdate[] = [];

    this.prices.forEach((prevPrice, ticker) => {
      const volatility = this.volatilityMap.get(ticker) ?? 1;
      const newPrice = generatePrice(prevPrice, volatility);
      this.prices.set(ticker, newPrice);

      const update: StockPriceUpdate = {
        ticker,
        timestamp: Date.now(),
        price: newPrice.toFixed(2),
      };

      updates.push(update);
      this.history.push(update);
    });

    // 保留最多 5000 筆歷史資料
    if (this.history.length > MAX_HISTORY) {
      this.history.splice(0, this.history.length - MAX_HISTORY);
    }

    return updates;
  }
  
  /**
   * ✅ 根據 timestamp 提供補發資料
   * @param timestamp - 客戶端最後接收時間（毫秒）
   * @returns 補發的 StockPriceUpdate 陣列（時間遞增）
   */
  getUpdatesSince(timestamp: number, ticker?: string): StockPriceUpdate[] {
    const now = Date.now();
    if (!Number.isFinite(timestamp) || timestamp <= 0 || timestamp > now) {
      console.warn('[StockManager] Invalid timestamp for resync:', timestamp);
      return [];
    }

    const filtered = this.history.filter((d) => d.timestamp > timestamp && (!ticker || d.ticker === ticker));

    // ✅ 確保時間遞增順序 & 限制最多 MAX_RESYNC_RETURN 筆
    return filtered
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-MAX_RESYNC_RETURN);
  }
}
