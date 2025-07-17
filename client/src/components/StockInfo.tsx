// src/components/StockInfo.tsx
import React from 'react';
import { useStocks } from '../hooks/useStocks';
import { format } from 'date-fns';

interface StockInfoProps {
  selectedTicker: string;
}

export const StockInfo: React.FC<StockInfoProps> = ({ selectedTicker }) => {
  const { stockData, previousData, connectionStatus } = useStocks();

  const current = stockData[selectedTicker];
  const previous = previousData[selectedTicker];
  const isUp = current && previous && parseFloat(current.price) > parseFloat(previous.price);

  const changeColor = isUp ? 'text-green-600' : 'text-red-600';
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
  const prevPrice = previous ? parseFloat(previous.price) : currentPrice;
  const change = currentPrice - prevPrice;
  const percentChange = prevPrice === 0 ? 0 : (change / prevPrice) * 100;

  const lastUpdate = current.timestamp
    ? format(new Date(current.timestamp), 'yyyy-MM-dd HH:mm:ss')
    : '無資料';
  
  return (
    <div className="flex items-center justify-between bg-white border rounded px-4 py-3 mb-4 shadow-sm">
      <div className="text-sm font-medium">
        股票代號：<span className="font-bold text-blue-600">{selectedTicker}</span>
      </div>
      <div className="text-sm">
        現價：
        <span className="font-bold">
          {currentPrice.toFixed(2)} 
        </span>
      </div>
      <div className="text-sm">
        漲跌幅：
        <span className={`ml-2 font-semibold ${changeColor}`}>
          {`${change >= 0 ? '+' : ''}${change.toFixed(2)} (${percentChange.toFixed(2)}%)`}
        </span>
      </div>
      <div>
        <span className="font-medium text-gray-600">更新時間：</span>
        <span className="text-gray-800">{lastUpdate}</span>
      </div>
      <div className={`text-sm font-medium ${connectionColor}`}>{connectionText}</div>
    </div>
  );
};
