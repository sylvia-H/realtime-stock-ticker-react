# 📈 Real-Time Stock Ticker

即時多股票走勢圖表 Demo，支援高頻推播、斷線重連、資料補發、技術指標計算與前端效能監控。

---

## 🚀 專案概覽

本專案是一個全端 TypeScript 實作的「多股票即時走勢」系統，模擬真實行情推播場景。前端以 React + Vite + Tailwind 打造，後端以 Node.js + ws WebSocket Server 實現，支援多檔股票高頻推播、斷線自動重連、資料補發、K 線圖與技術指標（SMA/EMA/High-Low）即時計算，並內建 FPS 效能監控。

---

## 🛠 技術棧

- **前端**：
  - React 18 (TypeScript)
  - Vite
  - Tailwind CSS
  - Chart.js + chartjs-chart-financial
  - stats.js (FPS 效能監控)
- **後端**：
  - Node.js (TypeScript)
  - ws (WebSocket Server)

---

## 📦 專案結構

```plaintext
server/
  ├── package.json
  ├── tsconfig.json
  └── src/
      ├── index.ts
      ├── price-generator.ts
      ├── stock-manager.ts
      ├── types.ts
      ├── generator/
      │   └── stockSimulator.ts
      └── utils/
          ├── indicators.ts
          └── priceHistory.ts
client/
  ├── package.json
  ├── tsconfig.json
  ├── vite.config.ts
  ├── tailwind.config.js
  ├── postcss.config.js
  ├── index.html
  └── src/
      ├── App.tsx
      ├── main.tsx
      ├── types.ts
      ├── vite-env.d.ts
      ├── index.css
      ├── App.css
      ├── hooks/
      │   ├── useIndicators.ts
      │   └── useStocks.ts
      ├── components/
      │   ├── StockChart.tsx
      │   ├── StockInfo.tsx
      │   ├── WebSocketProvider.tsx
      │   ├── PerformanceStats.tsx
      │   ├── DevTools.tsx
      │   └── ...
      ├── contexts/
      │   └── StocksContext.ts
      └── utils/
          ├── calculateIndicators.ts
          ├── candlestickTransformer.ts
          └── ...
```

---

## ⚡️ 專案亮點

- **高頻多股票推播**：模擬 10~50 檔股票，每檔每秒多筆 tick，真實還原行情負載。
- **斷線自動重連與補發**：前端自動偵測斷線，重連時自動補發斷線期間所有遺漏 tick，圖表不中斷。
- **K 線圖與技術指標**：每 5 筆 tick 聚合為一根 K 棒，並即時計算 SMA、EMA、High-Low 等指標。
- **效能優化**：指標計算採 requestIdleCallback 分批排程，前端資料僅保留 100 筆，避免記憶體爆炸。
- **React 高效渲染**：useMemo、React.memo、useCallback 全面優化，推播不會導致整體 re-render。
- **即時效能監控**：內建 stats.js FPS 面板，方便觀察前端效能瓶頸。
- **TypeScript 全端型別安全**：前後端共用型別，維護性高。
- **可擴充性佳**：指標計算、推播模組皆可獨立擴充。

---

## 🧑‍💻 技術細節

### 1. 多股票高頻推播
- 後端 `stockSimulator.ts` 以 setInterval 模擬多檔股票隨機價格，每秒推播多筆 tick。
- 每筆 tick 皆帶有 symbol、price、timestamp，並以 WebSocket 廣播。

### 2. 斷線重連與補發
- 前端 `WebSocketProvider.tsx` 監控連線狀態，斷線自動重連。
- 重連時自動帶上最後一筆 timestamp，server 依此補發所有遺漏 tick，確保圖表連續。
- 前端合併補發資料時自動去重，避免重複 candle。

### 3. K 線圖與技術指標
- `StockChart.tsx` 以 chartjs-chart-financial 呈現 K 線圖，每 5 筆 tick 聚合一根 K 棒。
- useIndicators.ts 以滑動視窗方式，僅保留 100 筆價格，並即時計算 SMA/EMA/High-Low。
- 指標計算採 requestIdleCallback 或 setTimeout 分批排程，不卡主執行緒。

### 4. React 效能優化
- useMemo 快取 K 線資料與 ChartData，避免不必要重算。
- React.memo 記憶化圖表元件，推播不會導致整體 re-render。
- useCallback 封裝更新函式，避免函式重建。

### 5. 效能監控
- `PerformanceStats.tsx` 內建 stats.js，於畫面角落顯示 FPS，方便即時觀察效能。
- 可搭配 Chrome DevTools > Performance tab 進行更細緻分析。

---

## 🛠 安裝與啟動

1. **安裝依賴**
   ```bash
   # 安裝前後端依賴
   cd client && yarn install
   cd ../server && yarn install
   cd ..
   ```
2. **啟動專案**
   ```bash
   # 建議於專案根目錄
   yarn dev
   # 或分開啟動
   yarn --cwd server dev
   yarn --cwd client dev
   ```
3. **瀏覽前端**
   - 開啟 http://localhost:5173
   - 預設 WebSocket 連線至 ws://localhost:3001

---

## 📝 進階玩法

- **自訂推播股票數量與頻率**：可於 server/generator/stockSimulator.ts 調整 symbols 與推播頻率。
- **擴充技術指標**：於 server/utils/indicators.ts、client/utils/calculateIndicators.ts 增加新指標。
- **效能壓力測試**：可同時開啟多個瀏覽器分頁觀察 FPS 與記憶體負載。
- **斷線測試**：手動關閉 server 或拔網路，觀察自動重連與資料補發效果。
