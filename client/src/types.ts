// 股票資料推送格式
export interface StockPriceUpdate {
  ticker: string;          // 股票代號，如 "AAPL"
  timestamp: number;       // Unix 毫秒時間戳
  price: string;           // 價格字串，保留兩位小數
}

// 伺服器發送給客戶端的訊息型態（可擴展）
export type ServerMessage =
  | { type: 'welcome'; message: string }
  | { type: 'price-update'; data: StockPriceUpdate }
  | { type: 'resync'; data: StockPriceUpdate[] };
