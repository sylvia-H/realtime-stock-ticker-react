// src/contexts/StocksContext.ts
import { createContext } from 'react';
import type { StockPriceUpdate } from '../types';

// stockData：目前最新價格
// previousData：每支股票的前一筆資料（由 WebSocketProvider 管理）
// ConnectionStatus：連線狀態

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';
export interface StocksContextValue {
  stockData: Record<string, StockPriceUpdate>;
  previousData: Record<string, StockPriceUpdate>;
  connectionStatus: ConnectionStatus;
}

export const StocksContext = createContext<StocksContextValue | undefined>(undefined);
