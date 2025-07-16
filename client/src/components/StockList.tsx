import React from 'react';
import type { StockPriceUpdate } from '../types';

interface StockListProps {
  stockData: Record<string, StockPriceUpdate>;
  previousData: Record<string, StockPriceUpdate>;
  selectedTicker: string | null;
}

export const StockList: React.FC<StockListProps> = ({ stockData, previousData, selectedTicker }) => {
  if (!selectedTicker || !stockData[selectedTicker]) {
    return <div className="text-gray-600 mt-4">尚無資料可顯示</div>;
  }

  const data = stockData[selectedTicker];
  const prev = previousData[selectedTicker] ?? data;

  const currentPrice = parseFloat(data.price);
  const prevPrice = parseFloat(prev.price);

  const change = currentPrice - prevPrice;
  const percentChange = prevPrice === 0 ? 0 : (change / prevPrice) * 100;
  const changeText = `${change > 0 ? '+' : ''}${change.toFixed(2)} (${percentChange.toFixed(2)}%)`;

  const changeClass =
    change > 0
      ? 'text-green-600'
      : change < 0
      ? 'text-red-600'
      : 'text-gray-500';

  return (
    <div className="p-4 bg-white rounded shadow-md mt-4">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="py-2">Ticker</th>
            <th className="py-2">Price</th>
            <th className="py-2">Change</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t text-sm">
            <td className="py-2">{selectedTicker}</td>
            <td className="py-2">{currentPrice.toFixed(2)}</td>
            <td className={`py-2 ${changeClass}`}>{changeText}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
