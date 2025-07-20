// src/App.tsx
import React, { useEffect, useState } from 'react';
import { StocksProvider } from './components/WebSocketProvider';
import { useStocks } from './hooks/useStocks';
import type { StockPriceUpdate } from './types';
import { StockChart } from './components/StockChart';
import { StockInfo } from './components/StockInfo';
import DevTools from './components/DevTools';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div>資料不足，圖表載入出錯，請稍後再試。</div>;
    }
    return this.props.children;
  }
}

interface ContentProps {
  stockHistory: Record<string, StockPriceUpdate[]>;
  setStockHistory: React.Dispatch<React.SetStateAction<Record<string, StockPriceUpdate[]>>>;
}

const Content: React.FC<ContentProps> = ({ stockHistory, setStockHistory }) => {
  const { stockData } = useStocks();
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  // 預設主題為 dark mode
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const tickers = Object.keys(stockData);

  useEffect(() => {
    if (!selectedTicker && tickers.length > 0) {
      setSelectedTicker(tickers[0]);
    }
  }, [tickers, selectedTicker]);

  useEffect(() => {
    const groupSize = 5;
    const maxCandles = 30;
    const maxTicks = groupSize * maxCandles;

    setStockHistory((prev) => {
      const updated = { ...prev };

      Object.entries(stockData).forEach(([ticker, data]) => {
        const existing = updated[ticker] ?? [];
        // 🔒 如果這一筆資料的 timestamp 跟上一筆一樣，就不重複加入
        const last = existing[existing.length - 1];
        if (last && last.timestamp === data.timestamp) return;

        const history = [...existing, data];

        // 👉 一次移除 groupSize 筆（避免滑動起點錯位）
        while (history.length > maxTicks) {
          history.splice(0, groupSize);
        }

        updated[ticker] = history;
      });
      return updated;
    });
  }, [stockData, setStockHistory]);

  return (
    <div className="w-full min-h-dvh flex items-center justify-center bg-white dark:bg-black">
      <div className="w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg px-4 my-4 md:my-8">
        {/* Toggle Button */}
        <div className="flex justify-end mb-2">
          <button
            className="px-3 py-1 rounded border font-semibold bg-gray-100 dark:bg-gray-800 dark:text-white"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? '🌙 暗色模式' : '☀️ 亮色模式'}
          </button>
        </div>
        <h1 className="text-base md:text-2xl font-bold text-center mb-4 dark:text-white">即時多股票價格走勢</h1>

        <div className="mb-[24px] md:mb-[8px] flex flex-col md:flex-row items-start md:items-center dark:text-white">
          <label className="mr-2 font-semibold mb-2 md:mb-0">選擇股票：</label>
          <select
            value={selectedTicker ?? ''}
            onChange={(e) => setSelectedTicker(e.target.value)}
            className="border px-2 py-1 w-full md:w-auto bg-white dark:bg-black dark:text-white"
          >
            {tickers.map((ticker) => (
              <option key={ticker} value={ticker}>
                {ticker}
              </option>
            ))}
          </select>
        </div>

        {/* Dashboard 總覽欄 */}
        <StockInfo selectedTicker={selectedTicker ?? 'AAPL'} />

        <div className="w-full overflow-x-auto">
          <StockChart stockHistory={stockHistory} selectedTicker={selectedTicker} />
        </div>

      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [stockHistory, setStockHistory] = useState<Record<string, StockPriceUpdate[]>>({});

  const handleResync = (updates: StockPriceUpdate[]) => {
    setStockHistory((prev) => {
      const updated = { ...prev };
      updates.forEach((data) => {
        const ticker = data.ticker;
        const existing = updated[ticker] ?? [];
        if (!existing.find((d) => d.timestamp === data.timestamp)) {
          updated[ticker] = [...existing, data];
        }
        console.log(`[Resync] ${ticker} - Added update at ${data.timestamp}:`, data.price);
      });
      return updated;
    });
  };

  return (
    <StocksProvider onResync={handleResync}>
      <ErrorBoundary>
        {import.meta.env.DEV && <DevTools />}
        <Content stockHistory={stockHistory} setStockHistory={setStockHistory} />
      </ErrorBoundary>
    </StocksProvider>
  );
};

export default App;
