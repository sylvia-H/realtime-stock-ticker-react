// src/components/WebSocketProvider.tsx
import React, { useEffect, useState, type ReactNode } from 'react';
import type { ServerMessage, StockPriceUpdate } from '../types';
import { StocksContext, type StocksContextValue } from '../contexts/StocksContext';

interface StocksProviderProps {
  children: ReactNode;
}

export const StocksProvider: React.FC<StocksProviderProps> = ({ children }) => {
  const [stockData, setStockData] = useState<Record<string, StockPriceUpdate>>({});
  const [previousData, setPreviousData] = useState<Record<string, StockPriceUpdate>>({});

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');

    ws.onmessage = (event) => {
      const msg: ServerMessage = JSON.parse(event.data);
      if (msg.type === 'price-update') {
        // prev 是更新前的 stockData
        setStockData((prev) => {
          const prevEntry = prev[msg.data.ticker];

          // 👉 將當下資料寫入 previousData
          if (prevEntry) {
            setPreviousData((oldPrev) => ({
              ...oldPrev,
              [msg.data.ticker]: { ...prevEntry }, // 確保是快照
            }));
          }

          return {
            ...prev,
            [msg.data.ticker]: msg.data,
          };
        });
      }
    };

    return () => ws.close();
  }, []);

  const value: StocksContextValue = { stockData, previousData };

  return (
    <StocksContext.Provider value={value}>
      {children}
    </StocksContext.Provider>
  );
};
