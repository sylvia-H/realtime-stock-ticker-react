import { StockPriceUpdate } from './types';
import { generatePrice } from './price-generator';

// StockManager 主要負責管理多支股票的即時價格狀態，模擬價格波動
// 並提供最新的價格資料給 WebSocket Server 做推播

export class StockManager {
  /**
   * 選用 Map 來管理價格與波動率的原因
   * 1. Map 針對動態新增與查找優化，在大規模資料時通常表現較物件穩定
   * 2. Map 保持元素插入的順序（雖然 Object 非整數字串鍵的插入順序是被保留的，整數字串鍵則會被排序）
   * 3. Map 提供 .set(), .get(), .has() 等明確方法，使用上較直覺，且避免物件原型鏈帶來的潛在問題
   */
  private prices: Map<string, number> = new Map();
  private volatilityMap: Map<string, number> = new Map();

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

      updates.push({
        ticker,
        timestamp: Date.now(),
        price: newPrice.toFixed(2),
      });
    });

    return updates;
  }
}
