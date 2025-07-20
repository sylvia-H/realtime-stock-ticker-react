// src/components/StockInfo.tsx
import React from 'react';
import { useStocks } from '../hooks/useStocks';
import { format } from 'date-fns';
import { transformToCandlestick } from '../utils/candlestickTransformer';
import type { StockPriceUpdate } from '../types';

interface StockInfoProps {
  stockHistory: Record<string, StockPriceUpdate[]>;
  selectedTicker: string;
}

export const StockInfo: React.FC<StockInfoProps> = ({ stockHistory, selectedTicker }) => {
  const { stockData, connectionStatus } = useStocks();

  const current = stockData[selectedTicker];
  let connectionColor = '';
  let connectionText = '';

  switch (connectionStatus) {
    case 'connecting':
      connectionColor = 'text-yellow-600';
      connectionText = '🔄 連線中...';
      break;
    case 'reconnecting':
      connectionColor = 'text-yellow-500';
      connectionText = '🟠 重新連線中...';
      break;
    case 'connected':
      connectionColor = 'text-green-600';
      connectionText = '🟢 已連線';
      break;
    case 'disconnected':
      connectionColor = 'text-red-600';
      connectionText = '🔴 已斷線';
      break;
  }

  if (!current) return null;

  const currentPrice = parseFloat(current.price);
  const history = stockHistory[selectedTicker] ?? [];
  const candles = transformToCandlestick(history, 10);

  let currentCandleClose = 0;
  let prevCandleClose = 0;
  if (candles.length > 0) {
    currentCandleClose = candles[candles.length - 1].c;
    prevCandleClose = candles.length > 1 ? candles[candles.length - 2].c : currentCandleClose;
  }
  const change = currentCandleClose - prevCandleClose;
  const percentChange = prevCandleClose === 0 ? 0 : (change / prevCandleClose) * 100;

  const changeColor = change > 0 ? 'text-green-600' : 'text-red-600';

  const lastUpdate = current.timestamp
    ? format(new Date(current.timestamp), 'yyyy-MM-dd HH:mm:ss')
    : '無資料';
  
  return (
    <div className="flex items-center justify-between bg-white border rounded px-4 py-3 mb-4 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white">
      <div className="text-xs md:text-sm lg:text-base">
        股票代號：<span className="font-bold text-blue-600">{selectedTicker}</span>
      </div>
      <div className="text-xs md:text-sm lg:text-base">
        現價：
        <span className="font-bold">
          {currentPrice.toFixed(2)} 
        </span>
      </div>
      <div className="text-xs md:text-sm lg:text-base">
        漲跌幅：
        <span className={`ml-2 ${changeColor}`}>
          {`${change >= 0 ? '+' : ''}${change.toFixed(2)} (${percentChange.toFixed(2)}%)`}
        </span>
      </div>
      <div className="text-xs md:text-sm lg:text-base">
        <span className="text-gray-600 dark:text-white">更新時間：</span>
        <span className="text-gray-800 dark:text-gray-400">{lastUpdate}</span>
      </div>
      <div className={`text-xs md:text-sm lg:text-base ${connectionColor}`}>{connectionText}</div>
    </div>
  );
};
